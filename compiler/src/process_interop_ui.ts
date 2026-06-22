/*
 * Copyright (c) 2025-2026 Huawei Device Co., Ltd.
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
const ARKUI_BUILDER: string = 'Builder';

export function isStructDeclaration(node: ts.Node): boolean {
  return ts.isStructDeclaration(node);
}

export class HandleUIImports {
  private context: ts.TransformationContext;
  private typeChecker: ts.TypeChecker;
  private readonly output: string | undefined;

  private printer: ts.Printer = ts.createPrinter();

  private importedInterfaces: Set<string> = new Set<string>();
  private interfacesNeedToImport: Set<string> = new Set<string>();
  private insertPosition = 0;

  private readonly trueSymbolAtLocationCache = new Map<ts.Node, ts.Symbol | null>();

  constructor(typeChecker: ts.TypeChecker, context: ts.TransformationContext, output?: string | undefined) {
    this.context = context;
    this.typeChecker = typeChecker;
    this.output = output;
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
      return undefined;
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
      const component = ['Component', 'Reusable', 'ComponentV2', 'ReusableV2'];
      if (component.includes(result.text)) {
        this.interfacesNeedToImport.add('LocalStorage');
      }
      this.interfacesNeedToImport.add(result.text);
    } else if (ts.isSourceFile(result)) {
      return this.addUIImports(result);
    }

    if (ts.isMethodDeclaration(result)) {
      return this.transformMethodDeclaration(result);
    }

    return result;
  }

  private transformMethodDeclaration(node: ts.MethodDeclaration): ts.MethodDeclaration {
    const { decorators, updated: decoratorsUpdated } = this.transformMonitorDecorator(ts.getAllDecorators(node));
    const needsType = !node.type;

    if (!decoratorsUpdated && !needsType) {
      return node;
    }

    const type = needsType ? ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword) : node.type;

    return ts.factory.updateMethodDeclaration(
      node,
      decoratorsUpdated ? decorators as ts.NodeArray<ts.Decorator> : node.modifiers,
      node.asteriskToken,
      node.name,
      node.questionToken,
      node.typeParameters,
      node.parameters,
      type,
      node.body
    );
  }

  private transformMonitorDecorator(decorators: readonly ts.Decorator[] | undefined): {
    decorators: ts.NodeArray<ts.Decorator> | undefined;
    updated: boolean;
  } {
    if (!decorators || decorators.length === 0) {
      return { decorators: undefined, updated: false };
    }

    let updated = false;
    const newDecorators = decorators.map(decorator => {
      const expr = decorator.expression;
      if (!ts.isCallExpression(expr) || !ts.isIdentifier(expr.expression)) {
        return decorator;
      }
      if (expr.expression.text !== 'Monitor') {
        return decorator;
      }
      if (expr.arguments.length === 1 && ts.isArrayLiteralExpression(expr.arguments[0])) {
        return decorator;
      }

      updated = true;
      const arrayLiteral = ts.factory.createArrayLiteralExpression([...expr.arguments]);
      const newCall = ts.factory.updateCallExpression(
        expr,
        expr.expression,
        expr.typeArguments,
        [arrayLiteral]
      );
      return ts.factory.updateDecorator(decorator, newCall);
    });

    return {
      decorators: updated ? ts.factory.createNodeArray(newDecorators) : undefined,
      updated
    };
  }

  private handleImportBuilder(node: ts.Node): void {
    const decorators: readonly ts.Decorator[] | undefined = ts.getAllDecorators(node);
    if (!decorators?.length) {
      return;
    }

    decorators.forEach((decorator: ts.Decorator) => {
      const expression = decorator.expression;
      if (!ts.isIdentifier(expression)) {
        return;
      }
      const decoratorName: string = expression.getText();
      if (decoratorName === ARKUI_BUILDER) {
        this.interfacesNeedToImport.add(ARKUI_BUILDER);
      }
    });
  }

  private addUIImports(node: ts.SourceFile): ts.SourceFile {
    const dynamicImportSpecifiers: ts.ImportSpecifier[] = [];
    const compImportSpecifiers: ts.ImportSpecifier[] = [];
    const stateImportSpecifiers: ts.ImportSpecifier[] = [];
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

      const updatedStatements = ts.factory.createNodeArray(newStatements);
      const updatedSourceFile = ts.factory.updateSourceFile(node,
        updatedStatements,
        node.isDeclarationFile,
        node.referencedFiles,
        node.typeReferenceDirectives,
        node.hasNoDefaultLib,
        node.libReferenceDirectives
      );

      if (this.output) {
        const resultText = this.printer.printFile(updatedSourceFile);
        fs.writeFileSync(this.output, resultText);
      }

      return updatedSourceFile;
    }
    return node;
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

/*
 * process interop ui
 * @deprecated use declgen stages.
 * @param program - the ts.Program instance of the current compilation
 */
export function createCustomTransformer(
  program: ts.Program,
): (ctx: ts.TransformationContext) => (sourceFile: ts.SourceFile) => ts.SourceFile {
  return (ctx) => {
    return (sourceFile: ts.SourceFile) => {
      const handleUIImports = new HandleUIImports(program.getTypeChecker(), ctx);
      return handleUIImports.createCustomTransformer(sourceFile);
    }
  }
}

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
    const sourceFile = program.getSourceFile(filePath);
    if (sourceFile) {
      sourceFiles.push(sourceFile);
    }
  });
  return sourceFiles;
}

/*
 * process interop ui for test
 *
 * @param path - declgenV2OutPath
 * @param outPath - the path to output the transformed declaration files
 */
export function processInteropUI(path: string, outPath = ''): void {
  const filePaths = getDeclgenFiles(path);
  const program = ts.createProgram(filePaths, defaultCompilerOptions());
  const sourceFiles = getSourceFiles(program, filePaths);

  const createTransformer = (ctx: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (sourceFile: ts.SourceFile) => {
      const handleUIImports = new HandleUIImports(program.getTypeChecker(), ctx, outPath);
      return handleUIImports.createCustomTransformer(sourceFile);
    }
  }
  ts.transform(sourceFiles, [createTransformer]);
}
