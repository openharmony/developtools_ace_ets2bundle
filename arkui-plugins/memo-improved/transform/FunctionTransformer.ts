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
import { rewriteSignature } from "./SignatureTransformer"
import {
    moveToFront,
    PositionalIdTracker,
} from "./utils"
import {
    functionHasFullBodyTransformation,
    functionIsEntry,
    functionIsExtension,
    MemoCallsiteDescriptor,
    MemoFunctionDescriptor,
    MemoPluginContext,
    RuntimeNames,
    selectTrackableParams
} from "../common"
import { factory } from "../MemoFactory"
import { getReturnTypeAnnotation } from "../inference-helpers"

export function rewriteETSFunctionTypes(
    memoPluginContext: MemoPluginContext,
) {
    memoPluginContext.ETSFunctionTypeDescriptors?.forEach((descriptor: MemoFunctionDescriptor, peer: arkts.KNativePointer) => {
        const node = new arkts.ETSFunctionType(peer, arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_FUNCTION_TYPE)
        rewriteSignature(node, descriptor)
    })
}

function findGensymReplacements(bodyStatements: readonly arkts.Statement[]) {
    const result: [string, string][] = []
    for (const statement of bodyStatements) {
        if (!arkts.isVariableDeclaration(statement) || !(statement.declarators.length == 1)) {
            break
        }
        const declarator = statement.declarators[0]
        const id = arkts.resolveGensymVariableDeclaratorForDefaultParam(declarator)
        if (!id) {
            break
        }
        result.push([id.name, (declarator.id! as arkts.Identifier).name])
    }
    return result.length ? result : undefined
}

function updateFunctionBody(
    node: arkts.BlockStatement,
    descriptor: MemoFunctionDescriptor,
    returnTypeAnnotation: arkts.TypeNode | undefined,
    hash: arkts.Expression,
    addLogging: boolean,
): arkts.BlockStatement {
    const trackableParams = [...(descriptor.paramsInfo.implicitThis ? [RuntimeNames.THIS.valueOf()] : []), ...selectTrackableParams(descriptor.paramsInfo).map(it => it.name)]
    const scopeDeclaration = factory.createScopeDeclaration(
        arkts.isTSThisType(returnTypeAnnotation) ? undefined : returnTypeAnnotation,
        hash, trackableParams.length
    )
    const gensymReplacements = findGensymReplacements(node.statements)
    const memoParametersDeclaration = trackableParams.length ? factory.createMemoParameterDeclaration(trackableParams, descriptor.paramsInfo.implicitThis, gensymReplacements) : undefined
    const syntheticReturnStatement = factory.createSyntheticReturnStatement(returnTypeAnnotation)
    const unchangedCheck = [factory.createIfStatementWithSyntheticReturnStatement(syntheticReturnStatement)]
    const thisParamSubscription = (arkts.isTSThisType(returnTypeAnnotation) && (descriptor.paramsInfo.implicitThis || functionIsExtension(descriptor.kind)))
        ? [arkts.factory.createExpressionStatement(factory.createMemoParameterAccess("=t"))]
        : []
    node.setStatements(
        [
            ...node.statements.slice(0, gensymReplacements?.length ?? 0),
            scopeDeclaration,
            ...(memoParametersDeclaration ? [memoParametersDeclaration] : []),
            ...(addLogging ? [factory.createMemoParameterModifiedLogging(trackableParams)] : []),
            ...(addLogging ? [factory.createUnchangedLogging()] : []),
            ...unchangedCheck,
            ...thisParamSubscription,
            ...node.statements.slice(gensymReplacements?.length ?? 0),
        ]
    )
    return node
}

export function rewriteScriptFunctions(
    memoPluginContext: MemoPluginContext,
    positionalIdTracker: PositionalIdTracker,
    addLogging: boolean,
) {
    memoPluginContext.ScriptFunctionDescriptors?.forEach((descriptor: MemoFunctionDescriptor, peer: arkts.KNativePointer) => {
        const node = new arkts.ScriptFunction(peer, arkts.Es2pandaAstNodeType.AST_NODE_TYPE_SCRIPT_FUNCTION)
        const kind = descriptor.kind
        const body = node.body
        if (!arkts.isBlockStatement(body) || !functionHasFullBodyTransformation(kind)) {
            rewriteSignature(node, descriptor)
            return
        }
        updateFunctionBody(
            body,
            descriptor,
            getReturnTypeAnnotation(node),
            positionalIdTracker.id(),
            addLogging,
        )
        rewriteSignature(node, descriptor)
    })
}

export function rewriteCallExpression(
    memoPluginContext: MemoPluginContext,
    positionalIdTracker: PositionalIdTracker,
) {
    memoPluginContext.CallExpressionDescriptors?.forEach((descriptor: MemoCallsiteDescriptor, peer: arkts.KNativePointer) => {
        const node = new arkts.CallExpression(peer, arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CALL_EXPRESSION)
        if (functionIsEntry(descriptor.kind)) {
            return node
        }

        const updatedArguments = node.arguments.map((it, index) => {
            if (descriptor.argumentsInfo[index]) {
                return factory.createComputeExpression(positionalIdTracker.id(), it)
            }
            return it
        })

        let newArgs = [...factory.createHiddenArguments(positionalIdTracker.id()), ...updatedArguments]
        if (functionIsExtension(descriptor.kind)) {
            newArgs = moveToFront(newArgs, 2)
        }
        node.setArguments(newArgs)
    })
}
