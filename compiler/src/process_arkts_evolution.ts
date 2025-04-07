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

import fs from 'fs';
import path from 'path';
import ts from 'typescript';

import {
  EXTNAME_ETS,
  EXTNAME_D_ETS,
  ARKTS_1_1,
  ARKTS_1_2
} from './pre_define';
import {
  toUnixPath,
  mkdirsSync
} from './utils';
import {
  red,
  reset
} from './fast_build/ark_compiler/common/ark_define';
import { getPkgInfo } from './ark_utils';

interface DeclFileConfig {
  declPath: string;
  ohmUrl: string;
}

interface DeclFilesConfig {
  packageName: string;
  files: {
    [filePath: string]: DeclFileConfig;
  }
}

export interface ArkTSEvolutionModule {
  language: string; // "1.1" | "1.2"
  packageName: string;
  moduleName: string;
  modulePath: string;
  declgenV1OutPath?: string;
  declgenV2OutPath?: string;
  declgenBridgeCodePath?: string;
  declFilesPath?: string;
}

interface ResolvedFileInfo {
  moduleRequest: string;
  resolvedFileName: string;
}

export let pkgDeclFilesConfig: { [pkgName: string]: DeclFilesConfig } = {};

export let arkTSModuleMap: Map<string, ArkTSEvolutionModule> = new Map();

export let arkTSEvolutionModuleMap: Map<string, ArkTSEvolutionModule> = new Map();

export let arkTSHybridModuleMap: Map<string, ArkTSEvolutionModule> = new Map();

export function addDeclFilesConfig(filePath: string, moduleName: string, projectConfig: Object,
  logger: Object, pkgPath: string, pkgName: string): void {
  const { projectFilePath, pkgInfo } = getPkgInfo(filePath, projectConfig, logger, pkgPath, pkgName);
  const declgenV2OutPath: string = getDeclgenV2OutPath(moduleName);
  if (!declgenV2OutPath) {
    return;
  }
  if (!pkgDeclFilesConfig[pkgName]) {
    pkgDeclFilesConfig[pkgName] = { packageName: pkgName, files: {} };
  }
  if (pkgDeclFilesConfig[pkgName].files[projectFilePath]) {
    return;
  }
  const isSO: string = pkgInfo.isSO ? 'Y' : 'N';
  // The module name of the entry module of the project during the current compilation process.
  const mainModuleName: string = projectConfig.mainModuleName;
  const bundleName: string = projectConfig.bundleName;
  const normalizedFilePath: string = `${pkgName}/${projectFilePath}`;
  const declPath: string = path.join(toUnixPath(declgenV2OutPath), projectFilePath) + EXTNAME_D_ETS;
  const ohmUrl: string = `${isSO}&${mainModuleName}&${bundleName}&${normalizedFilePath}&${pkgInfo.version}`;
  pkgDeclFilesConfig[pkgName].files[projectFilePath] = { declPath, ohmUrl: `@normalized:${ohmUrl}` };
}

export function getArkTSEvoDeclFilePath(resolvedFileInfo: ResolvedFileInfo): string {
  const { moduleRequest, resolvedFileName } = resolvedFileInfo;
  let arktsEvoDeclFilePath: string = moduleRequest;
  for (const [moduleName, arkTSEvolutionModuleInfo] of arkTSEvolutionModuleMap) {
    const declgenV1OutPath: string = toUnixPath(arkTSEvolutionModuleInfo.declgenV1OutPath);
    const modulePath: string = toUnixPath(arkTSEvolutionModuleInfo.modulePath);
    const declgenBridgeCodePath: string = toUnixPath(arkTSEvolutionModuleInfo.declgenBridgeCodePath);
    if (resolvedFileName && resolvedFileName.startsWith(modulePath + '/') &&
      !resolvedFileName.startsWith(declgenBridgeCodePath + '/')) {
      arktsEvoDeclFilePath = resolvedFileName
        .replace(modulePath, toUnixPath(path.join(declgenV1OutPath, moduleName)))
        .replace(EXTNAME_ETS, EXTNAME_D_ETS);
      break;
    }
    if (moduleRequest === moduleName) {
      arktsEvoDeclFilePath = path.join(declgenV1OutPath, moduleName, 'Index.d.ets');
      break;
    }
    if (moduleRequest.startsWith(moduleName + '/')) {
      arktsEvoDeclFilePath = moduleRequest.replace(
        moduleName,
        toUnixPath(path.join(declgenV1OutPath, moduleName, 'src/main/ets'))
      ) + EXTNAME_D_ETS;
      break;
    }
  }
  return arktsEvoDeclFilePath;
}

export function collectArkTSEvolutionModuleInfo(share: Object): void {
  if (!share.projectConfig.useNormalizedOHMUrl) {
    share.throwArkTsCompilerError(red, 'ArkTS:ERROR: Failed to compile mixed project.\n' +
          'Error Message: Failed to compile mixed project because useNormalizedOHMUrl is false.\n' +
          'Solutions: > Check whether useNormalizedOHMUrl is true.', reset);
  }
  // dependentModuleMap Contents eg.
  // 1.2 hap -> 1.1 har: It contains the information of 1.1 har
  // 1.1 hap -> 1.2 har -> 1.1 har : There is information about 3 modules.
  for (const [moduleName, dependentModuleInfo] of share.projectConfig.dependentModuleMap) {
    if (dependentModuleInfo.language === ARKTS_1_2) {
      if (dependentModuleInfo.declgenV1OutPath && dependentModuleInfo.declgenBridgeCodePath) {
        arkTSEvolutionModuleMap.set(moduleName, dependentModuleInfo);
      } else {
        share.throwArkTsCompilerError(red, 'ArkTS:INTERNAL ERROR: Failed to collect arkTs evolution module info.\n' +
          `Error Message: Failed to collect arkTs evolution module "${moduleName}" info from rollup.`, reset);
      }
    } else if (dependentModuleInfo.language === ARKTS_1_1) {
      if (dependentModuleInfo.declgenV2OutPath && dependentModuleInfo.declFilesPath) {
        arkTSModuleMap.set(moduleName, dependentModuleInfo);
      } else {
        share.throwArkTsCompilerError(red, 'ArkTS:INTERNAL ERROR: Failed to collect arkTs evolution module info.\n' +
          `Error Message: Failed to collect arkTs evolution module "${moduleName}" info from rollup.`, reset);
      }
    } else {
      arkTSHybridModuleMap.set(moduleName, dependentModuleInfo);
    }
  }
}

export function cleanUpProcessArkTSEvolutionObj(): void {
  arkTSModuleMap = new Map();
  arkTSEvolutionModuleMap = new Map();
  arkTSHybridModuleMap = new Map();
  pkgDeclFilesConfig = {};
}

export async function writeBridgeCodeFileSyncByNode(node: ts.SourceFile, moduleId: string): Promise<void> {
  const printer: ts.Printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const writer: ts.EmitTextWriter = ts.createTextWriter(
    // @ts-ignore
    ts.getNewLineCharacter({ newLine: ts.NewLineKind.LineFeed, removeComments: false }));
    printer.writeFile(node, writer, undefined);
  mkdirsSync(path.dirname(moduleId));
  fs.writeFileSync(moduleId, writer.getText());
}

export function getDeclgenBridgeCodePath(moduleName: string): string {
  if (arkTSEvolutionModuleMap.size && arkTSEvolutionModuleMap.get(moduleName)) {
    const arkTSEvolutionModuleInfo: ArkTSEvolutionModule = arkTSEvolutionModuleMap.get(moduleName);
    return arkTSEvolutionModuleInfo.declgenBridgeCodePath;
  }
  return '';
}

function getDeclgenV2OutPath(moduleName: string): string {
  if (arkTSModuleMap.size && arkTSModuleMap.get(moduleName)) {
    const arkTsModuleInfo: ArkTSEvolutionModule = arkTSModuleMap.get(moduleName);
    return arkTsModuleInfo.declgenV2OutPath;
  }
  return '';
}

