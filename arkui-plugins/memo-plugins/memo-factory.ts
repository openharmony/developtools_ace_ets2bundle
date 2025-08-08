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
    isUnmemoizedInFunctionParams,
    mayAddLastReturn,
    ParamInfo,
    ReturnTypeInfo,
    RuntimeNames,
    parametrizedNodeHasReceiver,
} from './utils';
import { moveToFront } from '../common/arkts-utils';

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
    static createContextTypesImportDeclaration(program?: arkts.Program): void {
        const source: arkts.StringLiteral = arkts.factory.createStringLiteral(RuntimeNames.MEMO_IMPORT_NAME);
        const importDecl: arkts.ETSImportDeclaration = arkts.factory.createETSImportDeclaration(
            source,
            [factory.createContextTypeImportSpecifier(), factory.createIdTypeImportSpecifier()],
            arkts.Es2pandaImportKinds.IMPORT_KINDS_TYPES
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
        return arkts.factory.createETSParameterExpression(
            arkts.factory.createIdentifier(
                RuntimeNames.CONTEXT,
                arkts.factory.createETSTypeReference(
                    arkts.factory.createETSTypeReferencePart(arkts.factory.createIdentifier(RuntimeNames.CONTEXT_TYPE))
                )
            ),
            false,
            undefined
        );
    }
    static createIdParameter(): arkts.ETSParameterExpression {
        return arkts.factory.createETSParameterExpression(
            arkts.factory.createIdentifier(
                RuntimeNames.ID,
                arkts.factory.createETSTypeReference(
                    arkts.factory.createETSTypeReferencePart(arkts.factory.createIdentifier(RuntimeNames.ID_TYPE))
                )
            ),
            false,
            undefined
        );
    }
    static createHiddenParameters(): arkts.ETSParameterExpression[] {
        return [factory.createContextParameter(), factory.createIdParameter()];
    }
    static createHiddenParameterIfNotAdded(
        params: readonly arkts.Expression[],
        hasReceiver: boolean = false
    ): readonly arkts.Expression[] {
        const _params = params ?? [];
        if (isUnmemoizedInFunctionParams(_params)) {
            return _params;
        }
        let newParams: arkts.Expression[] = [...factory.createHiddenParameters(), ..._params];
        if (hasReceiver) {
            newParams = moveToFront(newParams, 2);
        }
        return newParams;
    }
    static updateFunctionTypeWithMemoParameters(
        type: arkts.ETSFunctionType,
        hasReceiver: boolean = false,
        newTypeParams?: arkts.TSTypeParameterDeclaration
    ): arkts.ETSFunctionType {
        return arkts.factory.updateETSFunctionType(
            type,
            newTypeParams,
            factory.createHiddenParameterIfNotAdded(type.params, hasReceiver),
            type.returnType,
            false,
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
            type.annotations
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
            func.typeParams,
            factory.createHiddenParameterIfNotAdded(func.params, parametrizedNodeHasReceiver(func)),
            returnType ?? func.returnTypeAnnotation,
            func.hasReceiver,
            func.flags,
            func.modifierFlags,
            func.id ?? undefined,
            func.annotations ?? undefined,
            func.getSignaturePointer?.() ?? undefined,
            func.getPreferredReturnTypePointer?.() ?? undefined
        );        
    }

    // Arguments
    static createContextArgument(): arkts.Expression {
        return arkts.factory.createIdentifier(RuntimeNames.CONTEXT);
    }
    static createIdArgument(hash: arkts.NumberLiteral | arkts.StringLiteral): arkts.Expression {
        return arkts.factory.createBinaryExpression(
            arkts.factory.createIdentifier(RuntimeNames.ID),
            hash,
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_PLUS
        );
    }
    static createHiddenArguments(hash: arkts.NumberLiteral | arkts.StringLiteral): arkts.Expression[] {
        return [factory.createContextArgument(), factory.createIdArgument(hash)];
    }

    // Memo parameters
    static createMemoParameterIdentifier(name: string): arkts.Identifier {
        if (name === RuntimeNames.EQUAL_T) {
            return arkts.factory.createIdentifier(`${RuntimeNames.PARAMETER}_${RuntimeNames.THIS}`, undefined);
        }
        return arkts.factory.createIdentifier(`${RuntimeNames.PARAMETER}_${name}`);
    }
    static createMemoParameterDeclarator(id: number, name: string): arkts.VariableDeclarator {
        const originalIdent =
            name === RuntimeNames.THIS || name === RuntimeNames.EQUAL_T
                ? arkts.factory.createThisExpression()
                : arkts.factory.createIdentifier(name, undefined);
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
                [arkts.factory.createNumberLiteral(id), originalIdent],
                undefined,  
                false,       
                false        
            )
        );
    }
    
    static createMemoParameterDeclaration(parameters: string[]): arkts.VariableDeclaration {
        return arkts.factory.createVariableDeclaration(
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
        const updatedArgs = (passArgs ?? []) as arkts.Expression[];
    
        return arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                factory.createMemoParameterIdentifier(name),
                arkts.factory.createIdentifier(RuntimeNames.VALUE),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_GETTER,
                false,
                false
            ),
            updatedArgs,
            undefined, // typeParams
            false,     // optional_arg 
            false      // trailingComma
        );
    }    
    
    // Recache
    static createScopeDeclaration(
        returnTypeAnnotation: arkts.TypeNode | undefined,
        hash: arkts.NumberLiteral | arkts.StringLiteral,
        cnt: number
    ): arkts.VariableDeclaration {
        return arkts.factory.createVariableDeclaration(
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
                        [
                            factory.createIdArgument(hash) as arkts.Expression,
                            arkts.factory.createNumberLiteral(cnt) as arkts.Expression
                        ],
                        arkts.factory.createTSTypeParameterInstantiation(returnTypeAnnotation
                            ? [returnTypeAnnotation]
                            : [arkts.factory.createETSUndefinedType()],
                        ),
                        false,
                        false
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
            arg ? [arg as arkts.Expression] : [],
            undefined, // typeParams
            false,     // optional_arg
            false      // trailingComma
        );
    }    
    static createReturnThis(): arkts.BlockStatement {
        return arkts.factory.createBlockStatement([
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
        return arkts.factory.createBlockStatement([
            arkts.factory.createExpressionStatement(
                arkts.factory.createMemberExpression(
                    arkts.factory.createIdentifier(RuntimeNames.SCOPE),
                    arkts.factory.createIdentifier(RuntimeNames.INTERNAL_VALUE),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_NONE,
                    false,
                    false
                ),
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
            returnStatement = arkts.factory.createBlockStatement([
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
    static createWrappedReturnStatement(
        argument: arkts.Expression,
        isReturnVoid: boolean
    ): arkts.ReturnStatement | arkts.BlockStatement {
        if (!isReturnVoid) {
            return arkts.factory.createReturnStatement(argument);
        }
        return arkts.factory.createBlockStatement([
            arkts.factory.createExpressionStatement(argument),
            arkts.factory.createReturnStatement(),
        ]);
    }

    static createLambdaWrapper(node: arkts.Expression): arkts.ArrowFunctionExpression {
        return arkts.factory.createArrowFunctionExpression(
            arkts.factory.createScriptFunction(
                arkts.factory.createBlockStatement([
                    arkts.factory.createReturnStatement(node)
                ]),
                undefined, // typeParams
                [],        // params
                undefined, // returnTypeAnnotation
                false,     // hasReceiver
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
                undefined, // ident
                undefined  // annotations
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
            [ // _arguments
                factory.createIdArgument(hash) as arkts.Expression,
                factory.createLambdaWrapper(node) as arkts.Expression
            ],
            undefined, // typeParams
            false,     // optional_arg
            false      // trailingComma
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
        const isVoidValue = !!returnTypeInfo.isVoid;
        const _returnType = isVoidValue ? arkts.factory.createETSUndefinedType() : returnTypeInfo.node;
        const scopeDeclaration = factory.createScopeDeclaration(_returnType, hash, parameterNames.length);
        const memoParametersDeclaration = parameterNames.length
            ? factory.createMemoParameterDeclaration(parameterNames)
            : undefined;
        const syntheticReturnStatement = factory.createSyntheticReturnStatement(!!returnTypeInfo.isStableThis);
        const unchangedCheck = factory.createIfStatementWithSyntheticReturnStatement(
            syntheticReturnStatement,
            isVoidValue
        );
        return [
            arkts.factory.updateBlockStatement(node, [
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
            return arkts.factory.updateETSUnionType(
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
        hash: arkts.NumberLiteral | arkts.StringLiteral,
        hasReceiver?: boolean
    ): arkts.CallExpression {
        let updatedArguments = [...factory.createHiddenArguments(hash), ...node.arguments];
        if (!!hasReceiver) {
            updatedArguments = moveToFront(updatedArguments, 2);
        }
        const expressionArgs = updatedArguments as arkts.Expression[];
        return arkts.factory.updateCallExpression(
            node,
            node.callee,
            expressionArgs,
            node.typeParams,
            node.isOptional,
            node.hasTrailingComma,
            node.trailingBlock
        );
    }
}
