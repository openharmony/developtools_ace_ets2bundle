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

import * as arkts from "@koalaui/libarkts";
import {
    canSkipProgram,
    GlobalMemoPluginContext,
    globalMemoPluginContextFromContext,
    MemoInferenceInfo,
} from "../common";
import { resolveType } from "./utils";

function buildMemoInferenceInfo(
    globalMemoPluginContext: GlobalMemoPluginContext,
    params: readonly arkts.ETSParameterExpression[]
): MemoInferenceInfo {
    const memoInferenceInfo = params.map(it => {
        const types = resolveType(it.typeAnnotation!)
        const memoTypes: arkts.ETSFunctionType[] = []
        types.forEach(it => {
            if (globalMemoPluginContext.getDescriptor(it)?.kind) {
                memoTypes.push(it)
                return
            }
        })
        // Improve: it is possible that several memoTypes were found,
        // it should be ok if they match memo signatures, but diagnostics should be thrown
        // if they have different memo signatures
        if (memoTypes.length == 0) {
            return undefined
        }
        return memoTypes[0]
    })
    return memoInferenceInfo
}

export function checkedAnalysis(): arkts.ProgramTransformer {
    return (program: arkts.Program, options: arkts.CompilationOptions, context: arkts.PluginContext) => {
        if (canSkipProgram(context, program)) {
            return
        }

        const globalMemoPluginContext = globalMemoPluginContextFromContext(context)
        const memoPluginContext = globalMemoPluginContext.getOrCreatePerProgramContext(program.absoluteName)

        memoPluginContext.NativeFilteringResult?.forEach((node) => {
            if (arkts.isCallExpression(node)) {
                memoPluginContext.registerUnmarkedCallExpression(node)
            }
            if (arkts.isAssignmentExpression(node)) {
                memoPluginContext.registerUnmarkedAssignmentExpression(node)
            }
            if (arkts.isProperty(node)) {
                memoPluginContext.registerUnmarkedProperty(node)
            }
            if (arkts.isETSFunctionType(node)) {
                const memoInferenceInfo = buildMemoInferenceInfo(globalMemoPluginContext, node.getParamsCasted())
                if (memoInferenceInfo.some(it => it != undefined)) {
                    memoPluginContext.updateETSFunctionTypeByInferenceInfo(node, memoInferenceInfo)
                }
            }
            if (arkts.isScriptFunction(node)) {
                const memoInferenceInfo = buildMemoInferenceInfo(globalMemoPluginContext, node.getParamsCasted())
                if (memoInferenceInfo.some(it => it != undefined)) {
                    memoPluginContext.updateScriptFunctionByInferenceInfo(node, memoInferenceInfo)
                }
            }
        })
    }
}