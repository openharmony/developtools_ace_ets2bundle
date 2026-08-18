/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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

import path from 'path';
import * as ts from 'typescript';

import { resolveModuleName } from '../../../ets_checker';
import {
  IFileLog,
  LogType
} from '../../../utils';
import createAstNodeUtils from '../../../create_ast_node_utils';
import {
  ArkTSInternalErrorDescription,
  ErrorCode
} from '../error_code';
import { LogDataFactory } from '../logger';
import { logger } from '../../../compile_info';
import { FileManager } from './interop_manager';
import { StaticInteropSymbol } from './type';
import { ARKTS_1_2 } from './pre_define';

/**
 * Connects an imported name to its local name. For `import * as ns`, importedName is absent and
 * isNamespaceImport is true; for `import { Foo as LocalFoo }`, the two names are Foo and LocalFoo.
 */
interface StaticInteropImportBinding {
  importedName?: string;
  localName: string;
  isNamespaceImport: boolean;
}

/** A metadata symbol paired with the identifier that must be declared in the importing file. */
interface BoundStaticInteropSymbol { symbol: StaticInteropSymbol; localName: string; }

export const staticInteropTransformLog: IFileLog = new createAstNodeUtils.FileLog();

export function resetStaticInteropTransformLog(): void {
  staticInteropTransformLog.cleanUp();
}

/**
 * Replaces supported imports from ArkTS 1.2 files with runtime Panda lookups. All successful
 * replacements in one source file share a single __createLazy__/__createUnsupportedObject__ helper pair.
 */
export function processStaticInteropImports(sourceFile: ts.SourceFile, id: string,
  context: ts.TransformationContext): ts.SourceFile {
  staticInteropTransformLog.sourceFile = sourceFile;
  const containingFile: string = stripQuery(id);
  const replacementStatements: ts.Statement[] = [];
  let hasStaticImportReplacement: boolean = false;
  sourceFile.statements.forEach((statement: ts.Statement) => {
    const result: StaticInteropImportProcessResult = processStaticInteropImportStatement(
      sourceFile.fileName, containingFile, statement, context);
    replacementStatements.push(...result.statements);
    if (result.replaced) {
      hasStaticImportReplacement = true;
    }
  });

  const hasStatementChanges: boolean =
    hasStaticImportReplacement || replacementStatements.length !== sourceFile.statements.length;
  let transformedSourceFile: ts.SourceFile =
    hasStatementChanges ?
      ts.factory.updateSourceFile(sourceFile, replacementStatements) : sourceFile;

  if (hasStaticImportReplacement && FileManager.hasStaticInteropConcurrentImport(sourceFile.fileName)) {
    const concurrentUsage: StaticInteropConcurrentUsage = collectStaticInteropConcurrentUsage(sourceFile);
    const concurrentStatements: ts.Statement[] = createConcurrentStaticInteropStatements(
      sourceFile.fileName, [...transformedSourceFile.statements], concurrentUsage);
    transformedSourceFile = ts.factory.updateSourceFile(transformedSourceFile, concurrentStatements);
  }

  let hasDynamicImportReplacement: boolean = false;
  if (FileManager.hasStaticInteropDynamicImport(sourceFile.fileName)) {
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
      const replacement: ts.Expression | undefined = isDynamicImportCall(node) ?
        processStaticInteropDynamicImport(sourceFile.fileName, containingFile, node) : undefined;
      if (!replacement) {
        return ts.visitEachChild(node, visitor, context);
      }
      hasDynamicImportReplacement = true;
      return replacement;
    };
    transformedSourceFile = ts.visitNode(transformedSourceFile, visitor) as ts.SourceFile;
  }

  if (!hasStatementChanges && !hasDynamicImportReplacement) {
    return sourceFile;
  }

  const updatedSourceFile: ts.SourceFile = hasStaticImportReplacement || hasDynamicImportReplacement ?
    createSourceFileWithStaticInteropHelpers(transformedSourceFile, [...transformedSourceFile.statements], context,
      hasDynamicImportReplacement) : transformedSourceFile;
  return updatedSourceFile;
}

function processStaticInteropDynamicImport(sourceFileName: string, containingFile: string,
  node: ts.CallExpression): ts.Expression | undefined {
  const moduleSpecifier: ts.Expression = node.arguments[0];
  if (!ts.isStringLiteral(moduleSpecifier)) {
    return undefined;
  }
  const targetFilePath: string | undefined = getStaticImportPath(moduleSpecifier.text, containingFile);
  return targetFilePath ? createStaticInteropDynamicImportReplacement(
    sourceFileName, path.resolve(targetFilePath), node.pos) : undefined;
}

function isDynamicImportCall(node: ts.Node): node is ts.CallExpression {
  return ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword &&
    node.arguments.length > 0;
}

type StaticInteropImportProcessResult = {
  statements: ts.Statement[],
  replaced: boolean
};

type StaticInteropConcurrentUsage = {
  concurrentUsedNames: Set<string>,
  usedNames: Set<string>
};

function processStaticInteropImportStatement(sourceFileName: string, containingFile: string,
  statement: ts.Statement, context: ts.TransformationContext): StaticInteropImportProcessResult {
  const staticImportPath: string | undefined = getStaticImport(statement, containingFile);
  if (!staticImportPath || !ts.isImportDeclaration(statement)) {
    return { statements: [statement], replaced: false };
  }
  if (isTypeOnlyStaticInteropImport(statement)) {
    return { statements: [], replaced: false };
  }
  const bindings: StaticInteropImportBinding[] = getStaticInteropImportBindings(statement);
  if (bindings.length === 0) {
    return { statements: [statement], replaced: false };
  }
  const replacement: ts.Statement[] = createStaticInteropReplacement(
    sourceFileName, path.resolve(staticImportPath), bindings, context, statement.pos >= 0 ? statement.pos : 0);
  if (replacement.length === 0) {
    return { statements: [statement], replaced: false };
  }
  return { statements: replacement, replaced: true };
}

function createStaticInteropSelfImportDeclaration(
  sourceFileName: string,
  bridgeNameByLocalName: Map<string, string>
): ts.ImportDeclaration {
  const fileName: string = stripQuery(sourceFileName);
  return ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(false, undefined, ts.factory.createNamedImports(
      Array.from(bridgeNameByLocalName.entries()).map(([localName, bridgeName]: [string, string]) =>
        ts.factory.createImportSpecifier(false,
          ts.factory.createIdentifier(bridgeName), ts.factory.createIdentifier(localName))))),
    ts.factory.createStringLiteral(`./${path.basename(fileName, path.extname(fileName))}`),
    undefined
  );
}

function createConcurrentStaticInteropStatements(sourceFileName: string, statements: ts.Statement[],
  usage: StaticInteropConcurrentUsage): ts.Statement[] {
  const bridgeNameByLocalName: Map<string, string> = new Map<string, string>();
  const declarations: ts.Statement[] = statements.map((statement: ts.Statement) => {
    const localName: string | undefined = getGeneratedStaticInteropDeclarationName(statement);
    if (!localName || !usage.concurrentUsedNames.has(localName)) {
      return statement;
    }
    const bridgeName: string = createUniqueStaticInteropConcurrentBridgeName(localName, usage.usedNames);
    bridgeNameByLocalName.set(localName, bridgeName);
    return createStaticInteropBridgeStatement(statement, bridgeName);
  });
  return bridgeNameByLocalName.size === 0 ? declarations :
    [createStaticInteropSelfImportDeclaration(sourceFileName, bridgeNameByLocalName), ...declarations];
}

function getGeneratedStaticInteropDeclarationName(statement: ts.Statement): string | undefined {
  if (statement.pos >= 0) {
    return undefined;
  }
  if (ts.isVariableStatement(statement)) {
    const declaration: ts.VariableDeclaration = statement.declarationList.declarations[0];
    return ts.isIdentifier(declaration.name) && ts.isCallExpression(declaration.initializer) &&
      ts.isIdentifier(declaration.initializer.expression) && declaration.initializer.expression.text === '__createLazy__' ?
      declaration.name.text : undefined;
  }
  return ts.isModuleDeclaration(statement) && ts.isIdentifier(statement.name) ? statement.name.text : undefined;
}

function createStaticInteropBridgeStatement(statement: ts.Statement, bridgeName: string): ts.Statement {
  const exportModifier: ts.Modifier = ts.factory.createModifier(ts.SyntaxKind.ExportKeyword);
  if (ts.isVariableStatement(statement)) {
    const declaration: ts.VariableDeclaration = statement.declarationList.declarations[0];
    const initializer: ts.CallExpression = declaration.initializer as ts.CallExpression;
    const updatedDeclaration: ts.VariableDeclaration = ts.factory.updateVariableDeclaration(
      declaration, ts.factory.createIdentifier(bridgeName), declaration.exclamationToken, declaration.type,
      ts.factory.updateCallExpression(initializer, initializer.expression, initializer.typeArguments,
        [initializer.arguments[0], ts.factory.createStringLiteral(bridgeName)]));
    return ts.factory.updateVariableStatement(statement, [exportModifier],
      ts.factory.updateVariableDeclarationList(statement.declarationList, [updatedDeclaration]));
  }
  const declaration: ts.ModuleDeclaration = statement as ts.ModuleDeclaration;
  return ts.factory.updateModuleDeclaration(
    declaration, [exportModifier], ts.factory.createIdentifier(bridgeName), declaration.body);
}

function createUniqueStaticInteropConcurrentBridgeName(localName: string, usedNames: Set<string>): string {
  const baseName: string = `__staticInteropConcurrent_${localName}`;
  let bridgeName: string = baseName;
  let suffix: number = 1;
  while (usedNames.has(bridgeName)) {
    bridgeName = `${baseName}_${suffix++}`;
  }
  usedNames.add(bridgeName);
  return bridgeName;
}

function createSourceFileWithStaticInteropHelpers(sourceFile: ts.SourceFile, replacementStatements: ts.Statement[],
  context: ts.TransformationContext, includeDynamicImportHelpers: boolean): ts.SourceFile {
  const helperSource: string = (includeDynamicImportHelpers ? STATIC_INTEROP_DYNAMIC_IMPORT_HELPERS : '') +
    STATIC_INTEROP_REPLACEMENT_HELPERS;
  const helperStatements: ts.Statement[] = createStaticInteropStatements(sourceFile.fileName, helperSource, context);
  const updatedSourceFile: ts.SourceFile = ts.factory.updateSourceFile(
    sourceFile, insertStatementsAfterImports(replacementStatements, helperStatements));
  return updatedSourceFile;
}

/**
 * Reads runtime bindings from default, named, or namespace imports. A default import maps to the
 * `"default"` metadata symbol emitted for the static file.
 */
function getStaticInteropImportBindings(importDeclaration: ts.ImportDeclaration): StaticInteropImportBinding[] {
  const importClause: ts.ImportClause | undefined = importDeclaration.importClause;
  if (!importClause || importClause.isTypeOnly) {
    return [];
  }
  const bindings: StaticInteropImportBinding[] = [];
  if (importClause.name) {
    bindings.push({
      importedName: 'default',
      localName: importClause.name.text,
      isNamespaceImport: false
    });
  }
  if (!importClause.namedBindings) {
    return bindings;
  }
  if (ts.isNamespaceImport(importClause.namedBindings)) {
    bindings.push({
      localName: importClause.namedBindings.name.text,
      isNamespaceImport: true
    });
    return bindings;
  }
  if (!ts.isNamedImports(importClause.namedBindings)) {
    return bindings;
  }
  bindings.push(...importClause.namedBindings.elements
    .filter((element: ts.ImportSpecifier) => !element.isTypeOnly)
    .map((element: ts.ImportSpecifier) => ({
      importedName: element.propertyName?.text ?? element.name.text,
      localName: element.name.text,
      isNamespaceImport: false
    })));
  return bindings;
}

function isTypeOnlyStaticInteropImport(importDeclaration: ts.ImportDeclaration): boolean {
  const importClause: ts.ImportClause | undefined = importDeclaration.importClause;
  if (!importClause) {
    return false;
  }
  if (importClause.isTypeOnly) {
    return true;
  }
  if (importClause.name) {
    return false;
  }
  const namedBindings: ts.NamedImportBindings | undefined = importClause.namedBindings;
  return !!namedBindings && ts.isNamedImports(namedBindings) && namedBindings.elements.length > 0 &&
    namedBindings.elements.every((element: ts.ImportSpecifier) => element.isTypeOnly);
}

/** Returns static-import information only when the resolved target is an ArkTS 1.2 file. */
function getStaticImport(node: ts.Node, containingFile: string): string | undefined {
  if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) {
    return undefined;
  }
  return getStaticImportPath(node.moduleSpecifier.text, containingFile);
}

function getStaticImportPath(moduleName: string, containingFile: string): string | undefined {
  const resolvedModule: ts.ResolvedModuleFull | undefined = resolveModuleName(moduleName, containingFile).resolvedModule;

  if (!resolvedModule?.resolvedFileName) {
    return undefined;
  }

  const resolvedImportPath: string = normalizeFilePath(stripQuery(resolvedModule.resolvedFileName));
  const languageVersion = FileManager.getInstance().getLanguageVersionByFilePath(resolvedImportPath);

  if (languageVersion?.languageVersion !== ARKTS_1_2) {
    return undefined;
  }

  return resolvedImportPath;
}

/** Inserts generated helpers and declarations immediately after the remaining import declarations. */
function insertStatementsAfterImports(statements: ts.Statement[], insertedStatements: ts.Statement[]): ts.Statement[] {
  const lastImportIndex: number = statements.reduce((index: number, statement: ts.Statement, currentIndex: number) =>
    ts.isImportDeclaration(statement) ? currentIndex : index, -1);
  const insertIndex: number = lastImportIndex + 1;
  return [
    ...statements.slice(0, insertIndex),
    ...insertedStatements,
    ...statements.slice(insertIndex)
  ];
}

/** Removes Rollup-style query parameters such as `file.ets?raw` from a source path. */
function stripQuery(filePath: string): string {
  return filePath.split('?')[0];
}

/** Normalizes platform separators so paths can be used as stable map keys. */
function normalizeFilePath(filePath: string): string {
  return path.normalize(filePath).replace(/\\/g, '/');
}

/**
 * Builds replacement statements for all bindings that import one static file. A namespace import
 * wraps the complete root map in a local namespace; a missing symbol leaves the original import intact.
 */
function createStaticInteropReplacement(sourceFileName: string, targetFilePath: string,
  bindings: StaticInteropImportBinding[],
  context: ts.TransformationContext, errorPos?: number): ts.Statement[] {
  const symbols: Record<string, StaticInteropSymbol> | undefined =
    FileManager.getInstance().getStaticInteropSymbols(targetFilePath);
  if (!symbols) {
    recordMissingStaticInteropSymbolError(sourceFileName, targetFilePath, errorPos);
    return [];
  }
  const boundSymbols: BoundStaticInteropSymbol[] =
    bindStaticInteropSymbols(symbols, bindings, sourceFileName, targetFilePath, errorPos);
  if (boundSymbols.length === 0) {
    return [];
  }
  const replacementSourceText: string = createStaticInteropReplacementSource(boundSymbols);
  if (!replacementSourceText) {
    return [];
  }
  return createStaticInteropStatements(sourceFileName, replacementSourceText, context);
}

function collectStaticInteropConcurrentUsage(sourceFile: ts.SourceFile): StaticInteropConcurrentUsage {
  const concurrentUsedNames: Set<string> = new Set<string>();
  const usedNames: Set<string> = new Set<string>();
  const visit = (node: ts.Node, inConcurrentFunction: boolean): void => {
    if (ts.isIdentifier(node)) {
      usedNames.add(node.text);
      if (inConcurrentFunction && isConcurrentValueUsage(node)) {
        concurrentUsedNames.add(node.text);
      }
    }
    const concurrentBody: ts.ConciseBody | undefined =
      isConcurrentFunctionWithDirective(node) ? node.body : undefined;
    ts.forEachChild(node, (child: ts.Node) =>
      visit(child, concurrentBody ? child === concurrentBody : inConcurrentFunction));
  };
  visit(sourceFile, false);
  return { concurrentUsedNames, usedNames };
}

function isConcurrentFunctionWithDirective(node: ts.Node): node is ts.FunctionLikeDeclarationBase {
  if (!ts.isFunctionLike(node) || !node.body || !ts.isBlock(node.body) || node.body.statements.length === 0) {
    return false;
  }
  const firstStatement: ts.Statement = node.body.statements[0];
  return ts.isExpressionStatement(firstStatement) && ts.isStringLiteral(firstStatement.expression) &&
    firstStatement.expression.text === 'use concurrent';
}

function isConcurrentValueUsage(node: ts.Identifier): boolean {
  const parent: ts.Node | undefined = node.parent;
  if (!parent) {
    return true;
  }

  if (ts.isPropertyAccessExpression(parent) && parent.name === node) {
    return false;
  }

  const disallowedParents: boolean[] = [
    ts.isMethodDeclaration(parent),
    ts.isFunctionDeclaration(parent),
    ts.isFunctionExpression(parent),
    ts.isArrowFunction(parent),
    ts.isClassDeclaration(parent),
    ts.isParameter(parent),
    ts.isVariableDeclaration(parent),
    ts.isBindingElement(parent),
    ts.isPropertyDeclaration(parent),
    ts.isEnumMember(parent),
    ts.isImportSpecifier(parent),
    ts.isNamespaceImport(parent),
    ts.isExportSpecifier(parent),
    ts.isTypeReferenceNode(parent),
    ts.isQualifiedName(parent)
  ];
  if (disallowedParents.some(Boolean)) {
    return false;
  }
  return true;
}

function bindStaticInteropSymbols(symbols: Record<string, StaticInteropSymbol>,
  bindings: StaticInteropImportBinding[], sourceFileName: string, targetFilePath: string,
  errorPos?: number): BoundStaticInteropSymbol[] {
  const boundSymbols: BoundStaticInteropSymbol[] = [];
  for (const binding of bindings) {
    if (binding.isNamespaceImport) {
      boundSymbols.push({
        symbol: {
          kind: 'namespace',
          name: binding.localName,
          children: symbols
        },
        localName: binding.localName
      });
      continue;
    }
    if (!binding.importedName) {
      return [];
    }
    const symbol: StaticInteropSymbol | undefined = symbols[binding.importedName];
    if (!symbol) {
      recordMissingStaticInteropSymbolError(sourceFileName, targetFilePath, errorPos, binding.importedName);
      return [];
    }
    boundSymbols.push({ symbol, localName: binding.localName });
  }
  return boundSymbols;
}

function recordMissingStaticInteropSymbolError(sourceFileName: string, targetFilePath: string,
  errorPos: number = 0, importedName?: string): void {
  const symbolInfo: string = importedName ? ` for symbol '${importedName}'` : '';
  const moduleName: string = FileManager.getInstance().getLanguageVersionByFilePath(sourceFileName)?.pkgName || 'unknown';
  const errInfo = LogDataFactory.newInstance(
    ErrorCode.ETS2BUNDLE_INTERNAL_MISSING_BRIDGECODE_PATH_INFO,
    ArkTSInternalErrorDescription,
    `Missing static interop metadata${symbolInfo} when processing static import '${normalizeFilePath(targetFilePath)}'. ` +
    `Current module is '${moduleName}'. Please check interop-config.json5 in the current file module.`
  );
  staticInteropTransformLog.errors.push({
    type: LogType.ERROR,
    message: errInfo.toString(),
    pos: errorPos
  });
}

function createStaticInteropDynamicImportReplacement(sourceFileName: string, targetFilePath: string,
  errorPos: number): ts.Expression | undefined {
  const symbols: Record<string, StaticInteropSymbol> | undefined =
    FileManager.getInstance().getStaticInteropSymbols(targetFilePath);
  if (!symbols) {
    recordMissingStaticInteropSymbolError(sourceFileName, targetFilePath, errorPos >= 0 ? errorPos : 0);
    return undefined;
  }
  const moduleObject: ts.Expression = createStaticInteropModuleObject(symbols);
  return ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('Promise'), 'resolve'),
    undefined,
    [ts.factory.createCallExpression(
      ts.factory.createIdentifier('__loadStaticInteropModule__'),
      undefined,
      [
        ts.factory.createStringLiteral(targetFilePath),
        ts.factory.createArrowFunction(undefined, undefined, [], undefined,
          ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken), moduleObject)
      ]
    )]
  );
}

function createStaticInteropModuleObject(symbols: Record<string, StaticInteropSymbol>): ts.Expression {
  const properties: ts.PropertyAssignment[] = [];
  for (const name in symbols) {
    if (!Object.prototype.hasOwnProperty.call(symbols, name)) {
      continue;
    }
    const value: ts.Expression | undefined = createStaticInteropValueExpression(symbols[name], name);
    if (value) {
      properties.push(ts.factory.createPropertyAssignment(ts.factory.createStringLiteral(name), value));
    }
  }
  return ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('Object'), 'freeze'),
    undefined,
    [ts.factory.createObjectLiteralExpression(properties, true)]
  );
}

function createStaticInteropValueExpression(symbol: StaticInteropSymbol, label: string): ts.Expression | undefined {
  if (symbol.kind === 'namespace') {
    if (!symbol.children || typeof symbol.children !== 'object' || Array.isArray(symbol.children)) {
      return undefined;
    }
    return createStaticInteropModuleObject(symbol.children);
  }
  if (typeof symbol.runtimeName !== 'string') {
    return undefined;
  }
  const panda: ts.Expression = ts.factory.createPropertyAccessExpression(
    ts.factory.createParenthesizedExpression(ts.factory.createAsExpression(
      ts.factory.createIdentifier('globalThis'), ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword))),
    'Panda'
  );
  let expression: ts.Expression;
  switch (symbol.kind) {
    case 'function':
      expression = ts.factory.createCallExpression(ts.factory.createPropertyAccessExpression(panda, 'getFunction'),
        undefined, [ts.factory.createStringLiteral(symbol.runtimeName), ts.factory.createStringLiteral(symbol.name)]);
      break;
    case 'property':
      expression = ts.factory.createElementAccessExpression(
        ts.factory.createCallExpression(ts.factory.createPropertyAccessExpression(panda, 'getClass'), undefined,
          [ts.factory.createStringLiteral(symbol.runtimeName)]),
        ts.factory.createStringLiteral(symbol.name));
      break;
    case 'class':
      expression = ts.factory.createCallExpression(ts.factory.createPropertyAccessExpression(panda, 'getClass'),
        undefined, [ts.factory.createStringLiteral(symbol.runtimeName)]);
      break;
    default:
      return undefined;
  }
  return ts.factory.createCallExpression(ts.factory.createIdentifier('__createLazy__'), undefined, [
    ts.factory.createArrowFunction(undefined, undefined, [], undefined,
      ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken), expression),
    ts.factory.createStringLiteral(label)
  ]);
}

/**
 * Parses generated TypeScript text into detached AST statements. Source ranges and comment flags are
 * cleared so the printer cannot attach unrelated comments from the original source at matching offsets.
 */
function createStaticInteropStatements(sourceFileName: string, sourceText: string,
  context: ts.TransformationContext): ts.Statement[] {
  const replacementSource: ts.SourceFile = ts.createSourceFile(
    sourceFileName, sourceText, ts.ScriptTarget.ES2021, true, ts.ScriptKind.TS);
  const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
    if (ts.isTemplateExpression(node)) {
      return clearSyntheticNodeRange(ts.factory.createTemplateExpression(cloneTemplateHead(node.head),
        node.templateSpans.map((span: ts.TemplateSpan) => ts.factory.createTemplateSpan(
          ts.visitNode(span.expression, visitor) as ts.Expression, cloneTemplateMiddleOrTail(span.literal)))));
    }
    if (ts.isNoSubstitutionTemplateLiteral(node)) {
      return clearSyntheticNodeRange(ts.factory.createNoSubstitutionTemplateLiteral(node.text, node.rawText));
    }
    if (ts.isStringLiteral(node)) {
      return clearSyntheticNodeRange(ts.factory.createStringLiteral(node.text, true));
    }
    return clearSyntheticNodeRange(ts.visitEachChild(node, visitor, context));
  };
  return replacementSource.statements.map(
    (statement: ts.Statement) => ts.visitNode(statement, visitor) as ts.Statement);
}

/** Converts all bound symbols into source text; an empty declaration aborts the whole import replacement. */
function createStaticInteropReplacementSource(symbols: BoundStaticInteropSymbol[]): string {
  const declarationList: string[] = symbols.map(({ symbol, localName }: BoundStaticInteropSymbol) =>
    createStaticInteropDeclaration(symbol, localName, false));
  if (declarationList.some((declaration: string) => !declaration)) {
    return '';
  }
  const declarations: string = declarationList.join('\n');
  return `${declarations}\n`;
}

/**
 * Recursively emits one declaration using the metadata kind:
 * class -> Panda.getClass, function -> Panda.getFunction, property -> getClass(...).name,
 * namespace -> an exported declaration for every processable entry in its children map.
 */
function createStaticInteropDeclaration(symbol: StaticInteropSymbol, declarationName: string,
  exported: boolean): string {
  const prefix: string = exported ? 'export ' : '';
  if (symbol.kind === 'namespace') {
    if (!symbol.children || typeof symbol.children !== 'object' || Array.isArray(symbol.children)) {
      return '';
    }
    const childDeclarations: string[] = [];
    for (const name in symbol.children) {
      if (!Object.prototype.hasOwnProperty.call(symbol.children, name)) {
        continue;
      }
      const declaration: string = createStaticInteropDeclaration(symbol.children[name], name, true);
      if (declaration) {
        childDeclarations.push(declaration);
      }
    }
    return `${prefix}namespace ${declarationName} {\n${childDeclarations.join('\n')}\n}`;
  }
  if (typeof symbol.runtimeName !== 'string') {
    return '';
  }
  const runtimeName: string = JSON.stringify(symbol.runtimeName);
  let expression: string;
  switch (symbol.kind) {
    case 'function':
      expression = `(globalThis as any).Panda.getFunction(${runtimeName}, ${JSON.stringify(symbol.name)})`;
      break;
    case 'property':
      expression = `(globalThis as any).Panda.getClass(${runtimeName}).${symbol.name}`;
      break;
    case 'class':
      expression = `(globalThis as any).Panda.getClass(${runtimeName})`;
      break;
    default:
      return '';
  }
  return `${prefix}const ${declarationName} = __createLazy__(() => ${expression}, ${JSON.stringify(declarationName)});`;
}

/** Marks a generated node as synthetic and prevents original or nested source comments from being emitted. */
function clearSyntheticNodeRange<T extends ts.Node>(node: T): T {
  ts.setTextRange(node, { pos: -1, end: -1 });
  ts.setEmitFlags(node, ts.EmitFlags.NoComments | ts.EmitFlags.NoNestedComments);
  return node;
}

/** Recreates a template head without retaining its temporary source-file range. */
function cloneTemplateHead(node: ts.TemplateHead): ts.TemplateHead {
  return ts.factory.createTemplateHead(node.text, node.rawText);
}

/** Recreates a template middle/tail while preserving its cooked and raw text. */
function cloneTemplateMiddleOrTail(node: ts.TemplateMiddle | ts.TemplateTail): ts.TemplateMiddle | ts.TemplateTail {
  return ts.isTemplateMiddle(node) ?
    ts.factory.createTemplateMiddle(node.text, node.rawText) :
    ts.factory.createTemplateTail(node.text, node.rawText);
}

/** Runtime fallback helpers inserted once whenever the source file contains at least one replacement. */
const STATIC_INTEROP_DYNAMIC_IMPORT_HELPERS: string = `
const __staticInteropModuleCache__ = new Map<string, object>();
function __loadStaticInteropModule__(moduleName: string, factory: () => object): object {
  let module = __staticInteropModuleCache__.get(moduleName);
  if (!module) {
    module = factory();
    __staticInteropModuleCache__.set(moduleName, module);
  }
  return module;
}
`;

const STATIC_INTEROP_REPLACEMENT_HELPERS: string = `
function __createLazy__<T>(loader: () => T, label?: string): T {
  try {
    return loader();
  } catch (e) {
    console.error(\`Interop: Load target \${label} failed, use fallback placeholder object\`);
    return __createUnsupportedObject__(e, label) as T;
  }
}
function __createUnsupportedObject__(reason: unknown, label = 'object'): any {
  const make = (op: string) => (): never => {
    throw new Error(\`Interop: Access failed on '\${label}' (\${op}) : \${
      reason instanceof Error ? reason.message : String(reason)}\`, { cause: reason });
  };
  const target: any = function () {};
  return new Proxy(target, {
    get: make('get'),
    set: make('set'),
    has: make('has'),
    deleteProperty: make('delete'),
    apply: make('apply'),
    construct: make('construct'),
    ownKeys: make('ownKeys'),
    getOwnPropertyDescriptor: make('getOwnPropertyDescriptor'),
    defineProperty: make('defineProperty'),
    getPrototypeOf: make('getPrototypeOf'),
    setPrototypeOf: make('setPrototypeOf'),
    isExtensible: make('isExtensible'),
    preventExtensions: make('preventExtensions'),
  });
}
`;
