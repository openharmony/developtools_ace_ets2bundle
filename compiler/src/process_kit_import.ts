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

import { FileLog, LogType } from './utils';

/*
* basic implementation logic:
* tsc -> transformer
*           | -> iterate top-level static import/export declaration
*                  | -> for each declaration
*                        | -> collect KitInfo
*                        | -> generate corresponding ohosImports for each ohos-source
*                  | -> replace each origin declaration with corresponding ohosImports
*/

const KIT_CONFIGS = 'kit_configs';
const KIT_PREFIX = '@kit.';
const JSON_SUFFIX = '.json';

export const kitTransformLog: FileLog = new FileLog();

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
          const kitDefs =
            JSON.parse(
              fs.readFileSync(path.join(__dirname, `../${KIT_CONFIGS}/${moduleRequest}${JSON_SUFFIX}`),
              'utf-8'
              )
            );
          if (kitDefs.symbols) {
            KitInfo.processKitInfo(kitDefs.symbols as KitSymbols, node);
            return [...KitInfo.getCurrentKitInfo().getOhosImportNodes()];
          }
        }
      }
      return node;
    }

    return (node: ts.SourceFile) => {
      KitInfo.init(node);
      ts.visitEachChild(node, visitor, context);
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

interface Symbol {
  source: string
  bindings: string
}

declare type KitSymbols = Record<string, Symbol>;
declare type TSspecifier = ts.ImportSpecifier | ts.ExportSpecifier;
declare type TSModuleDeclaration = ts.ImportDeclaration | ts.ExportDeclaration;


/*
* class SpecificerInfo represents the corresponding info of each imported identifier which coming from Kit
*/
class SpecificerInfo {
  private localName: string;
  private importName: string;
  private symbol: Symbol;
  private renamed: boolean;
  
  private originElement: TSspecifier;

  constructor(localName: string, importName: string, symbol: Symbol, originElement: TSspecifier) {
    this.localName = localName;
    this.importName = importName;
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

class KitInfo {
  private static currentKitInfo: KitInfo = undefined;
  private static currentFileType: FileType = FileType.ETS;

  private symbols: KitSymbols;
  private kitNode: TSModuleDeclaration;
  private specifiers: Map<string, SpecificerInfo[]> = new Map<string, SpecificerInfo[]>();

  private ohosImportNodes: ts.ImportDeclaration[] = [];

  constructor(kitNode: TSModuleDeclaration, symbols: Record<string, Symbol>) {
    this.kitNode = kitNode;
    this.symbols = symbols;
  }

  static init(node: ts.SourceFile): void {
    if (/\.ts$/.test(node.fileName)) {
      this.setFileType(FileType.TS);
    } else {
      this.setFileType(FileType.ETS);
    }

    kitTransformLog.sourceFile = node;
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
        this.currentKitInfo = new NameSpaceKitInfo(kitNode, symbols);
      }
      if (ts.isNamedImports(namedBindings) && namedBindings.elements.length !== 0) {
        // import { ... } from "@kit.xxx"
        this.currentKitInfo = new ImportSpecifierKitInfo(kitNode, symbols);
        namedBindings.elements.forEach(element => { this.currentKitInfo.collectSpecifier(element) });
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
        this.currentKitInfo = new ExportSpecifierKitInfo(kitNode, symbols);
        namedExportBindings.elements.forEach(element => { this.currentKitInfo.collectSpecifier(element) });
      }
    } else {
      // export * from "@kit.xxx"
      // equals expanding all the ohos with export-star
      // export * from "@ohos.xxx";export * from "@ohos.yyy";
      // iterate kit
    }
  }

  static processKitInfo(symbols: Record<string, Symbol>, kitNode: TSModuleDeclaration): void {
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
    this.currentKitInfo && this.currentKitInfo.transform();
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
    const specifier: SpecificerInfo = new SpecificerInfo(localName, importName, symbol, originElement);
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

class NameSpaceKitInfo extends KitInfo {
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

class ImportSpecifierKitInfo extends KitInfo {
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

class ExportSpecifierKitInfo extends KitInfo {
  transform() {

  }
}

class ExportStarKitInfo extends KitInfo {
  transform() {

  }
}

/*
* utils part
*/
function trimSourceSuffix(source: string): string {
  return source.replace(/\.d.[e]?ts$/, '');
}