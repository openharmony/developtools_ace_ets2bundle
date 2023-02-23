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

import ts from 'typescript';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { createHash } from 'crypto';
import { logger } from './compile_info';
import {
  FAIL
} from './pre_define';

export enum LogType {
  ERROR = 'ERROR',
  WARN = 'WARN',
  NOTE = 'NOTE'
}

const WINDOWS: string = 'Windows_NT';
const LINUX: string = 'Linux';
const MAC: string = 'Darwin';

const red: string = '\u001b[31m';
const reset: string = '\u001b[39m';

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
          loader.emitError(getMessage(item.fileName || loader.resourcePath, item));
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
    console.error(red, 'ArkTS ERROR: ' + e, reset);
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

export function validateFilePathLength(filePath: string): boolean {
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