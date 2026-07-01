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
import { initResourceInfo, initRouterInfo, loadBuildJson, PluginContext, Plugins } from '../../../common/plugin-context';
import { ProgramVisitor } from '../../../common/program-visitor';
import { EXTERNAL_SOURCE_PREFIX_NAMES, NodeCacheNames } from '../../../common/predefines';
import { CheckedTransformer } from '../../../ui-plugins/checked-transformer';
import { Collector } from '../../../collectors/collector';
import { MetaDataCollector } from '../../../common/metadata-collector';
import { ImportCollector } from '../../../common/import-collector';
import { DeclarationCollector } from '../../../common/declaration-collector';
import { LogCollector } from '../../../common/log-collector';
import { NodeCacheFactory } from '../../../common/node-cache';

/**
 * AfterCheck uiTransform with no recheck AST.
 */
export const uiNoRecheck: Plugins = {
    name: 'ui-no-recheck',
    checked(this: PluginContext): arkts.ETSModule | undefined {
        let script: arkts.ETSModule | undefined;
        const contextPtr = this.getContextPtr() ?? arkts.arktsGlobal.compilerContext?.peer;
        if (!!contextPtr) {
            let program = arkts.getOrUpdateGlobalContext(contextPtr).program;
            script = program.ast as arkts.ETSModule;
            const projectConfig = this.getProjectConfig();
            const aceBuildJson = loadBuildJson(projectConfig);
            const resourceInfo = initResourceInfo(projectConfig, aceBuildJson, global.RESOURCE_PATH);
            MetaDataCollector.getInstance()
                .setProjectConfig(projectConfig)
                .setRouterInfo(initRouterInfo(aceBuildJson))
                .setResourceInfo(resourceInfo)
                .setShouldHandleInsightIntent(false);
            const checkedTransformer = new CheckedTransformer({
                useCache: NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).isCollected(),
            });
            const programVisitor = new ProgramVisitor({
                pluginName: uiNoRecheck.name,
                state: arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED,
                visitors: [checkedTransformer],
                skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES,
                pluginContext: this,
            });
            NodeCacheFactory.currentCacheKey = NodeCacheNames.MEMO;
            program = programVisitor.programVisitor(program);
            NodeCacheFactory.currentCacheKey = undefined;
            script = program.ast as arkts.ETSModule;
            MetaDataCollector.getInstance().reset();
            ImportCollector.getInstance().reset();
            DeclarationCollector.getInstance().reset();
            LogCollector.getInstance().reset();
            NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).clear();
            return script;
        }
        return script;
    },
};
