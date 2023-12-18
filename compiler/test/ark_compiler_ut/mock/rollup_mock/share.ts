/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use rollupObject file except in compliance with the License.
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

import {
  ProjectConfig,
  IArkProjectConfig
} from "./project_config";
import {
  OH_MODULES_OHPM_HYPIUM,
  OH_MODULES_OHOS_HYPIUM,
  MOCK_CONFIG_PATH
} from "./path_config";

class Logger {
  private prefix: string;
  private messsage: string;
  static instances = [];

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  public debug(color: string, msg: string, reset: string) {
    console.debug(`${color}${this.prefix}: ${JSON.stringify(msg)}${reset}`);
  }

  public error(color: string, errormsg: string, reset: string) {
    console.error(`${color}${this.prefix}: ${JSON.stringify(errormsg)}${reset}`);
    this.messsage = color.toString();
  }

  public getPrefix() {
    return this.prefix;
  }


  public static getLogger(prefix): any {
    for (const instance of Logger.instances) {
      if (instance.getPrefix() == prefix) {
        return instance;
      }
    }
  }
  public static createLogger(prefix) {
    const logger = new Logger(prefix);
    Logger.instances.push(logger)
    return logger;
  }
}

class Share {
  projectConfig: ProjectConfig;
  arkProjectConfig: IArkProjectConfig;
  symlinkMap = {};
  currentModuleMetaMap = {};

  allComponents?: Map<string, Array<string>>;
  allFiles?: Set<string>;

  constructor(buildMode: string) {
    this.projectConfig = new ProjectConfig(buildMode);
  }

  public throwArkTsCompilerError(error: any) {
    console.error(JSON.stringify(error));
  }

  public getLogger(prefix: string): Logger {
    const logger = Logger.getLogger(prefix);
    if (!logger || logger == undefined) {
      return Logger.createLogger(prefix);
    }
    return logger;
  }

  public scan(testcase: string) {
    if (!testcase) {
      return
    }
    this.projectConfig.scan(testcase);
    this.symlinkMap[`${this.projectConfig.projectTopDir}/${OH_MODULES_OHPM_HYPIUM}`] = [
      `${this.projectConfig.projectTopDir}/${OH_MODULES_OHOS_HYPIUM}`
    ];
  }

  public setMockParams() {
    this.projectConfig.setMockParams({ mockConfigPath: MOCK_CONFIG_PATH });
  }
}

export default Share;
