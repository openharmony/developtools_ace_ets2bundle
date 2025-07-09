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
import { InteroperAbilityNames } from './predefines';
import { annotation, backingField, isAnnotation } from '../../common/arkts-utils';
import { stateProxy, getWrapValue, setPropertyESValue } from './utils';
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
        const annotations = keyProperty.annotations;
        if (annotations.length === 0) {
            const valueProperty = arkts.getDecl(value);
            if (valueProperty instanceof arkts.ClassProperty && (hasDecorator(valueProperty, DecoratorNames.PROVIDE) ||
                hasDecorator(valueProperty, DecoratorNames.CONSUME))) {
                throw Error('Cannot assign @Provide or @Consume decorated data to regular property.');
            }
            const initParam = processNormal(keyName, value);
            result.push(...initParam);
        } else if (hasDecorator(keyProperty, DecoratorNames.LINK) || hasDecorator(keyProperty, DecoratorNames.OBJECT_LINK)) {
            const initParam = processLink(keyName, value, keyType, proxySet);
            result.push(...initParam);
        } else if (hasDecorator(keyProperty, DecoratorNames.CONSUME)) {
            throw Error('The @Consume property cannot be assigned.');
        } else if (hasDecorator(keyProperty, DecoratorNames.PROP)) {
            updateProp.push(property);
            const initParam = processNormal(keyName, value);
            result.push(...initParam);
        } else if (hasDecorator(keyProperty, DecoratorNames.STATE) || hasDecorator(keyProperty, DecoratorNames.PROVIDE)) {
            const initParam = processNormal(keyName, value);
            result.push(...initParam);
        } else if (hasDecorator(keyProperty, DecoratorNames.CONSUME)) {
            throw Error('The @Consume property cannot be assigned.');
        } else {
            const initParam = processNormal(keyName, value);
            result.push(...initParam);
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


function getStateProxy(proxyName: string, stateVar: () => arkts.Expression): arkts.Statement {
    return createVariableLet(
        proxyName,
        arkts.factory.createCallExpression(
            arkts.factory.createIdentifier(InteroperAbilityNames.GETCOMPATIBLESTATE),
            undefined,
            [
                stateVar(),
                arkts.factory.createIdentifier(InteroperAbilityNames.CREATESTATE)
            ]
        )
    );
}

/**
 * 
 * @param keyName 
 * @param value 
 * @param type 
 * @param proxySet 
 * @returns generate code to process @Link, @ObjectLink data interoperability
 */
export function processLink(keyName: string, value: arkts.Expression, type: arkts.TypeNode, proxySet: Set<string>): arkts.Statement[] {
    const valueDecl = arkts.getDecl(value);
    const result: arkts.Statement[] = [];
    if (valueDecl instanceof arkts.ClassProperty) {
        let varName = ((value as arkts.MemberExpression).property as arkts.Identifier).name;
        let proxyName = stateProxy(varName);
        let stateVar = (): arkts.TSNonNullExpression => createBackingFieldExpression(varName);
        if (!proxySet.has(varName)) {
            proxySet.add(varName);
            const getProxy = getStateProxy(proxyName, stateVar);
            result.push(getProxy);
        }
        const setParam = setPropertyESValue(
            'param',
            keyName,
            arkts.factory.createIdentifier(proxyName)
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