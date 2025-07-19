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
import { factory } from './memo-factory';
import {
    hasMemoAnnotation,
    hasMemoIntrinsicAnnotation,
    parametrizedNodeHasReceiver,
    isMemoTSTypeAliasDeclaration,
} from './utils';
import { AbstractVisitor } from '../common/abstract-visitor';

function isScriptFunctionFromGetter(node: arkts.ScriptFunction): boolean {
    return (
        !!node.parent &&
        !!node.parent.parent &&
        arkts.isFunctionExpression(node.parent) &&
        arkts.isMethodDefinition(node.parent.parent) &&
        node.parent.parent.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET
    );
}

function isScriptFunctionFromSetter(node: arkts.ScriptFunction): boolean {
    return (
        !!node.parent &&
        !!node.parent.parent &&
        arkts.isFunctionExpression(node.parent) &&
        arkts.isMethodDefinition(node.parent.parent) &&
        node.parent.parent.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET
    );
}

export class SignatureTransformer extends AbstractVisitor {
    /* Tracking whether should import `__memo_context_type` and `__memo_id_type` */
    public modified = false;

    reset(): void {
        super.reset();
        this.modified = false;
    }

    visitor<T extends arkts.AstNode>(node: T, applyMemo: boolean = false): T {
        if (arkts.isScriptFunction(node)) {
            const memo = hasMemoAnnotation(node) || hasMemoIntrinsicAnnotation(node) || applyMemo;
            if (memo) {
                this.modified = true;
            }
            const isFromGetter = isScriptFunctionFromGetter(node);
            const isFromSetter = isScriptFunctionFromSetter(node);
            const shouldAddMemoParam = memo && !isFromGetter && !isFromSetter;
            const shouldApplyMemoToParamExpr = memo && isFromSetter;
            const shouldApplyMemoToReturnType = memo && isFromGetter;
            const newParams = node.params.map((it) => this.visitor(it, shouldApplyMemoToParamExpr));
            return arkts.factory.updateScriptFunction(
                node,
                node.body,
                arkts.factory.createFunctionSignature(
                    node.typeParams,
                    shouldAddMemoParam
                        ? factory.createHiddenParameterIfNotAdded(newParams, parametrizedNodeHasReceiver(node))
                        : newParams,
                    node.returnTypeAnnotation
                        ? this.visitor(node.returnTypeAnnotation, shouldApplyMemoToReturnType)
                        : memo
                        ? arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID)
                        : undefined,
                    node.hasReceiver
                ),
                node.flags,
                node.modifiers
            ) as any as T;
        }
        if (arkts.isEtsParameterExpression(node)) {
            const memo = hasMemoAnnotation(node) || hasMemoIntrinsicAnnotation(node) || applyMemo;
            if (!node.type) {
                if (memo) {
                    console.error(`@memo parameter ${node.identifier.name} without type annotatation`);
                    throw 'Invalid @memo usage';
                }
                return node;
            }
            node.type = this.visitor(node.type, memo);
            return node as any as T;
        }
        if (arkts.isETSFunctionType(node)) {
            const memo = hasMemoAnnotation(node) || hasMemoIntrinsicAnnotation(node) || applyMemo;
            if (memo) {
                this.modified = true;
            }
            const newParams = node.params.map((it) => this.visitor(it));
            return arkts.factory.updateFunctionType(
                node,
                arkts.factory.createFunctionSignature(
                    undefined,
                    memo ? factory.createHiddenParameterIfNotAdded(newParams) : newParams,
                    this.visitor(node.returnType!),
                    false
                ),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW
            ) as any as T;
        }
        if (arkts.isETSUnionType(node)) {
            return arkts.factory.updateUnionType(
                node,
                node.types.map((it) => this.visitor(it, applyMemo))
            ) as any as T;
        }
        if (arkts.isETSUndefinedType(node)) {
            return node as any as T;
        }
        if (arkts.isETSTypeReference(node) && applyMemo) {
            if (!node.part || !node.part.name) {
                console.error(`@memo parameter has no type reference`);
                throw 'Invalid @memo usage';
            }
            const expr = node.part.name;
            const decl = arkts.getDecl(expr);
            if (!decl || !arkts.isTSTypeAliasDeclaration(decl)) {
                return node as any as T;
            }
            const memoDecl = isMemoTSTypeAliasDeclaration(decl);
            if (memoDecl) {
                return node as any as T;
            }
            console.error(`@memo parameter type reference has no @memo type declaration`);
            throw 'Invalid @memo usage';
        }
        if (applyMemo) {
            console.error(`@memo parameter's signature has invalid type`);
            throw 'Invalid @memo usage';
        }
        return node;
    }
}
