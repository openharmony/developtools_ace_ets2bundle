/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

export interface ArkTSEvolutionModule {
  language: string;
  packageName: string;
  moduleName: string;
  modulePath: string;
  declgenV1OutPath?: string;
  declgenV2OutPath?: string;
  declgenBridgeCodePath?: string;
  declFilesPath?: string;
  dynamicFiles: string[];
  staticFiles: string[];
  cachePath: string;
  byteCodeHarInfo?: Object;
  packageVersion: string;
  isNative?: boolean;
  moduleType: string;
}

export interface Params {
  dependentModuleMap: Map<string, ArkTSEvolutionModule>;
  projectConfig: ProjectConfig;
  tasks: TaskInfo[];
}

export interface ProjectConfig {
  cachePath: string;
  bundleName: string;
  mainModuleName: string;
  projectRootPath: string;
  sdkAliasMap?: Map<string, string>;
};

export enum BuildType {
  DECLGEN = 'declgen',
  BYTE_CODE_HAR = 'byteCodeHar',
  INTEROP_CONTEXT = 'interopContext'
}

export interface TaskInfo {
  packageName: string;
  buildTask: BuildType;
  mainModuleName?: string;
}

export interface AliasConfig {
  originalAPIName: string;
  isStatic: boolean;
}

export interface FileInfo {
  recordName: string;
  baseUrl: string;
  absolutePath: string;
  abstractPath: string;
}

export interface RunnerParms {
  inputDirs: string[];
  inputFiles: string[];
  outDir: string;
  rootDir: string;
  customResolveModuleNames?: (moduleName: string[], containingFile: string) => (ts.ResolvedModuleFull | undefined)[];
  customCompilerOptions?: ts.CompilerOptions;
  includePaths?: string[];
}

export interface DeclFilesConfig {
  packageName: string;
  files: {
    [filePath: string]: DeclFileConfig;
  }
}

interface DeclFileConfig {
  declPath: string;
  filePath: string;
  ohmUrl: string;
  isNative?: boolean
}

export interface DeclgenParams {
  dependentModuleMap: Map<string, ArkTSEvolutionModule>;
  projectConfig: ProjectConfig;
  inputFiles?: string[];
  inputModules?: string[];
}

export interface AliasConfig {
  originalAPIName: string;
  isStatic: boolean;
}

export interface FileInfo {
  recordName: string;
  baseUrl: string;
  abstractPath: string;
}

export interface InteropInfo {
  moduleName: string;
  moduleRootPath: string;
  declgenBridgeCodePath: string;
  declgenV1OutPath: string;
}

export interface InteropConfig {
  interopModuleInfo: Map<string, InteropInfo>;
  projectConfig: Object;
}
