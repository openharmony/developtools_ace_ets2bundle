/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

import * as path from 'path';

const GLOBAL_ESVALUE_FILE: string = '@ohos.arkui.GlobalESValue.d.ts';
const API: string = 'api';
const COMPONENT: string = 'component';
const SOURCE: string = 'source';
const BUILD: string = 'build_delete_noninterop';
const UT: string = 'ut';
const UTF_8: BufferEncoding = 'utf8';

const PROJECT_ROOT: string = path.resolve(__dirname, '../../test');
const ADD_IMPORT_SOURCE_PATH: string = path.resolve(PROJECT_ROOT, 'ut', API);
const ADD_IMPORT_OUTPUTS_PATH: string = path.resolve(PROJECT_ROOT, 'build_add_import', API);
const ADD_IMPORT_TARGET_PATH: string = path.resolve(PROJECT_ROOT, 'target', API);

const SAMPLE: string = 'sample';
const SAMPLE_BUILD: string = 'build_sample';
const SAMPLE_RESULT: string = 'build_sample_result';

const SAMPLE_API: string[] = [
  './api/@ohos.arkui.xxx.d.ts',
  './component/yyy.d.ts',
];

export {
  ADD_IMPORT_OUTPUTS_PATH,
  ADD_IMPORT_SOURCE_PATH,
  ADD_IMPORT_TARGET_PATH,
  API,
  BUILD,
  COMPONENT,
  GLOBAL_ESVALUE_FILE,
  PROJECT_ROOT,
  SAMPLE,
  SAMPLE_API,
  SAMPLE_BUILD,
  SAMPLE_RESULT,
  SOURCE,
  UT,
  UTF_8,
}
