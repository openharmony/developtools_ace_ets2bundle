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
import { BuilderMethodNames, InteroperAbilityNames } from './predefines';
import { annotation, backingField, isAnnotation } from '../../common/arkts-utils';
import { stateProxy, getWrapValue, setPropertyESValue, createEmptyESValue } from './utils';
import { hasDecorator } from '../property-translators/utils';
import { DecoratorNames } from '../../common/predefines';


export function initialArgs(
    args: arkts.ObjectExpression,
    varMap: Map<string, arkts.ClassProperty>,
    updateProp: arkts.Property[],
    node: arkts.CallExpression,
    isV2: boolean
): arkts.Statement[] {
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
            continue;
        }
        checkArgsV1InteropV2(keyName, keyProperty, value, node, isV2);
        const keyType = keyProperty.typeAnnotation!;
        const annotations = keyProperty.annotations;
        if (annotations.length === 0) {
            const valueProperty = arkts.getDecl(value);
            if (valueProperty instanceof arkts.ClassProperty && (hasDecorator(valueProperty, DecoratorNames.PROVIDE) ||
                hasDecorator(valueProperty, DecoratorNames.CONSUME))) {
                const errorMessage = 'Cannot assign @Provide or @Consume decorated data to regular property.';
                logDiagnostic(errorMessage, node);
            }
            const initParam = processNormal(keyName, value);
            result.push(...initParam);
        } else if (hasDecorator(keyProperty, DecoratorNames.LINK)) {
            const initParam = processLink(keyName, value, keyType, proxySet);
            result.push(...initParam);
        } else if (hasDecorator(keyProperty, DecoratorNames.CONSUME)) {
            const errorMessage = 'The @Consume property cannot be assigned.';
            logDiagnostic(errorMessage, node);
        } else if (hasDecorator(keyProperty, DecoratorNames.PROP) || hasDecorator(keyProperty, DecoratorNames.OBJECT_LINK) || hasDecorator(keyProperty, DecoratorNames.PARAM)) {
            updateProp.push(property);
            const initParam = processNormal(keyName, value);
            result.push(...initParam);
        } else if (hasDecorator(keyProperty, DecoratorNames.STATE) || hasDecorator(keyProperty, DecoratorNames.PROVIDE)) {
            const initParam = processNormal(keyName, value);
            result.push(...initParam);
        } else if (hasDecorator(keyProperty, DecoratorNames.CONSUME)) {
            const errorMessage = 'The @Consume property cannot be assigned.';
            logDiagnostic(errorMessage, node);
        } else if (hasDecorator(keyProperty, DecoratorNames.BUILDER_PARAM)) {
            const initParam = processBuilderParam(keyName, value);
            result.push(...initParam);
        } else {
            const initParam = processNormal(keyName, value);
            result.push(...initParam);
        }
    }
    return result;
}

function checkArgsV1InteropV2(
    keyName: string,
    keyProperty: arkts.ClassProperty,
    value: arkts.AstNode,
    node: arkts.CallExpression,
    isV2: boolean
): void {
    const valueProperty = arkts.getDecl(value);
    let ketType = 'regular';
    let valueType = 'regular';
    if (!(value instanceof arkts.MemberExpression && value.object instanceof arkts.ThisExpression)) {
        return;
    }
    let valueName = value.property.name;
    let isComponentV2forParent = false;
    if (valueProperty) {
        isComponentV2forParent = valueProperty.parent?.annotations?.some(
            (annotation) => annotation.expr instanceof arkts.Identifier && annotation.expr.name === 'ComponentV2'
        );
    }
    if (valueProperty && arkts.isMethodDefinition(valueProperty)) {
        valueProperty.scriptFunction.annotations.forEach((annotations) => (valueType = getPropertyType(annotations)));
    }
    if (valueProperty && arkts.isClassProperty(valueProperty)) {
        valueProperty.annotations.forEach((annotations) => (valueType = getPropertyType(annotations)));
    }
    if (keyProperty && keyProperty.annotations) {
        keyProperty.annotations.forEach((annotations) => (ketType = getPropertyType(annotations)));
    }
    if (isV2) {
        if (!isComponentV2forParent) {
            let errorMessage = `The ${valueType} property '${valueName}' cannot be assigned to the ${ketType} property '${keyName}' when interop`;
            logDiagnostic(errorMessage, node);
        }
    } else {
        if (isComponentV2forParent) {
            if (keyProperty.annotations && keyProperty.annotations.length !== 0) {
                let errorMessage = `The ${valueType} property '${valueName}' cannot be assigned to the ${ketType} property '${keyName}' when interop`;
                logDiagnostic(errorMessage, node);
            }
        }
    }
}

export function getPropertyType(anno: arkts.AnnotationUsage): string {
    let propertyType = 'regular';
    if (!!anno.expr && arkts.isIdentifier(anno.expr)) {
        propertyType = anno.expr.name;
    }
    if (propertyType !== 'regular' && propertyType !== '') {
        return '@' + propertyType;
    } else {
        return 'regular';
    }
}

export function logDiagnostic(errorMessage: string, node: arkts.AstNode): void {
    const diagnosticKind = arkts.DiagnosticKind.create(errorMessage, arkts.PluginDiagnosticType.ES2PANDA_PLUGIN_ERROR);
    arkts.Diagnostic.logDiagnostic(diagnosticKind, arkts.getStartPosition(node));
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
                stateVar()
            ]
        )
    );
}

/**
 * Processes a nested object literal and generates code to instantiate and populate it using ESValue methods.
 * 
 * Converts a nested object structure into a sequence of statements that:
 * 1. Instantiate empty objects via `ESValue.instantiateEmptyObject()`
 * 2. Sets properties on these objects using `setProperty()`
 * 3. Nests objects by assigning child objects as properties of parent objects
 * 
 * @param target - A nested object literal (e.g., { b: { c: { d: '1' }, cc: { d: '1' } } })
 * @returns Generated code statements that reconstruct the input object using ESValue APIs
 * @example
 * Input: { b: { c: { d: '1' }, cc: { d: '1' } } }
 * Output: 
 * let param0 = ESValue.instantiateEmptyObject();
 * let param00 = ESValue.instantiateEmptyObject();
 * param00.setProperty("d", ESValue.wrap("1"));
 * param0.setProperty("c", param00);
 * let param01 = ESValue.instantiateEmptyObject();
 * param01.setProperty("d", ESValue.wrap("1"));
 * param0.setProperty("cc", param01);
 * param.setProperty("b", param0);
 */
function processObjectLiteral(target: arkts.ObjectExpression, curParam: string, result: arkts.Statement[], keyName: string): void {
    if (curParam !== InteroperAbilityNames.PARAM) {
        const createParam = createEmptyESValue(curParam);
        result.push(createParam);
    }
    target.properties.forEach((property: { key: arkts.Expression; value: arkts.Expression; }) => {
        const paramName = curParam + keyName;
        const key = property.key;
        const value = property.value;
        if (arkts.isObjectExpression(value)) {
            processObjectLiteral(value, paramName, result, keyName);
            const setProperty = setPropertyESValue(
                curParam,
                key.name,
                arkts.factory.createIdentifier(paramName)
            );
            result.push(setProperty);
        } else {
            const setProperty = setPropertyESValue(
                curParam,
                key.name,
                getWrapValue(value)
            );
            result.push(setProperty);
        }
    });
}


/**
 * 
 * @param keyName - The name of the state variable (e.g., state)
 * @returns generate code to process @Link data interoperability
 * @example
 * Input: {link: this.state}
 * Output:
 * let __Proxy_state = getCompatibleState(this.state);
 * param.setProperty("link", __Proxy_state);
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
 * @param keyName - The name of the state variable (e.g., state)
 * @returns generate code to process regular data interoperability
 */
export function processNormal(keyName: string, value: arkts.AstNode): arkts.Statement[] {
    const result: arkts.Statement[] = [];
    if (arkts.isObjectExpression(value)) {
        processObjectLiteral(value, InteroperAbilityNames.PARAM, result, keyName);
    } else {
        const setProperty = setPropertyESValue(
            InteroperAbilityNames.PARAM,
            keyName,
            getWrapValue(value)
        );
        result.push(setProperty);
    }
    return result;
}

/**
 * 
 * @param keyName 
 * @param value 
 * @returns generate code to process @BuilderParam interoperability
 * @example
 * Input: {builderParam: this.builder}
 * Output: param.setProperty("builderParam", transferCompatibleBuilder(this.builder));
 */
export function processBuilderParam(keyName: string, value: arkts.AstNode): arkts.Statement[] {
    const result: arkts.Statement[] = [];
    const needUpdate: boolean = checkUpdatable(value);
    const newValue = arkts.factory.createCallExpression(
        needUpdate ? arkts.factory.createIdentifier(BuilderMethodNames.TRANSFERCOMPATIBLEUPDATABLEBUILDER) :
        arkts.factory.createIdentifier(BuilderMethodNames.TRANSFERCOMPATIBLEBUILDER),
        undefined,
        [
            value
        ]
    );
    const setProperty = setPropertyESValue(
        InteroperAbilityNames.PARAM,
        keyName,
        newValue
    );
    result.push(setProperty);
    return result;
}

function getIdentifier(value: arkts.AstNode): arkts.identifier | undefined {
    if (arkts.isIdentifier(value)) {
        return value;
    } else if (arkts.isMemberExpression(value) && arkts.isThisExpression(value.object) && arkts.isIdentifier(value.property)) {
        return value.property;
    } else {
        return undefined;
    }
}

function checkUpdatable(value: arkts.AstNode): boolean {
    const ident = getIdentifier(value);
    if (ident === undefined) {
        return false;
    }
    const decl = arkts.getDecl(ident) as arkts.MethodDefinition;
    const script = decl.scriptFunction;
    const params = script.params;
    if (params.length === 1 && arkts.isEtsParameterExpression(params[0])) {
        const type = params[0].type;
        if (type === undefined) {
            return false;
        }
        if (arkts.isETSUnionType(type)) {
            for (const element of type.types) {
                if (isNonBuiltinType(element)) {
                    return true;
                }
            }
        } else if (isNonBuiltinType(type)) {
            return true;
        }
    }
    return false;
}

function isNonBuiltinType(type: arkts.AstNode): boolean {
    if (!arkts.isETSTypeReference(type)) {
        return false;
    }
    const ident = type.part?.name;
    if (ident && arkts.isIdentifier(ident)) {
        const decl = arkts.getDecl(ident);
        if (!decl) {
            return false;
        }
        const moduleName = arkts.getProgramFromAstNode(decl).moduleName;
        if (moduleName === 'escompat') {
            return false;
        }
        return true;
    }
    return false;
}