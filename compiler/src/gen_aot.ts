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
import * as os from 'os';
import {
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
  validateFilePathLength,
  validateFilePathLengths
} from './utils';
import {
  getArkBuildDir,
  getBuildBinDir
} from './ark_utils';

const hostToolKeyWords: string = '[HostTool] ';
const logLevelIndex: number = 4;

export interface FaultHandler {
  (error: string): void
}

function checkAotPartialConfig(compileMode: string, buildJsonInfo: any, faultHandler: FaultHandler): boolean {
  if (buildJsonInfo.anBuildMode !== AOT_PARTIAL && !buildJsonInfo.apPath) {
    // no AOT's partial related configuration is hit, pass the configuration to next compile mode
    return false;
  }
  if (compileMode !== ESMODULE) {
    faultHandler(`ArkTS:ERROR Aot's partial mode must config compileMode with esmodule.`);
    return true;
  }
  if (buildJsonInfo.anBuildMode !== AOT_PARTIAL) {
    faultHandler(`ArkTS:ERROR Aot's partial mode must config aotBuildMode with partial.`);
    return true;
  }
  if (!buildJsonInfo.apPath) {
    faultHandler(`ArkTS:ERROR Aot's partial mode must config a valid apPath.`);
    return true;
  }
  if (path.extname(buildJsonInfo.apPath) !== AOT_PROFILE_SUFFIX) {
    faultHandler(`ArkTS:ERROR apPath for Aot's partial mode must with suffix "${AOT_PROFILE_SUFFIX}".`);
    return true;
  }
  if (!fs.existsSync(buildJsonInfo.apPath)) {
    faultHandler(`ArkTS:ERROR apPath for Aot's partial mode is not found in "${buildJsonInfo.apPath}".`);
    return true;
  }
  if (!buildJsonInfo.anBuildOutPut) {
    faultHandler(`ArkTS:ERROR Aot's partial mode need anBuildOutPut.`);
    return true;
  }
  // Aot compiler's partial mode.
  return true;
}

function checkAotFullConfig(compileMode: string, buildJsonInfo: any, faultHandler: FaultHandler): boolean {
  if (buildJsonInfo.anBuildMode !== AOT_FULL) {
    // no AOT's full related configuration is hit, pass the configuration to next compile mode
    return false;
  }
  if (compileMode !== ESMODULE) {
    faultHandler(`ArkTS:ERROR Aot's full mode must config compileMode with esmodule.`);
    return true;
  }
  if (buildJsonInfo.apPath) {
    faultHandler(`ArkTS:ERROR Aot's full mode do not need apPath.`);
    return true;
  }
  if (!buildJsonInfo.anBuildOutPut) {
    faultHandler(`ArkTS:ERROR Aot's full mode need anBuildOutPut.`);
    return true;
  }
  // Aot compiler's full mode.
  return true;
}

function checkAotTypeConfig(compileMode: string, buildJsonInfo: any, faultHandler: FaultHandler): boolean {
  if (buildJsonInfo.anBuildMode !== AOT_TYPE) {
    // no AOT's type related configuration is hit, pass the configuration to next compile mode
    return false;
  }
  if (compileMode !== ESMODULE) {
    faultHandler(`ArkTS:ERROR Aot's type mode must config compileMode with esmodule.`);
    return true;
  }
  if (buildJsonInfo.apPath) {
    faultHandler(`ArkTS:ERROR Aot's type mode do not need apPath.`);
    return true;
  }
  // Aot compiler's type mode.
  return true;
}

/**
 * Check if the AOT related configuration is hit
 * @param compileMode CompileMode for the project, which can be jsbundle or esmodule
 * @param buildJsonInfo buildJsonInfo which parsed from projectConfig.aceBuildJson
 * @param faultHandler faultHandler for illegal AOT configuration
 * @returns {Boolean} false means no AOT related configuration found, else return true
 * @api private
 */
export function checkAotConfig(compileMode: string, buildJsonInfo: any, faultHandler: FaultHandler): boolean {
  return checkAotTypeConfig(compileMode, buildJsonInfo, faultHandler) ||
    checkAotFullConfig(compileMode, buildJsonInfo, faultHandler) ||
    checkAotPartialConfig(compileMode, buildJsonInfo, faultHandler);
}

export function generateAot(arkDir: string, builtinAbcPath: string, projectConfig: any, logger: any, faultHandler: FaultHandler): void {
  let aotCompiler: string = path.join(getBuildBinDir(arkDir), isWindows() ? "ark_aot_compiler.exe" : "ark_aot_compiler");
  const appAbc: string = path.join(projectConfig.buildPath, MODULES_ABC);
  const appAot: string = path.join(projectConfig.anBuildOutPut, projectConfig.moduleName);

  if (!validateFilePathLengths([aotCompiler, appAbc, builtinAbcPath, appAot], logger)) {
    faultHandler(`ArkTS:ERROR generateAot failed. Invalid file path.`);
  }
  if (!fs.existsSync(appAbc)) {
    faultHandler(`ArkTS:ERROR generateAot failed. AppAbc not found in "${appAbc}"`);
  }
  const singleCmdPrefix: string = `"${aotCompiler}" --builtins-dts="${builtinAbcPath}" ` +
    `--aot-file="${appAot}" --target-triple=aarch64-unknown-linux-gnu `;
  let singleCmd: string = "";
  if (projectConfig.anBuildMode === AOT_FULL) {
    singleCmd = singleCmdPrefix + ` "${appAbc}"`;
  } else if (projectConfig.anBuildMode === AOT_PARTIAL) {
    const profile: string = projectConfig.apPath;
    if (!validateFilePathLength(profile, logger)) {
      faultHandler(`ArkTS:ERROR generateAot failed. Invalid profile file path.`);
    }
    if (!fs.existsSync(profile)) {
      faultHandler(`ArkTS:ERROR generateAot failed. Partial mode lost profile in "${profile}"`);
    }
    singleCmd = singleCmdPrefix + ` --enable-pgo-profiler=true --pgo-profiler-path="${profile}" "${appAbc}"`;
  } else {
    faultHandler(`ArkTS:ERROR generateAot failed. unknown anBuildMode: ${projectConfig.anBuildMode}`);
  }
  try {
    logger.debug(`generateAot cmd: ${singleCmd}`);
    mkdirsSync(projectConfig.anBuildOutPut);
    childProcess.execSync(singleCmd, { windowsHide: true });
  } catch (e) {
    // Extract HostTool log information from hilog, which outputs to stdout.
    let errorMessages: string[] = [];
    let outStream: Buffer = e.stdout;
    outStream.toString().split(os.EOL).forEach((stdLog: string) => {
      if (!stdLog.includes(hostToolKeyWords)) {
        return;
      }
      let logHeader: string = '';
      let logContent: string = '';
      [logHeader, logContent] = stdLog.split(hostToolKeyWords);
      if (!logHeader && !logContent) {
        return;
      }
      let logLevel: string = logHeader.trim().split(/\s+/)[logLevelIndex];
      if (logLevel === 'F' || logLevel === 'E') {
        errorMessages.push(`ArkTS:ERROR: ${logContent}`);
      }
    });
    faultHandler(`ArkTS:ERROR Failed to generate aot file. Error message: ${e}${errorMessages.join(os.EOL)}`);
  }
}

export function generateBuiltinAbc(arkDir: string, abcArgs: string[], cachePath: string,
  logger: any, faultHandler: FaultHandler): string {
  const builtinFilePath: string = path.join(getArkBuildDir(arkDir), "aot", "src", "lib_ark_builtins.d.ts");
  const builtinAbcPath: string = path.join(cachePath, TEMPORARY, "aot", "lib_ark_builtins.d.abc");
  if (fs.existsSync(builtinAbcPath)) {
    logger.debug(`builtin.d.abc already exists, no need to rebuild again`);
    return builtinAbcPath;
  }
  mkdirsSync(path.dirname(builtinAbcPath));
  if (!validateFilePathLengths([builtinFilePath, builtinAbcPath], logger)) {
    faultHandler(`ArkTS:ERROR generateBuiltinAbc failed. Invalid file path.`);
  }
  const tempAbcArgs: string[] = abcArgs.slice(0);
  let singleCmd: string = `${tempAbcArgs.join(' ')} "${toUnixPath(builtinFilePath)}" -q -b -m --merge-abc -o "${builtinAbcPath}"`;
  try {
    logger.debug(`generateBuiltinAbc cmd: ${singleCmd}`);
    childProcess.execSync(singleCmd, { windowsHide: true });
  } catch (e) {
    faultHandler(`ArkTS:ERROR Failed to generate builtin to abc. Error message: ${e}`);
  }
  return builtinAbcPath;
}
