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
  primaryEmittedTexts: Set<string>;
  companionEmittedTexts: Set<string>;
  crossExtExportedNames: string[];
  crossExtImportNamespaces: Set<string>;
  crossExtImportNames: string[];
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
  private systemApiEntityMap: Map<ts.Symbol, Set<string>> = new Map();

  private entryExportSymbols: Set<ts.Symbol> = new Set();
  private collectedContainerSymbols: Set<ts.Symbol> = new Set();
  private renameMap: Map<ts.Symbol, string> = new Map();
  private entryExt: SourceFileExt = '.d.ets';
  private entryFilePath: string = '';

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
    this.validateOutput(primary, entryFile);

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
    const entrySymbol: ts.Symbol | undefined =
      this.checker.getSymbolAtLocation(this.entrySourceFile!);
    if (!entrySymbol) {
      return;
    }

    const hasExplicitDefault: boolean = this.entryFileHasExplicitDefaultExport();

    for (const exportSymbol of this.checker.getExportsOfModule(entrySymbol)) {
      if (exportSymbol.name === 'default' && !hasExplicitDefault) {
        continue;
      }

      const resolved: ts.Symbol | null = this.resolveToActualDeclaration(exportSymbol);
      if (!resolved || resolved.declarations.length === 0) {
        continue;
      }

      const firstDecl: ts.Declaration = resolved.declarations[0];
      const isDefault: boolean = exportSymbol.name === 'default';
      const exportedName: string = exportSymbol.name;

      if (ts.isSourceFile(firstDecl)) {
        const { members, systemApiMembers } = this.collectNamespaceMembers(resolved);
        if (members.length > 0 || systemApiMembers.length > 0) {
          const blockExt: SourceFileExt = members.length > 0
            ? members[0].sourceFileExt : this.entryExt;
          this.namespaceBlocks.push({
            name: exportedName, members, sourceFileExt: blockExt, systemApiMembers,
          });
        }
        continue;
      }

      if (this.isDefaultLibraryDeclaration(firstDecl)) {
        continue;
      }

      if (this.isInSdkPath(firstDecl.getSourceFile().fileName)) {
        const localImport = this.findLocalImportForExport(exportedName, resolved);
        if (localImport && this.isExternalModuleSpecifier(localImport.moduleName)) {
          this.addSystemApiEntity(resolved, firstDecl, exportedName, {
            moduleName: localImport.moduleName,
            name: exportedName,
            statementText: localImport.statementText,
            exportStatementText: `export { ${exportedName} };`,
          }, exportSymbol);
          this.entryExportSymbols.add(resolved);
          continue;
        }
      }

      const sysApiDecl = this.isSystemApiDeclaration(firstDecl, exportSymbol);
      if (sysApiDecl) {
        this.addSystemApiEntity(resolved, firstDecl, exportedName, sysApiDecl, exportSymbol);
        this.entryExportSymbols.add(resolved);
        continue;
      }

      this.addExportedEntity(resolved, exportedName, isDefault);
      this.entryExportSymbols.add(resolved);
    }

    this.collectStarExportMembers();
  }

  private collectNamespaceMembers(moduleSymbol: ts.Symbol):
    { members: NamespaceBlockMember[]; systemApiMembers: NamespaceSystemApiMember[] } {
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
      const resolvedMember: ts.Symbol | null = this.resolveToActualDeclaration(memberSymbol);
      if (!resolvedMember || !resolvedMember.declarations || resolvedMember.declarations.length === 0) {
        continue;
      }

      const memberDecl: ts.Declaration = resolvedMember.declarations[0];
      if (ts.isSourceFile(memberDecl)) {
        continue;
      }
      if (this.isInSdkPath(memberDecl.getSourceFile().fileName)) {
        const importInfo = this.findImportInModule(
          moduleSymbol, memberSymbol.name, resolvedMember
        );
        if (importInfo && this.isExternalModuleSpecifier(importInfo.moduleName)) {
          systemApiMembers.push({
            name: memberSymbol.name,
            importStatement: importInfo.statementText,
          });
          continue;
        }
        const reexportImport: string | null = this.findReexportForSymbol(memberSymbol);
        if (reexportImport) {
          systemApiMembers.push({
            name: memberSymbol.name,
            importStatement: reexportImport,
          });
          continue;
        }
      }
      if (this.isSystemApiDeclaration(memberDecl, memberSymbol)) {
        continue;
      }
      if (this.isDefaultLibraryDeclaration(memberDecl)) {
        continue;
      }

      const existing: NamespaceBlockMember | undefined = members.find(m => m.symbol === resolvedMember);
      if (existing) {
        if (memberSymbol.name !== existing.emitName) {
          existing.aliases.push(memberSymbol.name);
        }
      } else {
        const declName = this.getLocalNameOfDeclaration(resolvedMember.declarations[0]);
        if (memberSymbol.name !== declName) {
          members.push({
            symbol: resolvedMember,
            declarations: [...resolvedMember.declarations],
            emitName: declName,
            aliases: [memberSymbol.name],
            sourceFileExt: this.getSourceFileExt(memberDecl),
          });
        } else {
          members.push({
            symbol: resolvedMember,
            declarations: [...resolvedMember.declarations],
            emitName: memberSymbol.name,
            aliases: [],
            sourceFileExt: this.getSourceFileExt(memberDecl),
          });
        }
      }
    }

    return { members, systemApiMembers };
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
    const resolved: ts.Symbol | null = this.resolveToActualDeclaration(memberSymbol);
    if (!resolved || !resolved.declarations || resolved.declarations.length === 0) {
      return;
    }
    const memberDecl: ts.Declaration = resolved.declarations[0];
    if (ts.isSourceFile(memberDecl) || this.isSystemApiDeclaration(memberDecl, memberSymbol) ||
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
    isTypeDep: boolean = false
  ): void {
    let seenNames: Set<string> | undefined = this.systemApiEntityMap.get(resolved);
    if (seenNames && seenNames.has(exportedName)) {
      return;
    }
    if (!seenNames) {
      seenNames = new Set();
      this.systemApiEntityMap.set(resolved, seenNames);
    }
    seenNames.add(exportedName);

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
    };
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
      for (const decl of entity.declarations) {
        this.collectTypeDepsRecursive(decl, visited, 0);
      }
    }

    for (const block of this.namespaceBlocks) {
      for (const member of block.members) {
        if (!visited.has(member.symbol)) {
          visited.add(member.symbol);
        }
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
    const resolved = this.resolveToActualDeclaration(qualifierSymbol);
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

    const sysApiDecl = this.isSystemApiDeclaration(firstDecl, qualifierSymbol);
    if (sysApiDecl) {
      this.addSystemApiEntity(resolved, firstDecl, qualifier.text, sysApiDecl, qualifierSymbol, true);
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
      const resolved = this.resolveToActualDeclaration(qualifierSymbol);
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
        const resolvedLeft = leftSym ? this.resolveToActualDeclaration(leftSym) : null;
        if (resolvedLeft && this.isSystemApiModule(resolvedLeft)) {
          return;
        }
        const rightSym = this.checker.getSymbolAtLocation(name.right);
        if (rightSym && this.isEnumMemberSymbol(rightSym)) {
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
    const resolvedLeft: ts.Symbol | null = this.resolveToActualDeclaration(leftSym);
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
        const resolved: ts.Symbol | null = this.resolveToActualDeclaration(exp);
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
    const resolved: ts.Symbol | null = refSymbol ? this.resolveToActualDeclaration(refSymbol) : null;
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
    const resolvedLeft: ts.Symbol | null = this.resolveToActualDeclaration(leftSym);
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
        const rightResolved: ts.Symbol | null = this.resolveToActualDeclaration(exp);
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
    if (this.isTypeParameterSymbol(resolved)) {
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
    if (this.isTypeParameterSymbol(refSymbol)) {
      return;
    }

    const resolved = this.resolveToActualDeclaration(refSymbol);
    if (!resolved) {
      return;
    }
    if (this.isTypeParameterSymbol(resolved)) {
      return;
    }

    const refDecl: ts.Declaration = resolved.declarations[0];
    if (this.isDefaultLibraryDeclaration(refDecl)) {
      return;
    }

    if (ts.isSourceFile(refDecl)) {
      const sysApiDecl = this.isSystemApiDeclaration(refDecl, refSymbol);
      if (sysApiDecl) {
        this.addSystemApiEntity(resolved, refDecl, identifier.text, sysApiDecl, refSymbol, true);
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

    const sysApiDecl = this.isSystemApiDeclaration(refDecl, aliasSymbol);
    if (sysApiDecl) {
      this.addSystemApiEntity(resolved, refDecl, localName, sysApiDecl, resolved, true);
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
    for (const decl of resolved.declarations) {
      this.collectTypeDepsRecursive(decl, visited, depth + 1);
    }
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
    const aLocal = this.getLocalNameOfDeclaration(a.declarations[0]);
    const bLocal = this.getLocalNameOfDeclaration(b.declarations[0]);
    const aInflexible = a.isDefaultExport || a.exportNames.length !== 1 || a.exportNames[0] === aLocal;
    const bInflexible = b.isDefaultExport || b.exportNames.length !== 1 || b.exportNames[0] === bLocal;
    if (aInflexible && !bInflexible) { return -1; }
    if (!aInflexible && bInflexible) { return 1; }
    return 0;
  }

  private resolveExportedEntityName(entity: MergeEntity, usedNames: Set<string>): void {
    if (entity.isDefaultExport) {
      entity.emitName = this.getLocalNameOfDeclaration(entity.declarations[0]);
      return;
    }
    if (entity.exportNames.length !== 1) {
      entity.emitName = this.getLocalNameOfDeclaration(entity.declarations[0]);
      for (const expName of entity.exportNames) {
        if (expName !== entity.emitName && expName !== 'default') {
          entity.aliases.push(expName);
        }
      }
      return;
    }
    const localName = this.getLocalNameOfDeclaration(entity.declarations[0]);
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
        entity.emitName = this.getLocalNameOfDeclaration(entity.declarations[0]);
      } else {
        const localName = this.getLocalNameOfDeclaration(entity.declarations[0]);
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
      primaryEmittedTexts: new Set(),
      companionEmittedTexts: new Set(),
      crossExtExportedNames: [],
      crossExtImportNamespaces: new Set(),
      crossExtImportNames: [],
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

    let primaryResult: string = this.sortImportLinesFirst(ctx.primaryLines).join('\n\n');
    if (primaryResult.trim().length === 0) {
      primaryResult = 'export {}';
    }

    let companionResult: string = '';
    if (ctx.companionLines.length > 0) {
      companionResult = this.sortImportLinesFirst(ctx.companionLines).join('\n\n');
    }

    return { primary: primaryResult, companion: companionResult };
  }

  private emitSystemApiStatements(ctx: EmitContext): void {
    for (const entity of this.systemApiEntities) {
      this.emitSystemApiStatement(entity, ctx.primaryLines, ctx.emittedStatements);
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

      const normalized: string = text.replace(/^declare\s+/, '').replace(/^export\s+/, '').trim();
      if (!targetEmitted.has(normalized)) {
        targetEmitted.add(normalized);
        targetLines.push(text);
      } else if (!entity.isDefaultExport) {
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
        const blockText: string = this.emitNamespaceBlock(block);
        if (blockText) {
          ctx.primaryLines.push(blockText);
        }
      } else {
        const blockText: string = this.emitNamespaceBlock(block, true);
        if (blockText) {
          ctx.companionLines.push(blockText);
          ctx.crossExtExportedNames.push(block.name);
        }
      }
    }
  }

  private emitCrossExtBridgeStatements(ctx: EmitContext): void {
    if (ctx.crossExtImportNamespaces.size > 0) {
      const primaryText: string = ctx.primaryLines.join('\n');
      const referenced: string[] = this.findNamesMatchingPattern(
        [...ctx.crossExtImportNamespaces], primaryText, true
      );
      if (referenced.length > 0) {
        ctx.primaryLines.unshift(
          `import { ${referenced.join(', ')} } from './${ctx.companionModuleSpecifier}';`
        );
      }
    }

    if (ctx.crossExtExportedNames.length > 0) {
      const primaryText: string = ctx.primaryLines.join('\n');
      const importNames: string[] = [];
      const reexportOnlyNames: string[] = [];
      for (const name of ctx.crossExtExportedNames) {
        if (this.isNameReferencedInText(name, primaryText)) {
          importNames.push(name);
        } else {
          reexportOnlyNames.push(name);
        }
      }
      if (importNames.length > 0) {
        ctx.primaryLines.unshift(
          `import { ${importNames.join(', ')} } from './${ctx.companionModuleSpecifier}';`
        );
        ctx.crossExtImportNames = importNames;
      }
      if (reexportOnlyNames.length > 0) {
        ctx.primaryLines.push(
          `export { ${reexportOnlyNames.join(', ')} } from './${ctx.companionModuleSpecifier}';`
        );
      }
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
          return this.transformToExportDeclare(text, printNode);
        }
        text = this.stripExportFromText(text, printNode);
        return this.ensureDeclareKeyword(text, printNode);
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
        this.withNamespaceMemberModifiers(sanitizedNode),
      formatText: (text: string, _printNode: ts.Node): string => text,
      localOverrides,
      normalizeForDedup: (text: string): string =>
        text.replace(/^export\s+/, '').trim(),
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
      const printNode: ts.Node = this.getDeclarationNode(declaration);

      const sanitizedNode: ts.Node = this.sanitizeDeclarationNode(printNode);
      const transformedNode: ts.Node = options.transformNode(sanitizedNode);
      let text: string = this.printer.printNode(ts.EmitHint.Unspecified, transformedNode, sourceFile);

      const { body } = this.splitLeadingTrivia(text);
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

  private transformToExportDeclare(text: string, node: ts.Node): string {
    const hasDeclare: boolean = this.nodeHasModifier(node, ts.SyntaxKind.DeclareKeyword);
    const hasDefault: boolean = this.nodeHasModifier(node, ts.SyntaxKind.DefaultKeyword);
    const { leading, body } = this.splitLeadingTrivia(text);
    let transformed: string = body;
    if (hasDefault) {
      transformed = transformed.replace(/^export\s+default\s+/, 'export declare ');
    } else {
      const hasExport: boolean = this.nodeHasModifier(node, ts.SyntaxKind.ExportKeyword);
      const isTypeAlias: boolean = this.isTypeAliasLike(node);
      if (isTypeAlias) {
        if (hasExport && hasDeclare) {
          transformed = transformed.replace(/^export\s+declare\s+/, 'export ');
        } else if (hasDeclare) {
          transformed = transformed.replace(/^declare\s+/, 'export ');
        } else if (hasExport) {
          // already "export type" - keep as is
        } else {
          transformed = 'export ' + transformed;
        }
      } else if (hasExport && hasDeclare) {
        // already "export declare" - keep as is
      } else if (hasExport) {
        transformed = transformed.replace(/^export\s+/, 'export declare ');
      } else if (hasDeclare) {
        transformed = transformed.replace(/^declare\s+/, 'export declare ');
      } else {
        transformed = 'export declare ' + transformed;
      }
    }
    return leading + transformed;
  }

  private isTypeAliasLike(node: ts.Node): boolean {
    const decl: ts.Node = this.getDeclarationNode(node);
    return ts.isTypeAliasDeclaration(decl);
  }

  private emitNamespaceBlockCore(
    nsName: string,
    items: NamespaceEmitItem[],
    isExported: boolean,
    dedupByName: boolean,
    systemApiMembers?: NamespaceSystemApiMember[]
  ): string {
    const localOverrides: Map<ts.Symbol, string> = new Map();
    for (const item of items) {
      localOverrides.set(item.symbol, item.emitName);
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

  private withNamespaceMemberModifiers(node: ts.Node): ts.Node {
    const decorators: readonly ts.Decorator[] =
      ts.canHaveDecorators(node) ? ts.getDecorators(node) ?? [] : [];
    const modifiers: readonly ts.Modifier[] =
      ts.canHaveModifiers(node) ? ts.getModifiers(node) ?? [] : [];

    const keptModifiers: ts.Modifier[] = modifiers.filter(
      (m: ts.Modifier): boolean =>
        m.kind !== ts.SyntaxKind.ExportKeyword &&
        m.kind !== ts.SyntaxKind.DeclareKeyword &&
        m.kind !== ts.SyntaxKind.DefaultKeyword
    );

    const newModifiers: readonly (ts.Decorator | ts.Modifier)[] = [
      ...decorators,
      ts.factory.createModifier(ts.SyntaxKind.ExportKeyword),
      ...keptModifiers,
    ];

    return this.applyModifiersToNode(node, newModifiers);
  }

  private applyModifiersToNode(
    node: ts.Node,
    newModifiers: readonly (ts.Decorator | ts.Modifier)[]
  ): ts.Node {
    const modArray = ts.factory.createNodeArray(newModifiers);

    if (this.isStructDeclaration(node)) {
      const n = node as ts.StructDeclaration;
      return ts.factory.updateStructDeclaration(
        n, modArray, n.name, n.typeParameters, n.heritageClauses, n.members
      );
    }
    if (ts.isClassDeclaration(node)) {
      return ts.factory.updateClassDeclaration(
        node, modArray, node.name, node.typeParameters, node.heritageClauses, node.members
      );
    }
    if (ts.isInterfaceDeclaration(node)) {
      return ts.factory.updateInterfaceDeclaration(
        node, modArray, node.name, node.typeParameters, node.heritageClauses, node.members
      );
    }
    if (ts.isEnumDeclaration(node)) {
      return ts.factory.updateEnumDeclaration(
        node, modArray, node.name, node.members
      );
    }
    if (ts.isTypeAliasDeclaration(node)) {
      return ts.factory.updateTypeAliasDeclaration(
        node, modArray, node.name, node.typeParameters, node.type
      );
    }
    if (ts.isFunctionDeclaration(node)) {
      return ts.factory.updateFunctionDeclaration(
        node, modArray, node.asteriskToken, node.name,
        node.typeParameters, node.parameters, node.type, node.body
      );
    }
    if (ts.isVariableStatement(node)) {
      return ts.factory.updateVariableStatement(node, modArray, node.declarationList);
    }
    if (ts.isModuleDeclaration(node)) {
      return ts.factory.updateModuleDeclaration(node, modArray, node.name, node.body);
    }
    return node;
  }



  // ─── Declaration Processing Utilities ───

  private ensureDeclareKeyword(text: string, node: ts.Node): string {
    const { leading, body } = this.splitLeadingTrivia(text);
    if (/^declare\s/.test(body)) {
      return text;
    }
    return leading + 'declare ' + body;
  }

  private sanitizeDeclarationNode(node: ts.Node): ts.Node {
    if (this.isStructDeclaration(node)) {
      return this.sanitizeStructOrClass(node);
    }
    if (ts.isClassDeclaration(node)) {
      return this.sanitizeStructOrClass(node);
    }
    return node;
  }

  private sanitizeStructOrClass(node: ts.ClassLikeDeclaration): ts.Node {
    const filteredMembers: ts.ClassElement[] = node.members.filter(
      (m: ts.ClassElement): boolean => !this.isAutoGeneratedConstructor(m)
    );
    const filteredHeritage: ts.NodeArray<ts.HeritageClause> | undefined =
      this.filterAutoGeneratedHeritage(node.heritageClauses);
    if (this.isStructDeclaration(node)) {
      return ts.factory.updateStructDeclaration(
        node,
        node.modifiers,
        node.name,
        node.typeParameters,
        filteredHeritage,
        ts.factory.createNodeArray(filteredMembers)
      );
    }
    return ts.factory.updateClassDeclaration(
      node,
      node.modifiers,
      node.name,
      node.typeParameters,
      filteredHeritage,
      ts.factory.createNodeArray(filteredMembers)
    );
  }

  private filterAutoGeneratedHeritage(
    clauses: ts.NodeArray<ts.HeritageClause> | undefined
  ): ts.NodeArray<ts.HeritageClause> | undefined {
    if (!clauses) {
      return clauses;
    }
    const filtered: ts.HeritageClause[] = clauses.filter(
      (clause: ts.HeritageClause): boolean => {
        if (clause.token !== ts.SyntaxKind.ExtendsKeyword) {
          return true;
        }
        return !clause.types.some(
          (t: ts.ExpressionWithTypeArguments): boolean =>
            this.isAutoGeneratedHeritageExpression(t.expression)
        );
      }
    );
    if (filtered.length === clauses.length) {
      return clauses;
    }
    if (filtered.length === 0) {
      return undefined;
    }
    return ts.factory.createNodeArray(filtered);
  }

  private isAutoGeneratedHeritageExpression(expr: ts.Expression): boolean {
    if (ts.isObjectLiteralExpression(expr)) {
      return true;
    }
    if (ts.isIdentifier(expr) && expr.pos === expr.end) {
      return true;
    }
    return false;
  }

  private isAutoGeneratedConstructor(member: ts.ClassElement): boolean {
    if (!ts.isConstructorDeclaration(member)) {
      return false;
    }
    if (member.getStart() === member.getEnd()) {
      return true;
    }
    if ((member as ts.ConstructorDeclaration).virtual === true) {
      return true;
    }
    if (member.parameters.length > 0 &&
      member.parameters.every(
        (p: ts.ParameterDeclaration): boolean => {
          return ts.isIdentifier(p.name) && p.name.text === '' && !!p.questionToken;
        }
      )) {
      return true;
    }
    return false;
  }

  private isStructDeclaration(node: ts.Node): boolean {
    return ts.isStructDeclaration ? ts.isStructDeclaration(node) : false;
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
    return this.applyRenamesWithPlaceholders(text, renames);
  }

  private replaceImportTypeReferences(text: string, node: ts.Node): string {
    const replacements: Array<{ pattern: RegExp; replacement: string }> = [];
    const visit = (n: ts.Node): void => {
      if (ts.isImportTypeNode(n) && n.qualifier && ts.isIdentifier(n.qualifier)) {
        const qualifier = n.qualifier.text;
        const replacement = this.resolveImportTypeText(n, qualifier);
        if (replacement) {
          const pattern = new RegExp(
            `import\\s*\\(\\s*['"][^'"]*['"]\\s*\\)\\s*\\.\\s*${DeclarationMerger.escapeRegExp(qualifier)}`
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
    const resolved = this.resolveToActualDeclaration(qualifierSymbol);
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
    const resolved = this.resolveToActualDeclaration(resolvedSymbol);
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
    const resolved: ts.Symbol | null = this.resolveToActualDeclaration(refSymbol);
    if (!resolved) {
      return;
    }
    const aliasName: string | undefined = this.resolveAliasEmitName(resolved, n.text, localOverrides);
    const emitName: string | undefined = aliasName ?? this.resolveEmitName(resolved, localOverrides);
    if (emitName && emitName !== n.text) {
      if (this.isRightOfNamespaceImport(n, emitName, renames)) {
        return;
      }
      if (this.isRightOfMatchingQualifiedName(n, emitName)) {
        return;
      }
      renames.set(n.text, emitName);
    }
  }

  private isRightOfMatchingQualifiedName(n: ts.Identifier, emitName: string): boolean {
    if (!n.parent || !ts.isQualifiedName(n.parent) || n.parent.right !== n) {
      return false;
    }
    const dotIdx: number = emitName.indexOf('.');
    if (dotIdx < 0) {
      return false;
    }
    const nsPart: string = emitName.substring(0, dotIdx);
    const leftText: string = n.parent.left.getText(n.getSourceFile());
    return leftText === nsPart;
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

    const resolvedLeft: ts.Symbol | null = this.resolveToActualDeclaration(leftSym);
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

  private applyRenamesWithPlaceholders(
    text: string,
    renames: Map<string, string>
  ): string {
    const sortedEntries: [string, string][] = [...renames.entries()].sort(
      (a, b) => b[0].length - a[0].length
    );
    const placeholders: Map<string, string> = new Map();
    let idx: number = 0;
    for (const [oldName, newName] of sortedEntries) {
      const placeholder: string = `\x00${idx}\x00`;
      idx++;
      placeholders.set(placeholder, newName);
      text = text.replace(
        new RegExp(`\\b${DeclarationMerger.escapeRegExp(oldName)}\\b`, 'g'),
        placeholder
      );
    }
    for (const [placeholder, newName] of placeholders) {
      text = text.split(placeholder).join(newName);
    }
    return text;
  }

  private static escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private isNameReferencedInText(name: string, text: string): boolean {
    return new RegExp(`\\b${DeclarationMerger.escapeRegExp(name)}\\b`).test(text);
  }

  private isNamespaceReferencedInText(nsName: string, text: string): boolean {
    return new RegExp(`\\b${DeclarationMerger.escapeRegExp(nsName)}\\.`).test(text);
  }

  private findNamesMatchingPattern(
    names: string[], text: string, requireNamespaceDot: boolean
  ): string[] {
    return names.filter((name: string): boolean =>
      requireNamespaceDot
        ? this.isNamespaceReferencedInText(name, text)
        : this.isNameReferencedInText(name, text)
    );
  }

  // ─── Text Manipulation ───

  private stripExportFromText(text: string, node: ts.Node): string {
    const hasDeclare: boolean = this.nodeHasModifier(node, ts.SyntaxKind.DeclareKeyword);
    const hasDefault: boolean = this.nodeHasModifier(node, ts.SyntaxKind.DefaultKeyword);
    const { leading, body } = this.splitLeadingTrivia(text);
    let stripped: string = body;
    if (hasDefault) {
      stripped = stripped.replace(/^export\s+default\s+/, hasDeclare ? '' : 'declare ');
    } else {
      stripped = stripped.replace(/^export\s+/, hasDeclare ? '' : 'declare ');
    }
    return leading + stripped;
  }

  private stripDefaultKeywordFromText(text: string, node: ts.Node): string {
    if (this.nodeHasModifier(node, ts.SyntaxKind.DefaultKeyword)) {
      const { leading, body } = this.splitLeadingTrivia(text);
      return leading + body.replace(/^export\s+default\s+/, 'export declare ');
    }
    return text;
  }

  private splitLeadingTrivia(text: string): { leading: string; body: string } {
    let pos: number = 0;
    while (pos < text.length) {
      const wsMatch: RegExpMatchArray | null = text.substring(pos).match(/^\s+/);
      if (wsMatch) {
        pos += wsMatch[0].length;
        continue;
      }
      const blockMatch: RegExpMatchArray | null = text.substring(pos).match(/^\/\*[\s\S]*?\*\//);
      if (blockMatch) {
        pos += blockMatch[0].length;
        continue;
      }
      const lineMatch: RegExpMatchArray | null = text.substring(pos).match(/^\/\/.*$/m);
      if (lineMatch) {
        pos += lineMatch[0].length;
        continue;
      }
      break;
    }
    return { leading: text.substring(0, pos), body: text.substring(pos) };
  }

  private nodeHasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
    const decl: ts.Node = this.getDeclarationNode(node);
    if (!ts.canHaveModifiers(decl)) {
      return false;
    }
    const modifiers: readonly ts.ModifierLike[] | undefined = ts.getModifiers(decl);
    if (!modifiers) {
      return false;
    }
    return modifiers.some((m: ts.ModifierLike): boolean => m.kind === kind);
  }

  // ─── Symbol Resolution Utilities ───

  private resolveToActualDeclaration(symbol: ts.Symbol): ts.Symbol | null {
    const visited: Set<ts.Symbol> = new Set();
    let current: ts.Symbol | undefined = symbol;

    while (current && (current.flags & ts.SymbolFlags.Alias)) {
      if (visited.has(current)) {
        break;
      }
      visited.add(current);
      const aliased: ts.Symbol = this.checker.getAliasedSymbol(current);
      if (!aliased || aliased === current) {
        break;
      }
      current = aliased;
    }

    if (!current || !current.declarations || current.declarations.length === 0) {
      return null;
    }

    return current;
  }

  private isTypeParameterSymbol(symbol: ts.Symbol): boolean {
    return (symbol.flags & ts.SymbolFlags.TypeParameter) !== 0;
  }

  private isEnumMemberSymbol(symbol: ts.Symbol): boolean {
    return (symbol.flags & ts.SymbolFlags.EnumMember) !== 0;
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
    const resolved: ts.Symbol | null = this.resolveToActualDeclaration(parentSym);
    return resolved !== null && this.collectedContainerSymbols.has(resolved);
  }

  private isDefaultLibraryDeclaration(decl: ts.Declaration): boolean {
    return this.program.isSourceFileDefaultLibrary(decl.getSourceFile());
  }

  private isSystemApiDeclaration(
    declaration: ts.Node,
    aliasSymbol?: ts.Symbol
  ): { moduleName: string; name: string; statementText: string } | null {
    const modules: string[] | undefined = this.options.systemModules;
    if (!modules || modules.length === 0) {
      return null;
    }
    const sourceFile: ts.SourceFile = declaration.getSourceFile();
    if (!this.isInSdkPath(sourceFile.fileName)) {
      return null;
    }
    if (!aliasSymbol) {
      return null;
    }
    let found: { moduleName: string; statementText: string } | null =
      this.findSystemApiModuleName(aliasSymbol);
    if (!found) {
      found = this.findSystemApiModuleNameViaReexportChain(aliasSymbol);
    }
    if (!found) {
      return null;
    }
    const name: string = this.getLocalNameOfDeclaration(declaration);
    return { moduleName: found.moduleName, name, statementText: found.statementText };
  }

  private findSystemApiModuleName(
    symbol: ts.Symbol
  ): { moduleName: string; statementText: string } | null {
    const visited: Set<ts.Symbol> = new Set();
    let current: ts.Symbol | undefined = symbol;
    while (current && !visited.has(current)) {
      visited.add(current);
      for (const decl of current.declarations ?? []) {
        const specifier: string | null = this.extractModuleSpecifier(decl);
        if (specifier && this.specifierMatchesSystemModule(specifier)) {
          const statementText: string | null = this.extractStatementText(decl);
          if (statementText) {
            return { moduleName: specifier, statementText };
          }
          return { moduleName: specifier, statementText: '' };
        }
      }
      if (!(current.flags & ts.SymbolFlags.Alias)) {
        break;
      }
      const aliased: ts.Symbol = this.checker.getAliasedSymbol(current);
      if (!aliased || aliased === current) {
        break;
      }
      current = aliased;
    }
    return null;
  }

  private seedReexportBfsQueue(
    symbol: ts.Symbol,
    queue: Array<{ declarations: readonly ts.Declaration[]; exportName: string }>,
    visited: Set<string>
  ): { moduleName: string; statementText: string } | null {
    for (const decl of symbol.declarations ?? []) {
      if (!ts.isExportSpecifier(decl)) {
        continue;
      }
      const namedExports: ts.Node = decl.parent;
      if (!ts.isNamedExports(namedExports)) {
        continue;
      }
      const exportDecl: ts.Node = namedExports.parent;
      if (!ts.isExportDeclaration(exportDecl) || !exportDecl.moduleSpecifier ||
        !ts.isStringLiteral(exportDecl.moduleSpecifier)) {
        continue;
      }
      const specifier: string = exportDecl.moduleSpecifier.text;
      const exportName: string = (decl.propertyName ?? decl.name).text;
      if (this.specifierMatchesSystemModule(specifier)) {
        const statementText: string | null = this.extractStatementText(decl);
        return { moduleName: specifier, statementText: statementText ?? '' };
      }
      const moduleSym: ts.Symbol | undefined =
        this.checker.getSymbolAtLocation(exportDecl.moduleSpecifier);
      if (!moduleSym) {
        continue;
      }
      const nextDecls: ts.Declaration[] = this.collectExportDeclarationsFromModule(
        moduleSym, exportName
      );
      if (nextDecls.length > 0) {
        const key: string = specifier + ':' + exportName;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({ declarations: nextDecls, exportName });
        }
      }
    }
    return null;
  }

  private findSystemApiModuleNameViaReexportChain(
    symbol: ts.Symbol
  ): { moduleName: string; statementText: string } | null {
    const visited: Set<string> = new Set();
    const queue: Array<{ declarations: readonly ts.Declaration[]; exportName: string }> = [];

    const seedResult: { moduleName: string; statementText: string } | null =
      this.seedReexportBfsQueue(symbol, queue, visited);
    if (seedResult) {
      return seedResult;
    }

    while (queue.length > 0) {
      const item = queue.shift()!;
      for (const expDecl of item.declarations) {
        const expSpec: string | null = this.extractModuleSpecifier(expDecl);
        if (!expSpec) {
          continue;
        }
        if (this.specifierMatchesSystemModule(expSpec)) {
          const statementText: string | null = this.extractStatementText(expDecl);
          return { moduleName: expSpec, statementText: statementText ?? '' };
        }
        const namedExports: ts.Node = (expDecl as ts.ExportSpecifier).parent;
        if (!ts.isNamedExports(namedExports)) {
          continue;
        }
        const exportDecl: ts.Node = namedExports.parent;
        if (!ts.isExportDeclaration(exportDecl) || !exportDecl.moduleSpecifier ||
          !ts.isStringLiteral(exportDecl.moduleSpecifier)) {
          continue;
        }
        const nextKey: string = expSpec + ':' + item.exportName;
        if (visited.has(nextKey)) {
          continue;
        }
        visited.add(nextKey);
        const moduleSym: ts.Symbol | undefined =
          this.checker.getSymbolAtLocation(exportDecl.moduleSpecifier);
        if (!moduleSym) {
          continue;
        }
        const nextDecls: ts.Declaration[] = this.collectExportDeclarationsFromModule(
          moduleSym, item.exportName
        );
        if (nextDecls.length > 0) {
          queue.push({ declarations: nextDecls, exportName: item.exportName });
        }
      }
    }
    return null;
  }

  private collectExportDeclarationsFromModule(
    moduleSymbol: ts.Symbol,
    exportName: string
  ): ts.Declaration[] {
    const results: ts.Declaration[] = [];
    const moduleExports: ts.Symbol[] = this.checker.getExportsOfModule(moduleSymbol);
    for (const exp of moduleExports) {
      if (exp.name !== exportName) {
        continue;
      }
      for (const decl of exp.declarations ?? []) {
        if (ts.isExportSpecifier(decl)) {
          results.push(decl);
        }
      }
    }
    return results;
  }

  private extractStatementText(decl: ts.Declaration): string | null {
    let current: ts.Node | undefined = decl;
    while (current) {
      if (ts.isImportDeclaration(current) || ts.isExportDeclaration(current)) {
        const text: string = this.printer.printNode(
          ts.EmitHint.Unspecified, current, current.getSourceFile()
        ).trim();
        return text;
      }
      if (ts.isSourceFile(current)) {
        break;
      }
      current = current.parent;
    }
    return null;
  }

  private extractModuleSpecifier(decl: ts.Declaration): string | null {
    if (ts.isExportSpecifier(decl)) {
      return this.extractModuleSpecifierFromExport(decl);
    }
    return this.extractModuleSpecifierFromImport(decl);
  }

  private extractModuleSpecifierFromExport(decl: ts.ExportSpecifier): string | null {
    if (!ts.isNamedExports(decl.parent)) {
      return null;
    }
    const exportDecl: ts.Node = decl.parent.parent;
    if (ts.isExportDeclaration(exportDecl) && exportDecl.moduleSpecifier &&
      ts.isStringLiteral(exportDecl.moduleSpecifier)) {
      return exportDecl.moduleSpecifier.text;
    }
    return null;
  }

  private extractModuleSpecifierFromImport(decl: ts.Declaration): string | null {
    const importDecl: ts.ImportDeclaration | null = this.findAncestorImportDeclaration(decl);
    if (importDecl && importDecl.moduleSpecifier && ts.isStringLiteral(importDecl.moduleSpecifier)) {
      return importDecl.moduleSpecifier.text;
    }
    return null;
  }

  private findAncestorImportDeclaration(node: ts.Node): ts.ImportDeclaration | null {
    let current: ts.Node | undefined = node;
    while (current) {
      if (ts.isImportDeclaration(current)) {
        return current;
      }
      if (ts.isSourceFile(current)) {
        break;
      }
      current = current.parent;
    }
    return null;
  }

  private specifierMatchesSystemModule(specifier: string): boolean {
    const modules: string[] | undefined = this.options.systemModules;
    if (!modules) {
      return false;
    }
    for (const mod of modules) {
      const moduleName: string = mod.replace(/\.d\.(ets|ts)$/, '');
      if (moduleName === specifier) {
        return true;
      }
    }
    return false;
  }

  private isInSdkPath(fileName: string): boolean {
    const sdkPath: string | undefined = projectConfig?.sdkPath;
    if (!sdkPath) {
      return true;
    }
    const resolved: string = path.resolve(fileName);
    const normalizedSdk: string = path.resolve(sdkPath);
    return resolved.startsWith(normalizedSdk + path.sep) || resolved.startsWith(normalizedSdk + '/');
  }

  private isExternalModuleSpecifier(specifier: string): boolean {
    return !specifier.startsWith('.') && !specifier.startsWith('/');
  }

  private findLocalImportForExport(
    exportName: string,
    resolvedSymbol: ts.Symbol
  ): { moduleName: string; statementText: string } | null {
    if (!this.entrySourceFile) {
      return null;
    }
    let result: { moduleName: string; statementText: string } | null = null;
    ts.forEachChild(this.entrySourceFile, (node: ts.Node): void => {
      if (result) {
        return;
      }
      if (!ts.isImportDeclaration(node)) {
        return;
      }
      if (!node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) {
        return;
      }
      if (!node.importClause) {
        return;
      }
      if (this.importClauseMatchesExport(node.importClause, exportName, resolvedSymbol)) {
        const moduleName: string = node.moduleSpecifier.text;
        const statementText: string = this.printer.printNode(
          ts.EmitHint.Unspecified, node, this.entrySourceFile!
        ).trim();
        result = { moduleName, statementText };
      }
    });
    return result;
  }

  private findImportInModule(
    moduleSymbol: ts.Symbol,
    memberName: string,
    targetSymbol: ts.Symbol
  ): { moduleName: string; statementText: string } | null {
    const sourceFile: ts.Node | undefined = moduleSymbol.declarations?.[0];
    if (!sourceFile || !ts.isSourceFile(sourceFile)) {
      return null;
    }
    let result: { moduleName: string; statementText: string } | null = null;
    ts.forEachChild(sourceFile, (node: ts.Node): void => {
      if (result || !ts.isImportDeclaration(node)) {
        return;
      }
      if (!node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) {
        return;
      }
      if (!node.importClause) {
        return;
      }
      if (this.importClauseMatchesExport(node.importClause, memberName, targetSymbol)) {
        result = {
          moduleName: node.moduleSpecifier.text,
          statementText: this.printer.printNode(
            ts.EmitHint.Unspecified, node, sourceFile
          ).trim(),
        };
      }
    });
    return result;
  }

  private findReexportForSymbol(memberSymbol: ts.Symbol): string | null {
    for (const decl of memberSymbol.declarations ?? []) {
      if (!ts.isExportSpecifier(decl)) {
        continue;
      }
      const spec: string | null = this.extractModuleSpecifierFromExport(decl);
      if (!spec || !this.isExternalModuleSpecifier(spec)) {
        continue;
      }
      const stmtText: string | null = this.extractStatementText(decl);
      if (!stmtText) {
        continue;
      }
      return stmtText.replace(/^export\s+/, 'import ');
    }
    return null;
  }

  private importClauseMatchesExport(
    importClause: ts.ImportClause,
    exportName: string,
    resolvedSymbol: ts.Symbol
  ): boolean {
    if (importClause.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
      for (const spec of importClause.namedBindings.elements) {
        if (spec.name.text !== exportName) {
          continue;
        }
        const specSymbol: ts.Symbol | undefined = this.checker.getSymbolAtLocation(spec.name);
        if (!specSymbol) {
          continue;
        }
        const specResolved: ts.Symbol | null = this.resolveToActualDeclaration(specSymbol);
        if (specResolved === resolvedSymbol) {
          return true;
        }
      }
    }
    if (importClause.name && importClause.name.text === exportName) {
      const nameSymbol: ts.Symbol | undefined = this.checker.getSymbolAtLocation(importClause.name);
      if (nameSymbol) {
        const nameResolved: ts.Symbol | null = this.resolveToActualDeclaration(nameSymbol);
        if (nameResolved === resolvedSymbol) {
          return true;
        }
      }
    }
    if (importClause.namedBindings && ts.isNamespaceImport(importClause.namedBindings) &&
      importClause.namedBindings.name.text === exportName) {
      const nsSymbol: ts.Symbol | undefined = this.checker.getSymbolAtLocation(importClause.namedBindings.name);
      if (nsSymbol) {
        const nsResolved: ts.Symbol | null = this.resolveToActualDeclaration(nsSymbol);
        if (nsResolved === resolvedSymbol) {
          return true;
        }
      }
    }
    return false;
  }

  private getLocalNameOfDeclaration(declaration: ts.Node): string {
    const named = declaration as ts.Node & { name?: ts.Node };
    if (named.name && ts.isIdentifier(named.name)) {
      return named.name.text;
    }
    return 'default';
  }

  private getDeclarationNode(node: ts.Node): ts.Node {
    if (ts.isVariableDeclaration(node)) {
      return this.findAncestorByKind(node, ts.SyntaxKind.VariableStatement) ?? node;
    }
    return node;
  }

  private findAncestorByKind(node: ts.Node, kind: ts.SyntaxKind): ts.Node | null {
    let current: ts.Node | undefined = node.parent;
    while (current) {
      if (current.kind === kind) {
        return current;
      }
      if (ts.isSourceFile(current)) {
        break;
      }
      current = current.parent;
    }
    return null;
  }

  // ─── Validation ───

  private validateOutput(content: string, entryFile: string): void {
    if (!content || content.trim().length === 0) {
      return;
    }
    try {
      const isDets: boolean = entryFile.endsWith('.d.ets');
      const scriptKind: ts.ScriptKind = isDets
        ? (ts.ScriptKind as unknown as Record<string, number>).ETS ?? ts.ScriptKind.TS
        : ts.ScriptKind.TS;
      const sf: ts.SourceFile = ts.createSourceFile(
        entryFile,
        content,
        ts.ScriptTarget.Latest,
        true,
        scriptKind
      );
      if (sf.parseDiagnostics && sf.parseDiagnostics.length > 0) {
        const errors: string = sf.parseDiagnostics
          .map((d: ts.Diagnostic): string => {
            const msg: string = typeof d.messageText === 'string'
              ? d.messageText
              : (d.messageText as ts.DiagnosticMessageChain).messageText;
            return `line ${d.line + 1}: ${msg}`;
          })
          .join('; ');
        logger.debug(
          `Declaration merge output has parse errors in ${entryFile}: ${errors}`
        );
      }
    } catch (e) {
      const errMsg: string = e instanceof Error ? e.message : String(e);
      logger.debug(`Declaration merge output validation failed for ${entryFile}: ${errMsg}`);
    }
  }

  private sortImportLinesFirst(lines: string[]): string[] {
    const importLines: string[] = [];
    const declarationLines: string[] = [];
    for (const line of lines) {
      if (line.startsWith('import ')) {
        importLines.push(line);
      } else {
        declarationLines.push(line);
      }
    }
    return [...importLines, ...declarationLines];
  }

  // ─── Cleanup ───

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
