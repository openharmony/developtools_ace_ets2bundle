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

export enum LogType {
  ERROR = 'ERROR',
  WARN = 'WARN',
  NOTE = 'NOTE'
}

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
  let messsage: string;
  if (info.line && info.column) {
    messsage = `BUILD${info.type} File: ${fileName}:${info.line}:${info.column}\n ${info.message}`;
  } else {
    messsage = `BUILD${info.type} File: ${fileName}\n ${info.message}`;
  }
  return messsage;
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

export function hasDecorator(node: ts.MethodDeclaration | ts.FunctionDeclaration | ts.ClassDeclaration,
  decortorName: string): boolean {
  if (node.decorators && node.decorators.length) {
    for (let i = 0; i < node.decorators.length; i++) {
      if (node.decorators[i].getText() === decortorName) {
        return true;
      }
    }
  }
  return false;
}

const STATEMENT_EXPECT: number = 1128;
const SEMICOLON_EXPECT: number = 1005;
export const IGNORE_ERROR_CODE: number[] = [STATEMENT_EXPECT, SEMICOLON_EXPECT];

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
