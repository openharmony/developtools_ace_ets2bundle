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

const fs = require('fs');

import {extractErrorWarningBlocks, LookingFor} from "../../../utils/parse-string";
import {PluginTestContext} from "../../../utils/shared-types";
import * as path from "node:path";
import {getRootPath, MOCK_ENTRY_DIR_PATH, UI_SYNTAX_PATH} from "../../../utils/path-config";

export class TestJsonPath {
    testJsonPath: string;

    constructor(dirPath: string) {
        const fullDirPath = path.resolve(
            getRootPath(),
            MOCK_ENTRY_DIR_PATH,
            UI_SYNTAX_PATH,
            dirPath
        );

        const files = fs.readdirSync(fullDirPath);
        const jsonFile = files.find((f: string) => f.endsWith(".json"));

        if (!jsonFile) {
            throw new Error(`No JSON file found in directory: ${fullDirPath}`);
        }

        this.testJsonPath = path.join(fullDirPath, jsonFile);
    }
}

export class CompileFilePath {
    value: string;

    constructor(dir: string, etsName: string) {
        this.value = path.resolve(
            getRootPath(),
            MOCK_ENTRY_DIR_PATH,
            UI_SYNTAX_PATH,
            dir,
            `${etsName}.ets`
        );
    }
}

export function unitTestParsedTransformer(plugins: PluginTestContext, currentTest:any, etsName: string): string[] {
    const pluginErrors = extractErrorWarningBlocks(plugins.warnings ?? [], LookingFor.ERROR);
    const pluginWarnings = extractErrorWarningBlocks(plugins.warnings ?? [], LookingFor.WARNING);
    const missing: string[] = [];
    for (const { message, position } of currentTest) {
        const positionInfo = `${position.line}:${position.column}`;

        const found =
            pluginErrors.some(line => line.includes(message) && line.includes(positionInfo)) ||
            pluginWarnings.some(line => line.includes(message) && line.includes(positionInfo));

        if (!found) {
            missing.push(`${etsName}: ${message} ${positionInfo}`);
        }
    }

    return missing;
}
