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
import { extractModuleSpecifier, extractModuleSpecifierFromExport, isExternalModuleSpecifier, getLocalNameOfDeclaration } from './declaration_merger_utils';

export interface SysApiContext {
  checker: ts.TypeChecker;
  printer: ts.Printer;
  entrySourceFile: ts.SourceFile | undefined;
  systemModules: string[] | undefined;
}

export function resolveToActualDeclaration(checker: ts.TypeChecker, symbol: ts.Symbol): ts.Symbol | null {
  const visited: Set<ts.Symbol> = new Set();
  let current: ts.Symbol | undefined = symbol;
  while (current && (current.flags & ts.SymbolFlags.Alias)) {
    if (visited.has(current)) {
      break;
    }
    visited.add(current);
    const aliased: ts.Symbol = checker.getAliasedSymbol(current);
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

export function extractStatementText(printer: ts.Printer, decl: ts.Declaration): string | null {
  let current: ts.Node | undefined = decl;
  while (current) {
    if (ts.isImportDeclaration(current) || ts.isExportDeclaration(current)) {
      return printer.printNode(ts.EmitHint.Unspecified, current, current.getSourceFile()).trim();
    }
    if (ts.isSourceFile(current)) {
      break;
    }
    current = current.parent;
  }
  return null;
}

export function specifierMatchesSystemModule(systemModules: string[] | undefined, specifier: string): boolean {
  if (!systemModules) {
    return false;
  }
  for (const mod of systemModules) {
    if (mod.replace(/\.d\.(ets|ts)$/, '') === specifier) {
      return true;
    }
  }
  return false;
}

export function collectExportDeclarationsFromModule(
  checker: ts.TypeChecker, moduleSymbol: ts.Symbol, exportName: string
): ts.Declaration[] {
  const results: ts.Declaration[] = [];
  for (const exp of checker.getExportsOfModule(moduleSymbol)) {
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

export function importClauseMatchesExport(
  checker: ts.TypeChecker, importClause: ts.ImportClause,
  exportName: string, resolvedSymbol: ts.Symbol
): boolean {
  if (importClause.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
    for (const spec of importClause.namedBindings.elements) {
      if (spec.name.text !== exportName) {
        continue;
      }
      const specSymbol = checker.getSymbolAtLocation(spec.name);
      if (specSymbol && resolveToActualDeclaration(checker, specSymbol) === resolvedSymbol) {
        return true;
      }
    }
  }
  if (importClause.name && importClause.name.text === exportName) {
    const nameSymbol = checker.getSymbolAtLocation(importClause.name);
    if (nameSymbol && resolveToActualDeclaration(checker, nameSymbol) === resolvedSymbol) {
      return true;
    }
  }
  if (importClause.namedBindings && ts.isNamespaceImport(importClause.namedBindings) &&
    importClause.namedBindings.name.text === exportName) {
    const nsSymbol = checker.getSymbolAtLocation(importClause.namedBindings.name);
    if (nsSymbol && resolveToActualDeclaration(checker, nsSymbol) === resolvedSymbol) {
      return true;
    }
  }
  return false;
}

export function isSystemApiDeclaration(
  ctx: SysApiContext, declaration: ts.Node, aliasSymbol?: ts.Symbol
): { moduleName: string; name: string; statementText: string } | null {
  if (!ctx.systemModules || ctx.systemModules.length === 0) {
    return null;
  }
  if (!aliasSymbol) {
    return null;
  }
  let found = findSystemApiModuleName(ctx, aliasSymbol);
  if (!found) {
    found = findSystemApiModuleNameViaReexportChain(ctx, aliasSymbol);
  }
  if (!found) {
    return null;
  }
  return { moduleName: found.moduleName, name: getLocalNameOfDeclaration(declaration), statementText: found.statementText };
}

export function findSystemApiModuleName(
  ctx: SysApiContext, symbol: ts.Symbol
): { moduleName: string; statementText: string } | null {
  const visited: Set<ts.Symbol> = new Set();
  let current: ts.Symbol | undefined = symbol;
  while (current && !visited.has(current)) {
    visited.add(current);
    for (const decl of current.declarations ?? []) {
      const specifier = extractModuleSpecifier(decl);
      if (specifier && specifierMatchesSystemModule(ctx.systemModules, specifier)) {
        const stmt = extractStatementText(ctx.printer, decl);
        return { moduleName: specifier, statementText: stmt ?? '' };
      }
    }
    if (!(current.flags & ts.SymbolFlags.Alias)) {
      break;
    }
    const aliased = ctx.checker.getAliasedSymbol(current);
    if (!aliased || aliased === current) {
      break;
    }
    current = aliased;
  }
  return null;
}

export function findSystemApiModuleNameViaReexportChain(
  ctx: SysApiContext, symbol: ts.Symbol
): { moduleName: string; statementText: string } | null {
  const visited: Set<string> = new Set();
  const queue: Array<{ declarations: readonly ts.Declaration[]; exportName: string }> = [];
  const seedResult = seedReexportBfsQueue(ctx, symbol, queue, visited);
  if (seedResult) {
    return seedResult;
  }
  while (queue.length > 0) {
    const item = queue.shift()!;
    for (const expDecl of item.declarations) {
      const expSpec = extractModuleSpecifier(expDecl);
      if (!expSpec) {
        continue;
      }
      if (specifierMatchesSystemModule(ctx.systemModules, expSpec)) {
        const stmt = extractStatementText(ctx.printer, expDecl);
        return { moduleName: expSpec, statementText: stmt ?? '' };
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
      const nextKey = expSpec + ':' + item.exportName;
      if (visited.has(nextKey)) {
        continue;
      }
      visited.add(nextKey);
      const moduleSym = ctx.checker.getSymbolAtLocation(exportDecl.moduleSpecifier);
      if (!moduleSym) {
        continue;
      }
      const nextDecls = collectExportDeclarationsFromModule(ctx.checker, moduleSym, item.exportName);
      if (nextDecls.length > 0) {
        queue.push({ declarations: nextDecls, exportName: item.exportName });
      }
    }
  }
  return null;
}

function seedReexportBfsQueue(
  ctx: SysApiContext, symbol: ts.Symbol,
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
    if (specifierMatchesSystemModule(ctx.systemModules, specifier)) {
      const stmt = extractStatementText(ctx.printer, decl);
      return { moduleName: specifier, statementText: stmt ?? '' };
    }
    const moduleSym = ctx.checker.getSymbolAtLocation(exportDecl.moduleSpecifier);
    if (!moduleSym) {
      continue;
    }
    const nextDecls = collectExportDeclarationsFromModule(ctx.checker, moduleSym, exportName);
    if (nextDecls.length > 0) {
      const key = specifier + ':' + exportName;
      if (!visited.has(key)) {
        visited.add(key); queue.push({ declarations: nextDecls, exportName });
      }
    }
  }
  return null;
}

export function searchImportInSourceFile(
  ctx: SysApiContext, sourceFile: ts.SourceFile, exportName: string, resolvedSymbol: ts.Symbol
): { moduleName: string; statementText: string } | null {
  let result: { moduleName: string; statementText: string } | null = null;
  ts.forEachChild(sourceFile, (node: ts.Node): void => {
    if (result || !ts.isImportDeclaration(node)) {
      return;
    }
    if (!node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier) || !node.importClause) {
      return;
    }
    if (importClauseMatchesExport(ctx.checker, node.importClause, exportName, resolvedSymbol)) {
      result = {
        moduleName: node.moduleSpecifier.text,
        statementText: ctx.printer.printNode(ts.EmitHint.Unspecified, node, sourceFile).trim()
      };
    }
  });
  return result;
}

export function findLocalImportForExport(
  ctx: SysApiContext, exportName: string, resolvedSymbol: ts.Symbol
): { moduleName: string; statementText: string } | null {
  if (!ctx.entrySourceFile) {
    return null;
  }
  return searchImportInSourceFile(ctx, ctx.entrySourceFile, exportName, resolvedSymbol);
}

export function findImportInModule(
  ctx: SysApiContext, moduleSymbol: ts.Symbol,
  memberName: string, targetSymbol: ts.Symbol
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
    if (!node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier) || !node.importClause) {
      return;
    }
    if (importClauseMatchesExport(ctx.checker, node.importClause, memberName, targetSymbol)) {
      result = {
        moduleName: node.moduleSpecifier.text,
        statementText: ctx.printer.printNode(ts.EmitHint.Unspecified, node, sourceFile as ts.SourceFile).trim()
      };
    }
  });
  return result;
}

export function findReexportForSymbol(
  printer: ts.Printer, memberSymbol: ts.Symbol
): string | null {
  for (const decl of memberSymbol.declarations ?? []) {
    if (!ts.isExportSpecifier(decl)) {
      continue;
    }
    const specifier = extractModuleSpecifierFromExport(decl);
    if (specifier && isExternalModuleSpecifier(specifier)) {
      const stmt = extractStatementText(printer, decl);
      if (stmt) {
        return stmt.replace(/^export\s+/, 'import ');
      }
    }
  }
  return null;
}
