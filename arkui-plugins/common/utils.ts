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

export function getEnumName(enumType: any, value: number): string | undefined {
    return enumType[value];
}

export function DEBUG_DUMP(content: string, fileName: string, isInit: boolean) {
    const currentDirectory = process.cwd();
    const filePath: string = currentDirectory + "/dist/cache/" + fileName;
    try {
        // 检查文件是否存在
        if (!isInit && fs.existsSync(filePath)) {
            // 如果文件存在，先读取文件内容
            const existingContent = fs.readFileSync(filePath, 'utf8');
            // 若已有内容且最后不是换行符，则添加换行符
            const newContent = existingContent &&!existingContent.endsWith('\n') 
               ? existingContent + '\n' + content 
                : existingContent + content;
            // 将新内容写回文件
            fs.writeFileSync(filePath, newContent, 'utf8');
        } else {
            fs.writeFileSync(filePath, content, 'utf8');
        }
    } catch (error) {
        console.error('文件操作失败:', error);
    }
}
