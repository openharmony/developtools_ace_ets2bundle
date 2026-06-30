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

import * as arkts from "@koalaui/libarkts"
import { BodiesTransformer, noneBodiesTransfomerOptions } from "./BodiesTransformer"
import { rewriteCallExpression, rewriteETSFunctionTypes, rewriteScriptFunctions } from "./FunctionTransformer"
import { dumpAstToFile, PositionalIdTracker } from "./utils"
import { canSkipProgram, globalMemoPluginContextFromContext, memoPluginOptionsFromContext } from "../common"
import { factory } from "../MemoFactory"

export function checkedRewriteTransformer() {
    return (program: arkts.Program, options: arkts.CompilationOptions, context: arkts.PluginContext) => {
        const globalMemoPluginContext = globalMemoPluginContextFromContext(context)
        const memoPluginContext = globalMemoPluginContext.getOrCreatePerProgramContext(program.absoluteName)
        const pluginOptions = memoPluginOptionsFromContext(context)

        const positionalIdTracker = new PositionalIdTracker(program.relativeFilePath, pluginOptions.stableForTests)

        const node = insertContextImports(program, options, context)
        const bodiesTransformer = new BodiesTransformer(memoPluginContext, positionalIdTracker)

        const result = bodiesTransformer.process(node, noneBodiesTransfomerOptions)
        rewriteETSFunctionTypes(memoPluginContext)
        rewriteScriptFunctions(memoPluginContext, positionalIdTracker, pluginOptions.addLogging)
        rewriteCallExpression(memoPluginContext, positionalIdTracker)
        if (pluginOptions.keepTransformed && options.isProgramForCodegeneration) {
            dumpAstToFile(result, pluginOptions.keepTransformed, pluginOptions.stableForTests ?? false)
        }
    }
}

function insertContextImports(program: arkts.Program, options: arkts.CompilationOptions, context: arkts.PluginContext): arkts.ETSModule {
    const module = program.getAstCasted()

    if (canSkipProgram(context, program)) {
        return module
    }

    if (ignoreForAddingImports.some(it => program.moduleName.startsWith(it)) || program.moduleName == "") {
        return module
    }

    const pluginOptions = memoPluginOptionsFromContext(context)
    module.setStatements(
        [
            factory.createContextTypesImportDeclaration(pluginOptions.stableForTests ?? false, pluginOptions.contextImport),
            ...module.statements,
        ]
    )
    return module
}

const ignoreForAddingImports = [
    "@koalaui/compat",
    "@koalaui/common",
    "@koalaui/harness",
    "@koalaui/runtime/annotations",

    "@koalaui/runtime.internals",
    "@koalaui/runtime.index",

    // Improve: this is a bad decision due to the way runtime tests are compiled
    "@koalaui/runtime-tests.ets.internals",
    "@koalaui/runtime-tests.ets.runtime",
    "@koalaui/runtime-tests.ets.index",
    "@koalaui/runtime-tests.annotations",
    "@koalaui/runtime-tests.ets-test.tests",

    // Bad decision 2.0
    "arkui.stateManagement.internals",
    "arkui.stateManagement.index",
    "arkui.stateManagement.runtime",

    "arkui.incremental.runtime.state",
    "arkui.incremental.annotation",
    "#simult"
]