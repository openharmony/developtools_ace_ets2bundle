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
import * as fs from 'fs';
import * as path from 'path';
import * as arkts from '@koalaui/libarkts';

const isDebugLog: boolean = true;
const isDebugDump: boolean = false;
const isPerformance: boolean = false;
arkts.Performance.getInstance().skip(!isPerformance);

export function getEnumName(enumType: any, value: number): string | undefined {
    return enumType[value];
}

function mkDir(filePath: string): void {
    const parent = path.join(filePath, '..');
    if (!(fs.existsSync(parent) && !fs.statSync(parent).isFile())) {
        mkDir(parent);
    }
    fs.mkdirSync(filePath);
}

export function debugDump(
    content: string,
    fileName: string,
    isInit: boolean,
    cachePath: string | undefined,
    programFileName: string
): void {
    if (!isDebugDump) return;
    const currentDirectory = process.cwd();
    const modifiedFileName = programFileName.replaceAll('.', '_');
    const outputDir: string = cachePath
        ? path.resolve(currentDirectory, cachePath, modifiedFileName)
        : path.resolve(currentDirectory, 'dist', 'cache', modifiedFileName);
    const filePath: string = path.resolve(outputDir, fileName);
    if (!fs.existsSync(outputDir)) {
        mkDir(outputDir);
    }
    try {
        if (!isInit && fs.existsSync(filePath)) {
            const existingContent = fs.readFileSync(filePath, 'utf8');
            const newContent =
                existingContent && !existingContent.endsWith('\n')
                    ? existingContent + '\n' + content
                    : existingContent + content;
            fs.writeFileSync(filePath, newContent, 'utf8');
        } else {
            fs.writeFileSync(filePath, content, 'utf8');
        }
    } catch (error) {
        console.error('文件操作失败:', error);
    }
}

export function debugLog(message?: any, ...optionalParams: any[]): void {
    if (!isDebugLog) return;
    console.log(message, ...optionalParams);
}

export function getDumpFileName(state: number, prefix: string, index: number | undefined, suffix: string): string {
    return `${state}_${prefix}_${index ?? ''}_${suffix}.sts`;
}
