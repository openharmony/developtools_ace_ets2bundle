/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as ts from 'typescript';
import fs from 'fs';
import path from 'path';
import { logger } from './compile_info';
import { harFilesRecord, GeneratedFileInHar, toUnixPath } from './utils';
import { compilerOptions, resolveModuleNames as resolveModuleNamesOrig } from './ets_checker';
import { projectConfig } from '../main';
import {
  escapeRegExp, splitLeadingTrivia, isExternalModuleSpecifier, isNameReferencedInText,
  findNamesMatchingPattern, applyRenamesWithPlaceholders, sortImportLinesFirst,
  isTypeParameterSymbol, isEnumMemberSymbol, isRightOfMatchingQualifiedName,
  getLocalNameOfDeclaration, getDeclarationNode, withNamespaceMemberModifiers,
  transformToExportDeclare, ensureDeclareKeyword, stripExportFromText,
  sanitizeDeclarationNode, validateOutput
} from './declaration_merger_utils';
import {
  resolveToActualDeclaration, isSystemApiDeclaration,
  findLocalImportForExport, findImportInModule, findReexportForSymbol,
  searchImportInSourceFile, SysApiContext
} from './declaration_merger_sysapi';


function resolveWithFallback(
  moduleName: string,
  sourceContainingFile: string | null,
  resolved: ts.ResolvedModuleFull | null
): ts.ResolvedModuleFull | null {
  if (resolved) {
    return resolved;
  }
  if (!sourceContainingFile) {
    return null;
  }
  const fallback: (ts.ResolvedModuleFull | null)[] =
    resolveModuleNamesOrig([moduleName], sourceContainingFile);
  return fallback[0] ?? null;
}

function buildBidirectionalMaps(): {
  sourceToDecl: Map<string, string>;
  declToSource: Map<string, string>;
} {
  const sourceToDecl: Map<string, string> = new Map();
  const declToSource: Map<string, string> = new Map();
  harFilesRecord.forEach((value: GeneratedFileInHar): void => {
    if (value.originalDeclarationCachePath) {
      sourceToDecl.set(toUnixPath(value.sourcePath), toUnixPath(value.originalDeclarationCachePath));
      declToSource.set(toUnixPath(value.originalDeclarationCachePath), toUnixPath(value.sourcePath));
    }
  });
  return { sourceToDecl, declToSource };
}

function createDeclarationModuleResolver(
  projectPath: string
): (moduleNames: string[], containingFile: string) => (ts.ResolvedModuleFull | null)[] {
  const { sourceToDecl, declToSource } = buildBidirectionalMaps();

  return (
    moduleNames: string[],
    containingFile: string
  ): (ts.ResolvedModuleFull | null)[] => {
    const resolved: (ts.ResolvedModuleFull | null)[] =
      resolveModuleNamesOrig(moduleNames, containingFile);
    const sourceContainingFile: string | null =
      declToSource.get(toUnixPath(containingFile)) ?? null;

    for (let i = 0; i < resolved.length; i++) {
      resolved[i] = resolveWithFallback(moduleNames[i], sourceContainingFile, resolved[i]);
    }

    for (let i = 0; i < resolved.length; i++) {
      const mod = resolved[i];
      if (!mod?.resolvedFileName) {
        continue;
      }
      const declPath: string | undefined = sourceToDecl.get(toUnixPath(mod.resolvedFileName));
      if (declPath) {
        resolved[i] = {
          resolvedFileName: declPath,
          extension: declPath.endsWith('.d.ets') ? ts.Extension.Dets : ts.Extension.Dts,
        };
      }
    }
    return resolved;
  };
}

enum EntityKind {
  Exported,
  TypeDependency,
  SystemApiImport,
  SystemApiReexport,
}

type SourceFileExt = '.d.ets' | '.d.ts';

interface MergeEntity {
  kind: EntityKind;
  symbol: ts.Symbol;
  declarations: ts.Declaration[];
  emitName: string;
  exportNames: string[];
  isDefaultExport: boolean;
  systemApiInfo?: { moduleName: string; name: string; statementText: string; exportStatementText?: string };
  isolationNamespace?: string;
  preferredName: string;
  sourceFileExt: SourceFileExt;
  aliases: string[];
  usageExts?: SourceFileExt[];
}

interface NamespaceEmitItem {
  symbol: ts.Symbol;
  declarations: ts.Declaration[];
  emitName: string;
  aliases: string[];
}

interface NamespaceBlockMember extends NamespaceEmitItem {
  sourceFileExt: SourceFileExt;
}

interface NamespaceSystemApiMember {
  name: string;
  importStatement: string;
}

interface NamespaceBlock {
  name: string;
  members: NamespaceBlockMember[];
  sourceFileExt: SourceFileExt;
  systemApiMembers: NamespaceSystemApiMember[];
}

interface EmitContext {
  primaryLines: string[];
  companionLines: string[];
  emittedStatements: Set<string>;
  companionEmittedStatements: Set<string>;
  primaryEmittedTexts: Set<string>;
  companionEmittedTexts: Set<string>;
  crossExtExportedNames: string[];
  crossExtImportNamespaces: Set<string>;
  crossExtImportNames: string[];
  crossExtNamespaceImports: Set<string>;
  exportRenames: Array<{ emitName: string; exportName: string }>;
  primaryExt: SourceFileExt;
  companionModuleSpecifier: string;
}

export interface DeclarationMergeOptions {
  entryFile?: string;
  entryFiles?: string[];
  projectPath: string;
  isByteCodeHar: boolean;
  moduleRootPath?: string;
  packageDir?: string;
  systemModules?: string[];
  sdkPath?: string;
  resolveModuleNames?: (
    moduleNames: string[],
    containingFile: string
  ) => (ts.ResolvedModuleFull | null)[];
}

export class DeclarationMerger {
  private options: DeclarationMergeOptions;
  private program: ts.Program;
  private checker: ts.TypeChecker;
  private entrySourceFile: ts.SourceFile | undefined;
  private printer: ts.Printer;

  private exportedEntities: MergeEntity[] = [];
  private typeDepEntities: MergeEntity[] = [];
  private systemApiEntities: MergeEntity[] = [];
  private namespaceBlocks: NamespaceBlock[] = [];

  private exportedEntityMap: Map<ts.Symbol, MergeEntity> = new Map();
  private typeDepEntityMap: Map<ts.Symbol, MergeEntity> = new Map();
  private systemApiEntityMap: Map<ts.Symbol, Map<string, MergeEntity>> = new Map();

  private entryExportSymbols: Set<ts.Symbol> = new Set();
  private collectedContainerSymbols: Set<ts.Symbol> = new Set();
  private renameMap: Map<ts.Symbol, string> = new Map();
  private entryExt: SourceFileExt = '.d.ets';
  private entryFilePath: string = '';
  private currentUsageExt: SourceFileExt = '.d.ets';
  private sysApiCtx: SysApiContext;

  private static readonly MAX_TYPE_DEPTH: number = 50;

  private static getCompanionFileName(entryFileName: string, companionExt: SourceFileExt): string {
    const baseName: string = path.basename(entryFileName).replace(/\.d\.(ts|ets)$/, '');
    return `${baseName}-declarations${companionExt}`;
  }

  private getCompanionFilePath(entryFile: string): string {
    const companionExt: SourceFileExt = entryFile.endsWith('.d.ets') ? '.d.ts' : '.d.ets';
    const companionName: string = DeclarationMerger.getCompanionFileName(entryFile, companionExt);
    return path.join(path.dirname(entryFile), companionName);
  }

  private constructor(options: DeclarationMergeOptions, rootFiles: string[]) {
    this.options = options;
    this.program = this.createDeclarationProgram(rootFiles);
    this.checker = this.program.getTypeChecker();
    this.printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    this.sysApiCtx = {
      checker: this.checker, printer: this.printer,
      entrySourceFile: undefined, systemModules: options.systemModules
    };
  }

  public static mergeDeclarationFiles(options: DeclarationMergeOptions): void {
    const rootFiles: string[] = options.entryFiles ?? (options.entryFile ? [options.entryFile] : []);
    if (rootFiles.length === 0) {
      return;
    }
    const merger = new DeclarationMerger(options, rootFiles);
    for (const entryFile of rootFiles) {
      merger.mergeEntry(entryFile);
    }
    merger.cleanup(rootFiles);
  }

  private resetState(): void {
    this.exportedEntities = [];
    this.typeDepEntities = [];
    this.systemApiEntities = [];
    this.namespaceBlocks = [];
    this.exportedEntityMap.clear();
    this.typeDepEntityMap.clear();
    this.systemApiEntityMap.clear();
    this.entryExportSymbols.clear();
    this.collectedContainerSymbols.clear();
    this.renameMap.clear();
  }

  private mergeEntry(entryFile: string): void {
    this.resetState();
    this.entrySourceFile = this.program.getSourceFile(entryFile);
    this.sysApiCtx.entrySourceFile = this.entrySourceFile;
    if (!this.entrySourceFile) {
      logger.debug(`Declaration entry file not found in program: ${entryFile}`);
      return;
    }
    this.entryExt = entryFile.endsWith('.d.ets') ? '.d.ets' : '.d.ts';
    this.entryFilePath = entryFile;

    this.collectExports();
    this.collectTypeDependencies();
    this.resolveNames();
    const { primary, companion } = this.emit();
    validateOutput(primary, entryFile);

    harFilesRecord.forEach((value: GeneratedFileInHar): void => {
      if (value.originalDeclarationCachePath === entryFile) {
        value.originalDeclarationContent = primary;
      }
    });
    if (companion) {
      const companionPath: string = toUnixPath(this.getCompanionFilePath(entryFile));
      const existing: GeneratedFileInHar | undefined = harFilesRecord.get(companionPath);
      if (existing) {
        existing.originalDeclarationContent = companion;
      } else {
        harFilesRecord.set(companionPath, {
          sourcePath: companionPath,
          originalDeclarationCachePath: companionPath,
          originalDeclarationContent: companion,
        });
      }
      fs.writeFileSync(this.getCompanionFilePath(entryFile), companion);
    }
    if (!this.options.isByteCodeHar) {
      fs.writeFileSync(entryFile, primary);
    }
  }

  private createDeclarationProgram(rootFiles: string[]): ts.Program {
    const declOptions: ts.CompilerOptions = {
      ...compilerOptions,
      noEmit: true,
      skipLibCheck: true,
      skipDefaultLibCheck: true,
      types: undefined,
      lib: undefined,
      incremental: false,
      tsBuildInfoFile: undefined,
    };

    const host = ts.createCompilerHost(declOptions);
    host.writeFile = (): void => { };
    host.resolveModuleNames = this.options.resolveModuleNames ??
      createDeclarationModuleResolver(this.options.projectPath);
    host.getCurrentDirectory = (): string => process.cwd();
    host.getDefaultLibFileName = (options: ts.CompilerOptions): string => {
      return ts.getDefaultLibFilePath(options);
    };

    return ts.createProgram(rootFiles, declOptions, host);
  }

  // ─── Phase 2: Collect Exports ───

  private collectExports(): void {
    const entrySymbol: ts.Symbol | undefined = this.checker.getSymbolAtLocation(this.entrySourceFile!);
    if (!entrySymbol) {
      return;
    }
    const hasExplicitDefault: boolean = this.entryFileHasExplicitDefaultExport();
    for (const exportSymbol of this.checker.getExportsOfModule(entrySymbol)) {
      if (exportSymbol.name === 'default' && !hasExplicitDefault) {
        continue;
      }
      const resolved: ts.Symbol | null = resolveToActualDeclaration(this.checker, exportSymbol);
      if (!resolved || resolved.declarations.length === 0) {
        continue;
      }
      const firstDecl: ts.Declaration = resolved.declarations[0];
      const exportedName: string = exportSymbol.name;
      const isDefault: boolean = exportedName === 'default';
      if (this.tryCollectNamespaceExport(resolved, firstDecl, exportedName)) {
        continue;
      }
      if (this.isDefaultLibraryDeclaration(firstDecl)) {
        continue;
      }
      if (this.tryCollectSystemApiExport(resolved, firstDecl, exportedName, exportSymbol)) {
        continue;
      }
      this.addExportedEntity(resolved, exportedName, isDefault);
      this.entryExportSymbols.add(resolved);
    }
    this.collectStarExportMembers();
  }

  private tryCollectNamespaceExport(
    resolved: ts.Symbol, firstDecl: ts.Declaration, exportedName: string
  ): boolean {
    if (!ts.isSourceFile(firstDecl)) {
      return false;
    }
    const { members, systemApiMembers } = this.collectNamespaceMembers(resolved);
    if (members.length > 0 || systemApiMembers.length > 0) {
      const hasPrimary: boolean =
        members.some((m: NamespaceBlockMember): boolean => m.sourceFileExt === this.entryExt);
      const blockExt: SourceFileExt = members.length > 0
        ? (hasPrimary ? this.entryExt : members[0].sourceFileExt) : this.entryExt;
      this.namespaceBlocks.push({ name: exportedName, members, sourceFileExt: blockExt, systemApiMembers });
    }
    return true;
  }

  private tryCollectSystemApiExport(
    resolved: ts.Symbol, firstDecl: ts.Declaration,
    exportedName: string, exportSymbol: ts.Symbol
  ): boolean {
    if (this.isInSdkPath(firstDecl.getSourceFile().fileName)) {
      const localImport = this.findSystemApiImport(exportedName, resolved, exportSymbol);
      if (localImport && isExternalModuleSpecifier(localImport.moduleName)) {
        this.addSystemApiEntity(resolved, firstDecl, exportedName, {
          moduleName: localImport.moduleName, name: exportedName,
          statementText: localImport.statementText,
          exportStatementText: `export { ${exportedName} };`,
        }, exportSymbol, false, this.entryExt);
        this.entryExportSymbols.add(resolved);
        return true;
      }
    }
    const sysApiDecl = isSystemApiDeclaration(this.sysApiCtx, firstDecl, exportSymbol);
    if (sysApiDecl) {
      this.addSystemApiEntity(resolved, firstDecl, exportedName, sysApiDecl, exportSymbol, false, this.entryExt);
      this.entryExportSymbols.add(resolved);
      return true;
    }
    return false;
  }

  private findSystemApiImport(
    exportedName: string, resolved: ts.Symbol, exportSymbol: ts.Symbol
  ): { moduleName: string; statementText: string } | null {
    const localImport = findLocalImportForExport(this.sysApiCtx, exportedName, resolved);
    if (localImport) {
      return localImport;
    }
    let aliasCurrent: ts.Symbol | undefined = exportSymbol;
    const aliasVisited: Set<ts.Symbol> = new Set();
    while (aliasCurrent && (aliasCurrent.flags & ts.SymbolFlags.Alias) && !aliasVisited.has(aliasCurrent)) {
      aliasVisited.add(aliasCurrent);
      for (const aliasDecl of aliasCurrent.declarations ?? []) {
        const aliasFile: ts.SourceFile = aliasDecl.getSourceFile();
        if (aliasFile === this.entrySourceFile) {
          continue;
        }
        const found = searchImportInSourceFile(this.sysApiCtx, aliasFile, exportedName, resolved);
        if (found) {
          return found;
        }
      }
      aliasCurrent = this.checker.getAliasedSymbol(aliasCurrent);
    }
    return null;
  }

  private collectNamespaceMembers(moduleSymbol: ts.Symbol): {
    members: NamespaceBlockMember[];
    systemApiMembers: NamespaceSystemApiMember[]
  } {
    const moduleExports: ts.Symbol[] = this.checker.getExportsOfModule(moduleSymbol);
    const members: NamespaceBlockMember[] = [];
    const systemApiMembers: NamespaceSystemApiMember[] = [];
    if (moduleExports.length === 0) {
      return { members, systemApiMembers };
    }
    for (const memberSymbol of moduleExports) {
      if (memberSymbol.name === 'default') {
        continue;
      }
      const resolvedMember: ts.Symbol | null = resolveToActualDeclaration(this.checker, memberSymbol);
      if (!resolvedMember || !resolvedMember.declarations || resolvedMember.declarations.length === 0) {
        continue;
      }
      const memberDecl: ts.Declaration = resolvedMember.declarations[0];
      if (ts.isSourceFile(memberDecl)) {
        continue;
      }
      if (this.tryCollectNamespaceSysApiMember(
        memberSymbol, resolvedMember, memberDecl, moduleSymbol, systemApiMembers
      )) {
        continue;
      }
      this.addOrCreateNamespaceMember(memberSymbol, resolvedMember, memberDecl, members);
    }
    return { members, systemApiMembers };
  }

  private tryCollectNamespaceSysApiMember(
    memberSymbol: ts.Symbol, resolvedMember: ts.Symbol, memberDecl: ts.Declaration,
    moduleSymbol: ts.Symbol, systemApiMembers: NamespaceSystemApiMember[]
  ): boolean {
    if (this.isInSdkPath(memberDecl.getSourceFile().fileName)) {
      const importInfo = findImportInModule(this.sysApiCtx, moduleSymbol, memberSymbol.name, resolvedMember);
      if (importInfo && isExternalModuleSpecifier(importInfo.moduleName)) {
        systemApiMembers.push({ name: memberSymbol.name, importStatement: importInfo.statementText });
        return true;
      }
      const reexportImport: string | null = findReexportForSymbol(this.printer, memberSymbol);
      if (reexportImport) {
        systemApiMembers.push({ name: memberSymbol.name, importStatement: reexportImport });
        return true;
      }
    }
    if (isSystemApiDeclaration(this.sysApiCtx, memberDecl, memberSymbol)) {
      return true;
    }
    return this.isDefaultLibraryDeclaration(memberDecl);
  }

  private addOrCreateNamespaceMember(
    memberSymbol: ts.Symbol, resolvedMember: ts.Symbol, memberDecl: ts.Declaration,
    members: NamespaceBlockMember[]
  ): void {
    const existing: NamespaceBlockMember | undefined = members.find(m => m.symbol === resolvedMember);
    if (existing) {
      if (memberSymbol.name !== existing.emitName) {
        existing.aliases.push(memberSymbol.name);
      }
      return;
    }
    const declName: string = getLocalNameOfDeclaration(resolvedMember.declarations[0]);
    const aliases: string[] = memberSymbol.name !== declName ? [memberSymbol.name] : [];
    members.push({
      symbol: resolvedMember,
      declarations: [...resolvedMember.declarations],
      emitName: declName,
      aliases,
      sourceFileExt: this.getSourceFileExt(memberDecl),
    });
  }

  private collectStarExportMembers(): void {
    if (!this.entrySourceFile) {
      return;
    }
    const entrySymbol: ts.Symbol | undefined =
      this.checker.getSymbolAtLocation(this.entrySourceFile);
    if (!entrySymbol) {
      return;
    }

    const exportedNames: Set<string> = new Set();
    for (const exportSymbol of this.checker.getExportsOfModule(entrySymbol)) {
      exportedNames.add(exportSymbol.name);
    }
    for (const entity of this.exportedEntities) {
      for (const name of entity.exportNames) {
        exportedNames.add(name);
      }
    }

    ts.forEachChild(this.entrySourceFile, (node: ts.Node) => {
      if (!ts.isExportDeclaration(node) || !node.moduleSpecifier) {
        return;
      }
      if (!ts.isStringLiteral(node.moduleSpecifier)) {
        return;
      }
      if (node.exportClause) {
        return;
      }

      const moduleSymbol: ts.Symbol | undefined =
        this.checker.getSymbolAtLocation(node.moduleSpecifier);
      if (!moduleSymbol) {
        return;
      }

      const moduleExports: ts.Symbol[] = this.checker.getExportsOfModule(moduleSymbol);
      for (const memberSymbol of moduleExports) {
        this.tryCollectStarExportMember(memberSymbol, exportedNames);
      }
    });
  }

  private tryCollectStarExportMember(memberSymbol: ts.Symbol, exportedNames: Set<string>): void {
    if (memberSymbol.name === 'default' || exportedNames.has(memberSymbol.name)) {
      return;
    }
    const resolved: ts.Symbol | null = resolveToActualDeclaration(this.checker, memberSymbol);
    if (!resolved || !resolved.declarations || resolved.declarations.length === 0) {
      return;
    }
    const memberDecl: ts.Declaration = resolved.declarations[0];
    if (ts.isSourceFile(memberDecl) || isSystemApiDeclaration(this.sysApiCtx, memberDecl, memberSymbol) ||
      this.isDefaultLibraryDeclaration(memberDecl) || this.exportedEntityMap.has(resolved)) {
      return;
    }
    this.addExportedEntity(resolved, memberSymbol.name, false);
    this.entryExportSymbols.add(resolved);
    exportedNames.add(memberSymbol.name);
  }

  private getSourceFileExt(declaration: ts.Declaration): SourceFileExt {
    return declaration.getSourceFile().fileName.endsWith('.d.ets') ? '.d.ets' : '.d.ts';
  }

  private addExportedEntity(
    resolved: ts.Symbol,
    exportedName: string,
    isDefault: boolean
  ): void {
    const existing: MergeEntity | undefined = this.exportedEntityMap.get(resolved);
    if (existing) {
      if (!isDefault && exportedName && !existing.exportNames.includes(exportedName)) {
        existing.exportNames.push(exportedName);
      }
      if (isDefault) {
        existing.isDefaultExport = true;
      }
      return;
    }

    const entity: MergeEntity = {
      kind: EntityKind.Exported,
      symbol: resolved,
      declarations: [...resolved.declarations],
      emitName: '',
      exportNames: isDefault ? [] : (exportedName ? [exportedName] : []),
      isDefaultExport: isDefault,
      preferredName: '',
      sourceFileExt: this.getSourceFileExt(resolved.declarations[0]),
      aliases: [],
    };
    this.exportedEntities.push(entity);
    this.exportedEntityMap.set(resolved, entity);
  }

  private addSystemApiEntity(
    resolved: ts.Symbol,
    declaration: ts.Declaration,
    exportedName: string,
    sysApiDecl: { moduleName: string; name: string; statementText: string; exportStatementText?: string },
    exportSymbol: ts.Symbol,
    isTypeDep: boolean = false,
    usageExt?: SourceFileExt
  ): void {
    const ext: SourceFileExt = usageExt ?? this.entryExt;

    let nameMap: Map<string, MergeEntity> | undefined = this.systemApiEntityMap.get(resolved);
    if (!nameMap) {
      nameMap = new Map();
      this.systemApiEntityMap.set(resolved, nameMap);
    }

    const existing: MergeEntity | undefined = nameMap.get(exportedName);
    if (existing) {
      if (existing.usageExts && !existing.usageExts.includes(ext)) {
        existing.usageExts.push(ext);
      }
      return;
    }

    const isReexport: boolean = !isTypeDep && exportedName === sysApiDecl.name;

    const entity: MergeEntity = {
      kind: isReexport ? EntityKind.SystemApiReexport : EntityKind.SystemApiImport,
      symbol: resolved,
      declarations: [declaration],
      emitName: sysApiDecl.name,
      exportNames: isReexport ? [exportedName] : [],
      isDefaultExport: false,
      systemApiInfo: sysApiDecl,
      preferredName: sysApiDecl.name,
      sourceFileExt: this.getSourceFileExt(declaration),
      aliases: [],
      usageExts: [ext],
    };
    nameMap.set(exportedName, entity);
    this.systemApiEntities.push(entity);
  }

  private entryFileHasExplicitDefaultExport(): boolean {
    if (!this.entrySourceFile) {
      return false;
    }
    let found = false;
    const check = (node: ts.Node): void => {
      if (found) {
        return;
      }
      found = this.isDefaultExportNode(node);
    };
    ts.forEachChild(this.entrySourceFile, check);
    return found;
  }

  private isDefaultExportNode(node: ts.Node): boolean {
    if (ts.isExportAssignment(node)) {
      return true;
    }
    if (ts.isExportDeclaration(node) && node.exportClause && !ts.isNamespaceExport(node.exportClause)) {
      return node.exportClause.elements.some(
        (element: ts.ExportSpecifier): boolean => element.name.text === 'default'
      );
    }
    return false;
  }

  // ─── Phase 3: Collect Type Dependencies ───

  private collectTypeDependencies(): void {
    const visited: Set<ts.Symbol> = new Set();

    for (const entity of this.exportedEntities) {
      this.registerContainerIfNeeded(entity.symbol);
    }
    for (const block of this.namespaceBlocks) {
      for (const member of block.members) {
        this.registerContainerIfNeeded(member.symbol);
      }
    }

    for (const entity of this.exportedEntities) {
      if (!visited.has(entity.symbol)) {
        visited.add(entity.symbol);
      }
      this.currentUsageExt = entity.sourceFileExt;
      for (const decl of entity.declarations) {
        this.collectTypeDepsRecursive(decl, visited, 0);
      }
    }

    for (const block of this.namespaceBlocks) {
      for (const member of block.members) {
        if (!visited.has(member.symbol)) {
          visited.add(member.symbol);
        }
        this.currentUsageExt = member.sourceFileExt;
        for (const decl of member.declarations) {
          this.collectTypeDepsRecursive(decl, visited, 0);
        }
      }
    }
  }

  private collectTypeDepsRecursive(
    declaration: ts.Declaration,
    visited: Set<ts.Symbol>,
    depth: number
  ): void {
    if (depth > DeclarationMerger.MAX_TYPE_DEPTH) {
      logger.debug(
        `Type dependency collection exceeded max depth at ${declaration.getSourceFile().fileName}`
      );
      return;
    }
    const visit = (node: ts.Node): void => {
      if (ts.isTypeReferenceNode(node)) {
        this.collectEntityNameIdentifiers(node.typeName, visited, depth);
      } else if (ts.isExpressionWithTypeArguments(node)) {
        if (ts.isIdentifier(node.expression)) {
          this.collectTypeReference(node.expression, visited, depth);
        } else if (ts.isQualifiedName(node.expression)) {
          this.collectEntityNameIdentifiers(node.expression, visited, depth);
        } else if (ts.isPropertyAccessExpression(node.expression)) {
          this.collectPropertyAccessTypeRef(node.expression, visited, depth);
        }
      } else if (ts.isTypeQueryNode(node)) {
        if (ts.isIdentifier(node.exprName)) {
          this.collectTypeReference(node.exprName, visited, depth);
        } else if (ts.isQualifiedName(node.exprName)) {
          this.collectEntityNameIdentifiers(node.exprName, visited, depth);
        }
      } else if (ts.isPropertyAccessExpression(node)) {
        this.collectEnumValueReference(node, visited, depth);
      } else if (ts.isImportTypeNode(node)) {
        this.collectImportTypeReference(node, visited, depth);
      } else if (ts.isComputedPropertyName(node)) {
        if (ts.isIdentifier(node.expression)) {
          this.collectTypeReference(node.expression, visited, depth);
        } else if (ts.isPropertyAccessExpression(node.expression) && ts.isIdentifier(node.expression.expression)) {
          this.collectTypeReference(node.expression.expression, visited, depth);
        }
      }
      ts.forEachChild(node, visit);
    };

    ts.forEachChild(declaration, visit);
  }

  private collectImportTypeReference(
    node: ts.ImportTypeNode,
    visited: Set<ts.Symbol>,
    depth: number
  ): void {
    const qualifier = node.qualifier;
    if (!qualifier || !ts.isIdentifier(qualifier)) {
      return;
    }
    const qualifierSymbol = this.checker.getSymbolAtLocation(qualifier);
    if (!qualifierSymbol) {
      return;
    }
    const resolved = resolveToActualDeclaration(this.checker, qualifierSymbol);
    if (!resolved || !resolved.declarations || resolved.declarations.length === 0) {
      return;
    }
    if (this.isDefaultLibraryDeclaration(resolved.declarations[0])) {
      return;
    }

    const firstDecl = resolved.declarations[0];

    if (ts.isTypeAliasDeclaration(firstDecl)) {
      for (const decl of resolved.declarations) {
        this.collectTypeDepsRecursive(decl, visited, depth + 1);
      }
      return;
    }

    if (this.entryExportSymbols.has(resolved)) {
      return;
    }
    if (this.typeDepEntityMap.has(resolved)) {
      return;
    }

    const sysApiDecl = isSystemApiDeclaration(this.sysApiCtx, firstDecl, qualifierSymbol);
    if (sysApiDecl) {
      this.addSystemApiEntity(resolved, firstDecl, qualifier.text, sysApiDecl, qualifierSymbol, true, this.currentUsageExt);
      return;
    }

    if (visited.has(resolved)) {
      return;
    }
    visited.add(resolved);

    if (this.isMemberOfCollectedContainer(resolved)) {
      return;
    }

    this.addTypeDepEntity(resolved, qualifier.text);
    this.registerContainerIfNeeded(resolved);
    for (const decl of resolved.declarations) {
      this.collectTypeDepsRecursive(decl, visited, depth + 1);
    }
  }

  private resolveImportTypeSymbol(node: ts.ImportTypeNode): ts.Symbol | null {
    const qualifier = node.qualifier;
    if (!qualifier) {
      return null;
    }
    const qualifierSymbol = this.checker.getSymbolAtLocation(qualifier);
    if (qualifierSymbol) {
      const resolved = resolveToActualDeclaration(this.checker, qualifierSymbol);
      if (resolved && resolved.declarations && resolved.declarations.length > 0) {
        return resolved;
      }
    }
    return null;
  }

  private collectEntityNameIdentifiers(
    name: ts.EntityName,
    visited: Set<ts.Symbol>,
    depth: number
  ): void {
    if (ts.isIdentifier(name)) {
      this.collectTypeReference(name, visited, depth);
    } else if (ts.isQualifiedName(name)) {
      this.collectEntityNameIdentifiers(name.left, visited, depth);
      const rightResult = this.tryResolveQualifiedNameMember(name);
      if (rightResult) {
        this.collectResolvedTypeReference(
          rightResult.resolved, name.right.text, visited, depth, rightResult.alias
        );
      } else {
        const leftSym = this.checker.getSymbolAtLocation(name.left);
        const resolvedLeft = leftSym ? resolveToActualDeclaration(this.checker, leftSym) : null;
        if (resolvedLeft && this.isSystemApiModule(resolvedLeft)) {
          return;
        }
        const rightSym = this.checker.getSymbolAtLocation(name.right);
        if (rightSym && isEnumMemberSymbol(rightSym)) {
          return;
        }
        this.collectEntityNameIdentifiers(name.right, visited, depth);
      }
    }
  }

  private isSystemApiModule(symbol: ts.Symbol): boolean {
    const modules: string[] | undefined = this.options.systemModules;
    if (!modules || modules.length === 0) {
      return false;
    }
    for (const decl of symbol.declarations) {
      if (this.isInSdkPath(decl.getSourceFile().fileName)) {
        return true;
      }
    }
    return false;
  }

  private tryResolveQualifiedNameMember(
    qname: ts.QualifiedName
  ): { resolved: ts.Symbol; alias: ts.Symbol } | null {
    const leftSym: ts.Symbol | undefined = this.checker.getSymbolAtLocation(qname.left);
    if (!leftSym) {
      return null;
    }
    const resolvedLeft: ts.Symbol | null = resolveToActualDeclaration(this.checker, leftSym);
    if (!resolvedLeft) {
      return null;
    }
    if (this.isSystemApiModule(resolvedLeft)) {
      return null;
    }
    return this.resolveMemberFromModule(resolvedLeft, qname.right.text);
  }

  private resolveMemberFromModule(
    moduleSymbol: ts.Symbol,
    memberName: string
  ): { resolved: ts.Symbol; alias: ts.Symbol } | null {
    const moduleExports: ts.Symbol[] = this.checker.getExportsOfModule(moduleSymbol);
    for (const exp of moduleExports) {
      if (exp.name === memberName) {
        const resolved: ts.Symbol | null = resolveToActualDeclaration(this.checker, exp);
        if (resolved) {
          return { resolved, alias: exp };
        }
        return null;
      }
    }
    return null;
  }

  private collectEnumValueReference(
    pae: ts.PropertyAccessExpression,
    visited: Set<ts.Symbol>,
    depth: number
  ): void {
    if (!ts.isIdentifier(pae.expression)) {
      return;
    }
    const refSymbol: ts.Symbol | undefined = this.checker.getSymbolAtLocation(pae.expression);
    const resolved: ts.Symbol | null = refSymbol ? resolveToActualDeclaration(this.checker, refSymbol) : null;
    if (!resolved?.declarations?.some(ts.isEnumDeclaration)) {
      return;
    }
    this.collectTypeReference(pae.expression, visited, depth);
  }

  private collectPropertyAccessTypeRef(
    pae: ts.PropertyAccessExpression,
    visited: Set<ts.Symbol>,
    depth: number
  ): void {
    if (ts.isIdentifier(pae.expression)) {
      this.collectTypeReference(pae.expression, visited, depth);
    }
    const leftSym: ts.Symbol | undefined = this.checker.getSymbolAtLocation(pae.expression);
    if (!leftSym) {
      return;
    }
    const resolvedLeft: ts.Symbol | null = resolveToActualDeclaration(this.checker, leftSym);
    if (!resolvedLeft) {
      return;
    }
    if (this.isSystemApiModule(resolvedLeft)) {
      return;
    }
    const rightText: string = pae.name.text;
    const moduleExports: ts.Symbol[] = this.checker.getExportsOfModule(resolvedLeft);
    for (const exp of moduleExports) {
      if (exp.name === rightText) {
        const rightResolved: ts.Symbol | null = resolveToActualDeclaration(this.checker, exp);
        if (rightResolved && rightResolved.declarations && rightResolved.declarations.length > 0) {
          this.collectResolvedTypeReference(rightResolved, rightText, visited, depth, exp);
        }
        return;
      }
    }
  }

  private collectResolvedTypeReference(
    resolved: ts.Symbol,
    localName: string,
    visited: Set<ts.Symbol>,
    depth: number,
    aliasSymbol?: ts.Symbol
  ): void {
    if (!resolved.declarations || resolved.declarations.length === 0) {
      return;
    }
    if (isTypeParameterSymbol(resolved)) {
      return;
    }
    this.collectTypeDepCore(
      resolved, localName, resolved.declarations[0], aliasSymbol, visited, depth
    );
  }

  private collectTypeReference(
    identifier: ts.Identifier,
    visited: Set<ts.Symbol>,
    depth: number
  ): void {
    const refSymbol: ts.Symbol | undefined = this.checker.getSymbolAtLocation(identifier);
    if (!refSymbol) {
      return;
    }
    if (isTypeParameterSymbol(refSymbol)) {
      return;
    }

    const resolved = resolveToActualDeclaration(this.checker, refSymbol);
    if (!resolved) {
      return;
    }
    if (isTypeParameterSymbol(resolved)) {
      return;
    }

    const refDecl: ts.Declaration = resolved.declarations[0];
    if (this.isDefaultLibraryDeclaration(refDecl)) {
      return;
    }

    if (ts.isSourceFile(refDecl)) {
      const sysApiDecl = isSystemApiDeclaration(this.sysApiCtx, refDecl, refSymbol);
      if (sysApiDecl) {
        this.addSystemApiEntity(resolved, refDecl, identifier.text, sysApiDecl, refSymbol, true, this.currentUsageExt);
      }
      return;
    }

    this.collectTypeDepCore(
      resolved, identifier.text, refDecl, refSymbol, visited, depth
    );
  }

  private collectTypeDepCore(
    resolved: ts.Symbol,
    localName: string,
    refDecl: ts.Declaration,
    aliasSymbol: ts.Symbol | undefined,
    visited: Set<ts.Symbol>,
    depth: number
  ): void {
    if (this.entryExportSymbols.has(resolved)) {
      return;
    }
    if (this.typeDepEntityMap.has(resolved)) {
      const existing = this.typeDepEntityMap.get(resolved)!;
      if (localName !== existing.preferredName && localName !== existing.emitName &&
        !existing.aliases.includes(localName)) {
        existing.aliases.push(localName);
      }
      return;
    }

    if (this.isDefaultLibraryDeclaration(refDecl)) {
      return;
    }

    if (ts.isSourceFile(refDecl)) {
      return;
    }

    const sysApiDecl = isSystemApiDeclaration(this.sysApiCtx, refDecl, aliasSymbol);
    if (sysApiDecl) {
      this.addSystemApiEntity(resolved, refDecl, localName, sysApiDecl, resolved, true, this.currentUsageExt);
      return;
    }

    const sdkPath: string | undefined = this.options.sdkPath ?? projectConfig?.sdkPath;
    if (sdkPath && this.isInSdkPath(refDecl.getSourceFile().fileName)) {
      return;
    }

    if (visited.has(resolved)) {
      return;
    }
    visited.add(resolved);

    if (this.isMemberOfCollectedContainer(resolved)) {
      return;
    }

    this.addTypeDepEntity(resolved, localName);
    this.registerContainerIfNeeded(resolved);
    const savedUsageExt: SourceFileExt = this.currentUsageExt;
    this.currentUsageExt = this.getSourceFileExt(resolved.declarations[0]);
    for (const decl of resolved.declarations) {
      this.collectTypeDepsRecursive(decl, visited, depth + 1);
    }
    this.currentUsageExt = savedUsageExt;
  }

  private addTypeDepEntity(resolved: ts.Symbol, preferredName: string): void {
    const entity: MergeEntity = {
      kind: EntityKind.TypeDependency,
      symbol: resolved,
      declarations: [...resolved.declarations],
      emitName: '',
      exportNames: [],
      isDefaultExport: false,
      preferredName,
      sourceFileExt: this.getSourceFileExt(resolved.declarations[0]),
      aliases: [],
    };
    this.typeDepEntities.push(entity);
    this.typeDepEntityMap.set(resolved, entity);
  }

  // ─── Phase 4: Resolve Names ───

  private compareExportedEntities(a: MergeEntity, b: MergeEntity): number {
    const aLocal = getLocalNameOfDeclaration(a.declarations[0]);
    const bLocal = getLocalNameOfDeclaration(b.declarations[0]);
    const aInflexible = a.isDefaultExport || a.exportNames.length !== 1 || a.exportNames[0] === aLocal;
    const bInflexible = b.isDefaultExport || b.exportNames.length !== 1 || b.exportNames[0] === bLocal;
    if (aInflexible && !bInflexible) {
      return -1;
    }
    if (!aInflexible && bInflexible) {
      return 1;
    }
    return 0;
  }

  private resolveExportedEntityName(entity: MergeEntity, usedNames: Set<string>): void {
    if (entity.isDefaultExport) {
      entity.emitName = getLocalNameOfDeclaration(entity.declarations[0]);
      return;
    }
    if (entity.exportNames.length !== 1) {
      entity.emitName = getLocalNameOfDeclaration(entity.declarations[0]);
      for (const expName of entity.exportNames) {
        if (expName !== entity.emitName && expName !== 'default') {
          entity.aliases.push(expName);
        }
      }
      return;
    }
    const localName = getLocalNameOfDeclaration(entity.declarations[0]);
    const exportName = entity.exportNames[0];
    if (exportName !== localName && !usedNames.has(localName)) {
      entity.emitName = localName;
      entity.aliases.push(exportName);
    } else if (exportName !== localName) {
      entity.emitName = exportName;
    } else if (usedNames.has(localName)) {
      entity.emitName = this.findUniqueName(localName, usedNames);
      entity.aliases.push(exportName);
    } else {
      entity.emitName = exportName;
    }
  }

  private resolveNames(): void {
    const usedNames: Set<string> = new Set();
    const exportedEmitNames: Set<string> = new Set();

    const sorted = [...this.exportedEntities].sort(
      (a, b) => this.compareExportedEntities(a, b)
    );

    for (const entity of sorted) {
      this.resolveExportedEntityName(entity, usedNames);
      usedNames.add(entity.emitName);
      exportedEmitNames.add(entity.emitName);
    }

    for (const block of this.namespaceBlocks) {
      usedNames.add(block.name);
    }

    const sourceFileGroups = new Map<string, { nsName: string; entities: MergeEntity[] }>();

    for (const entity of this.typeDepEntities) {
      const sourceFilePath: string = entity.declarations[0].getSourceFile().fileName;

      if (!sourceFileGroups.has(sourceFilePath)) {
        const baseName: string = path.basename(sourceFilePath);
        let nsName: string = this.deriveNamespaceName(baseName);
        if (usedNames.has(nsName)) {
          nsName = this.findUniqueName(nsName, usedNames);
        }
        usedNames.add(nsName);
        sourceFileGroups.set(sourceFilePath, { nsName, entities: [] });
      }

      const group = sourceFileGroups.get(sourceFilePath)!;
      group.entities.push(entity);
      if (exportedEmitNames.has(entity.preferredName)) {
        entity.emitName = getLocalNameOfDeclaration(entity.declarations[0]);
      } else {
        const localName = getLocalNameOfDeclaration(entity.declarations[0]);
        if (entity.preferredName !== localName) {
          entity.emitName = localName;
          entity.aliases.push(entity.preferredName);
        } else {
          entity.emitName = entity.preferredName;
        }
      }
      entity.isolationNamespace = group.nsName;
    }

    this.buildRenameMap();
  }

  private buildRenameMap(): void {
    this.renameMap.clear();

    for (const entity of this.exportedEntities) {
      this.renameMap.set(entity.symbol, entity.emitName);
    }

    for (const entity of this.typeDepEntities) {
      const name: string = `${entity.isolationNamespace}.${entity.emitName}`;
      this.renameMap.set(entity.symbol, name);
    }

    for (const block of this.namespaceBlocks) {
      for (const member of block.members) {
        if (!this.renameMap.has(member.symbol)) {
          this.renameMap.set(member.symbol, `${block.name}.${member.emitName}`);
        }
      }
    }
  }

  private getSourceFileBaseName(entity: MergeEntity): string {
    if (entity.declarations.length === 0) {
      return '__unknown';
    }
    const fileName: string = entity.declarations[0].getSourceFile().fileName;
    return path.basename(fileName);
  }

  private deriveNamespaceName(baseName: string): string {
    const sanitized: string = baseName
      .replace(/\.d\.ets$/, '')
      .replace(/\.d\.ts$/, '')
      .replace(/\.ets$/, '')
      .replace(/\.ts$/, '')
      .replace(/[^a-zA-Z0-9_]/g, '_');
    return `_${sanitized}`;
  }

  private findUniqueName(base: string, usedNames: Set<string>): string {
    let suffix: number = 1;
    let candidate: string = `${base}_${suffix}`;
    while (usedNames.has(candidate)) {
      suffix++;
      candidate = `${base}_${suffix}`;
    }
    usedNames.add(candidate);
    return candidate;
  }

  // ─── Phase 5: Emit ───

  private emit(): { primary: string; companion: string } {
    const primaryExt: SourceFileExt = this.entryExt;
    const companionExt: SourceFileExt = primaryExt === '.d.ets' ? '.d.ts' : '.d.ets';
    const companionFileName: string = DeclarationMerger.getCompanionFileName(this.entryFilePath, companionExt);
    const companionModuleSpecifier: string = companionFileName.replace(/\.d\.(ts|ets)$/, '');

    const ctx: EmitContext = {
      primaryLines: [],
      companionLines: [],
      emittedStatements: new Set(),
      companionEmittedStatements: new Set(),
      primaryEmittedTexts: new Set(),
      companionEmittedTexts: new Set(),
      crossExtExportedNames: [],
      crossExtImportNamespaces: new Set(),
      crossExtImportNames: [],
      crossExtNamespaceImports: new Set(),
      exportRenames: [],
      primaryExt,
      companionModuleSpecifier,
    };

    this.emitSystemApiStatements(ctx);
    this.collectCrossExtNamespaceImports(ctx);
    this.emitIsolationBlocks(ctx);
    this.emitExportedEntities(ctx);
    this.emitNamespaceBlocks(ctx);
    this.emitCrossExtBridgeStatements(ctx);
    this.assembleExportStatement(ctx);

    let primaryResult: string = sortImportLinesFirst(ctx.primaryLines).join('\n\n');
    if (primaryResult.trim().length === 0) {
      primaryResult = 'export {}';
    }

    let companionResult: string = '';
    if (ctx.companionLines.length > 0) {
      companionResult = sortImportLinesFirst(ctx.companionLines).join('\n\n');
    }

    return { primary: primaryResult, companion: companionResult };
  }

  private emitSystemApiStatements(ctx: EmitContext): void {
    const companionExt: SourceFileExt = ctx.primaryExt === '.d.ets' ? '.d.ts' : '.d.ets';
    for (const entity of this.systemApiEntities) {
      const exts: SourceFileExt[] = entity.usageExts ?? [this.entryExt];
      if (exts.includes(ctx.primaryExt)) {
        this.emitSystemApiStatement(entity, ctx.primaryLines, ctx.emittedStatements);
      }
      if (exts.includes(companionExt)) {
        this.emitSystemApiStatement(entity, ctx.companionLines, ctx.companionEmittedStatements);
      }
    }
  }

  private collectCrossExtNamespaceImports(ctx: EmitContext): void {
    for (const entity of this.typeDepEntities) {
      if (!entity.isolationNamespace) {
        continue;
      }
      if (entity.sourceFileExt !== ctx.primaryExt) {
        ctx.crossExtImportNamespaces.add(entity.isolationNamespace);
      }
    }
  }

  private emitIsolationBlocks(ctx: EmitContext): void {
    const primaryEntities: MergeEntity[] = [];
    const companionEntities: MergeEntity[] = [];
    for (const entity of this.typeDepEntities) {
      if (entity.sourceFileExt === ctx.primaryExt) {
        primaryEntities.push(entity);
      } else {
        companionEntities.push(entity);
      }
    }

    const primaryBlocks = this.groupEntitiesByNamespace(primaryEntities);
    for (const [, blockData] of primaryBlocks) {
      const blockText: string = this.emitIsolationNamespaceBlock(
        blockData.nsName, blockData.entities
      );
      if (blockText) {
        ctx.primaryLines.push(blockText);
      }
    }

    const companionBlocks = this.groupEntitiesByNamespace(companionEntities);
    for (const [, blockData] of companionBlocks) {
      const blockText: string = this.emitIsolationNamespaceBlock(
        blockData.nsName, blockData.entities, true
      );
      if (blockText) {
        ctx.companionLines.push(blockText);
      }
    }
  }

  private emitExportedEntities(ctx: EmitContext): void {
    for (const entity of this.exportedEntities) {
      const targetLines: string[] = entity.sourceFileExt === ctx.primaryExt
        ? ctx.primaryLines : ctx.companionLines;
      const targetEmitted: Set<string> = entity.sourceFileExt === ctx.primaryExt
        ? ctx.primaryEmittedTexts : ctx.companionEmittedTexts;

      const isExported: boolean = entity.isDefaultExport || entity.exportNames.includes(entity.emitName);
      const text: string = this.emitTopLevelDeclaration(entity, isExported);
      if (!text) {
        continue;
      }

      const normalized: string = text.replace(/^export\s+/, '').replace(/^declare\s+/, '').trim();
      if (!targetEmitted.has(normalized)) {
        targetEmitted.add(normalized);
        targetLines.push(text);
      }
      if (entity.isDefaultExport) {
        targetLines.push(`export default ${entity.emitName};`);
      }
      if (entity.sourceFileExt !== ctx.primaryExt) {
        for (const expName of entity.exportNames) {
          ctx.crossExtExportedNames.push(expName !== 'default' ? expName : entity.emitName);
        }
      }
      for (const expName of entity.exportNames) {
        if (expName === entity.emitName || expName === 'default') {
          continue;
        }
        if (entity.sourceFileExt === ctx.primaryExt) {
          ctx.exportRenames.push({ emitName: entity.emitName, exportName: expName });
        }
      }
    }
  }

  private emitNamespaceBlocks(ctx: EmitContext): void {
    for (const block of this.namespaceBlocks) {
      for (const sysApi of block.systemApiMembers) {
        if (!ctx.emittedStatements.has(sysApi.importStatement)) {
          ctx.primaryLines.push(sysApi.importStatement);
          ctx.emittedStatements.add(sysApi.importStatement);
        }
      }
      if (block.sourceFileExt === ctx.primaryExt) {
        this.emitPrimaryExtNamespaceBlock(ctx, block);
      } else {
        const blockText: string = this.emitNamespaceBlock(block, true);
        if (blockText) {
          ctx.companionLines.push(blockText);
          ctx.crossExtExportedNames.push(block.name);
        }
      }
    }
  }

  private emitPrimaryExtNamespaceBlock(ctx: EmitContext, block: NamespaceBlock): void {
    const primaryMembers: NamespaceBlockMember[] = [];
    const companionMembers: NamespaceBlockMember[] = [];
    for (const m of block.members) {
      if (m.sourceFileExt === ctx.primaryExt) {
        primaryMembers.push(m);
      } else {
        companionMembers.push(m);
      }
    }

    if (companionMembers.length > 0) {
      this.emitCompanionNamespaceMembers(ctx, block, primaryMembers, companionMembers);
    } else {
      const blockText: string = this.emitNamespaceBlock(block);
      if (blockText) {
        ctx.primaryLines.push(blockText);
      }
    }
  }

  private emitCompanionNamespaceMembers(
    ctx: EmitContext, block: NamespaceBlock,
    primaryMembers: NamespaceBlockMember[], companionMembers: NamespaceBlockMember[]
  ): void {
    const allOverrides: Map<ts.Symbol, string> = new Map();
    for (const m of block.members) {
      allOverrides.set(m.symbol, m.emitName);
    }
    for (const cm of companionMembers) {
      const text: string = this.emitCrossExtNamespaceMember(cm, allOverrides);
      if (text) {
        const normalized: string = text.replace(/^export\s+/, '').replace(/^declare\s+/, '').trim();
        if (!ctx.companionEmittedTexts.has(normalized)) {
          ctx.companionEmittedTexts.add(normalized);
          ctx.companionLines.push(text);
        }
      }
      ctx.crossExtNamespaceImports.add(cm.emitName);
    }
    const blockText: string = this.emitNamespaceBlockCore(
      block.name, primaryMembers, false, false, block.systemApiMembers, companionMembers
    );
    if (blockText) {
      ctx.primaryLines.push(blockText);
    }
  }

  private emitCrossExtBridgeStatements(ctx: EmitContext): void {
    const allImportNames: Set<string> = new Set();
    const exportedImportNames: Set<string> = new Set();
    const reexportOnlyNames: string[] = [];

    for (const name of ctx.crossExtNamespaceImports) {
      allImportNames.add(name);
    }

    if (ctx.crossExtImportNamespaces.size > 0) {
      const primaryText: string = ctx.primaryLines.join('\n');
      const referenced: string[] = findNamesMatchingPattern(
        [...ctx.crossExtImportNamespaces], primaryText, true
      );
      for (const name of referenced) {
        allImportNames.add(name);
      }
    }

    if (ctx.crossExtExportedNames.length > 0) {
      const primaryText: string = ctx.primaryLines.join('\n');
      for (const name of ctx.crossExtExportedNames) {
        if (reexportOnlyNames.includes(name)) {
          continue;
        }
        if (allImportNames.has(name)) {
          exportedImportNames.add(name);
          continue;
        }
        if (isNameReferencedInText(name, primaryText)) {
          allImportNames.add(name);
          exportedImportNames.add(name);
        } else {
          reexportOnlyNames.push(name);
        }
      }
    }

    if (allImportNames.size > 0) {
      ctx.primaryLines.unshift(
        `import { ${[...allImportNames].join(', ')} } from './${ctx.companionModuleSpecifier}';`
      );
    }
    ctx.crossExtImportNames = [...exportedImportNames];

    if (reexportOnlyNames.length > 0) {
      ctx.primaryLines.push(
        `export { ${reexportOnlyNames.join(', ')} } from './${ctx.companionModuleSpecifier}';`
      );
    }
  }

  private assembleExportStatement(ctx: EmitContext): void {
    const exportParts: string[] = [];
    for (const rename of ctx.exportRenames) {
      exportParts.push(
        rename.emitName === rename.exportName
          ? rename.emitName
          : `${rename.emitName} as ${rename.exportName}`
      );
    }

    if (this.namespaceBlocks.length > 0) {
      const nsExportNames: string[] = this.collectNamespaceExportNames(ctx.primaryExt);
      exportParts.push(...nsExportNames.filter(n => !exportParts.includes(n)));
    }

    for (const name of ctx.crossExtImportNames) {
      if (!exportParts.includes(name)) {
        exportParts.push(name);
      }
    }

    if (exportParts.length > 0) {
      ctx.primaryLines.push(`export { ${exportParts.join(', ')} };`);
    } else if (!ctx.primaryLines.some((l: string): boolean => /^export\s*\{[^}]+\}/.test(l))) {
      ctx.primaryLines.push('export {};');
    }
  }

  private collectMemberExportNames(member: NamespaceBlockMember, nsExportNames: string[]): void {
    const exportedEntity = this.exportedEntityMap.get(member.symbol);
    if (!exportedEntity) {
      return;
    }
    if (exportedEntity.exportNames.includes(exportedEntity.emitName) || exportedEntity.isDefaultExport) {
      return;
    }
    for (const expName of exportedEntity.exportNames) {
      if (expName === 'default' || expName !== exportedEntity.emitName || nsExportNames.includes(expName)) {
        continue;
      }
      nsExportNames.push(expName);
    }
  }

  private collectNamespaceExportNames(primaryExt: SourceFileExt): string[] {
    const nsExportNames: string[] = [];
    for (const block of this.namespaceBlocks) {
      if (block.sourceFileExt !== primaryExt) {
        continue;
      }
      nsExportNames.push(block.name);
      for (const member of block.members) {
        this.collectMemberExportNames(member, nsExportNames);
      }
    }
    return nsExportNames;
  }

  private groupEntitiesByNamespace(entities: MergeEntity[]): Map<string, { nsName: string; entities: MergeEntity[] }> {
    const groups = new Map<string, { nsName: string; entities: MergeEntity[] }>();
    for (const entity of entities) {
      const nsName: string = entity.isolationNamespace!;
      if (!nsName) {
        continue;
      }
      if (!groups.has(nsName)) {
        groups.set(nsName, { nsName, entities: [] });
      }
      groups.get(nsName)!.entities.push(entity);
    }
    return groups;
  }

  private emitSystemApiStatement(
    entity: MergeEntity,
    lines: string[],
    emittedStatements: Set<string>
  ): void {
    const info = entity.systemApiInfo!;
    const line: string = info.statementText;
    if (!emittedStatements.has(line)) {
      lines.push(line);
      emittedStatements.add(line);
    }
    if (info.exportStatementText && !emittedStatements.has(info.exportStatementText)) {
      lines.push(info.exportStatementText);
      emittedStatements.add(info.exportStatementText);
    }
  }

  private emitTopLevelDeclaration(entity: MergeEntity, isExported: boolean): string {
    return this.printDeclarations(entity.declarations, {
      transformNode: (sanitizedNode: ts.Node): ts.Node => sanitizedNode,
      formatText: (text: string, printNode: ts.Node): string => {
        if (isExported && !entity.isDefaultExport) {
          return transformToExportDeclare(text, printNode);
        }
        text = stripExportFromText(text, printNode);
        return ensureDeclareKeyword(text, printNode);
      },
      normalizeForDedup: (text: string): string =>
        text.replace(/^export\s+/, '').replace(/^declare\s+/, ''),
    });
  }

  private emitNamespaceMemberDeclaration(
    declarations: ts.Declaration[],
    localOverrides: Map<ts.Symbol, string>
  ): string {
    return this.printDeclarations(declarations, {
      transformNode: (sanitizedNode: ts.Node): ts.Node =>
        withNamespaceMemberModifiers(sanitizedNode),
      formatText: (text: string, _printNode: ts.Node): string => text,
      localOverrides,
      normalizeForDedup: (text: string): string =>
        text.replace(/^export\s+/, '').trim(),
    });
  }

  private emitCrossExtNamespaceMember(
    member: NamespaceBlockMember,
    localOverrides: Map<ts.Symbol, string>
  ): string {
    return this.printDeclarations(member.declarations, {
      transformNode: (sanitizedNode: ts.Node): ts.Node => sanitizedNode,
      formatText: (text: string, printNode: ts.Node): string =>
        transformToExportDeclare(text, printNode),
      localOverrides,
      normalizeForDedup: (text: string): string =>
        text.replace(/^export\s+/, '').replace(/^declare\s+/, ''),
    });
  }

  private printDeclarations(
    declarations: ts.Declaration[],
    options: {
      transformNode: (sanitizedNode: ts.Node) => ts.Node;
      formatText: (text: string, printNode: ts.Node) => string;
      localOverrides?: Map<ts.Symbol, string>;
      normalizeForDedup: (text: string) => string;
    }
  ): string {
    if (declarations.length === 0) {
      return '';
    }

    const parts: string[] = [];
    const emittedNormalizedTexts: Set<string> = new Set();

    for (const declaration of declarations) {
      if (ts.isExportSpecifier(declaration)) {
        continue;
      }
      const sourceFile: ts.SourceFile = declaration.getSourceFile();
      const printNode: ts.Node = getDeclarationNode(declaration);

      const sanitizedNode: ts.Node = sanitizeDeclarationNode(printNode);
      const transformedNode: ts.Node = options.transformNode(sanitizedNode);
      let text: string = this.printer.printNode(ts.EmitHint.Unspecified, transformedNode, sourceFile);

      const { body } = splitLeadingTrivia(text);
      text = body;

      text = options.formatText(text, printNode);
      text = this.applyRenamesToText(text, printNode, options.localOverrides);
      text = this.replaceImportTypeReferences(text, printNode);
      text = text.replace(/  +/g, ' ');
      text = text.trim();

      if (text) {
        const normalized: string = options.normalizeForDedup(text);
        if (!emittedNormalizedTexts.has(normalized)) {
          emittedNormalizedTexts.add(normalized);
          parts.push(text);
        }
      }
    }
    return parts.join('\n\n');
  }
  private emitNamespaceBlockCore(
    nsName: string,
    items: NamespaceEmitItem[],
    isExported: boolean,
    dedupByName: boolean,
    systemApiMembers?: NamespaceSystemApiMember[],
    crossExtItems?: NamespaceEmitItem[]
  ): string {
    const localOverrides: Map<ts.Symbol, string> = new Map();
    for (const item of items) {
      localOverrides.set(item.symbol, item.emitName);
    }
    if (crossExtItems) {
      for (const item of crossExtItems) {
        localOverrides.set(item.symbol, item.emitName);
      }
    }

    const memberTexts: string[] = [];
    const emittedNames: Set<string> = new Set();
    for (const item of items) {
      if (dedupByName && emittedNames.has(item.emitName)) {
        continue;
      }
      emittedNames.add(item.emitName);
      const text: string = this.emitNamespaceMemberDeclaration(item.declarations, localOverrides);
      if (text) {
        memberTexts.push(text);
      }
      for (const alias of item.aliases) {
        memberTexts.push(`export { ${item.emitName} as ${alias} };`);
      }
    }

    if (systemApiMembers) {
      for (const sysApi of systemApiMembers) {
        memberTexts.push(`export { ${sysApi.name} };`);
      }
    }

    if (crossExtItems) {
      for (const item of crossExtItems) {
        memberTexts.push(`export { ${item.emitName} };`);
        for (const alias of item.aliases) {
          memberTexts.push(`export { ${item.emitName} as ${alias} };`);
        }
      }
    }

    if (memberTexts.length === 0) {
      return '';
    }
    const keyword: string = isExported ? 'export declare namespace' : 'declare namespace';
    return `${keyword} ${nsName} {\n${memberTexts.join('\n')}\n}`;
  }

  private emitIsolationNamespaceBlock(
    nsName: string,
    entities: MergeEntity[],
    isExported: boolean = false
  ): string {
    return this.emitNamespaceBlockCore(nsName, entities, isExported, true);
  }

  private emitNamespaceBlock(block: NamespaceBlock, isExported: boolean = false): string {
    return this.emitNamespaceBlockCore(
      block.name, block.members, isExported, false, block.systemApiMembers
    );
  }
  // ─── Rename / Reference Rewriting ───

  private applyRenamesToText(
    text: string,
    node: ts.Node,
    localOverrides?: Map<ts.Symbol, string>
  ): string {
    const renames: Map<string, string> = new Map();
    const visit = (n: ts.Node): void => {
      if (ts.isIdentifier(n)) {
        this.collectRenameForIdentifier(n, renames, localOverrides);
      } else if (ts.isImportTypeNode(n)) {
        this.collectImportTypeRename(n, renames, localOverrides);
      }
      ts.forEachChild(n, visit);
    };
    ts.forEachChild(node, visit);

    if (renames.size === 0) {
      return text;
    }
    return applyRenamesWithPlaceholders(text, renames);
  }

  private replaceImportTypeReferences(text: string, node: ts.Node): string {
    const replacements: Array<{ pattern: RegExp; replacement: string }> = [];
    const visit = (n: ts.Node): void => {
      if (ts.isImportTypeNode(n) && n.qualifier && ts.isIdentifier(n.qualifier)) {
        const qualifier = n.qualifier.text;
        const replacement = this.resolveImportTypeText(n, qualifier);
        if (replacement) {
          const pattern = new RegExp(
            `import\\s*\\(\\s*['"][^'"]*['"]\\s*\\)\\s*\\.\\s*${escapeRegExp(qualifier)}`
          );
          replacements.push({ pattern, replacement });
        }
      }
      ts.forEachChild(n, visit);
    };
    ts.forEachChild(node, visit);

    for (const { pattern, replacement } of replacements) {
      text = text.replace(pattern, replacement);
    }
    return text;
  }

  private resolveImportTypeText(node: ts.ImportTypeNode, qualifier: string): string | null {
    const qualifierSymbol = this.checker.getSymbolAtLocation(node.qualifier);
    if (!qualifierSymbol) {
      return null;
    }
    const resolved = resolveToActualDeclaration(this.checker, qualifierSymbol);
    if (!resolved || !resolved.declarations || resolved.declarations.length === 0) {
      return null;
    }
    const firstDecl = resolved.declarations[0];
    if (ts.isTypeAliasDeclaration(firstDecl)) {
      const rawText = firstDecl.type.getText(firstDecl.getSourceFile());
      return this.applyRenamesToText(rawText, firstDecl.type);
    }
    if (this.isDefaultLibraryDeclaration(firstDecl)) {
      const resolvedType = this.checker.getTypeFromTypeNode(node);
      const typeText = resolvedType ? this.checker.typeToString(resolvedType) : null;
      return typeText ?? null;
    }
    const emitName = this.renameMap.get(resolved);
    return emitName ?? null;
  }

  private collectImportTypeRename(
    node: ts.ImportTypeNode,
    renames: Map<string, string>,
    localOverrides?: Map<ts.Symbol, string>
  ): void {
    const qualifier = node.qualifier;
    if (!qualifier || !ts.isIdentifier(qualifier)) {
      return;
    }
    const resolvedSymbol = this.resolveImportTypeSymbol(node);
    if (!resolvedSymbol) {
      return;
    }
    const resolved = resolveToActualDeclaration(this.checker, resolvedSymbol);
    if (!resolved) {
      return;
    }
    const emitName = this.resolveEmitName(resolved, localOverrides);
    if (!emitName) {
      return;
    }
    const sourceFile = node.getSourceFile();
    const importText = node.getText(sourceFile);
    renames.set(importText, emitName);
  }

  private collectRenameForIdentifier(
    n: ts.Identifier,
    renames: Map<string, string>,
    localOverrides?: Map<ts.Symbol, string>
  ): void {
    const refSymbol: ts.Symbol | undefined = this.checker.getSymbolAtLocation(n);
    if (!refSymbol) {
      return;
    }
    const resolved: ts.Symbol | null = resolveToActualDeclaration(this.checker, refSymbol);
    if (!resolved) {
      return;
    }
    const aliasName: string | undefined = this.resolveAliasEmitName(resolved, n.text, localOverrides);
    const emitName: string | undefined = aliasName ?? this.resolveEmitName(resolved, localOverrides);
    if (!emitName) {
      return;
    }
    if (this.isRightOfNamespaceImport(n, emitName, renames)) {
      return;
    }
    if (emitName !== n.text) {
      if (isRightOfMatchingQualifiedName(n, emitName)) {
        return;
      }
      renames.set(n.text, emitName);
    }
  }

  private isRightOfNamespaceImport(
    n: ts.Identifier,
    emitName: string,
    renames: Map<string, string>
  ): boolean {
    if (!n.parent) {
      return false;
    }

    let leftNode: ts.Node | null = null;
    if (ts.isQualifiedName(n.parent) && n.parent.right === n) {
      leftNode = n.parent.left;
    } else if (ts.isPropertyAccessExpression(n.parent) && n.parent.name === n) {
      leftNode = n.parent.expression;
    }

    if (!leftNode) {
      return false;
    }

    const leftSym: ts.Symbol | undefined = this.checker.getSymbolAtLocation(leftNode);
    if (!leftSym) {
      return false;
    }

    const resolvedLeft: ts.Symbol | null = resolveToActualDeclaration(this.checker, leftSym);
    if (!resolvedLeft?.declarations?.[0]) {
      return false;
    }

    if (!ts.isSourceFile(resolvedLeft.declarations[0])) {
      return false;
    }

    const fullText: string = n.parent.getText(n.getSourceFile());
    renames.set(fullText, emitName);
    return true;
  }

  private resolveAliasEmitName(
    resolved: ts.Symbol,
    identifierText: string,
    localOverrides?: Map<ts.Symbol, string>
  ): string | undefined {
    if (localOverrides) {
      return undefined;
    }
    const typeDepEntity = this.typeDepEntityMap.get(resolved);
    if (typeDepEntity && typeDepEntity.aliases.includes(identifierText) && typeDepEntity.isolationNamespace) {
      return `${typeDepEntity.isolationNamespace}.${identifierText}`;
    }
    for (const block of this.namespaceBlocks) {
      for (const member of block.members) {
        if (member.symbol === resolved && member.aliases.includes(identifierText)) {
          return `${block.name}.${identifierText}`;
        }
      }
    }
    const exportedEntity = this.exportedEntityMap.get(resolved);
    if (exportedEntity && exportedEntity.aliases.includes(identifierText)) {
      return exportedEntity.emitName;
    }
    return undefined;
  }

  private resolveEmitName(
    resolved: ts.Symbol,
    localOverrides?: Map<ts.Symbol, string>
  ): string | undefined {
    if (localOverrides && localOverrides.has(resolved)) {
      return localOverrides.get(resolved);
    }
    return this.renameMap.get(resolved);
  }
  private registerContainerIfNeeded(symbol: ts.Symbol): void {
    const isContainer: boolean = symbol.declarations.some(
      (d: ts.Declaration): boolean =>
        ts.isModuleDeclaration(d) ||
        ts.isClassDeclaration(d) ||
        ts.isEnumDeclaration(d) ||
        ts.isInterfaceDeclaration(d)
    );
    if (isContainer) {
      this.collectedContainerSymbols.add(symbol);
    }
  }

  private isMemberOfCollectedContainer(symbol: ts.Symbol): boolean {
    return symbol.declarations.some(
      (decl: ts.Declaration): boolean => this.hasCollectedContainerAncestor(decl)
    );
  }

  private hasCollectedContainerAncestor(node: ts.Node): boolean {
    let current: ts.Node | undefined = node.parent;
    while (current) {
      if (this.isCollectedContainer(current)) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }

  private isCollectedContainer(node: ts.Node): boolean {
    if (
      !ts.isModuleDeclaration(node) &&
      !ts.isClassDeclaration(node) &&
      !ts.isEnumDeclaration(node) &&
      !ts.isInterfaceDeclaration(node)
    ) {
      return false;
    }
    if (!node.name) {
      return false;
    }
    const parentSym: ts.Symbol | undefined = this.checker.getSymbolAtLocation(node.name);
    if (!parentSym) {
      return false;
    }
    const resolved: ts.Symbol | null = resolveToActualDeclaration(this.checker, parentSym);
    return resolved !== null && this.collectedContainerSymbols.has(resolved);
  }

  private isDefaultLibraryDeclaration(decl: ts.Declaration): boolean {
    return this.program.isSourceFileDefaultLibrary(decl.getSourceFile());
  }


  private isInSdkPath(fileName: string): boolean {
    const sdkPath: string | undefined = this.options.sdkPath ?? projectConfig?.sdkPath;
    if (!sdkPath) {
      return true;
    }
    const resolved: string = path.resolve(fileName);
    const normalizedSdk: string = path.resolve(sdkPath);
    return resolved.startsWith(normalizedSdk + path.sep) || resolved.startsWith(normalizedSdk + '/');
  }

  private cleanup(entryFiles: string[]): void {
    const entrySet: Set<string> = new Set(entryFiles.map(toUnixPath));
    const companionPaths: Set<string> = new Set();
    for (const entryFile of entryFiles) {
      companionPaths.add(toUnixPath(this.getCompanionFilePath(entryFile)));
    }

    for (const [key, value] of harFilesRecord) {
      if (!value.originalDeclarationCachePath) {
        continue;
      }
      const cachePath: string = toUnixPath(value.originalDeclarationCachePath);
      if (entrySet.has(cachePath) || companionPaths.has(cachePath)) {
        continue;
      }
      if (fs.existsSync(cachePath)) {
        fs.unlinkSync(cachePath);
      }
      harFilesRecord.delete(key);
    }
  }
}
