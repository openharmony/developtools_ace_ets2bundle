/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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

import path from 'path';
import ts from 'typescript';

import {
  ARKTS_LANG_D_ETS,
  ISENDABLE_TYPE,
  LANG_NAMESPACE,
  USE_SHARED
} from './common/ark_define';
import {
  addLog,
  LogInfo,
  LogType
} from '../../utils';
import { globalProgram } from '../../../main';
import { isSendableClassDeclaration } from '../../validate_ui_syntax';

export const sharedModuleSet: Set<string> = new Set();

let checker: ts.TypeChecker | null;

export function collectSharedModule(source: string, filePath: string, sourceFile: ts.SourceFile | null, log: LogInfo[]): void {
  if (!sourceFile) {
    sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.ETS);
  }
  checker = globalProgram.checker;

  // "use shared" will only be effective when used after imports, before other statements
  let count: number = 0;
  while (ts.isImportDeclaration(sourceFile.statements[count])) {
    count++;
  }

  const statement: ts.Statement = sourceFile.statements[count];
  if (ts.isExpressionStatement(statement) && ts.isStringLiteral((statement as ts.ExpressionStatement).expression)) {
    if ((((statement as ts.ExpressionStatement).expression as ts.StringLiteral).text === USE_SHARED)) {
      // Check from next statement
      checkSharedModule(sourceFile, log, count + 1);
      sharedModuleSet.add(filePath);
    }
  }
}

function checkSharedModule(sourceFile: ts.SourceFile, log: LogInfo[], index: number): void {
  for (let i = index; i < sourceFile.statements.length; i++) {
    const statement: ts.Statement = sourceFile.statements[i];
    if (hasModifier(statement, ts.SyntaxKind.ExportKeyword) ||
      ts.isExportDeclaration(statement) || ts.isExportAssignment(statement)) {
      checkExportClause(sourceFile, statement, log);
    }
  }
}

function hasModifier(statement: ts.Statement, keyword: ts.SyntaxKind): boolean {
  if (!ts.canHaveModifiers(statement) || ts.getModifiers(statement) === undefined) {
    return false;
  }

  for (const modifier of ts.getModifiers(statement)) {
    if (modifier.kind === keyword) {
      return true;
    }
  }
  return false;
}

// Check for all export clauses except 'export type ...' which doesn't effect runtime，exported object must be sendable.
function checkExportClause(sourceFile: ts.SourceFile, statement: ts.Statement, log: LogInfo[]): void {
  const message: string = 'Exported object must be sendable in shared module.';
  switch (statement.kind) {
    case ts.SyntaxKind.InterfaceDeclaration: {
      if (checker && !isShareableType(checker.getTypeAtLocation(statement))) {
        addLog(LogType.ERROR, message, statement.getStart(), log, sourceFile);
      }
      return;
    }
    case ts.SyntaxKind.EnumDeclaration: {
      if (!hasModifier(statement, ts.SyntaxKind.ConstKeyword)) {
        addLog(LogType.ERROR, message, statement.getStart(), log, sourceFile);
      }
      return;
    }
    case ts.SyntaxKind.VariableStatement: {
      for (const variableDeclaration of (statement as ts.VariableStatement).declarationList.declarations) {
        if (checker && !isShareableType(checker.getTypeAtLocation(variableDeclaration.name))) {
          addLog(LogType.ERROR, message, variableDeclaration.name.getStart(), log, sourceFile);
        }
      }
      return;
    }
    case ts.SyntaxKind.ClassDeclaration: {
      if (!((statement as ts.ClassDeclaration).name) || (checker &&
            !isShareableType(checker.getTypeAtLocation((statement as ts.ClassDeclaration).name)))) {
        addLog(LogType.ERROR, message, statement.getStart(), log, sourceFile);
      }
      return;
    }
    case ts.SyntaxKind.ExportAssignment: {
      const expression: ts.Expression = (statement as ts.ExportAssignment).expression;
      if (checker && !isShareableType(checker.getTypeAtLocation(expression))) {
        addLog(LogType.ERROR, message, expression.getStart(), log, sourceFile);
      }
      return;
    }
    case ts.SyntaxKind.ExportDeclaration: {
      if ((statement as ts.ExportDeclaration).exportClause === undefined) {
        return;
      }
      for (const exportSpecifier of ((statement as ts.ExportDeclaration).exportClause as ts.NamedExports).elements) {
        const decl: ts.Declaration = getDeclarationNode(exportSpecifier.name);
        if (checker && decl && (!isShareableType(checker.getTypeAtLocation(decl)))) {
          addLog(LogType.ERROR, message, exportSpecifier.name.getStart(), log, sourceFile);
        }
      }
      return;
    }
    case ts.SyntaxKind.TypeAliasDeclaration: {
      return;
    }
    default: {
      addLog(LogType.ERROR, message, statement.getStart(), log, sourceFile);
    }
  }
}

function isShareableType(tsType: ts.Type): boolean {
  if (tsType.isUnion()) {
    const types: ts.Type[] = (tsType as ts.UnionType).types;
    for (const eachType of types) {
      if (!isShareableType(eachType)) {
        return false;
      }
    }
    return true;
  }

  return isBasicType(tsType) || isOrDerivedFromType(tsType, isISendableInterface) ||
    isSendableClass(tsType) || ts.ArkTSLinter_1_1.Utils.isConstEnumType(tsType);
}

function isBasicType(tsType: ts.Type): boolean {
  const flag: ts.TypeFlags = tsType.getFlags();
  switch (flag) {
    case ts.TypeFlags.String:
    case ts.TypeFlags.Number:
    case ts.TypeFlags.Boolean:
    case ts.TypeFlags.BigInt:
    case ts.TypeFlags.StringLiteral:
    case ts.TypeFlags.NumberLiteral:
    case ts.TypeFlags.BooleanLiteral:
    case ts.TypeFlags.BigIntLiteral:
    case ts.TypeFlags.Undefined:
    case ts.TypeFlags.Null:
      return true;
    default:
      return false;
  }
}

function isSendableClass(tsType: ts.Type): boolean {
  if (!tsType.getSymbol() || !tsType.getSymbol().valueDeclaration) {
    return false;
  }

  const valueDeclarationNode: ts.Node = tsType.getSymbol().valueDeclaration;
  if (!ts.isClassDeclaration(valueDeclarationNode)) {
    return false;
  }
  return isSendableClassDeclaration(valueDeclarationNode as ts.ClassDeclaration);
}

function isTypeReference(tsType: ts.Type): tsType is ts.TypeReference {
  return (
    (tsType.getFlags() & ts.TypeFlags.Object) !== 0 &&
      ((tsType as ts.ObjectType).objectFlags & ts.ObjectFlags.Reference) !== 0
  );
}

function reduceReference(t: ts.Type): ts.Type {
  return isTypeReference(t) && t.target !== t ? t.target : t;
}

type CheckType = (t: ts.Type) => boolean;
function isOrDerivedFromType(tsType: ts.Type, checkType: CheckType, checkedBaseTypes?: Set<ts.Type>): boolean {
  tsType = reduceReference(tsType);

  if (checkType.call(this, tsType)) {
    return true;
  }

  if (!tsType.symbol?.declarations) {
    return false;
  }

  // Avoid type recursion in heritage by caching checked types.
  (checkedBaseTypes = checkedBaseTypes || new Set<ts.Type>()).add(tsType);

  for (const tsTypeDecl of tsType.symbol.declarations) {
    const isInterfaceDecl = ts.isInterfaceDeclaration(tsTypeDecl);
    const isDerived = isInterfaceDecl && !!tsTypeDecl.heritageClauses;
    if (!isDerived) {
      continue;
    }
    for (const heritageClause of tsTypeDecl.heritageClauses) {
      if (processParentTypesCheck(heritageClause.types, checkType, checkedBaseTypes)) {
        return true;
      }
    }
  }

  return false;
}

function processParentTypesCheck(
  parentTypes: ts.NodeArray<ts.Expression>,
  checkType: CheckType,
  checkedBaseTypes: Set<ts.Type>
): boolean {
  for (const baseTypeExpr of parentTypes) {
    const baseType = reduceReference(checker.getTypeAtLocation(baseTypeExpr));
    if (baseType && !checkedBaseTypes.has(baseType) && isOrDerivedFromType(baseType, checkType, checkedBaseTypes)) {
      return true;
    }
  }
  return false;
}

function isISendableInterface(tsType: ts.Type): boolean {
  const symbol = tsType.aliasSymbol ?? tsType.getSymbol();
  if (symbol?.declarations === undefined || symbol.declarations.length < 1) {
    return false;
  }

  return isArkTSISendableDeclaration(symbol.declarations[0]);
}

function isArkTSISendableDeclaration(decl: ts.Declaration): boolean {
  if (!ts.isInterfaceDeclaration(decl) || !decl.name || decl.name.text !== ISENDABLE_TYPE) {
    return false;
  }

  if (!ts.isModuleBlock(decl.parent) || decl.parent.parent.name.text !== LANG_NAMESPACE) {
    return false;
  }

  if (path.basename(decl.getSourceFile().fileName).toLowerCase() !== ARKTS_LANG_D_ETS) {
    return false;
  }

  return true;
}

function getDeclarationNode(node: ts.Node): ts.Declaration | undefined {
  const sym = trueSymbolAtLocation(node);
  if (sym === undefined) {
    return undefined;
  }
  return getDeclaration(sym);
}

const trueSymbolAtLocationCache = new Map<ts.Node, ts.Symbol | null>();

function trueSymbolAtLocation(node: ts.Node): ts.Symbol | undefined {
  const cache = trueSymbolAtLocationCache;
  const val = cache.get(node);
  if (val !== undefined) {
    return val !== null ? val : undefined;
  }
  let sym = checker.getSymbolAtLocation(node);
  if (sym === undefined) {
    cache.set(node, null);
    return undefined;
  }
  sym = followIfAliased(sym);
  cache.set(node, sym);
  return sym;
}

function getDeclaration(tsSymbol: ts.Symbol | undefined): ts.Declaration | undefined {
  if (tsSymbol?.declarations && tsSymbol.declarations.length > 0) {
    return tsSymbol.declarations[0];
  }
  return undefined;
}

function followIfAliased(sym: ts.Symbol): ts.Symbol {
  if ((sym.getFlags() & ts.SymbolFlags.Alias) !== 0) {
    return checker.getAliasedSymbol(sym);
  }
  return sym;
}
