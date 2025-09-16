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
import { BuilderMethodNames, ESValueMethodNames, InteroperAbilityNames } from './predefines';
import { LANGUAGE_VERSION } from '../../common/predefines';
import { FileManager } from '../../common/file-manager';
import { BuilderLambdaNames } from '../utils';
import { ImportCollector } from '../../common/import-collector';


/**
 * 
 * @param result 
 * @returns let result = ESValue.instantiateEmptyObject()
 */
export function createEmptyESValue(result: string): arkts.VariableDeclaration {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [
            arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                arkts.factory.createIdentifier(result),
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createIdentifier(ESValueMethodNames.ESVALUE),
                        arkts.factory.createIdentifier(ESValueMethodNames.INITEMPTYOBJECT),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    undefined,
                    undefined
                )
            )
        ]
    );
}

/**
 * 
 * @param value 
 * @returns ESValue.wrap(value)
 */
export function getWrapValue(value: arkts.AstNode): arkts.AstNode {
    return arkts.factory.createCallExpression(
        arkts.factory.createMemberExpression(
            arkts.factory.createIdentifier(ESValueMethodNames.ESVALUE),
            arkts.factory.createIdentifier(ESValueMethodNames.WRAP),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        ),
        undefined,
        [value]
    );
}

/**
 * 
 * @param object 
 * @param key 
 * @param value 
 * @returns object.setProperty(key, value)
 */
export function setPropertyESValue(object: string, key: string, value: arkts.AstNode): arkts.ExpressionStatement {
    return arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(object),
                arkts.factory.createIdentifier(ESValueMethodNames.SETPROPERTY),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            [
                arkts.factory.createStringLiteral(key),
                value.clone()
            ]
        )
    );
}

/**
 * 
 * @param result 
 * @param obj 
 * @param key 
 * @returns let result = object.getProperty(key)
 */
export function getPropertyESValue(result: string, obj: string, key: string): arkts.VariableDeclaration {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [
            arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                arkts.factory.createIdentifier(result),
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createIdentifier(obj),
                        arkts.factory.createIdentifier(ESValueMethodNames.GETPROPERTY),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    undefined,
                    [arkts.factory.create1StringLiteral(key)]
                )
            )
        ]
    );
}

/**
 * 
 * @param {string} stateVarName - Original state variable name to be proxied.
 * @returns {string} Proxied variable name in the format: "__Proxy_{stateVarName}".
 */
export function stateProxy(stateVarName: string): string {
    return `__Proxy_${stateVarName}`;
}

/**
 * get elmtId
 * @returns         
 *      let viewStackProcessor = global.getProperty("ViewStackProcessor");
 *      let createId = viewStackProcessor.getProperty("AllocateNewElmetIdForNextComponent");
 *      let elmtId = createId.invoke();
 */
export function createELMTID(): arkts.Statement[] {
    const body: arkts.Statement[] = [];
    const viewStackProcessor = getPropertyESValue('viewStackProcessor', InteroperAbilityNames.GLOBAL, 'ViewStackProcessor');
    body.push(viewStackProcessor);
    const createId = getPropertyESValue('createId', 'viewStackProcessor', 'AllocateNewElmetIdForNextComponent');
    body.push(createId);
    const elmtId = arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [arkts.factory.createVariableDeclarator(
            arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
            arkts.factory.createIdentifier(InteroperAbilityNames.ELMTID),
            arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    arkts.factory.createIdentifier('createId'),
                    arkts.factory.createIdentifier(ESValueMethodNames.INVOKE),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                undefined,
                undefined
            )
        )]
    );
    body.push(elmtId);
    return body;
}

/**
 * 
 * @param componentName 
 * @returns return {
 *              component: component,
 *              name: componentName,
 *          };
 */
export function createInitReturn(componentName: string): arkts.ReturnStatement {
    return arkts.factory.createReturnStatement(
        arkts.ObjectExpression.createObjectExpression(
            arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
            [
                arkts.Property.createProperty(
                    arkts.factory.createIdentifier(InteroperAbilityNames.COMPONENT),
                    arkts.factory.createIdentifier(InteroperAbilityNames.COMPONENT)
                ),
                arkts.Property.createProperty(
                    arkts.factory.createIdentifier('name'),
                    arkts.factory.createStringLiteral(componentName)
                )
            ],
            false
        ),
    );
}

/**
 * createGlobal 
 * @returns let global = ESValue.getGlobal();
 */
export function createGlobal(): arkts.Statement {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [arkts.factory.createVariableDeclarator(
            arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
            arkts.factory.createIdentifier(InteroperAbilityNames.GLOBAL),
            arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    arkts.factory.createIdentifier(ESValueMethodNames.ESVALUE),
                    arkts.factory.createIdentifier('getGlobal'),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                undefined,
                undefined
            )
        )]
    );
}


export function isInstantiateImpl(node: arkts.MemberExpression): boolean {
    const property = node.property;
    if (arkts.isIdentifier(property) && property.name === BuilderLambdaNames.ORIGIN_METHOD_NAME) {
        return true;
    }
    return false;
}

export function isArkTS1_1(node: arkts.MemberExpression): boolean {
    const struct = node.object;
    const decl = arkts.getDecl(struct);
    if (!decl || !arkts.isClassDefinition(decl) || decl.lang !== arkts.Es2pandaLanguage.JS) {
        return false;
    }
    return true;
}

export function isInteropComponent(node: arkts.CallExpression): boolean {
    if (
        arkts.isMemberExpression(node.expression) &&
        isInstantiateImpl(node.expression) &&
        isArkTS1_1(node.expression)
    ) {
        ImportCollector.getInstance().collectSource(InteroperAbilityNames.ARKUICOMPATIBLE, InteroperAbilityNames.INTEROP);
        ImportCollector.getInstance().collectImport(InteroperAbilityNames.ARKUICOMPATIBLE);
        ImportCollector.getInstance().collectSource(InteroperAbilityNames.GETCOMPATIBLESTATE, InteroperAbilityNames.INTEROP);
        ImportCollector.getInstance().collectImport(InteroperAbilityNames.GETCOMPATIBLESTATE);
        ImportCollector.getInstance().collectSource(BuilderMethodNames.TRANSFERCOMPATIBLEBUILDER, InteroperAbilityNames.INTEROP);
        ImportCollector.getInstance().collectImport(BuilderMethodNames.TRANSFERCOMPATIBLEBUILDER);
        ImportCollector.getInstance().collectSource(BuilderMethodNames.TRANSFERCOMPATIBLEUPDATABLEBUILDER, InteroperAbilityNames.INTEROP);
        ImportCollector.getInstance().collectImport(BuilderMethodNames.TRANSFERCOMPATIBLEUPDATABLEBUILDER);
        return true;
    }
    return false;
}
