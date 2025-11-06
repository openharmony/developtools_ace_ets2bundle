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

import * as arkts from '@koalaui/libarkts';
import { ComponentTransformer } from './component-transformer';
import { CheckedTransformer } from './checked-transformer';
import { Plugins, PluginContext, ProjectConfig } from '../common/plugin-context';
import { ProgramVisitor } from '../common/program-visitor';
import { EXTERNAL_SOURCE_PREFIX_NAMES } from '../common/predefines';
import { debugLog, getDumpFileName } from '../common/debug';
import { ProgramSkipper } from '../common/program-skipper';
import { MetaDataCollector } from '../common/metadata-collector';

export function uiTransform(): Plugins {
    return {
        name: 'ui-plugin',
        parsed: parsedTransform,
        checked: checkedTransform,
        clean() {
            ProgramSkipper.clear();
            arkts.arktsGlobal.clearContext();
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
        let program = arkts.getOrUpdateGlobalContext(contextPtr).program;
        script = program.astNode;
        const canSkipPhases = program.canSkipPhases();
        debugLog('[BEFORE PARSED SCRIPT] script: ', script.dumpSrc());
        arkts.Performance.getInstance().createEvent('ui-parsed');
        program = parsedProgramVisit(program, this, canSkipPhases);
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
        const componentTransformer = new ComponentTransformer({
            projectConfig: context.getProjectConfig(),
        });
        const programVisitor = new ProgramVisitor({
            pluginName: uiTransform.name,
            state: arkts.Es2pandaContextState.ES2PANDA_STATE_PARSED,
            visitors: [componentTransformer],
            skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES,
            pluginContext: context,
        });
        program = programVisitor.programVisitor(program);
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
    if (!!contextPtr) {
        let program = arkts.getOrUpdateGlobalContext(contextPtr).program;
        script = program.astNode;
        const cachePath: string | undefined = this.getProjectConfig()?.cachePath;
        const canSkipPhases = program.canSkipPhases();
        debugLog('[BEFORE STRUCT SCRIPT] script: ', script.dumpSrc());
        arkts.Performance.getInstance().createEvent('ui-checked');
        program = checkedProgramVisit(program, this, canSkipPhases);
        script = program.astNode;
        arkts.Performance.getInstance().stopEvent('ui-checked', true);
        debugLog('[AFTER STRUCT SCRIPT] script: ', script.dumpSrc());
        this.setArkTSAst(script);
        arkts.Performance.getInstance().memoryTrackerGetDelta('UIPlugin:UI-AfterCheck');
        arkts.Performance.getInstance().stopMemRecord('Node:UIPlugin:UI-AfterCheck');
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
        const projectConfig: ProjectConfig | undefined = context.getProjectConfig();
        if (projectConfig && !projectConfig.appResource) {
            projectConfig.ignoreError = true;
        }
        const checkedTransformer = new CheckedTransformer(projectConfig);
        const programVisitor = new ProgramVisitor({
            pluginName: uiTransform.name,
            state: arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED,
            visitors: [checkedTransformer],
            skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES,
            pluginContext: context,
        });
        program = programVisitor.programVisitor(program);
        MetaDataCollector.getInstance().reset();
    }
    return program;
}
