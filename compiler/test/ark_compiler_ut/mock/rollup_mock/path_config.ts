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
export const AN_BUILD_OUTPUT_PATH = 'default/intermediates/loader_out/default/an/arm64-v8a';

export const ES2ABC_PATH: string = '/build/bin/es2abc';
export const TS2ABC_PATH: string = '/build/src/index.js';
export const MERGERABC_PATH: string = '/build/bin/merge_abc';
export const JS2ABC_PATH: string = '/build/bin/js2abc';
export const AOTCOMPILER_PATH: string = '/build/bin/ark_aot_compiler';
export const ARKROOT_PATH: string = 'bin/ark';
export const MODULE_TEST_PATH: string = `${PROJECT_ROOT}/testTsModuleRequest/src/main/ets/`;
export const TEST_TS: string = 'src/main/ets/pages/test.ts';
export const TEST_ETS: string = 'src/main/ets/pages/test.ets';
export const TEST_JS: string = 'src/main/ets/pages/test.js';
export const TEST_JSON: string = 'src/main/ets/pages/test.json';
export const SYMBOLMAP_MAP: string = 'entry/build/loader_out/ets/symbolMap.map';
export const DEFAULT_ETS: string = 'entry/build/loader_out/ets';
export const BUILD_INFO: string ='entry/build/filesInfo.txt';
export const BUILD_NPM: string ='entry/build/npmEntries.txt';
export const MODULES_ABC: string ='entry/build/modules.abc';
export const PREVIEW_DEBUG_INFO: string ='entry/preview/filesInfo.txt';
export const PREVIEW_DEBUG_NPM: string ='entry/preview/npmEntries.txt';
export const PREVIEW_MODULES_ABC: string ='entry/preview/modules.abc';
export const BUILD_CACHE: string ='entry/build/modules.cache';
export const BUILD_RELEASE_CACHE: string ='entry/build/modules.cache';
export const PREVIEW_DEBUG_CACHE: string ='entry/preview/modules.cache';
export const DEBUG_INFO: string ="--debug-info";
export const ENTRY_LIST: string ="--npm-module-entry-list";
export const OUTPUT: string ="--output";
export const FILE_THREADS: string ="--file-threads";
export const MERGE_ABC: string ="--merge-abc";
export const CACHE_FILE: string ="--cache-file";
export const SIMBOL_TABLE: string ="--dump-symbol-table";
export const TARGET_API_VERSION: string = "--target-api-version=";
export const TYPE_EXTRACTOR: string = "--type-extractor";
export const ARKCONFIG_TS2ABC_PATH: string = 'bin/ark/build/legacy_api8/src/index.js';

export const EXPECT_ENTRY_TS: string = `${PROJECT_ROOT}/expect/expect_EntryAbility.ts`;
export const EXPECT_INDEX_ETS: string = `${PROJECT_ROOT}/expect/expect_Index.ets`;
export const EXPECT_SOURCEMAP_JSON: string = `${PROJECT_ROOT}/expect/sourceMaps.json`;
export const EXPECT_TO_JS: string = `${PROJECT_ROOT}/expect/expectToJS.json`;
export const TERSER_PROCESSED_EXPECTED_CODE: string = `${PROJECT_ROOT}/expect/terser_processed_expected_code.txt`;

export const PKG_MODULES_OHPM_HYPIUM: string = 'pkg_modules/.ohpm/@ohos+hypium@1.0.6/pkg_modules/@ohos/hypium';
export const PKG_MODULES_ENTRY: string = 'pkg_modules@entry';
export const PKG_MODULES_OHPM_HYPIUM_SHORT: string = 'pkg_modules/@ohos/hypium';
export const MOCK_CONFIG_PATH: string = "openharmony/mockconfig";
