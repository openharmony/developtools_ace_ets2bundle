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
import os from 'os';
import { projectConfig } from '../main';
import { createHash } from 'crypto';
import { processSystemApi } from './validate_ui_syntax';
import { logger } from './compile_info';
import {
  NODE_MODULES,
  TEMPORARY,
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
  EXTNAME_JS_MAP,
  ESMODULE,
  FAIL,
  CARD_LOG_TYPE_COMPONENTS,
  CARD_LOG_TYPE_DECORATORS,
  CARD_LOG_TYPE_IMPORT,
  TS2ABC,
  ES2ABC,
  EXTNAME_PROTO_BIN,
  COMPONENT_CREATE_FUNCTION,
  CREATE_BIND_COMPONENT
} from './pre_define';
import { minify, MinifyOutput } from 'terser';
import { resourceFileName } from './process_ui_syntax';

export enum LogType {
  ERROR = 'ERROR',
  WARN = 'WARN',
  NOTE = 'NOTE'
}
export const TEMPORARYS: string = 'temporarys';
export const BUILD: string = 'build';
export const SRC_MAIN: string = 'src/main';
const TS_NOCHECK: string = '// @ts-nocheck';

const red: string = '\u001b[31m';
const reset: string = '\u001b[39m';

const WINDOWS: string = 'Windows_NT';
const LINUX: string = 'Linux';
const MAC: string = 'Darwin';

export interface LogInfo {
  type: LogType,
  message: string,
  pos?: number,
  line?: number,
  column?: number,
  fileName?: string
}

export const repeatLog: Map<string, LogInfo> = new Map();

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
          loader.emitError(getMessage(item.fileName || loader.resourcePath, item));
          break;
        case LogType.WARN:
          loader.emitWarning(getMessage(item.fileName || loader.resourcePath, item));
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
  ts.StructDeclaration | ts.ClassDeclaration, decortorName: string, customBuilder?: ts.Decorator[]): boolean {
  if (node.decorators && node.decorators.length) {
    for (let i = 0; i < node.decorators.length; i++) {
      if (node.decorators[i].getText().replace(/\(.*\)$/, '').trim() === decortorName) {
        if (customBuilder) {
          customBuilder.push(...node.decorators.slice(i + 1), ...node.decorators.slice(0, i));
        }
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
    console.error(red, 'ArkTS ERROR: ' + e, reset);
  }
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

export function toHashData(path: string): any {
  const content: string = fs.readFileSync(path).toString();
  const hash: any = createHash('sha256');
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

export function genTemporaryPath(filePath: string, projectPath: string, buildPath: string): string {
  filePath = toUnixPath(filePath);
  if (filePath.endsWith(EXTNAME_MJS)) {
    filePath = filePath.replace(/\.mjs$/, EXTNAME_JS);
  }
  if (filePath.endsWith(EXTNAME_CJS)) {
    filePath = filePath.replace(/\.cjs$/, EXTNAME_JS);
  }
  projectPath = toUnixPath(projectPath);

  if (checkNodeModulesFile(filePath, projectPath)) {
    const fakeNodeModulesPath: string = toUnixPath(path.join(projectConfig.projectRootPath, NODE_MODULES));
    let output: string = '';
    if (filePath.indexOf(fakeNodeModulesPath) === -1) {
      const hapPath: string = toUnixPath(projectConfig.projectRootPath);
      const tempFilePath: string = filePath.replace(hapPath, '');
      const sufStr: string = tempFilePath.substring(tempFilePath.indexOf(NODE_MODULES) + NODE_MODULES.length + 1);
      output = path.join(buildPath, TEMPORARY, NODE_MODULES, MAIN, sufStr);
    } else {
      output = filePath.replace(fakeNodeModulesPath, path.join(buildPath, TEMPORARY, NODE_MODULES, AUXILIARY));
    }
    return output;
  }

  if (filePath.indexOf(projectPath) !== -1) {
    const sufStr: string = filePath.replace(projectPath, '');
    const output: string = path.join(buildPath, TEMPORARY, sufStr);
    return output;
  }

  return '';
}

export function genBuildPath(filePath: string, projectPath: string, buildPath: string): string {
  filePath = toUnixPath(filePath);
  if (filePath.endsWith(EXTNAME_MJS)) {
    filePath = filePath.replace(/\.mjs$/, EXTNAME_JS);
  }
  if (filePath.endsWith(EXTNAME_CJS)) {
    filePath = filePath.replace(/\.cjs$/, EXTNAME_JS);
  }
  projectPath = toUnixPath(projectPath);

  if (checkNodeModulesFile(filePath, projectPath)) {
    filePath = toUnixPath(filePath);
    const fakeNodeModulesPath: string = toUnixPath(path.join(projectConfig.projectRootPath, NODE_MODULES));
    let output: string = '';
    if (filePath.indexOf(fakeNodeModulesPath) === -1) {
      const hapPath: string = toUnixPath(projectConfig.projectRootPath);
      const tempFilePath: string = filePath.replace(hapPath, '');
      const sufStr: string = tempFilePath.substring(tempFilePath.indexOf(NODE_MODULES) + NODE_MODULES.length + 1);
      output = path.join(projectConfig.nodeModulesPath, ZERO, sufStr);
    } else {
      output = filePath.replace(fakeNodeModulesPath, path.join(projectConfig.nodeModulesPath, ONE));
    }
    return output;
  }

  if (filePath.indexOf(projectPath) !== -1) {
    const sufStr: string = filePath.replace(projectPath, '');
    const output: string = path.join(buildPath, sufStr);
    return output;
  }

  return '';
}

export function checkNodeModulesFile(filePath: string, projectPath: string): boolean {
  filePath = toUnixPath(filePath);
  projectPath = toUnixPath(projectPath);
  const hapPath: string = toUnixPath(projectConfig.projectRootPath);
  const tempFilePath: string = filePath.replace(hapPath, '');
  if (tempFilePath.indexOf(NODE_MODULES) !== -1) {
    const fakeNodeModulesPath: string = toUnixPath(path.resolve(projectConfig.projectRootPath, NODE_MODULES));
    if (filePath.indexOf(fakeNodeModulesPath) !== -1) {
      return true;
    }
    if (projectConfig.modulePathMap) {
      for (const key in projectConfig.modulePathMap) {
        const value: string = projectConfig.modulePathMap[key];
        const fakeModuleNodeModulesPath: string = toUnixPath(path.resolve(value, NODE_MODULES));
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
  } else if (mkdirsSync(path.dirname(dirname))) {
    fs.mkdirSync(dirname);
    return true;
  }

  return false;
}

async function writeMinimizedSourceCode(content: string, filePath: string): Promise<void> {
  let result: MinifyOutput;
  try {
    result = await minify(content, {
      compress: {
        join_vars: false,
        sequences: 0
      },
      format: {
        semicolons: false,
        beautify: true,
        indent_level: 2
      }
    });
  } catch {
    logger.error(red, `ArkTS:ERROR Failed to source code obfuscation.`, reset);
    process.exit(FAIL);
  }
  fs.writeFileSync(filePath, result.code);
}

export function writeFileSyncByString(sourcePath: string, sourceCode: string): void {
  const jsFilePath: string = genTemporaryPath(sourcePath, projectConfig.projectPath, process.env.cachePath);
  if (jsFilePath.length === 0) {
    return;
  }

  sourceCode = transformModuleSpecifier(sourcePath, sourceCode);

  mkdirsSync(path.dirname(jsFilePath));
  if (projectConfig.buildArkMode === 'debug') {
    fs.writeFileSync(jsFilePath, sourceCode);
    return;
  }

  writeMinimizedSourceCode(sourceCode, jsFilePath);
}

export const packageCollection: Map<string, Array<string>> = new Map();

export function getPackageInfo(configFile: string): Array<string> {
  if (packageCollection.has(configFile)) {
    return packageCollection.get(configFile);
  }
  const data: any = JSON.parse(fs.readFileSync(configFile).toString());
  const bundleName: string = data.app.bundleName;
  const moduleName: string = data.module.name;
  packageCollection.set(configFile, [bundleName, moduleName]);
  return [bundleName, moduleName];
}

function replaceRelativeDependency(item:string, moduleRequest: string, sourcePath: string): string {
  if (sourcePath && projectConfig.compileMode === ESMODULE) {
    // remove file extension from moduleRequest
    const SUFFIX_REG: RegExp = /\.(?:[cm]?js|[e]?ts|json)$/;
    moduleRequest = moduleRequest.replace(SUFFIX_REG, '');

    // normalize the moduleRequest
    item = item.replace(/(['"])(?:\S+)['"]/, (_, quotation) => {
      let normalizedModuleRequest: string = toUnixPath(path.normalize(moduleRequest));
      if (moduleRequest.startsWith("./")) {
        normalizedModuleRequest = "./" + normalizedModuleRequest;
      }
      return quotation + normalizedModuleRequest + quotation;
    });

    const filePath: string = path.resolve(path.dirname(sourcePath), moduleRequest);
    const result: RegExpMatchArray | null =
      filePath.match(/(\S+)(\/|\\)src(\/|\\)(?:main|ohosTest)(\/|\\)(ets|js)(\/|\\)(\S+)/);
    if (result && projectConfig.aceModuleJsonPath) {
      const npmModuleIdx: number = result[1].search(/(\/|\\)node_modules(\/|\\)/);
      const projectRootPath: string = projectConfig.projectRootPath;
      if (npmModuleIdx === -1 || npmModuleIdx === projectRootPath.search(/(\/|\\)node_modules(\/|\\)/)) {
        const packageInfo: string[] = getPackageInfo(projectConfig.aceModuleJsonPath);
        const bundleName: string = packageInfo[0];
        const moduleName: string = packageInfo[1];
        moduleRequest = `@bundle:${bundleName}/${moduleName}/${result[5]}/${toUnixPath(result[7])}`;
        item = item.replace(/(['"])(?:\S+)['"]/, (_, quotation) => {
          return quotation + moduleRequest + quotation;
        });
      }
    }
  }
  return item;
}

function replaceHarDependency(item:string, moduleRequest: string): string {
  if (projectConfig.harNameOhmMap) {
    // case1: "@ohos/lib" ---> "@module:lib/ets/index"
    if (projectConfig.harNameOhmMap.hasOwnProperty(moduleRequest)) {
      return item.replace(/(['"])(?:\S+)['"]/, (_, quotation) => {
        return quotation + projectConfig.harNameOhmMap[moduleRequest] + quotation;
      });
    }
    // case2: "@ohos/lib/src/main/ets/pages/page1" ---> "@module:lib/ets/pages/page1"
    for (const harName in projectConfig.harNameOhmMap) {
      if (moduleRequest.startsWith(harName + '/')) {
        const harOhmName: string =
          projectConfig.harNameOhmMap[harName].substring(0, projectConfig.harNameOhmMap[harName].indexOf('/'));
        if (moduleRequest.indexOf(harName + '/' + SRC_MAIN) == 0) {
          moduleRequest = moduleRequest.replace(harName + '/' + SRC_MAIN , harOhmName);
        } else {
          moduleRequest = moduleRequest.replace(harName, harOhmName);
        }
        return item.replace(/(['"])(?:\S+)['"]/, (_, quotation) => {
          return quotation + moduleRequest + quotation;
        });
      }
    }
  }
  return item;
}

function transformModuleSpecifier(sourcePath: string, sourceCode: string): string {
  // replace relative moduleSpecifier with ohmURl
  const REG_RELATIVE_DEPENDENCY: RegExp = /(?:import|from)(?:\s*)['"]((?:\.\/|\.\.\/)[^'"]+)['"]/g;
  const REG_HAR_DEPENDENCY: RegExp = /(?:import|from)(?:\s*)['"]([^\.\/][^'"]+)['"]/g;
  return sourceCode.replace(REG_HAR_DEPENDENCY, (item, moduleRequest) => {
    return replaceHarDependency(item, moduleRequest);
  }).replace(REG_RELATIVE_DEPENDENCY, (item, moduleRequest) => {
    return replaceRelativeDependency(item, moduleRequest, toUnixPath(sourcePath));
  });
}

export var newSourceMaps: Object = {};

export function generateSourceFilesToTemporary(sourcePath: string, sourceContent: string, sourceMap: any): void {
  let jsFilePath: string = genTemporaryPath(sourcePath, projectConfig.projectPath, process.env.cachePath);
  if (jsFilePath.length === 0) {
    return;
  }
  if (jsFilePath.endsWith(EXTNAME_ETS)) {
    jsFilePath = jsFilePath.replace(/\.ets$/, EXTNAME_JS);
  } else {
    jsFilePath = jsFilePath.replace(/\.ts$/, EXTNAME_JS);
  }
  let sourceMapFile: string = genSourceMapFileName(jsFilePath);
  if (sourceMapFile.length > 0 && projectConfig.buildArkMode === 'debug') {
    let source = toUnixPath(sourcePath).replace(toUnixPath(projectConfig.projectRootPath) + '/', '');
    // adjust sourceMap info
    sourceMap.sources = [source];
    sourceMap.file = path.basename(sourceMap.file);
    delete sourceMap.sourcesContent;
    newSourceMaps[source] = sourceMap;
  }
  sourceContent = transformModuleSpecifier(sourcePath, sourceContent);

  mkdirsSync(path.dirname(jsFilePath));
  if (projectConfig.buildArkMode === 'debug') {
    fs.writeFileSync(jsFilePath, sourceContent);
    return;
  }

  writeMinimizedSourceCode(sourceContent, jsFilePath);
}

export function writeFileSyncByNode(node: ts.SourceFile, toTsFile: boolean): void {
  if (toTsFile) {
    const newStatements: ts.Node[] = [];
    const tsIgnoreNode: ts.Node = ts.factory.createExpressionStatement(ts.factory.createIdentifier(TS_NOCHECK));
    newStatements.push(tsIgnoreNode);
    if (node.statements && node.statements.length) {
      newStatements.push(...node.statements);
    }

    node = ts.factory.updateSourceFile(node, newStatements);
  }
  const mixedInfo: {content: string, sourceMapJson: any} = genContentAndSourceMapInfo(node, toTsFile);
  let temporaryFile: string = genTemporaryPath(node.fileName, projectConfig.projectPath, process.env.cachePath);
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
  if (temporarySourceMapFile.length > 0 && projectConfig.buildArkMode === 'debug') {
    let source = toUnixPath(node.fileName).replace(toUnixPath(projectConfig.projectRootPath) + '/', '');
    newSourceMaps[source] = mixedInfo.sourceMapJson;
  }
  fs.writeFileSync(temporaryFile, mixedInfo.content);
}

function genContentAndSourceMapInfo(node: ts.SourceFile, toTsFile: boolean): any {
  const printer: ts.Printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const options: ts.CompilerOptions = {
    sourceMap: true
  };
  const mapOpions: any = {
    sourceMap: true,
    inlineSourceMap: false,
    inlineSources: false,
    sourceRoot: '',
    mapRoot: '',
    extendedDiagnostics: false
  };
  const host: ts.CompilerHost = ts.createCompilerHost(options);
  const fileName: string = node.fileName;
  // @ts-ignore
  const sourceMapGenerator: any = ts.createSourceMapGenerator(
    host,
    // @ts-ignore
    ts.getBaseFileName(fileName),
    '',
    '',
    mapOpions
  );
  // @ts-ignore
  const writer: any = ts.createTextWriter(
    // @ts-ignore
    ts.getNewLineCharacter({newLine: ts.NewLineKind.LineFeed, removeComments: false}));
  printer['writeFile'](node, writer, sourceMapGenerator);
  const sourceMapJson: any = sourceMapGenerator.toJSON();
  sourceMapJson['sources'] = [fileName.replace(toUnixPath(projectConfig.projectRootPath) + '/', '')];
  let content: string = writer.getText();
  if (toTsFile) {
    content = content.replace(`${TS_NOCHECK};`, TS_NOCHECK);
  }
  content = transformModuleSpecifier(fileName, processSystemApi(content, true));

  return {
    content: content,
    sourceMapJson: sourceMapJson
  };
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

export function compareNodeVersion(nodeVersion: number = 16): boolean {
  const currentNodeVersion: number = parseInt(process.versions.node.split('.')[0]);
  if (currentNodeVersion >= nodeVersion) {
    return true;
  }

  return false;
}

export function removeDir(dirName: string): void {
  if (fs.existsSync(dirName)) {
    if (compareNodeVersion()) {
      fs.rmSync(dirName, { recursive: true});
    } else {
      fs.rmdirSync(dirName, { recursive: true});
    }
  }
}

export function validatorCard(log: any[], type: number, pos: number,
  name: string = ''): void {
  if (projectConfig && projectConfig.cardObj && resourceFileName
    && projectConfig.cardObj[resourceFileName]) {
    const logInfo: object = {
      type: LogType.ERROR,
      message: '',
      pos: pos
    }
    switch(type) {
      case CARD_LOG_TYPE_COMPONENTS:
        logInfo.message = `Card page cannot use the component ${name}.`;
        break;
      case CARD_LOG_TYPE_DECORATORS:
        logInfo.message = `Card page cannot use ${name}`;
        break;
      case CARD_LOG_TYPE_IMPORT:
        logInfo.message = `Card page cannot use import.`;
        break;
    }
    log.push(logInfo);
  }
}

export function parseErrorMessage(message: string): string {
  const messageArrary: string[] = message.split('\n');
  let logContent: string = '';
  messageArrary.forEach(element => {
    if (!(/^at/.test(element.trim()))) {
      logContent = logContent + element + '\n';
    }
  });
  return logContent;
}

export function isEs2Abc(): boolean {
  return process.env.panda === ES2ABC  || process.env.panda === 'undefined' || process.env.panda === undefined;
}

export function isTs2Abc(): boolean {
  return process.env.panda === TS2ABC;
}

export function genProtoFileName(temporaryFile: string): string {
  let protoFile: string = temporaryFile;
  if (temporaryFile.endsWith(EXTNAME_TS)) {
    protoFile = temporaryFile.replace(/\.ts$/, EXTNAME_PROTO_BIN);
  } else {
    protoFile = temporaryFile.replace(/\.js$/, EXTNAME_PROTO_BIN);
  }
  return protoFile;
}

export function genMergeProtoFileName(temporaryFile: string): string {
  let protoTempPathArr: string[] = temporaryFile.split(TEMPORARY);
  const sufStr: string = protoTempPathArr[protoTempPathArr.length - 1];
  let protoBuildPath: string = path.join(process.env.cachePath, "protos", sufStr);

  return protoBuildPath;
}

export function removeDuplicateInfo(moduleInfos: Array<any>): Array<any> {
  const tempModuleInfos: any[] = Array<any>();
  moduleInfos.forEach((item) => {
    let check: boolean = tempModuleInfos.every((newItem) => {
      return item.tempFilePath !== newItem.tempFilePath;
    });
    if (check) {
      tempModuleInfos.push(item);
    }
  });
  moduleInfos = tempModuleInfos;

  return moduleInfos;
}

export function isWindows(): boolean {
  return os.type() === WINDOWS;
}

export function isLinux(): boolean {
  return os.type() === LINUX;
}

export function isMac(): boolean {
  return os.type() === MAC;
}

export function maxFilePathLength(): number {
  if (isWindows()) {
    return 259;
  } else if (isLinux()) {
    return 4095;
  } else if (isMac()) {
    return 1016;
  } else {
    return -1;
  }
}

export function validateFilePathLength(filePath: string): boolean {
  if (maxFilePathLength() < 0) {
    logger.error(red, "Unknown OS platform", reset);
    process.exitCode = FAIL;
    return false;
  } else if (filePath.length > 0 && filePath.length <= maxFilePathLength()) {
    return true;
  } else if (filePath.length > maxFilePathLength()) {
    logger.error(red, "The length of path exceeds the maximum length: " + maxFilePathLength(), reset);
    process.exitCode = FAIL;
    return false;
  } else {
    logger.error(red, "Validate file path failed", reset);
    process.exitCode = FAIL;
    return false;
  }
}

export function buildCachePath(tailName: string): string {
  let pathName: string = process.env.cachePath !== undefined ?
      path.join(process.env.cachePath, tailName) : path.join(projectConfig.buildPath, tailName);
  validateFilePathLength(pathName);

  return pathName;
}

export function unlinkSync(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function getExtension(filePath: string): string {
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return "";
  }

  let extension: string = EXTNAME_ETS;
  if (fs.existsSync(filePath + '.ts') && fs.statSync(filePath + '.ts').isFile()) {
    extension = '.ts';
  } else if (fs.existsSync(filePath + '.d.ts') && fs.statSync(filePath + '.d.ts').isFile()) {
    extension = '.d.ts';
  } else if (fs.existsSync(filePath + '.d.ets') && fs.statSync(filePath + '.d.ets').isFile()) {
    extension = '.d.ets';
  } else if (fs.existsSync(filePath + '.js') && fs.statSync(filePath + '.js').isFile()) {
    extension = '.js';
  }

  return extension;
}