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
 * replacements in one source file share a single createLazy/createUnsupportedObject helper pair.
 */
export function processStaticInteropImports(sourceFile: ts.SourceFile, id: string,
  context: ts.TransformationContext): ts.SourceFile {
  staticInteropTransformLog.sourceFile = sourceFile;
  logger.debug('processStaticInteropImports start', {
    id,
    sourceFileName: sourceFile.fileName,
    statementCount: sourceFile.statements.length
  });
  const containingFile: string = stripQuery(id);
  const replacementStatements: ts.Statement[] = [];
  let replacementCount: number = 0;
  sourceFile.statements.forEach((statement: ts.Statement) => {
    const result: StaticInteropImportProcessResult =
      processStaticInteropImportStatement(sourceFile.fileName, containingFile, statement, context);
    replacementStatements.push(...result.statements);
    if (result.replaced) {
      replacementCount++;
    }
  });
  if (replacementCount === 0 && replacementStatements.length === sourceFile.statements.length) {
    logger.debug('processStaticInteropImports complete without source changes', {
      sourceFileName: sourceFile.fileName
    });
    return sourceFile;
  }
  const updatedSourceFile: ts.SourceFile =
    replacementCount > 0 ? createSourceFileWithStaticInteropHelpers(sourceFile, replacementStatements, context) :
      ts.factory.updateSourceFile(sourceFile, replacementStatements);
  logger.info('processStaticInteropImports complete with source changes',
    { sourceFileName: sourceFile.fileName, replacementCount, finalStatementCount: updatedSourceFile.statements.length });
  return updatedSourceFile;
}

type StaticInteropImportProcessResult = {
  statements: ts.Statement[],
  replaced: boolean
};

function processStaticInteropImportStatement(sourceFileName: string, containingFile: string,
  statement: ts.Statement, context: ts.TransformationContext): StaticInteropImportProcessResult {
  if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
    logger.debug('checking import declaration', { moduleName: statement.moduleSpecifier.text });
  }
  const staticImportPath: string | undefined = getStaticImport(statement, containingFile);
  if (!staticImportPath || !ts.isImportDeclaration(statement)) {
    return { statements: [statement], replaced: false };
  }
  if (isTypeOnlyStaticInteropImport(statement)) {
    logger.debug('drop type-only static interop import declaration');
    return { statements: [], replaced: false };
  }
  const bindings: StaticInteropImportBinding[] = getStaticInteropImportBindings(statement);
  if (bindings.length === 0) {
    logger.debug('keep import declaration because static interop bindings are unsupported');
    return { statements: [statement], replaced: false };
  }
  const replacement: ts.Statement[] = createStaticInteropReplacement(
    sourceFileName, path.resolve(staticImportPath), bindings, context, statement.pos >= 0 ? statement.pos : 0);
  if (replacement.length === 0) {
    logger.debug('keep import declaration because replacement is empty');
    return { statements: [statement], replaced: false };
  }
  logger.info('static import matched', {
    targetFilePath: staticImportPath,
    replacementStatementCount: replacement.length
  });
  return { statements: replacement, replaced: true };
}

function createSourceFileWithStaticInteropHelpers(sourceFile: ts.SourceFile, replacementStatements: ts.Statement[],
  context: ts.TransformationContext): ts.SourceFile {
  const helperStatements: ts.Statement[] =
    createStaticInteropStatements(sourceFile.fileName, STATIC_INTEROP_REPLACEMENT_HELPERS, context);
  const updatedSourceFile: ts.SourceFile = ts.factory.updateSourceFile(
    sourceFile, insertStatementsAfterImports(replacementStatements, helperStatements));
  logger.debug('source before modification\n' +
    ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }).printFile(sourceFile));
  logger.debug('source after modification\n' +
    ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }).printFile(updatedSourceFile));
  return updatedSourceFile;
}

/**
 * Reads runtime bindings from default, named, or namespace imports. A default import maps to the
 * `"default"` metadata symbol emitted for the static file.
 */
function getStaticInteropImportBindings(importDeclaration: ts.ImportDeclaration): StaticInteropImportBinding[] {
  const importClause: ts.ImportClause | undefined = importDeclaration.importClause;
  if (!importClause || importClause.isTypeOnly) {
    logger.debug('skip import bindings because declaration has no runtime import clause');
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
  logger.debug('resolved import bindings', { bindings });
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
  const moduleName: string = node.moduleSpecifier.text;
  const resolvedModule: ts.ResolvedModuleFull | undefined = resolveModuleName(moduleName, containingFile).resolvedModule;
  if (!resolvedModule?.resolvedFileName) {
    logger.debug('skip static import because module is unresolved', { moduleName, containingFile });
    return undefined;
  }
  const resolvedImportPath: string = normalizeFilePath(stripQuery(resolvedModule.resolvedFileName));
  const languageVersion = FileManager.getInstance().getLanguageVersionByFilePath(resolvedImportPath);
  logger.debug('resolved import language version', {
    moduleName,
    resolvedImportPath,
    languageVersion: languageVersion?.languageVersion
  });
  if (languageVersion?.languageVersion !== ARKTS_1_2) {
    logger.debug('skip static import because target is not ArkTS 1.2', {
      moduleName,
      resolvedImportPath
    });
    return undefined;
  }

  logger.debug('static import target resolved', {
    moduleName,
    resolvedImportPath
  });
  return resolvedImportPath;
}

/** Inserts generated helpers and declarations immediately after the remaining import declarations. */
function insertStatementsAfterImports(statements: ts.Statement[], insertedStatements: ts.Statement[]): ts.Statement[] {
  const lastImportIndex: number = statements.reduce((index: number, statement: ts.Statement, currentIndex: number) =>
    ts.isImportDeclaration(statement) ? currentIndex : index, -1);
  const insertIndex: number = lastImportIndex + 1;
  logger.debug('insert generated statements after imports', {
    originalStatementCount: statements.length,
    insertedStatementCount: insertedStatements.length,
    insertIndex
  });
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
  logger.debug('create static interop replacement start', {
    sourceFileName,
    targetFilePath,
    bindings
  });
  const symbols: Record<string, StaticInteropSymbol> | undefined =
    FileManager.getInstance().getStaticInteropSymbols(targetFilePath);
  if (!symbols) {
    recordMissingStaticInteropSymbolError(targetFilePath, errorPos);
    return [];
  }
  logger.debug('resolved static interop symbols', { symbols });
  const boundSymbols: BoundStaticInteropSymbol[] = bindStaticInteropSymbols(symbols, bindings, targetFilePath, errorPos);
  if (boundSymbols.length === 0) {
    return [];
  }
  const replacementSourceText: string = createStaticInteropReplacementSource(boundSymbols);
  if (!replacementSourceText) {
    return [];
  }
  logger.debug('generated replacement source\n' + replacementSourceText);
  const replacementStatements: ts.Statement[] = createStaticInteropStatements(
    sourceFileName, replacementSourceText, context);
  logger.debug('create static interop replacement complete', {
    symbolCount: Object.keys(symbols).length,
    statementCount: replacementStatements.length
  });
  return replacementStatements;
}

function bindStaticInteropSymbols(symbols: Record<string, StaticInteropSymbol>,
  bindings: StaticInteropImportBinding[], targetFilePath: string, errorPos?: number): BoundStaticInteropSymbol[] {
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
      recordMissingStaticInteropSymbolError(targetFilePath, errorPos, binding.importedName);
      return [];
    }
    boundSymbols.push({ symbol, localName: binding.localName });
  }
  return boundSymbols;
}

function recordMissingStaticInteropSymbolError(targetFilePath: string, errorPos: number = 0,
  importedName?: string): void {
  const symbolInfo: string = importedName ? ` for symbol '${importedName}'` : '';
  const errInfo = LogDataFactory.newInstance(
    ErrorCode.ETS2BUNDLE_INTERNAL_MISSING_BRIDGECODE_PATH_INFO,
    ArkTSInternalErrorDescription,
    `Missing static interop metadata${symbolInfo} when processing static import '${normalizeFilePath(targetFilePath)}'.`
  );
  staticInteropTransformLog.errors.push({
    type: LogType.ERROR,
    message: errInfo.toString(),
    pos: errorPos
  });
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
  logger.debug('create replacement source start', {
    symbolCount: symbols.length
  });
  const declarationList: string[] = symbols.map(({ symbol, localName }: BoundStaticInteropSymbol) =>
    createStaticInteropDeclaration(symbol, localName, false));
  if (declarationList.some((declaration: string) => !declaration)) {
    return '';
  }
  const declarations: string = declarationList.join('\n');
  const replacementSource: string = `${declarations}\n`;
  logger.debug('create replacement source complete', {
    sourceLength: replacementSource.length
  });
  return replacementSource;
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
  return `${prefix}const ${declarationName} = createLazy(() => ${expression}, ${JSON.stringify(declarationName)});`;
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
const STATIC_INTEROP_REPLACEMENT_HELPERS: string = `
function createLazy<T>(loader: () => T, label?: string): T {
  try {
    return loader();
  } catch (e) {
    console.error(\`Interop: Load target \${label} failed, use fallback placeholder object\`);
    return createUnsupportedObject(e, label) as T;
  }
}
function createUnsupportedObject(reason: unknown, label = 'object'): any {
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
