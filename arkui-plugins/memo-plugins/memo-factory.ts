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
import {
    fixGensymParams,
    buildeParamInfos,
    isUnmemoizedInFunction,
    mayAddLastReturn,
    ParamInfo,
    ReturnTypeInfo,
    RuntimeNames,
} from './utils';

export class factory {
    // Importing
    static createContextTypeImportSpecifier(): arkts.ImportSpecifier {
        return arkts.factory.createImportSpecifier(
            arkts.factory.createIdentifier(RuntimeNames.CONTEXT_TYPE),
            arkts.factory.createIdentifier(RuntimeNames.CONTEXT_TYPE)
        );
    }
    static createIdTypeImportSpecifier(): arkts.ImportSpecifier {
        return arkts.factory.createImportSpecifier(
            arkts.factory.createIdentifier(RuntimeNames.ID_TYPE),
            arkts.factory.createIdentifier(RuntimeNames.ID_TYPE)
        );
    }
    // TODO: Currently, import declaration can only be inserted at after-parsed stage.
    static createContextTypesImportDeclaration(program?: arkts.Program): void {
        const source: arkts.StringLiteral = arkts.factory.createStringLiteral(RuntimeNames.CONTEXT_TYPE_DEFAULT_IMPORT);
        const importDecl: arkts.ETSImportDeclaration = arkts.factory.createImportDeclaration(
            source,
            [factory.createContextTypeImportSpecifier(), factory.createIdTypeImportSpecifier()],
            arkts.Es2pandaImportKinds.IMPORT_KINDS_TYPE,
            program!,
            arkts.Es2pandaImportFlags.IMPORT_FLAGS_NONE
        );
        // Insert this import at the top of the script's statements.
        if (!program) {
            throw Error('Failed to insert import: Transformer has no program');
        }
        arkts.importDeclarationInsert(importDecl, program);
        return;
    }

    // Parameters
    static createContextParameter(): arkts.ETSParameterExpression {
        return arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(
                RuntimeNames.CONTEXT,
                arkts.factory.createTypeReference(
                    arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier(RuntimeNames.CONTEXT_TYPE))
                )
            ),
            undefined
        );
    }
    static createIdParameter(): arkts.ETSParameterExpression {
        return arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(
                RuntimeNames.ID,
                arkts.factory.createTypeReference(
                    arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier(RuntimeNames.ID_TYPE))
                )
            ),
            undefined
        );
    }
    static createHiddenParameters(): arkts.ETSParameterExpression[] {
        return [factory.createContextParameter(), factory.createIdParameter()];
    }
    static createHiddenParameterIfNotAdded(params?: readonly arkts.Expression[]): readonly arkts.Expression[] {
        const _params = params ?? [];
        if (isUnmemoizedInFunction(_params)) {
            return _params;
        }
        return [...factory.createHiddenParameters(), ..._params];
    }
    static updateFunctionTypeWithMemoParameters(type: arkts.ETSFunctionType): arkts.ETSFunctionType {
        return arkts.factory.updateFunctionType(
            type,
            arkts.factory.createFunctionSignature(
                undefined,
                factory.createHiddenParameterIfNotAdded(type.params),
                type.returnType,
                false
            ),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW
        );
    }
    static updateScriptFunctionWithMemoParameters(
        func: arkts.ScriptFunction,
        newBody?: arkts.AstNode | undefined,
        returnType?: arkts.TypeNode | undefined
    ): arkts.ScriptFunction {
        return arkts.factory.updateScriptFunction(
            func,
            newBody ?? func.body,
            arkts.factory.createFunctionSignature(
                func.typeParams,
                factory.createHiddenParameterIfNotAdded(func.params),
                returnType ?? func.returnTypeAnnotation,
                func.hasReceiver
            ),
            func.flags,
            func.modifiers
        );
    }

    // Arguments
    static createContextArgument(): arkts.AstNode {
        return arkts.factory.createIdentifier(RuntimeNames.CONTEXT);
    }
    static createIdArgument(hash: arkts.NumberLiteral | arkts.StringLiteral): arkts.AstNode {
        return arkts.factory.createBinaryExpression(
            arkts.factory.createIdentifier(RuntimeNames.ID),
            hash,
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_PLUS
        );
    }
    static createHiddenArguments(hash: arkts.NumberLiteral | arkts.StringLiteral): arkts.AstNode[] {
        return [factory.createContextArgument(), factory.createIdArgument(hash)];
    }

    // Memo parameters
    static createMemoParameterIdentifier(name: string): arkts.Identifier {
        return arkts.factory.createIdentifier(`${RuntimeNames.PARAMETER}_${name}`);
    }
    static createMemoParameterDeclarator(id: number, name: string): arkts.VariableDeclarator {
        return arkts.factory.createVariableDeclarator(
            arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_CONST,
            factory.createMemoParameterIdentifier(name),
            arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    arkts.factory.createIdentifier(RuntimeNames.SCOPE),
                    arkts.factory.createIdentifier(RuntimeNames.INTERNAL_PARAMETER_STATE),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                undefined,
                [arkts.factory.createNumericLiteral(id), arkts.factory.createIdentifier(name)]
            )
        );
    }
    static createMemoParameterDeclaration(parameters: string[]): arkts.VariableDeclaration {
        return arkts.factory.createVariableDeclaration(
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_CONST,
            parameters.map((name, id) => {
                return factory.createMemoParameterDeclarator(id, name);
            })
        );
    }
    static createMemoParameterAccess(name: string): arkts.MemberExpression {
        return arkts.factory.createMemberExpression(
            factory.createMemoParameterIdentifier(name),
            arkts.factory.createIdentifier(RuntimeNames.VALUE),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_GETTER,
            false,
            false
        );
    }
    static createMemoParameterAccessCall(name: string, passArgs?: arkts.AstNode[]): arkts.CallExpression {
        const updatedArgs = passArgs ? passArgs : [];
        return arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                factory.createMemoParameterIdentifier(name),
                arkts.factory.createIdentifier(RuntimeNames.VALUE),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_GETTER,
                false,
                false
            ),
            undefined,
            [...updatedArgs]
        );
    }

    // Recache
    static createScopeDeclaration(
        returnTypeAnnotation: arkts.TypeNode | undefined,
        hash: arkts.NumberLiteral | arkts.StringLiteral,
        cnt: number
    ): arkts.VariableDeclaration {
        return arkts.factory.createVariableDeclaration(
            0,
            arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_CONST,
            [
                arkts.factory.createVariableDeclarator(
                    arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_CONST,
                    arkts.factory.createIdentifier(RuntimeNames.SCOPE),
                    arkts.factory.createCallExpression(
                        arkts.factory.createMemberExpression(
                            arkts.factory.createIdentifier(RuntimeNames.CONTEXT),
                            arkts.factory.createIdentifier(RuntimeNames.INTERNAL_SCOPE),
                            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                            false,
                            false
                        ),
                        returnTypeAnnotation
                            ? [returnTypeAnnotation]
                            : [arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID)],
                        [factory.createIdArgument(hash), arkts.factory.createNumericLiteral(cnt)]
                    )
                ),
            ]
        );
    }
    static createRecacheCall(arg?: arkts.AstNode): arkts.CallExpression {
        return arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(RuntimeNames.SCOPE),
                arkts.factory.createIdentifier(RuntimeNames.INTERNAL_VALUE_NEW),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            arg ? [arg] : undefined
        );
    }
    static createReturnThis(): arkts.BlockStatement {
        return arkts.factory.createBlock([
            arkts.factory.createExpressionStatement(factory.createRecacheCall()),
            arkts.factory.createReturnStatement(arkts.factory.createThisExpression()),
        ]);
    }
    static createSyntheticReturnStatement(stableThis: boolean): arkts.ReturnStatement | arkts.BlockStatement {
        if (!stableThis) {
            return arkts.factory.createReturnStatement(
                arkts.factory.createMemberExpression(
                    arkts.factory.createIdentifier(RuntimeNames.SCOPE),
                    arkts.factory.createIdentifier(RuntimeNames.INTERNAL_VALUE),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_NONE,
                    false,
                    false
                )
            );
        }
        return arkts.factory.createBlock([
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(RuntimeNames.SCOPE),
                arkts.factory.createIdentifier(RuntimeNames.INTERNAL_VALUE),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_NONE,
                false,
                false
            ),
            arkts.factory.createReturnStatement(arkts.factory.createThisExpression()),
        ]);
    }
    static createIfStatementWithSyntheticReturnStatement(
        syntheticReturnStatement: arkts.ReturnStatement | arkts.BlockStatement,
        isVoidValue: boolean
    ): arkts.IfStatement {
        let returnStatement = syntheticReturnStatement;
        if (isVoidValue && arkts.isReturnStatement(syntheticReturnStatement)) {
            returnStatement = arkts.factory.createBlock([
                arkts.factory.createExpressionStatement(syntheticReturnStatement.argument!),
                arkts.factory.createReturnStatement(),
            ]);
        }
        return arkts.factory.createIfStatement(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(RuntimeNames.SCOPE),
                arkts.factory.createIdentifier(RuntimeNames.INTERNAL_VALUE_OK),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_NONE,
                false,
                false
            ),
            returnStatement
        );
    }

    // Compute
    static createLambdaWrapper(node: arkts.Expression): arkts.ArrowFunctionExpression {
        return arkts.factory.createArrowFunction(
            arkts.factory.createScriptFunction(
                arkts.factory.createBlock([arkts.factory.createReturnStatement(node)]),
                arkts.factory.createFunctionSignature(undefined, [], undefined, false),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE
            )
        );
    }
    static createComputeExpression(
        hash: arkts.NumberLiteral | arkts.StringLiteral,
        node: arkts.Expression
    ): arkts.CallExpression {
        return arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(RuntimeNames.CONTEXT),
                arkts.factory.createIdentifier(RuntimeNames.COMPUTE),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            [factory.createIdArgument(hash), factory.createLambdaWrapper(node)]
        );
    }

    static updateFunctionBody(
        node: arkts.BlockStatement,
        parameters: arkts.ETSParameterExpression[],
        returnTypeInfo: ReturnTypeInfo,
        hash: arkts.NumberLiteral | arkts.StringLiteral
    ): [
        arkts.BlockStatement,
        ParamInfo[],
        arkts.VariableDeclaration | undefined,
        arkts.ReturnStatement | arkts.BlockStatement | undefined
    ] {
        const paramInfos = buildeParamInfos(parameters);
        const gensymParamsCount = fixGensymParams(paramInfos, node);
        const parameterNames = paramInfos.map((it) => it.ident.name);
        const scopeDeclaration = factory.createScopeDeclaration(returnTypeInfo.node, hash, parameterNames.length);
        const memoParametersDeclaration = parameterNames.length
            ? factory.createMemoParameterDeclaration(parameterNames)
            : undefined;
        const syntheticReturnStatement = factory.createSyntheticReturnStatement(!!returnTypeInfo.isStableThis);
        const isVoidValue = !!returnTypeInfo.isVoid;
        const unchangedCheck = factory.createIfStatementWithSyntheticReturnStatement(
            syntheticReturnStatement,
            isVoidValue
        );
        return [
            arkts.factory.updateBlock(node, [
                ...node.statements.slice(0, gensymParamsCount),
                scopeDeclaration,
                ...(memoParametersDeclaration ? [memoParametersDeclaration] : []),
                unchangedCheck,
                ...node.statements.slice(gensymParamsCount),
                ...(mayAddLastReturn(node) ? [arkts.factory.createReturnStatement()] : []),
            ]),
            paramInfos,
            memoParametersDeclaration,
            syntheticReturnStatement,
        ];
    }

    static updateMemoTypeAnnotation(typeAnnotation: arkts.AstNode | undefined): arkts.TypeNode | undefined {
        if (!typeAnnotation || !arkts.isTypeNode(typeAnnotation)) {
            return undefined;
        }

        if (arkts.isETSFunctionType(typeAnnotation)) {
            return factory.updateFunctionTypeWithMemoParameters(typeAnnotation);
        } else if (arkts.isETSUnionType(typeAnnotation)) {
            return arkts.factory.updateUnionType(
                typeAnnotation,
                typeAnnotation.types.map((it) => {
                    if (arkts.isETSFunctionType(it)) {
                        return factory.updateFunctionTypeWithMemoParameters(it);
                    }
                    return it;
                })
            );
        }
        return typeAnnotation;
    }

    static insertHiddenArgumentsToCall(
        node: arkts.CallExpression,
        hash: arkts.NumberLiteral | arkts.StringLiteral
    ): arkts.CallExpression {
        return arkts.factory.updateCallExpression(node, node.expression, node.typeArguments, [
            ...factory.createHiddenArguments(hash),
            ...node.arguments,
        ]);
    }
}
