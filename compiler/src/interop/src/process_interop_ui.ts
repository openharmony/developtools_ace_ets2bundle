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

import ts from 'typescript';

import { EXTNAME_D_ETS } from './pre_define';

import {
  whiteList,
  decoratorsWhiteList,
  decoratorsV2WhiteList,
  stateManagementWhiteList,
} from './import_whiteList';

const fs = require('fs');
const path = require('path');

const OHOS_ARKUI_GLOBAL_ANNOTATION: string = 'dynamic/@ohos.arkui.GlobalAnnotation';
const OHOS_ARKUI_STATEMANAGEMENT: string = '@ohos.arkui.stateManagement';
const OHOS_ARKUI_COMPONENT: string = '@ohos.arkui.component';
const ARKUI_EXTEND: string = 'Extend';
const ARKUI_STYLES: string = 'Styles';

function getDeclgenFiles(dir: string, filePaths: string[] = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getDeclgenFiles(filePath, filePaths);
    } else if (stat.isFile() && file.endsWith(EXTNAME_D_ETS)) {
      filePaths.push(filePath);
    }
  });

  return filePaths;
}

export function isStructDeclaration(node: ts.Node): boolean {
  return ts.isStructDeclaration(node);
}

function defaultCompilerOptions(): ts.CompilerOptions {
  return {
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.CommonJS,
    allowJs: true,
    checkJs: true,
    declaration: true,
    emitDeclarationOnly: true,
    noEmit: false
  };
}

function getSourceFiles(program: ts.Program, filePaths: string[]): ts.SourceFile[] {
  const sourceFiles: ts.SourceFile[] = [];

  filePaths.forEach(filePath => {
    sourceFiles.push(program.getSourceFile(filePath));
  });

  return sourceFiles;
}

class HandleUIImports {
  private context: ts.TransformationContext;
  private typeChecker: ts.TypeChecker;

  private readonly outPath: string;

  private importedInterfaces: Set<string> = new Set<string>();
  private interfacesNeedToImport: Set<string> = new Set<string>();
  private printer = ts.createPrinter();
  private insertPosition = 0;

  private readonly trueSymbolAtLocationCache = new Map<ts.Node, ts.Symbol | null>();

  constructor(program: ts.Program, context: ts.TransformationContext, outPath: string) {
    this.context = context;
    this.typeChecker = program.getTypeChecker();
    this.outPath = outPath;
  }

  public createCustomTransformer(sourceFile: ts.SourceFile) {
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

    return ts.visitNode(sourceFile, this.visitNode.bind(this))
  }

  private visitNode(node: ts.Node): ts.Node | undefined {
    // delete constructor
    if (node.parent && isStructDeclaration(node.parent) && ts.isConstructorDeclaration(node)) {
      return;
    }

    // skip to collect origin import from 1.2
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier;
      if (ts.isStringLiteral(moduleSpecifier)) {
        const modulePath = moduleSpecifier.text;
        if ([OHOS_ARKUI_STATEMANAGEMENT, OHOS_ARKUI_COMPONENT, OHOS_ARKUI_GLOBAL_ANNOTATION].includes(modulePath)) {
          return node;
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

    if (ts.isMethodDeclaration(result) && !result.type) {
      const voidTypeAnnotation = ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
      return ts.factory.updateMethodDeclaration(
        result,
        result.modifiers,
        result.asteriskToken,
        result.name,
        result.questionToken,
        result.typeParameters,
        result.parameters,
        voidTypeAnnotation,
        result.body
      );
    }

    return result;
  }

  private handleImportBuilder(node: ts.Node): void {
    ts.getAllDecorators(node)?.forEach(element => {
      if (element?.getText() === '@Builder') {
        this.interfacesNeedToImport.add('Builder');
        return;
      }
    });
  }

  private AddInteropImports(): ts.ImportDeclaration {
    const moduleName = 'arkui.component.interop';
    const interopImportName = [
      'compatibleComponent',
      'getCompatibleState',
      'transferCompatibleBuilder',
      'transferCompatibleUpdatableBuilder'
    ];
    const interopImportSpecifiers: ts.ImportSpecifier[] = [];
    interopImportName.forEach((interopName) => {
      const identifier = ts.factory.createIdentifier(interopName);
      const specifier = ts.factory.createImportSpecifier(false, undefined, identifier);
      interopImportSpecifiers.push(specifier);
    });
    const compImportDeclaration = ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(false,
        undefined,
        ts.factory.createNamedImports(
          interopImportSpecifiers
        )
      ),
      ts.factory.createStringLiteral(moduleName, true),
      undefined
    );
    return compImportDeclaration;
  }

  private addUIImports(node: ts.SourceFile): void {
    const dynamicImportSpecifiers: ts.ImportSpecifier[] = [];
    const compImportSpecifiers: ts.ImportSpecifier[] = [];
    const stateImportSpecifiers: ts.ImportSpecifier[] = [];
    this.importedInterfaces.add('LocalStorage');
    this.interfacesNeedToImport.forEach((interfaceName) => {
      if (this.importedInterfaces.has(interfaceName)) {
        return;
      }
      const identifier = ts.factory.createIdentifier(interfaceName);
      if ([...decoratorsWhiteList, ...decoratorsV2WhiteList].includes(interfaceName)) {
        dynamicImportSpecifiers.push(ts.factory.createImportSpecifier(false, undefined, identifier));
      } else if (stateManagementWhiteList.includes(interfaceName)) {
        stateImportSpecifiers.push(ts.factory.createImportSpecifier(false, undefined, identifier));
      } else {
        compImportSpecifiers.push(ts.factory.createImportSpecifier(false, undefined, identifier));
      }
    });

    if (dynamicImportSpecifiers.length + stateImportSpecifiers.length + compImportSpecifiers.length > 0) {
      const newStatements = [...node.statements];

      if (dynamicImportSpecifiers.length) {
        const moduleName = OHOS_ARKUI_GLOBAL_ANNOTATION;
        const dynamicImportDeclaration = ts.factory.createImportDeclaration(
          undefined,
          ts.factory.createImportClause(false,
            undefined,
            ts.factory.createNamedImports(
              dynamicImportSpecifiers
            )
          ),
          ts.factory.createStringLiteral(moduleName, true),
          undefined
        );
        newStatements.splice(this.insertPosition, 0, dynamicImportDeclaration);
      }

      if (stateImportSpecifiers.length) {
        const moduleName = OHOS_ARKUI_STATEMANAGEMENT;
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

      if (compImportSpecifiers.length) {
        const moduleName = OHOS_ARKUI_COMPONENT;
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

      newStatements.splice(this.insertPosition, 0, this.AddInteropImports());

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
        fs.writeFileSync(this.outPath, updatedCode);
      } else {
        fs.writeFileSync(updatedSourceFile.fileName, updatedCode);
      }
    }
  }

  private getDeclarationNode(node: ts.Node): ts.Declaration | undefined {
    const symbol = this.trueSymbolAtLocation(node);
    return HandleUIImports.getDeclaration(symbol);
  }

  static getDeclaration(tsSymbol: ts.Symbol | undefined): ts.Declaration | undefined {
    if (tsSymbol?.declarations && tsSymbol.declarations.length > 0) {
      return tsSymbol.declarations[0];
    }

    return undefined;
  }

  private followIfAliased(symbol: ts.Symbol): ts.Symbol {
    if ((symbol.getFlags() & ts.SymbolFlags.Alias) !== 0) {
      return this.typeChecker.getAliasedSymbol(symbol);
    }

    return symbol;
  }

  private trueSymbolAtLocation(node: ts.Node): ts.Symbol | undefined {
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

  private shouldSkipIdentifier(identifier: ts.Identifier): boolean {
    const name = identifier.text;
    const skippedList = new Set<string>([ARKUI_EXTEND, ARKUI_STYLES]);

    if (skippedList.has(name)) {
      return true;
    }

    if (!whiteList.has(name)) {
      return true;
    }

    const symbol = this.typeChecker.getSymbolAtLocation(identifier);
    if (symbol) {
      const decl = this.getDeclarationNode(identifier);
      if (decl?.getSourceFile() === identifier.getSourceFile()) {
        return true;
      }
    }

    return this.interfacesNeedToImport.has(name);
  }

  private extractImportedNames(sourceFile: ts.SourceFile): void {
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

/**
 * process interop ui
 * 
 * @param path - declgenV2OutPath
 */
export function processInteropUI(path: string, outPath = ''): void {
  const filePaths = getDeclgenFiles(path);
  const program = ts.createProgram(filePaths, defaultCompilerOptions());
  const sourceFiles = getSourceFiles(program, filePaths);

  const createTransformer = (ctx: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (sourceFile: ts.SourceFile) => {
      const handleUIImports = new HandleUIImports(program, ctx, outPath);
      return handleUIImports.createCustomTransformer(sourceFile);
    }
  }
  ts.transform(sourceFiles, [createTransformer]);
}
