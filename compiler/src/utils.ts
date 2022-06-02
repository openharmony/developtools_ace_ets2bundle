/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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
import ts from 'typescript';
import fs from 'fs';
import { projectConfig } from '../main';
import { createHash } from 'crypto';
import { processSystemApi } from './validate_ui_syntax';
import {
  NODE_MODULES,
  TEMPRARY,
  MAIN,
  AUXILIARY,
  ZERO,
  ONE,
  EXTNAME_JS,
  EXTNAME_TS,
  EXTNAME_MJS,
  EXTNAME_CJS,
  EXTNAME_ABC,
  EXTNAME_ETS,
  EXTNAME_TS_MAP,
  EXTNAME_JS_MAP
} from './pre_define';

export enum LogType {
  ERROR = 'ERROR',
  WARN = 'WARN',
  NOTE = 'NOTE'
}
export const TEMPORARYS: string = 'temporarys';
export const BUILD: string = 'build';
export const SRC_MAIN: string = 'src/main';
const TS_NOCHECK: string = '// @ts-nocheck';

export interface LogInfo {
  type: LogType,
  message: string,
  pos?: number,
  line?: number,
  column?: number,
  fileName?: string
}

export class FileLog {
  private _sourceFile: ts.SourceFile;
  private _errors: LogInfo[] = [];

  public get sourceFile() {
    return this._sourceFile;
  }

  public set sourceFile(newValue: ts.SourceFile) {
    this._sourceFile = newValue;
  }

  public get errors() {
    return this._errors;
  }

  public set errors(newValue: LogInfo[]) {
    this._errors = newValue;
  }
}

export function emitLogInfo(loader: any, infos: LogInfo[]) {
  if (infos && infos.length) {
    infos.forEach((item) => {
      switch (item.type) {
        case LogType.ERROR:
          loader.emitError(getMessage(loader.resourcePath, item));
          break;
        case LogType.WARN:
          loader.emitWarning(getMessage(loader.resourcePath, item));
          break;
        case LogType.NOTE:
          loader.emitWarning(getMessage(loader.resourcePath, item));
          break;
      }
    });
  }
}

export function addLog(type: LogType, message: string, pos: number, log: LogInfo[],
  sourceFile: ts.SourceFile) {
  const posOfNode: ts.LineAndCharacter = sourceFile.getLineAndCharacterOfPosition(pos);
  log.push({
    type: type,
    message: message,
    line: posOfNode.line + 1,
    column: posOfNode.character + 1,
    fileName: sourceFile.fileName
  });
}

export function getMessage(fileName: string, info: LogInfo): string {
  let message: string;
  if (info.line && info.column) {
    message = `BUILD${info.type} File: ${fileName}:${info.line}:${info.column}\n ${info.message}`;
  } else {
    message = `BUILD${info.type} File: ${fileName}\n ${info.message}`;
  }
  return message;
}

class ComponentInfo {
  private _id: number = 0;
  private _componentNames: Set<string> = new Set(['ForEach']);
  public set id(id: number) {
    this._id = id;
  }
  public get id() {
    return this._id;
  }
  public set componentNames(componentNames: Set<string>) {
    this._componentNames = componentNames;
  }
  public get componentNames() {
    return this._componentNames;
  }
}

export const componentInfo: ComponentInfo = new ComponentInfo();

export function hasDecorator(node: ts.MethodDeclaration | ts.FunctionDeclaration |
  ts.StructDeclaration | ts.ClassDeclaration, decortorName: string): boolean {
  if (node.decorators && node.decorators.length) {
    for (let i = 0; i < node.decorators.length; i++) {
      if (node.decorators[i].getText().replace(/\(.*\)$/, '').trim() === decortorName) {
        return true;
      }
    }
  }
  return false;
}

const STATEMENT_EXPECT: number = 1128;
const SEMICOLON_EXPECT: number = 1005;
const STATESTYLES_EXPECT: number = 1003;
export const IGNORE_ERROR_CODE: number[] = [STATEMENT_EXPECT, SEMICOLON_EXPECT, STATESTYLES_EXPECT];

export function readFile(dir: string, utFiles: string[]) {
  try {
    const files: string[] = fs.readdirSync(dir);
    files.forEach((element) => {
      const filePath: string = path.join(dir, element);
      const status: fs.Stats = fs.statSync(filePath);
      if (status.isDirectory()) {
        readFile(filePath, utFiles);
      } else {
        utFiles.push(filePath);
      }
    });
  } catch (e) {
    console.error('ETS ERROR: ' + e);
  }
}

export function createFunction(node: ts.Identifier, attrNode: ts.Identifier,
  argumentsArr: ts.NodeArray<ts.Expression>): ts.CallExpression {
  return ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      node,
      attrNode
    ),
    undefined,
    argumentsArr && argumentsArr.length ? argumentsArr : []
  );
}

export function circularFile(inputPath: string, outputPath: string): void {
  if (!inputPath || !outputPath) {
    return;
  }
  fs.readdir(inputPath, function(err, files) {
    if (!files) {
      return;
    }
    files.forEach(file => {
      const inputFile: string = path.resolve(inputPath, file);
      const outputFile: string = path.resolve(outputPath, file);
      const fileStat: fs.Stats = fs.statSync(inputFile);
      if (fileStat.isFile()) {
        copyFile(inputFile, outputFile);
      } else {
        circularFile(inputFile, outputFile);
      }
    });
  });
}

function copyFile(inputFile: string, outputFile: string): void {
  try {
    const parent: string = path.join(outputFile, '..');
    if (!(fs.existsSync(parent) && fs.statSync(parent).isDirectory())) {
      mkDir(parent);
    }
    if (fs.existsSync(outputFile)) {
      return;
    }
    const readStream: fs.ReadStream = fs.createReadStream(inputFile);
    const writeStream: fs.WriteStream = fs.createWriteStream(outputFile);
    readStream.pipe(writeStream);
    readStream.on('close', function() {
      writeStream.end();
    });
  } catch (err) {
    throw err.message;
  }
}

export function mkDir(path_: string): void {
  const parent: string = path.join(path_, '..');
  if (!(fs.existsSync(parent) && !fs.statSync(parent).isFile())) {
    mkDir(parent);
  }
  fs.mkdirSync(path_);
}

export function toUnixPath(data: string): string {
  if (/^win/.test(require('os').platform())) {
    const fileTmps: string[] = data.split(path.sep);
    const newData: string = path.posix.join(...fileTmps);
    return newData;
  }
  return data;
}

export function toHashData(path: string) {
  const content = fs.readFileSync(path);
  const hash = createHash('sha256');
  hash.update(content);
  return hash.digest('hex');
}

export function writeFileSync(filePath: string, content: string): void {
  if (!fs.existsSync(filePath)) {
    const parent: string = path.join(filePath, '..');
    if (!(fs.existsSync(parent) && !fs.statSync(parent).isFile())) {
      mkDir(parent);
    }
  }
  fs.writeFileSync(filePath, content);
}

export function genTemporaryPath(filePath: string, projectPath: string, buildPath: string, toTsFile: boolean = true): string {
  filePath = toUnixPath(filePath);
  if (filePath.endsWith(EXTNAME_MJS)) {
    filePath = filePath.replace(/\.mjs$/, EXTNAME_JS);
  }
  if (filePath.endsWith(EXTNAME_CJS)) {
    filePath = filePath.replace(/\.cjs$/, EXTNAME_JS);
  }
  projectPath = toUnixPath(projectPath);
  const hapPath = toUnixPath(projectConfig.projectRootPath);
  const tempFilePath = filePath.replace(hapPath, '');

  if (checkNodeModulesFile(filePath, projectPath)) {
    const fakeNodeModulesPath = toUnixPath(path.resolve(projectConfig.projectRootPath, NODE_MODULES));
    const dataTmps = tempFilePath.split(NODE_MODULES);
    let output:string = '';
    if (filePath.indexOf(fakeNodeModulesPath) === -1) {
      const sufStr = dataTmps[dataTmps.length - 1];
      output = path.join(buildPath, TEMPRARY, NODE_MODULES, MAIN, sufStr);
    } else {
      const sufStr = dataTmps[dataTmps.length - 1];
      output = path.join(buildPath, TEMPRARY, NODE_MODULES, AUXILIARY, sufStr);
    }
    return output;
  }

  if (filePath.indexOf(projectPath) !== -1) {
    const sufStr = filePath.replace(projectPath, '');
    const output: string = path.join(buildPath, TEMPRARY, sufStr);
    return output;
  }

  return '';
}

export function genBuildPath(filePath: string, projectPath: string, buildPath: string, toTsFile: boolean = true): string {
  filePath = toUnixPath(filePath);
  if (filePath.endsWith(EXTNAME_MJS)) {
    filePath = filePath.replace(/\.mjs$/, EXTNAME_JS);
  }
  if (filePath.endsWith(EXTNAME_CJS)) {
    filePath = filePath.replace(/\.cjs$/, EXTNAME_JS);
  }
  projectPath = toUnixPath(projectPath);
  const hapPath = toUnixPath(projectConfig.projectRootPath);
  const tempFilePath = filePath.replace(hapPath, '');

  if (checkNodeModulesFile(filePath, projectPath)) {
    filePath = toUnixPath(filePath);
    const fakeNodeModulesPath = toUnixPath(path.resolve(projectConfig.projectRootPath, NODE_MODULES));
    const dataTmps = tempFilePath.split(NODE_MODULES);
    let output:string = '';
    if (filePath.indexOf(fakeNodeModulesPath) === -1) {
      const sufStr = dataTmps[dataTmps.length - 1];
      output = path.join(projectConfig.nodeModulesPath, ZERO, sufStr);
    } else {
      const sufStr = dataTmps[dataTmps.length - 1];
      output = path.join(projectConfig.nodeModulesPath, ONE, sufStr);
    }
    return output;
  }

  if (filePath.indexOf(projectPath) !== -1) {
    const sufStr = filePath.replace(projectPath, '');
    const output: string = path.join(buildPath, sufStr);
    return output;
  }

  return '';
}

export function checkNodeModulesFile(filePath: string, projectPath: string) {
  filePath = toUnixPath(filePath);
  projectPath = toUnixPath(projectPath);
  const hapPath = toUnixPath(projectConfig.projectRootPath);
  const tempFilePath = filePath.replace(hapPath, '');
  if (tempFilePath.indexOf(NODE_MODULES) !== -1) {
    const fakeNodeModulesPath = toUnixPath(path.resolve(projectConfig.projectRootPath, NODE_MODULES));
    if (filePath.indexOf(fakeNodeModulesPath) !== -1) {
      return true;
    }
    if (projectConfig.modulePathMap) {
      for (const key in projectConfig.modulePathMap) {
        const value = projectConfig.modulePathMap[key];
        const fakeModuleNodeModulesPath = toUnixPath(path.resolve(value, NODE_MODULES));
        if (filePath.indexOf(fakeModuleNodeModulesPath) !== -1) {
          return true;
        }
      }
    }
  }

  return false;
}

export function mkdirsSync(dirname: string): boolean {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
  return false;
}

export function writeFileSyncByString(sourcePath: string, sourceCode: string, toTsFile: boolean) {
  const temporaryFile: string = genTemporaryPath(sourcePath, projectConfig.projectPath, process.env.cachePath, toTsFile);
  if (temporaryFile.length === 0) {
    return;
  }
  mkdirsSync(path.dirname(temporaryFile));
  fs.writeFileSync(temporaryFile, sourceCode);
}

export function writeFileSyncByNode(node: ts.SourceFile, toTsFile: boolean) {
  if (toTsFile) {
    const newStatements = [];
    const tsIgnoreNode: ts.Node = ts.factory.createExpressionStatement(ts.factory.createIdentifier(TS_NOCHECK));
    newStatements.push(tsIgnoreNode);
    if (node.statements && node.statements.length) {
      newStatements.push(...node.statements);
    }

    node = ts.factory.updateSourceFile(node, newStatements);
  }
  const printer: ts.Printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const options : ts.CompilerOptions = {
    sourceMap: true
  };
  const mapOpions = {
    sourceMap: true,
    inlineSourceMap: false,
    inlineSources: false,
    sourceRoot: '',
    mapRoot: '',
    extendedDiagnostics: false
  };
  const host = ts.createCompilerHost(options);
  const fileName = node.fileName;
  // @ts-ignore
  const sourceMapGenerator = ts.createSourceMapGenerator(
    host,
    // @ts-ignore
    ts.getBaseFileName(fileName),
    '',
    '',
    mapOpions
  );
  // @ts-ignore
  const writer = ts.createTextWriter(
    // @ts-ignore
    ts.getNewLineCharacter({newLine: ts.NewLineKind.LineFeed, removeComments: false}));
  printer['writeFile'](node, writer, sourceMapGenerator);
  const sourceMapJson = sourceMapGenerator.toJSON();
  sourceMapJson['sources'] = [fileName];
  const result: string = writer.getText();
  let content: string = result;
  content = processSystemApi(content, true);
  if (toTsFile) {
    content = result.replace(`${TS_NOCHECK};`, TS_NOCHECK);
  }
  const sourceMapContent = JSON.stringify(sourceMapJson);
  let temporaryFile: string = genTemporaryPath(node.fileName, projectConfig.projectPath, process.env.cachePath, toTsFile);
  if (temporaryFile.length === 0) {
    return;
  }
  let temporarySourceMapFile: string = '';
  if (temporaryFile.endsWith(EXTNAME_ETS)) {
    if (toTsFile) {
      temporaryFile = temporaryFile.replace(/\.ets$/, EXTNAME_TS);
    } else {
      temporaryFile = temporaryFile.replace(/\.ets$/, EXTNAME_JS);
    }
    temporarySourceMapFile = genSourceMapFileName(temporaryFile);
  } else {
    if (!toTsFile) {
      temporaryFile = temporaryFile.replace(/\.ts$/, EXTNAME_JS);
      temporarySourceMapFile = genSourceMapFileName(temporaryFile);
    }
  }
  mkdirsSync(path.dirname(temporaryFile));
  fs.writeFileSync(temporaryFile, content);
  if (temporarySourceMapFile.length > 0 && projectConfig.buildArkMode === 'debug') {
    fs.writeFileSync(temporarySourceMapFile, sourceMapContent);
  }
}

export function genAbcFileName(temporaryFile: string): string {
  let abcFile: string = temporaryFile;
  if (temporaryFile.endsWith(EXTNAME_TS)) {
    abcFile = temporaryFile.replace(/\.ts$/, EXTNAME_ABC);
  } else {
    abcFile = temporaryFile.replace(/\.js$/, EXTNAME_ABC);
  }
  return abcFile;
}

export function genSourceMapFileName(temporaryFile: string): string {
  let abcFile: string = temporaryFile;
  if (temporaryFile.endsWith(EXTNAME_TS)) {
    abcFile = temporaryFile.replace(/\.ts$/, EXTNAME_TS_MAP);
  } else {
    abcFile = temporaryFile.replace(/\.js$/, EXTNAME_JS_MAP);
  }
  return abcFile;
}
