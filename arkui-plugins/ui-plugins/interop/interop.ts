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
import { getCustomComponentOptionsName } from '../utils';
import { InteropContext } from '../component-transformer';
import { createVariableLet, initialArgs, getPropertyType } from './initstatevar';
import {
    getPropertyESValue,
    getWrapValue,
    setPropertyESValue,
    createEmptyESValue,
    createGlobal,
    createELMTID,
    createInitReturn,
} from './utils';
import { DecoratorNames, LANGUAGE_VERSION, NodeCacheNames } from '../../common/predefines';
import { hasDecoratorInterop } from './utils';
import { FileManager } from '../../common/file-manager';
import { NodeCacheFactory } from '../../common/node-cache';

function paramsLambdaDeclaration(name: string, args?: arkts.ObjectExpression): arkts.Statement[] {
    const result: arkts.Statement[] = [];
    result.push(
        arkts.factory.createVariableDeclaration(
            arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
            [
                arkts.factory.createVariableDeclarator(
                    arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                    arkts.factory.createIdentifier(InteroperAbilityNames.PARAMSLAMBDA),
                    arkts.factory.createArrowFunctionExpression(
                        arkts.factory.createScriptFunction(
                            arkts.factory.createBlockStatement([
                                arkts.factory.createReturnStatement(
                                    args
                                        ? args
                                        : arkts.ObjectExpression.createObjectExpression(
                                              arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
                                              [],
                                              false
                                          )
                                ),
                            ]),
                            undefined,
                            [],
                            arkts.factory.createETSTypeReference(
                                arkts.factory.createETSTypeReferencePart(
                                    arkts.factory.createIdentifier(getCustomComponentOptionsName(name))
                                )
                            ),
                            false,
                            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
                            undefined,
                            undefined
                        )
                    )
                ),
            ]
        )
    );
    return result;
}

function createExtraInfo(properties: string[], value: string[]): arkts.Statement[] {
    const body: arkts.Statement[] = [];
    body.push(createEmptyESValue(InteroperAbilityNames.EXTRAINFO));
    properties.forEach((prop, index) => {
        const val = value[index];
        body.push(setPropertyESValue(InteroperAbilityNames.EXTRAINFO, prop, arkts.factory.createStringLiteral(val)));
    });
    return body;
}

function generateTSASExpression(expression: arkts.Expression): arkts.Expression {
    return arkts.factory.createTSAsExpression(
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                expression,
                arkts.factory.createIdentifier('unwrap'),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            [],
            undefined,
            false,
            false
        ),
        arkts.factory.createETSTypeReference(
            arkts.factory.createETSTypeReferencePart(arkts.factory.createIdentifier('Object'))
        ),
        false
    );
}

function newComponent(className: string): arkts.Statement {
    return createVariableLet(
        InteroperAbilityNames.COMPONENT,
        getWrapValue(
            arkts.factory.createETSNewClassInstanceExpression(arkts.factory.createIdentifier(className), [
                arkts.factory.createUndefinedLiteral(),
                generateTSASExpression(arkts.factory.createIdentifier(InteroperAbilityNames.PARAM)),
                arkts.factory.createUndefinedLiteral(),
                generateTSASExpression(arkts.factory.createIdentifier(InteroperAbilityNames.ELMTID)),
                arkts.factory.createTSAsExpression(
                    arkts.factory.createArrowFunctionExpression(
                        arkts.factory.createScriptFunction(
                            arkts.factory.createBlockStatement([]),
                            undefined,
                            [],
                            undefined,
                            false,
                            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
                            undefined,
                            undefined
                        )
                    ),
                    arkts.factory.createETSTypeReference(
                        arkts.factory.createETSTypeReferencePart(arkts.factory.createIdentifier('Object'))
                    ),
                    false
                ),
                generateTSASExpression(arkts.factory.createIdentifier(InteroperAbilityNames.EXTRAINFO)),
            ])
        )
    );
}

function createComponent(className: string, isV2: boolean): arkts.Statement[] {
    let viewCreateMethod = 'viewPUCreate';
    if (isV2) {
        viewCreateMethod = 'viewV2Create';
    }
    const component = newComponent(className);
    const View = getPropertyESValue(viewCreateMethod, InteroperAbilityNames.GLOBAL, viewCreateMethod);
    const create = arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(viewCreateMethod),
                arkts.factory.createIdentifier('invoke'),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            [arkts.factory.createIdentifier(InteroperAbilityNames.COMPONENT)],
            undefined,
            false,
            false
        )
    );
    return [component, View, create];
}

function createWrapperBlock(
    context: InteropContext,
    varMap: Map<string, arkts.ClassProperty>,
    updateProp: arkts.Property[],
    node: arkts.CallExpression,
    isV2: boolean
): arkts.BlockStatement {
    const className: string = context.className;
    const path: string = context.path;
    const args: arkts.ObjectExpression | undefined = context.arguments;
    const index: number = path.indexOf('/');
    if (index === -1) {
        throw new Error('Error path of Legacy Component.');
    }
    const initial = [createGlobal(), createEmptyESValue(InteroperAbilityNames.PARAM)];
    const initialArgsStatement = args ? initialArgs(args, varMap, updateProp, node, isV2) : [];
    return arkts.factory.createBlockStatement([
        ...initial,
        ...initialArgsStatement,
        ...createExtraInfo(['page'], [path]),
        ...createELMTID(),
        ...createComponent(className, isV2),
        createInitReturn(className),
    ]);
}

function createInitializer(
    context: InteropContext,
    varMap: Map<string, arkts.ClassProperty>,
    updateProp: arkts.Property[],
    node: arkts.CallExpression,
    isV2: boolean
): arkts.ArrowFunctionExpression {
    const block = createWrapperBlock(context, varMap, updateProp, node, isV2);
    return arkts.factory.createArrowFunctionExpression(
        arkts.factory.createScriptFunction(
            block,
            undefined,
            [],
            undefined,
            false,
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            undefined,
            undefined
        )
    );
}

function createUpdateProp(updateProp: arkts.Property[]): arkts.Statement[] {
    const result: arkts.Statement[] = [];
    const updateParam = createEmptyESValue('updateParam');
    result.push(updateParam);
    updateProp.forEach((prop) => {
        const key = prop.key as arkts.Identifier;
        const value = prop.value;
        const insertProperty = setPropertyESValue('updateParam', key.name, value!);
        result.push(insertProperty);
    });
    return result;
}

function updateStateVars(updateProp: arkts.Property[]): arkts.Statement[] {
    const insertProp = createUpdateProp(updateProp);
    return [
        ...insertProp,
        arkts.factory.createExpressionStatement(
            arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    arkts.factory.createIdentifier(InteroperAbilityNames.INSTANCE),
                    arkts.factory.createIdentifier(ESValueMethodNames.INVOKEMETHOD),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                [
                    arkts.factory.createStringLiteral('updateStateVars'),
                    arkts.factory.createIdentifier('updateParam')
                ],
                undefined,
                false,
                false
            )
        )
    ];
}

/**
 *
 * @param updateProp
 * @returns (instance: ESValue) => { instance.invokeMethod('updateStateVars', updateParam) }
 */
function createUpdater(updateProp: arkts.Property[]): arkts.ArrowFunctionExpression {
    const updateState = updateProp.length !== 0 ? updateStateVars(updateProp) : [];
    return arkts.factory.createArrowFunctionExpression(
        arkts.factory.createScriptFunction(
            arkts.factory.createBlockStatement([...updateState]),
            undefined,
            [
                arkts.factory.createETSParameterExpression(
                    arkts.factory.createIdentifier(
                        InteroperAbilityNames.INSTANCE,
                        arkts.factory.createETSTypeReference(
                            arkts.factory.createETSTypeReferencePart(
                                arkts.factory.createIdentifier(ESValueMethodNames.ESVALUE)
                            )
                        )
                    ),
                    false,
                    undefined,
                ),
            ],
            undefined,
            false,
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            undefined,
            undefined
        )
    );
}

function updateArguments(context: InteropContext, name: string): arkts.ObjectExpression {
    const property = arkts.factory.createProperty(
        arkts.Es2pandaPropertyKind.PROPERTY_KIND_INIT,
        arkts.factory.createIdentifier(name),
        arkts.factory.createTSAsExpression(
            context.content,
            arkts.factory.createETSTypeReference(
                arkts.factory.createETSTypeReferencePart(arkts.factory.createIdentifier('Function'))
            ),
            false
        ),
        false,
        false
    );
    return context.arguments
        ? arkts.factory.updateObjectExpression(
              context.arguments,
              [...(context.arguments?.properties as arkts.Property[]), property]
          )
        : arkts.factory.createObjectExpression(
              [property]
          );
}

function generateVarMap(context: InteropContext, decl: arkts.ClassDefinition): Map<string, arkts.ClassProperty> {
    let needBuilderParam = !!context.content;
    const result = new Map<string, arkts.ClassProperty>();
    const definition = decl;
    const body = definition.body;
    body.forEach((node) => {
        if (node instanceof arkts.ClassProperty && node.key instanceof arkts.Identifier) {
            const key = node.key.name;
            result.set(key, node);
            if (needBuilderParam && hasDecoratorInterop(node, DecoratorNames.BUILDER_PARAM)) {
                context.arguments = updateArguments(context, key);
                needBuilderParam = false;
            }
        }
    });
    return result;
}

export function processArguments(arg: arkts.Expression): arkts.ObjectExpression {
    if (!arkts.isObjectExpression(arg)) {
        throw new Error('Cannot find arguments for InteropComponent');
    }
    const properties = arg.properties.map((expr: arkts.Expression) => {
        const property = expr as arkts.Property
        const key = property.key;
        if (arkts.isIdentifier(key) && key.name.startsWith('__backing_')) {
            return arkts.factory.updateProperty(
                property,
                property.kind,
                arkts.factory.updateIdentifier(key, key.name.slice('__backing_'.length)),
                property.value,
                property.isMethod,
                property.isComputed
            );
        }
        return property;
    });
    return arkts.factory.updateObjectExpression(
        arg,
        properties
    );
}

function getProperParams(args: readonly arkts.Expression[]): [arkts.ObjectExpression | undefined, arkts.AstNode | undefined] {
    if (args.length < 2) {
        return [undefined, undefined];
    } else if (args.length === 2) {
        if (args[1] instanceof arkts.ArrowFunctionExpression) {
            return [undefined, args[1]];
        }
        return [processArguments(args[1]), undefined];
    }
    return [processArguments(args[1]), args[2]];
}

/**
 *
 * @param node
 * @returns After Checked, transform instantiate_Interop -> ArkUICompatible
 */
export function generateArkUICompatible(node: arkts.CallExpression, globalBuilder: boolean): arkts.CallExpression {
    const classInterop = (node.callee as arkts.MemberExpression).object as arkts.Identifier;
    const className = classInterop.name;
    const decl = arkts.getDecl(classInterop);
    if (!(decl instanceof arkts.ClassDefinition)) {
        throw Error("can't find legacy class declaration");
    }
    const filePath = arkts.getProgramFromAstNode(decl).moduleName;
    const args = node.arguments;
    const [options, content] = getProperParams(args);

    if (!!content) {
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(content);
    }
    const context: InteropContext = {
        className: className,
        path: filePath,
        arguments: options,
        content: content as arkts.ArrowFunctionExpression | undefined,
    };

    const varMap: Map<string, arkts.ClassProperty> = generateVarMap(context, decl);
    const updateProp: arkts.Property[] = [];
    const isComponentV2 = decl.annotations.some(
        (annotation) => annotation.expr instanceof arkts.Identifier && annotation.expr.name === 'ComponentV2'
    );
    const initializer = createInitializer(context, varMap, updateProp, node, isComponentV2);
    const updater = createUpdater(updateProp);
    const result = arkts.factory.updateCallExpression(
        node,
        arkts.factory.createIdentifier(InteroperAbilityNames.ARKUICOMPATIBLE),
        [
            initializer,
            updater,
            globalBuilder ? arkts.factory.createUndefinedLiteral() : arkts.factory.createThisExpression(),
        ],
        undefined,
        node.isOptional,
        node.hasTrailingComma,
        node.trailingBlock
    );
    NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(result);
    return result;
}

export function getHasAnnotationObserved(node: arkts.ClassProperty, annotationObserved: string): boolean {
    let typeIdentifiers: any[] = [];
    extractTypeIdentifiers(node.typeAnnotation, annotationObserved, typeIdentifiers);
    return typeIdentifiers.length > 0;
}

function extractTypeIdentifiers(
    typeNode: arkts.AstNode | undefined,
    annotationObserved: string,
    typeIdentifiers: any[]
): void {
    if (!typeNode) {
        return;
    }
    if (arkts.isETSTypeReference(typeNode) && typeNode.part && arkts.isETSTypeReferencePart(typeNode.part)) {
        if (checkObservedForm1_1(typeNode.part.name!, annotationObserved)) {
            typeIdentifiers.push(typeNode.part.name);
            return;
        }
        const typeParams = typeNode.part.typeParams;
        if (typeParams && arkts.isTSTypeParameterInstantiation(typeParams) && typeParams.params) {
            typeParams.params.forEach((param) => extractTypeIdentifiers(param, annotationObserved, typeIdentifiers));
        }
    } else if (arkts.isETSUnionType(typeNode)) {
        typeNode.types.forEach((subType) => extractTypeIdentifiers(subType, annotationObserved, typeIdentifiers));
    }
}

function checkObservedForm1_1(typeNode: arkts.AstNode, annotationObserved: string): boolean {
    const typeDecl = arkts.getDecl(typeNode) as arkts.TSTypeReference;
    if (!typeDecl || !typeDecl.annotations) {
        return false;
    }
    const program = arkts.getProgramFromAstNode(typeDecl);
    const fileManager = FileManager.getInstance();
    const isFrom1_1 = fileManager.getLanguageVersionByFilePath(program.absoluteName) === LANGUAGE_VERSION.ARKTS_1_1;
    if (!isFrom1_1) {
        return false;
    }
    const hasAnnotation = typeDecl.annotations.some(
        (annotation) => annotation.expr instanceof arkts.Identifier && annotation.expr.name === annotationObserved
    );
    if (hasAnnotation && isFrom1_1) {
        return true;
    }
    return false;
}
