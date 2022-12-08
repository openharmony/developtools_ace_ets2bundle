/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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

import * as path from "path";
import cluster from "cluster";
import process from "process";
import {
  ESMODULE,
  FAIL,
  GEN_ABC_SCRIPT,
  GEN_MODULE_ABC_SCRIPT,
  JSBUNDLE
} from "./pre_define";

if (process.env["workerNumber"] === undefined) {
    process.exit(FAIL);
}

if (process.env["mode"] !== JSBUNDLE && process.env['mode'] !== ESMODULE) {
    process.exit(FAIL);
}

if (
  process.env["workerNumber"] !== undefined ||
  process.env["splitedData"] !== undefined ||
  process.env["cmdPrefix"] !== undefined
) {
  const clusterNewApiVersion: number = 16;
  const currentNodeVersion: number = parseInt(process.version.split(".")[0]);
  const useNewApi: boolean = currentNodeVersion >= clusterNewApiVersion;

  let workerNumber: number = parseInt(process.env.workerNumber);
  let splitedData: any = JSON.parse(process.env.splitedData);
  let cmdPrefix: string = process.env.cmdPrefix;  

  if ((useNewApi && cluster.isPrimary) || (!useNewApi && cluster.isMaster)) {
    let genAbcScript: string = GEN_ABC_SCRIPT;
    if (process.env['mode'] === ESMODULE) {
      genAbcScript = GEN_MODULE_ABC_SCRIPT
    }
    if (useNewApi) {
      cluster.setupPrimary({
        exec: path.resolve(__dirname, genAbcScript),
      });
    } else {
      cluster.setupMaster({
        exec: path.resolve(__dirname, genAbcScript),
      });
    }

    for (let i = 0; i < workerNumber; ++i) {
      let workerData: any = {
        inputs: JSON.stringify(splitedData[i]),
        cmd: cmdPrefix,
      };
      if (process.env['mode'] === ESMODULE) {
        let cachePath: string = process.env.cachePath;
        let sn: number = i + 1;
        let workerFileName: string = `filesInfo_${sn}.txt`;
        workerData['workerFileName'] = workerFileName;
        workerData['cachePath'] = cachePath;
      }
      cluster.fork(workerData);
    }
    cluster.on("exit", (worker, code, signal) => {
      if (code === FAIL) {
        process.exit(FAIL);
      }
    });
  }
}
