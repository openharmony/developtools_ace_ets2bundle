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
import { CompileFileInfo } from './artkts-config';
import * as arkts from '@koalaui/libarkts';

function initGlobal(fileInfo: CompileFileInfo, isDebug: boolean = true): void {
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

    arkts.arktsGlobal.filePath = fileInfo.filePath;
    resetConfig(config);

    const source: string = fs.readFileSync(fileInfo.filePath).toString();
    resetContext(source);
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

function resetConfig(cmd: string[]): void {
    try {
        arkts.arktsGlobal.config;
        destroyConfig();
    } catch (e) {
        // Do nothing
    } finally {
        const arkTSConfig: arkts.Config = arkts.Config.create(cmd);
        arkts.arktsGlobal.config = arkTSConfig.peer;
    }
}

function destroyContext(): void {
    try {
        arkts.arktsGlobal.clearContext();
    } catch (e) {
        // Do nothing
    }
}

function destroyConfig(): void {
    try {
        arkts.destroyConfig(arkts.arktsGlobal.config);
    } catch (e) {
        // Do nothing
    }
}

function canProceedToState(state: arkts.Es2pandaContextState): boolean {
    const stateToSkip: arkts.Es2pandaContextState[] = [
        arkts.Es2pandaContextState.ES2PANDA_STATE_SCOPE_INITED,
        arkts.Es2pandaContextState.ES2PANDA_STATE_BOUND,
        arkts.Es2pandaContextState.ES2PANDA_STATE_LOWERED,
        arkts.Es2pandaContextState.ES2PANDA_STATE_ASM_GENERATED,
        arkts.Es2pandaContextState.ES2PANDA_STATE_ERROR,
    ];
    if (state in stateToSkip) {
        return false;
    }

    const currState = arkts.arktsGlobal.es2panda._ContextState(arkts.arktsGlobal.context);
    return currState < state;
}

export { initGlobal, resetContext, resetConfig, destroyContext, destroyConfig, canProceedToState };
