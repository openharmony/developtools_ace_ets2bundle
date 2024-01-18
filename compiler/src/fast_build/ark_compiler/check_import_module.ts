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

import { ModuleSourceFile } from './module/module_source_file';
import { isJsSourceFile } from './utils';
import { toUnixPath } from '../../utils';
import { compilerOptions } from '../../ets_checker';
import {
  EXTNAME_D_ETS,
  EXTNAME_ETS,
  GEN_ABC_PLUGIN_NAME,
  red,
  yellow
} from './common/ark_define';

export function checkIfJsImportingArkts(rollupObject: Object): void {
  ModuleSourceFile.getSourceFiles().forEach((sourceFile: ModuleSourceFile) => {
    const id: string = sourceFile.getModuleId();
    const unixId: string = toUnixPath(id);
    if (isJsSourceFile(id) && unixId.indexOf('/oh_modules/') === -1) {
      const importMap = rollupObject.getModuleInfo(id).importedIdMaps;
      Object.values(importMap).forEach((requestFile: string) => {
        if (requestFile.endsWith(EXTNAME_ETS) || requestFile.endsWith(EXTNAME_D_ETS)) {
          const errorMsg: string = compilerOptions.isCompatibleVersion ?
            `ArkTS:WARN File: ${id}\n` +
            `Importing ArkTS files in JS and TS files is about to be forbidden.\n` :
            `ArkTS:ERROR ArkTS:ERROR File: ${id}\n` +
            `Importing ArkTS files in JS and TS files is forbidden.\n`;
          const logger: Object = rollupObject.share.getLogger(GEN_ABC_PLUGIN_NAME);
          compilerOptions.isCompatibleVersion ? logger.warn(yellow + errorMsg) : logger.error(red + errorMsg);
        }
      }
      );
    }
  });
}