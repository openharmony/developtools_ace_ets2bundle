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
import { PluginContext, Plugins } from '../../../common/plugin-context';
import { ProgramVisitor } from '../../../common/program-visitor';
import { EXTERNAL_SOURCE_PREFIX_NAMES, NodeCacheNames } from '../../../common/predefines';
import { Collector } from '../../../collectors/collector';

/**
 * AfterCheck cache any node that should be ui-transformed or unmemoized with no recheck AST.
 */
export const collectNoRecheck: Plugins = {
    name: 'collect-no-recheck',
    checked(this: PluginContext): arkts.EtsScript | undefined {
        let script: arkts.EtsScript | undefined;
        const contextPtr = this.getContextPtr() ?? arkts.arktsGlobal.compilerContext?.peer;
        if ((global.MEMO_CACHE_ENABLED || global.UI_CACHE_ENABLED) && !!contextPtr) {
            let program = arkts.getOrUpdateGlobalContext(contextPtr).program;
            script = program.astNode;
            arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).shouldCollectUpdate(global.UI_UPDATE_ENABLED);
            arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).shouldCollectUpdate(global.MEMO_UPDATE_ENABLED);
            const collector = new Collector({
                shouldCollectUI: global.UI_CACHE_ENABLED,
                shouldCollectMemo: global.MEMO_CACHE_ENABLED,
            });
            const programVisitor = new ProgramVisitor({
                pluginName: collectNoRecheck.name,
                state: arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED,
                visitors: [collector],
                skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES,
                pluginContext: this,
            });
            program = programVisitor.programVisitor(program);
            script = program.astNode;
            return script;
        }
        return script;
    },
};