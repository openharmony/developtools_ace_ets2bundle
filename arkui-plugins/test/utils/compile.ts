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

import { PluginDriver } from './plugin-driver';
import { PluginContext, PluginExecutor } from '../../common/plugin-context';
import { EtsglobalRemover } from '../../common/etsglobal-remover';
import * as arkts from '@koalaui/libarkts';

function restartCompilerUptoState(state: arkts.Es2pandaContextState, restart: boolean): boolean {
    try {
        const ast: arkts.EtsScript | undefined = arkts.EtsScript.fromContext();
        if (!ast) {
            return false;
        }

        if (restart) {
            const srcText = new EtsglobalRemover().visitor(ast).dumpSrc();
            arkts.arktsGlobal.es2panda._DestroyContext(arkts.arktsGlobal.context);
            arkts.arktsGlobal.compilerContext = arkts.Context.createFromString(srcText);
        }

        arkts.proceedToState(state);
        return true;
    } catch (e) {
        return false;
    }
}

function insertPlugin(
    driver: PluginDriver,
    plugin: PluginExecutor | undefined,
    state: arkts.Es2pandaContextState
): boolean {
    arkts.proceedToState(state);
    const pluginContext: PluginContext = driver.getPluginContext();
    const ast: arkts.EtsScript | undefined = arkts.EtsScript.fromContext();

    if (!ast) {
        return false;
    }

    if (plugin) {
        plugin.handler.apply(pluginContext);
    }
    return true;
}

export { restartCompilerUptoState, insertPlugin };
