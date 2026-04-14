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
import { harFilesRecord } from './utils';
import { compilerOptions, resolveModuleNames as resolveModuleNamesOrig } from './ets_checker';

const SOURCE_TO_DECLARATION: Record<string, string> = {
  '.ets': '.d.ets',
  '.ts': '.d.ts',
};

function createDeclarationModuleResolver(
  projectPath: string
): (moduleNames: string[], containingFile: string) => (ts.ResolvedModuleFull | null)[] {
  return (
    moduleNames: string[],
    containingFile: string
  ): (ts.ResolvedModuleFull | null)[] => {
    const resolved: (ts.ResolvedModuleFull | null)[] =
      resolveModuleNamesOrig(moduleNames, containingFile);
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

export interface DeclarationMergeOptions {
  entryFile: string;
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
  private mergedDeclarations: Set<string> = new Set();
  private entrySourceFile: ts.SourceFile | undefined;

  constructor(options: DeclarationMergeOptions) {
    this.options = options;
    this.printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
      removeComments: true,
    });
    this.program = this.createDeclarationProgram();
    this.checker = this.program.getTypeChecker();
  }

  public merge(): void {
    if (!fs.existsSync(this.options.entryFile)) {
      logger.warn(`Declaration entry file not found: ${this.options.entryFile}`);
      return;
    }

    this.entrySourceFile = this.program.getSourceFile(this.options.entryFile);
    if (!this.entrySourceFile) {
      logger.warn(`Declaration entry file not found in program: ${this.options.entryFile}`);
      return;
    }

    const mergedContent: string = this.generateMergedContent();
    harFilesRecord.forEach((value) => {
      if (value.originalDeclarationCachePath === this.options.entryFile) {
        value.originalDeclarationContent = mergedContent;
      }
    });
    if (!this.options.isByteCodeHar) {
      fs.writeFileSync(this.options.entryFile, mergedContent);
    }
  }

  private createDeclarationProgram(): ts.Program {
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

    return ts.createProgram([this.options.entryFile], declOptions, host);
  }

  private generateMergedContent(): string {
    if (!this.entrySourceFile) {
      return '';
    }

    const lines: string[] = [];
    const visitedFiles: Set<string> = new Set();
    const unexportedNames: string[] = [];
    const entrySymbol: ts.Symbol | undefined =
      this.checker.getSymbolAtLocation(this.entrySourceFile);
    if (!entrySymbol) {
      return '';
    }

    for (const exportSymbol of this.checker.getExportsOfModule(entrySymbol)) {
      this.processExportSymbol(exportSymbol, lines, visitedFiles, unexportedNames);
    }

    this.processEntryImports(lines);
    this.appendExportStatements(unexportedNames, lines);

    return this.sortImportLinesFirst(lines).join('\n\n');
  }

  private processExportSymbol(
    exportSymbol: ts.Symbol,
    lines: string[],
    visitedFiles: Set<string>,
    unexportedNames: string[]
  ): void {
    const renameInfo = this.resolveExportRename(exportSymbol);
    const isDefault: boolean = exportSymbol.name === 'default';

    const sysApiInfo = this.findSystemApiModuleInChain(exportSymbol);
    if (sysApiInfo) {
      this.appendExternalExportStatement(sysApiInfo, renameInfo, lines);
      return;
    }

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
    let text: string = this.getDeclarationText(declaration, sourceFile);
    if (!text) {
      return;
    }

    if (renameInfo.exportedName !== renameInfo.originalName) {
      text = this.renameInText(text, renameInfo.originalName, renameInfo.exportedName);
    }

    if (this.addUniqueLine(lines, text)) {
      this.collectTransitiveImports(sourceFile, lines, visitedFiles);
    }

    if (isDefault) {
      const localName: string = this.getLocalNameOfDeclaration(declaration);
      this.addUniqueLine(lines, `export default ${localName};`);
    } else if (!this.textHasExportModifier(text)) {
      unexportedNames.push(renameInfo.exportedName);
    }
  }

  private addUniqueLine(lines: string[], text: string): boolean {
    if (this.mergedDeclarations.has(text)) {
      return false;
    }
    lines.push(text);
    this.mergedDeclarations.add(text);
    return true;
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

  private textHasExportModifier(text: string): boolean {
    const stripped: string = text.replace(/^@\S+\s*/gm, '').trimStart();
    return stripped.startsWith('export ');
  }

  private appendExportStatements(names: string[], lines: string[]): void {
    if (names.length === 0) {
      return;
    }
    this.addUniqueLine(lines, `export { ${names.join(', ')} };`);
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

  private findSystemApiModuleInChain(symbol: ts.Symbol): { moduleName: string; name: string } | null {
    const visited: Set<ts.Symbol> = new Set();
    let current: ts.Symbol | undefined = symbol;

    while (current) {
      if (visited.has(current)) {
        break;
      }
      visited.add(current);

      const decl: ts.Declaration | undefined = current.declarations?.[0];
      if (!decl) {
        break;
      }

      const info = this.getDeclImportInfo(decl);
      if (!info) {
        break;
      }

      if (info.moduleSpecifier && this.isSystemApiModuleName(info.moduleSpecifier)) {
        return { moduleName: info.moduleSpecifier, name: info.name };
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

    return null;
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
    this.addUniqueLine(lines, `export { ${namePart} } from '${sysApiInfo.moduleName}';`);
  }

  private collectTransitiveImports(
    sourceFile: ts.SourceFile,
    lines: string[],
    visitedFiles: Set<string>
  ): void {
    if (visitedFiles.has(sourceFile.fileName) || sourceFile === this.entrySourceFile) {
      return;
    }
    visitedFiles.add(sourceFile.fileName);

    const skipNames: Set<string> = this.getExportNamesOfFile(sourceFile);
    this.processFileImports(sourceFile, skipNames, lines, visitedFiles);
  }

  private processEntryImports(lines: string[]): void {
    if (!this.entrySourceFile) {
      return;
    }
    const skipNames: Set<string> = this.getExportNamesOfFile(this.entrySourceFile);
    this.processFileImports(this.entrySourceFile, skipNames, lines, new Set<string>());
  }

  private getExportNamesOfFile(sourceFile: ts.SourceFile): Set<string> {
    const symbol: ts.Symbol | undefined = this.checker.getSymbolAtLocation(sourceFile);
    const exports: ts.Symbol[] = symbol ? this.checker.getExportsOfModule(symbol) : [];
    return new Set(exports.map((e: ts.Symbol): string => e.name));
  }

  private processFileImports(
    sourceFile: ts.SourceFile,
    skipNames: Set<string>,
    lines: string[],
    visitedFiles: Set<string>
  ): void {
    ts.forEachChild(sourceFile, (node: ts.Node): void => {
      if (!ts.isImportDeclaration(node)) {
        return;
      }
      const clause = node.importClause;
      if (!clause || !ts.isStringLiteral(node.moduleSpecifier)) {
        return;
      }

      const isSystemApi: boolean = this.isSystemApiModuleName(node.moduleSpecifier.text);
      this.processNamedImports(clause, isSystemApi, skipNames, lines, visitedFiles);
      this.processDefaultImport(clause, node.moduleSpecifier, isSystemApi, skipNames, lines, visitedFiles);
    });
  }

  private processNamedImports(
    clause: ts.ImportClause,
    isSystemApi: boolean,
    skipNames: Set<string>,
    lines: string[],
    visitedFiles: Set<string>
  ): void {
    if (!clause.namedBindings || !ts.isNamedImports(clause.namedBindings)) {
      return;
    }
    for (const elem of clause.namedBindings.elements) {
      if (skipNames.has(elem.name.text)) {
        continue;
      }
      if (isSystemApi) {
        this.processSystemApiNamedImport(elem, lines);
      } else {
        this.processLocalNamedImport(elem, lines, visitedFiles);
      }
    }
  }

  private processDefaultImport(
    clause: ts.ImportClause,
    specifier: ts.StringLiteral,
    isSystemApi: boolean,
    skipNames: Set<string>,
    lines: string[],
    visitedFiles: Set<string>
  ): void {
    if (!clause.name) {
      return;
    }
    const name: string = clause.name.text;
    if (skipNames.has(name)) {
      return;
    }

    if (isSystemApi) {
      this.addUniqueLine(lines, `import ${name} from '${specifier.text}';`);
      return;
    }
    this.processLocalDefaultImport(clause.name, lines, visitedFiles);
  }

  private processSystemApiNamedImport(elem: ts.ImportSpecifier, lines: string[]): void {
    const symbol: ts.Symbol | undefined = this.checker.getSymbolAtLocation(elem.name);
    if (!symbol) {
      return;
    }

    const sysApiInfo = this.findSystemApiModuleInChain(symbol);
    if (!sysApiInfo) {
      return;
    }

    const importName: string = elem.propertyName
      ? `${sysApiInfo.name} as ${elem.name.text}`
      : elem.name.text;
    this.addUniqueLine(lines, `import { ${importName} } from '${sysApiInfo.moduleName}';`);
  }

  private processLocalNamedImport(
    elem: ts.ImportSpecifier,
    lines: string[],
    visitedFiles: Set<string>
  ): void {
    const symbol: ts.Symbol | undefined = this.checker.getSymbolAtLocation(elem.name);
    if (!symbol) {
      return;
    }

    const resolved = this.resolveToActualDeclaration(symbol);
    if (!resolved) {
      return;
    }

    const declaration: ts.Declaration = resolved.declarations[0];

    const sysApiDecl = this.isSystemApiDeclaration(declaration);
    if (sysApiDecl) {
      const importName: string = elem.name.text !== sysApiDecl.name
        ? `${sysApiDecl.name} as ${elem.name.text}`
        : elem.name.text;
      this.addUniqueLine(lines, `import { ${importName} } from '${sysApiDecl.moduleName}';`);
      return;
    }

    const sourceFile: ts.SourceFile = declaration.getSourceFile();
    let text: string = this.getDeclarationText(declaration, sourceFile);
    if (!text) {
      return;
    }

    text = this.stripExportModifier(text);

    const originalName: string = elem.propertyName?.text ?? elem.name.text;
    if (originalName !== elem.name.text) {
      text = this.renameInText(text, originalName, elem.name.text);
    }

    if (this.addUniqueLine(lines, text)) {
      this.collectTransitiveImports(sourceFile, lines, visitedFiles);
    }
  }

  private processLocalDefaultImport(
    importName: ts.Identifier,
    lines: string[],
    visitedFiles: Set<string>
  ): void {
    const symbol: ts.Symbol | undefined = this.checker.getSymbolAtLocation(importName);
    if (!symbol) {
      return;
    }

    const sysApiInfo = this.findSystemApiModuleInChain(symbol);
    if (sysApiInfo) {
      this.addUniqueLine(lines, `import ${importName.text} from '${sysApiInfo.moduleName}';`);
      return;
    }

    const resolved = this.resolveToActualDeclaration(symbol);
    if (!resolved) {
      return;
    }

    const declaration: ts.Declaration = resolved.declarations[0];

    const sysApiDecl = this.isSystemApiDeclaration(declaration);
    if (sysApiDecl) {
      this.addUniqueLine(lines, `import ${importName.text} from '${sysApiDecl.moduleName}';`);
      return;
    }

    const sourceFile: ts.SourceFile = declaration.getSourceFile();
    let text: string = this.getDeclarationText(declaration, sourceFile);
    if (!text) {
      return;
    }

    text = this.stripExportModifier(text);

    const localName: string = this.getLocalNameOfDeclaration(declaration);
    if (localName !== importName.text) {
      text = this.renameInText(text, localName, importName.text);
    }

    if (this.addUniqueLine(lines, text)) {
      this.collectTransitiveImports(sourceFile, lines, visitedFiles);
    }
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

  private renameInText(text: string, from: string, to: string): string {
    const regex: RegExp = new RegExp(
      '\\b' + from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g'
    );
    return text.replace(regex, to);
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

  private getDeclarationText(node: ts.Node, sourceFile: ts.SourceFile): string {
    const printNode: ts.Node = this.getDeclarationNode(node);
    const printedText: string =
      this.printer.printNode(ts.EmitHint.Unspecified, printNode, sourceFile);
    return this.sanitizeDeclarationText(printedText);
  }

  public static mergeDeclarationFiles(options: DeclarationMergeOptions): void {
    const merger = new DeclarationMerger(options);
    merger.merge();
  }
}
