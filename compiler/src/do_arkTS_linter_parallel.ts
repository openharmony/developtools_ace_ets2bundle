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

import * as ts from 'typescript';
import path from 'path';
import {
  projectConfig,
  partialUpdateConfig
} from '../main';
import {
  compilerOptions,
  resolveModuleNames,
  resolveTypeReferenceDirectives,
  setCompilerOptions,
  readDeaclareFiles,
  buildInfoWriteFile
} from './ets_checker';
import type { ArkTSDiagnostic } from './do_arkTS_linter';
import {
  ArkTSVersion,
  processDiagnosticsToArkTSDiagnosticInfo
} from './do_arkTS_linter';
import { parentPort, workerData } from 'worker_threads';

const STRICT_TS_BUILD_INFO_SUFFIX = 'inversedArkTsLinter.tsbuildinfo';

function init(): void {
  Object.assign(partialUpdateConfig, workerData.partialUpdateConfig);
  Object.assign(projectConfig, workerData.projectConfig);
  Object.assign(process.env, workerData.processEnv);
}

function createStrictProgram(): ts.BuilderProgram | undefined {
  setCompilerOptions(workerData.resolveModulePaths);
  Object.assign(compilerOptions, {
    'noImplicitReturns': true,
    'strictFunctionTypes': true,
    'strictNullChecks': true,
    'strictPropertyInitialization': true,
    'allowJs': true,
    'checkJs': true
  });
  const compilerHost: ts.CompilerHost = ts.createIncrementalCompilerHost(compilerOptions);
  compilerHost.resolveModuleNames = resolveModuleNames;
  compilerHost.getCurrentDirectory = (): string => process.cwd();
  compilerHost.getDefaultLibFileName = (options): string => ts.getDefaultLibFilePath(options);
  compilerHost.resolveTypeReferenceDirectives = resolveTypeReferenceDirectives;
  const createProgramOptions = {
    rootNames: [...workerData.rootFileNames, ...readDeaclareFiles()],
    host: compilerHost,
    options: compilerOptions,
  };
  createProgramOptions.options.tsBuildInfoFile = compilerOptions.tsBuildInfoFile &&
    path.resolve(projectConfig.cachePath, '..', STRICT_TS_BUILD_INFO_SUFFIX);
  const program = ts.createIncrementalProgram(createProgramOptions);
  return program;
}

function doArkTSLinterParallel(): void {
  init();
  const strictBuilderProgram = createStrictProgram()!;
  let strictDiagnostics: ts.ESMap<string, {strictDiagnostics:ts.Diagnostic[], arkTSDiagnostics:ts.Diagnostic[]}>;
  if (workerData.arkTSVersion === ArkTSVersion.ArkTS_1_0) {
    strictDiagnostics = ts.ArkTSLinter_1_0.getDiagnosticsFromStrictProgram(strictBuilderProgram, buildInfoWriteFile);
  } else {
    strictDiagnostics = ts.ArkTSLinter_1_1.getDiagnosticsFromStrictProgram(strictBuilderProgram, buildInfoWriteFile);
  }

  let diagnostics = new Map<string, {strictDiagnostics:ArkTSDiagnostic[], arkTSDiagnostics:ArkTSDiagnostic[]}>();
  strictDiagnostics.forEach(
    (value, key) => {
      diagnostics.set(key, {
        strictDiagnostics : processDiagnosticsToArkTSDiagnosticInfo(value.strictDiagnostics),
        arkTSDiagnostics: processDiagnosticsToArkTSDiagnosticInfo(value.arkTSDiagnostics),
      });
    }
  );
  parentPort.postMessage(diagnostics);
}

doArkTSLinterParallel();