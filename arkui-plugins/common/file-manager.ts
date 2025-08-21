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
import { LANGUAGE_VERSION } from './predefines';
import { readFirstLineSync, toUnixPath } from './arkts-utils';
import { BuildConfig, DependentModuleConfig } from './plugin-context';


export class FileManager {
    private static instance: FileManager | undefined = undefined;
    static arkTSModuleMap: Map<string, DependentModuleConfig> = new Map();
    static staticApiPath: Set<string> = new Set();
    static dynamicApiPath: Set<string> = new Set();
    static buildConfig: BuildConfig;
    private constructor() { }

    static setInstance(instance: FileManager | undefined): void {
        if (instance === undefined) {
            throw Error('fileManager is undefined!');
        }
        FileManager.instance = instance;
    }

    static getInstance(): FileManager {
        if (!FileManager.instance) {
            throw Error('fileManager not exist.');
        }
        return FileManager.instance;
    }

    private static isFirstLineUseStatic(filePath: string): boolean {
        const firstLine = readFirstLineSync(filePath);
        return firstLine === "'use static'";
    }

    getLanguageVersionByFilePath(filePath: string): string {
        const path = toUnixPath(filePath);
        for (const apiPath of FileManager.staticApiPath) {
            if (path.startsWith(apiPath)) {
                return LANGUAGE_VERSION.ARKTS_1_2;
            }
        }
        for (const apiPath of FileManager.dynamicApiPath) {
            if (path.startsWith(apiPath)) {
                return LANGUAGE_VERSION.ARKTS_1_1;
            }
        }
        if (FileManager.buildConfig.compileFiles?.includes(filePath)) {
            return LANGUAGE_VERSION.ARKTS_1_2;
        }
        for (const [pkgName, moduleInfo] of FileManager.arkTSModuleMap) {
            if (!path.startsWith(moduleInfo.modulePath)) {
                continue;
            }
            if (moduleInfo.language !== LANGUAGE_VERSION.ARKTS_HYBRID) {
                return moduleInfo.language;
            }
            /**
             * when process hybrid hsp or har we can't get info of 1.1,
             * only by module decl-fileinfo.json or `'use static'`
             */
            if (FileManager.isFirstLineUseStatic(filePath)) {
                return LANGUAGE_VERSION.ARKTS_1_2;
            }
        }
        return LANGUAGE_VERSION.ARKTS_1_1;
    }
}