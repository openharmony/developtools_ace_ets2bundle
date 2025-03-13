/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
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
import { error } from 'console';
import * as path from 'path';

const UI_PLUGINS = 'ui-plugins';
const ARKUI_PLUGINS = 'arkui-plugins';

function findMatchingFile(currentPath: string, targetFileName1: string, targetFileName2: string): string | null {
    let current = currentPath;
    while (true) {
        // 获取当前路径的文件名
        const baseName = path.basename(current);
        if (baseName === targetFileName1 || baseName === targetFileName2) {
            return path.dirname(current);
        }

        const parentPath = path.dirname(current);
        if (parentPath === current) {
            break;
        }
        current = parentPath;
    }
    throw new Error("ui-plugins not found.")
}

function findRootDir() {
    const plugins =  findMatchingFile(__dirname, UI_PLUGINS, ARKUI_PLUGINS);
    if (plugins === null) {
        throw ("error")
    }
    return plugins
}

export function getArktsPath() {
    return path.join(findRootDir(), 'koala-wrapper','./build/lib/arkts-api/index.js')
}

export function getInteropPath() {
    return path.join(findRootDir(), 'koala-wrapper/koalaui/interop', "./dist/lib/src/interop/index.js")
}

export function getCommonPath() {
    return path.join(findRootDir(), 'koala-wrapper/koalaui/common', "./dist/lib/src/index.js")
}

export function getCompatPath() {
    return path.join(findRootDir(), 'koala-wrapper/koalaui/compat', "./dist/src/index.js")
}
