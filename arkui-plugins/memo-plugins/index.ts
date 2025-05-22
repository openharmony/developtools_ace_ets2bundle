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
import { Plugins, PluginContext } from '../common/plugin-context';
import { FunctionTransformer } from './function-transformer';
import { PositionalIdTracker } from './utils';
import { ReturnTransformer } from './return-transformer';
import { ParameterTransformer } from './parameter-transformer';
import { ProgramVisitor } from '../common/program-visitor';
import { EXTERNAL_SOURCE_PREFIX_NAMES } from '../common/predefines';
import { debugDump, debugLog, getDumpFileName } from '../common/debug';
import { SignatureTransformer } from './signature-transformer';

export function unmemoizeTransform(): Plugins {
    return {
        name: 'memo-plugin',
        checked: checkedTransform,
        clean() {
            arkts.arktsGlobal.clearContext();
        },
    };
}

function checkedTransform(this: PluginContext): arkts.EtsScript | undefined {
    console.log('[MEMO PLUGIN] AFTER CHECKED ENTER');
    const contextPtr = this.getContextPtr() ?? arkts.arktsGlobal.compilerContext?.peer;
    if (!!contextPtr) {
        let program = arkts.getOrUpdateGlobalContext(contextPtr).program;
        let script = program.astNode;
        debugLog('[BEFORE MEMO SCRIPT] script: ', script.dumpSrc());
        const cachePath: string | undefined = this.getProjectConfig()?.cachePath;
        debugDump(
            script.dumpSrc(),
            getDumpFileName(0, 'SRC', 5, 'MEMO_AfterCheck_Begin'),
            true,
            cachePath,
            program.fileNameWithExtension
        );
        arkts.Performance.getInstance().createEvent('memo-checked');
        program = checkedProgramVisit(program, this);
        script = program.astNode;
        arkts.Performance.getInstance().stopEvent('memo-checked', false);
        debugLog('[AFTER MEMO SCRIPT] script: ', script.dumpSrc());
        debugDump(
            script.dumpSrc(),
            getDumpFileName(0, 'SRC', 6, 'MEMO_AfterCheck_End'),
            true,
            cachePath,
            program.fileNameWithExtension
        );
        arkts.Performance.getInstance().createEvent('memo-recheck');
        arkts.recheckSubtree(script);
        arkts.Performance.getInstance().stopEvent('memo-recheck', false);
        arkts.Performance.getInstance().clearAllEvents(false);
        arkts.Performance.getInstance().visualizeEvents(true);
        arkts.Performance.getInstance().clearHistory();
        arkts.Performance.getInstance().clearTotalDuration();
        this.setArkTSAst(script);
        console.log('[MEMO PLUGIN] AFTER CHECKED EXIT');
        return script;
    }
    console.log('[MEMO PLUGIN] AFTER CHECKED EXIT WITH NO TRANSFORM');
    return undefined;
}

function checkedProgramVisit(program: arkts.Program, context: PluginContext): arkts.Program {
    if (program.canSkipPhases()) {
        debugLog('[SKIP PHASE] phase: memo-checked, moduleName: ', program.moduleName);
    } else {
        debugLog('[CANT SKIP PHASE] phase: memo-checked, moduleName: ', program.moduleName);
        const positionalIdTracker = new PositionalIdTracker(arkts.getFileName(), false);
        const parameterTransformer = new ParameterTransformer({ positionalIdTracker });
        const returnTransformer = new ReturnTransformer();
        const signatureTransformer = new SignatureTransformer();
        const functionTransformer = new FunctionTransformer({
            positionalIdTracker,
            parameterTransformer,
            returnTransformer,
            signatureTransformer,
        });
        const programVisitor = new ProgramVisitor({
            pluginName: unmemoizeTransform.name,
            state: arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED,
            visitors: [functionTransformer],
            skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES,
            pluginContext: context,
        });
        program = programVisitor.programVisitor(program);
    }
    return program;
}
