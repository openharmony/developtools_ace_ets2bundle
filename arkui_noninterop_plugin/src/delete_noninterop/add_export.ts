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

import { isNonInterop } from './utils';

// add export for interface/class/enum/type/namespace, delete struct
export default function processVisitEachChild(context: ts.TransformationContext, node: ts.SourceFile,
  exportFlag: boolean): ts.SourceFile {
  return ts.visitEachChild(node, processAllNodes, context);

  function processAllNodes(node: ts.Node): ts.Node {
    if (ts.isInterfaceDeclaration(node)) {
      node = processInterfaceDeclaration(node, exportFlag);
    } else if (ts.isClassDeclaration(node)) {
      node = processClassDeclaration(node, exportFlag);
    } else if (ts.isModuleDeclaration(node) && node.body && ts.isModuleBlock(node.body)) {
      const newModuleBody: ts.ModuleBlock =
        ts.factory.updateModuleBlock(node.body, getNewStatements(node));
      node = ts.factory.updateModuleDeclaration(node, node.modifiers, node.name, newModuleBody);
    } else if (ts.isEnumDeclaration(node)) {
      node = processEnumDeclaration(node, exportFlag);
    } else if (ts.isStructDeclaration(node)) {
      node = processStructDeclaration(node);
    } else if (ts.isTypeAliasDeclaration(node)) {
      node = processTypeAliasDeclaration(node, exportFlag);
    }
    return ts.visitEachChild(node, processAllNodes, context);
  }
}

function processInterfaceDeclaration(node: ts.InterfaceDeclaration,
  exportFlag: boolean): ts.InterfaceDeclaration {
  const newMembers: ts.TypeElement[] = [];
  node.members.forEach((member) => {
    if (!isNonInterop(member)) {
      newMembers.push(member);
    }
  });
  let modifiers = exportFlag ? addExport2Modifiers(node.modifiers!) : node.modifiers;
  return ts.factory.updateInterfaceDeclaration(
    node,
    modifiers,
    node.name,
    node.typeParameters,
    node.heritageClauses,
    newMembers
  );
}

function processClassDeclaration(node: ts.ClassDeclaration, exportFlag: boolean): ts.ClassDeclaration {
  const newMembers: ts.ClassElement[] = [];
  node.members.forEach((member) => {
    if (!isNonInterop(member)) {
      newMembers.push(member);
    }
  });
  let modifiers = exportFlag ? addExport2Modifiers(node.modifiers!) : node.modifiers;
  return ts.factory.updateClassDeclaration(
    node,
    modifiers,
    node.name,
    node.typeParameters,
    node.heritageClauses,
    newMembers
  );
}

function processEnumDeclaration(node: ts.EnumDeclaration, exportFlag: boolean): ts.EnumDeclaration {
  const newMembers: ts.EnumMember[] = [];
  node.members.forEach((member) => {
    if (!isNonInterop(member)) {
      newMembers.push(member);
    }
  });
  let modifiers = exportFlag ? addExport2Modifiers(node.modifiers!) : node.modifiers;
  return ts.factory.updateEnumDeclaration(
    node,
    modifiers,
    node.name,
    newMembers
  );
}

function processStructDeclaration(node: ts.StructDeclaration): ts.StructDeclaration {
  const newMembers: ts.ClassElement[] = [];
  node.members.forEach((member, index) => {
    if (index >= 1 && !isNonInterop(member)) {
      newMembers.push(member);
    }
  });
  node = ts.factory.updateStructDeclaration(
    node,
    node.modifiers,
    node.name,
    node.typeParameters,
    node.heritageClauses,
    newMembers
  );
  return node;
}

function processTypeAliasDeclaration(node: ts.TypeAliasDeclaration,
  exportFlag: boolean): ts.TypeAliasDeclaration {
  if (exportFlag) {
    return ts.factory.updateTypeAliasDeclaration(
      node,
      addExport2Modifiers(node.modifiers!),
      node.name,
      node.typeParameters,
      node.type
    );
  } else {
    return node;
  }
}

function getNewStatements(node: ts.ModuleDeclaration): ts.Statement[] {
  const newStatements: ts.Statement[] = [];
  (node.body! as ts.ModuleBlock).statements.forEach((statement) => {
    if (!isNonInterop(statement)) {
      newStatements.push(statement);
    }
  });
  return newStatements;
}

function addExport2Modifiers(
  modifiers: ts.NodeArray<ts.Modifier | ts.ModifierLike>): ts.NodeArray<ts.Modifier> {
  modifiers = modifiers || [];
  const isAlreadyExported = modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
  if (!isAlreadyExported) {
    modifiers = [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword),
      ...modifiers] as unknown as ts.NodeArray<ts.Modifier>;
  }
  return modifiers as ts.NodeArray<ts.Modifier>;
}
