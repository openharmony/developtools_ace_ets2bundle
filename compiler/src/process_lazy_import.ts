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

import {
  IFileLog,
  LogType
} from './utils';
import {
  LogData,
  LogDataFactory
} from './fast_build/ark_compiler/logger';
import {
  ArkTSErrorDescription,
  ErrorCode
} from './fast_build/ark_compiler/error_code';
import creatAstNodeUtils from './create_ast_node_utils';

export const reExportCheckLog: IFileLog = new creatAstNodeUtils.FileLog();
export const reExportNoCheckMode: string = 'noCheck';
const reExportStrictMode: string = 'strict';

export interface LazyImportOptions {
  autoLazyImport: boolean;
  reExportCheckMode: string;
}

export function processJsCodeLazyImport(id: string, code: string,
  autoLazyImport: boolean, reExportCheckMode: string): string {
  let sourceNode: ts.SourceFile = ts.createSourceFile(id, code, ts.ScriptTarget.ES2021, true, ts.ScriptKind.JS);
  if (autoLazyImport) {
    sourceNode = transformLazyImport(sourceNode);
  }
  lazyImportReExportCheck(sourceNode, reExportCheckMode);
  return autoLazyImport ? ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }).printFile(sourceNode) : code;
}

export function transformLazyImport(sourceNode: ts.SourceFile, resolver?: Object): ts.SourceFile {
  const moduleNodeTransformer: ts.TransformerFactory<ts.SourceFile> = context => {
    const visitor: ts.Visitor = node => {
      if (ts.isImportDeclaration(node)) {
        return updateImportDecl(node, resolver);
      }
      return node;
    };
    return node => ts.visitEachChild(node, visitor, context);
  };

  const result: ts.TransformationResult<ts.SourceFile> =
    ts.transform(sourceNode, [moduleNodeTransformer]);
  return result.transformed[0];
}

function updateImportDecl(node: ts.ImportDeclaration, resolver: Object): ts.ImportDeclaration {
  const importClause: ts.ImportClause | undefined = node.importClause;
  // import { x } from './y'. Especially, it is not a lazy import and it is not a type-only import
  if (importClause && importClause.namedBindings && !importClause.name &&
    ts.isNamedImports(importClause.namedBindings) && !importClause.isLazy && !importClause.isTypeOnly) {
    let newImportClause: ts.ImportClause;
    const namedBindings: ts.NamedImportBindings = importClause.namedBindings;
    // The resolver is used to determine whether type symbols need to be processed.
    // Only TS/ETS files have type symbols.
    if (resolver) {
      // eliminate the type symbol
      // eg: import { typeSymbol, xxx } from 'xxxx' -> import { xxx } from 'xxxx'
      const newNameBindings: ts.ImportSpecifier[] = eliminateTypeSymbol(namedBindings, resolver);
      newImportClause = ts.factory.createImportClause(false, importClause.name,
        ts.factory.createNamedImports(newNameBindings));
    } else {
      newImportClause = ts.factory.createImportClause(false, importClause.name, namedBindings);
    }
    // @ts-ignore
    newImportClause.isLazy = true;
    const modifiers: readonly ts.Modifier[] | undefined = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
    return ts.factory.updateImportDeclaration(node, modifiers, newImportClause, node.moduleSpecifier, node.assertClause);
  }
  return node;
}

function eliminateTypeSymbol(namedBindings: ts.NamedImportBindings, resolver: Object): ts.ImportSpecifier[] {
  const newNameBindings: ts.ImportSpecifier[] = [];
  namedBindings.elements.forEach(item => {
    const element = item as ts.ImportSpecifier;
    if (!element.isTypeOnly && resolver.isReferencedAliasDeclaration(element)) {
      // import { x } from './y' --> propertyName is undefined
      // import { x as a } from './y' --> propertyName is x
      newNameBindings.push(
        ts.factory.createImportSpecifier(
          false,
          element.propertyName ? ts.factory.createIdentifier(element.propertyName.text) : undefined,
          ts.factory.createIdentifier(element.name.text)
        )
      );
    }
  });
  return newNameBindings;
}

export function resetReExportCheckLog(): void {
  reExportCheckLog.cleanUp();
}

export function lazyImportReExportCheck(node: ts.SourceFile, reExportCheckMode: string): void {
  if (reExportCheckMode === reExportNoCheckMode) {
    return;
  }
  reExportCheckLog.sourceFile = node;
  const lazyImportSymbols: Set<string> = new Set();
  const exportSymbols: Map<string, ts.Statement[]> = new Map();
  const result: Map<string, ts.Statement[]> = new Map();
  node.statements.forEach(stmt => {
    collectLazyImportSymbols(stmt, lazyImportSymbols, exportSymbols, result);
    collectLazyReExportSymbols(stmt, lazyImportSymbols, exportSymbols, result);
  });
  for (const [key, statements] of result.entries()) {
    for (const statement of statements) {
      collectReExportErrors(statement, key, reExportCheckMode);
    }
  }
}

function collectLazyImportSymbols(stmt: ts.Statement, lazyImportSymbols: Set<string>,
  exportSymbols: Map<string, ts.Statement[]>, result: Map<string, ts.Statement[]>): void {
  if (ts.isImportDeclaration(stmt) && stmt.importClause && stmt.importClause.isLazy) {
    // For import lazy x from './y', collect 'x'
    const importClauseName = stmt.importClause.name;
    if (importClauseName) {
      lazyImportSymbols.add(importClauseName.text);
      result.set(importClauseName.text, exportSymbols.get(importClauseName.text) ?? undefined);
    }
    // For import lazy { x } from './y', collect 'x'
    const importNamedBindings: ts.NamedImportBindings = stmt.importClause.namedBindings;
    if (importNamedBindings && ts.isNamedImports(importNamedBindings) && importNamedBindings.elements.length !== 0) {
      importNamedBindings.elements.forEach((element: ts.ImportSpecifier) => {
        const nameText = element.name.text;
        lazyImportSymbols.add(nameText);
        result.set(nameText, exportSymbols.get(nameText) ?? undefined);
      });
    }
  }
}

function collectLazyReExportSymbols(stmt: ts.Statement, lazyImportSymbols: Set<string>,
  exportSymbols: Map<string, ts.Statement[]>, result: Map<string, ts.Statement[]>): void {
  // export default x
  if (ts.isExportAssignment(stmt) && ts.isIdentifier(stmt.expression)) {
    const nameText: string = stmt.expression.text;
    const targetMap = lazyImportSymbols.has(nameText) ? result : exportSymbols;
    if (!targetMap.get(nameText)) {
      targetMap.set(nameText, []);
    }
    targetMap.get(nameText).push(stmt);
  }
  // export { x }
  if (ts.isExportDeclaration(stmt) && !stmt.moduleSpecifier &&
    ts.isNamedExports(stmt.exportClause) && stmt.exportClause.elements.length !== 0) {
    stmt.exportClause.elements.forEach((element: ts.ExportSpecifier) => {
      // For example, in 'export { foo as bar }', exportName is 'bar', localName is 'foo'
      const exportName: string = element.name.text;
      const localName: string = element.propertyName ? element.propertyName.text : exportName;
      const targetMap = lazyImportSymbols.has(localName) ? result : exportSymbols;
      if (!targetMap.get(localName)) {
        targetMap.set(localName, []);
      }
      targetMap.get(localName).push(stmt);
    });
  }
}

function collectReExportErrors(node: ts.Node, elementText: string, reExportCheckMode: string): void {
  let pos: number;
  try {
    pos = node.getStart();
  } catch {
    pos = 0;
  }
  let type: LogType = LogType.WARN;
  if (reExportCheckMode === reExportStrictMode) {
    type = LogType.ERROR;
  }
  // reExportCheckMode explanation:
  // - 'noCheck': NoCheck mode. The functionality to block re-exported lazy-import is disabled.
  // - 'strict': Strict mode. It intercepts errors and treats them as critical (LogType.ERROR).
  // - 'compatible': Compatible mode. It logs warnings (LogType.WARN) but does not intercept or block them.
  const errInfo: LogData = LogDataFactory.newInstance(
    ErrorCode.ETS2BUNDLE_EXTERNAL_LAZY_IMPORT_RE_EXPORT_ERROR,
    ArkTSErrorDescription,
    `'${elementText}' of lazy-import is re-export`,
    '',
    ['Please make sure the namedBindings of lazy-import are not be re-exported.',
      'Please check whether the autoLazyImport switch is opened.']
  );
  reExportCheckLog.errors.push({
    type: type,
    message: errInfo.toString(),
    pos: pos
  });
}