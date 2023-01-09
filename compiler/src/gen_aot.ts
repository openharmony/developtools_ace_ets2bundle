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

import * as childProcess from 'child_process';
import * as process from 'process';
import * as fs from 'fs';
import * as path from 'path';
import { projectConfig } from '../main';
import { logger } from './compile_info';
import {
  SUCCESS,
  FAIL,
  MODULES_ABC,
  TEMPORARY,
  ESMODULE,
  AOT_FULL,
  AOT_TYPE,
  AOT_PARTIAL,
  AOT_PROFILE_SUFFIX
} from './pre_define';
import {
  isWindows,
  mkdirsSync,
  toUnixPath,
  getArkBuildDir,
  getBuildBinDir,
  validateFilePathLength,
  validateFilePathLengths
} from './utils';

const red: string = '\u001b[31m';
const reset: string = '\u001b[39m';

function checkAotPartialConfig(buildJsonInfo: any): boolean {
  if (buildJsonInfo.anBuildMode !== AOT_PARTIAL && !buildJsonInfo.apPath) {
    return false;
  }
  if (buildJsonInfo.compileMode !== ESMODULE) {
    logger.error(`ArkTS:ERROR Aot's partial mode must config compileMode with esmodule.`);
    process.exit(FAIL);
  }
  if (buildJsonInfo.anBuildMode !== AOT_PARTIAL) {
    logger.error(`ArkTS:ERROR Aot's partial mode must config aotBuildMode with partial.`);
    process.exit(FAIL);
  }
  if (!buildJsonInfo.apPath) {
    logger.error(`ArkTS:ERROR Aot's partial mode must config a valid apPath.`);
    process.exit(FAIL);
  }
  if (path.extname(buildJsonInfo.apPath) !== AOT_PROFILE_SUFFIX) {
    logger.error(`ArkTS:ERROR apPath for Aot's partial mode must with suffix "${AOT_PROFILE_SUFFIX}".`);
    process.exit(FAIL);
  }
  if (!fs.existsSync(buildJsonInfo.apPath)) {
    logger.error(`ArkTS:ERROR apPath for Aot's partial mode is not found in "${buildJsonInfo.apPath}".`);
    process.exit(FAIL);
  }
  if (!buildJsonInfo.anBuildOutPut) {
    logger.error(`ArkTS:ERROR Aot's partial mode need anBuildOutPut.`);
    process.exit(FAIL);
  }
  logger.debug(`Aot compiler's partial mode.`);
  return true;
}

function checkAotFullConfig(buildJsonInfo: any): boolean {
  if (buildJsonInfo.anBuildMode !== AOT_FULL) {
    return false;
  }
  if (buildJsonInfo.compileMode !== ESMODULE) {
    logger.error(`ArkTS:ERROR Aot's full mode must config compileMode with esmodule.`);
    process.exit(FAIL);
  }
  if (buildJsonInfo.apPath) {
    logger.error(`ArkTS:ERROR Aot's full mode do not need apPath.`);
    process.exit(FAIL);
  }
  if (!buildJsonInfo.anBuildOutPut) {
    logger.error(`ArkTS:ERROR Aot's full mode need anBuildOutPut.`);
    process.exit(FAIL);
  }
  logger.debug(`Aot compiler's full mode.`);
  return true;
}

function checkAotTypeConfig(buildJsonInfo: any): boolean {
  if (buildJsonInfo.anBuildMode !== AOT_TYPE) {
    return false;
  }
  if (buildJsonInfo.compileMode !== ESMODULE) {
    logger.error(`ArkTS:ERROR Aot's type mode must config compileMode with esmodule.`);
    process.exit(FAIL);
  }
  if (buildJsonInfo.apPath) {
    logger.error(`ArkTS:ERROR Aot's type mode do not need apPath.`);
    process.exit(FAIL);
  }
  logger.debug(`Aot compiler's type mode.`);
  return true;
}

export function checkAotConfig(buildJsonInfo: any): boolean {
  return checkAotTypeConfig(buildJsonInfo) || checkAotFullConfig(buildJsonInfo) || checkAotPartialConfig(buildJsonInfo);
}

export function generateAot(arkDir: string, builtinAbcPath: string): void {
  let aotCompiler: string = path.join(getBuildBinDir(arkDir), isWindows() ? "ark_aot_compiler.exe" : "ark_aot_compiler");
  const appAbc: string = path.join(projectConfig.buildPath, MODULES_ABC);
  const appAot: string = path.join(projectConfig.anBuildOutPut, projectConfig.moduleName);

  if (!validateFilePathLengths([aotCompiler, appAbc, builtinAbcPath, appAot])) {
    logger.error(`ArkTS:ERROR generateAot failed. Invalid file path.`);
    process.exit(FAIL);
  }
  if (!fs.existsSync(appAbc)) {
    logger.error(`ArkTS:ERROR generateAot failed. AppAbc not found in "${appAbc}"`);
    process.exit(FAIL);
  }
  const singleCmdPrefix: string = `"${aotCompiler}" --builtins-dts="${builtinAbcPath}" ` +
    `--aot-file="${appAot}" --target-triple=aarch64-unknown-linux-gnu `;
  let singleCmd: string = "";
  if (projectConfig.anBuildMode === AOT_FULL) {
    singleCmd = singleCmdPrefix + ` "${appAbc}"`;
  } else if (projectConfig.anBuildMode === AOT_PARTIAL) {
    const profile: string = projectConfig.apPath;
    if (!validateFilePathLength(profile)) {
      logger.error(`ArkTS:ERROR generateAot failed. Invalid profile file path.`);
      process.exit(FAIL);
    }
    if (!fs.existsSync(profile)) {
      logger.error(`ArkTS:ERROR generateAot failed. Partial mode lost profile in "${profile}"`);
      process.exit(FAIL);
    }
    singleCmd = singleCmdPrefix + ` --enable-pgo-profiler=true --pgo-profiler-path="${profile}" "${appAbc}"`;
  } else {
    logger.error(`ArkTS:ERROR generateAot failed. unknown anBuildMode: ${projectConfig.anBuildMode}`);
    process.exit(FAIL);
  }
  try {
    logger.debug(`generateAot cmd: ${singleCmd}`);
    mkdirsSync(projectConfig.anBuildOutPut);
    childProcess.execSync(singleCmd);
  } catch (e) {
    logger.error(`ArkTS:ERROR Failed to generate aot file. Error message: ${e}`);
    process.exit(FAIL);
  }
}

export function generateBuiltinAbc(arkDir: string, nodeJs: string, abcArgs: string[]): string {
  const builtinFilePath: string = path.join(getArkBuildDir(arkDir), "aot", "src", "lib_ark_builtins.d.ts");
  const builtinAbcPath: string = path.join(process.env.cachePath, TEMPORARY, "aot", "lib_ark_builtins.d.abc");
  if (fs.existsSync(builtinAbcPath)) {
    logger.debug(`builtin.d.abc already exists, no need to rebuild again`);
    return builtinAbcPath;
  }
  mkdirsSync(path.dirname(builtinAbcPath));
  if (!validateFilePathLengths([builtinFilePath, builtinAbcPath])) {
    logger.error(`ArkTS:ERROR generateBuiltinAbc failed. Invalid file path.`);
    process.exit(FAIL);
  }
  const tempAbcArgs: string[] = abcArgs.slice(0);
  let singleCmd: string = `${nodeJs} ${tempAbcArgs.join(' ')} "${toUnixPath(builtinFilePath)}" -q -b -m --merge-abc -o "${builtinAbcPath}"`;
  try {
    logger.debug(`generateBuiltinAbc cmd: ${singleCmd}`);
    childProcess.execSync(singleCmd);
  } catch (e) {
    logger.error(`ArkTS:ERROR Failed to generate builtin to abc. Error message: ${e}`);
    process.exit(FAIL);
  }
  return builtinAbcPath;
}
