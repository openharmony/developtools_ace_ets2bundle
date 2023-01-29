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

import fs from 'fs';

import {
  ESMODULE,
  EXTNAME_CJS,
  EXTNAME_JS,
  EXTNAME_JSON,
  EXTNAME_MJS,
} from './common/ark_define';
import { initArkProjectConfig } from './common/process_ark_config';
import { ModuleSourceFile } from "./module/module_source_file";
import { isSpecifiedExt } from './utils';

/**
 * rollup load hook
 * @param {string } id
 */
export function load(id: string) {
  this.share.arkProjectConfig = initArkProjectConfig(this.share.projectConfig);
  if (this.share.projectConfig.compileMode === ESMODULE) {
    preserveJsAndJsonSourceContent(id);
  }
}

function preserveJsAndJsonSourceContent(sourceFilePath: string) {
  if (isSpecifiedExt(sourceFilePath, EXTNAME_JS) || isSpecifiedExt(sourceFilePath, EXTNAME_MJS) ||
    isSpecifiedExt(sourceFilePath, EXTNAME_CJS) || isSpecifiedExt(sourceFilePath, EXTNAME_JSON)) {
    ModuleSourceFile.newSourceFile(sourceFilePath, fs.readFileSync(sourceFilePath).toString());
  }

  return;
}
