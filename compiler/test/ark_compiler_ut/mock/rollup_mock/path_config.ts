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

import path from "path";

// project oh_modules path
export const OH_MODULES_OHPM_HYPIUM: string = 'oh_modules/.ohpm/@ohos+hypium@1.0.6/oh_modules/@ohos/hypium';
export const OH_MODULES_OHOS_HYPIUM: string = 'oh_modules/@ohos/hypium';

// project root path, default project name
export const PROJECT_ROOT = path.resolve(__dirname, '../../../../test/ark_compiler_ut/testdata');
export const DEFAULT_PROJECT: string = 'testcase_def';

// project module id
export const MODULE_ID_ROLLUP_PLACEHOLDER = "\x00rollup_plugin_ignore_empty_module_placeholder";

// project build node_modules
export const NODE_MODULES_PATH = "default/intermediates/loader_out/default/node_modules";

export const ES2ABC_PATH: string = '/build/bin/es2abc';
export const TS2ABC_PATH: string = '/build/src/index.js';
export const MERGERABC_PATH: string = '/build/bin/merge_abc';
export const JS2ABC_PATH: string = '/build/bin/js2abc';
export const AOTCOMPILER_PATH: string = '/build/bin/ark_aot_compiler';
export const ARKROOT_PATH: string = 'bin/ark';
export const ARKCONFIG_TS2ABC_PATH: string = 'bin/ark/build/legacy_api8/src/index.js';

export const EXPECT_SOURCEMAP_JSON: string = `${PROJECT_ROOT}/expect/sourceMaps.json`;
export const MOCK_CONFIG_PATH: string = "openharmony/mockconfig";
export const PKG_MODULES_OHPM_HYPIUM: string = 'pkg_modules/.ohpm/@ohos+hypium@1.0.6/pkg_modules/@ohos/hypium';

export const EXPECT_ENTRY_TS: string = `${PROJECT_ROOT}/expect/expect_EntryAbility.ts`;
export const EXPECT_INDEX_ETS: string = `${PROJECT_ROOT}/expect/expect_Index.ets`;
export const MODULE_TEST_PATH: string = `${PROJECT_ROOT}/testTsModuleRequest/src/main/ets/`;