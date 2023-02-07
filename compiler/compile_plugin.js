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

const { initConfig } = require('./lib/fast_build/common/init_config');
const { getCleanConfig } = require('./main');
const { etsTransform } = require('./lib/fast_build/ets_ui/rollup-plugin-ets-typescript');
const { etsChecker } = require('./lib/fast_build/ets_ui/rollup-plugin-ets-checker');
const { apiTransform } = require('./lib/fast_build/system_api/rollup-plugin-system-api');
const { genAbc } = require('./lib/fast_build/ark_compiler/rollup-plugin-gen-abc');
const { watchChangeFiles } = require('./lib/fast_build/common/rollup-plugin-watch-change');

exports.etsTransform = etsTransform;
exports.apiTransform = apiTransform;
exports.etsChecker = etsChecker;
exports.genAbc = genAbc;
exports.watchChangeFiles = watchChangeFiles;
exports.initConfig = initConfig;
exports.getCleanConfig = getCleanConfig;
