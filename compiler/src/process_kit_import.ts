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


/*
* basic implementation logic:
* tsc -> transformer
*           | -> iterate top-level static import/export declaration
*                  | -> for each declaration
*                        | -> collect KitImportInfo
*                        | -> generate corresponding ohosImports for each ohos-source
*                  | -> replace each origin declaration with corresponding ohosImports
*/

const KIT_CONFIGS = 'kit_configs';
const KIT_PREFIX = '@kit.';
const JSON_SUFFIX = '.json';
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
export function processKitImport(program: ts.Program): Function {
  return (context: ts.TransformationContext) => {
    const visitor: ts.Visitor = node => {
      // static import/export declaration
      if (ts.isImportDeclaration(node) || (ts.isExportDeclaration(node) && node.moduleSpecifier)) {
        // moduleSpecifier.getText() returns string carrying on quotation marks which the importMap's key does not,
        // so we need to remove the quotation marks from moduleRequest.
        const moduleRequest: string = node.moduleSpecifier.getText().replace(/'|"/g, '');
        if (moduleRequest.startsWith(KIT_PREFIX)) {
          const kitDefs = JSON.parse(fs.readFileSync(`../${KIT_CONFIGS}/${moduleRequest}${JSON_SUFFIX}`, 'utf-8'));
          if (kitDefs.symbols) {
            KitImportInfo.processKitImportInfo(kitDefs.symbols as KitSymbols, node);
          }
          return [...KitImportInfo.getCurrentKitImportInfo().getOhosImportNodes()];
        }
      }
      return node;
    }

    return (node: ts.SourceFile) => {
      if (/\.ts$/.test(node.fileName)) {
        KitImportInfo.setFileType(FileType.TS);
      } else {
        KitImportInfo.setFileType(FileType.ETS);
      }
      ts.visitEachChild(node, visitor, context);
    };
  }
}


/*
*  Implementation part of Transforming
*/

const DEFAULT_BINDINGS = 'default';

enum FileType {
  ETS,
  TS
}

interface Symbol {
  source: string
  bindings: string
}

declare type KitSymbols = Record<string, Symbol>;
declare type TSspecifier = ts.ImportSpecifier | ts.ExportSpecifier;
declare type TSModuleDeclaration = ts.ImportDeclaration | ts.ExportDeclaration;

class SpecificerInfo {
  private localName: string;
  private symbol: Symbol;
  private renamed: boolean;
  
  private originElement: TSspecifier;

  constructor(localName: string, symbol: Symbol, originElement: TSspecifier) {
    this.localName = localName;
    this.symbol = symbol;
    this.originElement = originElement;
    this.renamed = (this.localName === this.symbol.bindings);

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
    if (KitImportInfo.isTSFile() && /.d.ets$/.test(this.symbol.source)) {
      // ts file can not import symbol from .d.ets file
      // logger.error()
    }
  }

  setOriginElementNode(originElement: TSspecifier) {
    this.originElement = originElement;
  }

  getOriginElementNode(): TSspecifier {
    return this.originElement;
  }
}

class KitImportInfo {
  private static currentKitImportInfo: KitImportInfo;
  private static currentFileType: FileType = FileType.ETS;

  private symbols: KitSymbols;
  private kitNode: TSModuleDeclaration;
  private specifiers: Map<string, SpecificerInfo[]> = new Map<string, SpecificerInfo[]>();

  private ohosImportNodes: ts.ImportDeclaration[] = [];

  constructor(kitNode: TSModuleDeclaration, symbols: Record<string, Symbol>) {
    this.kitNode = kitNode;
    this.symbols = symbols;
  }

  static getCurrentKitImportInfo(): KitImportInfo {
    return this.currentKitImportInfo;
  }

  static setFileType(fileType: FileType): void {
    this.currentFileType = fileType;
  }

  static isTSFile(): boolean {
    return this.currentFileType === FileType.TS;
  }

  static processImportDecl(kitNode: ts.ImportDeclaration, symbols: Record<string, Symbol>) {
    // this.kitNode = this.kitNode as ts.ImportDeclaration;
    if (kitNode.importClause!.name) {
      // import default from "@kit.xxx"
      // todo: throw error msg
    }
    if (kitNode.importClause!.namedBindings) {
      const namedBindings: ts.NamedImportBindings = kitNode.importClause.namedBindings;
      if (ts.isNamespaceImport(namedBindings)) {
        // import * as ns from "@kit.xxx"
        // todo: logger.warn to reminder developer the side-effect of using namespace import with Kit
        this.currentKitImportInfo = new NameSpaceKitImportInfo(kitNode, symbols);
      }
      if (ts.isNamedImports(namedBindings) && namedBindings.elements.length !== 0) {
        // import { ... } from "@kit.xxx"
        this.currentKitImportInfo = new ImportSpecifierKitImportInfo(kitNode, symbols);
        namedBindings.elements.forEach(element => { this.currentKitImportInfo.collectSpecifier(element) });
      }
    }
  }

  static processExportDecl(kitNode: ts.ExportDeclaration, symbols: Record<string, Symbol>) {
    if (kitNode.exportClause) {
      const namedExportBindings: ts.NamedExportBindings = kitNode.exportClause;
      if (ts.isNamespaceExport(namedExportBindings)) {
        // export * as ns from "@kit.xxx"
        // todo
      } else if (ts.isNamedExports(namedExportBindings) && namedExportBindings.elements.length !== 0) {
        // export { ... } from "@kit.xxx"
        this.currentKitImportInfo = new ExportSpecifierKitImportInfo(kitNode, symbols);
        namedExportBindings.elements.forEach(element => { this.currentKitImportInfo.collectSpecifier(element) });
      }
    } else {
      // export * from "@kit.xxx"
      // equals expanding all the ohos with export-star
      // export * from "@ohos.xxx";export * from "@ohos.yyy";
      // iterate kit
    }
  }

  static processKitImportInfo(symbols: Record<string, Symbol>, kitNode: TSModuleDeclaration): void {
    // do not handle an empty import
    if (ts.isImportDeclaration(kitNode) && kitNode.importClause) {
      // import { ... } from '@kit.xxx'
      // import * as ns from '@kit.xxx'
      // import defalutValue from '@kit.xxx' - forbidden
      this.processImportDecl(kitNode, symbols);
    }

    if (ts.isExportDeclaration(kitNode) && kitNode.moduleSpecifier) {
      // export { ... } from '@kit.xxx'
      // export * from '@kit.xxx'
      // export * as ns from '@kit.xxx' - considering forbidden
      this.processExportDecl(kitNode, symbols);
    }
    // transform into ohos imports or exports
    this.currentKitImportInfo.transform();
  }

  getSymbols(): KitSymbols {
    return this.symbols;
  }

  getKitNode(): TSModuleDeclaration {
    return this.kitNode;
  }

  getSpecifiers(): Map<string, SpecificerInfo[]> {
    return this.specifiers;
  }

  getOhosImportNodes(): ts.ImportDeclaration[] {
    return this.ohosImportNodes;
  }
  
  newSpecificerInfo(localName: string, importName: string, originElement: TSspecifier): SpecificerInfo {
    const symbol: Symbol = this.symbols[importName];
    const specifier: SpecificerInfo = new SpecificerInfo(localName, symbol, originElement);
    if (this.specifiers.has(symbol.source)) {
      this.specifiers.get(symbol.source).push(specifier);
    } else {
      this.specifiers.set(symbol.source, [specifier]);
    }
    return specifier;
  }

  collectSpecifier(element: TSspecifier) {
    const localName: string = element.name.getText();
    const importName: string = element.propertyName ? element.propertyName.getText() : localName;
    this.newSpecificerInfo(localName, importName, element);
  }

  // @ts-ignore
  transform() {} //override api
}

class NameSpaceKitImportInfo extends KitImportInfo {
  namespaceName: string;
  localNameTable: string[] = [];

  constructor(kitNode: ts.ImportDeclaration, symbols: Record<string, Symbol>) {
    super(kitNode, symbols);

    this.namespaceName = (kitNode.importClause!.namedBindings as ts.NamespaceImport).name.getText();
  }



  transform() {
    for (const symbol in this.getSymbols()) {
      
    }

    // issue: how to insert the `const ns = {}`
  }
}

class ImportSpecifierKitImportInfo extends KitImportInfo {
  private namedBindings: ts.ImportSpecifier[] = [];
  private defaultName: ts.Identifier | undefined = undefined;

  constructor(kitNode: ts.ImportDeclaration, symbols: Record<string, Symbol>) {
    super(kitNode, symbols);
  }

  transform() {
    const node: ts.ImportDeclaration = this.getKitNode() as ts.ImportDeclaration;
    this.getSpecifiers().forEach((specifiers: SpecificerInfo[], source: string) => {
      const modifier: readonly ts.Modifier[] = ts.canHaveDecorators(node) ? ts.getModifiers(node) : undefined;

      specifiers.forEach((specifier: SpecificerInfo) => {
        if (specifier.isDefaultBinding()) {
          this.defaultName = ts.factory.createIdentifier(specifier.getLocalName());
        } else {
          this.namedBindings.push(
            ts.factory.createImportSpecifier(
              (specifier.getOriginElementNode() as ts.ImportSpecifier).isTypeOnly,
              specifier.isRenamed() ? ts.factory.createIdentifier(specifier.getBindings()) : undefined,
              ts.factory.createIdentifier(specifier.getLocalName())
            )
          );
        }
      });

      this.getOhosImportNodes().push(ts.factory.createImportDeclaration(
        modifier,
        ts.factory.createImportClause(
          node.importClause!.isTypeOnly,
          this.defaultName,
          ts.factory.createNamedImports(this.namedBindings)
        ),
        ts.factory.createStringLiteral(trimSourceSuffix(source))
      ));
    });
  }
}

class ExportSpecifierKitImportInfo extends KitImportInfo {
  transform() {

  }
}

class ExportStarKitImportInfo extends KitImportInfo {
  transform() {

  }
}

/*
* utils part
*/
function trimSourceSuffix(source: string): string {
  return source.replace(/\.d.[e]?ts$/, '');
}