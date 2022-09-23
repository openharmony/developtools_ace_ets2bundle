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
import fs from 'fs';
import path from 'path';
import { SourceMapGenerator } from 'source-map';

import {
  ReplaceResult,
  sourceReplace,
  validateUISyntax,
  processSystemApi,
  componentCollection
} from './validate_ui_syntax';
import {
  LogType,
  LogInfo,
  emitLogInfo,
  mkDir
} from './utils';
import {
  BUILD_ON,
  SUPERVISUAL,
  SUPERVISUAL_SOURCEMAP_EXT
} from './pre_define';
import { projectConfig } from '../main.js';
import { genETS } from '../codegen/codegen_ets.js';

const visualMap: Map<number, number> = new Map();
const slotMap: Map<number, number> = new Map();

function preProcess(source: string): string {
  process.env.compiler = BUILD_ON;
  if (/\.ets$/.test(this.resourcePath)) {
    const result: ReplaceResult = sourceReplace(source, this.resourcePath);
    let newContent: string = result.content;
    const log: LogInfo[] = result.log.concat(validateUISyntax(source, newContent,
      this.resourcePath, this.resourceQuery));
    newContent = parseVisual(this.resourcePath, this.resourceQuery, newContent, log, source);
    if (log.length) {
      emitLogInfo(this, log);
    }
    return newContent;
  } else {
    return processSystemApi(source, false, this.resourcePath);
  }
}

function parseVisual(resourcePath: string, resourceQuery: string, content: string,
  log: LogInfo[], source: string): string {
  if (!(componentCollection.entryComponent || componentCollection.customComponents) || !projectConfig.aceSuperVisualPath) {
    return content;
  }
  const visualPath: string = findVisualFile(resourcePath);
  if (!visualPath || !fs.existsSync(visualPath)) {
    return content;
  }
  const visualContent: any = getVisualContent(visualPath, log);
  if (!visualContent) {
    return content;
  }
  visualMap.clear();
  slotMap.clear();
  const compilerOptions = ts.readConfigFile(
    path.resolve(__dirname, '../tsconfig.json'), ts.sys.readFile).config.compilerOptions;
  Object.assign(compilerOptions, {
    'sourceMap': false
  });
  const sourceFile: ts.SourceFile = ts.createSourceFile(resourcePath, content,
    ts.ScriptTarget.Latest, true, ts.ScriptKind.ETS, compilerOptions);
  let newContent: string = content;
  if (sourceFile.statements) {
    sourceFile.statements.forEach(statement => {
      newContent = parseStatement(statement, newContent, log, visualContent);
    });
  }
  const result: ReplaceResult = sourceReplace(newContent, resourcePath);
  newContent = result.content;
  const resultLog: LogInfo[] = result.log.concat(validateUISyntax(source, newContent,
    resourcePath, resourceQuery));
  log.concat(resultLog);
  if (!log.length) {
    generateSourceMapForNewAndOriEtsFile(resourcePath, source);
  }
  return newContent;
}

function parseStatement(statement: ts.Statement, content: string, log: LogInfo[],
  visualContent: any): string {
  if (statement.kind === ts.SyntaxKind.StructDeclaration && statement.name) {
    if (statement.members) {
      statement.members.forEach(member => {
        if (member.kind && member.kind === ts.SyntaxKind.MethodDeclaration) {
          content = parseMember(statement, member, content, log, visualContent);
        }
      });
    }
  }
  return content;
}

function parseMember(statement: ts.Statement, member: ts.MethodDeclaration, content: string,
  log: LogInfo[], visualContent: any): string {
  let newContent: string = content;
  if (member.name && member.name.getText() === 'build') {
    const buildBody: string = member.getText();
    if (buildBody.replace(/\ +/g, '').replace(/[\r\n]/g, '') === 'build(){}') {
      newContent = insertVisualCode(statement, member, visualContent, newContent);
    } else {
      log.push({
        type: LogType.ERROR,
        message: `when the corresponding visual file exists,` +
          ` the build function of the entry component must be empty.`,
        pos: member.pos
      });
    }
  }
  return newContent;
}

function insertVisualCode(statement: ts.Statement, member: ts.MethodDeclaration,
  visualContent: any, content: string): string {
  let newContent: string = content;
  newContent = insertImport(visualContent, newContent);
  newContent = insertVarAndFunc(member, visualContent, newContent, content);
  newContent = insertBuild(member, visualContent, newContent, content);
  newContent = insertAboutToAppear(statement, member, visualContent, newContent, content);
  return newContent;
}

function insertImport(visualContent: any, content: string): string {
  if (!visualContent.etsImport) {
    return content;
  }
  const mediaQueryImport: string = visualContent.etsImport + '\n';
  const newContent: string = mediaQueryImport + content;
  slotMap.set(0, mediaQueryImport.length);
  visualMap.set(0, mediaQueryImport.split('\n').length - 1);
  return newContent;
}

function insertVarAndFunc(build: ts.MethodDeclaration, visualContent: any,
  content: string, oriContent: string): string {
  const visualVarAndFunc: string = (visualContent.etsVariable ? visualContent.etsVariable : '') +
    (visualContent.etsFunction ? visualContent.etsFunction : '');
  return visualVarAndFunc ? insertVisualCodeBeforePos(build, '\n' + visualVarAndFunc, content,
    oriContent) : content;
}

function insertBuild(build: ts.MethodDeclaration, visualContent: any, content: string,
  oriContent: string): string {
  return visualContent.build ? insertVisualCodeAfterPos(build.body,
    '\n' + visualContent.build + '\n', content, oriContent) : content;
}

function insertAboutToAppear(statement: ts.Statement, build: ts.MethodDeclaration,
  visualContent: any, content: string, oriContent: string): string {
  if (!visualContent.aboutToAppear) {
    return content;
  }
  for (const member of statement.members) {
    const hasAboutToAppear: boolean = member.kind && member.kind === ts.SyntaxKind.MethodDeclaration
      && member.name && member.name.getText() === 'aboutToAppear';
    if (hasAboutToAppear) {
      return insertVisualCodeAfterPos(member.body, '\n' + visualContent.aboutToAppear, content,
        oriContent);
    }
  }

  const aboutToAppearFunc: string = '\n  aboutToAppear() {\n' + visualContent.aboutToAppear +
    '  }\n';
  return insertVisualCodeBeforePos(build, aboutToAppearFunc, content, oriContent);
}

function insertVisualCodeAfterPos(member: ts.Block, visualContent: string, content: string,
  oriContent: string): string {
  const contentBeforePos: string = oriContent.substring(0, member.getStart() + 1);
  const originEtsFileLineNumber: number = contentBeforePos.split('\n').length;
  const visualLines: number = visualContent.split('\n').length - 1;
  const insertedLineNumbers: number = visualMap.get(originEtsFileLineNumber);
  visualMap.set(originEtsFileLineNumber, insertedLineNumbers ? insertedLineNumbers + visualLines :
    visualLines);

  let newPos: number = member.getStart() + 1;
  for (const [key, value] of slotMap) {
    if (member.getStart() >= key) {
      newPos += value;
    }
  }

  const newContent: string = content.substring(0, newPos) + visualContent +
    content.substring(newPos);
  slotMap.set(member.getStart(), visualContent.length);
  return newContent;
}

function insertVisualCodeBeforePos(member: ts.MethodDeclaration, visualContent: string,
  content: string, oriContent: string): string {
  const contentBeforePos: string = oriContent.substring(0, member.pos);
  const originEtsFileLineNumber: number = contentBeforePos.split('\n').length;
  const visualLines: number = visualContent.split('\n').length - 1;
  const insertedLineNumbers: number = visualMap.get(originEtsFileLineNumber);
  visualMap.set(originEtsFileLineNumber, insertedLineNumbers ? insertedLineNumbers + visualLines :
    visualLines);
  let newPos: number = member.pos;
  for (const [key, value] of slotMap) {
    if (member.pos >= key) {
      newPos += value;
    }
  }
  const newContent: string = content.substring(0, newPos) + visualContent +
    content.substring(newPos);
  slotMap.set(member.pos, visualContent.length);
  return newContent;
}

function generateSourceMapForNewAndOriEtsFile(resourcePath: string, content: string) {
  if (!process.env.cachePath) {
    return;
  }
  const sourcemap: SourceMapGenerator = new SourceMapGenerator({
    file: resourcePath
  });
  const lines: Array<string> = content.split('\n');
  const originEtsFileLines: number = lines.length;
  for (let l: number = 1; l <= originEtsFileLines; l++) {
    let newEtsFileLineNumber: number = l;
    for (const [originEtsFileLineNumber, visualLines] of visualMap) {
      if (l > originEtsFileLineNumber) {
        newEtsFileLineNumber += visualLines;
      }
    }
    sourcemap.addMapping({
      generated: {
        line: newEtsFileLineNumber,
        column: 0
      },
      source: resourcePath,
      original: {
        line: l,
        column: 0
      }
    });
  }
  const visualMapName: string = path.parse(resourcePath).name + SUPERVISUAL_SOURCEMAP_EXT;
  const visualDirPath: string = path.parse(resourcePath).dir;
  const etsDirPath: string = path.parse(projectConfig.projectPath).dir;
  const visualMapDirPath: string = path.resolve(process.env.cachePath, SUPERVISUAL +
    visualDirPath.replace(etsDirPath, ''));
  if (!(fs.existsSync(visualMapDirPath) && fs.statSync(visualMapDirPath).isDirectory())) {
    mkDir(visualMapDirPath);
  }
  fs.writeFile(path.resolve(visualMapDirPath, visualMapName), sourcemap.toString(), (err) => {
    if (err) {
      return console.error('ERROR: Failed to write visual.js.map');
    }
  });
}

function findVisualFile(filePath: string): string {
  const etsDirPath: string = path.parse(projectConfig.projectPath).dir;
  const visualDirPath: string = path.parse(projectConfig.aceSuperVisualPath).dir;
  return filePath
    .replace(projectConfig.projectPath, projectConfig.aceSuperVisualPath)
    .replace(etsDirPath, visualDirPath).replace(/\.ets$/, '.visual');
}

function getVisualContent(visualPath: string, log: LogInfo[]): any {
  const parseContent: any = genETS(fs.readFileSync(visualPath, 'utf-8'));
  if (parseContent && parseContent.errorType && parseContent.errorType !== '') {
    log.push({
      type: LogType.ERROR,
      message: parseContent.message
    });
  }
  return parseContent ? parseContent.ets : null;
}

module.exports = preProcess;
