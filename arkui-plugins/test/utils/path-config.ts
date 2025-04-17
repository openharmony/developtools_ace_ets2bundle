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

import * as fs from 'fs';
import * as path from 'path';

export const ARKTS_CONFIG_FILE_PATH: string = 'arktsconfig.json';
export const PANDA_SDK_PATH: string = 'node_modules/@panda/sdk';
export const PANDA_SDK_STDLIB_PATH: string = 'lib';
export const STDLIB_PATH: string = 'stdlib';
export const STDLIB_STD_PATH: string = 'stdlib/std';
export const STDLIB_ESCOMPAT_PATH: string = 'stdlib/escompat';
export const RUNTIME_API_PATH: string = 'demo/runtime-api';
export const MOCK_ENTRY_DIR_PATH: string = 'demo/mock';
export const MOCK_ENTRY_FILE_NAME: string = 'entry.ets';
export const MOCK_OUTPUT_CACHE_PATH: string = 'generated/cache';
export const MOCK_OUTPUT_DIR_PATH: string = 'generated/abc';
export const MOCK_OUTPUT_FILE_NAME: string = 'entry.abc';
export const MOCK_LOCAL_SDK_DIR_PATH: string = 'local';
export const ETS_SUFFIX: string = '.ets';
export const ABC_SUFFIX: string = '.abc';

function getRootPath(): string {
    return path.resolve(__dirname, '..');
}

function changeFileExtension(file: string, targetExt: string, originExt = ''): string {
    const currentExt: string = originExt.length === 0 ? path.extname(file) : originExt;
    const fileWithoutExt: string = file.substring(0, file.lastIndexOf(currentExt));
    return fileWithoutExt + targetExt;
}

function getFileName(file: string): string {
    const fileWithExt: string = path.basename(file);
    const currentExt: string = path.extname(file);
    return fileWithExt.substring(0, fileWithExt.lastIndexOf(currentExt));
}

function ensurePathExists(filePath: string): void {
    try {
        const dirPath: string = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
        }
    }
}

export { getRootPath, changeFileExtension, getFileName, ensurePathExists };
