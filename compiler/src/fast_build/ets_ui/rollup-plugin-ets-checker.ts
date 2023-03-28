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

import path from 'path';
import { EventEmitter } from 'events';

import { initConfig } from '../common/init_config';
import { projectConfig } from '../../../main';
import {
  serviceChecker,
  watchChecker
} from '../../ets_checker';
import { TS_WATCH_END_MSG } from '../../pre_define';

export let tsWatchEmitter: EventEmitter | undefined = undefined;
export let tsWatchEndPromise: Promise<void>;

export function etsChecker() {
  let executedOnce: boolean = false;
  return {
    name: 'etsChecker',
    buildStart() {
      if (process.env.watchMode === 'true' && process.env.triggerTsWatch === 'true') {
        tsWatchEmitter = new EventEmitter();
        tsWatchEndPromise = new Promise<void>(resolve => {
          tsWatchEmitter.on(TS_WATCH_END_MSG, () => {
            resolve();
          });
        });
      }
      if (executedOnce) {
        return;
      }
      Object.assign(projectConfig, this.share.projectConfig);
      Object.assign(this.share.projectConfig, {
        compileHar: projectConfig.compileHar,
        compileShared: projectConfig.compileShared,
        moduleRootPath: projectConfig.moduleRootPath,
        buildPath: projectConfig.buildPath
      });
      const logger = this.share.getLogger('etsChecker');
      const rootFileNames: string[] = [];
      Object.values(projectConfig.entryObj).forEach((fileName: string) => {
        rootFileNames.push(path.resolve(fileName));
      });
      if (process.env.watchMode === 'true') {
        executedOnce = true;
        watchChecker(rootFileNames, logger);
      } else {
        serviceChecker(rootFileNames, logger);
      }
    }
  };
}

