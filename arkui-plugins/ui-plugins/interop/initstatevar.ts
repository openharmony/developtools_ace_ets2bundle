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
import { ESValueMethodNames, InteroperAbilityNames } from './predefines';
import { annotation, backingField, isAnnotation } from '../../common/arkts-utils';
import { stateProxy, getPropertyESValue, getWrapValue, ifStateHasProxy, setPropertyESValue } from './utils';
import { hasDecorator } from '../property-translators/utils';
import { DecoratorNames } from '../../common/predefines';


export function initialArgs(args: arkts.ObjectExpression, varMap: Map<string, arkts.ClassProperty>, updateProp: arkts.Property[]): arkts.Statement[] {
    const result: arkts.Statement[] = [];
    const proxySet = new Set<string>();


    for (const property of args.properties) {
        if (!(property instanceof arkts.Property)) {
            continue;
        }   
        const key = property.key;
        const value = property.value!;
        if (!(key instanceof arkts.Identifier)) {
            throw Error('Error arguments in Legacy Component');
        }
        const keyName = key.name;
        const keyProperty = varMap.get(keyName);
        if (keyProperty === undefined) {
            throw Error('Error arguments in Legacy Component');
        }
        const keyType = keyProperty.typeAnnotation!;
        const decorators = keyProperty.decorators;
        if (decorators.length === 0) {
            const valueProperty = arkts.getDecl(value);
            if (valueProperty instanceof arkts.ClassProperty && (hasDecorator(valueProperty, DecoratorNames.PROVIDE) ||
                hasDecorator(valueProperty, DecoratorNames.CONSUME))) {
                throw Error('Cannot assign @Provide or @Consume decorated data to regular property.');
            }
            const initParam = processNormal(keyName, value);
            result.push(...initParam);
        }
        if (hasDecorator(keyProperty, DecoratorNames.LINK)) {
            const initParam = processLink(keyName, value, keyType, proxySet);
            result.push(...initParam);
        } else if (hasDecorator(keyProperty, DecoratorNames.CONSUME)) {
            throw Error ('The @Consume property cannot be assigned.');
        } else if (hasDecorator(keyProperty, DecoratorNames.PROP)) {
            updateProp.push(property);
            const initParam = processNormal(keyName, value);
            result.push(...initParam);
        } else if (hasDecorator(keyProperty, DecoratorNames.STATE) || hasDecorator(keyProperty, DecoratorNames.PROVIDE)) {
            const initParam = processNormal(keyName, value);
            result.push(...initParam);
        } else if (hasDecorator(keyProperty, DecoratorNames.CONSUME)) {
            throw Error ('The @Consume property cannot be assigned.');
        } else {
            throw Error ('Unsupported decorators.');
        }
    }
    return result;
}

export function createVariableLet(varName: string, expression: arkts.AstNode): arkts.VariableDeclaration {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [arkts.factory.createVariableDeclarator(
            arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
            arkts.factory.createIdentifier(varName),
            expression
        )]
    );
}
function setValueCallback(name: string, block: arkts.BlockStatement, type?: arkts.TypeNode): arkts.AstNode {
    return createVariableLet(name,
        arkts.factory.createArrowFunction(
            arkts.factory.createScriptFunction(
                block,
                arkts.factory.createFunctionSignature(
                    undefined,
                    [
                        arkts.factory.createParameterDeclaration(
                            arkts.factory.createIdentifier(
                                'value',
                                type ?? arkts.factory.createTypeReference(
                                    arkts.factory.createTypeReferencePart(
                                        arkts.factory.createIdentifier('Object')
                                    )
                                )
                            ),
                            undefined
                        )
                    ],
                    undefined,
                    false
                ),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            )
        )
    );
}

function createProxyBlock(stateVar: () => arkts.Expression): arkts.BlockStatement {
    return arkts.factory.createBlock(
        [
            arkts.factory.createExpressionStatement(
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        stateVar(),
                        arkts.factory.createIdentifier('set'),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    undefined,
                    [
                        arkts.factory.createIdentifier('value')
                    ]
                )
            )
        ]
    );
}

function setCallbackForProxy(stateVar: () => arkts.Expression, type?: arkts.TypeNode): arkts.Statement[] {
    const createCallback = setValueCallback('setSource', createProxyBlock(stateVar), type);
    const createProxyState = createVariableLet('proxyState',
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier('createState'),
                arkts.factory.createIdentifier(ESValueMethodNames.INVOKE),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            [
                getWrapValue(
                    arkts.factory.createCallExpression(
                        arkts.factory.createMemberExpression(
                            stateVar(),
                            arkts.factory.createIdentifier('get'),
                            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                            false,
                            false
                        ),
                        undefined,
                        []
                    )
                ),
                getWrapValue(arkts.factory.createIdentifier('setSource'))
            ]
        )
    );
    return [createCallback, createProxyState];
}

function createSourceBlock(): arkts.BlockStatement {
    return arkts.factory.createBlock(
        [
            arkts.factory.createExpressionStatement(
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createIdentifier('proxyState'),
                        arkts.factory.createIdentifier(ESValueMethodNames.INVOKEMETHOD),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    undefined,
                    [
                        arkts.factory.createStringLiteral('set'),
                        getWrapValue(
                            arkts.factory.createIdentifier('value')
                        )
                    ]
                )
            )
        ]
    );
}

function createNotifyBlock(): arkts.BlockStatement {
    return arkts.factory.createBlock(
        [
            arkts.factory.createExpressionStatement(
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createIdentifier('proxyState'),
                        arkts.factory.createIdentifier(ESValueMethodNames.INVOKEMETHOD),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    undefined,
                    [
                        arkts.factory.createStringLiteral('notifyPropertyHasChangedPU')
                    ]
                )
            )
        ]
    );
}

function setCallbackForSource(type?: arkts.TypeNode): arkts.Statement[] {
    const createValueCallback = setValueCallback('setProxy', createSourceBlock(), type);
    const block = createNotifyBlock();
    const createNotifyCallback = createVariableLet('notifyCallback',
        arkts.factory.createArrowFunction(
            arkts.factory.createScriptFunction(
                block,
                arkts.factory.createFunctionSignature(
                    undefined,
                    [
                        arkts.factory.createParameterDeclaration(
                            arkts.factory.createIdentifier('propertyName',
                                arkts.factory.createTypeReference(
                                    arkts.factory.createTypeReferencePart(
                                        arkts.factory.createIdentifier('string')
                                    )
                                )
                            ),
                            undefined,
                        ),
                    ],
                    undefined,
                    false
                ),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            )
        )
    );
    return [createValueCallback, createNotifyCallback];
}

function bindCompatibleState(stateVar: () => arkts.Expression): arkts.Statement {
    return arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createIdentifier(InteroperAbilityNames.CONFIGURESTATE),
            undefined,
            [
                stateVar(),
                arkts.factory.createIdentifier('proxyState'),
                arkts.factory.createIdentifier('setProxy'),
                arkts.factory.createIdentifier('notifyCallback'),
            ],
        )
    );
}

function createProxyForState(stateVar: () => arkts.Expression, type?: arkts.TypeNode): arkts.Statement[] {
    const setProxy = setCallbackForProxy(stateVar, type);
    const setSource = setCallbackForSource(type);
    const cfgState = bindCompatibleState(stateVar);
    return [...setProxy, ...setSource, cfgState];
}


export function setStateProxy(stateVar: () => arkts.Expression, type?: arkts.TypeNode): arkts.Statement[] {
    const statements = createProxyForState(stateVar, type);
    const ifProxy = ifStateHasProxy(stateVar, arkts.factory.createBlock(statements));
    return [ifProxy];
}

function createBackingFieldExpression(varName: string): arkts.TSNonNullExpression {
    return arkts.factory.createTSNonNullExpression(
        arkts.factory.createMemberExpression(
        arkts.factory.createThisExpression(),
        arkts.factory.createIdentifier(backingField(varName)),
        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
        false,
        false
        )
    );
}

function setAndGetProxy(varName: string, type: arkts.TypeNode, stateVar: () => arkts.Expression,
    proxySet: Set<string>): arkts.Statement[] {
    const result: arkts.Statement[] = [];
    if (!proxySet.has(stateProxy(varName))) {
        proxySet.add(stateProxy(varName));
        const setProxy = setStateProxy(stateVar, type);
        const getProxy = createVariableLet(
            stateProxy(varName),
            arkts.factory.createCallExpression(
                arkts.factory.createIdentifier(InteroperAbilityNames.GETPROXY),
                undefined,
                [
                    stateVar()
                ]
            )
        );
        result.push(...setProxy, getProxy);
    }
    return result;
}

function linkGetSource(varName: string, proxySet: Set<string>): arkts.Statement[] {
    const result: arkts.Statement[] = [];
    const backingLink = createBackingFieldExpression(varName);
    const stateName = `${varName}_State`;
    if (!proxySet.has(stateName)) {
        proxySet.add(stateName);
        const getState = createVariableLet(
            stateName,
            arkts.factory.createCallExpression(
                arkts.factory.createIdentifier(InteroperAbilityNames.GETSOURCE),
                undefined,
                [
                    backingLink
                ]
            )
        );
        result.push(getState);
    }
    return result;
}

/**
 * 
 * @param keyName 
 * @param value 
 * @param type 
 * @param proxySet 
 * @returns generate code to process @Link data interoperability
 */
export function processLink(keyName: string, value: arkts.Expression, type: arkts.TypeNode, proxySet: Set<string>): arkts.Statement[] {
    const valueDecl = arkts.getDecl(value);
    const result: arkts.Statement[] = [];
    if (valueDecl instanceof arkts.ClassProperty) {
        let varName: string;
        let stateVar: () => arkts.Expression;

        if (hasDecorator(valueDecl, DecoratorNames.STATE) || hasDecorator(valueDecl, DecoratorNames.PROP) ||
            hasDecorator(valueDecl, DecoratorNames.PROVIDE)) {
            varName = ((value as arkts.MemberExpression).property as arkts.Identifier).name;
            stateVar = (): arkts.TSNonNullExpression => createBackingFieldExpression(varName);
        } else if (hasDecorator(valueDecl, DecoratorNames.LINK) || hasDecorator(valueDecl, DecoratorNames.CONSUME)) {
            varName = ((value as arkts.MemberExpression).property as arkts.Identifier).name;
            const stateName = `${varName}_State`;
            const getSource = linkGetSource(varName, proxySet);
            result.push(...getSource);    
            stateVar = (): arkts.TSNonNullExpression => arkts.factory.createTSNonNullExpression(
                arkts.factory.createIdentifier(stateName)
            );
        } else {
            throw Error('unsupported decorator for Link');
        }
        
        const proxyGet = setAndGetProxy(varName, type, stateVar, proxySet);
        result.push(...proxyGet);
        
        const setParam = setPropertyESValue(
            'param',
            keyName,
            arkts.factory.createIdentifier(stateProxy(varName))
        );
        result.push(setParam);
    } else {
        throw Error('unsupported data for Link');
    }
    return result;
}

/**
 * 
 * @param keyName 
 * @param value 
 * @returns generate code to process regular data interoperability
 */
export function processNormal(keyName: string, value: arkts.AstNode): arkts.Statement[] {
    const result: arkts.Statement[] = [];
    const setProperty = setPropertyESValue(
        InteroperAbilityNames.PARAM,
        keyName,
        getWrapValue(value)
    );
    result.push(setProperty);
    return result;
}