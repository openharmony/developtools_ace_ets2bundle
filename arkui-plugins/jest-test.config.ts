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

const rootPath = path.resolve(__dirname, '../../../');

const sdkPath = path.resolve(rootPath, './out/sdk/ohos-sdk/linux/ets/ets1.2');

const pandaSdkPath = path.resolve(sdkPath, './build-tools/ets2panda');

module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.ts$': ['ts-jest', { isolatedModules: true }],
    },
    testRegex: './test/ut/.+\\.test\\.ts$',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    coverageDirectory: './test/report',
    collectCoverageFrom: ['common/**', 'memo-plugins/**', 'ui-plugins/**'],
    verbose: true,
    globals: {
        SDK_PATH: sdkPath,
        PANDA_SDK_PATH: pandaSdkPath
    }
};    
