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

import { ESMODULE } from './common/ark_define';
import { initArkProjectConfig } from './common/process_ark_config';
import { ModuleSourceFile } from './module/module_source_file';
import {
  isJsonSourceFile,
  isJsSourceFile
} from './utils';

/**
 * rollup load hook
 * @param {string } id: absolute path of an input file
 */
export function load(id: string) {
  // init ArkProjectConfig here since load is the first plugin of gen_abc_plugin
  this.share.arkProjectConfig = initArkProjectConfig(this.share.projectConfig);
  if (this.share.projectConfig.compileMode === ESMODULE) {
    preserveJsAndJsonSourceContent(id);
  }
}

function preserveJsAndJsonSourceContent(sourceFilePath: string) {
  if (isJsSourceFile(sourceFilePath) || isJsonSourceFile(sourceFilePath)) {
    ModuleSourceFile.newSourceFile(sourceFilePath, fs.readFileSync(sourceFilePath).toString());
  }
}
