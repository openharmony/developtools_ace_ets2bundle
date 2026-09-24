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

import * as arkts from '@koalaui/libarkts';
import { PluginContext, Plugins } from '../common/plugin-context';
import { getConsistentResourceMap, getMainPages, getUIComponents } from '../common/arkts-utils';
import { Debugger, debugLog } from '../common/debug';
import { Collector } from '../collectors/collector';
import { ProgramVisitor } from '../common/program-visitor';
import { EXTERNAL_SOURCE_PREFIX_NAMES, NodeCacheNames } from '../common/predefines';
import { ProgramSkipper } from '../common/program-skipper';
import { MetaDataCollector } from '../common/metadata-collector';
import { NodeCacheFactory } from '../common/node-cache';

export function uiSyntaxLinterTransform(): Plugins {
    return {
        name: 'ui-syntax-plugin',
        checked: collectAndLint,
        clean(): void {
            ProgramSkipper.clear();
            NodeCacheFactory.getInstance().clear();
        },
    };
}

function collectAndLint(this: PluginContext): arkts.ETSModule | undefined {
    Debugger.getInstance().phasesDebugLog('[UI LINTER PLUGIN] AFTER CHECKED ENTER');
    const contextPtr = this.getContextPtr() ?? arkts.arktsGlobal.compilerContext?.peer;
    const isCoding = this.isCoding?.() ?? false;
    if (!!contextPtr) {
        let program = arkts.getOrUpdateGlobalContext(contextPtr).program;
        let script = program.ast as arkts.ETSModule;
        debugLog('[BEFORE LINTER SCRIPT] script: ', script);
        arkts.Performance.getInstance().createEvent('ui-linter');
        program = checkedProgramVisit(program, this, isCoding);
        script = program.ast as arkts.ETSModule;
        arkts.Performance.getInstance().stopEvent('ui-linter', true);
        debugLog('[AFTER LINTER SCRIPT] script: ', script);
        this.setArkTSAst(script);
        arkts.Performance.getInstance().logDetailedEventInfos(true);
        Debugger.getInstance().phasesDebugLog('[UI LINTER PLUGIN] AFTER CHECKED EXIT');
        return script;
    }
    Debugger.getInstance().phasesDebugLog('[UI LINTER PLUGIN] AFTER CHECKED EXIT WITH NO TRANSFORM');
    return undefined;
}

function checkedProgramVisit(
    program: arkts.Program,
    context: PluginContext,
    isCoding: boolean = false
): arkts.Program {
    if (isCoding) {
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).shouldCollect(false);
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).shouldCollect(false);
    } else {
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).shouldCollectUpdate(true);
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).shouldCollectUpdate(true);
    }
    const projectConfig = context.getProjectConfig();
    arkts.Performance.getInstance().createDetailedEvent('[UI LINTER PLUGIN] MetadataCollector init');
    MetaDataCollector.getInstance()
        .setProjectConfig(projectConfig)
        .setComponentsInfo(getUIComponents(projectConfig, isCoding))
        .setConsistentResourceMap(getConsistentResourceMap())
        .setMainPages(getMainPages(projectConfig));
    arkts.Performance.getInstance().stopDetailedEvent('[UI LINTER PLUGIN] MetadataCollector init');
    const collector = new Collector({
        shouldCollectUI: true,
        shouldCollectMemo: true,
        shouldCheckUISyntax: true
    });
    const programVisitor = new ProgramVisitor({
        pluginName: uiSyntaxLinterTransform.name,
        state: arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED,
        visitors: [collector],
        skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES,
        pluginContext: context,
        shouldVisitExternal: !isCoding,
    });
    program = programVisitor.programVisitor(program);
    MetaDataCollector.getInstance()
        .setComponentsInfo(undefined)
        .setConsistentResourceMap(undefined)
        .setMainPages(undefined);
    if (!isCoding) {
        NodeCacheFactory.getInstance().perfLog(NodeCacheNames.UI, true);
        NodeCacheFactory.getInstance().perfLog(NodeCacheNames.MEMO, true);
    }
    return program;
}
