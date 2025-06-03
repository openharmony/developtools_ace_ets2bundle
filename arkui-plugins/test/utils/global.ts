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

import * as arkts from '@koalaui/libarkts';
import { CompileFileInfo } from './shared-types';

function createGlobalConfig(fileInfo: CompileFileInfo, isDebug: boolean = true): arkts.Config {
    const config = [
        '_',
        '--extension',
        'ets',
        '--arktsconfig',
        fileInfo.arktsConfigFile,
        '--output',
        fileInfo.abcFilePath,
    ];

    if (isDebug) {
        config.push('--debug-info');
    }
    config.push(fileInfo.filePath);

    arkts.MemInitialize();
    arkts.arktsGlobal.filePath = fileInfo.filePath;
    return resetConfig(config);
}

function destroyGlobalConfig(config: arkts.Config): void {
    destroyConfig(config);
    arkts.MemFinalize();
}

function createGlobalContextPtr(config: arkts.Config, files: string[]): number {
    return arkts.CreateGlobalContext(config.peer, files, files.length, false);
}

function destroyGlobalContextPtr(globalContextPtr: number): void {
    arkts.DestroyGlobalContext(globalContextPtr);
}

function createCacheContextFromFile(
    config: arkts.Config,
    filePath: string,
    globalContextPtr: number,
    isExternal: boolean
): arkts.Context {
    return arkts.Context.createCacheContextFromFile(config.peer, filePath, globalContextPtr, isExternal);
}

function resetContext(source: string): void {
    try {
        arkts.arktsGlobal.context;
    } catch (e) {
        // Do nothing
    } finally {
        const context: arkts.Context = arkts.Context.createFromString(source);
        arkts.arktsGlobal.compilerContext = context;
    }
}

function resetConfig(cmd: string[]): arkts.Config {
    try {
        arkts.arktsGlobal.config;
        destroyConfig(arkts.arktsGlobal.config);
    } catch (e) {
        // Do nothing
    } finally {
        const config = arkts.Config.create(cmd);
        arkts.arktsGlobal.config = config.peer;
        return config;
    }
}

function destroyContext(context: arkts.Context): void {
    try {
        arkts.arktsGlobal.es2panda._DestroyContext(context.peer);
    } catch (e) {
        // Do nothing
    }
}

function destroyConfig(config: arkts.Config): void {
    try {
        arkts.destroyConfig(config);
    } catch (e) {
        // Do nothing
    }
}

export {
    createGlobalConfig,
    destroyGlobalConfig,
    createGlobalContextPtr,
    destroyGlobalContextPtr,
    createCacheContextFromFile,
    resetContext,
    resetConfig,
    destroyContext,
    destroyConfig,
};
