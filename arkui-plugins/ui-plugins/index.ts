/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
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

import * as path from 'path';
import * as arkts from '@koalaui/libarkts';
import { ComponentTransformer } from './component-transformer';
import { CheckedTransformer } from './checked-transformer';
import { Plugins, PluginContext, ProjectConfig, loadBuildJson, initResourceInfo, initRouterInfo } from '../common/plugin-context';
import { ProgramVisitor } from '../common/program-visitor';
import { EXTERNAL_SOURCE_PREFIX_NAMES, NodeCacheNames } from '../common/predefines';
import { debugLog, getDumpFileName } from '../common/debug';
import { ProgramSkipper } from '../common/program-skipper';
import { MetaDataCollector } from '../common/metadata-collector';
import { GenSymGenerator } from '../common/gensym-generator';
import { InsightIntentCollector } from './insight-intent/insight-intent-collector';
import { ImportCollector } from '../common/import-collector';
import { DeclarationCollector } from '../common/declaration-collector';
import { LogCollector } from '../common/log-collector';
import { AbstractVisitor } from '../common/abstract-visitor';
import { Collector } from '../collectors/collector';
import { getSystemResourcePath } from './utils';
import { ResourceSourceCache } from './insight-intent/resource-source-cache';

export function uiTransform(): Plugins {
    return {
        name: 'ui-plugin',
        parsed: parsedTransform,
        checked: checkedTransform,
        clean() {
            ProgramSkipper.clear();
            GenSymGenerator.clear();
            InsightIntentCollector.getInstance().clear();
            arkts.NodeCacheFactory.getInstance().clear();
        },
    };
}

function parsedTransform(this: PluginContext): arkts.EtsScript | undefined {
    let script: arkts.EtsScript | undefined;
    arkts.Debugger.getInstance().phasesDebugLog('[UI PLUGIN] AFTER PARSED ENTER');
    arkts.Performance.getInstance().memoryTrackerPrintCurrent('ArkTS:Parse');
    arkts.Performance.getInstance().memoryTrackerReset();
    arkts.Performance.getInstance().startMemRecord('Node:UIPlugin:AfterParse');
    const contextPtr = this.getContextPtr() ?? arkts.arktsGlobal.compilerContext?.peer;
    if (!!contextPtr) {
        let program = arkts.getOrUpdateGlobalContext(contextPtr, true).program;
        script = program.astNode;
        debugLog('[BEFORE PARSED SCRIPT] script: ', script.dumpSrc());
        arkts.Performance.getInstance().createEvent('ui-parsed');
        program = parsedProgramVisit(program, this);
        script = program.astNode;
        arkts.Performance.getInstance().stopEvent('ui-parsed', true);
        debugLog('[AFTER PARSED SCRIPT] script: ', script.dumpSrc());
        this.setArkTSAst(script);
        arkts.Performance.getInstance().memoryTrackerGetDelta('UIPlugin:AfterParse');
        arkts.Performance.getInstance().memoryTrackerReset();
        arkts.Performance.getInstance().stopMemRecord('Node:UIPlugin:AfterParse');
        arkts.Debugger.getInstance().phasesDebugLog('[UI PLUGIN] AFTER PARSED EXIT');
        return script;
    }
    arkts.Debugger.getInstance().phasesDebugLog('[UI PLUGIN] AFTER PARSED EXIT WITH NO TRANSFORM');
    return script;
}

function parsedProgramVisit(
    program: arkts.Program,
    context: PluginContext,
    canSkipPhases: boolean = false
): arkts.Program {
    if (canSkipPhases) {
        debugLog('[SKIP PHASE] phase: ui-parsed, moduleName: ', program.moduleName);
    } else {
        debugLog('[CANT SKIP PHASE] phase: ui-parsed, moduleName: ', program.moduleName);
        const projectConfig = context.getProjectConfig();
        const aceBuildJson = loadBuildJson(projectConfig);
        const resourceInfo = initResourceInfo(projectConfig, aceBuildJson, getSystemResourcePath());
        MetaDataCollector.getInstance()
            .setProjectConfig(projectConfig)
            .setRouterInfo(initRouterInfo(aceBuildJson))
            .setResourceInfo(resourceInfo);
        const componentTransformer = new ComponentTransformer();
        const programVisitor = new ProgramVisitor({
            pluginName: uiTransform.name,
            state: arkts.Es2pandaContextState.ES2PANDA_STATE_PARSED,
            visitors: [componentTransformer],
            skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES,
            pluginContext: context,
        });
        program = programVisitor.programVisitor(program);
        MetaDataCollector.getInstance().reset();
    }
    return program;
}

function checkedTransform(this: PluginContext): arkts.EtsScript | undefined {
    let script: arkts.EtsScript | undefined;
    arkts.Debugger.getInstance().phasesDebugLog('[UI PLUGIN] AFTER CHECKED ENTER');
    arkts.Performance.getInstance().memoryTrackerPrintCurrent('ArkTS:Check');
    arkts.Performance.getInstance().memoryTrackerGetDelta('ArkTS:Check');
    arkts.Performance.getInstance().memoryTrackerReset();
    arkts.Performance.getInstance().startMemRecord('Node:UIPlugin:UI-AfterCheck');
    const contextPtr = this.getContextPtr() ?? arkts.arktsGlobal.compilerContext?.peer;
    const isCoding = this.isCoding?.() ?? false;
    if (!isCoding && !!contextPtr) {
        let program = arkts.getOrUpdateGlobalContext(contextPtr, true).program;
        script = program.astNode;
        const cachePath: string | undefined = this.getProjectConfig()?.cachePath;
        debugLog('[BEFORE STRUCT SCRIPT] script: ', script.dumpSrc());
        arkts.Performance.getInstance().createEvent('ui-checked');
        program = checkedProgramVisit(program, this);
        script = program.astNode;
        arkts.Performance.getInstance().stopEvent('ui-checked', true);
        debugLog('[AFTER STRUCT SCRIPT] script: ', script.dumpSrc());
        this.setArkTSAst(script);
        arkts.Performance.getInstance().memoryTrackerGetDelta('UIPlugin:UI-AfterCheck');
        arkts.Performance.getInstance().stopMemRecord('Node:UIPlugin:UI-AfterCheck');
        // 多文件编译时，每次都会更新文件，最后一次包含所有数据
        InsightIntentCollector.getInstance().tryWriteFromContext(this);
        arkts.Debugger.getInstance().phasesDebugLog('[UI PLUGIN] AFTER CHECKED EXIT');
        return script;
    }
    arkts.Debugger.getInstance().phasesDebugLog('[UI PLUGIN] AFTER CHECKED EXIT WITH NO TRANSFORM');
    return script;
}

function checkedProgramVisit(
    program: arkts.Program,
    context: PluginContext,
    canSkipPhases: boolean = false
): arkts.Program {
    if (canSkipPhases) {
        debugLog('[SKIP PHASE] phase: ui-checked, moduleName: ', program.moduleName);
    } else {
        debugLog('[CANT SKIP PHASE] phase: ui-checked, moduleName: ', program.moduleName);
        arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).shouldCollect(false);
        const projectConfig: ProjectConfig | undefined = context.getProjectConfig();
        if (projectConfig && !projectConfig.appResource) {
            projectConfig.ignoreError = true;
        }
        const aceBuildJson = loadBuildJson(projectConfig);
        const resourceInfo = initResourceInfo(projectConfig, aceBuildJson, getSystemResourcePath());
        MetaDataCollector.getInstance()
            .setProjectConfig(projectConfig)
            .setRouterInfo(initRouterInfo(aceBuildJson))
            .setResourceInfo(resourceInfo)
            .setShouldHandleInsightIntent(true);
        const visitors: AbstractVisitor[] = [];
        if (!arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).isCollected()) {
            arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).shouldCollect(true);
            arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).shouldCollect(true);
            arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).shouldCollectUpdate(true);
            arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).shouldCollectUpdate(true);
            const collector = new Collector({
                shouldCollectUI: true,
                shouldCollectMemo: true,
                shouldCheckUISyntax: false
            });
            visitors.push(collector);
        }
        const checkedTransformer = new CheckedTransformer({ useCache: true });
        visitors.push(checkedTransformer);
        const programVisitor = new ProgramVisitor({
            pluginName: uiTransform.name,
            state: arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED,
            visitors,
            skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES,
            pluginContext: context,
        });
        program = programVisitor.programVisitor(program);
        ResourceSourceCache.getInstance().clear();
        MetaDataCollector.getInstance().reset();
        ImportCollector.getInstance().reset();
        DeclarationCollector.getInstance().reset();
        LogCollector.getInstance().reset();
        arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).clear();
    }
    return program;
}
