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

import fs from 'fs'
import * as arkts from '@koalaui/libarkts';
import { CompileFileInfo } from './shared-types';

function createGlobalConfig(
    fileInfo: CompileFileInfo,
    isDebug: boolean = true,
    isUseCache: boolean = true
): arkts.Config {
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
    if (!isUseCache) {
        config.push('--simultaneous');
    }
    config.push(fileInfo.filePath);

    if (isUseCache) {
        arkts.memInitialize();
    }
    arkts.arktsGlobal.filePath = fileInfo.filePath;
    return resetConfig(config);
}

function destroyGlobalConfig(config: arkts.Config, isUseCache: boolean = true): void {
    destroyConfig(config.peer);
    if (isUseCache) {
        arkts.memFinalize();
    }
}

function createGlobalContextPtr(config: arkts.Config, files: string[]): arkts.KNativePointer {
    return arkts.arktsGlobal.es2panda._CreateGlobalContext(config.peer, files, files.length, false);
}

function destroyGlobalContextPtr(globalContextPtr: arkts.KNativePointer): void {
    arkts.arktsGlobal.es2panda._DestroyGlobalContext(globalContextPtr);
}

function createCacheContextFromFile(
    config: arkts.Config,
    filePath: string,
    globalContextPtr: arkts.KNativePointer,
    isExternal: boolean
): arkts.Context {
    return arkts.Context.createCacheContextFromFile(config.peer, filePath, globalContextPtr, isExternal);
}

function createContextGenerateAbcForExternalSourceFiles(filePaths: string[]): arkts.Context {
    return arkts.Context.createContextGenerateAbcForExternalSourceFiles(filePaths);
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

function destroyConfig(config: arkts.KNativePointer): void {
    try {
        arkts.arktsGlobal.es2panda._DestroyConfig(config);
        arkts.arktsGlobal.resetConfig();
    } catch (e) {
        // Do nothing
    }
}

function initializeLibarkts(pandaSdkPath: string): void {
    arkts.arktsGlobal.es2panda._SetUpSoPath(pandaSdkPath);
    arkts.initVisitsTable();
}

export type TestGlobal = typeof globalThis & {
    PANDA_SDK_PATH: string;
    API_PATH: string;
    KIT_PATH: string;
    UI_CACHE_ENABLED: boolean;
    UI_UPDATE_ENABLED: boolean;
    MEMO_CACHE_ENABLED: boolean;
    MEMO_UPDATE_ENABLED: boolean;
};

export {
    createGlobalConfig,
    destroyGlobalConfig,
    createGlobalContextPtr,
    destroyGlobalContextPtr,
    createCacheContextFromFile,
    createContextGenerateAbcForExternalSourceFiles,
    resetContext,
    resetConfig,
    destroyContext,
    destroyConfig,
    initializeLibarkts,
};
