/*
 * Copyright (c) 2022-2026 Huawei Device Co., Ltd.
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
import { 
    fillMemoPluginOptionsWithDefaultValues,
    globalMemoPluginContextFromContext,
    MEMO_PLUGIN_CONTEXT_PARAMETER_NAME,
    MEMO_PLUGIN_OPTIONS_PARAMETER_NAME,
    memoPluginOptionsFromContext,
    registerGlobalMemoPluginContext,
    registerMemoPluginOptions
} from './common';
import { parsedTransformer } from './parsed/ParsedTransformer';
import { checkedAnalysisPropagationVisitor } from './analysis/AnalysisPropagationVisitor';
import { checkedAnalysis } from './analysis/Analysis';
import { checkedPostAnalysis } from './analysis/PostAnalysis';
import { checkedRewriteTransformer } from './transform/MemoTransformer';
import { checkedDiagnostics } from './diagnostics/DiagnosticVisitor';

const name = "memo"

export function initPlugin(context: arkts.PluginContextImpl) {
    const projectConfig = context.getProjectConfig()
    if (projectConfig) {
        context.setParameter(MEMO_PLUGIN_OPTIONS_PARAMETER_NAME, context.getProjectConfig()?.memoPluginOptions)
    }

    registerMemoPluginOptions(context);
    fillMemoPluginOptionsWithDefaultValues(context);
    registerGlobalMemoPluginContext(context);
    const isFrameworkMode = !!context.getProjectConfig()?.frameworkMode;
    memoPluginOptionsFromContext(context).frameworkMode = isFrameworkMode;

    // console.log(memoPluginOptionsFromContext(context))
}

export function parsedTransform(context: arkts.PluginContext) {
    const options = memoPluginOptionsFromContext(context);
    if (options.skipParsed) {
        return;
    }
    const program = arkts.global.compilerContext!.program;
    const state = arkts.Es2pandaContextState.ES2PANDA_STATE_PARSED;
    arkts.debugDump(context.getProjectConfig()?.cachePath, state, name, false, program);
    arkts.runTransformer(program, state, parsedTransformer(), context, false);
    arkts.debugDump(context.getProjectConfig()?.cachePath, state, name, true, program);
}

export function checkedTransform(context: arkts.PluginContext) {
    arkts.Tracer.pushContext('memo-plugin');

    const options = memoPluginOptionsFromContext(context);
    const program = arkts.global.compilerContext!.program;
    const state = arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED;
    const globalMemoPluginContext = globalMemoPluginContextFromContext(context);

    let timeAnalysis = - Date.now()
    arkts.runTransformer(program, state, checkedAnalysisPropagationVisitor(), context, true)
    globalMemoPluginContext.collectMemoInfoFromPerProgramContexts()
    arkts.runTransformer(program, state, checkedAnalysis(), context, true)
    globalMemoPluginContext.collectNonMemoInfoFromPerProgramContexts()
    arkts.runTransformer(program, state, checkedPostAnalysis(), context, true)
    timeAnalysis += Date.now()

    if (options.verbose) {
        arkts.traceGlobal(() => `Memo plugin analysis info:`, true)
        arkts.traceGlobal(() => `  Found ${ globalMemoPluginContext.UnmarkedCallExpressionsCount } unmarked call expressions`, true)
        arkts.traceGlobal(() => `  Found ${ globalMemoPluginContext.UnmarkedAssignmentExpressionsCount } unmarked assignment expressions`, true)
        arkts.traceGlobal(() => `  Found ${ globalMemoPluginContext.UnmarkedPropertiesCount } unmarked properties`, true)
        arkts.traceGlobal(() => `  Found ${ globalMemoPluginContext.NonMemoScriptFunctionsCount } non-memo script functions with memo inference info`, true)
        arkts.traceGlobal(() => `  Found ${ globalMemoPluginContext.NonMemoETSFunctionTypesCount } non-memo ets function types with memo inference info`, true)
        arkts.traceGlobal(() => `  Found ${ globalMemoPluginContext.ScriptFunctionsCount } memo script functions`, true)
        arkts.traceGlobal(() => `  Found ${ globalMemoPluginContext.ETSFunctionTypesCount } memo ets function types`, true)
        arkts.traceGlobal(() => `  Found ${ globalMemoPluginContext.CallExpressionsCount } call expressions`, true)
        arkts.traceGlobal(() => `  Found ${ globalMemoPluginContext.ParamRewritesCount } param rewrites`, true)
    }

    let timeDiagnostics = 0
    if (!options.skipDiagnostics) {
        timeDiagnostics -= Date.now()
        arkts.runTransformer(program, state, checkedDiagnostics(), context, true)
        timeDiagnostics += Date.now()
    }

    arkts.debugDump(context.getProjectConfig()?.cachePath, state, name, false, program);
    let timeTransformation = - Date.now()
    arkts.runTransformer(program, state, checkedRewriteTransformer(), context, false);
    timeTransformation += Date.now()
    arkts.debugDump(context.getProjectConfig()?.cachePath, state, name, true, program);

    if (options.verbose) {
        arkts.traceGlobal(() => `Analysis time: ${timeAnalysis} ms`, true)
        arkts.traceGlobal(() => `Diagnostics time: ${timeDiagnostics} ms${options.skipDiagnostics ? " (skipped)" : ""}`, true)
        arkts.traceGlobal(() => `Transformation time: ${timeTransformation} ms`, true)
        arkts.traceGlobal(() => `Total time: ${timeAnalysis + timeDiagnostics + timeTransformation} ms`, true)
    }
    arkts.Tracer.popContext();
    
    context.setParameter(MEMO_PLUGIN_CONTEXT_PARAMETER_NAME, undefined)
}
