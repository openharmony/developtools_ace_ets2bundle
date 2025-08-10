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
import { sdkConfigPrefix } from '../main';

interface ImportInfo {
  defaultImport?: {
    name: ts.Identifier;
  };
  namedImports: ts.ImportSpecifier[];
}

interface SymbolInfo {
  filePath: string,
  isDefault: boolean,
  exportName?: string
}

export function expandAllImportPaths(checker: ts.TypeChecker, rollupObejct: Object): Function {
  const expandImportPath: Object = rollupObejct.share.projectConfig?.expandImportPath;
  if (!(expandImportPath && Object.entries(expandImportPath).length !== 0) || !expandImportPath.enable) {
    return () => sourceFile => sourceFile;
  }
  const exclude: string[] = expandImportPath?.exclude ? expandImportPath?.exclude : [];
  return (context: ts.TransformationContext) => {
    // @ts-ignore
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
      if (ts.isImportDeclaration(node)) {
        const result: ts.ImportDeclaration[] = transformImportDecl(node, checker, exclude,
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
  projectConfig: Object): ts.ImportDeclaration[] {
  const moduleSpecifier: ts.StringLiteral = node.moduleSpecifier as ts.StringLiteral;
  const moduleRequest: string = moduleSpecifier.text;
  const REG_SYSTEM_MODULE: RegExp = new RegExp(`@(${sdkConfigPrefix})\\.(\\S+)`);
  const REG_LIB_SO: RegExp = /lib(\S+)\.so/;
  const depName2DepInfo: Object = projectConfig.depName2DepInfo;
  const packageDir: string = projectConfig.packageDir;
  const hspNameOhmMap: Object = Object.assign({}, projectConfig.hspNameOhmMap, projectConfig.harNameOhmMap);
  if (moduleRequest.startsWith('.') || REG_SYSTEM_MODULE.test(moduleRequest.trim()) || REG_LIB_SO.test(moduleRequest.trim()) ||
    exclude.indexOf(moduleRequest) !== -1 || (depName2DepInfo && !(depName2DepInfo.has(moduleRequest))) ||
    (hspNameOhmMap && hspNameOhmMap[moduleRequest])) {
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
  processDefaultImport(checker, importMap, importClause, moduleSpecifier, packageDir, depName2DepInfo);
  // named imports
  processNamedImport(checker, importMap, importClause, moduleSpecifier, packageDir, depName2DepInfo);
  if (importMap.size === 0) {
    return [];
  }
  const results: ts.ImportDeclaration[] = [];

  for (const [filePath, info] of importMap.entries()) {
    let realModuleRequest: string = filePath;
    if (filePath.endsWith('.ets') || filePath.endsWith('.ts')) {
      realModuleRequest = filePath.replace(/\.(ets|ts)$/, '');
    }
    results.push(createImportDeclarationFromInfo(info, node, realModuleRequest));
  }

  return results;
}


function processDefaultImport(checker: ts.TypeChecker, importMap: Map<string, ImportInfo>, importClause: ts.ImportClause,
  moduleSpecifier: ts.StringLiteral, packageDir: string, depName2DepInfo: Object): void {
  if (importClause.name) {
    const resolved = getRealFilePath(checker, moduleSpecifier, 'default', packageDir, depName2DepInfo);
    if (!resolved) {
      return;
    }
    const { filePath, isDefault, exportName } = resolved;

    if (!importMap.has(filePath)) {
      importMap.set(filePath, { namedImports: [] });
    }
    if (isDefault) {
      importMap.get(filePath)!.defaultImport = {
        name: importClause.name
      };
    } else {
      // fallback: was re-exported as default, but originally named
      importMap.get(filePath)!.namedImports.push(
        ts.factory.createImportSpecifier(importClause.isTypeOnly,
          exportName && (exportName !== importClause.name.text) ?
          ts.factory.createIdentifier(exportName) : ts.factory.createIdentifier(importClause.name.text),
          importClause.name)
      );
    }
  }
}

function processNamedImport(checker: ts.TypeChecker, importMap: Map<string, ImportInfo>, importClause: ts.ImportClause,
  moduleSpecifier: ts.StringLiteral, packageDir: string, depName2DepInfo: Object): void {
  if (importClause.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
    for (const element of importClause.namedBindings.elements) {
      const name: string = element.propertyName?.text || element.name.text;
      const resolved: SymbolInfo | undefined = getRealFilePath(checker, moduleSpecifier, name, packageDir, depName2DepInfo);
      if (!resolved) {
        continue;
      }
      let { filePath, isDefault, exportName } = resolved;
      if (element.isTypeOnly) {
        filePath = moduleSpecifier.text;
      }

      if (!importMap.has(filePath)) {
        importMap.set(filePath, { namedImports: [] });
      }
      if (isDefault) {
        importMap.get(filePath)!.defaultImport = {
          name: element.name
        };
      } else {
        importMap.get(filePath)!.namedImports.push(
          ts.factory.createImportSpecifier(element.isTypeOnly,
            exportName && (exportName !== name) ?
            ts.factory.createIdentifier(exportName) : element.propertyName,
            element.name)
        );
      }
    }
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

function genModuleRequest(filePath: string, moduleRequest: string, depName2DepInfo: Object): string {
  const unixFilePath: string = toUnixPath(filePath);
  for (const [depName, depInfo] of depName2DepInfo) {
    const unixModuleRootPath: string = toUnixPath(depInfo.pkgRootPath);
    if (unixFilePath.startsWith(unixModuleRootPath + '/') && depName === moduleRequest) {
      return unixFilePath.replace(unixModuleRootPath, moduleRequest);
    }
  }
  return moduleRequest;
}

function getRealFilePath(checker: ts.TypeChecker, moduleSpecifier: ts.StringLiteral,
  importName: string, packageDir: string, depName2DepInfo: Object): SymbolInfo | undefined {
  const symbol: ts.Symbol | undefined = resolveImportedSymbol(checker, moduleSpecifier, importName);
  if (!symbol) {
    return undefined;
  }

  const finalSymbol: ts.Symbol = resolveAliasedSymbol(symbol, checker);
  if (!finalSymbol || !finalSymbol.declarations || finalSymbol.declarations.length === 0) {
    return {
      filePath: moduleSpecifier.text,
      isDefault: importName === 'default',
    };
  }

  const decl: ts.Declaration = finalSymbol.declarations?.[0];
  const filePath: string = path.normalize(decl.getSourceFile().fileName);
  const newFilePath: string = genModuleRequest(filePath, moduleSpecifier.text, depName2DepInfo);
  if (filePath.indexOf(packageDir) !== -1 || filePath.endsWith('.d.ets') || filePath.endsWith('.d.ts') || newFilePath === moduleSpecifier.text) {
    return {
      filePath: moduleSpecifier.text,
      isDefault: importName === 'default',
    };
  }
  const [isDefault, exportName] = getDefaultExportName(finalSymbol);
  if (!isDefault && !exportName) {
    return {
      filePath: moduleSpecifier.text,
      isDefault: importName === 'default',
    };
  }
  return { filePath: newFilePath, isDefault, exportName };
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

function getDefaultExportName(symbol: ts.Symbol): [boolean, string] {
  const decl = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (!decl) {
    return [false, ''];
  }
  if (ts.isVariableDeclaration(decl)) {
    const parent = decl.parent?.parent;
    if (ts.isVariableStatement(parent) && parent.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      return [false, symbol.name];
    }
  }
  const sourceFile = decl.getSourceFile();
  for (const stmt of sourceFile.statements) {
    const result: [boolean, string] | undefined = checkExportAssignment(stmt, symbol.name) ??
      checkExportDeclaration(stmt, symbol.name) ?? checkNamedExportDeclaration(stmt, decl);
    if (result !== undefined) {
      return result;
    }
  }
  return [false, ''];
}

function checkExportAssignment(stmt: ts.Statement, symbolName: string): [boolean, string] | undefined {
  if (ts.isExportAssignment(stmt) && !stmt.isExportEquals && ts.isIdentifier(stmt.expression) && stmt.expression.text === symbolName) {
    return [true, 'default'];
  }
  return undefined;
}

function checkExportDeclaration(stmt: ts.Statement, symbolName: string): [boolean, string] | undefined {
  if (!ts.isExportDeclaration(stmt) || !stmt.exportClause || !ts.isNamedExports(stmt.exportClause)) {
    return undefined;
  }
  for (const specifier of stmt.exportClause.elements) {
    if (specifier.name.text === 'default' && specifier.propertyName?.text === symbolName) {
      return [true, 'default'];
    }
    if (specifier.name.text === 'default' && !specifier.propertyName) {
      return [false, ''];
    }
    if (specifier.name.text !== 'default' && specifier.propertyName?.text === symbolName) {
      return [false, specifier.name.text];
    }
    if (specifier.name.text !== 'default' && specifier.name.text === symbolName) {
      return [false, symbolName];
    }
  }
  return undefined;
}

function checkNamedExportDeclaration(stmt: ts.Statement, decl: ts.Declaration): [boolean, string] | undefined {
  if (stmt.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) && stmt.name?.text === decl.name?.getText()) {
    if (stmt.modifiers?.some(m => m.kind === ts.SyntaxKind.DefaultKeyword)) {
      return [true, 'default'];
    }
    return [false, stmt.name?.text];
  }
  return undefined;
}