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
import {
    DecoratorNames,
    DECORATOR_TYPE_MAP,
    StateManagementTypes,
    ObservedNames,
    MonitorNames,
    TypeNames,
} from '../../common/predefines';
import { factory as UIFactory } from '../ui-factory';
import {
    collectStateManagementTypeImport,
    generateThisBacking,
    getValueInAnnotation,
    hasDecorator,
    OptionalMemberInfo,
    removeDecorator,
} from './utils';
import { CustomComponentNames, optionsHasField } from '../utils';
import { addMemoAnnotation, findCanAddMemoFromTypeAnnotation } from '../../collectors/memo-collectors/utils';
import { annotation, isNumeric } from '../../common/arkts-utils';

export class factory {
    /**
     * generate an substitution for optional expression ?., e.g. `{let _tmp = xxx; _tmp == null ? undefined : xxx}`.
     *
     * @param object item before ?..
     * @param key item after ?..
     * @param info optional member information
     */
    static createBlockStatementForOptionalExpression(
        object: arkts.AstNode,
        key: string,
        info?: OptionalMemberInfo
    ): arkts.Expression {
        let id = GenSymGenerator.getInstance().id(key);
        const statements: arkts.Statement[] = [
            factory.generateLetVariableDecl(arkts.factory.createIdentifier(id), object),
            factory.generateTernaryExpression(id, key, info),
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
        info?: OptionalMemberInfo
    ): arkts.ExpressionStatement {
        const test = arkts.factory.createBinaryExpression(
            arkts.factory.createIdentifier(testLeft),
            arkts.factory.createNullLiteral(),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_EQUAL
        );
        const consequent: arkts.Expression = arkts.factory.createUndefinedLiteral();
        return arkts.factory.createExpressionStatement(
            arkts.factory.createConditionalExpression(
                test,
                consequent,
                this.generateConditionalAlternate(testLeft, key, info)
            )
        );
    }

    static generateConditionalAlternate(testLeft: string, key: string, info?: OptionalMemberInfo): arkts.Expression {
        const leftIdent: arkts.Identifier = arkts.factory.createIdentifier(testLeft);
        const alternate: arkts.MemberExpression = UIFactory.generateMemberExpression(
            leftIdent,
            info?.isNumeric ? '$_get' : key
        );
        return info?.isCall
            ? arkts.factory.createCallExpression(alternate, undefined, undefined)
            : info?.isNumeric
            ? arkts.factory.createCallExpression(alternate, undefined, [
                  arkts.factory.createNumericLiteral(Number(key)),
              ])
            : alternate;
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
        bodyStatementsList: arkts.Statement[],
        hasReturn?: boolean
    ): arkts.ArrowFunctionExpression {
        let flag = arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW;
        if (hasReturn) {
            flag |= arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_HAS_RETURN;
        }
        return arkts.factory.createArrowFunction(
            arkts.factory.createScriptFunction(
                arkts.BlockStatement.createBlockStatement(bodyStatementsList),
                arkts.factory.createFunctionSignature(typeParams, params ? params : [], returnType, hasReceiver),
                flag,
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
                    arkts.factory.createCallExpression(generateThisBacking(callbackName), undefined, [
                        arkts.factory.createIdentifier('_'),
                    ])
                ),
            ]
        );
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
        argsContainsThis: boolean,
        memoMetadata?: arkts.AstNodeCacheValueMetadata
    ): arkts.CallExpression {
        collectStateManagementTypeImport(StateManagementTypes.STATE_MANAGEMENT_FACTORY);
        if (!!typeArguments && !!memoMetadata) {
            arkts.NodeCache.getInstance().collect(typeArguments, memoMetadata);
        }
        return arkts.factory.createCallExpression(
            UIFactory.generateMemberExpression(
                arkts.factory.createIdentifier(StateManagementTypes.STATE_MANAGEMENT_FACTORY),
                makeType
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
        const initializers = arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_INITIALIZERS_NAME);
        const binaryItem = factory.createBlockStatementForOptionalExpression(
            initializers,
            optionsHasField(originalName)
        );
        return arkts.factory.createIfStatement(
            binaryItem,
            arkts.factory.createBlock([
                arkts.factory.createExpressionStatement(arkts.factory.createCallExpression(member, undefined, args)),
            ])
        );
    }

    /*
     * create `initializers!.<originalName> as <type>`.
     */
    static generateDefiniteInitializers(type: arkts.TypeNode | undefined, originalName: string): arkts.Expression {
        return arkts.factory.createTSAsExpression(
            factory.createNonNullOrOptionalMemberExpression(
                CustomComponentNames.COMPONENT_INITIALIZERS_NAME,
                originalName,
                false,
                true
            ),
            type ? type.clone() : undefined,
            false
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
        const originType = property.typeAnnotation;
        const newType: arkts.TypeNode | undefined = !stageManagementType
            ? property.typeAnnotation ?? UIFactory.createTypeReferenceFromString(TypeNames.ANY)
            : originType;
        if (needMemo && findCanAddMemoFromTypeAnnotation(newType)) {
            addMemoAnnotation(newType);
        }
        const newProperty = arkts.factory.createClassProperty(
            arkts.factory.createIdentifier(name),
            undefined,
            !!stageManagementType ? factory.createStageManagementType(stageManagementType, originType) : newType,
            modifiers,
            false
        );
        return arkts.classPropertySetOptional(newProperty, true);
    }

    static createStageManagementType(
        stageManagementType: StateManagementTypes,
        type: arkts.TypeNode | undefined
    ): arkts.ETSTypeReference {
        collectStateManagementTypeImport(stageManagementType);
        return arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(
                arkts.factory.createIdentifier(stageManagementType),
                arkts.factory.createTSTypeParameterInstantiation([type ?? arkts.factory.createETSUndefinedType()])
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
        subscribedWatches.setAnnotations([annotation(DecoratorNames.JSONSTRINGIFYIGNORE), annotation(DecoratorNames.JSONPARSEIGNORE)]);
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
    static createV1RenderIdMembers(isObservedV2: boolean): arkts.AstNode[] {
        const v1RenderId: arkts.ClassProperty = arkts.factory.createClassProperty(
            arkts.factory.createIdentifier(ObservedNames.V1_RERENDER_ID),
            arkts.factory.createNumericLiteral(0),
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(
                    arkts.factory.createIdentifier(StateManagementTypes.RENDER_ID_TYPE)
                )
            ),
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
            false
        );
        v1RenderId.setAnnotations([annotation(DecoratorNames.JSONSTRINGIFYIGNORE), annotation(DecoratorNames.JSONPARSEIGNORE)]);
        collectStateManagementTypeImport(StateManagementTypes.RENDER_ID_TYPE);
        const setV1RenderId: arkts.MethodDefinition = factory.setV1RenderId(isObservedV2);
        return isObservedV2 ? [setV1RenderId] : [v1RenderId, setV1RenderId];
    }

    /*
     * helper for createV1RenderIdMembers to generate setV1RenderId method
     */
    static setV1RenderId(isObservedV2: boolean): arkts.MethodDefinition {
        const assignRenderId: arkts.ExpressionStatement = arkts.factory.createExpressionStatement(
            arkts.factory.createAssignmentExpression(
                generateThisBacking(ObservedNames.V1_RERENDER_ID),
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
                arkts.factory.createIdentifier(ObservedNames.RERENDER_ID)
            )
        );
        return UIFactory.createMethodDefinition({
            key: arkts.factory.createIdentifier(ObservedNames.SET_V1_RERENDER_ID),
            kind: arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            function: {
                body: arkts.factory.createBlock(isObservedV2 ? [] : [assignRenderId]),
                params: [
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier(
                            ObservedNames.RERENDER_ID,
                            UIFactory.createTypeReferenceFromString(StateManagementTypes.RENDER_ID_TYPE)
                        ),
                        undefined
                    ),
                ],
                returnTypeAnnotation: arkts.factory.createPrimitiveType(
                    arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID
                ),
                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
                modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
            },
            modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
        });
    }

    /*
     * create conditionalAddRef method in Observed/Track classes
     */
    static conditionalAddRef(isObservedV2: boolean): arkts.MethodDefinition {
        const metaAddRef: arkts.ExpressionStatement = arkts.factory.createExpressionStatement(
            arkts.factory.createCallExpression(
                UIFactory.generateMemberExpression(
                    arkts.factory.createIdentifier(ObservedNames.META),
                    ObservedNames.ADD_REF
                ),
                undefined,
                undefined
            )
        );
        collectStateManagementTypeImport(StateManagementTypes.MUTABLE_STATE_META);
        return UIFactory.createMethodDefinition({
            key: arkts.factory.createIdentifier(ObservedNames.CONDITIONAL_ADD_REF),
            kind: arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            function: {
                body: arkts.factory.createBlock(isObservedV2 ? [metaAddRef] : [factory.shouldAddRef(metaAddRef)]),
                params: [
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier(
                            ObservedNames.META,
                            UIFactory.createTypeReferenceFromString(StateManagementTypes.MUTABLE_STATE_META)
                        ),
                        undefined
                    ),
                ],
                returnTypeAnnotation: arkts.factory.createPrimitiveType(
                    arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID
                ),
                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
                modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PROTECTED,
            },
            modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PROTECTED,
        });
    }

    /*
     * helper for conditionalAddRef to generate shouldAddRef method
     */
    static shouldAddRef(metaAddRef: arkts.ExpressionStatement): arkts.IfStatement {
        const test: arkts.CallExpression = arkts.factory.createCallExpression(
            UIFactory.generateMemberExpression(
                arkts.factory.createIdentifier(StateManagementTypes.OBSERVE),
                ObservedNames.SHOULD_ADD_REF
            ),
            undefined,
            [generateThisBacking(ObservedNames.V1_RERENDER_ID)]
        );
        collectStateManagementTypeImport(StateManagementTypes.OBSERVE);
        const consequent: arkts.BlockStatement = arkts.factory.createBlock([metaAddRef]);
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
            UIFactory.createTypeReferenceFromString(StateManagementTypes.MUTABLE_STATE_META),
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
            false
        );
        meta.setAnnotations([annotation(DecoratorNames.JSONSTRINGIFYIGNORE), annotation(DecoratorNames.JSONPARSEIGNORE)]);
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
        decoratorName: DecoratorNames,
        metadata?: arkts.AstNodeCacheValueMetadata,
    ): arkts.Expression | undefined {
        let newParam: arkts.Expression | undefined;
        let wrapTypeName: StateManagementTypes | undefined;
        if (!!param && !!(wrapTypeName = DECORATOR_TYPE_MAP.get(decoratorName))) {
            newParam = factory.wrapInterfacePropertyParamExpr(param, wrapTypeName);
            if (!!metadata) {
                arkts.NodeCache.getInstance().collect(newParam, metadata);
            }
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
        decorator: DecoratorNames,
        metadata?: arkts.AstNodeCacheValueMetadata,
    ): arkts.MethodDefinition {
        if (method.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET) {
            const func = method.scriptFunction;
            const newType: arkts.TypeNode | undefined = factory.wrapStateManagementTypeToType(
                func.returnTypeAnnotation,
                decorator
            );
            removeDecorator(method, decorator);
            if (!!newType) {
                if (!!metadata) {
                    arkts.NodeCache.getInstance().collect(newType, metadata);
                }
                func.setReturnTypeAnnotation(newType);
            }
            return method;
        }
        if (method.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET) {
            const func = method.scriptFunction;
            const newParam: arkts.Expression | undefined = factory.wrapStateManagementTypeToParam(
                method.scriptFunction.params.at(0),
                decorator,
                metadata
            );
            removeDecorator(method, decorator);
            if (!!newParam) {
                func.setParams([newParam]);
            }
            return method;
        }
        return method;
    }

    /**
     * create external assignment node, e.g. `initializers?.<originalName> ?? <property>.value` or `initializers!.<originalName>!`.
     *
     * @param property class property node.
     * @param propertyType class property type.
     * @param originalName property name.
     */
    static generateInitializeValue(
        property: arkts.ClassProperty,
        propertyType: arkts.TypeNode | undefined,
        originalName: string
    ): arkts.Expression {
        const outInitialize: arkts.Expression = factory.createBlockStatementForOptionalExpression(
            arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_INITIALIZERS_NAME),
            originalName
        );
        const binaryItem: arkts.Expression = arkts.factory.createBinaryExpression(
            outInitialize,
            property.value ?? arkts.factory.createUndefinedLiteral(),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NULLISH_COALESCING
        );
        const finalBinary: arkts.Expression = property.typeAnnotation
            ? binaryItem
            : arkts.factory.createTSAsExpression(binaryItem, propertyType, false);
        return property.value ? finalBinary : factory.generateDefiniteInitializers(propertyType, originalName);
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

    static generateinitAssignment(
        monitorItem: string[] | undefined,
        originalName: string,
        newName: string,
        isFromStruct: boolean,
    ): arkts.ExpressionStatement {
        const thisValue: arkts.Expression = generateThisBacking(newName, false, false);
        const args: arkts.AstNode[] = [this.generatePathArg(monitorItem), this.generateLambdaArg(originalName)];
        if (isFromStruct) {
            args.push(arkts.factory.createThisExpression());
        }
        const right: arkts.CallExpression = factory.generateStateMgmtFactoryCall(
            StateManagementTypes.MAKE_MONITOR,
            undefined,
            args,
            false
        );
        return arkts.factory.createExpressionStatement(
            arkts.factory.createAssignmentExpression(
                thisValue,
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
                right
            )
        );
    }

    static generatePathArg(monitorItem: string[] | undefined): arkts.ArrayExpression {
        if (!monitorItem || monitorItem.length <= 0) {
            return arkts.factory.createArrayExpression([]);
        }
        const params = monitorItem.map((itemName: string) => {
            return factory.createMonitorPathsInfoParameter(itemName);
        });
        return arkts.factory.createArrayExpression(params);
    }

    static generateLambdaArg(originalName: string): arkts.ArrowFunctionExpression {
        return arkts.factory.createArrowFunction(
            UIFactory.createScriptFunction({
                params: [UIFactory.createParameterDeclaration(MonitorNames.M_PARAM, MonitorNames.I_MONITOR)],
                body: arkts.factory.createBlock([
                    arkts.factory.createExpressionStatement(
                        arkts.factory.createCallExpression(generateThisBacking(originalName), undefined, [
                            arkts.factory.createIdentifier(MonitorNames.M_PARAM),
                        ])
                    ),
                ]),
                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
            })
        );
    }

    static generateMonitorVariable(itemNameSplit: string[]): arkts.Expression {
        const objectFirst: arkts.Expression = generateThisBacking(itemNameSplit[0]);
        if (itemNameSplit.length === 1) {
            return objectFirst;
        }
        itemNameSplit.shift();
        return this.recursiveCreateOptionalMember(objectFirst, itemNameSplit);
    }

    /**
     * recursively create member expression with <object> node and property name in <resNameArr>.
     *
     * @param typeAnnotation expecting property's original type annotation.
     */
    static recursiveCreateOptionalMember(object: arkts.Expression, resNameArr: string[]): arkts.Expression {
        if (resNameArr.length <= 0) {
            return object;
        }
        const optionalInfo: OptionalMemberInfo = { isNumeric: false };
        if (isNumeric(resNameArr[0])) {
            optionalInfo.isNumeric = true;
        }
        const newMember: arkts.Expression = this.createBlockStatementForOptionalExpression(
            object,
            resNameArr[0],
            optionalInfo
        );
        resNameArr.shift();
        return this.recursiveCreateOptionalMember(newMember, resNameArr);
    }

    /**
     * create IMonitorPathsInfo type parameter `{ path: "<monitorItem>", lambda: () => { return this.<monitorItem> } }`.
     *
     * @param monitorItem monitored property name.
     */
    static createMonitorPathsInfoParameter(monitorItem: string): arkts.ObjectExpression {
        const itemNameSplit: string[] = monitorItem.split('.');
        let monitorVariable: arkts.Expression = arkts.factory.createUndefinedLiteral();
        if (itemNameSplit.length > 0) {
            monitorVariable = this.generateMonitorVariable(itemNameSplit);
        }
        return arkts.factory.createObjectExpression(
            arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
            [
                arkts.factory.createProperty(
                    arkts.factory.createIdentifier(MonitorNames.PATH),
                    arkts.factory.create1StringLiteral(monitorItem)
                ),
                arkts.factory.createProperty(
                    arkts.factory.createIdentifier(MonitorNames.VALUE_CALL_CACK),
                    arkts.factory.createArrowFunction(
                        UIFactory.createScriptFunction({
                            flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                            body: arkts.factory.createBlock([arkts.factory.createReturnStatement(monitorVariable)]),
                            returnTypeAnnotation: UIFactory.createTypeReferenceFromString(TypeNames.ANY),
                        })
                    )
                ),
            ],
            false
        );
    }

    static generateComputedOwnerAssignment(newName: string): arkts.ExpressionStatement {
        const computedVariable = UIFactory.generateMemberExpression(arkts.factory.createThisExpression(), newName, false);
        const setOwnerFunc = UIFactory.generateMemberExpression(computedVariable, StateManagementTypes.SET_OWNER, false);
        return arkts.factory.createExpressionStatement(
            arkts.factory.createCallExpression(setOwnerFunc, undefined, [arkts.factory.createThisExpression()]));
    }
}
