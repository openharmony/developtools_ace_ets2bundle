/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as arkts from '@koalaui/libarkts';
import { BuilderLambdaNames } from '../utils';
import { annotation, backingField } from '../../common/arkts-utils';

export class factory {
    /*
     * update @ComponentBuilder decorated method.
     */
    static updateBuilderLambdaMethodDecl(
        node: arkts.MethodDefinition,
        styleArg: arkts.ETSParameterExpression,
        newAnno: arkts.AnnotationUsage[],
        newName: string | undefined
    ): arkts.AstNode {
        const func: arkts.ScriptFunction = node.scriptFunction;
        const updateFunc = arkts.factory
            .updateScriptFunction(
                func,
                func.body,
                arkts.FunctionSignature.createFunctionSignature(
                    func.typeParams,
                    [styleArg, ...func.params],
                    arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                    false
                ),
                func.flags,
                func.modifiers
            )
            .setAnnotations(newAnno);

        return arkts.factory.updateMethodDefinition(
            node,
            node.kind,
            arkts.factory.updateIdentifier(node.name, newName ?? node.name.name),
            arkts.factory.createFunctionExpression(updateFunc),
            node.modifiers,
            false // TODO: how do I get it?
        );
    }

    /*
     * create style instance call, e.g. `instance.margin(10)`.
     */
    static createStyleLambdaBody(lambdaBody: arkts.AstNode, call: arkts.CallExpression): arkts.CallExpression {
        return arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                lambdaBody,
                call.expression,
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            call.arguments
        );
    }

    /*
     * update parameter passing, e.g. `<val.object>: __backing_<originName>`.
     */
    static updateBackingMember(val: arkts.MemberExpression, originName: string): arkts.MemberExpression {
        return arkts.factory.updateMemberExpression(
            val,
            val.object,
            arkts.factory.createIdentifier(backingField(originName)),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        );
    }

    /*
     * create style arguments in builder lambda.
     */
    static createStyleArgInBuilderLambda(
        lambdaBody: arkts.Expression | undefined,
        typeNode: arkts.TypeNode | undefined
    ): arkts.UndefinedLiteral | arkts.ArrowFunctionExpression {
        if (!lambdaBody) {
            return arkts.factory.createUndefinedLiteral();
        }

        const styleLambdaParam: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_ARROW_PARAM_NAME, typeNode),
            undefined
        );

        const body: arkts.BlockStatement = arkts.factory.createBlock([
            arkts.factory.createExpressionStatement(lambdaBody),
            arkts.factory.createReturnStatement(),
        ]);

        const func = arkts.factory.createScriptFunction(
            body,
            arkts.FunctionSignature.createFunctionSignature(
                undefined,
                [styleLambdaParam],
                arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                false
            ),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
        );

        return arkts.factory.createArrowFunction(func);
    }

    /*
     * create style arguments in builder lambda declaration.
     */
    static createStyleArgInBuilderLambdaDecl(
        typeNode: arkts.TypeNode | undefined,
        isFunctionCall: boolean
    ): arkts.ETSParameterExpression {
        const styleLambdaParam: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_ARROW_PARAM_NAME, typeNode),
            undefined
        );
        const funcType = arkts.factory.createFunctionType(
            arkts.FunctionSignature.createFunctionSignature(
                undefined,
                [styleLambdaParam],
                arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                false
            ),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW
        );

        let parameter: arkts.ETSParameterExpression;
        if (isFunctionCall) {
            parameter = arkts.factory
                .createParameterDeclaration(
                    arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_PARAM_NAME, funcType),
                    undefined
                )
                .setOptional(true);
        } else {
            const optionalFuncType = arkts.factory.createUnionType([funcType, arkts.factory.createETSUndefinedType()]);
            parameter = arkts.factory.createParameterDeclaration(
                arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_PARAM_NAME, optionalFuncType),
                undefined
            );
        }
        parameter.annotations = [annotation('memo')];
        return parameter;
    }
}
