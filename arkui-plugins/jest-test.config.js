/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const path = require('path');

const rootPath = path.resolve(__dirname, '../../../');
const sdkPath = path.resolve(rootPath, './out/sdk/ohos-sdk/linux/ets/ets1.2');
const pandaSdkPath = path.resolve(sdkPath, './build-tools/ets2panda');
const apiPath = path.resolve(sdkPath, './api');
const kitPath = path.resolve(sdkPath, './kits');

module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.ts$': ['ts-jest'],
    },
    testRegex: './test/ut/.+\\.test\\.ts$',
    testPathIgnorePatterns: [],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    coverageDirectory: './test/report',
    collectCoverageFrom: [
        'collectors/**',
        'common/**',
        'memo-plugins/**',
        'ui-plugins/**'
    ],
    coveragePathIgnorePatterns: [
        'common/debug.ts',
        'common/etsglobal-remover.ts',
        'common/print-visitor.ts',
        'common/plugin-context.ts',
        'memo-plugins/index.ts',
        'memo-plugins/import-transformer.ts',
        'memo-plugins/memo-transformer.ts',
        'ui-plugins/index.ts',
        'ui-plugins/printer-transformer.ts',
        'ui-plugins/builder-lambda-translators/builder-lambda-transformer.ts',
        'ui-plugins/entry-translators/entry-transformer.ts',
        'ui-plugins/struct-translators/struct-transformer.ts',
    ],
    verbose: true,
    globals: {
        SDK_PATH: sdkPath,
        PANDA_SDK_PATH: pandaSdkPath,
        API_PATH: apiPath,
        KIT_PATH: kitPath,
    },
};
