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

import * as ts from 'typescript';
import fs from 'fs';
import path from 'path';
import { logger } from './compile_info';
import { harFilesRecord, GeneratedFileInHar, toUnixPath } from './utils';
import { compilerOptions, resolveModuleNames as resolveModuleNamesOrig } from './ets_checker';
import { projectConfig } from '../main';

const SOURCE_TO_DECLARATION: Record<string, string> = {
  '.ets': '.d.ets',
  '.ts': '.d.ts',
};

function toSourceFilePath(
  declPath: string,
  projectPath: string,
): string | null {
  const isDets: boolean = declPath.endsWith('.d.ets');
  const isDts: boolean = declPath.endsWith('.d.ts');
  if (!isDets && !isDts) {
    return null;
  }
  const relativePath: string = path.relative(projectPath, declPath);
  if (relativePath.startsWith('..')) {
    return null;
  }
  const sourceRelativePath: string = relativePath
    .replace(/\.d\.ets$/, '.ets')
    .replace(/\.d\.ts$/, '.ts');
  return path.join(projectConfig.projectRootPath, sourceRelativePath);
}

function resolveWithFallback(
  moduleName: string,
  sourceContainingFile: string,
  resolved: ts.ResolvedModuleFull | null
): ts.ResolvedModuleFull | null {
  if (resolved) {
    return resolved;
  }
  if (!sourceContainingFile) {
    return null;
  }
  const fallback: (ts.ResolvedModuleFull | null)[] =
    resolveModuleNamesOrig([moduleName], sourceContainingFile);
  return fallback[0] ?? null;
}

function createDeclarationModuleResolver(
  projectPath: string
): (moduleNames: string[], containingFile: string) => (ts.ResolvedModuleFull | null)[] {
  return (
    moduleNames: string[],
    containingFile: string
  ): (ts.ResolvedModuleFull | null)[] => {
    const resolved: (ts.ResolvedModuleFull | null)[] =
      resolveModuleNamesOrig(moduleNames, containingFile);
    const sourceContainingFile: string | null =
      toSourceFilePath(containingFile, projectPath);
    for (let i = 0; i < resolved.length; i++) {
      resolved[i] = resolveWithFallback(moduleNames[i], sourceContainingFile, resolved[i]);
    }
    for (let i = 0; i < resolved.length; i++) {
      const mod = resolved[i];
      if (!mod || !mod.resolvedFileName || !mod.packageId) {
        continue;
      }
      const ext = path.extname(mod.resolvedFileName);
      const declExt = SOURCE_TO_DECLARATION[ext];
      if (!declExt) {
        continue;
      }
      const declFileName =
        mod.packageId.subModuleName.replace(new RegExp('\\' + ext + '$'), declExt);
      const declFilePath =
        path.join(projectPath, mod.packageId.name, declFileName);
      if (fs.existsSync(declFilePath)) {
        resolved[i] = {
          resolvedFileName: declFilePath,
          extension: declExt as ts.Extension,
        };
      }
    }
    return resolved;
  };
}

class NameCollisionResolver {
  private nameMap: Map<string, Map<ts.Symbol, string>> = new Map();

  resolve(symbol: ts.Symbol, preferredName: string): string {
    let bucket: Map<ts.Symbol, string> | undefined = this.nameMap.get(preferredName);
    if (!bucket) {
      bucket = new Map();
      this.nameMap.set(preferredName, bucket);
    }
    const existing: string | undefined = bucket.get(symbol);
    if (existing !== undefined) {
      return existing;
    }
    const name: string = bucket.size === 0 ? preferredName : `${preferredName}_${bucket.size}`;
    bucket.set(symbol, name);
    return name;
  }
}

interface EmittedEntry {
  lineIndex: number;
  node: ts.Node;
  sourceFile: ts.SourceFile;
}

export interface DeclarationMergeOptions {
  entryFile?: string;
  entryFiles?: string[];
  projectPath: string;
  isByteCodeHar: boolean;
  moduleRootPath?: string;
  packageDir?: string;
  systemModules?: string[];
  resolveModuleNames?: (
    moduleNames: string[],
    containingFile: string
  ) => (ts.ResolvedModuleFull | null)[];
}

export class DeclarationMerger {
  private options: DeclarationMergeOptions;
  private program: ts.Program;
  private checker: ts.TypeChecker;
  private printer: ts.Printer;
  private emittedEntries: Map<ts.Symbol, EmittedEntry> = new Map();
  private importStatements: Set<string> = new Set();
  private nameResolver: NameCollisionResolver = new NameCollisionResolver();
  private pendingRenames: Map<string, string> = new Map();
  private entryExportSymbols: Set<ts.Symbol> = new Set();
  private entrySourceFile: ts.SourceFile | undefined;

  private constructor(options: DeclarationMergeOptions, rootFiles: string[]) {
    this.options = options;
    this.printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
      removeComments: true,
    });
    this.program = this.createDeclarationProgram(rootFiles);
    this.checker = this.program.getTypeChecker();
  }

  private mergeEntry(entryFile: string): void {
    this.emittedEntries = new Map();
    this.importStatements = new Set();
    this.nameResolver = new NameCollisionResolver();
    this.entryExportSymbols = new Set();
    this.entrySourceFile = this.program.getSourceFile(entryFile);
    if (!this.entrySourceFile) {
      logger.debug(`Declaration entry file not found in program: ${entryFile}`);
      return;
    }

    const mergedContent: string = this.generateMergedContent();
    harFilesRecord.forEach((value: GeneratedFileInHar): void => {
      if (value.originalDeclarationCachePath === entryFile) {
        value.originalDeclarationContent = mergedContent;
      }
    });
    if (!this.options.isByteCodeHar) {
      fs.writeFileSync(entryFile, mergedContent);
    }
  }

  private createDeclarationProgram(rootFiles: string[]): ts.Program {
    const declOptions: ts.CompilerOptions = {
      ...compilerOptions,
      noEmit: true,
      skipLibCheck: true,
      skipDefaultLibCheck: true,
      types: undefined,
      lib: undefined,
      incremental: false,
      tsBuildInfoFile: undefined,
    };

    const host = ts.createCompilerHost(declOptions);
    host.writeFile = (): void => {};
    host.resolveModuleNames = this.options.resolveModuleNames ??
      createDeclarationModuleResolver(this.options.projectPath);
    host.getCurrentDirectory = (): string => process.cwd();
    host.getDefaultLibFileName = (options: ts.CompilerOptions): string => {
      return ts.getDefaultLibFilePath(options);
    };

    return ts.createProgram(rootFiles, declOptions, host);
  }

  private generateMergedContent(): string {
    if (!this.entrySourceFile) {
      return '';
    }

    const lines: string[] = [];
    const unexportedNames: string[] = [];
    const entrySymbol: ts.Symbol | undefined =
      this.checker.getSymbolAtLocation(this.entrySourceFile);
    if (!entrySymbol) {
      return '';
    }

    for (const exportSymbol of this.checker.getExportsOfModule(entrySymbol)) {
      const resolved = this.resolveToActualDeclaration(exportSymbol);
      if (resolved) {
        this.entryExportSymbols.add(resolved);
      }
    }

    for (const exportSymbol of this.checker.getExportsOfModule(entrySymbol)) {
      this.processExportSymbol(exportSymbol, lines, unexportedNames);
    }

    this.appendExportStatements(unexportedNames, lines);

    return this.sortImportLinesFirst(lines).join('\n\n');
  }

  private processExportSymbol(
    exportSymbol: ts.Symbol,
    lines: string[],
    unexportedNames: string[]
  ): void {
    const renameInfo = this.resolveExportRename(exportSymbol);
    const isDefault: boolean = exportSymbol.name === 'default';

    const resolved = this.resolveToActualDeclaration(exportSymbol);
    if (!resolved) {
      return;
    }

    const declaration: ts.Declaration = resolved.declarations[0];

    const sysApiDecl = this.isSystemApiDeclaration(declaration);
    if (sysApiDecl) {
      this.appendExternalExportStatement(sysApiDecl, renameInfo, lines);
      return;
    }

    const sourceFile: ts.SourceFile = declaration.getSourceFile();
    const declName: string = this.getLocalNameOfDeclaration(declaration);
    const preferredName: string = isDefault ? declName : renameInfo.exportedName;
    const emitName: string = this.nameResolver.resolve(resolved, preferredName);

    const nameRenames: Map<string, string> = new Map();
    if (emitName !== declName) {
      nameRenames.set(declName, emitName);
    }
    const text: string = this.printWithRenames(declaration, sourceFile, nameRenames);
    if (!text) {
      return;
    }

    const added: boolean = this.addDeclaration(resolved, declaration, sourceFile, lines, text);
    if (added) {
      this.processDeclarationDeps(resolved, declaration, lines);
    }

    if (isDefault) {
      this.addUniqueImport(lines, `export default ${emitName};`);
    } else if (!this.nodeHasExportModifier(declaration)) {
      unexportedNames.push(emitName);
    }
  }

  private addDeclaration(
    symbol: ts.Symbol,
    node: ts.Node,
    sourceFile: ts.SourceFile,
    lines: string[],
    text: string
  ): boolean {
    if (this.emittedEntries.has(symbol)) {
      return false;
    }
    lines.push(text);
    this.emittedEntries.set(symbol, {
      lineIndex: lines.length - 1,
      node,
      sourceFile,
    });
    return true;
  }

  private addUniqueImport(lines: string[], text: string): boolean {
    if (this.importStatements.has(text)) {
      return false;
    }
    lines.push(text);
    this.importStatements.add(text);
    return true;
  }

  private processDeclarationDeps(
    resolved: ts.Symbol,
    declaration: ts.Declaration,
    lines: string[]
  ): void {
    const localRenames: Map<string, string> = new Map();

    const savedPending: Map<string, string> = this.pendingRenames;
    this.pendingRenames = localRenames;

    this.collectReferencedTypes(declaration, lines);

    this.pendingRenames = savedPending;

    if (localRenames.size > 0) {
      const entry = this.emittedEntries.get(resolved);
      if (entry) {
        lines[entry.lineIndex] = this.printWithRenames(
          entry.node, entry.sourceFile, localRenames
        );
      }
      for (const [from, to] of localRenames) {
        this.pendingRenames.set(from, to);
      }
    }
  }

  private collectReferencedTypes(
    declaration: ts.Declaration,
    lines: string[]
  ): void {
    const visit = (node: ts.Node): void => {
      const identifier = this.extractTypeIdentifier(node);
      if (identifier) {
        this.processTypeReference(identifier, lines);
      }
      ts.forEachChild(node, visit);
    };

    ts.forEachChild(declaration, visit);
  }

  private extractTypeIdentifier(node: ts.Node): ts.Identifier | undefined {
    if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
      return node.typeName;
    }
    if (ts.isExpressionWithTypeArguments(node) && ts.isIdentifier(node.expression)) {
      return node.expression;
    }
    return undefined;
  }

  private processTypeReference(identifier: ts.Identifier, lines: string[]): void {
    const refSymbol: ts.Symbol | undefined = this.checker.getSymbolAtLocation(identifier);
    if (!refSymbol) {
      return;
    }
    if (this.isTypeParameterSymbol(refSymbol)) {
      return;
    }

    const resolved = this.resolveToActualDeclaration(refSymbol);
    if (!resolved || this.emittedEntries.has(resolved)) {
      return;
    }
    if (this.isTypeParameterSymbol(resolved)) {
      return;
    }
    if (this.entryExportSymbols.has(resolved)) {
      return;
    }

    const refDecl: ts.Declaration = resolved.declarations[0];
    if (this.isDefaultLibraryDeclaration(refDecl)) {
      return;
    }

    const sysApiDecl = this.isSystemApiDeclaration(refDecl);
    if (sysApiDecl) {
      this.emitSystemApiImport(refSymbol, resolved, sysApiDecl, identifier, lines);
    } else {
      this.inlineReferencedDeclaration(resolved, refDecl, identifier, lines);
    }
  }

  private emitSystemApiImport(
    refSymbol: ts.Symbol,
    resolved: ts.Symbol,
    sysApiDecl: { moduleName: string; name: string },
    identifier: ts.Identifier,
    lines: string[]
  ): void {
    const localName: string = identifier.text;
    const emitName: string = this.nameResolver.resolve(resolved, localName);
    if (this.isDefaultExportOfModule(refSymbol)) {
      this.addUniqueImport(lines, `import ${emitName} from '${sysApiDecl.moduleName}';`);
    } else {
      const importName: string = emitName !== sysApiDecl.name
        ? `${sysApiDecl.name} as ${emitName}`
        : emitName;
      this.addUniqueImport(lines, `import { ${importName} } from '${sysApiDecl.moduleName}';`);
    }
    this.emittedEntries.set(resolved, { lineIndex: -1, node: refSymbol.declarations[0], sourceFile: refSymbol.declarations[0].getSourceFile() });
  }

  private inlineReferencedDeclaration(
    resolved: ts.Symbol,
    refDecl: ts.Declaration,
    identifier: ts.Identifier,
    lines: string[]
  ): void {
    const sourceFile: ts.SourceFile = refDecl.getSourceFile();
    const declName: string = this.getLocalNameOfDeclaration(refDecl);
    const localName: string = identifier.text;
    const emitName: string = this.nameResolver.resolve(resolved, localName);

    const nameRenames: Map<string, string> = new Map();
    if (emitName !== declName) {
      nameRenames.set(declName, emitName);
      this.pendingRenames.set(declName, emitName);
    }

    const text: string = this.printWithRenames(refDecl, sourceFile, nameRenames, true);
    if (!text) {
      return;
    }

    if (this.addDeclaration(resolved, refDecl, sourceFile, lines, text)) {
      this.processDeclarationDeps(resolved, refDecl, lines);
    }
  }

  private isTypeParameterSymbol(symbol: ts.Symbol): boolean {
    return (symbol.flags & ts.SymbolFlags.TypeParameter) !== 0;
  }

  private isDefaultLibraryDeclaration(decl: ts.Declaration): boolean {
    return this.program.isSourceFileDefaultLibrary(decl.getSourceFile());
  }

  private printWithRenames(
    node: ts.Node,
    sourceFile: ts.SourceFile,
    renames: Map<string, string>,
    stripExport: boolean = false
  ): string {
    const printNode: ts.Node = this.getDeclarationNode(node);

    let text: string;
    if (renames.size === 0) {
      text = this.sanitizeDeclarationText(
        this.printer.printNode(ts.EmitHint.Unspecified, printNode, sourceFile)
      );
    } else {
      const statement = ts.isStatement(printNode)
        ? printNode as ts.Statement
        : ts.factory.createExpressionStatement(printNode as ts.Expression);
      const syntheticFile = ts.factory.createSourceFile(
        [statement],
        ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None
      );

      const result = ts.transform(syntheticFile, [
        (context: ts.TransformationContext) => {
          const visitor = (n: ts.Node): ts.Node => {
            if (ts.isIdentifier(n) && renames.has(n.text)) {
              return ts.factory.createIdentifier(renames.get(n.text)!);
            }
            return ts.visitEachChild(n, visitor, context);
          };
          return (sf: ts.SourceFile) => ts.visitEachChild(sf, visitor, context) as ts.SourceFile;
        }
      ]);

      const transformed = result.transformed[0] as ts.SourceFile;
      text = this.sanitizeDeclarationText(
        this.printer.printNode(ts.EmitHint.Unspecified, transformed.statements[0], sourceFile)
      );
      result.dispose();
    }

    if (stripExport) {
      text = this.stripExportModifier(text);
    }
    return text;
  }

  private stripExportModifier(text: string): string {
    return text.replace(
      /^(\s*@\S+\s*)*export\s+(default\s+)?(declare\s+)?/gm,
      (_match: string, decorators: string, _hasDefault: string, hasDeclare: string): string => {
        const prefix: string = decorators ?? '';
        return prefix + 'declare ';
      }
    );
  }

  private nodeHasExportModifier(node: ts.Node): boolean {
    const decl = this.getDeclarationNode(node);
    if (!ts.canHaveModifiers(decl)) {
      return false;
    }
    const modifiers = ts.getModifiers(decl);
    if (!modifiers) {
      return false;
    }
    return modifiers.some((m: ts.ModifierLike): boolean => m.kind === ts.SyntaxKind.ExportKeyword);
  }

  private sortImportLinesFirst(lines: string[]): string[] {
    const importLines: string[] = [];
    const declarationLines: string[] = [];
    for (const line of lines) {
      if (line.startsWith('import ')) {
        importLines.push(line);
      } else {
        declarationLines.push(line);
      }
    }
    return [...importLines, ...declarationLines];
  }

  private appendExportStatements(names: string[], lines: string[]): void {
    if (names.length === 0) {
      return;
    }
    this.addUniqueImport(lines, `export { ${names.join(', ')} };`);
  }

  private getDeclImportInfo(decl: ts.Node): { name: string; moduleSpecifier?: string } | null {
    if (ts.isExportSpecifier(decl)) {
      const name: string = decl.propertyName?.text ?? decl.name.text;
      const exportDecl = decl.parent.parent;
      const moduleSpecifier: string | undefined =
        exportDecl.moduleSpecifier && ts.isStringLiteral(exportDecl.moduleSpecifier)
          ? exportDecl.moduleSpecifier.text
          : undefined;
      return { name, moduleSpecifier };
    }
    if (ts.isImportSpecifier(decl)) {
      const name: string = decl.propertyName?.text ?? decl.name.text;
      const importDecl = this.findAncestorImportDeclaration(decl);
      const moduleSpecifier: string | undefined =
        importDecl?.moduleSpecifier && ts.isStringLiteral(importDecl.moduleSpecifier)
          ? importDecl.moduleSpecifier.text
          : undefined;
      return { name, moduleSpecifier };
    }
    return null;
  }

  private resolveExportRename(exportSymbol: ts.Symbol): { exportedName: string; originalName: string } {
    const exportedName: string = exportSymbol.name;
    const decl: ts.Declaration | undefined = exportSymbol.declarations?.[0];
    if (!decl) {
      return { exportedName, originalName: exportedName };
    }
    const info = this.getDeclImportInfo(decl);
    const originalName: string = info?.name ?? exportedName;
    return { exportedName, originalName };
  }

  private resolveToActualDeclaration(symbol: ts.Symbol): ts.Symbol | null {
    const visited: Set<ts.Symbol> = new Set();
    let current: ts.Symbol | undefined = symbol;

    while (current && (current.flags & ts.SymbolFlags.Alias)) {
      if (visited.has(current)) {
        break;
      }
      visited.add(current);
      const aliased: ts.Symbol = this.checker.getAliasedSymbol(current);
      if (!aliased || aliased === current) {
        break;
      }
      current = aliased;
    }

    if (!current || !current.declarations || current.declarations.length === 0) {
      return null;
    }

    return current;
  }

  private appendExternalExportStatement(
    sysApiInfo: { moduleName: string; name: string },
    renameInfo: { exportedName: string; originalName: string },
    lines: string[]
  ): void {
    const namePart: string = renameInfo.exportedName !== sysApiInfo.name
      ? `${sysApiInfo.name} as ${renameInfo.exportedName}`
      : sysApiInfo.name;
    this.addUniqueImport(lines, `export { ${namePart} } from '${sysApiInfo.moduleName}';`);
  }

  private findAncestorImportDeclaration(node: ts.Node): ts.ImportDeclaration | null {
    let current: ts.Node | undefined = node.parent;
    while (current) {
      if (ts.isImportDeclaration(current)) {
        return current;
      }
      current = current.parent;
    }
    return null;
  }

  private isSystemApiModuleName(moduleName: string): boolean {
    const modules: string[] | undefined = this.options.systemModules;
    if (!modules || modules.length === 0) {
      return false;
    }
    const trimmed: string = moduleName.trim();
    return modules.includes(trimmed + '.d.ts') || modules.includes(trimmed + '.d.ets');
  }

  private isSystemApiDeclaration(declaration: ts.Node): { moduleName: string; name: string } | null {
    const modules: string[] | undefined = this.options.systemModules;
    if (!modules || modules.length === 0) {
      return null;
    }
    const sourceFile: ts.SourceFile = declaration.getSourceFile();
    const baseName: string = path.basename(sourceFile.fileName);
    for (const mod of modules) {
      if (baseName === mod) {
        const moduleName: string = mod.replace(/\.d\.(ets|ts)$/, '');
        const name: string = this.getLocalNameOfDeclaration(declaration);
        return { moduleName, name };
      }
    }
    return null;
  }

  private isDefaultExportOfModule(symbol: ts.Symbol): boolean {
    const visited: Set<ts.Symbol> = new Set();
    let current: ts.Symbol | undefined = symbol;
    while (current) {
      if (visited.has(current)) {
        break;
      }
      visited.add(current);
      if (current.name === 'default') {
        return true;
      }
      if (!(current.flags & ts.SymbolFlags.Alias)) {
        break;
      }
      const aliased: ts.Symbol = this.checker.getAliasedSymbol(current);
      if (!aliased || aliased === current) {
        break;
      }
      current = aliased;
    }
    return false;
  }

  private sanitizeDeclarationText(text: string): string {
    return this.removeAutoGeneratedExtends(this.removeAutoGeneratedConstructor(text));
  }

  private removeAutoGeneratedConstructor(text: string): string {
    const pattern: RegExp =
      /\s+constructor\(\?:\s*\{[\s\S]*?\},\s*\?:[\s\S]*?\)\s*\{[\s\S]*?\}/g;
    return text.replace(pattern, '').replace(/\n\s+\n/g, '\n\n');
  }

  private removeAutoGeneratedExtends(text: string): string {
    return text.replace(/\s+extends\s+\{/g, ' {');
  }

  private getLocalNameOfDeclaration(declaration: ts.Node): string {
    const named = declaration as ts.Node & { name?: ts.Node };
    if (named.name && ts.isIdentifier(named.name)) {
      return named.name.text;
    }
    return 'default';
  }

  private getDeclarationNode(node: ts.Node): ts.Node {
    if (ts.isVariableDeclaration(node)) {
      return this.findAncestorByKind(node, ts.SyntaxKind.VariableStatement) ?? node;
    }
    return node;
  }

  private findAncestorByKind(node: ts.Node, kind: ts.SyntaxKind): ts.Node | null {
    let current: ts.Node | undefined = node.parent;
    while (current) {
      if (current.kind === kind) {
        return current;
      }
      if (ts.isSourceFile(current)) {
        break;
      }
      current = current.parent;
    }
    return null;
  }

  public static mergeDeclarationFiles(options: DeclarationMergeOptions): void {
    const rootFiles: string[] = options.entryFiles ?? (options.entryFile ? [options.entryFile] : []);
    if (rootFiles.length === 0) {
      return;
    }
    const merger = new DeclarationMerger(options, rootFiles);
    for (const entryFile of rootFiles) {
      merger.mergeEntry(entryFile);
    }
    merger.cleanup(rootFiles);
  }

  private cleanup(entryFiles: string[]): void {
    const entrySet: Set<string> = new Set(entryFiles.map(toUnixPath));

    for (const [key, value] of harFilesRecord) {
      if (!value.originalDeclarationCachePath) {
        continue;
      }
      const cachePath: string = toUnixPath(value.originalDeclarationCachePath);
      if (entrySet.has(cachePath)) {
        continue;
      }
      if (fs.existsSync(cachePath)) {
        fs.unlinkSync(cachePath);
      }
      harFilesRecord.delete(key);
    }
  }
}
