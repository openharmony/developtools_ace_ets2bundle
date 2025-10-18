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

import * as path from 'path';

import * as ts from 'typescript';

import {
  ARKUI,
  ARKTS,
  COMPONENT,
  ANY,
  ETS,
  INTERNAL,
  EXIST,
  NON_EXIST,
  FRAMENODE,
  TYPENODE,
  XCOMPONENT,
} from './pre_define';
import {
  getCoreFilename,
  getPureName,
  isExistImportFile,
 } from './utils';
import type {
  ClauseSetValueInfo,
  FormatImportInfo,
  FormatNodeInfo,
  ReferenceModuleInfo,
 } from './type';
import { componentEtsFiles } from './global_var';

const globalModules = new Map();

export default function formatAllNodes(url: string, inputDir: string, node: ts.SourceFile,
  allIdentifierSet: Set<string>, copyrightMessage = '',
  isCopyrightDeleted = false): FormatNodeInfo {
  let referencesMessage: string = '';
  let currReferencesModule: ReferenceModuleInfo[] = [];
  if (!ts.isSourceFile(node) || !node.statements) {
    return { node, referencesMessage, copyrightMessage, isCopyrightDeleted };
  }
  const newStatements: ts.Statement[] = [];
  node.statements.forEach((statement) => {
    if (ts.isImportDeclaration(statement)) {
      const importInfo: FormatImportInfo = formatAllNodesImportDeclaration(node, statement, url,
        inputDir, currReferencesModule, allIdentifierSet);
      if (importInfo.statement) {
        newStatements.push(statement);
      } else if (importInfo.isCopyrightDeleted) {
        copyrightMessage = importInfo.copyrightMessage!;
        isCopyrightDeleted = importInfo.isCopyrightDeleted;
      }
    } else if (ts.isStructDeclaration(statement)) {
      statement = ts.factory.updateStructDeclaration(statement, statement.modifiers, statement.name,
        statement.typeParameters, statement.heritageClauses, statement.members.slice(1));
      newStatements.push(statement);
    } else {
      newStatements.push(statement);
    }
  });

  addForSpecialFiles(node, newStatements);

  currReferencesModule.forEach((item) => {
    if (item.isUsed) {
      referencesMessage += item.reference + '\n';
    }
  });
  node = ts.factory.updateSourceFile(node, newStatements);
  return { node, referencesMessage, copyrightMessage, isCopyrightDeleted };
}

function formatAllNodesImportDeclaration(node: ts.SourceFile, statement: ts.ImportDeclaration,
  url: string, inputDir: string, currReferencesModule: ReferenceModuleInfo[],
  allIdentifierSet: Set<string>): FormatImportInfo {
  const clauseSet: Set<string> = getClauseSet(statement);
  const importSpecifier: string = statement.moduleSpecifier.getText().replace(/[\'\"]/g, '');
  const fileDir: string = path.dirname(url);
  const hasImportSpecifierFile: boolean = hasFileByImportPath(importSpecifier, fileDir, inputDir);
  let hasImportSpecifierInModules: boolean = globalModules.has(importSpecifier);
  if ((!hasImportSpecifierFile && !hasImportSpecifierInModules) || clauseSet.size === 0) {
    if (hasCopyright(statement)) {
      return { copyrightMessage: node.getFullText().replace(node.getText(), ''), isCopyrightDeleted: true };
    } else {
      return { statement: undefined, copyrightMessage: '', isCopyrightDeleted: false };
    }
  }
  const clauseSetValue: ClauseSetValueInfo = getExsitClauseSet(hasImportSpecifierInModules, importSpecifier,
    currReferencesModule, clauseSet, allIdentifierSet);
  const hasExsitStatus: boolean = clauseSetValue.hasExsitStatus;
  const hasNonExsitStatus: boolean = clauseSetValue.hasNonExsitStatus;
  const exsitClauseSet: Set<string> = clauseSetValue.exsitClauseSet;
  if (hasExsitStatus) {
    return handleUsedImport(hasNonExsitStatus, statement, exsitClauseSet,
      hasImportSpecifierInModules, currReferencesModule, importSpecifier);
  } else if (hasCopyright(statement)) {
    return { copyrightMessage: node.getFullText().replace(node.getText(), ''), isCopyrightDeleted: true };
  } else {
    return { statement: undefined, copyrightMessage: '', isCopyrightDeleted: false };
  }
}

function addForSpecialFiles(node: ts.SourceFile, newStatements: ts.Statement[]): void {
  const fileName = getCoreFilename(path.basename(node.fileName));
  if (fileName === FRAMENODE) {
    newStatements.push(createFrameNodeTypeNode());
  }
}

function hasFileByImportPath(importPath: string, apiDir: string, inputDir: string): boolean {
  let fileDir: string = path.resolve(apiDir);
  if (importPath.startsWith(`@${ARKTS}`)) {
    fileDir = path.resolve(inputDir, `../${ARKTS}`);
  }
  return isExistArkUIFile(path.resolve(inputDir, ARKUI, COMPONENT), importPath, inputDir) ||
  isExistImportFile(fileDir, importPath);
}

function isExistArkUIFile(resolvedPath: string, importPath: string, inputDir: string): boolean {
  const filePath = path.resolve(resolvedPath, importPath);
  if (filePath.includes(path.resolve(inputDir, INTERNAL, COMPONENT, ETS)) ||
    filePath.includes(path.resolve(inputDir, ARKUI, COMPONENT))
  ) {
    const fileName = getPureName(filePath);
    return componentEtsFiles.includes(fileName);
  }
  return isExistImportFile(resolvedPath, importPath);
}

function createFrameNodeTypeNode(): ts.ModuleDeclaration {
  return ts.factory.createModuleDeclaration(
    [
      ts.factory.createToken(ts.SyntaxKind.ExportKeyword),
      ts.factory.createToken(ts.SyntaxKind.DeclareKeyword)
    ],
    ts.factory.createIdentifier(TYPENODE),
    ts.factory.createModuleBlock([ts.factory.createTypeAliasDeclaration(
      undefined,
      ts.factory.createIdentifier(XCOMPONENT),
      undefined,
      ts.factory.createTypeReferenceNode(
      ts.factory.createIdentifier(ANY),
      undefined
      )
    )]),
    ts.NodeFlags.Namespace | ts.NodeFlags.ExportContext | ts.NodeFlags.ContextFlags
  );
}

function hasCopyright(node: ts.ImportDeclaration): boolean {
  return /http\:\/\/www\.apache\.org\/licenses\/LICENSE\-2\.0/g.test(node.getFullText()
    .replace(node.getText(), ''));
}

function getClauseSet(statement: ts.ImportDeclaration): Set<string> {
  const clauseSet: Set<string> = new Set([]);
  if (!statement.importClause || !ts.isImportClause(statement.importClause)) {
    return clauseSet;
  }
  const clauseNode: ts.ImportClause = statement.importClause;
  if (!clauseNode.namedBindings && clauseNode.name && ts.isIdentifier(clauseNode.name)) {
    clauseSet.add(clauseNode.name.escapedText.toString());
  } else if (clauseNode.namedBindings && ts.isNamespaceImport(clauseNode.namedBindings) &&
    clauseNode.namedBindings.name && ts.isIdentifier(clauseNode.namedBindings.name)) {
    clauseSet.add(clauseNode.namedBindings.name.escapedText.toString());
  } else if (clauseNode.namedBindings && ts.isNamedImports(clauseNode.namedBindings) &&
    clauseNode.namedBindings.elements) {
    clauseNode.namedBindings.elements.forEach((ele) => {
      if (ele.name && ts.isIdentifier(ele.name)) {
        clauseSet.add(ele.name.escapedText.toString());
      }
    });
  }
  return clauseSet;
}

function getExsitClauseSet(hasImportSpecifierInModules: boolean, importSpecifier: string,
  currReferencesModule: ReferenceModuleInfo[], clauseSet: Set<string>,
  allIdentifierSet: Set<string>): ClauseSetValueInfo {
  let currModule: string[] = [];
  if (hasImportSpecifierInModules) {
    let index: number = globalModules.get(importSpecifier);
    const referenceModule: ReferenceModuleInfo = currReferencesModule[index];
    currModule = referenceModule.modules[importSpecifier]!;
  }
  const clasueCheckList = [];
  let exsitClauseSet: Set<string> = new Set([]);
  for (const clause of clauseSet) {
    let flag = allIdentifierSet.has(clause);
    if (hasImportSpecifierInModules) {
      flag = allIdentifierSet.has(clause) && currModule.includes(clause);
    }
    if (flag) {
      // use import
      exsitClauseSet.add(clause);
      clasueCheckList.push(EXIST);
    } else {
      clasueCheckList.push(NON_EXIST);
    }
  }
  let hasExsitStatus = false;
  let hasNonExsitStatus = false;
  clasueCheckList.forEach((ele) => {
    if (ele === EXIST) {
      hasExsitStatus = true;
    } else {
      hasNonExsitStatus = true;
    }
  });
  return { exsitClauseSet, hasExsitStatus, hasNonExsitStatus };
}

function handleUsedImport(hasNonExsitStatus: boolean, statement: ts.ImportDeclaration,
  exsitClauseSet: Set<string>, hasImportSpecifierInModules: boolean,
  currReferencesModule: ReferenceModuleInfo[], importSpecifier: string): FormatImportInfo {
  if (hasNonExsitStatus) {
    const newSpecifiers: ts.ImportSpecifier[] = [];
    (statement.importClause!.namedBindings! as ts.NamedImports).elements.forEach((element) => {
      if (exsitClauseSet.has(element.name.escapedText.toString())) {
        newSpecifiers.push(element);
      }
    });
    if (statement.importClause && ts.isNamedImports(statement.importClause.namedBindings!)) {
      // @ts-ignore
      statement.importClause.namedBindings = ts.factory.updateNamedImports(
        statement.importClause.namedBindings,
        newSpecifiers
      );
    }
  }
  if (hasImportSpecifierInModules) {
    let index = globalModules.get(importSpecifier);
    currReferencesModule[index].isUsed = true;
  }
  return { statement };
}
