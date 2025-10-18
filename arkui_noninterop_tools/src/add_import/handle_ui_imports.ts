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
import * as fs from 'fs';

import * as ts from 'typescript';

import {
  API_PATH,
  ARKUI_BUILDER,
  ARKUI_EXTEND,
  ARKUI_STYLES,
  COMPONENT,
  DEFAULT,
  EXTNAME_D_ETS,
  EXTNAME_D_TS,
  GENERIC_T,
  NODE_MODULES,
  OHOS_ARKUI,
  OHOS_ARKUI_COMPONENT,
  OHOS_ARKUI_GLOBAL_ESVALUE,
  OHOS_ARKUI_STATEMANAGEMENT,
  OHOS_KIT_ARKUI,
} from './pre_define';
import {
  apiDir,
  apiInternalDir,
  whiteList,
  decoratorsWhiteList,
  whiteFileList,
} from './white_management';

export default class HandleUIImports {
  private readonly typeChecker: ts.TypeChecker;
  private readonly context: ts.TransformationContext;
  private readonly outPath: string;
  private readonly inputDir: string;
  private readonly exportFlag: boolean;
  private readonly printer: ts.Printer;

  private importedInterfaces: Set<string>;
  private interfacesNeedToImport: Set<string>;
  private readonly trueSymbolAtLocationCache: Map<ts.Node, ts.Symbol | null>;

  private dynamicImportCollection: Map<string, Set<string>>;
  private dynamicImportType: Map<string, ImportType>;

  private insertPosition: number;

  constructor(program: ts.Program, context: ts.TransformationContext, outPath: string,
    inputDir: string, exportFlag: boolean) {
    this.typeChecker = program.getTypeChecker();
    this.context = context;
    this.outPath = outPath;
    this.inputDir = inputDir;
    this.exportFlag = exportFlag;
    this.printer = ts.createPrinter();

    this.importedInterfaces = new Set<string>();
    this.interfacesNeedToImport = new Set<string>();
    this.trueSymbolAtLocationCache = new Map<ts.Node, ts.Symbol | null>();

    this.dynamicImportCollection = new Map();
    this.dynamicImportType = new Map();

    this.insertPosition = 0;
  }

  createCustomTransformer(sourceFile: ts.SourceFile): ts.SourceFile {
    if (sourceFile?.fileName) {
      const name = path.basename(sourceFile.fileName, path.extname(sourceFile.fileName));
      if (name.includes(OHOS_ARKUI_GLOBAL_ESVALUE)) {
        if (this.outPath) {
          this.writeSourceFileToOutPut(sourceFile);
        }
        if (this.exportFlag) {
          return ts.visitNode(sourceFile, this.visitGlobalESValueNode.bind(this));
        }
        return sourceFile;
      }
    }

    this.extractImportedNames(sourceFile);

    const statements = sourceFile.statements;
    for (let i = 0; i < statements.length; ++i) {
      const statement = statements[i];
      if (!ts.isJSDoc(statement) && !(ts.isExpressionStatement(statement) &&
        ts.isStringLiteral(statement.expression))) {
        this.insertPosition = i;
        break;
      }
    }

    return ts.visitNode(sourceFile, this.visitNode.bind(this));
  }

  visitGlobalESValueNode(node: ts.Node): ts.Node | undefined {
    if (ts.isTypeAliasDeclaration(node) && ts.isImportTypeNode(node.type)) {
      return this.processDynamicImportInType(node);
    }

    if (ts.isImportTypeNode(node)) {
      return this.processDynamicImportInImportTypeNode(node);
    }

    const result = ts.visitEachChild(node, this.visitGlobalESValueNode.bind(this), this.context);

    if (ts.isSourceFile(result)) {
      this.processSourceFileForDynamicImport(node as ts.SourceFile, result);
    }

    return result;
  }

  isStructDeclaration(node: ts.Node): boolean {
    // @ts-ignore
    return ts.isStructDeclaration(node);
  }

  visitNode(node: ts.Node): ts.Node | undefined {
    // @ts-ignore
    if (node.parent && this.isStructDeclaration(node.parent) && ts.isConstructorDeclaration(node)) {
      return undefined;
    }

    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier;
      if (ts.isStringLiteral(moduleSpecifier)) {
        const modulePath = moduleSpecifier.text;
        if ([OHOS_ARKUI_STATEMANAGEMENT, OHOS_ARKUI_COMPONENT].includes(modulePath)) {
          return node;
        } else if (modulePath.includes(COMPONENT + '/')) {
          return this.updateImportComponentPath(node, modulePath);
        }
      }
    }

    this.handleImportBuilder(node);
    const result = ts.visitEachChild(node, this.visitNode.bind(this), this.context);

    if (ts.isIdentifier(result) && !this.shouldSkipIdentifier(result)) {
      this.interfacesNeedToImport.add(result.text);
    } else if (ts.isSourceFile(result)) {
      this.addUIImports(result);
    }

    return result;
  }

  updateImportComponentPath(node: ts.ImportDeclaration, modulePath: string): ts.ImportDeclaration {
    return ts.factory.updateImportDeclaration(
      node,
      node.modifiers,
      node.importClause,
      ts.factory.createStringLiteral(
        modulePath.replace(/\.\.\/component\/.*/, OHOS_ARKUI_COMPONENT)
      ),
      node.assertClause
    );
  }

  processTypeWithLongMemberChain(node: ts.TypeAliasDeclaration, moduleName: string,
    memberChain: string[]): ts.TypeAliasDeclaration {
    return ts.factory.updateTypeAliasDeclaration(node,
      node.modifiers,
      node.name,
      node.typeParameters,
      ts.factory.createTypeReferenceNode(
        ts.factory.createQualifiedName(
          ts.factory.createIdentifier(moduleName),
          ts.factory.createIdentifier(memberChain[1])
        ),
        undefined
      )
    );
  }

  getModulePath(node: ts.ImportTypeNode): string {
    return ((node.argument as unknown as ts.LiteralTypeNode)
      .literal as unknown as ts.StringLiteral).text;
  }

  processDynamicImportInType(node: ts.TypeAliasDeclaration): ts.Node {
    const typeName = node.name.text;
    const importType = node.type as ts.ImportTypeNode;
    const modulePath = this.getModulePath(importType);
    const moduleName = this.extractLastSegment(modulePath);
    const memberChain = this.extractFromImportTypeNode(importType);
    const hasGeneric = !!node.typeParameters?.length;

    if (!this.hasDefaultInMemberChain(memberChain) &&
      (!hasGeneric || !node.typeParameters[0].default)) {

      if (memberChain.length > 1) {
        return this.processTypeWithLongMemberChain(node, moduleName, memberChain);
      }
      this.collectDynamicImport(modulePath, typeName);
      return this.processTypeWithoutDefaultOnly(typeName, modulePath);
    }

    if (this.hasDefaultInMemberChain(memberChain) && memberChain.length > 1) {
      this.collectDynamicImport(modulePath, moduleName);
      return this.processTypeWithDefaultAndLongMemberChain(node, modulePath, moduleName, memberChain);
    }

    if (this.hasDefaultInMemberChain(memberChain) && memberChain.length === 1) {
      this.collectDynamicImport(modulePath, typeName);
      return this.processTypeWithDefaultAndOneMember(typeName, modulePath);
    }

    if (hasGeneric && node.typeParameters[0].default) {
      this.collectDynamicImport(modulePath, typeName);
      return this.processHasGeneric(node, typeName, modulePath);
    }

    return node;
  }

  processDynamicImportInImportTypeNode(node: ts.ImportTypeNode): ts.Node {
    const modulePath = this.getModulePath(node);
    const moduleName = this.extractLastSegment(modulePath);
    const memberChain = this.extractFromImportTypeNode(node);

    if (memberChain.includes(DEFAULT)) {
      this.setImportType(modulePath, ImportType.DEFAULT);
      this.collectDynamicImport(modulePath, moduleName);
      return ts.factory.createIdentifier(moduleName);
    } else if (memberChain.length) {
      this.setImportType(modulePath, ImportType.NAMED);
      this.collectDynamicImport(modulePath, memberChain[0]);
      return ts.factory.createTypeReferenceNode(
        node.qualifier as ts.Identifier,
        node.typeArguments
      );
    }
    return node;
  }

  processSourceFileForDynamicImport(node: ts.SourceFile, result: ts.SourceFile): void {
    const newStatements = [...result.statements];
    if (this.dynamicImportCollection.size) {
      this.addImportForDynamicImport(newStatements);
    }

    const updatedStatements = ts.factory.createNodeArray(newStatements);
    const updatedSourceFile = ts.factory.updateSourceFile(node,
      updatedStatements,
      node.isDeclarationFile,
      node.referencedFiles,
      node.typeReferenceDirectives,
      node.hasNoDefaultLib,
      node.libReferenceDirectives
    );

    const updatedCode = this.printer.printFile(updatedSourceFile);
    if (this.outPath) {
      this.writeSourceFileToOutPut(updatedSourceFile, updatedCode);
    } else {
      fs.writeFileSync(updatedSourceFile.fileName, updatedCode);
    }
  }

  addUIImports(node: ts.SourceFile): void {
    const newStatements = [...node.statements];

    const compImportSpecifiers: ts.ImportSpecifier[] = [];
    const stateImportSpecifiers: ts.ImportSpecifier[] = [];

    this.interfacesNeedToImport.forEach((interfaceName) => {
      if (this.importedInterfaces.has(interfaceName)) {
        return;
      }
      const identifier = ts.factory.createIdentifier(interfaceName);
      if (decoratorsWhiteList.includes(interfaceName)) {
        stateImportSpecifiers.push(ts.factory.createImportSpecifier(false, undefined, identifier));
      } else {
        compImportSpecifiers.push(ts.factory.createImportSpecifier(false, undefined, identifier));
      }
    });

    if (compImportSpecifiers.length + stateImportSpecifiers.length > 0) {
      this.processAddUIImport(node, compImportSpecifiers, stateImportSpecifiers, newStatements);
    }

    this.processSourceFileForUIImport(node, newStatements);
  }

  processTypeWithoutDefaultOnly(typeName: string, modulePath: string): ts.ExportDeclaration {
    this.setImportType(modulePath, ImportType.NAMED);
    return ts.factory.createExportDeclaration(
      undefined,
      false,
      ts.factory.createNamedExports([ts.factory.createExportSpecifier(
        false,
        undefined,
        ts.factory.createIdentifier(typeName)
      )]),
      undefined,
      undefined
    );
  }

  processTypeWithDefaultAndLongMemberChain(node: ts.TypeAliasDeclaration, modulePath: string,
    moduleName: string, memberChain: string[]): ts.TypeAliasDeclaration {
    this.setImportType(modulePath, ImportType.DEFAULT);
    return ts.factory.updateTypeAliasDeclaration(node,
      node.modifiers,
      node.name,
      node.typeParameters,
      ts.factory.createTypeReferenceNode(
        ts.factory.createQualifiedName(
          ts.factory.createIdentifier(moduleName),
          ts.factory.createIdentifier(memberChain[1])
        ),
        undefined
      )
    );
  }

  processTypeWithDefaultAndOneMember(typeName: string, modulePath: string): ts.ExportDeclaration {
    this.setImportType(modulePath, ImportType.DEFAULT);
    return ts.factory.createExportDeclaration(
      undefined,
      false,
      ts.factory.createNamedExports([ts.factory.createExportSpecifier(
        false,
        undefined,
        ts.factory.createIdentifier(typeName)
      )]),
      undefined,
      undefined
    );
  }

  processHasGeneric(node: ts.TypeAliasDeclaration, typeName: string,
    modulePath: string): ts.TypeAliasDeclaration {
    this.setImportType(modulePath, ImportType.ALIAS);
    return ts.factory.updateTypeAliasDeclaration(node,
      node.modifiers,
      node.name,
      node.typeParameters,
      ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier(typeName + GENERIC_T),
        [ts.factory.createTypeReferenceNode(
          ts.factory.createIdentifier(GENERIC_T),
          undefined
        )]
      )
    );
  }

  addImportForDynamicImport(newStatements: ts.Statement[]): void {
    this.dynamicImportCollection.forEach((value, key) => {
      if (this.dynamicImportType.get(key) === ImportType.DEFAULT) {
        newStatements.splice(1, 0, ts.factory.createImportDeclaration(undefined,
          ts.factory.createImportClause(false,
            ts.factory.createIdentifier(Array.from(value)[0]), undefined),
          ts.factory.createStringLiteral(key),
          undefined
        ));
      } else if (this.dynamicImportType.get(key) === ImportType.NAMED) {
        const namedImports = ts.factory.createNamedImports(Array.from(value).map(v => {
          return ts.factory.createImportSpecifier(false, undefined,
            ts.factory.createIdentifier(v));
        }));
        newStatements.splice(1, 0, ts.factory.createImportDeclaration(undefined,
          ts.factory.createImportClause(false, undefined, namedImports),
          ts.factory.createStringLiteral(key), undefined
        ));
      } else {
        newStatements.splice(1, 0, ts.factory.createImportDeclaration(undefined,
          ts.factory.createImportClause(false, undefined,
            ts.factory.createNamedImports([ts.factory.createImportSpecifier(false,
              ts.factory.createIdentifier(Array.from(value)[0]),
              ts.factory.createIdentifier(Array.from(value)[0] + 'T')
            )])
          ),
          ts.factory.createStringLiteral(key), undefined
        ));
      }
    });

    this.createPromptActionDefaultImport(newStatements);
  }

  createPromptActionDefaultImport(newStatements: ts.Statement[]): void {
    newStatements.splice(1, 0, ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        false,
        ts.factory.createIdentifier('promptAction'),
        undefined
      ),
      ts.factory.createStringLiteral('./@ohos.promptAction'),
      undefined
    ));
  }

 extractFromImportTypeNode(importTypeNode: ts.ImportTypeNode): string[] {
    if (!importTypeNode.qualifier) {
      return [];
    }

    return importTypeNode.qualifier.getText().split('.');
  }

  collectDynamicImport(k: string, v: string): void {
    if (this.dynamicImportCollection.has(k)) {
      this.dynamicImportCollection.get(k)!.add(v);
    } else {
      this.dynamicImportCollection.set(k, new Set([v]));
    }
  }

  extractLastSegment(path: string): string {
    const slashIndex = path.lastIndexOf('/');
    const dotIndex = path.lastIndexOf('.');

    const lastSeparatorIndex = Math.max(slashIndex, dotIndex);
    if (lastSeparatorIndex !== -1 && lastSeparatorIndex < path.length - 1) {
        return path.slice(lastSeparatorIndex + 1);
    }

    return '';
  }

  hasDefaultInMemberChain(memberChain: string[]): boolean {
    return memberChain.includes(DEFAULT);
  }

  setImportType(modulePath: string, type: ImportType): void {
    this.dynamicImportType.set(modulePath, type);
  }

  handleImportBuilder(node: ts.Node): void {
    ts.getDecorators(node as ts.HasDecorators)?.forEach(element => {
      if (element?.getText() === '@' + ARKUI_BUILDER) {
        this.interfacesNeedToImport.add(ARKUI_BUILDER);
        return;
      }
    });
  }

  hasKitArkUI(node: ts.SourceFile): boolean {
    return node.text?.includes(OHOS_KIT_ARKUI);
  }

  getCoreFilename(fileName: string): string {
    if (fileName.endsWith(EXTNAME_D_ETS)) {
      return fileName.slice(0, -EXTNAME_D_ETS.length);
    }
    if (fileName.endsWith(EXTNAME_D_TS)) {
      return fileName.slice(0, -EXTNAME_D_TS.length);
    }
    return fileName;
  }

  isNeedAddImports(node: ts.SourceFile): boolean {
    if (!ts.isSourceFile(node)) {
      return false;
    }

    if (node.fileName.includes(OHOS_ARKUI) ||
      whiteFileList.includes(this.getCoreFilename(path.basename(node.fileName))) ||
      this.hasKitArkUI(node)) {
      return true;
    }

    return false;
  }

  processSourceFileForUIImport(node: ts.SourceFile, newStatements: ts.Statement[]): void {
    const updatedStatements = ts.factory.createNodeArray(newStatements);
    const updatedSourceFile = ts.factory.updateSourceFile(node,
      updatedStatements,
      node.isDeclarationFile,
      node.referencedFiles,
      node.typeReferenceDirectives,
      node.hasNoDefaultLib,
      node.libReferenceDirectives
    );

    const updatedCode = this.printer.printFile(updatedSourceFile);
    if (this.outPath) {
      this.writeSourceFileToOutPut(updatedSourceFile, updatedCode);
    } else {
      fs.writeFileSync(updatedSourceFile.fileName, updatedCode);
    }
  }

  writeSourceFileToOutPut(sourceFile: ts.SourceFile, context: string = sourceFile.text): void {
    const outFile: string = path.resolve(sourceFile.fileName.replace(this.inputDir,
      this.outPath));
    this.safeWriteFileSync(outFile, context);
  }

  safeWriteFileSync(filePath: string, content: string): void {
    const dir: string = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content);
  }

  addArkUIPath(node: ts.SourceFile, moduleName: string): string {
    if (ts.isSourceFile(node)) {
      const fileName = node.fileName;
      if (apiDir.some(path => fileName.includes(API_PATH + path + '/'))) {
        return '.' + moduleName;
      } else if (apiInternalDir.some(path => fileName.includes(API_PATH + path + '/'))) {
        return '../.' + moduleName;
      }
    }
    return moduleName;
  }

  processAddUIImport(node: ts.SourceFile, compImportSpecifiers: ts.ImportSpecifier[],
    stateImportSpecifiers: ts.ImportSpecifier[], newStatements: ts.Statement[]): void {
    if (!this.isNeedAddImports(node)) {
      return;
    }

    if (compImportSpecifiers.length) {
      const moduleName = this.addArkUIPath(node, OHOS_ARKUI_COMPONENT);
      const compImportDeclaration = ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(false,
          undefined,
          ts.factory.createNamedImports(
            compImportSpecifiers
          )
        ),
        ts.factory.createStringLiteral(moduleName, true),
        undefined
      );
      newStatements.splice(this.insertPosition, 0, compImportDeclaration);
    }

    if (stateImportSpecifiers.length) {
      const moduleName = this.addArkUIPath(node, OHOS_ARKUI_STATEMANAGEMENT);
      const stateImportDeclaration = ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(false,
          undefined,
          ts.factory.createNamedImports(
            stateImportSpecifiers
          )
        ),
        ts.factory.createStringLiteral(moduleName, true),
        undefined
      );
      newStatements.splice(this.insertPosition, 0, stateImportDeclaration);
    }
  }

  getDeclarationNode(node: ts.Node): ts.Declaration | undefined {
    const symbol = this.trueSymbolAtLocation(node);
    return HandleUIImports.getDeclaration(symbol);
  }

  static getDeclaration(tsSymbol: ts.Symbol | undefined): ts.Declaration | undefined {
    if (tsSymbol?.declarations && tsSymbol.declarations.length > 0) {
      return tsSymbol.declarations[0];
    }

    return undefined;
  }

  followIfAliased(symbol: ts.Symbol): ts.Symbol {
    if ((symbol.getFlags() & ts.SymbolFlags.Alias) !== 0) {
      return this.typeChecker.getAliasedSymbol(symbol);
    }

    return symbol;
  }

  trueSymbolAtLocation(node: ts.Node): ts.Symbol | undefined {
    const cache = this.trueSymbolAtLocationCache;
    const val = cache.get(node);

    if (val !== undefined) {
      return val !== null ? val : undefined;
    }

    let symbol = this.typeChecker.getSymbolAtLocation(node);

    if (symbol === undefined) {
      cache.set(node, null);
      return undefined;
    }

    symbol = this.followIfAliased(symbol);
    cache.set(node, symbol);

    return symbol;
  }

  shouldSkipIdentifier(identifier: ts.Identifier): boolean {
    const name = identifier.text;
    const skippedList = new Set([ARKUI_EXTEND, ARKUI_STYLES]);
    if (skippedList.has(name)) {
      return true;
    }

    if (!whiteList.has(name)) {
      return true;
    }

    const symbol = this.typeChecker.getSymbolAtLocation(identifier);
    if (symbol) {
      const decl = this.getDeclarationNode(identifier);
      if (this.isDeclFromSDK(decl, identifier)) {
        return true;
      }
    }

    return this.interfacesNeedToImport.has(name);
  }

  isDeclFromSDK(decl: ts.Declaration | undefined, identifier: ts.Identifier): boolean {
    const rootNode = decl?.getSourceFile();
    if (!rootNode) {
      return false;
    }

    if (rootNode === identifier.getSourceFile()) {
      return true;
    }

    const fileName = rootNode.fileName;
    if (!fileName.includes(NODE_MODULES) && fileName.includes(this.inputDir)) {
      return true;
    }

    return false;
  }

  extractImportedNames(sourceFile: ts.SourceFile): void {
    for (const statement of sourceFile.statements) {
      if (!ts.isImportDeclaration(statement)) {
        continue;
      }

      const importClause = statement.importClause;
      if (!importClause) {
        continue;
      }

      const namedBindings = importClause.namedBindings;
      if (!namedBindings || !ts.isNamedImports(namedBindings)) {
        continue;
      }

      for (const specifier of namedBindings.elements) {
        const importedName = specifier.name.getText(sourceFile);
        this.importedInterfaces.add(importedName);
      }
    }
  }
}

enum ImportType {
  DEFAULT = 0,
  NAMED = 1,
  ALIAS = 2,
  DEFAULT_AND_NAMED = 3,
}
