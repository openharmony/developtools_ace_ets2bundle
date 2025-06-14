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
import { DecoratorNames, DECORATOR_TYPE_MAP, StateManagementTypes } from '../../common/predefines';
import { factory as UIFactory } from '../ui-factory';
import { collectStateManagementTypeImport, getValueInAnnotation, hasDecorator, removeDecorator } from './utils';
import { addMemoAnnotation, findCanAddMemoFromTypeAnnotation, CustomComponentNames } from '../utils';
import { annotation } from '../../common/arkts-utils';

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
     * create `StateMgmtFactory.<makeType><typeArguments>(this, ...<args>);`.
     */
    static generateStateMgmtFactoryCall(
        makeType: StateManagementTypes,
        typeArguments: arkts.TypeNode | undefined,
        args: arkts.AstNode[],
        argsContainsThis: boolean
    ): arkts.CallExpression {
        collectStateManagementTypeImport(StateManagementTypes.STATE_MANAGEMENT_FACTORY);
        return arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(StateManagementTypes.STATE_MANAGEMENT_FACTORY),
                arkts.factory.createIdentifier(makeType),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            typeArguments ? [typeArguments] : undefined,
            [...(argsContainsThis ? [arkts.factory.createThisExpression()] : []), ...args]
        );
    }

    /*
     * create if statement in __updateStruct method.
     */
    static createIfInUpdateStruct(
        originalName: string,
        member: arkts.Expression,
        args: arkts.AstNode[]
    ): arkts.IfStatement {
        const binaryItem = arkts.factory.createBinaryExpression(
            factory.createBlockStatementForOptionalExpression(
                arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_INITIALIZERS_NAME),
                originalName
            ),
            arkts.factory.createUndefinedLiteral(),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NOT_STRICT_EQUAL
        );
        return arkts.factory.createIfStatement(
            binaryItem,
            arkts.factory.createBlock([
                arkts.factory.createExpressionStatement(arkts.factory.createCallExpression(member, undefined, args)),
            ])
        );
    }

    static judgeIfAddWatchFunc(args: arkts.Expression[], property: arkts.ClassProperty): void {
        if (hasDecorator(property, DecoratorNames.WATCH)) {
            const watchStr: string | undefined = getValueInAnnotation(property, DecoratorNames.WATCH);
            if (watchStr) {
                args.push(factory.createWatchCallback(watchStr));
            }
        }
    }

    static createOptionalClassProperty(
        name: string,
        property: arkts.ClassProperty,
        stageManagementType: StateManagementTypes | undefined,
        modifiers: arkts.Es2pandaModifierFlags,
        needMemo: boolean = false
    ): arkts.ClassProperty {
        const newType: arkts.TypeNode | undefined = property.typeAnnotation?.clone();
        if (needMemo && findCanAddMemoFromTypeAnnotation(newType)) {
            addMemoAnnotation(newType);
        }
        const newProperty = arkts.factory.createClassProperty(
            arkts.factory.createIdentifier(name),
            undefined,
            !!stageManagementType ? factory.createStageManagementType(stageManagementType, property) : newType,
            modifiers,
            false
        );
        return arkts.classPropertySetOptional(newProperty, true);
    }

    static createStageManagementType(
        stageManagementType: StateManagementTypes,
        property: arkts.ClassProperty
    ): arkts.ETSTypeReference {
        collectStateManagementTypeImport(stageManagementType);
        return arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(
                arkts.factory.createIdentifier(stageManagementType),
                arkts.factory.createTSTypeParameterInstantiation([
                    property.typeAnnotation ? property.typeAnnotation.clone() : arkts.factory.createETSUndefinedType(),
                ])
            )
        );
    }

    /*
     * create watch related members in Observed/Track classes
     */
    static createWatchMembers(): arkts.AstNode[] {
        const subscribedWatches: arkts.ClassProperty = arkts.factory.createClassProperty(
            arkts.factory.createIdentifier('subscribedWatches'),
            factory.generateStateMgmtFactoryCall(StateManagementTypes.MAKE_SUBSCRIBED_WATCHES, undefined, [], false),
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(
                    arkts.factory.createIdentifier(StateManagementTypes.SUBSCRIBED_WATCHES)
                )
            ),
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
            false
        );
        subscribedWatches.setAnnotations([annotation(DecoratorNames.JSONSTRINGIFYIGNORE)]);
        collectStateManagementTypeImport(StateManagementTypes.SUBSCRIBED_WATCHES);

        const addWatchSubscriber = factory.createWatchMethod(
            'addWatchSubscriber',
            arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID,
            'watchId',
            StateManagementTypes.WATCH_ID_TYPE,
            false
        );
        const removeWatchSubscriber = factory.createWatchMethod(
            'removeWatchSubscriber',
            arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_BOOLEAN,
            'watchId',
            StateManagementTypes.WATCH_ID_TYPE,
            true
        );
        collectStateManagementTypeImport(StateManagementTypes.WATCH_ID_TYPE);

        const executeOnSubscribingWatches = factory.createWatchMethod(
            'executeOnSubscribingWatches',
            arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID,
            'propertyName',
            'string',
            false
        );

        return [subscribedWatches, addWatchSubscriber, removeWatchSubscriber, executeOnSubscribingWatches];
    }

    /*
     * helper for createWatchMembers to create watch methods
     */
    static createWatchMethod(
        methodName: string,
        returnType: arkts.Es2pandaPrimitiveType,
        paramName: string,
        paramType: string,
        isReturnStatement: boolean
    ): arkts.MethodDefinition {
        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            arkts.factory.createIdentifier(methodName),
            arkts.factory.createScriptFunction(
                arkts.factory.createBlock([
                    isReturnStatement
                        ? arkts.factory.createReturnStatement(
                              arkts.factory.createCallExpression(
                                  factory.thisSubscribedWatchesMember(methodName),
                                  undefined,
                                  [arkts.factory.createIdentifier(paramName)]
                              )
                          )
                        : arkts.factory.createExpressionStatement(
                              arkts.factory.createCallExpression(
                                  factory.thisSubscribedWatchesMember(methodName),
                                  undefined,
                                  [arkts.factory.createIdentifier(paramName)]
                              )
                          ),
                ]),
                arkts.factory.createFunctionSignature(
                    undefined,
                    [
                        arkts.factory.createParameterDeclaration(
                            arkts.factory.createIdentifier(
                                paramName,
                                arkts.factory.createTypeReference(
                                    arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier(paramType))
                                )
                            ),
                            undefined
                        ),
                    ],
                    arkts.factory.createPrimitiveType(returnType),
                    false
                ),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
            ),
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
            false
        );
    }

    /*
     * helper for createWatchMethod, generates this.subscribedWatches.xxx
     */
    static thisSubscribedWatchesMember(member: string): arkts.MemberExpression {
        return arkts.factory.createMemberExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createThisExpression(),
                arkts.factory.createIdentifier('subscribedWatches'),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            arkts.factory.createIdentifier(member),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        );
    }

    /*
     * create ____V1RenderId related members in Observed/Track classes
     */
    static createV1RenderIdMembers(): arkts.AstNode[] {
        const v1RenderId: arkts.ClassProperty = arkts.factory.createClassProperty(
            arkts.factory.createIdentifier('____V1RenderId'),
            arkts.factory.createNumericLiteral(0),
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(
                    arkts.factory.createIdentifier(StateManagementTypes.RENDER_ID_TYPE)
                )
            ),
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
            false
        );
        v1RenderId.setAnnotations([annotation(DecoratorNames.JSONSTRINGIFYIGNORE)]);
        collectStateManagementTypeImport(StateManagementTypes.RENDER_ID_TYPE);
        const setV1RenderId: arkts.MethodDefinition = factory.setV1RenderId();
        return [v1RenderId, setV1RenderId];
    }

    /*
     * helper for createV1RenderIdMembers to generate setV1RenderId method
     */
    static setV1RenderId(): arkts.MethodDefinition {
        const assignRenderId: arkts.ExpressionStatement = arkts.factory.createExpressionStatement(
            arkts.factory.createAssignmentExpression(
                arkts.factory.createMemberExpression(
                    arkts.factory.createThisExpression(),
                    arkts.factory.createIdentifier('____V1RenderId'),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
                arkts.factory.createIdentifier('renderId')
            )
        );
        const funcSig: arkts.FunctionSignature = arkts.factory.createFunctionSignature(
            undefined,
            [
                arkts.factory.createParameterDeclaration(
                    arkts.factory.createIdentifier(
                        'renderId',
                        arkts.factory.createTypeReference(
                            arkts.factory.createTypeReferencePart(
                                arkts.factory.createIdentifier(StateManagementTypes.RENDER_ID_TYPE)
                            )
                        )
                    ),
                    undefined
                ),
            ],
            arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
            false
        );
        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            arkts.factory.createIdentifier('setV1RenderId'),
            arkts.factory.createScriptFunction(
                arkts.factory.createBlock([assignRenderId]),
                funcSig,
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
            ),
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
            false
        );
    }

    /*
     * create conditionalAddRef method in Observed/Track classes
     */
    static conditionalAddRef(): arkts.MethodDefinition {
        const funcSig: arkts.FunctionSignature = arkts.factory.createFunctionSignature(
            undefined,
            [
                arkts.factory.createParameterDeclaration(
                    arkts.factory.createIdentifier(
                        'meta',
                        arkts.factory.createTypeReference(
                            arkts.factory.createTypeReferencePart(
                                arkts.factory.createIdentifier(StateManagementTypes.MUTABLE_STATE_META)
                            )
                        )
                    ),
                    undefined
                ),
            ],
            arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
            false
        );
        collectStateManagementTypeImport(StateManagementTypes.MUTABLE_STATE_META);
        const shouldAddRef: arkts.IfStatement = factory.shouldAddRef();
        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            arkts.factory.createIdentifier('conditionalAddRef'),
            arkts.factory.createScriptFunction(
                arkts.factory.createBlock([shouldAddRef]),
                funcSig,
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PROTECTED
            ),
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PROTECTED,
            false
        );
    }

    /*
     * helper for conditionalAddRef to generate shouldAddRef method
     */
    static shouldAddRef(): arkts.IfStatement {
        const test: arkts.CallExpression = arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(StateManagementTypes.OBSERVE),
                arkts.factory.createIdentifier('shouldAddRef'),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            [
                arkts.factory.createMemberExpression(
                    arkts.factory.createThisExpression(),
                    arkts.factory.createIdentifier('____V1RenderId'),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
            ]
        );
        collectStateManagementTypeImport(StateManagementTypes.OBSERVE);
        const consequent: arkts.BlockStatement = arkts.factory.createBlock([
            arkts.factory.createExpressionStatement(
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createIdentifier('meta'),
                        arkts.factory.createIdentifier('addRef'),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    undefined,
                    undefined
                )
            ),
        ]);
        return arkts.factory.createIfStatement(test, consequent);
    }

    /*
     * helper to create meta field in classes with only @Observe and no @Track
     */
    static createMetaInObservedClass(): arkts.ClassProperty {
        collectStateManagementTypeImport(StateManagementTypes.MUTABLE_STATE_META);
        const meta = arkts.factory.createClassProperty(
            arkts.factory.createIdentifier(StateManagementTypes.META),
            factory.generateStateMgmtFactoryCall(StateManagementTypes.MAKE_MUTABLESTATE_META, undefined, [], false),
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(
                    arkts.factory.createIdentifier(StateManagementTypes.MUTABLE_STATE_META)
                )
            ),
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
            false
        );
        meta.setAnnotations([annotation(DecoratorNames.JSONSTRINGIFYIGNORE)]);
        return meta;
    }

    /**
     * add `@memo` to the `@Builder` methods in class.
     */
    static addMemoToBuilderClassMethod(method: arkts.MethodDefinition): arkts.MethodDefinition {
        if (hasDecorator(method, DecoratorNames.BUILDER)) {
            removeDecorator(method, DecoratorNames.BUILDER);
            addMemoAnnotation(method.scriptFunction);
        }
        return method;
    }

    static createStorageLinkStateValue(
        property: arkts.ClassProperty,
        localStorageporpValueStr: string
    ): arkts.MemberExpression {
        return arkts.factory.createMemberExpression(
            arkts.factory.createCallExpression(
                arkts.factory.createIdentifier(StateManagementTypes.STORAGE_LINK_STATE),
                property.typeAnnotation ? [property.typeAnnotation] : [],
                [
                    arkts.factory.createMemberExpression(
                        arkts.factory.createThisExpression(),
                        arkts.factory.createIdentifier('_entry_local_storage_'),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    arkts.factory.createStringLiteral(localStorageporpValueStr),
                    property.value ?? arkts.factory.createUndefinedLiteral(),
                ]
            ),
            arkts.factory.createIdentifier('value'),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        );
    }

    /**
     * wrap interface non-undefined property type `T` to `<wrapTypeName><T>`.
     */
    static wrapInterfacePropertyType(type: arkts.TypeNode, wrapTypeName: StateManagementTypes): arkts.TypeNode {
        if (arkts.isETSUnionType(type)) {
            return arkts.factory.updateUnionType(type, [
                arkts.factory.createTypeReference(
                    arkts.factory.createTypeReferencePart(
                        arkts.factory.createIdentifier(wrapTypeName),
                        arkts.factory.createTSTypeParameterInstantiation([type.types[0]])
                    )
                ),
                type.types[1],
            ]);
        }
        return type;
    }

    /**
     * wrap interface property parameter that has non-undefined type `T` to `<wrapTypeName><T>`.
     */
    static wrapInterfacePropertyParamExpr(
        param: arkts.Expression,
        wrapTypeName: StateManagementTypes
    ): arkts.Expression {
        if (!arkts.isEtsParameterExpression(param)) {
            return param;
        }
        if (!param.type || !arkts.isETSUnionType(param.type)) {
            return param;
        }
        return arkts.factory.updateParameterDeclaration(
            param,
            arkts.factory.createIdentifier(
                param.identifier.name,
                factory.wrapInterfacePropertyType(param.type, wrapTypeName)
            ),
            param.initializer
        );
    }

    static wrapStateManagementTypeToType(
        type: arkts.TypeNode | undefined,
        decoratorName: DecoratorNames
    ): arkts.TypeNode | undefined {
        let newType: arkts.TypeNode | undefined;
        let wrapTypeName: StateManagementTypes | undefined;
        if (!!type && !!(wrapTypeName = DECORATOR_TYPE_MAP.get(decoratorName))) {
            newType = factory.wrapInterfacePropertyType(type, wrapTypeName);
            collectStateManagementTypeImport(wrapTypeName);
        }
        return newType;
    }

    static wrapStateManagementTypeToParam(
        param: arkts.Expression | undefined,
        decoratorName: DecoratorNames
    ): arkts.Expression | undefined {
        let newParam: arkts.Expression | undefined;
        let wrapTypeName: StateManagementTypes | undefined;
        if (!!param && !!(wrapTypeName = DECORATOR_TYPE_MAP.get(decoratorName))) {
            newParam = factory.wrapInterfacePropertyParamExpr(param, wrapTypeName);
            collectStateManagementTypeImport(wrapTypeName);
        }
        return newParam;
    }

    /**
     * Wrap getter's return type and setter's param type (expecting an union type with `T` and `undefined`)
     * to `<wrapTypeName><T> | undefined`, where `<wrapTypeName>` is getting from `DecoratorName`;
     *
     * @param method expecting getter with decorator annotation and a setter with decorator annotation in the overloads.
     */
    static wrapStateManagementTypeToMethodInInterface(
        method: arkts.MethodDefinition,
        decorator: DecoratorNames
    ): arkts.MethodDefinition {
        if (method.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET) {
            const newType: arkts.TypeNode | undefined = factory.wrapStateManagementTypeToType(
                method.scriptFunction.returnTypeAnnotation,
                decorator
            );
            const newOverLoads = method.overloads.map((overload) => {
                if (arkts.isMethodDefinition(overload)) {
                    return factory.wrapStateManagementTypeToMethodInInterface(overload, decorator);
                }
                return overload;
            });
            method.setOverloads(newOverLoads);
            removeDecorator(method, decorator);
            if (!!newType) {
                method.scriptFunction.setReturnTypeAnnotation(newType);
            }
        } else if (method.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET) {
            const newParam: arkts.Expression | undefined = factory.wrapStateManagementTypeToParam(
                method.scriptFunction.params.at(0),
                decorator
            );
            removeDecorator(method, decorator);
            if (!!newParam) {
                return UIFactory.updateMethodDefinition(method, { function: { params: [newParam] } });
            }
        }
        return method;
    }

    /**
     * Wrap to the type of the property (expecting an union type with `T` and `undefined`)
     * to `<wrapTypeName><T> | undefined`, where `<wrapTypeName>` is getting from `DecoratorName`;
     *
     * @param property expecting property with decorator annotation.
     */
    static wrapStateManagementTypeToPropertyInInterface(
        property: arkts.ClassProperty,
        decorator: DecoratorNames
    ): arkts.ClassProperty {
        const newType: arkts.TypeNode | undefined = factory.wrapStateManagementTypeToType(
            property.typeAnnotation,
            decorator
        );
        removeDecorator(property, decorator);
        if (!!newType) {
            property.setTypeAnnotation(newType);
        }
        return property;
    }
}
