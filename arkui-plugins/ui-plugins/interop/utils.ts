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
import { BuilderMethodNames, ESValueMethodNames, InteroperAbilityNames, GLOBAL_ANNOTATION_MODULE } from './predefines';
import { LANGUAGE_VERSION, DecoratorNames } from '../../common/predefines';
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
                    [],
                    undefined,
                    false,
                    false
                )
            ),
        ]
    );
}

/**
 *
 * @param value
 * @returns ESValue.wrap(value)
 */
export function getWrapValue(value: arkts.Expression): arkts.Expression {
    return arkts.factory.createCallExpression(
        arkts.factory.createMemberExpression(
            arkts.factory.createIdentifier(ESValueMethodNames.ESVALUE),
            arkts.factory.createIdentifier(ESValueMethodNames.WRAP),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        ),
        [value],
        undefined,
        false,
        false
    );
}

/**
 *
 * @param object
 * @param key
 * @param value
 * @returns object.setProperty(key, value)
 */
export function setPropertyESValue(object: string, key: string, value: arkts.Expression): arkts.ExpressionStatement {
    return arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(object),
                arkts.factory.createIdentifier(ESValueMethodNames.SETPROPERTY),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            [arkts.factory.createStringLiteral(key), value.clone()],
            undefined,
            false,
            false
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
                    [arkts.factory.createStringLiteral(key)],
                    undefined,
                    false,
                    false
                )
            ),
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
    const viewStackProcessor = getPropertyESValue(
        'viewStackProcessor',
        InteroperAbilityNames.GLOBAL,
        'ViewStackProcessor'
    );
    body.push(viewStackProcessor);
    const createId = getPropertyESValue('createId', 'viewStackProcessor', 'AllocateNewElmetIdForNextComponent');
    body.push(createId);
    const elmtId = arkts.factory.createVariableDeclaration(
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [
            arkts.factory.createVariableDeclarator(
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
                    [],
                    undefined,
                    false,
                    false
                )
            ),
        ]
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
                arkts.Property.create1Property(
                    arkts.Es2pandaPropertyKind.PROPERTY_KIND_INIT,
                    arkts.factory.createIdentifier(InteroperAbilityNames.COMPONENT),
                    arkts.factory.createIdentifier(InteroperAbilityNames.COMPONENT),
                    false,
                    false
                ),
                arkts.Property.create1Property(
                    arkts.Es2pandaPropertyKind.PROPERTY_KIND_INIT,
                    arkts.factory.createIdentifier('name'),
                    arkts.factory.createStringLiteral(componentName),
                    false,
                    false
                ),
            ],
            false
        )
    );
}

/**
 * createGlobal
 * @returns let global = ESValue.getGlobal();
 */
export function createGlobal(): arkts.Statement {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [
            arkts.factory.createVariableDeclarator(
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
                    [],
                    undefined,
                    false,
                    false
                )
            ),
        ]
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
    const decl = struct && arkts.getDecl(struct);
    if (!decl || !arkts.isClassDefinition(decl) || decl.language !== arkts.Es2pandaLanguage.LANGUAGE_JS) {
        return false;
    }
    return true;
}

export function insertInteropComponentImports(): void {
    ImportCollector.getInstance().collectSource(InteroperAbilityNames.ARKUICOMPATIBLE, InteroperAbilityNames.INTEROP);
    ImportCollector.getInstance().collectImport(InteroperAbilityNames.ARKUICOMPATIBLE);
    ImportCollector.getInstance().collectSource(
        InteroperAbilityNames.GETCOMPATIBLESTATE,
        InteroperAbilityNames.INTEROP
    );
    ImportCollector.getInstance().collectImport(InteroperAbilityNames.GETCOMPATIBLESTATE);
    ImportCollector.getInstance().collectSource(
        BuilderMethodNames.TRANSFERCOMPATIBLEBUILDER,
        InteroperAbilityNames.INTEROP
    );
    ImportCollector.getInstance().collectImport(BuilderMethodNames.TRANSFERCOMPATIBLEBUILDER);
    ImportCollector.getInstance().collectSource(
        BuilderMethodNames.TRANSFERCOMPATIBLEUPDATABLEBUILDER,
        InteroperAbilityNames.INTEROP
    );
    ImportCollector.getInstance().collectImport(BuilderMethodNames.TRANSFERCOMPATIBLEUPDATABLEBUILDER);
}

export function isInteropComponent(node: arkts.CallExpression): boolean {
    if (
        arkts.isMemberExpression(node.callee) &&
        isInstantiateImpl(node.callee) &&
        isArkTS1_1(node.callee)
    ) {
        return true;
    }
    return false;
}

function isDecoratorAnnotation(
    anno: arkts.AnnotationUsage,
    decoratorName: DecoratorNames,
    ignoreDecl?: boolean
): boolean {
    if (!(!!anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === decoratorName)) {
        return false;
    }
    if (!ignoreDecl) {
        const decl = arkts.getPeerIdentifierDecl(anno.expr.peer);
        if (!decl) {
            return false;
        }
        const moduleName = arkts.getProgramFromAstNode(decl)?.moduleName;
        if (!moduleName || moduleName !== GLOBAL_ANNOTATION_MODULE) {
            return false;
        }
    }
    return true;
}

export function hasDecoratorInterop(
    property:
        | arkts.ClassProperty
        | arkts.ClassDefinition
        | arkts.MethodDefinition
        | arkts.ETSParameterExpression
        | arkts.ETSFunctionType,
    decoratorName: DecoratorNames
): boolean {
    if (arkts.isMethodDefinition(property)) {
        return property.function.annotations.some((anno) => isDecoratorAnnotation(anno, decoratorName));
    }
    return property.annotations.some((anno) => isDecoratorAnnotation(anno, decoratorName));
}
