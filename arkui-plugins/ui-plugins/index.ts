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
import { PreprocessorTransformer } from './preprocessor-transform';
import { CheckedTransformer } from './checked-transformer';
import { Plugins, PluginContext, ProjectConfig } from '../common/plugin-context';
import { ProgramVisitor } from '../common/program-visitor';
import { EXTERNAL_SOURCE_PREFIX_NAMES } from '../common/predefines';
import { debugDump, debugLog, getDumpFileName } from '../common/debug';

export function uiTransform(): Plugins {
    return {
        name: 'ui-plugin',
        parsed: parsedTransform,
        checked: checkedTransform,
        clean() {
            arkts.arktsGlobal.clearContext();
        },
    };
}

function parsedTransform(this: PluginContext): arkts.EtsScript | undefined {
    let script: arkts.EtsScript | undefined;
    console.log('[UI PLUGIN] AFTER PARSED ENTER');
    const contextPtr = arkts.arktsGlobal.compilerContext?.peer ?? this.getContextPtr();
    if (!!contextPtr) {
        let program = arkts.getOrUpdateGlobalContext(contextPtr).program;
        script = program.astNode;
        const cachePath: string | undefined = this.getProjectConfig()?.cachePath;
        debugLog('[BEFORE PARSED SCRIPT] script: ', script.dumpSrc());
        debugDump(
            script.dumpSrc(),
            getDumpFileName(0, 'SRC', 1, 'UI_AfterParse_Begin'),
            true,
            cachePath,
            program.programFileNameWithExtension
        );
        arkts.Performance.getInstance().createEvent('ui-parsed');
        program = parsedProgramVisit(program, this);
        script = program.astNode;
        arkts.Performance.getInstance().stopEvent('ui-parsed', true);
        debugLog('[AFTER PARSED SCRIPT] script: ', script.dumpSrc());
        debugDump(
            script.dumpSrc(),
            getDumpFileName(0, 'SRC', 2, 'UI_AfterParse_End'),
            true,
            cachePath,
            program.programFileNameWithExtension
        );
        this.setArkTSAst(script);
        console.log('[UI PLUGIN] AFTER PARSED EXIT');
        return script;
    }
    console.log('[UI PLUGIN] AFTER PARSED EXIT WITH NO TRANSFORM');
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
        const componentTransformer = new ComponentTransformer();
        const preprocessorTransformer = new PreprocessorTransformer();
        const programVisitor = new ProgramVisitor({
            pluginName: uiTransform.name,
            state: arkts.Es2pandaContextState.ES2PANDA_STATE_PARSED,
            visitors: [componentTransformer, preprocessorTransformer],
            skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES,
            pluginContext: context,
        });
        program = programVisitor.programVisitor(program);
    }
    return program;
}

function checkedTransform(this: PluginContext): arkts.EtsScript | undefined {
    let script: arkts.EtsScript | undefined;
    console.log('[UI PLUGIN] AFTER CHECKED ENTER');
    const contextPtr = arkts.arktsGlobal.compilerContext?.peer ?? this.getContextPtr();
    if (!!contextPtr) {
        let program = arkts.getOrUpdateGlobalContext(contextPtr).program;
        script = program.astNode;
        const cachePath: string | undefined = this.getProjectConfig()?.cachePath;
        debugLog('[BEFORE STRUCT SCRIPT] script: ', script.dumpSrc());
        debugDump(
            script.dumpSrc(),
            getDumpFileName(0, 'SRC', 3, 'UI_AfterCheck_Begin'),
            true,
            cachePath,
            program.programFileNameWithExtension
        );
        arkts.Performance.getInstance().createEvent('ui-checked');
        program = checkedProgramVisit(program, this);
        script = program.astNode;
        arkts.Performance.getInstance().stopEvent('ui-checked', true);
        debugLog('[AFTER STRUCT SCRIPT] script: ', script.dumpSrc());
        debugDump(
            script.dumpSrc(),
            getDumpFileName(0, 'SRC', 4, 'UI_AfterCheck_End'),
            true,
            cachePath,
            program.programFileNameWithExtension
        );
        arkts.GlobalInfo.getInfoInstance().reset();
        arkts.Performance.getInstance().createEvent('ui-recheck');
        arkts.recheckSubtree(script);
        arkts.Performance.getInstance().stopEvent('ui-recheck', true);
        arkts.Performance.getInstance().clearAllEvents();
        this.setArkTSAst(script);
        console.log('[UI PLUGIN] AFTER CHECKED EXIT');
        return script;
    }
    console.log('[UI PLUGIN] AFTER CHECKED EXIT WITH NO TRANSFORM');
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
        const checkedTransformer = new CheckedTransformer(projectConfig);
        const programVisitor = new ProgramVisitor({
            pluginName: uiTransform.name,
            state: arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED,
            visitors: [checkedTransformer],
            skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES,
            pluginContext: context,
        });
        program = programVisitor.programVisitor(program);
    }
    return program;
}