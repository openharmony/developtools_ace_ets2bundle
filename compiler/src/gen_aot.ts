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
  TEMPORARY
} from './pre_define';
import {
  isWindows,
  mkdirsSync,
  toUnixPath,
  getArkBuildDir,
  getBuildBinDir,
  validateFilePathLengths
} from './utils';

const red: string = '\u001b[31m';
const reset: string = '\u001b[39m';

export function generateAot(arkDir: string, builtinAbcPath: string): void {
  let aotCompiler: string = path.join(getBuildBinDir(arkDir), isWindows() ? "ark_aot_compiler.exe" : "ark_aot_compiler");
  const appAbc: string = path.relative(process.cwd(), path.join(projectConfig.buildPath, MODULES_ABC));
  const appAot: string = path.relative(process.cwd(), path.join(projectConfig.anBuildOutPut, projectConfig.moduleName));
  const profile: string = path.relative(process.cwd(), path.join(
    projectConfig.modulePathMap[projectConfig.moduleName], "profile.aprof"));
  
  if (!validateFilePathLengths([aotCompiler, appAbc, builtinAbcPath, appAot, profile])) {
    logger.error(reset, `ArkTS:ERROR generateAot failed. Invalid file path.`);
    return;
  }
  const singleCmdPrefix: string = `"${aotCompiler}" --builtins-dts="${path.relative(process.cwd(), builtinAbcPath)}" ` +
    `--aot-file="${appAot}" --target-triple=aarch64-unknown-linux-gnu `;
  let singleCmd: string = "";
  if (projectConfig.anBuildMode === "full") {
    singleCmd = singleCmdPrefix + ` "${appAbc}"`;
  } else if (projectConfig.anBuildMode === "pgo") {
    if (!fs.existsSync(profile)) {
      logger.error(reset, `ArkTS:ERROR generateAot failed. PGO mode lost profile in "${profile}"`);
      process.exit(FAIL);
    }
    singleCmd = singleCmdPrefix + ` --enable-pgo-profiler=true --pgo-profiler-path="${profile}" "${appAbc}"`;
  } else {
    logger.error(reset, `ArkTS:ERROR generateAot failed. unknown anBuildMode: ${projectConfig.anBuildMode}`);
    process.exit(FAIL);
  }
  try {
    logger.debug(`generateAot cmd: ${singleCmd}`);
    mkdirsSync(projectConfig.anBuildOutPut);
    childProcess.execSync(singleCmd);
  } catch (e) {
    logger.error(reset, `ArkTS:ERROR Failed to generate aot file. Error message: ${e}`);
    process.exit(FAIL);
  }
}

export function generateBuiltinAbc(arkDir: string, nodeJs: string, abcArgs: string[]): string {
  const builtinFilePath: string = path.join(getArkBuildDir(arkDir), "aot", "src", "lib_ark_builtins.d.ts");
  const builtinAbcPath: string = path.join(process.env.cachePath, TEMPORARY, "aot", "lib_ark_builtins.d.abc");
  if (fs.existsSync(builtinAbcPath)) {
    logger.info(`builtin.d.abc already exists, no need to rebuild again`);
    return builtinAbcPath;
  }
  mkdirsSync(path.dirname(builtinAbcPath));
  if (!validateFilePathLengths([builtinFilePath, builtinAbcPath])) {
    logger.error(reset, `ArkTS:ERROR generateBuiltinAbc failed. Invalid file path.`);
    process.exit(FAIL);
  }
  const tempAbcArgs: string[] = abcArgs.slice(0);
  let singleCmd: string = `${nodeJs} ${tempAbcArgs.join(' ')} "${toUnixPath(builtinFilePath)}" -q -b -m --merge-abc -o "${builtinAbcPath}"`;
  try {
    logger.debug(`generateBuiltinAbc cmd: ${singleCmd}`);
    childProcess.execSync(singleCmd);
  } catch (e) {
    logger.error(reset, `ArkTS:ERROR Failed to generate builtin to abc. Error message: ${e}`);
    process.exit(FAIL);
  }
  return builtinAbcPath;
}
