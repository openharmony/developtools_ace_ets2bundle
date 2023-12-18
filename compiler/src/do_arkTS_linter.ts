/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
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

import fs from 'fs';
import path from 'path';
import * as ts from 'typescript';
import {
  projectConfig,
  partialUpdateConfig
} from '../main';
import { toUnixPath } from './utils';
import {
  resolveModuleNames,
  resolveTypeReferenceDirectives,
  cache
} from './ets_checker'
import {Worker} from 'worker_threads';
import { logger } from './compile_info';
const fse = require('fs-extra');

const arkTSDir: string = 'ArkTS';
const arkTSLinterOutputFileName: string = 'ArkTSLinter_output.json';
const spaceNumBeforeJsonLine = 2;
const sleepInterval = 100;
const filteredDiagnosticCode = -2;
let worker: Worker | undefined = undefined;
let tsDiagnostics: ArkTSDiagnostic[] = [];

interface OutputInfo {
  categoryInfo: string | undefined;
  fileName: string | undefined;
  line: number | undefined;
  character: number | undefined;
  messageText: string | ts.DiagnosticMessageChain;
}

export enum ArkTSLinterMode {
  NOT_USE = 0,
  COMPATIBLE_MODE = 1,
  STANDARD_MODE = 2
}

export enum ArkTSVersion {
  ArkTS_1_0,
  ArkTS_1_1,
}

export type ProcessDiagnosticsFunc = (diagnostics: ts.Diagnostic, isArkTSDiagnostic: boolean) => void;

export function getArkTSDiagnostics(arkTSVersion: ArkTSVersion, builderProgram: ts.BuilderProgram,
  buildInfoWriteFile?: ts.WriteFileCallback): ts.Diagnostic[] {
  const compilerHost: ts.CompilerHost = ts.createIncrementalCompilerHost(builderProgram.getProgram().getCompilerOptions());
  compilerHost.resolveModuleNames = resolveModuleNames;
  compilerHost.getCurrentDirectory = (): string => process.cwd();
  compilerHost.getDefaultLibFileName = (options): string => ts.getDefaultLibFilePath(options);
  compilerHost.resolveTypeReferenceDirectives = resolveTypeReferenceDirectives;
  if (arkTSVersion === ArkTSVersion.ArkTS_1_0) {
    return ts.ArkTSLinter_1_0.runArkTSLinter(builderProgram, compilerHost, /*srcFile*/ undefined, buildInfoWriteFile);
  } else {
    return ts.ArkTSLinter_1_1.runArkTSLinter(builderProgram, compilerHost, /*srcFile*/ undefined, buildInfoWriteFile);
  }
}

export function doArkTSLinter(arkTSVersion: ArkTSVersion, builderProgram: ts.BuilderProgram,
  arkTSMode: ArkTSLinterMode, printDiagnostic: ProcessDiagnosticsFunc,
  shouldWriteFile: boolean = true, buildInfoWriteFile?: ts.WriteFileCallback): ts.Diagnostic[] {
  if (arkTSMode === ArkTSLinterMode.NOT_USE) {
    return [];
  }

  let diagnostics: ts.Diagnostic[] = getArkTSDiagnostics(arkTSVersion, builderProgram, buildInfoWriteFile);

  if (printDiagnostic === undefined) {
    return diagnostics;
  }

  removeOutputFile();
  if (diagnostics.length === 0) {
    return [];
  }

  if (arkTSMode === ArkTSLinterMode.COMPATIBLE_MODE) {
    processArkTSLinterReportAsWarning(diagnostics, printDiagnostic, shouldWriteFile);
  } else {
    processArkTSLinterReportAsError(diagnostics, printDiagnostic);
  }

  return diagnostics;
}

function processArkTSLinterReportAsError(diagnostics: ts.Diagnostic[], printDiagnostic: ProcessDiagnosticsFunc): void {
  diagnostics.forEach((diagnostic: ts.Diagnostic) => {
    printDiagnostic(diagnostic, true);
  });
  printArkTSLinterFAQ(diagnostics, printDiagnostic);
}

function processArkTSLinterReportAsWarning(diagnostics: ts.Diagnostic[], printDiagnostic: ProcessDiagnosticsFunc,
  shouldWriteFile: boolean): void {
  const filePath = shouldWriteFile ? writeOutputFile(diagnostics) : undefined;
  if (filePath === undefined) {
    diagnostics.forEach((diagnostic: ts.Diagnostic) => {
      const originalCategory = diagnostic.category;
      diagnostic.category = ts.DiagnosticCategory.Warning;
      printDiagnostic(diagnostic, true);
      diagnostic.category = originalCategory;
    });
    printArkTSLinterFAQ(diagnostics, printDiagnostic);
    return;
  }
  const logMessage = `Has ${diagnostics.length} ArkTS Linter Error. You can get the output in ${filePath}`;
  const arkTSDiagnostic: ts.Diagnostic = {
    file: undefined,
    start: undefined,
    length: undefined,
    messageText: logMessage,
    category: ts.DiagnosticCategory.Warning,
    code: -1,
    reportsUnnecessary: undefined,
    reportsDeprecated: undefined
  };

  printDiagnostic(arkTSDiagnostic, false);
  printArkTSLinterFAQ(diagnostics, printDiagnostic);
}

function writeOutputFile(diagnostics: ts.Diagnostic[]): string | undefined {
  let filePath: string = toUnixPath(projectConfig.cachePath);
  if (!fs.existsSync(filePath)) {
    return undefined;
  }
  filePath = toUnixPath(path.join(filePath, arkTSDir));
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
  filePath = toUnixPath((path.join(filePath, arkTSLinterOutputFileName)));
  const outputInfo: OutputInfo[] = [];
  diagnostics.forEach((diagnostic: ts.Diagnostic) => {
    if (diagnostic.file) {
      const { line, character }: ts.LineAndCharacter =
        diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
      outputInfo.push({
        categoryInfo: diagnostic.category === ts.DiagnosticCategory.Error ? 'Error' : 'Warning',
        fileName: diagnostic.file?.fileName,
        line: line + 1,
        character: character + 1,
        messageText: diagnostic.messageText
      });
    } else {
      const arkTSdiagnostic = diagnostic as ArkTSDiagnostic;
      outputInfo.push({
        categoryInfo: arkTSdiagnostic.category === ts.DiagnosticCategory.Error ? 'Error' : 'Warning',
        fileName: arkTSdiagnostic.fileName,
        line: arkTSdiagnostic.line + 1,
        character: arkTSdiagnostic.character + 1,
        messageText: arkTSdiagnostic.messageText
      });

    }
  });
  let output: string | undefined = filePath;
  try {
    fs.writeFileSync(filePath, JSON.stringify(outputInfo, undefined, spaceNumBeforeJsonLine));
  } catch {
    output = undefined;
  }
  return output;
}

function removeOutputFile(): void {
  let filePath: string = toUnixPath(projectConfig.cachePath);
  if (!fs.existsSync(filePath)) {
    return;
  }
  filePath = toUnixPath(path.join(filePath, arkTSDir));
  if (!fs.existsSync(filePath)) {
    return;
  }
  filePath = toUnixPath((path.join(filePath, arkTSLinterOutputFileName)));
  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath);
  }
}

function printArkTSLinterFAQ(diagnostics: ts.Diagnostic[], printDiagnostic: ProcessDiagnosticsFunc): void {
  if (diagnostics === undefined || diagnostics.length === undefined || diagnostics.length <= 0) {
    return;
  }

  const logMessageFAQ = 'For details about ArkTS syntax errors, see FAQs';
  const arkTSFAQDiagnostic: ts.Diagnostic = {
    file: undefined,
    start: undefined,
    length: undefined,
    messageText: logMessageFAQ,
    category: ts.DiagnosticCategory.Warning,
    code: -1,
    reportsUnnecessary: undefined,
    reportsDeprecated: undefined
  };
  printDiagnostic(arkTSFAQDiagnostic, false);
}

export interface ArkTSDiagnostic extends ts.Diagnostic {
  fileName: string | undefined;
  line: number;
  character: number;
}

let arkTSLinterFinished: boolean = true;
let arkTSLinterDiagnosticProcessed: boolean = true;
let didArkTSLinter: boolean = false;
let arkTSDiagnostics: ArkTSDiagnostic[] = [];
let cacheFilePath: string | null = null;

export function resetDidArkTSLinter(): void {
  didArkTSLinter = false;
}

export function doArkTSLinterParallel(arkTSVersion: ArkTSVersion, arkTSMode: ArkTSLinterMode, printDiagnostic: ProcessDiagnosticsFunc,
  rootFileNames: string[], resolveModulePaths: string[], cacheFile: string, shouldWriteFile: boolean = true): void {
  if (arkTSMode === ArkTSLinterMode.NOT_USE) {
    arkTSLinterFinished = true;
    arkTSLinterDiagnosticProcessed = true;
    return;
  }
  arkTSLinterFinished = false;
  arkTSLinterDiagnosticProcessed = false;

  didArkTSLinter = true;

  const workerData = {
    workerData: {
      arkTSVersion: arkTSVersion,
      projectConfig: JSON.parse(JSON.stringify(projectConfig)),
      partialUpdateConfig: partialUpdateConfig,
      processEnv: JSON.parse(JSON.stringify(process.env)),
      rootFileNames: rootFileNames,
      resolveModulePaths: resolveModulePaths
    }
  };
  worker = new Worker(path.resolve(__dirname, './do_arkTS_linter_parallel.js'), workerData);
  worker.on('message', (strictDiagnostics: Map<string, {strictDiagnostics:ArkTSDiagnostic[], arkTSDiagnostics:ArkTSDiagnostic[]}>) => {
    let diagnostics: ArkTSDiagnostic[] = filterStaticDiagnostics(strictDiagnostics);
    removeOutputFile();
    if (diagnostics.length === 0) {
      arkTSLinterDiagnosticProcessed = true;
      return;
    }
    if (arkTSMode === ArkTSLinterMode.COMPATIBLE_MODE) {
      processArkTSLinterReportAsWarning(diagnostics, printDiagnostic, shouldWriteFile);
    } else {
      processArkTSLinterReportAsError(diagnostics, printDiagnostic);
    }
    arkTSDiagnostics = diagnostics;
    cacheFilePath = cacheFile;
    arkTSLinterDiagnosticProcessed = true;
  });
}

export function updateFileCache(): void {
  if (!didArkTSLinter) {
    return;
  }
  if (cacheFilePath === null) {
    return;
  }
  if (process.env.watchMode !== 'true' && !projectConfig.xtsMode) {
    arkTSDiagnostics.forEach((diagnostic: ArkTSDiagnostic) => {
      const fileName = diagnostic.file ? diagnostic.file.fileName : diagnostic.fileName;
      if (cache[path.resolve(fileName)]) {
        cache[path.resolve(fileName)].error = true;
      }
    });
    fse.ensureDirSync(projectConfig.cachePath);
    fs.writeFileSync(cacheFilePath, JSON.stringify({
      'runtimeOS': projectConfig.runtimeOS,
      'sdkInfo': projectConfig.sdkInfo,
      'fileList': cache
    }, null, spaceNumBeforeJsonLine));
  }
  arkTSDiagnostics = undefined;
}

export async function waitArkTSLinterFinished(): Promise<void> {
  if (worker === undefined) {
    return;
  }
  let sleep = async (time): Promise<unknown> => {
    return new Promise(r => setTimeout(r, time));
  };
  while (!(arkTSLinterDiagnosticProcessed)) {
    await sleep(sleepInterval);
  }
  worker.terminate();
  worker = undefined;
}

export function sendtsDiagnostic(allDiagnostics: ts.Diagnostic[]):void {
  tsDiagnostics = processDiagnosticsToArkTSDiagnosticInfo(allDiagnostics.filter(diag=>diag.file.scriptKind === ts.ScriptKind.ETS));
}

export function processDiagnosticsToArkTSDiagnosticInfo(diagnostics: ts.Diagnostic[]): ArkTSDiagnostic[] {
  let diagnosticsInfo: ArkTSDiagnostic[] = [];
  for (const diagnostic of diagnostics) {
    const { line, character }: ts.LineAndCharacter =
      diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
    diagnosticsInfo.push(
      {
        fileName: diagnostic.file?.fileName,
        line: line,
        character: character,
        category: diagnostic.category,
        code: diagnostic.code,
        file: undefined,
        start: diagnostic.start,
        length: diagnostic.length,
        messageText: diagnostic.messageText,
      }
    );
  };
  return diagnosticsInfo;
}

function filterStaticDiagnostics(
  strictDiagnostics: Map<string, {strictDiagnostics: ArkTSDiagnostic[], arkTSDiagnostics: ArkTSDiagnostic[]}>): ArkTSDiagnostic[] {
  tsDiagnostics.forEach(diag => {
    if (!diag.fileName) {
      return;
    }
    strictDiagnostics.get(diag.fileName)?.strictDiagnostics.forEach(
      strictDiag => {
        if (strictDiag.code === diag.code && strictDiag.start === diag.start && strictDiag.length === diag.length) {
          strictDiag.code = filteredDiagnosticCode;
          return;
        }
      }
    );
  });

  let resultDiagnostics: ArkTSDiagnostic[] = [];
  strictDiagnostics.forEach(
    (value) => {
      value.strictDiagnostics.forEach(
        diagnostic => {
          if (diagnostic.code === filteredDiagnosticCode) {
            return;
          }
          resultDiagnostics.push(diagnostic);
        }
      );
      value.arkTSDiagnostics.forEach(diagnostic => { resultDiagnostics.push(diagnostic); });
    }
  );

  tsDiagnostics = [];
  return resultDiagnostics;
}
