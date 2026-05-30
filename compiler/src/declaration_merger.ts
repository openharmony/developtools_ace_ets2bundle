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

function buildSourceToDeclMap(): Map<string, string> {
  const sourceToDecl: Map<string, string> = new Map();
  harFilesRecord.forEach((value: GeneratedFileInHar): void => {
    if (value.originalDeclarationCachePath) {
      sourceToDecl.set(toUnixPath(value.sourcePath), toUnixPath(value.originalDeclarationCachePath));
    }
  });
  return sourceToDecl;
}

function buildDeclToSourceMap(): Map<string, string> {
  const declToSource: Map<string, string> = new Map();
  harFilesRecord.forEach((value: GeneratedFileInHar): void => {
    if (value.originalDeclarationCachePath) {
      declToSource.set(toUnixPath(value.originalDeclarationCachePath), toUnixPath(value.sourcePath));
    }
  });
  return declToSource;
}

function createDeclarationModuleResolver(
  projectPath: string
): (moduleNames: string[], containingFile: string) => (ts.ResolvedModuleFull | null)[] {
  const sourceToDecl: Map<string, string> = buildSourceToDeclMap();
  const declToSource: Map<string, string> = buildDeclToSourceMap();

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

enum EntityType {
  InlineDeclaration,
  SystemApiImport,
  SystemApiReexport,
  NamespaceExport,
}

interface CollectorEntity {
  type: EntityType;
  symbol: ts.Symbol;
  declarations: ts.Declaration[];
  preferredName: string;
  nameForEmit: string;
  exportNames: string[];
  isDefaultExport: boolean;
  hasExportModifier: boolean;
  systemApiInfo?: { moduleName: string; name: string };
  isDefaultSystemApi?: boolean;
  namespaceName?: string;
  stripExport: boolean;
}

class NameResolver {
  private entities: CollectorEntity[] = [];
  private symbolToEntity: Map<ts.Symbol, CollectorEntity> = new Map();
  private usedNames: Set<string> = new Set();
  private nameToEntity: Map<string, CollectorEntity> = new Map();

  register(entity: CollectorEntity): CollectorEntity | null {
    const existing: CollectorEntity | undefined = this.symbolToEntity.get(entity.symbol);
    if (!existing) {
      this.entities.push(entity);
      this.symbolToEntity.set(entity.symbol, entity);
      return null;
    }
    this.mergeExportNames(existing, entity.exportNames);
    if (entity.isDefaultExport) {
      existing.isDefaultExport = true;
    }
    this.mergeDeclarations(existing, entity.declarations);
    return existing;
  }

  private mergeExportNames(target: CollectorEntity, names: string[]): void {
    if (names.length === 0) {
      return;
    }
    for (const name of names) {
      if (!target.exportNames.includes(name)) {
        target.exportNames.push(name);
      }
    }
  }

  private mergeDeclarations(target: CollectorEntity, decls: ts.Declaration[]): void {
    for (const decl of decls) {
      if (!target.declarations.includes(decl)) {
        target.declarations.push(decl);
      }
    }
  }

  getEntity(symbol: ts.Symbol): CollectorEntity | undefined {
    return this.symbolToEntity.get(symbol);
  }

  hasEntity(symbol: ts.Symbol): boolean {
    return this.symbolToEntity.has(symbol);
  }

  getEntities(): CollectorEntity[] {
    return this.entities;
  }

  private static isMergeableDeclaration(decl: ts.Declaration): boolean {
    return ts.isModuleDeclaration(decl) || ts.isInterfaceDeclaration(decl);
  }

  resolveAll(): void {
    this.resolveNamespaceExports();
    this.resolveSystemApiEntities();
    this.resolveExportedDeclarations();
    this.resolveNamespaceMembers();
    this.resolveRemainingDeclarations();
  }

  private resolveNamespaceExports(): void {
    for (const entity of this.entities) {
      if (entity.type === EntityType.NamespaceExport) {
        entity.nameForEmit = entity.preferredName;
        this.usedNames.add(entity.nameForEmit);
      }
    }
  }

  private resolveSystemApiEntities(): void {
    for (const entity of this.entities) {
      if (entity.type === EntityType.SystemApiImport || entity.type === EntityType.SystemApiReexport) {
        entity.nameForEmit = entity.preferredName;
      }
    }
  }

  private resolveExportedDeclarations(): void {
    for (const entity of this.entities) {
      if (entity.type !== EntityType.InlineDeclaration) {
        continue;
      }
      if (entity.exportNames.length === 0 && !entity.isDefaultExport) {
        continue;
      }
      const ideal: string = (entity.exportNames.length === 1 && entity.exportNames[0] !== 'default')
        ? entity.exportNames[0]
        : entity.preferredName;
      entity.nameForEmit = ideal;
      this.usedNames.add(ideal);
      this.nameToEntity.set(ideal, entity);
    }
  }

  private resolveNamespaceMembers(): void {
    for (const entity of this.entities) {
      if (entity.type !== EntityType.InlineDeclaration) {
        continue;
      }
      if (!entity.namespaceName) {
        continue;
      }
      if (entity.exportNames.length > 0) {
        continue;
      }
      entity.nameForEmit = entity.preferredName;
      this.usedNames.add(entity.nameForEmit);
    }
  }

  private resolveRemainingDeclarations(): void {
    for (const entity of this.entities) {
      if (entity.type !== EntityType.InlineDeclaration) {
        continue;
      }
      if (entity.exportNames.length > 0 || entity.isDefaultExport) {
        continue;
      }
      if (entity.namespaceName) {
        continue;
      }
      this.resolveRemainingEntity(entity);
    }
  }

  private resolveRemainingEntity(entity: CollectorEntity): void {
    const ideal: string = entity.preferredName;
    if (!this.usedNames.has(ideal)) {
      entity.nameForEmit = ideal;
      this.usedNames.add(ideal);
      this.nameToEntity.set(ideal, entity);
      return;
    }
    const existingEntity: CollectorEntity | undefined = this.nameToEntity.get(ideal);
    if (existingEntity && this.canMergeEntities(existingEntity, entity)) {
      for (const decl of entity.declarations) {
        if (!existingEntity.declarations.includes(decl)) {
          existingEntity.declarations.push(decl);
        }
      }
      this.mergeExportNames(existingEntity, entity.exportNames);
      entity.nameForEmit = '';
    } else {
      entity.nameForEmit = this.findUniqueName(ideal);
    }
  }

  private isEnumEntity(entity: CollectorEntity): boolean {
    return entity.declarations.length > 0 && entity.declarations.some(ts.isEnumDeclaration);
  }

  private canMergeEntities(existing: CollectorEntity, current: CollectorEntity): boolean {
    if (this.isEnumEntity(existing) && this.isEnumEntity(current)) {
      return true;
    }
    const isMergeable = (e: CollectorEntity): boolean => {
      return e.declarations.length > 0 && e.declarations.some(
        (d: ts.Declaration): boolean => ts.isModuleDeclaration(d) || ts.isInterfaceDeclaration(d)
      );
    };
    if (isMergeable(existing) && isMergeable(current)) {
      return true;
    }
    if (current.stripExport && this.areFirstDeclarationsTextuallyIdentical(existing, current)) {
      return true;
    }
    return false;
  }

  private areFirstDeclarationsTextuallyIdentical(
    a: CollectorEntity,
    b: CollectorEntity
  ): boolean {
    if (a.declarations.length === 0 || b.declarations.length === 0) {
      return false;
    }
    const normalize = (text: string): string =>
      text.replace(/^export\s+/, '').replace(/^declare\s+/, '').trim();
    const textA: string = normalize(
      a.declarations[0].getText(a.declarations[0].getSourceFile())
    );
    const textB: string = normalize(
      b.declarations[0].getText(b.declarations[0].getSourceFile())
    );
    return textA === textB;
  }

  private findUniqueName(base: string): string {
    let suffix: number = 1;
    let candidate: string = `${base}_${suffix}`;
    while (this.usedNames.has(candidate)) {
      suffix++;
      candidate = `${base}_${suffix}`;
    }
    this.usedNames.add(candidate);
    return candidate;
  }

  getNameForSymbol(symbol: ts.Symbol): string | undefined {
    return this.symbolToEntity.get(symbol)?.nameForEmit;
  }
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
  private entryExportSymbols: Set<ts.Symbol> = new Set();

  private nameResolver: NameResolver = new NameResolver();

  private dissolvedNamespaceNames: Set<string> = new Set();

  private printer: ts.Printer;

  private constructor(options: DeclarationMergeOptions, rootFiles: string[]) {
    this.options = options;
    this.program = this.createDeclarationProgram(rootFiles);
    this.checker = this.program.getTypeChecker();
    this.printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  }

  private mergeEntry(entryFile: string): void {
    this.nameResolver = new NameResolver();
    this.entryExportSymbols = new Set();
    this.entrySourceFile = this.program.getSourceFile(entryFile);
    if (!this.entrySourceFile) {
      logger.debug(`Declaration entry file not found in program: ${entryFile}`);
      return;
    }

    const mergedContent: string = this.generateMergedContent();
    this.validateOutput(mergedContent, entryFile);
    harFilesRecord.forEach((value: GeneratedFileInHar): void => {
      if (value.originalDeclarationCachePath === entryFile) {
        value.originalDeclarationContent = mergedContent;
      }
    });
    if (!this.options.isByteCodeHar) {
      fs.writeFileSync(entryFile, mergedContent);
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

  private generateMergedContent(): string {
    if (!this.entrySourceFile) {
      return '';
    }

    const entrySymbol: ts.Symbol | undefined =
      this.checker.getSymbolAtLocation(this.entrySourceFile);
    if (!entrySymbol) {
      return '';
    }

    for (const exportSymbol of this.checker.getExportsOfModule(entrySymbol)) {
      const resolved = this.resolveToActualDeclaration(exportSymbol);
      if (resolved) {
        this.entryExportSymbols.add(resolved);
      }
    }

    this.collectEntities();

    this.nameResolver.resolveAll();

    return this.emitEntities();
  }

  private entryFileHasExplicitDefaultExport(): boolean {
    if (!this.entrySourceFile) {
      return false;
    }
    let found = false;
    const check = (node: ts.Node): void => {
      if (found) return;
      if (ts.isExportAssignment(node)) {
        found = true;
        return;
      }
      if (ts.isExportDeclaration(node) && node.exportClause) {
        if (ts.isNamespaceExport(node.exportClause)) {
          return;
        }
        for (const element of node.exportClause.elements) {
          if (element.name.text === 'default') {
            found = true;
            return;
          }
        }
      }
    };
    ts.forEachChild(this.entrySourceFile, check);
    return found;
  }

  private collectEntities(): void {
    const entrySymbol: ts.Symbol | undefined =
      this.checker.getSymbolAtLocation(this.entrySourceFile!);
    if (!entrySymbol) {
      return;
    }

    const hasExplicitDefault = this.entryFileHasExplicitDefaultExport();
    const visited: Set<ts.Symbol> = new Set();
    for (const exportSymbol of this.checker.getExportsOfModule(entrySymbol)) {
      if (exportSymbol.name === 'default' && !hasExplicitDefault) {
        continue;
      }
      this.collectExportEntity(exportSymbol, visited, undefined);
    }

    this.collectShadowedStarExports(visited);
  }

  private collectShadowedStarExports(visited: Set<ts.Symbol>): void {
    if (!this.entrySourceFile) {
      return;
    }
    const entrySymbol: ts.Symbol | undefined =
      this.checker.getSymbolAtLocation(this.entrySourceFile);
    const exportedNames: Set<string> = new Set();
    if (entrySymbol) {
      for (const exportSymbol of this.checker.getExportsOfModule(entrySymbol)) {
        exportedNames.add(exportSymbol.name);
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
        if (memberSymbol.name === 'default') {
          continue;
        }
        if (exportedNames.has(memberSymbol.name)) {
          continue;
        }
        const resolved = this.resolveToActualDeclaration(memberSymbol);
        if (!resolved || !resolved.declarations || resolved.declarations.length === 0) {
          continue;
        }
        if (this.nameResolver.hasEntity(resolved)) {
          continue;
        }

        const memberDecl: ts.Declaration = resolved.declarations[0];
        if (ts.isSourceFile(memberDecl)) {
          continue;
        }
        if (this.isSystemApiDeclaration(memberDecl)) {
          continue;
        }
        if (this.isDefaultLibraryDeclaration(memberDecl)) {
          continue;
        }

        this.collectDeclarationEntity(
          resolved, resolved.declarations, memberSymbol.name, false, visited, undefined
        );
      }
    });
  }

  private collectExportEntity(
    exportSymbol: ts.Symbol,
    visited: Set<ts.Symbol>,
    namespaceName: string | undefined
  ): void {
    const resolved = this.resolveToActualDeclaration(exportSymbol);
    if (!resolved) {
      return;
    }

    const isDefault: boolean = exportSymbol.name === 'default';
    const exportedName: string = exportSymbol.name;

    const firstDecl: ts.Declaration = resolved.declarations[0];

    if (ts.isSourceFile(firstDecl)) {
      this.collectNamespaceReexport(exportSymbol, resolved, visited);
      return;
    }

    const sysApiDecl = this.isSystemApiDeclaration(firstDecl);
    if (sysApiDecl) {
      this.collectSystemApiEntity(resolved, firstDecl, exportedName, sysApiDecl, exportSymbol);
      return;
    }

    this.collectDeclarationEntity(
      resolved, resolved.declarations, exportedName, isDefault, visited, namespaceName
    );
  }

  private collectDeclarationEntity(
    resolved: ts.Symbol,
    declarations: ts.Declaration[],
    exportedName: string,
    isDefault: boolean,
    visited: Set<ts.Symbol>,
    namespaceName: string | undefined
  ): void {
    const firstDecl: ts.Declaration = declarations[0];
    const declName: string = this.getLocalNameOfDeclaration(firstDecl);
    const hasExportModifier: boolean = declarations.some(
      (d: ts.Declaration): boolean => this.nodeHasExportModifier(d)
    );

    const entity: CollectorEntity = {
      type: EntityType.InlineDeclaration,
      symbol: resolved,
      declarations: [...declarations],
      preferredName: declName,
      nameForEmit: '',
      exportNames: isDefault ? [] : (exportedName ? [exportedName] : []),
      isDefaultExport: isDefault,
      hasExportModifier,
      stripExport: false,
      namespaceName,
    };

    const merged: CollectorEntity | null = this.nameResolver.register(entity);
    const target: CollectorEntity = merged ?? entity;

    if (!visited.has(resolved)) {
      visited.add(resolved);
      for (const decl of target.declarations) {
        this.collectTypeDeps(decl, visited);
      }
    }

    if (namespaceName && merged) {
      if (!target.namespaceName) {
        target.namespaceName = namespaceName;
      }
    }
  }

  private collectNamespaceReexport(
    exportSymbol: ts.Symbol,
    resolvedSymbol: ts.Symbol,
    visited: Set<ts.Symbol>
  ): void {
    const namespaceName: string = exportSymbol.name;
    let moduleSymbol: ts.Symbol | undefined;

    const originalDecl: ts.Declaration | undefined = exportSymbol.declarations?.[0];
    if (originalDecl && ts.isNamespaceExport(originalDecl)) {
      const exportDecl: ts.Node = originalDecl.parent;
      if (ts.isExportDeclaration(exportDecl) && exportDecl.moduleSpecifier &&
        ts.isStringLiteral(exportDecl.moduleSpecifier)) {
        moduleSymbol = this.checker.getSymbolAtLocation(exportDecl.moduleSpecifier);
      }
    }

    if (!moduleSymbol) {
      moduleSymbol = resolvedSymbol;
    }

    const moduleExports: ts.Symbol[] = this.checker.getExportsOfModule(moduleSymbol);
    if (moduleExports.length === 0) {
      return;
    }

    const moduleDecl: ts.SourceFile | undefined =
      moduleSymbol.declarations?.[0] && ts.isSourceFile(moduleSymbol.declarations[0])
        ? moduleSymbol.declarations[0]
        : undefined;

    const nsEntity: CollectorEntity = {
      type: EntityType.NamespaceExport,
      symbol: exportSymbol,
      declarations: [],
      preferredName: namespaceName,
      nameForEmit: '',
      exportNames: [namespaceName],
      isDefaultExport: false,
      hasExportModifier: false,
      namespaceName,
      stripExport: false,
    };
    this.nameResolver.register(nsEntity);
    this.dissolvedNamespaceNames.add(namespaceName);

    for (const memberSymbol of moduleExports) {
      const resolved = this.resolveToActualDeclaration(memberSymbol);
      if (!resolved || !resolved.declarations || resolved.declarations.length === 0) {
        continue;
      }

      const memberDecl: ts.Declaration = resolved.declarations[0];
      if (ts.isSourceFile(memberDecl)) {
        if (memberDecl === moduleDecl) {
          continue;
        }
        this.collectNamespaceReexport(memberSymbol, resolved, visited);
        continue;
      }
      const sysApiDecl = this.isSystemApiDeclaration(memberDecl);
      if (sysApiDecl) {
        continue;
      }

      this.collectDeclarationEntity(
        resolved, resolved.declarations, memberSymbol.name, false, visited, namespaceName
      );
    }
  }

  private collectSystemApiEntity(
    resolved: ts.Symbol,
    declaration: ts.Declaration,
    exportedName: string,
    sysApiDecl: { moduleName: string; name: string },
    exportSymbol: ts.Symbol,
    isTypeDep: boolean = false
  ): void {
    const isDefaultSysApi: boolean = this.isDefaultExportOfModule(exportSymbol);
    const isReexport: boolean = !isTypeDep && !isDefaultSysApi && exportedName === sysApiDecl.name;

    const entity: CollectorEntity = {
      type: isReexport ? EntityType.SystemApiReexport : EntityType.SystemApiImport,
      symbol: resolved,
      declarations: [declaration],
      preferredName: sysApiDecl.name,
      nameForEmit: '',
      exportNames: isReexport ? [exportedName] : [],
      isDefaultExport: isDefaultSysApi,
      hasExportModifier: false,
      systemApiInfo: sysApiDecl,
      isDefaultSystemApi: isDefaultSysApi,
      stripExport: false,
    };
    this.nameResolver.register(entity);
  }

  private static readonly MAX_TYPE_DEPTH: number = 50;

  private collectTypeDeps(
    declaration: ts.Declaration,
    visited: Set<ts.Symbol>,
    depth: number = 0
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
      }
      ts.forEachChild(node, visit);
    };

    ts.forEachChild(declaration, visit);
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
      const rightResolved = this.tryResolveQualifiedNameMember(name);
      if (rightResolved) {
        this.collectResolvedTypeReference(
          rightResolved, name.right.text, visited, depth
        );
      } else {
        this.collectEntityNameIdentifiers(name.right, visited, depth);
      }
    }
  }

  private tryResolveQualifiedNameMember(qname: ts.QualifiedName): ts.Symbol | null {
    const rightSym: ts.Symbol | undefined = this.checker.getSymbolAtLocation(qname.right);
    if (rightSym && rightSym.declarations && rightSym.declarations.length > 0) {
      return null;
    }
    const leftSym: ts.Symbol | undefined = this.checker.getSymbolAtLocation(qname.left);
    if (!leftSym) {
      return null;
    }
    const resolvedLeft: ts.Symbol | null = this.resolveToActualDeclaration(leftSym);
    if (resolvedLeft) {
      return this.resolveMemberFromModule(resolvedLeft, qname.right.text);
    }
    return this.tryResolveViaDissolvedNamespace(qname);
  }

  private tryResolveViaDissolvedNamespace(qname: ts.QualifiedName): ts.Symbol | null {
    if (!ts.isIdentifier(qname.left) || !this.dissolvedNamespaceNames.has(qname.left.text)) {
      return null;
    }
    const nsExportSymbol: ts.Symbol | undefined = this.findNamespaceExportSymbol(qname.left.text);
    if (!nsExportSymbol) {
      return null;
    }
    const resolvedNs: ts.Symbol | null = this.resolveToActualDeclaration(nsExportSymbol);
    if (!resolvedNs) {
      return null;
    }
    return this.resolveMemberFromModule(resolvedNs, qname.right.text);
  }

  private resolveMemberFromModule(
    moduleSymbol: ts.Symbol,
    memberName: string
  ): ts.Symbol | null {
    const moduleExports: ts.Symbol[] = this.checker.getExportsOfModule(moduleSymbol);
    for (const exp of moduleExports) {
      if (exp.name === memberName) {
        return this.resolveToActualDeclaration(exp);
      }
    }
    return null;
  }

  private findNamespaceExportSymbol(nsName: string): ts.Symbol | undefined {
    if (!this.entrySourceFile) {
      return undefined;
    }
    const entrySymbol: ts.Symbol | undefined = this.checker.getSymbolAtLocation(this.entrySourceFile);
    if (!entrySymbol) {
      return undefined;
    }
    for (const exp of this.checker.getExportsOfModule(entrySymbol)) {
      if (exp.name === nsName) {
        return exp;
      }
    }
    return undefined;
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
    const rightText: string = pae.name.text;
    const moduleExports: ts.Symbol[] = this.checker.getExportsOfModule(resolvedLeft);
    for (const exp of moduleExports) {
      if (exp.name === rightText) {
        const rightResolved: ts.Symbol | null = this.resolveToActualDeclaration(exp);
        if (rightResolved && rightResolved.declarations && rightResolved.declarations.length > 0) {
          this.collectResolvedTypeReference(rightResolved, rightText, visited, depth);
        }
        return;
      }
    }
  }

  private collectResolvedTypeReference(
    resolved: ts.Symbol,
    localName: string,
    visited: Set<ts.Symbol>,
    depth: number
  ): void {
    if (!resolved.declarations || resolved.declarations.length === 0) {
      return;
    }
    if (this.isTypeParameterSymbol(resolved)) {
      return;
    }
    if (this.entryExportSymbols.has(resolved)) {
      return;
    }

    const refDecl: ts.Declaration = resolved.declarations[0];
    if (this.isDefaultLibraryDeclaration(refDecl)) {
      return;
    }

    if (ts.isSourceFile(refDecl)) {
      this.dissolvedNamespaceNames.add(localName);
      return;
    }

    if (visited.has(resolved)) {
      return;
    }
    visited.add(resolved);

    const sysApiDecl = this.isSystemApiDeclaration(refDecl);
    if (sysApiDecl) {
      this.collectSystemApiEntity(resolved, refDecl, localName, sysApiDecl, resolved, true);
      return;
    }

    const entity: CollectorEntity = {
      type: EntityType.InlineDeclaration,
      symbol: resolved,
      declarations: [...resolved.declarations],
      preferredName: localName,
      nameForEmit: '',
      exportNames: [],
      isDefaultExport: false,
      hasExportModifier: resolved.declarations.some(
        (d: ts.Declaration): boolean => this.nodeHasExportModifier(d)
      ),
      stripExport: true,
    };
    this.nameResolver.register(entity);

    for (const decl of resolved.declarations) {
      this.collectTypeDeps(decl, visited, depth + 1);
    }
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
    if (this.entryExportSymbols.has(resolved)) {
      return;
    }

    const refDecl: ts.Declaration = resolved.declarations[0];
    if (this.isDefaultLibraryDeclaration(refDecl)) {
      return;
    }

    if (ts.isSourceFile(refDecl)) {
      this.dissolvedNamespaceNames.add(identifier.text);
      return;
    }

    if (visited.has(resolved)) {
      return;
    }
    visited.add(resolved);

    const sysApiDecl = this.isSystemApiDeclaration(refDecl);
    if (sysApiDecl) {
      this.collectSystemApiEntity(resolved, refDecl, identifier.text, sysApiDecl, refSymbol, true);
      return;
    }

    const localName: string = identifier.text;

    const entity: CollectorEntity = {
      type: EntityType.InlineDeclaration,
      symbol: resolved,
      declarations: [...resolved.declarations],
      preferredName: localName,
      nameForEmit: '',
      exportNames: [],
      isDefaultExport: false,
      hasExportModifier: resolved.declarations.some(
        (d: ts.Declaration): boolean => this.nodeHasExportModifier(d)
      ),
      stripExport: true,
    };
    this.nameResolver.register(entity);

    for (const decl of resolved.declarations) {
      this.collectTypeDeps(decl, visited, depth + 1);
    }
  }

  private emitEntities(): string {
    const lines: string[] = [];
    const emittedStatements: Set<string> = new Set();
    const exportNames: string[] = [];
    const exportNameSet: Set<string> = new Set();
    const namespaceMembers: Map<string, string[]> = new Map();
    const emittedDeclarationTexts: Set<string> = new Set();

    for (const entity of this.nameResolver.getEntities()) {
      if (entity.type === EntityType.SystemApiImport) {
        this.emitSystemApiImport(entity, lines, emittedStatements);
        continue;
      }
      if (entity.type === EntityType.SystemApiReexport) {
        this.emitSystemApiReexport(entity, lines, emittedStatements);
        continue;
      }
      if (entity.type === EntityType.NamespaceExport || !entity.nameForEmit) {
        continue;
      }

      const text: string = this.emitDeclarationEntity(entity);
      if (!text) {
        continue;
      }

      const normalized: string = text.replace(/^export\s+/gm, '').replace(/^declare\s+/gm, '');
      if (emittedDeclarationTexts.has(normalized)) {
        continue;
      }
      emittedDeclarationTexts.add(normalized);

      lines.push(text);

      if (entity.isDefaultExport) {
        lines.push(`export default ${entity.nameForEmit};`);
      }

      this.collectNamespaceMember(entity, namespaceMembers);
      this.collectExportNames(entity, exportNames, exportNameSet);
    }

    this.emitNamespaceBlocks(namespaceMembers, lines, exportNames, exportNameSet);

    if (exportNames.length > 0) {
      const exportLine: string = `export { ${exportNames.join(', ')} };`;
      lines.push(exportLine);
    }

    let result: string = this.sortImportLinesFirst(lines).join('\n\n');
    result = this.stripDissolvedNamespacePrefixes(result);
    if (result.trim().length === 0) {
      return 'export {}';
    }
    return result;
  }

  private collectNamespaceMember(
    entity: CollectorEntity,
    namespaceMembers: Map<string, string[]>
  ): void {
    if (!entity.namespaceName) {
      return;
    }
    const ns: string = entity.namespaceName;
    if (!namespaceMembers.has(ns)) {
      namespaceMembers.set(ns, []);
    }
    const members: string[] = namespaceMembers.get(ns)!;
    if (!members.includes(entity.nameForEmit)) {
      members.push(entity.nameForEmit);
    }
    for (const expName of entity.exportNames) {
      if (expName === entity.nameForEmit || expName === 'default') {
        continue;
      }
      const alias: string = `${entity.nameForEmit} as ${expName}`;
      if (!members.includes(alias)) {
        members.push(alias);
      }
    }
  }

  private collectExportNames(
    entity: CollectorEntity,
    exportNames: string[],
    exportNameSet: Set<string>
  ): void {
    if (entity.isDefaultExport) {
      return;
    }
    if (!(entity.hasExportModifier && !entity.namespaceName) &&
      (entity.exportNames.length > 0 || entity.namespaceName)) {
      if (!exportNameSet.has(entity.nameForEmit)) {
        exportNames.push(entity.nameForEmit);
        exportNameSet.add(entity.nameForEmit);
      }
    }

    for (const expName of entity.exportNames) {
      if (expName === entity.nameForEmit || expName === 'default') {
        continue;
      }
      if (!exportNameSet.has(expName)) {
        exportNames.push(`${entity.nameForEmit} as ${expName}`);
        exportNameSet.add(expName);
      }
    }
  }

  private emitNamespaceBlocks(
    namespaceMembers: Map<string, string[]>,
    lines: string[],
    exportNames: string[],
    exportNameSet: Set<string>
  ): void {
    for (const [nsName, members] of namespaceMembers) {
      lines.push(`declare namespace ${nsName} {\nexport {\n${members.join(',\n')}\n}\n}`);
      if (!exportNameSet.has(nsName)) {
        exportNames.push(nsName);
        exportNameSet.add(nsName);
      }
    }
  }

  private emitDeclarationEntity(entity: CollectorEntity): string {
    if (entity.declarations.length === 0) {
      return '';
    }

    const mergedEnum: string | null = this.tryMergeEnumDeclarations(entity);
    if (mergedEnum !== null) {
      return mergedEnum;
    }

    const parts: string[] = [];
    const emittedNormalizedTexts: Set<string> = new Set();
    for (const declaration of entity.declarations) {
      const sourceFile: ts.SourceFile = declaration.getSourceFile();
      const printNode: ts.Node = this.getDeclarationNode(declaration);

      let sanitizedNode: ts.Node = this.sanitizeDeclarationNode(printNode);
      if (this.shouldReplaceUnsupportedTsTypes()) {
        sanitizedNode = this.replaceUnsupportedTsTypesWithESObject(sanitizedNode);
      }
      let text: string = this.printer.printNode(ts.EmitHint.Unspecified, sanitizedNode, sourceFile);

      if (this.nodeHasAutoGeneratedHeritage(printNode) || this.textHasAutoGeneratedExtends(text)) {
        text = this.stripExtendsFromText(text);
      }

      if (entity.stripExport || entity.isDefaultExport || entity.namespaceName) {
        text = this.stripExportFromText(text, printNode);
      } else {
        text = this.stripDefaultKeywordFromText(text, printNode);
      }

      text = this.applyRenamesToText(text, printNode);
      text = text.replace(/  +/g, ' ');
      text = text.trim();
      if (text) {
        const normalized: string = text.replace(/^export\s+/, '').replace(/^declare\s+/, '');
        if (!emittedNormalizedTexts.has(normalized)) {
          emittedNormalizedTexts.add(normalized);
          parts.push(text);
        }
      }
    }
    return parts.join('\n\n');
  }

  private tryMergeEnumDeclarations(entity: CollectorEntity): string | null {
    const enumDecls: ts.EnumDeclaration[] = [];
    for (const decl of entity.declarations) {
      if (ts.isEnumDeclaration(decl)) {
        enumDecls.push(decl);
      }
    }
    if (enumDecls.length <= 1) {
      return null;
    }

    const seenMemberNames: Set<string> = new Set();
    const memberTexts: string[] = [];
    for (const enumDecl of enumDecls) {
      const enumSourceFile: ts.SourceFile = enumDecl.getSourceFile();
      for (const member of enumDecl.members) {
        const memberName: string = ts.isIdentifier(member.name)
          ? member.name.text
          : member.name.getText(enumSourceFile);
        if (!seenMemberNames.has(memberName)) {
          seenMemberNames.add(memberName);
          memberTexts.push(
            this.printer.printNode(ts.EmitHint.Unspecified, member, enumSourceFile).trim()
          );
        }
      }
    }

    const firstDecl: ts.EnumDeclaration = enumDecls[0];
    const emitName: string = entity.nameForEmit || firstDecl.name.text;
    const membersBlock: string = memberTexts.join(',\n');
    const anyHasExport: boolean = enumDecls.some(
      (d: ts.EnumDeclaration): boolean => this.nodeHasExportModifier(d)
    );
    const prefix: string = anyHasExport ? 'export declare' : 'declare';
    let text: string = `${prefix} enum ${emitName} {\n${membersBlock}\n}`;

    if (!anyHasExport && !entity.hasExportModifier) {
      text = this.stripExportFromText(text, this.getDeclarationNode(firstDecl));
    }

    text = this.applyRenamesToText(text, firstDecl);
    text = text.replace(/  +/g, ' ');
    text = text.trim();
    return text || null;
  }

  private shouldReplaceUnsupportedTsTypes(): boolean {
    return this.entrySourceFile?.fileName.endsWith('.d.ets') ?? false;
  }

  private replaceUnsupportedTsTypesWithESObject(node: ts.Node): ts.Node {
    const statement: ts.Statement = ts.isStatement(node)
      ? node
      : ts.factory.createExpressionStatement(node as ts.Expression);
    const syntheticFile: ts.SourceFile = ts.factory.createSourceFile(
      [statement],
      ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
      ts.NodeFlags.None
    );
    const result = ts.transform(syntheticFile, [
      (context: ts.TransformationContext) => {
        const visitor = (n: ts.Node): ts.Node => {
          if (n.kind === ts.SyntaxKind.AnyKeyword || n.kind === ts.SyntaxKind.UnknownKeyword) {
            return ts.factory.createTypeReferenceNode(
              ts.factory.createIdentifier('ESObject'),
              undefined
            );
          }
          return ts.visitEachChild(n, visitor, context);
        };
        return (sf: ts.SourceFile) => ts.visitEachChild(sf, visitor, context) as ts.SourceFile;
      }
    ]);
    const transformed: ts.SourceFile = result.transformed[0] as ts.SourceFile;
    const out: ts.Node = transformed.statements[0];
    result.dispose();
    if (ts.isExpressionStatement(out)) {
      return out.expression;
    }
    return out;
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
    if (this.isStructDeclaration(node)) {
      return ts.factory.updateStructDeclaration(
        node,
        node.modifiers,
        node.name,
        node.typeParameters,
        node.heritageClauses,
        ts.factory.createNodeArray(filteredMembers)
      );
    }
    return ts.factory.updateClassDeclaration(
      node,
      node.modifiers,
      node.name,
      node.typeParameters,
      node.heritageClauses,
      ts.factory.createNodeArray(filteredMembers)
    );
  }

  private isAutoGeneratedHeritageExpression(expr: ts.Expression): boolean {
    if (ts.isObjectLiteralExpression(expr)) {
      return true;
    }
    if (ts.isIdentifier(expr) && expr.text === '' && expr.pos === expr.end) {
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

  private nodeHasAutoGeneratedHeritage(node: ts.Node): boolean {
    const isClassLike: boolean = ts.isClassDeclaration(node) ||
      (ts.isStructDeclaration && ts.isStructDeclaration(node));
    if (!isClassLike) {
      return false;
    }
    const classNode = node as ts.ClassLikeDeclaration;
    if (!classNode.heritageClauses) {
      return false;
    }
    return classNode.heritageClauses.some(
      (clause: ts.HeritageClause): boolean =>
        clause.token === ts.SyntaxKind.ExtendsKeyword &&
        clause.types.some((t: ts.ExpressionWithTypeArguments): boolean =>
          this.isAutoGeneratedHeritageExpression(t.expression)
        )
    );
  }

  private textHasAutoGeneratedExtends(text: string): boolean {
    const { body } = this.splitLeadingTrivia(text);
    if (!/\b(?:struct|class)\b/.test(body)) {
      return false;
    }
    let angleDepth: number = 0;
    let bracePos: number = -1;
    for (let i: number = 0; i < body.length; i++) {
      const ch: string = body[i];
      if (ch === '<') { angleDepth++; continue; }
      if (ch === '>') { angleDepth--; continue; }
      if (ch === '{' && angleDepth === 0) {
        bracePos = i;
        break;
      }
    }
    if (bracePos === -1) {
      return false;
    }
    const header: string = body.slice(0, bracePos + 1);
    angleDepth = 0;
    for (let i: number = 0; i < header.length; i++) {
      const ch: string = header[i];
      if (ch === '<') { angleDepth++; continue; }
      if (ch === '>') { angleDepth--; continue; }
      if (angleDepth === 0 && header.startsWith('extends', i)) {
        if (i > 0 && /\w/.test(header[i - 1])) { continue; }
        const after: string = header.slice(i + 7);
        if (/^\s*\{/.test(after)) {
          return true;
        }
      }
    }
    return false;
  }

  private stripExtendsFromText(text: string): string {
    const { leading, body } = this.splitLeadingTrivia(text);
    let stripped: string = body;
    const objectLiteralMatch = stripped.match(/\s+extends\s*\{\s*\}/);
    if (objectLiteralMatch) {
      stripped = stripped.replace(/\s+extends\s*\{\s*\}/, '');
    } else {
      stripped = stripped.replace(/(\s+extends)\s*\{/, '{');
    }
    return leading + stripped;
  }

  private applyRenamesToText(text: string, node: ts.Node): string {
    const renames: Map<string, string> = new Map();
    const visit = (n: ts.Node): void => {
      if (ts.isIdentifier(n)) {
        this.collectRenameForIdentifier(n, renames);
      }
      ts.forEachChild(n, visit);
    };
    ts.forEachChild(node, visit);

    if (renames.size === 0) {
      return text;
    }

    return this.applyRenamesWithPlaceholders(text, renames);
  }

  private collectRenameForIdentifier(
    n: ts.Identifier,
    renames: Map<string, string>
  ): void {
    const refSymbol: ts.Symbol | undefined = this.checker.getSymbolAtLocation(n);
    if (!refSymbol) {
      return;
    }
    const resolved: ts.Symbol | null = this.resolveToActualDeclaration(refSymbol);
    if (!resolved) {
      return;
    }
    const emitName: string | undefined = this.nameResolver.getNameForSymbol(resolved);
    if (emitName && emitName !== n.text) {
      renames.set(n.text, emitName);
    }
  }

  private applyRenamesWithPlaceholders(
    text: string,
    renames: Map<string, string>
  ): string {
    const placeholders: Map<string, string> = new Map();
    let idx: number = 0;
    for (const [oldName, newName] of renames) {
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

  private stripDissolvedNamespacePrefixes(text: string): string {
    for (const ns of this.dissolvedNamespaceNames) {
      text = text.replace(
        new RegExp(`\\b${DeclarationMerger.escapeRegExp(ns)}\\.`, 'g'),
        ''
      );
    }
    return text;
  }

  private static escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private stripExportFromText(text: string, node: ts.Node): string {
    const hasDeclare: boolean = this.nodeHasDeclareModifier(node);
    const hasDefault: boolean = this.nodeHasDefaultModifier(node);
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
    if (this.nodeHasDefaultModifier(node)) {
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

  private nodeHasDeclareModifier(node: ts.Node): boolean {
    const decl: ts.Node = this.getDeclarationNode(node);
    if (!ts.canHaveModifiers(decl)) {
      return false;
    }
    const modifiers: readonly ts.ModifierLike[] | undefined = ts.getModifiers(decl);
    if (!modifiers) {
      return false;
    }
    return modifiers.some((m: ts.ModifierLike): boolean => m.kind === ts.SyntaxKind.DeclareKeyword);
  }

  private nodeHasDefaultModifier(node: ts.Node): boolean {
    const decl: ts.Node = this.getDeclarationNode(node);
    if (!ts.canHaveModifiers(decl)) {
      return false;
    }
    const modifiers: readonly ts.ModifierLike[] | undefined = ts.getModifiers(decl);
    if (!modifiers) {
      return false;
    }
    return modifiers.some((m: ts.ModifierLike): boolean => m.kind === ts.SyntaxKind.DefaultKeyword);
  }

  private emitSystemApiImport(
    entity: CollectorEntity,
    lines: string[],
    emittedStatements: Set<string>
  ): void {
    const info = entity.systemApiInfo!;
    let importLine: string;
    if (entity.isDefaultSystemApi) {
      importLine = `import ${entity.nameForEmit} from '${info.moduleName}';`;
    } else {
      const importName: string = entity.nameForEmit !== info.name
        ? `${info.name} as ${entity.nameForEmit}`
        : entity.nameForEmit;
      importLine = `import { ${importName} } from '${info.moduleName}';`;
    }
    if (!emittedStatements.has(importLine)) {
      lines.push(importLine);
      emittedStatements.add(importLine);
    }
  }

  private emitSystemApiReexport(
    entity: CollectorEntity,
    lines: string[],
    emittedStatements: Set<string>
  ): void {
    const info = entity.systemApiInfo!;
    const exportName: string = entity.exportNames[0];
    const namePart: string = exportName !== info.name
      ? `${info.name} as ${exportName}`
      : info.name;
    const line: string = `export { ${namePart} } from '${info.moduleName}';`;
    if (!emittedStatements.has(line)) {
      lines.push(line);
      emittedStatements.add(line);
    }
  }

  private nodeHasExportModifier(node: ts.Node): boolean {
    const decl = this.getDeclarationNode(node);
    if (!ts.canHaveModifiers(decl)) {
      return false;
    }
    const modifiers = ts.getModifiers(decl);
    if (!modifiers) {
      return false;
    }
    return modifiers.some((m: ts.ModifierLike): boolean => m.kind === ts.SyntaxKind.ExportKeyword);
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

  private isDefaultLibraryDeclaration(decl: ts.Declaration): boolean {
    return this.program.isSourceFileDefaultLibrary(decl.getSourceFile());
  }

  private isSystemApiDeclaration(declaration: ts.Node): { moduleName: string; name: string } | null {
    const modules: string[] | undefined = this.options.systemModules;
    if (!modules || modules.length === 0) {
      return null;
    }
    const sourceFile: ts.SourceFile = declaration.getSourceFile();
    if (!this.isInSdkPath(sourceFile.fileName)) {
      return null;
    }
    const baseName: string = path.basename(sourceFile.fileName);
    for (const mod of modules) {
      if (baseName === mod) {
        const moduleName: string = mod.replace(/\.d\.(ets|ts)$/, '');
        const name: string = this.getLocalNameOfDeclaration(declaration);
        return { moduleName, name };
      }
    }
    return null;
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

  private isDefaultExportOfModule(symbol: ts.Symbol): boolean {
    const visited: Set<ts.Symbol> = new Set();
    let current: ts.Symbol | undefined = symbol;
    while (current) {
      if (visited.has(current)) {
        break;
      }
      visited.add(current);
      if (current.name === 'default') {
        return true;
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

  private cleanup(entryFiles: string[]): void {
    const entrySet: Set<string> = new Set(entryFiles.map(toUnixPath));

    for (const [key, value] of harFilesRecord) {
      if (!value.originalDeclarationCachePath) {
        continue;
      }
      const cachePath: string = toUnixPath(value.originalDeclarationCachePath);
      if (entrySet.has(cachePath)) {
        continue;
      }
      if (fs.existsSync(cachePath)) {
        fs.unlinkSync(cachePath);
      }
      harFilesRecord.delete(key);
    }
  }
}
