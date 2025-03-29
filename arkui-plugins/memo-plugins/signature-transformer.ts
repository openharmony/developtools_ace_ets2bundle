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

import * as arkts from "@koalaui/libarkts"
import { factory } from "./memo-factory"
import { hasMemoAnnotation, hasMemoIntrinsicAnnotation } from "./utils"
import { AbstractVisitor } from "../common/abstract-visitor"

export class SignatureTransformer extends AbstractVisitor {
    public modified = false

    reset(): void {
        super.reset();
        this.modified = false;
    }

    visitor<T extends arkts.AstNode>(node: T, applyMemo: boolean = false): T {
        if (arkts.isScriptFunction(node)) {
            const memo = hasMemoAnnotation(node) || hasMemoIntrinsicAnnotation(node) || applyMemo
            if (memo) {
                this.modified = true
            }
            return arkts.factory.updateScriptFunction(
                node,
                node.body,
                arkts.factory.createFunctionSignature(
                    node.typeParams,
                    [...(memo ? factory.createHiddenParameters() : []), ...node.params.map(it => this.visitor(it))],
                    node.returnTypeAnnotation
                        ? this.visitor(node.returnTypeAnnotation)
                        : memo ? arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID) : undefined,
                    node.hasReceiver,
                ),
                node.flags,
                node.modifiers
            ) as any as T
        }
        if (arkts.isEtsParameterExpression(node)) {
            const memo = hasMemoAnnotation(node) || hasMemoIntrinsicAnnotation(node)
            if (!node.type) {
                if (memo) {
                    console.error(`@memo parameter ${node.identifier.name} without type annotatation`)
                    throw "Invalid @memo usage"
                }
                return node
            }
            node.type = this.visitor(node.type, memo)
            return node as any as T
        }
        if (arkts.isETSFunctionType(node)) {
            const memo = hasMemoAnnotation(node) || hasMemoIntrinsicAnnotation(node) || applyMemo
            if (memo) {
                this.modified = true
            }
            return arkts.factory.updateFunctionType(
                node,
                arkts.factory.createFunctionSignature(
                    undefined,
                    [...(memo ? factory.createHiddenParameters() : []), ...node.params.map(it => this.visitor(it))],
                    this.visitor(node.returnType!),
                    false,
                ),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
            ) as any as T
        }
        if (arkts.isETSUnionType(node)) {
            return arkts.factory.updateUnionType(
                node,
                node.types.map(it => this.visitor(it, applyMemo))
            ) as any as T
        }
        if (arkts.isETSUndefinedType(node)) {
            return node as any as T
        }
        if (applyMemo) {
            throw "Invalid @memo usage"
        }
        return node
    }
}