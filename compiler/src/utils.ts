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
import uglifyJS from 'uglify-js';

import {
  projectConfig,
  partialUpdateConfig
} from '../main';
import { createHash } from 'crypto';
import {
  AUXILIARY,
  EXTNAME_ETS,
  EXTNAME_CJS,
  EXTNAME_MJS,
  EXTNAME_JS,
  MAIN,
  FAIL,
  TEMPORARY,
  ESMODULE,
  $$
} from './pre_define';

export enum LogType {
  ERROR = 'ERROR',
  WARN = 'WARN',
  NOTE = 'NOTE'
}
export const TEMPORARYS: string = 'temporarys';
export const BUILD: string = 'build';
export const SRC_MAIN: string = 'src/main';

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

export function emitLogInfo(loader: any, infos: LogInfo[], fastBuild: boolean = false,
  resourcePath: string = null): void {
  if (infos && infos.length) {
    infos.forEach((item) => {
      switch (item.type) {
        case LogType.ERROR:
          fastBuild ? loader.error('\u001b[31m' + getMessage(item.fileName || resourcePath, item, true)) :
            loader.emitError(getMessage(item.fileName || loader.resourcePath, item));
          break;
        case LogType.WARN:
          fastBuild ? loader.warn('\u001b[33m' + getMessage(item.fileName || resourcePath, item, true)) :
            loader.emitWarning(getMessage(item.fileName || loader.resourcePath, item));
          break;
        case LogType.NOTE:
          fastBuild ? loader.info('\u001b[34m' + getMessage(item.fileName || resourcePath, item, true)) :
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

export function getMessage(fileName: string, info: LogInfo, fastBuild: boolean = false): string {
  let message: string;
  if (info.line && info.column) {
    message = `BUILD${info.type} File: ${fileName}:${info.line}:${info.column}\n ${info.message}`;
  } else {
    message = `BUILD${info.type} File: ${fileName}\n ${info.message}`;
  }
  if (fastBuild) {
    message = message.replace(/^BUILD/, 'ArkTS:');
  }
  return message;
}

export function getTransformLog(transformLog: FileLog): LogInfo[] {
  const sourceFile: ts.SourceFile = transformLog.sourceFile;
  const logInfos: LogInfo[] = transformLog.errors.map((item) => {
    if (item.pos) {
      if (!item.column || !item.line) {
        const posOfNode: ts.LineAndCharacter = sourceFile.getLineAndCharacterOfPosition(item.pos);
        item.line = posOfNode.line + 1;
        item.column = posOfNode.character + 1;
      }
    } else {
      item.line = item.line || undefined;
      item.column = item.column || undefined;
    }
    if (!item.fileName) {
      item.fileName = sourceFile.fileName;
    }
    return item;
  });
  return logInfos;
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

export function genTemporaryPath(filePath: string, projectPath: string, buildPath: string,
  projectConfig: any, buildInHar: boolean = false): string {
  filePath = toUnixPath(filePath).replace(/\.[cm]js$/, EXTNAME_JS);
  projectPath = toUnixPath(projectPath);

  if (process.env.compileTool === 'rollup') {
    const projectRootPath: string = toUnixPath(buildInHar ? projectPath : projectConfig.projectRootPath);
    const relativeFilePath: string = filePath.replace(projectRootPath, '');
    const output: string = path.join(buildPath, relativeFilePath);
    return output;
  }

  if (isPackageModulesFile(filePath, projectConfig)) {
    const packageDir: string = projectConfig.packageDir;
    const fakePkgModulesPath: string = toUnixPath(path.join(projectConfig.projectRootPath, packageDir));
    let output: string = '';
    if (filePath.indexOf(fakePkgModulesPath) === -1) {
      const hapPath: string = toUnixPath(projectConfig.projectRootPath);
      const tempFilePath: string = filePath.replace(hapPath, '');
      const relativeFilePath: string = tempFilePath.substring(tempFilePath.indexOf(packageDir) + packageDir.length + 1);
      output = path.join(buildPath, buildInHar ? '' : TEMPORARY, packageDir, MAIN, relativeFilePath);
    } else {
      output = filePath.replace(fakePkgModulesPath,
        path.join(buildPath, buildInHar ? '' : TEMPORARY, packageDir, AUXILIARY));
    }
    return output;
  }

  if (filePath.indexOf(projectPath) !== -1) {
    const relativeFilePath: string = filePath.replace(projectPath, '');
    const output: string = path.join(buildPath, buildInHar ? '' : TEMPORARY, relativeFilePath);
    return output;
  }

  return '';
}

export function isPackageModulesFile(filePath: string, projectConfig: any): boolean {
  filePath = toUnixPath(filePath);
  const hapPath: string = toUnixPath(projectConfig.projectRootPath);
  const tempFilePath: string = filePath.replace(hapPath, '');
  const packageDir: string = projectConfig.packageDir;
  if (tempFilePath.indexOf(packageDir) !== -1) {
    const fakePkgModulesPath: string = toUnixPath(path.resolve(projectConfig.projectRootPath, packageDir));
    if (filePath.indexOf(fakePkgModulesPath) !== -1) {
      return true;
    }
    if (projectConfig.modulePathMap) {
      for (const key in projectConfig.modulePathMap) {
        const value: string = projectConfig.modulePathMap[key];
        const fakeModulePkgModulesPath: string = toUnixPath(path.resolve(value, packageDir));
        if (filePath.indexOf(fakeModulePkgModulesPath) !== -1) {
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

export function generateSourceFilesInHar(sourcePath: string, sourceContent: string, suffix: string, projectConfig: any) {
  // compileShared: compile shared har of project
  let jsFilePath: string = genTemporaryPath(sourcePath,
    projectConfig.compileShared ? projectConfig.projectRootPath : projectConfig.moduleRootPath,
    projectConfig.compileShared ? path.resolve(projectConfig.aceModuleBuild, '../etsFortgz') : projectConfig.cachePath,
    projectConfig, projectConfig.compileShared);
  if (!jsFilePath.match(new RegExp(projectConfig.packageDir))) {
    jsFilePath = jsFilePath.replace(/\.ets$/, suffix).replace(/\.ts$/, suffix);
    mkdirsSync(path.dirname(jsFilePath));
    if (projectConfig.obfuscateHarType === 'uglify' && suffix === '.js') {
      sourceContent = uglifyJS.minify(sourceContent).code;
    }
    fs.writeFileSync(jsFilePath, sourceContent);
  }
}

export function nodeLargeOrEqualTargetVersion(targetVersion: number): boolean {
  const currentNodeVersion: number = parseInt(process.versions.node.split('.')[0]);
  if (currentNodeVersion >= targetVersion) {
    return true;
  }

  return false;
}

export function removeDir(dirName: string): void {
  if (fs.existsSync(dirName)) {
    if (nodeLargeOrEqualTargetVersion(16)) {
      fs.rmSync(dirName, { recursive: true});
    } else {
      fs.rmdirSync(dirName, { recursive: true});
    }
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
    return 32766;
  } else if (isLinux()) {
    return 4095;
  } else if (isMac()) {
    return 1016;
  } else {
    return -1;
  }
}

export function validateFilePathLength(filePath: string, logger: any): boolean {
  if (maxFilePathLength() < 0) {
    logger.error(red, "Unknown OS platform", reset);
    process.exitCode = FAIL;
    return false;
  } else if (filePath.length > 0 && filePath.length <= maxFilePathLength()) {
    return true;
  } else if (filePath.length > maxFilePathLength()) {
    logger.error(red, `The length of ${filePath} exceeds the limitation of current platform, which is ` +
      `${maxFilePathLength()}. Please try moving the project folder to avoid deeply nested file path and try again`,
    reset);
    process.exitCode = FAIL;
    return false;
  } else {
    logger.error(red, "Validate file path failed", reset);
    process.exitCode = FAIL;
    return false;
  }
}

export function validateFilePathLengths(filePaths: Array<string>, logger: any): boolean {
  filePaths.forEach((filePath) => {
    if (!validateFilePathLength(filePath, logger)) {
      return false;
    }
  })
  return true;
}

export function unlinkSync(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function getExtensionIfUnfullySpecifiedFilepath(filePath: string): string {
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
  } else if (fs.existsSync(filePath + '.json') && fs.statSync(filePath + '.json').isFile()) {
    extension = '.json';
  }

  return extension;
}

export function shouldWriteChangedList(watchModifiedFiles: string[],
  watchRemovedFiles: string[]): boolean {
  if (projectConfig.compileMode === ESMODULE && process.env.watchMode === 'true' && !projectConfig.isPreview &&
    projectConfig.changedFileList && (watchRemovedFiles.length + watchModifiedFiles.length)) {
    if (process.env.compileTool !== 'rollup') {
      if (!(watchModifiedFiles.length === 1 &&
        watchModifiedFiles[0] === projectConfig.projectPath && !watchRemovedFiles.length)) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }
  return false;
}

interface HotReloadIncrementalTime {
  hotReloadIncrementalStartTime: string;
  hotReloadIncrementalEndTime: string;
}

export const hotReloadIncrementalTime: HotReloadIncrementalTime = {
  hotReloadIncrementalStartTime: '',
  hotReloadIncrementalEndTime: ''
};

interface FilesObj {
  modifiedFiles: string[],
  removedFiles: string[]
}

let allModifiedFiles: Set<string> = new Set();

export function getHotReloadFiles(watchModifiedFiles: string[],
  watchRemovedFiles: string[], hotReloadSupportFiles: Set<string>): FilesObj {
  hotReloadIncrementalTime.hotReloadIncrementalStartTime = new Date().getTime().toString();
  watchRemovedFiles = watchRemovedFiles.map(file => path.relative(projectConfig.projectPath, file));
  allModifiedFiles = new Set([...allModifiedFiles, ...watchModifiedFiles
    .filter(file => fs.statSync(file).isFile() &&
      (hotReloadSupportFiles.has(file) || !['.ets', '.ts', '.js'].includes(path.extname(file))))
    .map(file => path.relative(projectConfig.projectPath, file))]
    .filter(file => !watchRemovedFiles.includes(file)));
  return {
    modifiedFiles: [...allModifiedFiles],
    removedFiles: [...watchRemovedFiles]
  };
}

export function getResolveModules(projectPath: string, faMode: boolean): string[] {
  if (faMode) {
    return [
      path.resolve(projectPath, '../../../../../'),
      path.resolve(projectPath, '../../../../' + projectConfig.packageDir),
      path.resolve(projectPath, '../../../../../' + projectConfig.packageDir),
      path.resolve(projectPath, '../../')
    ];
  } else {
    return [
      path.resolve(projectPath, '../../../../'),
      path.resolve(projectPath, '../../../' + projectConfig.packageDir),
      path.resolve(projectPath, '../../../../' + projectConfig.packageDir),
      path.resolve(projectPath, '../')
    ];
  }
}

export function writeUseOSFiles(useOSFiles: Set<string>): void {
  let info: string = '';
  if (!fs.existsSync(projectConfig.aceSoPath)) {
    const parent: string = path.resolve(projectConfig.aceSoPath, '..');
    if (!(fs.existsSync(parent) && !fs.statSync(parent).isFile())) {
      mkDir(parent);
    }
  } else {
    info = fs.readFileSync(projectConfig.aceSoPath, 'utf-8') + '\n';
  }
  fs.writeFileSync(projectConfig.aceSoPath, info + Array.from(useOSFiles).join('\n'));
}

export function getPossibleBuilderTypeParameter(parameters: ts.ParameterDeclaration[]): string[] {
  const parameterNames: string[] = [];
  if (!partialUpdateConfig.builderCheck) {
    if (is$$Parameter(parameters)) {
      parameters[0].type.members.forEach((member) => {
        if (member.name && ts.isIdentifier(member.name)) {
          parameterNames.push(member.name.escapedText.toString());
        }
      });
    } else {
      parameters.forEach((parameter) => {
        if (parameter.name && ts.isIdentifier(parameter.name)) {
          parameterNames.push(parameter.name.escapedText.toString());
        }
      });
    }
  }
  return parameterNames;
}

function is$$Parameter(parameters: ts.ParameterDeclaration[]): boolean {
  return parameters.length === 1 && parameters[0].name && ts.isIdentifier(parameters[0].name) &&
    parameters[0].name.escapedText.toString() === $$ && parameters[0].type && ts.isTypeLiteralNode(parameters[0].type) &&
    parameters[0].type.members && parameters[0].type.members.length > 0;
}

// Global Information
class ProcessFileInfo {
  buildStart: boolean = true;
  wholeFileInfo: {[id: string]: SpecialArkTSFileInfo} = {}; // Saved ArkTS file's infomation
  transformedFiles: string[] = []; // ArkTS Files which should be transformed in this compilation
  cachedFiles: string[] = []; // ArkTS Files which should not be transformed in this compilation
  shouldHaveEntry: string[] = []; // Which file should have @Entry decorator

  addFileCacheInfo(id: string, fileCacheInfo: fileInfo): void {
    if (id.match(/(?<!\.d)\.(ets)$/)) {
      this.wholeFileInfo[id] = new SpecialArkTSFileInfo(fileCacheInfo);
    }
  }

  collectTransformedFiles(id: string): void {
    if (id.match(/(?<!\.d)\.(ets)$/)) {
      this.transformedFiles.push(id);
    }
  }

  collectCachedFiles(id: string): void {
    if (id.match(/(?<!\.d)\.(ets)$/)) {
      this.cachedFiles.push(id);
    }
  }

  judgeShouldHaveEntryFiles(entryFileWithoutEntryDecorator: string[]): void {
    this.shouldHaveEntry = Object.values(projectConfig.entryObj as string[]).filter((item) => {
      return !entryFileWithoutEntryDecorator.includes(item.toLowerCase()) && item.match(/(?<!\.d)\.(ets)$/);
    });
  }

  saveCacheFileInfo(cache) {
    const cacheInfo: {[id: string]: fileInfo} = cache.get('fileCacheInfo') || {};
    for (const id of this.transformedFiles) {
      cacheInfo[id] = this.wholeFileInfo[id].fileInfo;
    }
    cache.set('fileCacheInfo', cacheInfo);
  }
}

export const storedFileInfo: ProcessFileInfo = new ProcessFileInfo();

export interface fileInfo {
  hasEntry: boolean; // Has @Entry decorator or not
}

// Save single file information
class SpecialArkTSFileInfo {
  fileInfo: fileInfo = {
    hasEntry: false
  };
  constructor(cacheInfo: fileInfo) {
    this.fileInfo = cacheInfo || this.fileInfo;
  }
  get hasEntry() {
    return this.fileInfo.hasEntry;
  }
  set hasEntry(value: boolean) {
    this.fileInfo.hasEntry = value;
  }
}
