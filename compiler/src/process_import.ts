/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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

import ts from 'typescript';
import fs from 'fs';
import path from 'path';

import {
  EXTNAME_ETS,
  NODE_MODULES,
  INDEX_ETS,
  PACKAGE_JSON,
  STRUCT,
  CLASS,
  CUSTOM_COMPONENT_DEFAULT,
  CUSTOM_DECORATOR_NAME
} from './pre_define';
import {
  propertyCollection,
  linkCollection,
  componentCollection,
  preprocessExtend,
  preprocessNewExtend,
  processSystemApi,
  propCollection,
  isObservedClass,
  isCustomDialogClass,
  observedClassCollection,
  enumCollection,
  getComponentSet,
  IComponentSet
} from './validate_ui_syntax';
import { LogInfo } from './utils';

export default function processImport(node: ts.ImportDeclaration | ts.ImportEqualsDeclaration |
  ts.ExportDeclaration, pagesDir: string, log: LogInfo[]): void {
  let filePath: string;
  let defaultName: string;
  const asName: Map<string, string> = new Map();
  if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
    filePath = node.moduleSpecifier.getText().replace(/'|"/g, '');
    if (ts.isImportDeclaration(node) && node.importClause && node.importClause.name &&
      ts.isIdentifier(node.importClause.name)) {
      defaultName = node.importClause.name.escapedText.toString();
    }
    if (ts.isImportDeclaration(node) && node.importClause && node.importClause.namedBindings &&
      ts.isNamedImports(node.importClause.namedBindings) &&
      node.importClause.namedBindings.elements) {
      node.importClause.namedBindings.elements.forEach(item => {
        if (item.name && item.propertyName && ts.isIdentifier(item.name) &&
          ts.isIdentifier(item.propertyName)) {
          asName.set(item.propertyName.escapedText.toString(), item.name.escapedText.toString());
        }
      });
    }
  } else {
    if (node.moduleReference && ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression && ts.isStringLiteral(node.moduleReference.expression)) {
      filePath = node.moduleReference.expression.text;
      defaultName = node.name.escapedText.toString();
    }
  }
  if (filePath && path.extname(filePath) !== EXTNAME_ETS && !isModule(filePath)) {
    filePath += EXTNAME_ETS;
  }
  try {
    let fileResolvePath: string;
    if (/^(\.|\.\.)\//.test(filePath)) {
      fileResolvePath = path.join(pagesDir, filePath);
    } else if (/^\//.test(filePath)) {
      fileResolvePath = filePath;
    } else {
      fileResolvePath = getFileResolvePath(fileResolvePath, pagesDir, filePath);
    }
    if (fs.existsSync(fileResolvePath) && fs.statSync(fileResolvePath).isFile()) {
      const content: string = preprocessNewExtend(preprocessExtend(processSystemApi(
        fs.readFileSync(fileResolvePath, { encoding: 'utf-8' }).replace(
          new RegExp('\\b' + STRUCT + '\\b.+\\{', 'g'), item => {
            return item.replace(new RegExp('\\b' + STRUCT + '\\b', 'g'), `${CLASS} `);
          }))));
      const sourceFile: ts.SourceFile = ts.createSourceFile(filePath, content,
        ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
      visitAllNode(sourceFile, defaultName, asName, pagesDir, log);
    }
  } catch (e) {
    // ignore
  }
}

function visitAllNode(node: ts.Node, defaultNameFromParent: string, asNameFromParent: Map<string, string>,
  pagesDir: string, log: LogInfo[]) {
  if (isObservedClass(node)) {
    // @ts-ignore
    observedClassCollection.add(node.name.getText());
  }
  if (isCustomDialogClass(node)) {
    // @ts-ignore
    componentCollection.customDialogs.add(node.name.getText());
  }
  if (ts.isEnumDeclaration(node) && node.name) {
    enumCollection.add(node.name.getText());
  }
  if (ts.isClassDeclaration(node) && ts.isIdentifier(node.name) && isCustomComponent(node)) {
    addDependencies(node, defaultNameFromParent, asNameFromParent);
    if (!defaultNameFromParent && node.modifiers && node.modifiers.length >= 2 &&
      node.modifiers[0] && node.modifiers[0].kind === ts.SyntaxKind.ExportKeyword &&
      node.modifiers[1] && node.modifiers[1].kind === ts.SyntaxKind.DefaultKeyword &&
      hasCollection(node.name)) {
      addDefaultExport(node);
    }
  }
  if (ts.isExportAssignment(node) && node.expression && ts.isIdentifier(node.expression) &&
    hasCollection(node.expression)) {
    if (defaultNameFromParent) {
      setDependencies(defaultNameFromParent,
        linkCollection.get(node.expression.escapedText.toString()),
        propertyCollection.get(node.expression.escapedText.toString()),
        propCollection.get(node.expression.escapedText.toString()));
    }
    addDefaultExport(node);
  }
  if (ts.isExportDeclaration(node) && node.exportClause &&
    ts.isNamedExports(node.exportClause) && node.exportClause.elements) {
    node.exportClause.elements.forEach(item => {
      if (item.name && item.propertyName && ts.isIdentifier(item.name) &&
        ts.isIdentifier(item.propertyName) && hasCollection(item.propertyName)) {
        let asExportName: string = item.name.escapedText.toString();
        const asExportPropertyName: string = item.propertyName.escapedText.toString();
        if (asNameFromParent.has(asExportName)) {
          asExportName = asNameFromParent.get(asExportName);
        }
        setDependencies(asExportName, linkCollection.get(asExportPropertyName),
          propertyCollection.get(asExportPropertyName),
          propCollection.get(asExportPropertyName));
      }
    });
  }
  if (ts.isExportDeclaration(node) && node.moduleSpecifier &&
    ts.isStringLiteral(node.moduleSpecifier)) {
    processImport(node, pagesDir, log);
  }
  node.getChildren().forEach((item: ts.Node) => visitAllNode(item, defaultNameFromParent,
    asNameFromParent, pagesDir, log));
}

function addDependencies(node: ts.ClassDeclaration, defaultNameFromParent: string,
  asNameFromParent: Map<string, string>): void {
  const componentName: string = node.name.getText();
  const ComponentSet: IComponentSet = getComponentSet(node);
  if (defaultNameFromParent && node.modifiers && node.modifiers.length >= 2 && node.modifiers[0] &&
    node.modifiers[1] && node.modifiers[0].kind === ts.SyntaxKind.ExportKeyword &&
    node.modifiers[1].kind === ts.SyntaxKind.DefaultKeyword) {
    setDependencies(defaultNameFromParent, ComponentSet.links, ComponentSet.propertys,
      ComponentSet.props);
  } else if (asNameFromParent.has(componentName)) {
    setDependencies(asNameFromParent.get(componentName), ComponentSet.links, ComponentSet.propertys,
      ComponentSet.props);
  } else {
    setDependencies(componentName, ComponentSet.links, ComponentSet.propertys, ComponentSet.props);
  }
}

function addDefaultExport(node: ts.ClassDeclaration | ts.ExportAssignment): void {
  let name: string;
  if (ts.isClassDeclaration(node) && node.name && ts.isIdentifier(node.name)) {
    name = node.name.escapedText.toString();
  } else if (ts.isExportAssignment(node) && node.expression && ts.isIdentifier(node.expression)) {
    name = node.expression.escapedText.toString();
  } else {
    return;
  }
  setDependencies(CUSTOM_COMPONENT_DEFAULT,
    linkCollection.has(CUSTOM_COMPONENT_DEFAULT) ?
      new Set([...linkCollection.get(CUSTOM_COMPONENT_DEFAULT), ...linkCollection.get(name)]) :
      linkCollection.get(name), propertyCollection.has(CUSTOM_COMPONENT_DEFAULT) ?
      new Set([...propertyCollection.get(CUSTOM_COMPONENT_DEFAULT), ...propertyCollection.get(name)]) :
      propertyCollection.get(name), propCollection.has(CUSTOM_COMPONENT_DEFAULT) ?
      new Set([...propCollection.get(CUSTOM_COMPONENT_DEFAULT), ...propCollection.get(name)]) :
      propCollection.get(name));
}

function setDependencies(component: string, linkArray: Set<string>, propertyArray: Set<string>,
  propArray: Set<string>): void {
  linkCollection.set(component, linkArray);
  propertyCollection.set(component, propertyArray);
  propCollection.set(component, propArray);
  componentCollection.customComponents.add(component);
}

function hasCollection(node: ts.Identifier): boolean {
  return linkCollection.has(node.escapedText.toString()) ||
    propCollection.has(node.escapedText.toString()) ||
    propertyCollection.has(node.escapedText.toString());
}

function isModule(filePath: string): boolean {
  return !/^(\.|\.\.)?\//.test(filePath);
}

function isCustomComponent(node: ts.ClassDeclaration): boolean {
  if (node.decorators && node.decorators.length) {
    for (let i = 0; i < node.decorators.length; ++i) {
      const decoratorName: ts.Identifier = node.decorators[i].expression as ts.Identifier;
      if (ts.isIdentifier(decoratorName) &&
        CUSTOM_DECORATOR_NAME.has(decoratorName.escapedText.toString())) {
        return true;
      }
    }
  }
  return false;
}

function isPackageJsonEntry(filePath: string): boolean {
  const packageJsonPath: string = path.join(filePath, PACKAGE_JSON);
  if (fs.existsSync(packageJsonPath)) {
    let entry: string;
    try {
      entry = JSON.parse(fs.readFileSync(packageJsonPath).toString()).main;
    } catch (e) {
      return false;
    }
    if (typeof entry === 'string' && fs.existsSync(path.join(filePath, entry))) {
      return true;
    }
  }
}

function getPackageJsonEntry(filePath: string): string {
  return path.join(filePath, JSON.parse(fs.readFileSync(path.join(filePath, PACKAGE_JSON)).toString()).main);
}

function getModuleFilePath(filePath: string): string {
  if (filePath && path.extname(filePath) !== EXTNAME_ETS && isModule(filePath)) {
    filePath += EXTNAME_ETS;
  }
  return filePath;
}

function getFileResolvePath(fileResolvePath: string, pagesDir: string, filePath: string): string {
  const moduleFilePath: string = getModuleFilePath(filePath);
  const defaultModule: string = path.join(pagesDir, '../', moduleFilePath);
  if (fs.existsSync(defaultModule)) {
    return defaultModule;
  }
  const entryModule: string = path.join(pagesDir, '../../../../../../', moduleFilePath);
  if (fs.existsSync(entryModule)) {
    return entryModule;
  }
  let curPageDir: string = pagesDir;
  while (!fs.existsSync(fileResolvePath)) {
    fileResolvePath = path.join(curPageDir, NODE_MODULES, filePath);
    if (fs.existsSync(fileResolvePath + EXTNAME_ETS)) {
      fileResolvePath = fileResolvePath + EXTNAME_ETS;
    } else if (isPackageJsonEntry(fileResolvePath)) {
      fileResolvePath = getPackageJsonEntry(fileResolvePath);
    } else if (fs.existsSync(path.join(fileResolvePath, INDEX_ETS))) {
      fileResolvePath = path.join(fileResolvePath, INDEX_ETS);
    }
    if (curPageDir === path.parse(curPageDir).root) {
      break;
    }
    curPageDir = path.dirname(curPageDir);
  }
  return fileResolvePath;
}
