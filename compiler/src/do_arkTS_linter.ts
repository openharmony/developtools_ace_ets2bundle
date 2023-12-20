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
import { projectConfig } from '../main';
import {
  toUnixPath,
  getRollupCacheStoreKey,
  getRollupCacheKey
} from './utils';
import {
  resolveModuleNames,
  resolveTypeReferenceDirectives,
  fileHashScriptVersion,
} from './ets_checker';
import { ARKTS_LINTER_BUILD_INFO_SUFFIX } from './pre_define';

const arkTSDir: string = 'ArkTS';
const arkTSLinterOutputFileName: string = 'ArkTSLinter_output.json';
const spaceNumBeforeJsonLine = 2;

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

export interface ArkTSProgram {
  builderProgram: ts.BuilderProgram,
  wasStrict: boolean
}

export type ProcessDiagnosticsFunc = (diagnostics: ts.Diagnostic) => void;

export function doArkTSLinter(arkTSVersion: ArkTSVersion, arkTSMode: ArkTSLinterMode,
  builderProgram: ArkTSProgram, reverseStrictProgram: ArkTSProgram,
  printDiagnostic: ProcessDiagnosticsFunc, shouldWriteFile: boolean = true,
  buildInfoWriteFile?: ts.WriteFileCallback): ts.Diagnostic[] {
  if (arkTSMode === ArkTSLinterMode.NOT_USE) {
    return [];
  }

  let diagnostics: ts.Diagnostic[] = [];

  if (arkTSVersion === ArkTSVersion.ArkTS_1_0) {
    diagnostics = ts.ArkTSLinter_1_0.runArkTSLinter(builderProgram, reverseStrictProgram,
                                                    /*srcFile*/ undefined, buildInfoWriteFile);
  } else {
    diagnostics = ts.ArkTSLinter_1_1.runArkTSLinter(builderProgram, reverseStrictProgram,
                                                    /*srcFile*/ undefined, buildInfoWriteFile);
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
    printDiagnostic(diagnostic);
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
      printDiagnostic(diagnostic);
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
  printDiagnostic(arkTSDiagnostic);

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
    const { line, character }: ts.LineAndCharacter =
      diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
    outputInfo.push({
      categoryInfo: diagnostic.category === ts.DiagnosticCategory.Error ? 'Error' : 'Warning',
      fileName: diagnostic.file?.fileName,
      line: line + 1,
      character: character + 1,
      messageText: diagnostic.messageText
    });
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
  printDiagnostic(arkTSFAQDiagnostic);
}

function setCompilerOptions(originProgram: ts.Program, wasStrict: boolean): ts.CompilerOptions {
  const compilerOptions: ts.CompilerOptions = { ...originProgram.getCompilerOptions() };
  const inversedOptions = getStrictOptions(wasStrict);

  Object.assign(compilerOptions, inversedOptions);
  compilerOptions.allowJs = true;
  compilerOptions.checkJs = true;
  compilerOptions.tsBuildInfoFile = path.resolve(projectConfig.cachePath, '..', ARKTS_LINTER_BUILD_INFO_SUFFIX);

  return compilerOptions;
}

export function getReverseStrictBuilderProgram(rollupShareObject: any, originProgram: ts.Program,
  wasStrict: boolean): ts.BuilderProgram {
  let cacheManagerKey: string = getRollupCacheStoreKey(projectConfig);
  let cacheServiceKey: string = getRollupCacheKey(projectConfig) + '#' + 'linter_service';
  let service: ts.LanguageService | undefined =
    rollupShareObject?.cacheStoreManager?.mount(cacheManagerKey).getCache(cacheServiceKey);
  if (!service) {
    // Create language service for linter
    // Revert strict options for linter program
    const compilerOptions: ts.CompilerOptions = setCompilerOptions(originProgram, !wasStrict);
    const servicesHost: ts.LanguageServiceHost = {
      getScriptFileNames: () => [...originProgram.getRootFileNames()],
      getScriptVersion: fileHashScriptVersion,
      getScriptSnapshot: fileName => {
        if (!fs.existsSync(fileName)) {
          return undefined;
        }
        return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
      },
      getCurrentDirectory: () => process.cwd(),
      getCompilationSettings: () => compilerOptions,
      getDefaultLibFileName: options => ts.getDefaultLibFilePath(options),
      fileExists: ts.sys.fileExists,
      readFile: ts.sys.readFile,
      readDirectory: ts.sys.readDirectory,
      resolveModuleNames: resolveModuleNames,
      resolveTypeReferenceDirectives: resolveTypeReferenceDirectives,
      directoryExists: ts.sys.directoryExists,
      getDirectories: ts.sys.getDirectories,
      getFileCheckedModuleInfo:(containFilePath: string)=>{
        return {
          fileNeedCheck: true,
          checkPayload: undefined,
          currentFileName: containFilePath,
        };
      }
    };

    service = ts.createLanguageService(servicesHost, ts.createDocumentRegistry());
  }

  service.updateRootFiles([...originProgram.getRootFileNames()]);
  rollupShareObject?.cacheStoreManager?.mount(cacheManagerKey).setCache(cacheServiceKey, service);

  return service.getBuilderProgram();
}

function getStrictOptions(strict = true): object {
  return {
    strictNullChecks: strict,
    strictFunctionTypes: strict,
    strictPropertyInitialization: strict,
    noImplicitReturns: strict,
  };
}

/**
 * Returns true if options were initially strict
 */
export function wasOptionsStrict(compilerOptions: ts.CompilerOptions): boolean {
  const strictOptions = getStrictOptions();
  let wasStrict = false;
  Object.keys(strictOptions).forEach(x => {
    wasStrict = wasStrict || !!compilerOptions[x];
  });
  // wasStrict evaluates true if any of the strict options was set
  return wasStrict;
}
