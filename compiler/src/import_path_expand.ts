/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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
import path from 'path';

import { toUnixPath } from './utils';
import {
  projectConfig as mainProjectConfig,
  sdkConfigPrefix
} from '../main';
import { compilerOptions } from './ets_checker';

interface ImportInfo {
  defaultImport?: {
    name: ts.Identifier;
    isTypeOnly: boolean;
  };
  namedImports: ts.ImportSpecifier[];
}

interface SymbolInfo {
  filePath: string,
  isDefault: boolean,
  skipTransform: boolean
}

interface SeparatedImportInfos {
  typeOnly: Map<string, ImportInfo>;
  value: Map<string, ImportInfo>;
};

export function expandAllImportPaths(checker: ts.TypeChecker, rollupObejct: Object): Function {
  const expandImportPath: Object = rollupObejct.share.projectConfig?.expandImportPath;
  const modulePathMap: Map<string, string> = mainProjectConfig.modulePathMap;
  if (!(expandImportPath && Object.entries(expandImportPath).length !== 0) || !expandImportPath.enable) {
    return () => sourceFile => sourceFile;
  }
  const exclude: string[] = expandImportPath?.exclude ? expandImportPath?.exclude : [];
  return (context: ts.TransformationContext) => {
    // @ts-ignore
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
      if (ts.isImportDeclaration(node)) {
        const result: ts.ImportDeclaration[] = transformImportDecl(node, checker, exclude, modulePathMap,
          rollupObejct.share.projectConfig);
        return result.length > 0 ? result : node;
      }
      return node;
    };

    return (node: ts.SourceFile): ts.SourceFile => {
      return ts.visitEachChild(node, visitor, context);
    };
  };
}

function transformImportDecl(node: ts.ImportDeclaration, checker: ts.TypeChecker, exclude: string[],
  modulePathMap: Map<string, string>, projectConfig: Object): ts.ImportDeclaration[] {
  const moduleSpecifier: ts.StringLiteral = node.moduleSpecifier as ts.StringLiteral;
  const moduleRequest: string = moduleSpecifier.text;
  const REG_SYSTEM_MODULE: RegExp = new RegExp(`@(${sdkConfigPrefix})\\.(\\S+)`);
  const REG_LIB_SO: RegExp = /lib(\S+)\.so/;
  const depName2DepInfo: Object = projectConfig.depName2DepInfo;
  if (moduleRequest.startsWith('.') || REG_SYSTEM_MODULE.test(moduleRequest.trim()) ||
    REG_LIB_SO.test(moduleRequest.trim()) || exclude.indexOf(moduleRequest) !== -1 ||
    (depName2DepInfo && !(depName2DepInfo.has(moduleRequest)))) {
    return [];
  }
  const importClause = node.importClause;
  if (!importClause) {
    return [];
  }
  if ((importClause.namedBindings && ts.isNamespaceImport(importClause.namedBindings)) || importClause.isTypeOnly) {
    return [];
  }

  const importMap = new Map<string, ImportInfo>();
  // default import
  processDefaultImport(checker, importMap, importClause, moduleSpecifier);
  // named imports
  processNamedImport(checker, importMap, importClause, moduleSpecifier);
  if (importMap.size === 0) {
    return [];
  }
  const { typeOnly, value }: SeparatedImportInfos = separateImportInfos(importMap, moduleRequest);
  const results: ts.ImportDeclaration[] = [];

  for (const [_, info] of typeOnly.entries()) {
    results.push(createImportDeclarationFromInfo(info, node, moduleRequest));
  }

  for (const [filePath, info] of value.entries()) {
    const realModuleRequest = filePath === moduleRequest ? moduleRequest :
      genModuleRequst(filePath, moduleSpecifier.text, modulePathMap);
    if (!realModuleRequest) {
      continue;
    }
    results.push(createImportDeclarationFromInfo(info, node, realModuleRequest));
  }

  return results;
}


function processDefaultImport(checker: ts.TypeChecker, importMap: Map<string, ImportInfo>, importClause: ts.ImportClause,
  moduleSpecifier: ts.StringLiteral): void {
  if (importClause.name) {
    const resolved = getRealFilePath(checker, moduleSpecifier, 'default');
    if (!resolved) {
      return;
    }
    const { filePath, isDefault, skipTransform } = resolved;

    const mapKey = skipTransform ? moduleSpecifier.text : filePath;

    if (!importMap.has(mapKey)) {
      importMap.set(mapKey, { namedImports: [] });
    }
    if (isDefault) {
      importMap.get(mapKey)!.defaultImport = {
        name: importClause.name,
        isTypeOnly: importClause.isTypeOnly
      };
    } else {
      // fallback: was re-exported as default, but originally named
      importMap.get(mapKey)!.namedImports.push(
        ts.factory.createImportSpecifier(importClause.isTypeOnly,
          ts.factory.createIdentifier(importClause.name.text), importClause.name)
      );
    }
  }
}

function processNamedImport(checker: ts.TypeChecker, importMap: Map<string, ImportInfo>, importClause: ts.ImportClause,
  moduleSpecifier: ts.StringLiteral): void {
  if (importClause.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
    for (const element of importClause.namedBindings.elements) {
      const name: string = element.propertyName?.text || element.name.text;
      const resolved: SymbolInfo | undefined = getRealFilePath(checker, moduleSpecifier, name);
      if (!resolved) {
        continue;
      }
      const { filePath, isDefault, skipTransform } = resolved;
      const mapKey = skipTransform ? moduleSpecifier.text : filePath;

      if (!importMap.has(mapKey)) {
        importMap.set(mapKey, { namedImports: [] });
      }
      if (isDefault) {
        importMap.get(mapKey)!.defaultImport = {
          name: element.name,
          isTypeOnly: element.isTypeOnly
        };
      } else {
        importMap.get(mapKey)!.namedImports.push(
          ts.factory.createImportSpecifier(element.isTypeOnly, element.propertyName, element.name));
      }
    }
  }
}

function separateImportInfos(importInfos: Map<string, ImportInfo>, moduleRequest: string): SeparatedImportInfos {
  const typeOnly = new Map<string, ImportInfo>();
  const value = new Map<string, ImportInfo>();

  for (const [filePath, info] of importInfos.entries()) {
    const isDeclarationFile: boolean = filePath.endsWith('.d.ets') || filePath.endsWith('.d.ts');
    const typeInfo: ImportInfo = { namedImports: [] };
    const valueInfo: ImportInfo = { namedImports: [] };

    if (info.defaultImport) {
      const target = info.defaultImport.isTypeOnly || isDeclarationFile ? typeInfo : valueInfo;
      target.defaultImport = info.defaultImport;
    }

    for (const spec of info.namedImports) {
      const target: ImportInfo = spec.isTypeOnly || isDeclarationFile ? typeInfo : valueInfo;
      target.namedImports.push(spec);
    }

    if (typeInfo.defaultImport || typeInfo.namedImports.length > 0) {
      mergeTypeOnlyInfo(typeOnly, moduleRequest, typeInfo);
    }
    if (valueInfo.defaultImport || valueInfo.namedImports.length > 0) {
      value.set(filePath, valueInfo);
    }
  }

  return { typeOnly, value };
}

function mergeTypeOnlyInfo(typeOnly: Map<string, ImportInfo>, moduleRequest: string, typeInfo: ImportInfo): void {
  const existing: ImportInfo = typeOnly.get(moduleRequest);
  if (existing) {
    existing.namedImports.push(...typeInfo.namedImports);
    if (!existing.defaultImport && typeInfo.defaultImport) {
      existing.defaultImport = typeInfo.defaultImport;
    }
  } else {
    typeOnly.set(moduleRequest, typeInfo);
  }
}

function createImportDeclarationFromInfo(importInfo: ImportInfo, originalNode: ts.ImportDeclaration,
  modulePath: string): ts.ImportDeclaration {
  const importClause = ts.factory.createImportClause(false, importInfo.defaultImport?.name,
    importInfo.namedImports.length > 0 ? ts.factory.createNamedImports(importInfo.namedImports) : undefined);

  // @ts-ignore
  importClause.isLazy = originalNode.importClause?.isLazy;

  return ts.factory.updateImportDeclaration(originalNode, originalNode.modifiers, importClause,
    ts.factory.createStringLiteral(modulePath), originalNode.assertClause);
}

function genModuleRequst(filePath: string, moduleRequest: string, modulePathMap: Map<string, string>): string {
  const unixFilePath: string = toUnixPath(filePath);
  for (const [_, moduleRootPath] of Object.entries(modulePathMap)) {
    const unixModuleRootPath: string = toUnixPath(moduleRootPath);
    if (unixFilePath.startsWith(unixModuleRootPath + '/')) {
      return unixFilePath.replace(unixModuleRootPath, moduleRequest).replace(/\.(ets|ts|js)$/, '');
    }
  }
  return '';
}

function getRealFilePath(checker: ts.TypeChecker, moduleSpecifier: ts.StringLiteral,
  exportName: string): SymbolInfo | undefined {
  const symbol: ts.Symbol | undefined = resolveImportedSymbol(checker, moduleSpecifier, exportName);
  if (!symbol) {
    return undefined;
  }

  const finalSymbol: ts.Symbol = resolveAliasedSymbol(symbol, checker);
  if (!finalSymbol || !finalSymbol.declarations || finalSymbol.declarations.length === 0) {
    return {
      filePath: moduleSpecifier.text,
      isDefault: exportName === 'default',
      skipTransform: true
    };
  }

  const decl: ts.Declaration = finalSymbol.declarations?.[0];
  const filePath = path.normalize(decl.getSourceFile().fileName);
  const isDefault: boolean = isActuallyDefaultExport(finalSymbol);

  return { filePath, isDefault, skipTransform: false };
}

function resolveImportedSymbol(checker: ts.TypeChecker, moduleSpecifier: ts.StringLiteral,
  exportName: string): ts.Symbol | undefined {
  const moduleSymbol: ts.Symbol = checker.getSymbolAtLocation(moduleSpecifier);
  if (!moduleSymbol) {
    return undefined;
  }

  const exports: ts.Symbol[] = checker.getExportsOfModule(moduleSymbol);
  if (!exports) {
    return undefined;
  }

  for (const sym of exports) {
    const name: string = sym.escapedName.toString();
    if (name === exportName) {
      return sym;
    }
  }
  return undefined;
}

function resolveAliasedSymbol(symbol: ts.Symbol, checker: ts.TypeChecker): ts.Symbol {
  const visited = new Set<ts.Symbol>();
  let finalSymbol: ts.Symbol | undefined = symbol;

  while (finalSymbol && finalSymbol.flags & ts.SymbolFlags.Alias) {
    if (visited.has(finalSymbol)) {
      break;
    }
    visited.add(finalSymbol);
    const aliased = checker.getAliasedSymbol(finalSymbol);
    if (!aliased) {
      break;
    }
    finalSymbol = aliased;
  }

  // fallback: skip symbols with no declarations
  while (finalSymbol && (!finalSymbol.declarations || finalSymbol.declarations.length === 0) &&
    (finalSymbol.flags & ts.SymbolFlags.Alias)) {
    if (visited.has(finalSymbol)) {
      break;
    }
    visited.add(finalSymbol);
    const aliased = checker.getAliasedSymbol(finalSymbol);
    if (!aliased || aliased === finalSymbol) {
      break;
    }
    finalSymbol = aliased;
  }

  return finalSymbol;
}

function isActuallyDefaultExport(symbol: ts.Symbol): boolean {
  const decl = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (!decl) {
    return false;
  }
  const sourceFile = decl.getSourceFile();
  for (const stmt of sourceFile.statements) {
    if (isDefaultExportAssignment(stmt, symbol)) {
      return true;
    }
    if (isNamedDefaultExport(stmt, symbol)) {
      return true;
    }
    if (isNamedDefaultDecl(stmt, decl, symbol)) {
      return true;
    }
  }
  return false;
}

function isDefaultExportAssignment(stmt: ts.Statement, symbol: ts.Symbol): boolean {
  return ts.isExportAssignment(stmt) &&
         !stmt.isExportEquals &&
         ts.isIdentifier(stmt.expression) &&
         stmt.expression.text === symbol.name;
}

function isNamedDefaultExport(stmt: ts.Statement, symbol: ts.Symbol): boolean {
  if (!ts.isExportDeclaration(stmt) || !stmt.exportClause || !ts.isNamedExports(stmt.exportClause)) {
    return false;
  }
  for (const specifier of stmt.exportClause.elements) {
    if (specifier.name.text === 'default' && specifier.propertyName?.text === symbol.name) {
      return true;
    }
    if (specifier.name.text === 'default' && !specifier.propertyName) {
      return false;
    }
  }
  return false;
}

function isNamedDefaultDecl(stmt: ts.Statement, decl: ts.Declaration, symbol: ts.Symbol): boolean {
  return symbol.name === 'default' &&
         (ts.isFunctionDeclaration(stmt) || ts.isClassDeclaration(stmt)) &&
         stmt.modifiers?.some(m => m.kind === ts.SyntaxKind.DefaultKeyword) &&
         stmt.name?.text === decl.name?.getText();
}