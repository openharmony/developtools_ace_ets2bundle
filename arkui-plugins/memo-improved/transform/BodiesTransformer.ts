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
import { PositionalIdTracker } from "./utils"
import {
    functionHasFullBodyTransformation,
    functionIsExtension,
    MemoPluginContext,
    RuntimeNames
} from "../common"
import { factory } from "../MemoFactory"

export interface BodiesTransformerOptions {
    transformParameters: boolean,
    transformInternals: boolean,
    transformReturns: boolean,
    transformThis: boolean,
}

export const fullBodiesTransfomerOptions = { transformParameters: true, transformInternals: true, transformReturns: true }
export const partBodiesTransfomerOptions = { transformParameters: false, transformInternals: true, transformReturns: false }
export const noneBodiesTransfomerOptions = { transformParameters: false, transformInternals: false, transformReturns: false, transformThis: false }

function mayAddLastReturn(node: arkts.BlockStatement): boolean {
    return node.statements.length == 0 || (
        !arkts.isReturnStatement(node.statements[node.statements.length - 1]) &&
        !arkts.isThrowStatement(node.statements[node.statements.length - 1])
    )
}

function getDeclResolveGensymForParametesWithDefaultValue(node: arkts.Identifier) {
    const decl = arkts.declarationFromIdentifier(node)
    const parent = decl?.parent
    if (arkts.isVariableDeclarator(parent)) {
        const id = arkts.resolveGensymVariableDeclaratorForDefaultParam(parent)
        if (id) {
            return arkts.declarationFromIdentifier(id)
        }
    }
    return decl
}

export class BodiesTransformer extends arkts.AbstractVisitor {
    constructor(
        private memoPluginContext: MemoPluginContext,
        private positionalIdTracker: PositionalIdTracker,
    ) {
        super()
    }

    isScriptFunctionNested(node: arkts.ScriptFunction) {
        let cur: arkts.AstNode | undefined = node.parent
        while (cur) {
            if (arkts.isScriptFunction(cur) && this.memoPluginContext.ScriptFunctionDescriptors?.has(cur.peer)) {
                return true
            }
            cur = cur.parent
        }
        return false
    }

    process(node: arkts.AstNode, options: BodiesTransformerOptions): arkts.AstNode {
        this.memoPluginContext.ScriptFunctionDescriptors?.forEach(
            (_, peer: arkts.KNativePointer) => {
                const scriptFunction = new arkts.ScriptFunction(peer, arkts.Es2pandaAstNodeType.AST_NODE_TYPE_SCRIPT_FUNCTION)
                if (this.isScriptFunctionNested(scriptFunction)) {
                    return
                }
                if (scriptFunction.modifierFlags & arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE) {
                    return
                }
                this.visitor(scriptFunction, options)
            }
        )
        return node
    }

    visitor(node: arkts.ETSModule, options: BodiesTransformerOptions): arkts.ETSModule
    visitor(node: arkts.Expression, options: BodiesTransformerOptions): arkts.Expression
    visitor(node: arkts.AstNode, options: BodiesTransformerOptions): arkts.AstNode
    visitor(node: arkts.AstNode, options: BodiesTransformerOptions): arkts.AstNode {
        if (arkts.isScriptFunction(node)) {
            const body = node.body
            if (!arkts.isBlockStatement(body)) {
                return node
            }
            const descriptor = this.memoPluginContext.ScriptFunctionDescriptors?.get(node.peer)
            const kind = descriptor?.kind
            let newOptions = options
            if (kind) {
                const transformThis = functionIsExtension(kind) || descriptor?.paramsInfo.implicitThis || options.transformThis
                if (functionHasFullBodyTransformation(kind)) {
                    newOptions = { ...fullBodiesTransfomerOptions, transformThis }
                } else {
                    newOptions = { ...partBodiesTransfomerOptions, transformThis }
                }
            } else {
                newOptions = { transformParameters: true, transformInternals: true, transformReturns: false, transformThis: options.transformThis }
            }
            if (body) {
                if (functionHasFullBodyTransformation(kind) && mayAddLastReturn(body)) {
                    body.addStatement(arkts.factory.createReturnStatement(undefined))
                }
                node.setBody(this.visitor(body, newOptions))
            }
            return node
        }

        // For parameters with default value, only visit alternate of initializer
        if (arkts.isVariableDeclarator(node) && arkts.resolveGensymVariableDeclaratorForDefaultParam(node)) {
            this.visitor((node.init! as arkts.ConditionalExpression).alternate!, options)
            return node
        }

        if (options.transformInternals && arkts.isCallExpression(node) && arkts.isIdentifier(node.callee)) {
            if (node.callee.name == RuntimeNames.__CONTEXT) {
                return arkts.factory.createIdentifier(RuntimeNames.CONTEXT)
            }
            if (node.callee.name == RuntimeNames.__ID) {
                return arkts.factory.createIdentifier(RuntimeNames.ID)
            }
            if (node.callee.name == RuntimeNames.__KEY) {
                return this.positionalIdTracker.id(RuntimeNames.__KEY)
            }
        }

        if (options.transformParameters) {
            if (arkts.isIdentifier(node)) {
                const decl = getDeclResolveGensymForParametesWithDefaultValue(node)
                if (decl && decl.peer != node.originalPeer && this.memoPluginContext.ParamRewrites?.has(decl.originalPeer)) {
                    return this.memoPluginContext.ParamRewrites?.get(decl.originalPeer)!()
                }
                if (!decl && this.memoPluginContext.AdditionalIdentifiersToRewrite?.has(node.peer)) {
                    return factory.createMemoParameterAccess(node.name)
                }
            }
            if (arkts.isThisExpression(node) && options.transformThis) {
                if (!arkts.isReturnStatement(node.parent)) {
                    return factory.createMemoParameterAccess(RuntimeNames.THIS)
                }
            }
        }
        if (options.transformReturns && arkts.isReturnStatement(node)) {
            if (node.argument == undefined || arkts.isThisExpression(node.argument)) {
                return arkts.factory.createBlockStatement([
                    arkts.factory.createExpressionStatement(
                        factory.createRecacheCall()
                    ),
                    node,
                ])
            }
            node.setArgument(factory.createRecacheCall(this.visitor(node.argument, options)))
            return node
        }
        return this.visitEachChild(node, options)
    }
}
