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
  COMPONENT,
  EXTNAME_TS,
  OHOS_ARKUI,
} from './pre_define';
import { whiteFileList } from './white_management';
import {
  getFileAndKitComment,
  getPureName,
  isExistImportFile,
  isNonInterop,
  processFileName,
  processFileNameWithoutExt,
 } from './utils';
import type {
  ExportStatementType,
  FormatNodeInfo,
  NeedDeleteExportInfo,
  ProcessSourceFileResult,
 } from './type';
import { componentEtsFiles } from './global_var';

import processVisitEachChild from './add_export';
import formatAllNodes from './format_import';
import outputFile from './output_file';

let sourceFile: ts.SourceFile | null = null;
let componentEtsDeleteFiles: string[] = [];
const kitFileNeedDeleteMap = new Map();

export function deleteNonInteropApi(url: string, exportFlag: boolean, inputDir: string,
  outputPath: string): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    return (node: ts.SourceFile): ts.SourceFile => {
      const fullText: string = String(node.getFullText());
      let fileAndKitComment: string = getFileAndKitComment(fullText);
      const copyrightMessage: string = fullText.replace(node.getText(), '').split(/\/\*\*/)[0] +
        fileAndKitComment + '\n';
      let kitName: string = '';
      if (fullText.match(/\@kit (.*)\r?\n/g)) {
        kitName = RegExp.$1.replace(/\s/g, '');
      }
      const fileName: string = processFileName(url);
      sourceFile = node;

      const deleteNode: ProcessSourceFileResult = processSourceFile(node, url);

      node = processVisitEachChild(context, deleteNode.node, exportFlag);

      if (needProcessLabelNonInterop(fileName, kitName, inputDir)) {
        const printer: ts.Printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
        const result: string = printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);

        ts.transpileModule(result, {
          compilerOptions: {
            target: ts.ScriptTarget.ES2017,
          },
          fileName: fileName,
          transformers: {
            before: [processDeleteNoninterop(url, exportFlag, inputDir, outputPath,
              copyrightMessage, deleteNode.isCopyrightDeleted)]
          },
        });
      }
      return ts.factory.createSourceFile([], ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None);
    };
  };
}

function processSourceFile(node: ts.SourceFile, url: string): ProcessSourceFileResult {
  let isCopyrightDeleted = false;
  const newStatements: ts.Statement[] = [];
  const newStatementsWithoutExport: ts.Statement[] = [];
  const deleteNonInteropApiSet: Set<string> = new Set();
  let needDeleteExport: NeedDeleteExportInfo = {
    fileName: '',
    default: '',
    exportName: new Set(),
  };
  isCopyrightDeleted = addNewStatements(node, newStatements, deleteNonInteropApiSet, needDeleteExport);
  newStatements.forEach((statement) => {
    const names = getExportIdentifierName(statement);
    if (ts.isExportDeclaration(statement) && statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      statement.moduleSpecifier.text.startsWith(`./${ARKUI}/${COMPONENT}/`)) {
      const importPath = statement.moduleSpecifier.text.replace(`./${ARKUI}/${COMPONENT}/`, '');
      const isDeleteSystemFile = componentEtsDeleteFiles.includes(getPureName(importPath));
      const hasEtsFile = componentEtsFiles.includes(getPureName(importPath));
      const existFile = isExistImportFile(path.dirname(url), statement.moduleSpecifier.text.toString());
      if (isDeleteSystemFile || !hasEtsFile && !existFile) {
        return;
      }
    }
    if (names.length === 0) {
      newStatementsWithoutExport.push(statement);
      return;
    }
    if (names.length === 1 && !deleteNonInteropApiSet.has(names[0])) {
      newStatementsWithoutExport.push(statement);
      return;
    }
    processExportNode(statement, node, needDeleteExport, names, deleteNonInteropApiSet,
      newStatementsWithoutExport);
  });
  if (needDeleteExport.fileName !== '') {
    kitFileNeedDeleteMap.set(needDeleteExport.fileName, needDeleteExport);
  }
  return {
    node: ts.factory.updateSourceFile(node, newStatementsWithoutExport, node.isDeclarationFile,
      node.referencedFiles),
    isCopyrightDeleted,
  };
}

function needProcessLabelNonInterop(fileName: string, kitName: string, inputDir: string): boolean {
  if (inputDir.endsWith(COMPONENT) || fileName.startsWith(OHOS_ARKUI) ||
    kitName.toLowerCase() === ARKUI || whiteFileList.includes(fileName.slice(0, -EXTNAME_TS.length))) {
    return true;
  }
  return false;
}

function processDeleteNoninterop(url: string, exportFlag: boolean, inputDir: string,
  outputPath: string, copyrightMessage = '', isCopyrightDeleted = false) {
  return (context: ts.TransformationContext) => {
    return (node: ts.SourceFile): ts.SourceFile => {
      sourceFile = node;
      const allIdentifierSet: Set<string> = collectAllIdentifier(node, context);
      const formatValue: FormatNodeInfo = formatAllNodes(url, inputDir, node, allIdentifierSet);
      node = formatValue.node;
      const referencesMessage = formatValue.referencesMessage;
      if (formatValue.isCopyrightDeleted) {
        copyrightMessage = formatValue.copyrightMessage;
        isCopyrightDeleted = formatValue.isCopyrightDeleted;
      }
      outputFile(url, exportFlag, inputDir, outputPath, node, sourceFile, referencesMessage,
        copyrightMessage, isCopyrightDeleted);
      return ts.factory.createSourceFile([], ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None);
    };
  };
}

function collectAllIdentifier(node: ts.SourceFile, context: ts.TransformationContext): Set<string> {
  const identifierSet: Set<string> = new Set([]);
  if (!ts.isSourceFile(node) || !node.statements) {
    return identifierSet;
  }
  node.statements.forEach((stat) => {
    if (!ts.isImportDeclaration(stat)) {
      ts.visitEachChild(stat, collectAllNodes, context);
    }
  });

  function collectAllNodes(node: ts.Node): ts.Node {
    if (ts.isIdentifier(node)) {
      identifierSet.add(node.escapedText.toString());
    }
    return ts.visitEachChild(node, collectAllNodes, context);
  }

  return identifierSet;
}

function addNewStatements(node: ts.SourceFile, newStatements: ts.Statement[],
  deleteNonInteropApiSet: Set<string>, needDeleteExport: NeedDeleteExportInfo): boolean {
  let isCopyrightDeleted = false;
  node.statements.forEach((statement, index) => {
    if (!isNonInterop(statement)) {
      newStatements.push(statement);
      return;
    }
    if (index === 0) {
      isCopyrightDeleted = true;
    }
    if (ts.isVariableStatement(statement)) {
      deleteNonInteropApiSet.add(variableStatementGetEscapedText(statement));
    } else if (
      ts.isModuleDeclaration(statement) ||
      ts.isInterfaceDeclaration(statement) ||
      ts.isClassDeclaration(statement) ||
      ts.isEnumDeclaration(statement) ||
      ts.isStructDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement)
    ) {
      if (statement && statement.name && (statement.name as ts.Identifier).escapedText) {
        deleteNonInteropApiSet.add((statement.name as ts.Identifier).escapedText.toString());
      }
      setDeleteExport(statement, node, needDeleteExport, deleteNonInteropApiSet);
    } else if (ts.isExportAssignment(statement) || ts.isExportDeclaration(statement)) {
      setDeleteExport(statement, node, needDeleteExport, deleteNonInteropApiSet);
    }
  });

  return isCopyrightDeleted;
}

function variableStatementGetEscapedText(statement: ts.VariableStatement): string {
  let name = '';
  if (
    statement &&
    statement.declarationList &&
    statement.declarationList.declarations &&
    statement.declarationList.declarations.length > 0 &&
    statement.declarationList.declarations[0].name &&
    (statement.declarationList.declarations[0].name as ts.Identifier).escapedText
  ) {
    name = (statement.declarationList.declarations[0].name as ts.Identifier).escapedText.toString();
  }
  return name;
}

function processExportNode(statement: ts.Statement, node: ts.SourceFile,
  needDeleteExport: NeedDeleteExportInfo, names: string[], deleteNonInteropApiSet: Set<string>,
  newStatementsWithoutExport: ts.Statement[]): void {
  if (ts.isExportAssignment(statement)) {
    needDeleteExport.fileName = processFileNameWithoutExt(node.fileName);
    needDeleteExport.default = (statement.expression as ts.Identifier).escapedText.toString();
  } else if (ts.isExportDeclaration(statement)) {
    let needExport = false;
    const newSpecifiers: ts.ExportSpecifier[] = [];
    names.forEach((name, index) => {
      const exportSpecifier: ts.ExportSpecifier =
        (statement.exportClause! as ts.NamedExports).elements![index];
      if (!deleteNonInteropApiSet.has(name)) {
        newSpecifiers.push(exportSpecifier);
        needExport = true;
      } else {
        needDeleteExport.fileName = processFileNameWithoutExt(node.fileName);
        needDeleteExport.exportName.add(exportSpecifier.name.escapedText.toString());
      }
    });
    if (needExport) {
      (statement.exportClause as ts.NamedExports) = ts.factory.updateNamedExports(
        statement.exportClause as ts.NamedExports, newSpecifiers);
      newStatementsWithoutExport.push(statement);
    }
  }
}

function setDeleteExport(statement: ts.Statement, node: ts.SourceFile, needDeleteExport: NeedDeleteExportInfo,
  deleteNonInteropApiSet: Set<string>): void {
  if (ts.isExportAssignment(statement) &&
    deleteNonInteropApiSet.has((statement.expression as ts.Identifier).escapedText.toString())) {
    needDeleteExport.fileName = processFileNameWithoutExt(node.fileName);
    needDeleteExport.default = (statement.expression as ts.Identifier).escapedText.toString();
  } else if (ts.isExportDeclaration(statement)) {
    needDeleteExport.fileName = processFileNameWithoutExt(node.fileName);
    (statement.exportClause! as ts.NamedExports).elements.forEach((element) => {
      const exportName = element.propertyName ?
      element.propertyName.escapedText.toString() :
      element.name.escapedText.toString();
      if (deleteNonInteropApiSet.has(exportName)) {
        needDeleteExport.exportName.add(element.name.escapedText.toString());
      }
    });
  }
  //export namespace xxx {}
  const modifiers = statement.modifiers;
  if (modifiers === undefined) {
    return;
  }
  const exportFlag = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
  const defaultFlag = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword);
  if (exportFlag && defaultFlag) {
    needDeleteExport.fileName = processFileNameWithoutExt(node.fileName);
    needDeleteExport.default = ((statement! as ExportStatementType)!.name! as ts.Identifier)
      .escapedText.toString();
  } else if (exportFlag) {
    needDeleteExport.fileName = processFileNameWithoutExt(node.fileName);
    needDeleteExport.exportName.add(((statement! as ExportStatementType)!.name! as ts.Identifier)
      .escapedText.toString());
  }
}

function getExportIdentifierName(statement: ts.Statement): string[] {
  const names = [];
  if (ts.isExpressionStatement(statement)) {
    // exports.name = xxx;
    if (ts.isBinaryExpression(statement.expression) && ts.isIdentifier(statement.expression.right) &&
      statement.expression.right.escapedText) {
      names.push(statement.expression.right.escapedText.toString());
    }
  } else if (ts.isExportAssignment(statement)) {
    // export default xxx
    names.push((statement.expression as ts.Identifier).escapedText.toString());
  } else if (ts.isExportDeclaration(statement) && statement.exportClause) {
    // export {xxx} 、export {xxx as yyy} 、export * from './zzz'
    const specifiers = (statement.exportClause as ts.NamedExports).elements;
    specifiers.forEach((specifier) => {
      if (ts.isExportSpecifier(specifier)) {
        const name = specifier.propertyName ? specifier.propertyName : specifier.name;
        names.push(name.escapedText.toString());
      }
    });
  }
  return names;
}
