/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
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
import fs from 'fs';
import path from 'path';

import {
  FileLog,
  LogType
} from './utils';
import { projectConfig } from '../main';
import { ModuleSourceFile } from './fast_build/ark_compiler/module/module_source_file';
import { collectKitModules } from './fast_build/system_api/rollup-plugin-system-api';

/*
* basic implementation logic:
* tsc -> transformer
*           | -> iterate top-level static import/export declaration
*                  | -> for each declaration
*                        | -> collect KitInfo
*                        | -> generate corresponding ohosImports for each ohos-source
*                  | -> replace each origin declaration with corresponding ohosImports
*/

export const kitTransformLog: FileLog = new FileLog();
export let hasTsNoCheckOrTsIgnoreFiles: string[] = [];
export let compilingEtsOrTsFiles: string[] = [];

const KIT_PREFIX = '@kit.';

/*
* This API is the TSC Transformer for transforming `KitImport` into `OhosImport`
* e.g.
*    ```
*      import { ability, ErrorCode } from '@kit.AbilityKit'
*      --->
*      import ability from '@ohos.ability.ability'
*      import ErrorCode from '@ohos.ability.errorCode'
*    ```
*/
export function processKitImport(): Function {
  return (context: ts.TransformationContext) => {
    const visitor: ts.Visitor = node => {
      // only transform static import/export declaration
      if (ts.isImportDeclaration(node) || (ts.isExportDeclaration(node) && node.moduleSpecifier)) {
        const moduleRequest: string = (node.moduleSpecifier as ts.StringLiteral).text.replace(/'|"/g, '');
        if (moduleRequest.startsWith(KIT_PREFIX)) {
          const kitDefs = getKitDefs(moduleRequest);
          if (kitDefs && kitDefs.symbols) {
            KitInfo.processKitInfo(moduleRequest, kitDefs.symbols as KitSymbols, node);
            return [...KitInfo.getCurrentKitInfo().getOhosImportNodes()];
          } else {
            kitTransformLog.errors.push({
              type: LogType.ERROR,
              message: `Kit '${moduleRequest}' has no corresponding config file in ArkTS SDK. `+
                       `Please make sure the Kit apis are consistent with SDK ` +
                       `and there's no local modification on Kit apis.`,
              pos: node.getStart()
            });
          }
        }
      }
      return node;
    }

    return (node: ts.SourceFile) => {
      compilingEtsOrTsFiles.push(path.normalize(node.fileName));

      KitInfo.init(node, context);

      if (projectConfig.processTs === true) {
        if (ts.hasTsNoCheckOrTsIgnoreFlag(node)) {
          hasTsNoCheckOrTsIgnoreFiles.push(path.normalize(node.fileName));
          // process KitImport transforming
          return ts.visitEachChild(node, visitor, context); // this node used for [writeFile]
        }
        // process [ConstEnum] + [TypeExportImport] + [KitImport] transforming
        const processedNode: ts.SourceFile =
          ts.visitEachChild(ts.getTypeExportImportAndConstEnumTransformer(context)(node), visitor, context);
        ModuleSourceFile.newSourceFile(path.normalize(processedNode.fileName), processedNode);
        return node; // this node not used for [writeFile]
      }
      // process KitImport transforming
      return ts.visitEachChild(node, visitor, context);
    };
  }
}

/*
*  Main implementation of Transforming
*/
const DEFAULT_BINDINGS = 'default';

enum FileType {
  ETS,
  TS
}

interface KitSymbol {
  source: string
  bindings: string
}

declare type KitSymbols = Record<string, KitSymbol>;
declare type TSspecifier = ts.ImportSpecifier | ts.ExportSpecifier;
declare type TSModuleDeclaration = ts.ImportDeclaration | ts.ExportDeclaration;

/*
* class SpecificerInfo represents the corresponding info of each imported identifier which coming from Kit
*/
class SpecificerInfo {
  private localName: string;
  private importName: string;
  private symbol: KitSymbol;
  private renamed: boolean;

  private originElement: TSspecifier | undefined;

  constructor(localName: string, importName: string, symbol: KitSymbol, originElement: TSspecifier | undefined) {
    this.localName = localName;
    this.importName = importName;
    this.symbol = symbol;
    this.originElement = originElement;
    this.renamed = (this.localName !== this.symbol.bindings);

    this.validateImportingETSDeclarationSymbol();
  }

  getSource(): string {
    return this.symbol.source;
  }

  getLocalName(): string {
    return this.localName;
  }

  isRenamed(): boolean {
    return this.renamed;
  }

  getBindings(): string {
    return this.symbol.bindings;
  }

  isDefaultBinding(): boolean {
    return this.symbol.bindings === DEFAULT_BINDINGS;
  }

  validateImportingETSDeclarationSymbol() {
    if (KitInfo.isTSFile() && /.d.ets$/.test(this.symbol.source)) {
      kitTransformLog.errors.push({
        type: LogType.ERROR,
        message: `Identifier '${this.importName}' comes from '${this.symbol.source}' ` +
                 `which can not be imported in .ts file.`,
        pos: this.getOriginElementNode().getStart()
      });
    }
  }

  setOriginElementNode(originElement: TSspecifier) {
    this.originElement = originElement;
  }

  getOriginElementNode(): TSspecifier {
    return this.originElement;
  }
}

export class KitInfo {
  private static currentKitInfo: KitInfo = undefined;
  private static currentFileType: FileType = FileType.ETS;
  private static currentKitName: string = '';
  private static currentSourcefile: string = '';
  private static needSkipType: boolean = true;
  private static tsEmitResolver: any;

  private symbols: KitSymbols;
  private kitNode: TSModuleDeclaration;
  private kitNodeModifier: readonly ts.Modifier[] | undefined;
  private specifiers: Map<string, SpecificerInfo[]> = new Map<string, SpecificerInfo[]>();

  private ohosImportNodes: TSModuleDeclaration[] = [];

  constructor(kitNode: TSModuleDeclaration, symbols: Record<string, KitSymbol>) {
    this.kitNode = kitNode;
    this.symbols = symbols;

    this.kitNodeModifier = ts.canHaveDecorators(this.kitNode) ? ts.getModifiers(this.kitNode) : undefined;
  }

  static init(node: ts.SourceFile, context: ts.TransformationContext): void {
    // @ts-ignore
    this.tsEmitResolver = context.getEmitResolver();
    this.currentSourcefile = node.fileName;
    if (/\.ts$/.test(node.fileName)) {
      this.setFileType(FileType.TS);
    } else {
      this.setFileType(FileType.ETS);
    }

    if (projectConfig.processTs === true && !ts.hasTsNoCheckOrTsIgnoreFlag(node)) {
      this.needSkipType = false;
    } else {
      this.needSkipType = true;
    }

    kitTransformLog.sourceFile = node;
  }

  static getCurrentKitName(): string {
    return this.currentKitName;
  }

  static getCurrentKitInfo(): KitInfo {
    return this.currentKitInfo;
  }

  static setFileType(fileType: FileType): void {
    this.currentFileType = fileType;
  }

  static isTSFile(): boolean {
    return this.currentFileType === FileType.TS;
  }

  static getCurrentSourcefile(): string {
    return this.currentSourcefile;
  }

  static needSkipTypeSymbolOfNode(node: ts.Node): boolean {
    if (!this.needSkipType) {
      return false;
    }

    // need to skip type symbol
    const resolver = this.tsEmitResolver;
    let isTypeSymbol: boolean = false;
    switch(node.kind) {
      case ts.SyntaxKind.ImportDeclaration:
      case ts.SyntaxKind.ImportClause: {
        const importClause = ts.isImportClause(node) ? node : (node as ts.ImportDeclaration).importClause;
        if (importClause) {
          isTypeSymbol = importClause.isTypeOnly;
          if (importClause.name &&
            !resolver.isReferencedAliasDeclaration(importClause) && resolver.isReferenced(node)) {
              isTypeSymbol = true;
          }
        }
        break;
      }
      case ts.SyntaxKind.ImportSpecifier: {
        isTypeSymbol = (node as ts.ImportSpecifier).isTypeOnly;
        if (!resolver.isReferencedAliasDeclaration(node) && resolver.isReferenced(node)) {
          isTypeSymbol = true;
        }
        break;
      }
      case ts.SyntaxKind.ExportDeclaration: {
        isTypeSymbol = (node as ts.ExportDeclaration).isTypeOnly;
        break;
      }
      case ts.SyntaxKind.ExportSpecifier: {
        isTypeSymbol = (node as ts.ExportSpecifier).isTypeOnly;
        if (!resolver.isValueAliasDeclaration(node)) {
          isTypeSymbol = true;
        }
        break;
      }
    }
    return isTypeSymbol;
  }

  static processImportDecl(kitNode: ts.ImportDeclaration, symbols: Record<string, KitSymbol>) {
    if (kitNode.importClause!.namedBindings) {
      const namedBindings: ts.NamedImportBindings = kitNode.importClause.namedBindings;
      if (ts.isNamespaceImport(namedBindings)) {
        // e.g. import * as ns from "@kit.xxx"
        this.currentKitInfo = new NameSpaceKitInfo(kitNode, symbols);
      }
      if (ts.isNamedImports(namedBindings) && namedBindings.elements.length !== 0) {
        // e.g. import { ... } from "@kit.xxx"
        this.currentKitInfo = new ImportSpecifierKitInfo(kitNode, symbols);
        namedBindings.elements.forEach(element => { this.currentKitInfo.collectSpecifier(element) });
      }
    }

    if (kitNode.importClause!.name && !this.needSkipTypeSymbolOfNode(kitNode.importClause)) {
      // e.g. import default from "@kit.xxx"
      const defaultName: string = kitNode.importClause.name.text;
      if (!this.currentKitInfo) {
        this.currentKitInfo = new ImportSpecifierKitInfo(kitNode, symbols);
      }
      this.currentKitInfo.newSpecificerInfo(defaultName, DEFAULT_BINDINGS, undefined);
    }
  }

  static processExportDecl(kitNode: ts.ExportDeclaration, symbols: Record<string, KitSymbol>) {
    if (kitNode.exportClause) {
      const namedExportBindings: ts.NamedExportBindings = kitNode.exportClause;
      if (ts.isNamespaceExport(namedExportBindings)) {
        // e.g. export * as ns from "@kit.xxx"
        this.currentKitInfo = new NameSpaceKitInfo(kitNode, symbols);
      } else if (ts.isNamedExports(namedExportBindings) && namedExportBindings.elements.length !== 0) {
        // e.g. export { ... } from "@kit.xxx"
        this.currentKitInfo = new ExportSpecifierKitInfo(kitNode, symbols);
        namedExportBindings.elements.forEach(element => { this.currentKitInfo.collectSpecifier(element) });
      }
    } else {
      this.currentKitInfo = new ExportStarKitInfo(kitNode, symbols);
    }
  }

  static processKitInfo(kitName: string, symbols: Record<string, KitSymbol>, kitNode: TSModuleDeclaration): void {
    this.currentKitName = kitName;

    // do not handle an empty import
    if (ts.isImportDeclaration(kitNode) && kitNode.importClause) {
      // case 1: import { ... } from '@kit.xxx'
      // case 2: import * as ns from '@kit.xxx'
      // case 3: import defalutValue from '@kit.xxx'
      this.processImportDecl(kitNode, symbols);
    }

    if (ts.isExportDeclaration(kitNode) && kitNode.moduleSpecifier) {
      // case 1: export { ... } from '@kit.xxx'
      // case 2: export * from '@kit.xxx'
      // case 3: export * as ns from '@kit.xxx' - considering forbidden
      this.processExportDecl(kitNode, symbols);
    }
    // transform into ohos imports or exports
    this.currentKitInfo && this.currentKitInfo.transform();
  }

  static cleanUp(): void {
    this.currentKitInfo = undefined;
    this.tsEmitResolver = undefined;
  }

  getSymbols(): KitSymbols {
    return this.symbols;
  }

  getKitNode(): TSModuleDeclaration {
    return this.kitNode;
  }

  getKitNodeModifier(): readonly ts.Modifier[] | undefined {
      return this.kitNodeModifier;
  }

  getSpecifiers(): Map<string, SpecificerInfo[]> {
    return this.specifiers;
  }

  getOhosImportNodes(): TSModuleDeclaration[] {
    return this.ohosImportNodes;
  }

  newSpecificerInfo(localName: string, importName: string, originElement: TSspecifier | undefined): void {
    const symbol: KitSymbol | undefined = this.symbols[importName];
    if (symbol) {
      const specifier: SpecificerInfo = new SpecificerInfo(localName, importName, symbol, originElement);
      if (this.specifiers.has(symbol.source)) {
        this.specifiers.get(symbol.source).push(specifier);
      } else {
        this.specifiers.set(symbol.source, [specifier]);
      }
    } else {
      kitTransformLog.errors.push({
        type: LogType.ERROR,
        message: `'${importName}' is not exported from Kit '${KitInfo.getCurrentKitName()}.`,
        pos: originElement ? originElement.getStart() : this.getKitNode().getStart()
      });
    }
  }

  collectSpecifier(element: TSspecifier) {
    if (KitInfo.needSkipTypeSymbolOfNode(this.getKitNode()) || KitInfo.needSkipTypeSymbolOfNode(element)) {
      // skip type symbol
      return;
    }

    const localName: string = element.name.text;
    const importName: string = element.propertyName ? element.propertyName.text : localName;
    this.newSpecificerInfo(localName, importName, element);
  }

  // @ts-ignore
  transform(): void {} //override api
}

class NameSpaceKitInfo extends KitInfo {
  private namespaceName: string;
  private localNameTable: string[] = [];

  constructor(kitNode: ts.ImportDeclaration | ts.ExportDeclaration, symbols: Record<string, KitSymbol>) {
    super(kitNode, symbols);

    kitTransformLog.errors.push({
      type: LogType.ERROR,
      message: `Namespace import or export of Kit is not supported currently.`,
      pos: kitNode.getStart()
    });
  }

  transform(): void {
  }
}

class ImportSpecifierKitInfo extends KitInfo {
  private namedBindings: ts.ImportSpecifier[] = [];
  private specifierDefaultName: ts.Identifier | undefined = undefined;

  constructor(kitNode: ts.ImportDeclaration, symbols: Record<string, KitSymbol>) {
    super(kitNode, symbols);
  }

  private hasNamedBindings(): boolean {
    return this.namedBindings.length !== 0;
  }

  private clearSpecifierKitInfo(): void {
    this.namedBindings = [];
    this.specifierDefaultName = undefined;
  }

  transform() {
    const node: ts.ImportDeclaration = this.getKitNode() as ts.ImportDeclaration;

    this.getSpecifiers().forEach((specifiers: SpecificerInfo[], source: string) => {
      collectKitModules(KitInfo.getCurrentSourcefile(), KitInfo.getCurrentKitName(), source);
      specifiers.forEach((specifier: SpecificerInfo) => {
        if (specifier.isDefaultBinding()) {
          this.specifierDefaultName = ts.factory.createIdentifier(specifier.getLocalName());
        } else {
          this.namedBindings.push(
            ts.factory.createImportSpecifier(
              specifier.getOriginElementNode() ?
                (specifier.getOriginElementNode() as ts.ImportSpecifier).isTypeOnly : node.importClause.isTypeOnly,
              specifier.isRenamed() ? ts.factory.createIdentifier(specifier.getBindings()) : undefined,
              ts.factory.createIdentifier(specifier.getLocalName())
            )
          );
        }
      });

      this.getOhosImportNodes().push(ts.factory.createImportDeclaration(
        this.getKitNodeModifier(),
        ts.factory.createImportClause(
          node.importClause!.isTypeOnly,
          this.specifierDefaultName,
          this.hasNamedBindings() ? ts.factory.createNamedImports(this.namedBindings) : undefined
        ),
        ts.factory.createStringLiteral(trimSourceSuffix(source))
      ));

      this.clearSpecifierKitInfo();
    });
  }
}

class ExportSpecifierKitInfo extends KitInfo {
  private namedBindings: ts.ExportSpecifier[] = [];

  constructor(kitNode: ts.ExportDeclaration, symbols: Record<string, KitSymbol>) {
    super(kitNode, symbols);
  }

  private hasNamedBindings(): boolean {
    return this.namedBindings.length !== 0;
  }

  private clearSpecifierKitInfo(): void {
    this.namedBindings = [];
  }

  transform(): void {
    const node: ts.ExportDeclaration = this.getKitNode() as ts.ExportDeclaration;

    this.getSpecifiers().forEach((specifiers: SpecificerInfo[], source: string) => {
      specifiers.forEach((specifier: SpecificerInfo) => {
        this.namedBindings.push(
          ts.factory.createExportSpecifier(
            (specifier.getOriginElementNode() as ts.ExportSpecifier).isTypeOnly,
            specifier.isRenamed() ? ts.factory.createIdentifier(specifier.getBindings()) : undefined,
            ts.factory.createIdentifier(specifier.getLocalName())
          )
        );
      });

      this.getOhosImportNodes().push(ts.factory.createExportDeclaration(
        this.getKitNodeModifier(),
        node.isTypeOnly,
        this.hasNamedBindings() ? ts.factory.createNamedExports(this.namedBindings) : undefined,
        ts.factory.createStringLiteral(trimSourceSuffix(source)),
        node.assertClause
      ));

      this.clearSpecifierKitInfo();
    });
  }
}

class ExportStarKitInfo extends KitInfo {
  private sourceSet: Set<string> = new Set<string>();

  constructor(kitNode: ts.ExportDeclaration, symbols: Record<string, KitSymbol>) {
    super(kitNode, symbols);

    for (const symbol in symbols) {
      this.sourceSet.add(symbols[symbol].source);
    }

    kitTransformLog.errors.push({
      type: LogType.WARN,
      message: `Using 'export *' will load all the sub-module of Kit in runtime.`,
      pos: this.getKitNode().getStart()
    });
  }

  transform(): void {
    const node: ts.ExportDeclaration = this.getKitNode() as ts.ExportDeclaration;

    this.sourceSet.forEach((source: string) => {
      this.getOhosImportNodes().push(ts.factory.createExportDeclaration(
        this.getKitNodeModifier(),
        node.isTypeOnly,
        undefined,
        ts.factory.createStringLiteral(trimSourceSuffix(source)),
        node.assertClause
      ));
    });
  }
}

/*
* utils part
*/
const JSON_SUFFIX = '.json';
const KIT_CONFIGS = 'kit_configs';
const KIT_CONFIG_PATH = './build-tools/ets-loader/kit_configs';

function getKitDefs(kitModuleRequest: string) {
  const kitConfigs: string[] = [path.resolve(__dirname, `../${KIT_CONFIGS}`)];
  if (process.env.externalApiPaths) {
    const externalApiPaths = process.env.externalApiPaths.split(path.delimiter);
    externalApiPaths.forEach(sdkPath => {
      kitConfigs.push(path.resolve(sdkPath, KIT_CONFIG_PATH));
    });
  }

  for (const kitConfig of kitConfigs) {
    const kitModuleConfigJson = path.resolve(kitConfig, `./${kitModuleRequest}${JSON_SUFFIX}`);
    if (fs.existsSync(kitModuleConfigJson)) {
      return JSON.parse(fs.readFileSync(kitModuleConfigJson, 'utf-8'));
    }
  }
  return undefined;
}

function trimSourceSuffix(source: string): string {
  return source.replace(/\.d.[e]?ts$/, '');
}

export function cleanUpKitImportObjects(): void {
  KitInfo.cleanUp();
  kitTransformLog.cleanUp();
  hasTsNoCheckOrTsIgnoreFiles = [];
  compilingEtsOrTsFiles = [];
}