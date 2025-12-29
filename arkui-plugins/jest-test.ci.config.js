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

const fs = require('fs');
const path = require('path');

function findSingleSubdirectorySync(basePath) {
    const items = fs.readdirSync(basePath);
    
    const directories = items.filter(item => {
        const itemPath = path.join(basePath, item);
        return fs.lstatSync(itemPath).isDirectory();
    });
    
    if (directories.length !== 1) {
        throw new Error(`Expected exactly one directory under ${basePath}, found ${directories.length}`);
    }
    
    return path.join(basePath, directories[0]);
}

const rootPath = path.resolve(__dirname, '../../../');
const sdkPrefixPath = findSingleSubdirectorySync(path.resolve(rootPath, './out/sdk/packages/ohos-sdk/linux/'))
const sdkPath = path.join(sdkPrefixPath, 'ets', 'static');
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
    verbose: false,
    globals: {
        SDK_PATH: sdkPath,
        PANDA_SDK_PATH: pandaSdkPath,
        API_PATH: apiPath,
        KIT_PATH: kitPath,
        UI_CACHE_ENABLED: true,
        UI_UPDATE_ENABLED: true,
        MEMO_CACHE_ENABLED: true,
        MEMO_UPDATE_ENABLED: true,
    },
};
