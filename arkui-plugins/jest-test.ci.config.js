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
const sdkPrefixPath = findSingleSubdirectorySync(path.resolve(rootPath, './prebuilts/ohos-sdk/linux/'))
const sdkPath = path.join(sdkPrefixPath, 'ets', 'static');
const pandaSdkPath = path.resolve(sdkPath, './build-tools/ets2panda');
const apiPath = path.resolve(sdkPath, './api');
const kitPath = path.resolve(sdkPath, './kits');

module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.ts$': ['ts-jest'],
    },
    testPathIgnorePatterns: [
        './test/ut/ui-plugins/unit',
        './test/unit'
    ],
    testMatch: [
        '**/test/ut/ui-plugins/decorators/custom-dialog/base-custom-dialog.test.ts',
        '**/test/ut/ui-plugins/decorators/builder-param/builder-param-passing.test.ts',
        '**/test/ut/ui-plugins/decorators/resource/resource-in-build.test.ts',
        '**/test/ut/ui-plugins/builder-lambda/inner-component/overload-component-builder.test.ts',
        '**/test/ut/ui-plugins/builder-lambda/condition-scope/if-else-in-content.test.ts',
        '**/test/ut/ui-plugins/entry/route-name/route-name-storage-shared.test.ts',
        '**/test/ut/ui-plugins/builder-lambda/style-with-receiver.test.ts',
        '**/test/ut/ui-plugins/use-namespace.test.ts',
        '**/test/ut/ui-plugins/double-dollar/double-dollar-textpicker.test.ts',
        '**/test/ut/ui-plugins/component/for-each.test.ts',
        '**/test/ut/ui-plugins/imports/kit-import.test.ts',
        '**/test/ut/ui-plugins/wrap-builder/wrap-builder-in-generic.test.ts',
        '**/test/ut/memo-plugins/function-declarations/internal-memo-arg.test.ts'
    ],
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
