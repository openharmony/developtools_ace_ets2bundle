/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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
import { GenSymGenerator } from '../../common/gensym-generator';
import { factory as UIFactory } from '../ui-factory';
import { judgeIfAddWatchFunc } from './utils';

export class factory {
    /**
     * generate an substitution for optional expression ?., e.g. `{let _tmp = xxx; _tmp == null ? undefined : xxx}`.
     *
     * @param object item before ?..
     * @param key item after ?..
     */
    static createBlockStatementForOptionalExpression(
        object: arkts.AstNode,
        key: string,
        isCall: boolean = false
    ): arkts.Expression {
        let id = GenSymGenerator.getInstance().id(key);
        const statements: arkts.Statement[] = [
            factory.generateLetVariableDecl(arkts.factory.createIdentifier(id), object),
            factory.generateTernaryExpression(id, key, isCall),
        ];
        return arkts.factory.createBlockExpression(statements);
    }

    /**
     * generate a variable declaration, e.g. `let <left> = <right>`;
     *
     * @param left left expression.
     * @param right right expression.
     */
    static generateLetVariableDecl(left: arkts.Identifier, right: arkts.AstNode): arkts.VariableDeclaration {
        return arkts.factory.createVariableDeclaration(
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
            [
                arkts.factory.createVariableDeclarator(
                    arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                    left,
                    right
                ),
            ]
        );
    }

    /**
     * generate a ternary expression, e.g. `<test> ? <consequent> : <alternate>`;
     *
     * @param testLeft the left hand of the test condition.
     * @param key item after ?.
     */
    static generateTernaryExpression(
        testLeft: string,
        key: string,
        isCall: boolean = false
    ): arkts.ExpressionStatement {
        const test = arkts.factory.createBinaryExpression(
            arkts.factory.createIdentifier(testLeft),
            arkts.factory.createNullLiteral(),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_EQUAL
        );
        const consequent: arkts.Expression = arkts.factory.createUndefinedLiteral();
        const alternate: arkts.MemberExpression = arkts.factory.createMemberExpression(
            arkts.factory.createIdentifier(testLeft),
            arkts.factory.createIdentifier(key),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        );
        return arkts.factory.createExpressionStatement(
            arkts.factory.createConditionalExpression(
                test,
                consequent,
                isCall ? arkts.factory.createCallExpression(alternate, undefined, undefined) : alternate
            )
        );
    }

    /**
     * generate an substitution for two optional expression ?., e.g. a?.b?.c.
     *
     * @param node entry wrapper class declaration node.
     */
    static createDoubleBlockStatementForOptionalExpression(
        object: arkts.AstNode,
        key1: string,
        key2: string
    ): arkts.Expression {
        let id = GenSymGenerator.getInstance().id(key1);
        let initial: arkts.Expression = factory.createBlockStatementForOptionalExpression(object, key1);
        const statements: arkts.Statement[] = [
            factory.generateLetVariableDecl(arkts.factory.createIdentifier(id), initial),
            factory.generateTernaryExpression(id, key2),
        ];
        return arkts.factory.createBlockExpression(statements);
    }

    /**
     * generate an memberExpression with nonNull or optional, e.g. object.property, object?.property or object!.property
     *
     * @param object item before point.
     * @param property item after point.
     */
    static createNonNullOrOptionalMemberExpression(
        object: string,
        property: string,
        optional: boolean,
        nonNull: boolean
    ): arkts.Expression {
        const objectNode: arkts.Identifier = arkts.factory.createIdentifier(object);
        return arkts.factory.createMemberExpression(
            nonNull ? arkts.factory.createTSNonNullExpression(objectNode) : objectNode,
            arkts.factory.createIdentifier(property),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            optional
        );
    }

    /*
     * create `(<params>)<typeParams>: <returnType> => { <bodyStatementsList> }`.
     */
    static createArrowFunctionWithParamsAndBody(
        typeParams: arkts.TSTypeParameterDeclaration | undefined,
        params: arkts.Expression[] | undefined,
        returnType: arkts.TypeNode | undefined,
        hasReceiver: boolean,
        bodyStatementsList: arkts.Statement[]
    ): arkts.ArrowFunctionExpression {
        return arkts.factory.createArrowFunction(
            arkts.factory.createScriptFunction(
                arkts.BlockStatement.createBlockStatement(bodyStatementsList),
                arkts.factory.createFunctionSignature(typeParams, params ? params : [], returnType, hasReceiver),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE
            )
        );
    }

    /*
     * create @Watch callback, e.g. (propertyName: string): void => {this.<callbackName>(propertyName)}.
     */
    static createWatchCallback(callbackName: string): arkts.ArrowFunctionExpression {
        return factory.createArrowFunctionWithParamsAndBody(
            undefined,
            [
                arkts.factory.createParameterDeclaration(
                    arkts.factory.createIdentifier('_', UIFactory.createTypeReferenceFromString('string')),
                    undefined
                ),
            ],
            arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
            false,
            [
                arkts.factory.createExpressionStatement(
                    arkts.factory.createCallExpression(factory.generateThisCall(callbackName), undefined, [
                        arkts.factory.createIdentifier('_'),
                    ])
                ),
            ]
        );
    }

    /*
     * create this.<name> with optional or nonNullable.
     */
    static generateThisCall(name: string, optional: boolean = false, nonNull: boolean = false): arkts.Expression {
        const member: arkts.Expression = arkts.factory.createMemberExpression(
            arkts.factory.createThisExpression(),
            arkts.factory.createIdentifier(`${name}`),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            optional
        );
        return nonNull ? arkts.factory.createTSNonNullExpression(member) : member;
    }

    /*
     * create `initializers!.<newName>!.<getOrSet>(<args>)`.
     */
    static createBackingGetOrSetCall(
        newName: string,
        getOrSet: string,
        args: arkts.AstNode[] | undefined
    ): arkts.CallExpression {
        return arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createTSNonNullExpression(
                    factory.createNonNullOrOptionalMemberExpression('initializers', newName, false, true)
                ),
                arkts.factory.createIdentifier(getOrSet),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            args
        );
    }

    /*
     * create `new <className><typeAnnotation>(<args>)`.
     */
    static createNewDecoratedInstantiate(
        className: string,
        typeAnnotation: arkts.TypeNode | undefined,
        args: arkts.Expression[] | undefined
    ): arkts.ETSNewClassInstanceExpression {
        return arkts.factory.createETSNewClassInstanceExpression(
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(
                    arkts.factory.createIdentifier(className),
                    arkts.factory.createTSTypeParameterInstantiation(typeAnnotation ? [typeAnnotation.clone()] : [])
                )
            ),
            args?.length ? args : []
        );
    }

    /*
     * create `this.addProvidedVar<number>(<originName>, "uuuutttt", initializers?.uuuutttt ?? 1.5, false, watch)`.
     */
    static generateAddProvideVarCall(
        originalName: string,
        property: arkts.ClassProperty,
        alias: string,
        allowOverride: boolean = false
    ): arkts.CallExpression {
        const args: arkts.Expression[] = [
            arkts.factory.create1StringLiteral(originalName),
            arkts.factory.create1StringLiteral(alias),
            arkts.factory.createBinaryExpression(
                factory.createBlockStatementForOptionalExpression(
                    arkts.factory.createIdentifier('initializers'),
                    originalName
                ),
                property.value ?? arkts.factory.createIdentifier('undefined'),
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NULLISH_COALESCING
            ),
            arkts.factory.createBooleanLiteral(allowOverride),
        ];
        judgeIfAddWatchFunc(args, property);
        return arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createThisExpression(),
                arkts.factory.createIdentifier('addProvidedVar'),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            property.typeAnnotation ? [property.typeAnnotation.clone()] : undefined,
            args
        );
    }

    /*
     * create `this.initConsume<number>("uuuutttt", "uuuutttt", watchFunc)`.
     */
    static generateInitConsumeCall(
        originalName: string,
        property: arkts.ClassProperty,
        alias: string
    ): arkts.CallExpression {
        const args: arkts.Expression[] = [
            arkts.factory.create1StringLiteral(originalName),
            arkts.factory.create1StringLiteral(alias),
        ];
        judgeIfAddWatchFunc(args, property);
        return arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createThisExpression(),
                arkts.factory.createIdentifier('initConsume'),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            property.typeAnnotation ? [property.typeAnnotation.clone()] : undefined,
            args
        );
    }
}
