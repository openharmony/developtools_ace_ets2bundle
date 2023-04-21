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
import JSON5 from 'json5';

import {
  EXTNAME_ETS,
  EXTNAME_TS,
  NODE_MODULES,
  INDEX_ETS,
  INDEX_TS,
  PACKAGE_JSON,
  STRUCT,
  CLASS,
  CUSTOM_COMPONENT_DEFAULT,
  CUSTOM_DECORATOR_NAME,
  COMPONENT_DECORATOR_ENTRY,
  COMPONENT_BUILDER_DECORATOR,
  CARD_LOG_TYPE_IMPORT
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
  IComponentSet,
  builderParamObjectCollection,
  stateCollection,
  regularCollection,
  storagePropCollection,
  storageLinkCollection,
  provideCollection,
  consumeCollection,
  objectLinkCollection,
  localStorageLinkCollection,
  localStoragePropCollection,
  builderParamInitialization
} from './validate_ui_syntax';
import {
  getExtensionIfUnfullySpecifiedFilepath,
  hasDecorator,
  LogInfo,
  LogType,
  repeatLog
} from './utils';
import { projectConfig } from '../main';
import {
  CUSTOM_BUILDER_METHOD,
  INNER_COMPONENT_NAMES,
  GLOBAL_CUSTOM_BUILDER_METHOD
} from './component_map';
import { validatorCard } from './process_ui_syntax';

export const IMPORT_FILE_ASTCACHE: Map<string, ts.SourceFile> = new Map();

export default function processImport(node: ts.ImportDeclaration | ts.ImportEqualsDeclaration |
  ts.ExportDeclaration, pagesDir: string, log: LogInfo[], asName: Map<string, string> = new Map(),
isEntryPage: boolean = true, pathCollection: Set<string> = new Set()): void {
  let filePath: string;
  let defaultName: string;
  if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
    filePath = node.moduleSpecifier.getText().replace(/'|"/g, '');
    if (ts.isImportDeclaration(node) && node.importClause && node.importClause.name &&
      ts.isIdentifier(node.importClause.name)) {
      defaultName = node.importClause.name.escapedText.toString();
      if (isEntryPage) {
        asName.set(defaultName, defaultName);
      }
    }
    if (ts.isImportDeclaration(node) && node.importClause && node.importClause.namedBindings &&
      ts.isNamedImports(node.importClause.namedBindings) &&
      node.importClause.namedBindings.elements && isEntryPage) {
      node.importClause.namedBindings.elements.forEach(item => {
        if (item.name && ts.isIdentifier(item.name)) {
          validateModuleName(item.name, log);
          if (item.propertyName && ts.isIdentifier(item.propertyName) && asName) {
            asName.set(item.propertyName.escapedText.toString(), item.name.escapedText.toString());
          } else {
            asName.set(item.name.escapedText.toString(), item.name.escapedText.toString());
          }
        }
      });
    }
  } else {
    if (node.moduleReference && ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression && ts.isStringLiteral(node.moduleReference.expression)) {
      filePath = node.moduleReference.expression.text;
      defaultName = node.name.escapedText.toString();
      if (isEntryPage) {
        asName.set(defaultName, defaultName);
      }
    }
  }

  if (filePath) {
    validatorCard(log, CARD_LOG_TYPE_IMPORT, node.getStart());
  }

  try {
    let fileResolvePath: string = getFileFullPath(filePath, pagesDir);
    if (fs.existsSync(fileResolvePath) && fs.statSync(fileResolvePath).isFile() &&
      !pathCollection.has(fileResolvePath)) {
      let sourceFile: ts.SourceFile;
      pathCollection.add(fileResolvePath);
      if (IMPORT_FILE_ASTCACHE.has(fileResolvePath)) {
        sourceFile = IMPORT_FILE_ASTCACHE.get(fileResolvePath);
      } else {
        sourceFile = generateSourceFileAST(fileResolvePath, filePath);
        IMPORT_FILE_ASTCACHE[fileResolvePath] = sourceFile;
      }
      visitAllNode(sourceFile, sourceFile, defaultName, asName, path.dirname(fileResolvePath), log,
        new Set(), new Set(), new Set(), new Map(), pathCollection, fileResolvePath);
    }
  } catch (e) {
    // ignore
  }
}

export function generateSourceFileAST(fileResolvePath: string, filePath: string): ts.SourceFile {
  const originContent: string = fs.readFileSync(fileResolvePath, { encoding: 'utf-8' });
  const content: string = path.extname(fileResolvePath) === EXTNAME_ETS ?
    preprocessNewExtend(preprocessExtend(processSystemApi(originContent.replace(
      new RegExp('\\b' + STRUCT + '\\b.+\\{', 'g'), item => {
        return item.replace(new RegExp('\\b' + STRUCT + '\\b', 'g'), `${CLASS} `);
      })))) : originContent;
  return ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function visitAllNode(node: ts.Node, sourceFile: ts.SourceFile, defaultNameFromParent: string,
  asNameFromParent: Map<string, string>, pagesDir: string, log: LogInfo[], entryCollection: Set<string>,
  exportCollection: Set<string>, defaultCollection: Set<string>, asExportCollection: Map<string, string>,
  pathCollection: Set<string>, fileResolvePath: string) {
  if (isObservedClass(node)) {
    collectSpecialFunctionNode(node as ts.ClassDeclaration, asNameFromParent, defaultNameFromParent, defaultCollection,
      asExportCollection, observedClassCollection);
    // @ts-ignore
    observedClassCollection.add(node.name.getText());
  }
  if (isCustomDialogClass(node)) {
    collectSpecialFunctionNode(node as ts.StructDeclaration, asNameFromParent, defaultNameFromParent, defaultCollection,
      asExportCollection, componentCollection.customDialogs);
    // @ts-ignore
    componentCollection.customDialogs.add(node.name.getText());
  }
  if (ts.isEnumDeclaration(node) && node.name) {
    enumCollection.add(node.name.getText());
  }
  if ((ts.isClassDeclaration(node) || ts.isStructDeclaration(node)) && ts.isIdentifier(node.name) &&
    isCustomComponent(node)) {
    addDependencies(node, defaultNameFromParent, asNameFromParent);
    isExportEntry(node, log, entryCollection, exportCollection, defaultCollection, fileResolvePath, sourceFile);
    if (asExportCollection.has(node.name.getText())) {
      componentCollection.customComponents.add(asExportCollection.get(node.name.getText()));
    }
    if (node.modifiers && node.modifiers.length >= 2 && node.modifiers[0] &&
      node.modifiers[0].kind === ts.SyntaxKind.ExportKeyword && node.modifiers[1] &&
      node.modifiers[1].kind === ts.SyntaxKind.DefaultKeyword) {
      if (!defaultNameFromParent && hasCollection(node.name)) {
        addDefaultExport(node);
      } else if (defaultNameFromParent && asNameFromParent.has(defaultNameFromParent)) {
        componentCollection.customComponents.add(asNameFromParent.get(defaultNameFromParent));
      }
    }
    if (defaultCollection.has(node.name.getText())) {
      componentCollection.customComponents.add(CUSTOM_COMPONENT_DEFAULT);
    }
  }
  if (ts.isFunctionDeclaration(node) && hasDecorator(node, COMPONENT_BUILDER_DECORATOR)) {
    collectSpecialFunctionNode(node, asNameFromParent, defaultNameFromParent, defaultCollection,
      asExportCollection, CUSTOM_BUILDER_METHOD);
    collectSpecialFunctionNode(node, asNameFromParent, defaultNameFromParent, defaultCollection,
      asExportCollection, GLOBAL_CUSTOM_BUILDER_METHOD);
  }
  if (ts.isExportAssignment(node) && node.expression && ts.isIdentifier(node.expression) &&
    hasCollection(node.expression)) {
    if (defaultNameFromParent) {
      const propertiesName: string = node.expression.escapedText.toString();
      setDependencies(defaultNameFromParent, linkCollection.get(propertiesName),
        propertyCollection.get(propertiesName), propCollection.get(propertiesName),
        builderParamObjectCollection.get(propertiesName), stateCollection.get(propertiesName),
        regularCollection.get(propertiesName), storagePropCollection.get(propertiesName),
        storageLinkCollection.get(propertiesName), provideCollection.get(propertiesName),
        consumeCollection.get(propertiesName), objectLinkCollection.get(propertiesName),
        localStorageLinkCollection.get(propertiesName), localStoragePropCollection.get(propertiesName),
        builderParamInitialization.get(propertiesName));
    }
    addDefaultExport(node);
  }
  if (ts.isExportAssignment(node) && node.expression && ts.isIdentifier(node.expression)) {
    if (defaultNameFromParent) {
      asNameFromParent.set(node.expression.getText(), asNameFromParent.get(defaultNameFromParent));
    }
    defaultCollection.add(node.expression.getText());
  }
  if (ts.isExportDeclaration(node) && node.exportClause &&
    ts.isNamedExports(node.exportClause) && node.exportClause.elements) {
    node.exportClause.elements.forEach(item => {
      if (process.env.watchMode === 'true') {
        exportCollection.add((item.propertyName ? item.propertyName : item.name).escapedText.toString());
      }
      if (item.name && ts.isIdentifier(item.name)) {
        if (!item.propertyName) {
          asExportCollection.set(item.name.escapedText.toString(), item.name.escapedText.toString());
        } else if (item.propertyName && ts.isIdentifier(item.propertyName)) {
          validateModuleName(item.name, log, sourceFile, fileResolvePath);
          if (hasCollection(item.propertyName)) {
            let asExportName: string = item.name.escapedText.toString();
            const asExportPropertyName: string = item.propertyName.escapedText.toString();
            if (asNameFromParent.has(asExportName)) {
              asExportName = asNameFromParent.get(asExportName);
            }
            setDependencies(asExportName, linkCollection.get(asExportPropertyName),
              propertyCollection.get(asExportPropertyName),
              propCollection.get(asExportPropertyName),
              builderParamObjectCollection.get(asExportPropertyName),
              stateCollection.get(asExportPropertyName), regularCollection.get(asExportPropertyName),
              storagePropCollection.get(asExportPropertyName), storageLinkCollection.get(asExportPropertyName),
              provideCollection.get(asExportPropertyName), consumeCollection.get(asExportPropertyName),
              objectLinkCollection.get(asExportPropertyName), localStorageLinkCollection.get(asExportPropertyName),
              localStoragePropCollection.get(asExportPropertyName), builderParamInitialization.get(asExportPropertyName));
          }
          asExportCollection.set(item.propertyName.escapedText.toString(), item.name.escapedText.toString());
        }
      }
      if (item.name && ts.isIdentifier(item.name) && asNameFromParent.has(item.name.escapedText.toString()) &&
        item.propertyName && ts.isIdentifier(item.propertyName)) {
        asNameFromParent.set(item.propertyName.escapedText.toString(),
          asNameFromParent.get(item.name.escapedText.toString()));
      }
    });
  }
  if (ts.isExportDeclaration(node) && node.moduleSpecifier &&
    ts.isStringLiteral(node.moduleSpecifier)) {
    if (process.env.watchMode === 'true' && node.exportClause && ts.isNamedExports(node.exportClause) &&
      node.exportClause.elements) {
      node.exportClause.elements.forEach(item => {
        exportCollection.add((item.propertyName ? item.propertyName : item.name).escapedText.toString());
        if (item.propertyName && ts.isIdentifier(item.propertyName) && item.name &&
          ts.isIdentifier(item.name) && asNameFromParent.has(item.name.escapedText.toString())) {
          asNameFromParent.set(item.propertyName.escapedText.toString(),
            asNameFromParent.get(item.name.escapedText.toString()));
          defaultCollection.add(item.name.escapedText.toString());
        }
      });
    }
    processImport(node, pagesDir, log, asNameFromParent, true, new Set(pathCollection));
  }
  if (ts.isImportDeclaration(node)) {
    if (node.importClause && node.importClause.name && ts.isIdentifier(node.importClause.name) &&
      asNameFromParent.has(node.importClause.name.getText())) {
      processImport(node, pagesDir, log, asNameFromParent, false, new Set(pathCollection));
    } else if (node.importClause && node.importClause.namedBindings &&
      ts.isNamedImports(node.importClause.namedBindings) && node.importClause.namedBindings.elements) {
      let nested: boolean = false;
      node.importClause.namedBindings.elements.forEach(item => {
        if (item.name && ts.isIdentifier(item.name) && asNameFromParent.has(item.name.escapedText.toString())) {
          nested = true;
          if (item.propertyName && ts.isIdentifier(item.propertyName)) {
            asNameFromParent.set(item.propertyName.escapedText.toString(),
              asNameFromParent.get(item.name.escapedText.toString()));
          }
        }
      });
      if (nested) {
        processImport(node, pagesDir, log, asNameFromParent, false, new Set(pathCollection));
      }
    }
  }
  node.getChildren().reverse().forEach((item: ts.Node) => visitAllNode(item, sourceFile,
    defaultNameFromParent, asNameFromParent, pagesDir, log, entryCollection, exportCollection,
    defaultCollection, asExportCollection, pathCollection, fileResolvePath));
}

function collectSpecialFunctionNode(node: ts.FunctionDeclaration | ts.ClassDeclaration | ts.StructDeclaration,
  asNameFromParent: Map<string, string>, defaultNameFromParent: string, defaultCollection: Set<string>,
  asExportCollection: Map<string, string>, collection: Set<string>): void {
  const name: string = node.name.getText();
  let componentName: string;
  if (asNameFromParent.has(name)) {
    collection.add(asNameFromParent.get(name));
  } else if (node.modifiers && node.modifiers.length >= 1 && node.modifiers[0] &&
    node.modifiers[0].kind === ts.SyntaxKind.ExportKeyword) {
    if (node.modifiers.length == 1) {
      collection.add(name);
    } else if (node.modifiers.length >= 2 && node.modifiers[1] && node.modifiers[1].kind ===
      ts.SyntaxKind.DefaultKeyword) {
      collection.add(CUSTOM_COMPONENT_DEFAULT);
      if (defaultNameFromParent && asNameFromParent.has(defaultNameFromParent)) {
        collection.add(asNameFromParent.get(defaultNameFromParent));
      }
    }
  } else if (defaultCollection.has(name)) {
    collection.add(CUSTOM_COMPONENT_DEFAULT);
  } else if (asExportCollection.has(name)) {
    collection.add(asExportCollection.get(name));
  }
}

function isExportEntry(node: ts.ClassDeclaration, log: LogInfo[], entryCollection: Set<string>,
  exportCollection: Set<string>, defaultCollection: Set<string>, fileResolvePath: string,
  sourceFile: ts.SourceFile): void {
  if (process.env.watchMode === 'true' && node && node.decorators) {
    let existExport: boolean = false;
    let existEntry: boolean = false;
    if (node.modifiers) {
      for (let i = 0; i < node.modifiers.length; i++) {
        if (node.modifiers[i].kind === ts.SyntaxKind.ExportKeyword) {
          existExport = true;
          break;
        }
      }
    }
    for (let i = 0; i < node.decorators.length; i++) {
      if (node.decorators[i].getText() === COMPONENT_DECORATOR_ENTRY) {
        entryCollection.add(node.name.escapedText.toString());
        existEntry = true;
        break;
      }
    }
  }
}

function remindExportEntryComponent(node: ts.Node, log: LogInfo[], fileResolvePath: string,
  sourceFile: ts.SourceFile): void {
  const posOfNode: ts.LineAndCharacter = sourceFile.getLineAndCharacterOfPosition(node.getStart());
  const line: number = posOfNode.line + 1;
  const column: number = posOfNode.character + 1;
  const warnInfo: LogInfo = {
    type: LogType.WARN,
    message: `It's not a recommended way to export struct with @Entry decorator, ` +
      `which may cause ACE Engine error in component preview mode.`,
    pos: node.getStart(),
    fileName: fileResolvePath,
    line: line,
    column: column
  };
  if (!repeatLog.has(fileResolvePath)) {
    log.push(warnInfo);
    repeatLog.set(fileResolvePath, warnInfo);
  }
}

function addDependencies(node: ts.ClassDeclaration, defaultNameFromParent: string,
  asNameFromParent: Map<string, string>): void {
  const componentName: string = node.name.getText();
  const ComponentSet: IComponentSet = getComponentSet(node);
  if (defaultNameFromParent && node.modifiers && node.modifiers.length >= 2 && node.modifiers[0] &&
    node.modifiers[1] && node.modifiers[0].kind === ts.SyntaxKind.ExportKeyword &&
    node.modifiers[1].kind === ts.SyntaxKind.DefaultKeyword) {
    setDependencies(defaultNameFromParent, ComponentSet.links, ComponentSet.properties,
      ComponentSet.props, ComponentSet.builderParams, ComponentSet.states, ComponentSet.regulars,
      ComponentSet.storageProps, ComponentSet.storageLinks, ComponentSet.provides,
      ComponentSet.consumes, ComponentSet.objectLinks, ComponentSet.localStorageLink,
      ComponentSet.localStorageProp, ComponentSet.builderParamData);
  } else if (asNameFromParent.has(componentName)) {
    setDependencies(asNameFromParent.get(componentName), ComponentSet.links, ComponentSet.properties,
      ComponentSet.props, ComponentSet.builderParams, ComponentSet.states, ComponentSet.regulars,
      ComponentSet.storageProps, ComponentSet.storageLinks, ComponentSet.provides,
      ComponentSet.consumes, ComponentSet.objectLinks, ComponentSet.localStorageLink,
      ComponentSet.localStorageProp, ComponentSet.builderParamData);
  } else {
    setDependencies(componentName, ComponentSet.links, ComponentSet.properties, ComponentSet.props,
      ComponentSet.builderParams, ComponentSet.states, ComponentSet.regulars,
      ComponentSet.storageProps, ComponentSet.storageLinks, ComponentSet.provides,
      ComponentSet.consumes, ComponentSet.objectLinks, ComponentSet.localStorageLink,
      ComponentSet.localStorageProp, ComponentSet.builderParamData);
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
      linkCollection.get(name),
    propertyCollection.has(CUSTOM_COMPONENT_DEFAULT) ?
      new Set([...propertyCollection.get(CUSTOM_COMPONENT_DEFAULT),
        ...propertyCollection.get(name)]) : propertyCollection.get(name),
    propCollection.has(CUSTOM_COMPONENT_DEFAULT) ?
      new Set([...propCollection.get(CUSTOM_COMPONENT_DEFAULT), ...propCollection.get(name)]) :
      propCollection.get(name),
    builderParamObjectCollection.has(CUSTOM_COMPONENT_DEFAULT) ?
      new Set([...builderParamObjectCollection.get(CUSTOM_COMPONENT_DEFAULT),
        ...builderParamObjectCollection.get(name)]) : builderParamObjectCollection.get(name),
    stateCollection.has(CUSTOM_COMPONENT_DEFAULT) ?
      new Set([...stateCollection.get(CUSTOM_COMPONENT_DEFAULT),
        ...stateCollection.get(name)]) : stateCollection.get(name),
    regularCollection.has(CUSTOM_COMPONENT_DEFAULT) ?
      new Set([...regularCollection.get(CUSTOM_COMPONENT_DEFAULT),
        ...regularCollection.get(name)]) : regularCollection.get(name),
    storagePropCollection.has(CUSTOM_COMPONENT_DEFAULT) ?
      new Set([...storagePropCollection.get(CUSTOM_COMPONENT_DEFAULT),
        ...storagePropCollection.get(name)]) : storagePropCollection.get(name),
    storageLinkCollection.has(CUSTOM_COMPONENT_DEFAULT) ?
      new Set([...storageLinkCollection.get(CUSTOM_COMPONENT_DEFAULT),
        ...storageLinkCollection.get(name)]) : storageLinkCollection.get(name),
    provideCollection.has(CUSTOM_COMPONENT_DEFAULT) ?
      new Set([...provideCollection.get(CUSTOM_COMPONENT_DEFAULT),
        ...provideCollection.get(name)]) : provideCollection.get(name),
    consumeCollection.has(CUSTOM_COMPONENT_DEFAULT) ?
      new Set([...consumeCollection.get(CUSTOM_COMPONENT_DEFAULT),
        ...consumeCollection.get(name)]) : consumeCollection.get(name),
    objectLinkCollection.has(CUSTOM_COMPONENT_DEFAULT) ?
      new Set([...objectLinkCollection.get(CUSTOM_COMPONENT_DEFAULT),
        ...objectLinkCollection.get(name)]) : objectLinkCollection.get(name),
    getNewLocalStorageMap(localStorageLinkCollection, name),
    getNewLocalStorageMap(localStoragePropCollection, name),
    builderParamInitialization.has(CUSTOM_COMPONENT_DEFAULT) ?
      new Set([...builderParamInitialization.get(CUSTOM_COMPONENT_DEFAULT),
        ...builderParamInitialization.get(name)]) : builderParamInitialization.get(name)
  );
}

function getNewLocalStorageMap(collection: Map<string, Map<string, Set<string>>>, name: string)
  : Map<string, Set<string>> {
  let localStorageLinkMap: Map<string, Set<string>> = new Map();
  if (collection.has(CUSTOM_COMPONENT_DEFAULT)) {
    const tempSet: Set<string> = new Set();
    if (collection.get(CUSTOM_COMPONENT_DEFAULT)) {
      for (const key of collection.get(CUSTOM_COMPONENT_DEFAULT).keys()) {
        tempSet.add(key);
      }
    }
    if (collection.get(name)) {
      for (const key of collection.get(name).keys()) {
        tempSet.add(key);
      }
    }
    localStorageLinkMap.set(name, tempSet);
  } else {
    localStorageLinkMap = collection.get(name);
  }
  return localStorageLinkMap;
}

function setDependencies(component: string, linkArray: Set<string>, propertyArray: Set<string>,
  propArray: Set<string>, builderParamArray: Set<string>, stateArray: Set<string>,
  regularArray: Set<string>, storagePropsArray: Set<string>, storageLinksArray: Set<string>,
  providesArray: Set<string>, consumesArray: Set<string>, objectLinksArray: Set<string>,
  localStorageLinkMap: Map<string, Set<string>>, localStoragePropMap: Map<string, Set<string>>,
  builderParamData: Set<string>): void {
  linkCollection.set(component, linkArray);
  propertyCollection.set(component, propertyArray);
  propCollection.set(component, propArray);
  builderParamObjectCollection.set(component, builderParamArray);
  objectLinkCollection.set(component, objectLinksArray);
  componentCollection.customComponents.add(component);
  stateCollection.set(component, stateArray);
  regularCollection.set(component, regularArray);
  storagePropCollection.set(component, storagePropsArray);
  storageLinkCollection.set(component, storageLinksArray);
  provideCollection.set(component, providesArray);
  consumeCollection.set(component, consumesArray);
  objectLinkCollection.set(component, objectLinksArray);
  localStorageLinkCollection.set(component, localStorageLinkMap);
  localStoragePropCollection.set(component, localStoragePropMap);
  builderParamInitialization.set(component, builderParamData);
}

function hasCollection(node: ts.Identifier): boolean {
  const name: string = node.escapedText.toString();
  return linkCollection.has(name) ||
    propCollection.has(name) ||
    propertyCollection.has(name) ||
    builderParamObjectCollection.has(name) ||
    stateCollection.has(name) ||
    regularCollection.has(name) ||
    storagePropCollection.has(name) ||
    storageLinkCollection.has(name) ||
    provideCollection.has(name) ||
    consumeCollection.has(name) ||
    objectLinkCollection.has(name) ||
    localStorageLinkCollection.has(name) ||
    localStoragePropCollection.has(name)
}

function isModule(filePath: string): boolean {
  return !/^(\.|\.\.)?\//.test(filePath) || filePath.indexOf(projectConfig.packageDir) > -1;
}

function isCustomComponent(node: ts.ClassDeclaration | ts.StructDeclaration): boolean {
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

let packageJsonEntry: string = '';

function isPackageJsonEntry(filePath: string): boolean {
  const packageJsonPath: string = path.join(filePath, projectConfig.packageJson);
  if (fs.existsSync(packageJsonPath)) {
    let entryTypes: string;
    let entryMain: string;
    try {
      const packageJson: Object =
        (projectConfig.packageManagerType === 'npm' ? JSON : JSON5).parse(fs.readFileSync(packageJsonPath).toString());
      entryTypes = packageJson.types;
      entryMain = packageJson.main;
    } catch (e) {
      return false;
    }
    if (entryExist(filePath, entryTypes)) {
      packageJsonEntry = path.resolve(filePath, entryTypes);
      return true;
    } else if (entryExist(filePath, entryMain)) {
      packageJsonEntry = path.resolve(filePath, entryMain);
      return true;
    }
  }
}

function entryExist(filePath: string, entry: string): boolean {
  return typeof entry === 'string' && fs.existsSync(path.resolve(filePath, entry)) &&
    fs.statSync(path.resolve(filePath, entry)).isFile();
}

function getModuleFilePath(filePath: string): string {
  if (filePath && path.extname(filePath) !== EXTNAME_ETS && isModule(filePath)) {
    filePath += EXTNAME_ETS;
  }
  return filePath;
}

function getFileResolvePath(fileResolvePath: string, pagesDir: string, filePath: string,
  projectPath: string): string {
  const moduleFilePath: string = getModuleFilePath(filePath);
  const defaultModule: string = path.join(projectPath, moduleFilePath);
  if (fs.existsSync(defaultModule)) {
    return defaultModule;
  }
  let entryModule: string;
  let etsModule: string;
  if (!projectConfig.aceModuleJsonPath) {
    entryModule = path.join(projectPath, '../../../../../', moduleFilePath);
    etsModule = path.join(projectPath, '../../', moduleFilePath);
  } else {
    entryModule = path.join(projectPath, '../../../../', moduleFilePath);
    etsModule = path.join(projectPath, '../', moduleFilePath);
  }
  if (fs.existsSync(entryModule)) {
    return entryModule;
  }
  if (fs.existsSync(etsModule)) {
    return etsModule;
  }
  let curPageDir: string = pagesDir;
  while (!fs.existsSync(fileResolvePath)) {
    if (filePath.indexOf(projectConfig.packageDir) > -1) {
      fileResolvePath = path.join(curPageDir, filePath);
    } else {
      fileResolvePath = path.join(curPageDir, projectConfig.packageDir, filePath);
    }
    if (fs.existsSync(fileResolvePath + EXTNAME_ETS)) {
      fileResolvePath = fileResolvePath + EXTNAME_ETS;
    } else if (isPackageJsonEntry(fileResolvePath)) {
      fileResolvePath = packageJsonEntry;
      if (fs.statSync(fileResolvePath).isDirectory()) {
        if (fs.existsSync(path.join(fileResolvePath, INDEX_ETS))) {
          fileResolvePath = path.join(fileResolvePath, INDEX_ETS);
        } else if (fs.existsSync(path.join(fileResolvePath, INDEX_TS))) {
          fileResolvePath = path.join(fileResolvePath, INDEX_TS);
        }
      }
    } else if (fs.existsSync(path.join(fileResolvePath, INDEX_ETS))) {
      fileResolvePath = path.join(fileResolvePath, INDEX_ETS);
    } else if (fs.existsSync(path.join(fileResolvePath, INDEX_TS))) {
      fileResolvePath = path.join(fileResolvePath, INDEX_TS);
    }
    if (curPageDir === path.parse(curPageDir).root) {
      break;
    }
    curPageDir = path.dirname(curPageDir);
  }
  return fileResolvePath;
}

export function getFileFullPath(filePath: string, pagesDir: string): string {
  if (filePath && path.extname(filePath) !== EXTNAME_ETS && path.extname(filePath) !== EXTNAME_TS &&
      !isModule(filePath)) {
    const dirIndexEtsPath: string = path.resolve(path.resolve(pagesDir, filePath), INDEX_ETS);
    const dirIndexTsPath: string = path.resolve(path.resolve(pagesDir, filePath), INDEX_TS);
    if (/^(\.|\.\.)\//.test(filePath) && !fs.existsSync(path.resolve(pagesDir, filePath + EXTNAME_ETS)) &&
      fs.existsSync(dirIndexEtsPath)) {
      filePath = dirIndexEtsPath;
    } else if (/^(\.|\.\.)\//.test(filePath) && !fs.existsSync(path.resolve(pagesDir, filePath + EXTNAME_TS)) &&
      fs.existsSync(dirIndexTsPath)) {
      filePath = dirIndexTsPath;
    } else {
      filePath += getExtensionIfUnfullySpecifiedFilepath(path.resolve(pagesDir, filePath));
    }
  }

  let fileResolvePath: string;
  if (/^(\.|\.\.)\//.test(filePath) && filePath.indexOf(projectConfig.packageDir) < 0) {
    fileResolvePath = path.resolve(pagesDir, filePath);
  } else if (/^\//.test(filePath) && filePath.indexOf(projectConfig.packageDir) < 0 ||
    fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    fileResolvePath = filePath;
  } else {
    fileResolvePath = getFileResolvePath(fileResolvePath, pagesDir, filePath, projectConfig.projectPath);
  }

  return fileResolvePath;
}

function validateModuleName(moduleNode: ts.Identifier, log: LogInfo[], sourceFile?: ts.SourceFile,
  fileResolvePath?: string): void {
  const moduleName: string = moduleNode.escapedText.toString();
  if (INNER_COMPONENT_NAMES.has(moduleName)) {
    const error: LogInfo = {
      type: LogType.ERROR,
      message: `The module name '${moduleName}' can not be the same as the inner component name.`,
      pos: moduleNode.getStart()
    };
    if (sourceFile && fileResolvePath) {
      const posOfNode: ts.LineAndCharacter = sourceFile.getLineAndCharacterOfPosition(moduleNode.getStart());
      const line: number = posOfNode.line + 1;
      const column: number = posOfNode.character + 1;
      Object.assign(error, {
        fileName: fileResolvePath,
        line: line,
        column: column
      });
    }
    log.push(error);
  }
}
