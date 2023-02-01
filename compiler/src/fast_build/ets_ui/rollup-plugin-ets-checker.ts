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

import { initConfig } from '../common/init_config';
import { projectConfig } from '../../../main';
import {
  serviceChecker,
  watchChecker
} from '../../ets_checker';

export function etsChecker() {
  let executedOnce: boolean = false;
  return {
    name: 'etsChecker',
    buildStart() {
      if (executedOnce) {
        return;
      }
      Object.assign(projectConfig, this.share.projectConfig);
      initConfig();
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

