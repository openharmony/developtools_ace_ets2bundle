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
import { createVariableLet, initialArgs} from './initstatevar';
import {
    getPropertyESValue, 
    getWrapValue, 
    setPropertyESValue, 
    createEmptyESValue, 
    createGlobal, 
    createELMTID, 
    createInitReturn
} from './utils';
import { DecoratorNames } from '../../common/predefines';
import { hasDecorator } from '../property-translators/utils';


function paramsLambdaDeclaration(name: string, args?: arkts.ObjectExpression): arkts.Statement[] {
    const result: arkts.Statement[] = [];
    result.push(
        arkts.factory.createVariableDeclaration(
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
            [
                arkts.factory.createVariableDeclarator(
                    arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                    arkts.factory.createIdentifier(InteroperAbilityNames.PARAMSLAMBDA),
                    arkts.factory.createArrowFunction(
                        arkts.factory.createScriptFunction(
                            arkts.factory.createBlock([arkts.factory.createReturnStatement(
                                args ? args : arkts.ObjectExpression.createObjectExpression(
                                    arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
                                    [],
                                    false
                                ),
                            )]),
                            arkts.factory.createFunctionSignature(
                                undefined,
                                [],
                                arkts.factory.createTypeReference(
                                    arkts.factory.createTypeReferencePart(
                                        arkts.factory.createIdentifier(getCustomComponentOptionsName(name))
                                    )
                                ),
                                false
                            ),
                            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
                        )
                    )
                ),

            ]
        )
    );
    return result;
}

function createExtraInfo(properties: string[], value: string[]): arkts.Statement[] {
    const body: arkts.AstNode[] = [];
    body.push(createEmptyESValue(InteroperAbilityNames.EXTRAINFO));
    properties.forEach((prop, index) => {
        const val = value[index];
        body.push(setPropertyESValue(
            InteroperAbilityNames.EXTRAINFO,
            prop,
            arkts.factory.createStringLiteral(val))
        );
    });
    return body;
}

function generateTSASExpression(expression: arkts.AstNode): arkts.Expression {
    return arkts.factory.createTSAsExpression(
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                expression,
                arkts.factory.createIdentifier('unwrap'),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            undefined
        ),
        arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(
                arkts.factory.createIdentifier('Object')
            )
        ),
        false
    );
}

function newComponent(className: string): arkts.Statement {
    return createVariableLet(
        InteroperAbilityNames.COMPONENT,
        getWrapValue(
            arkts.factory.createETSNewClassInstanceExpression(
                arkts.factory.createIdentifier(className),
                [
                    arkts.factory.createUndefinedLiteral(),
                    generateTSASExpression(arkts.factory.createIdentifier(InteroperAbilityNames.PARAM)),
                    arkts.factory.createUndefinedLiteral(),
                    generateTSASExpression(arkts.factory.createIdentifier(InteroperAbilityNames.ELMTID)), 
                    arkts.factory.createTSAsExpression(
                        arkts.factory.createArrowFunction(
                            arkts.factory.createScriptFunction(
                                arkts.factory.createBlock([]),
                                arkts.factory.createFunctionSignature(
                                    undefined,
                                    [],
                                    undefined,
                                    false
                                ),
                                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
                            )
                        ),
                        arkts.factory.createTypeReference(
                            arkts.factory.createTypeReferencePart(
                                arkts.factory.createIdentifier('Object')
                            )
                        ),
                        false
                    ),
                    generateTSASExpression(arkts.factory.createIdentifier(InteroperAbilityNames.EXTRAINFO))
                ]
            )
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
            undefined,
            [
                arkts.factory.createIdentifier(InteroperAbilityNames.COMPONENT)
            ]
        )
    );
    return [component, View, create];
}


function createWrapperBlock(context: InteropContext, varMap: Map<string, arkts.ClassProperty>,
    updateProp: arkts.Property[], isV2: boolean): arkts.BlockStatement {
    const className: string = context.className;
    const path: string = context.path;
    const args: arkts.ObjectExpression | undefined = context.arguments;
    const index: number = path.indexOf('/');
    if (index === -1) {
        throw new Error('Error path of Legacy Component.');
    }
    const initial = [
        createGlobal(),
        createEmptyESValue(InteroperAbilityNames.PARAM)
    ];
    const initialArgsStatement = args ? initialArgs(args, varMap, updateProp) : [];
    return arkts.factory.createBlock(
        [
            ...initial,
            ...initialArgsStatement,
            ...createExtraInfo(['page'], [path]),
            ...createELMTID(),
            ...createComponent(className, isV2),
            createInitReturn(className)
        ]
    );
}

function createInitializer(context: InteropContext, varMap: Map<string, arkts.ClassProperty>,
    updateProp: arkts.Property[], isV2: boolean): arkts.ArrowFunctionExpression {
    const block = createWrapperBlock(context, varMap, updateProp, isV2);
    return arkts.factory.createArrowFunction(
        arkts.factory.createScriptFunction(
            block,
            arkts.factory.createFunctionSignature(
                undefined,
                [],
                undefined,
                false,
            ),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
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
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(InteroperAbilityNames.INSTANCE),
                arkts.factory.createIdentifier(ESValueMethodNames.INVOKEMETHOD),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            [
                arkts.factory.createStringLiteral('updateStateVars'),
                arkts.factory.createIdentifier('updateParam')
            ]
        )
    ];
}


/**
 * 
 * @param updateProp 
 * @returns (instance: ESValue) => { instance.invokeMethod('updateStateVars', updateParam) }
 */
function createUpdater(updateProp: arkts.Property[]): arkts.ArrowFunctionExpression {
    const updateState = (updateProp.length !== 0) ? updateStateVars(updateProp) : [];
    return arkts.factory.createArrowFunction(
        arkts.factory.createScriptFunction(
            arkts.factory.createBlock(
                [
                    ...updateState
                ]
            ),
            arkts.factory.createFunctionSignature(
                undefined,
                [
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier(InteroperAbilityNames.INSTANCE,
                            arkts.factory.createTypeReference(
                                arkts.factory.createTypeReferencePart(
                                    arkts.factory.createIdentifier(ESValueMethodNames.ESVALUE)
                                )
                            )
                        ),
                        undefined,
                    ),
                ],
                undefined,
                false,
            ),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        )
    );
}

function updateArguments(context: InteropContext, name: string): arkts.ObjectExpression {
    const property = arkts.factory.createProperty(
        arkts.factory.createIdentifier(name),
        arkts.factory.createTSAsExpression(
            context.content,
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(
                    arkts.factory.createIdentifier('Function')
                )
            ),
            false
        )
    );
    return context.arguments ? arkts.factory.updateObjectExpression(
        context.arguments,
        arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
        [
            ...(context.arguments?.properties as arkts.Property[]),
            property
        ],
        false
    ) : arkts.factory.createObjectExpression(
        arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
        [property],
        false
    );
}

function generateVarMap(context: InteropContext, decl: arkts.ClassDefinition): Map<string, arkts.ClassProperty> {
    let needBuilderParam = !!context.content;
    const result = new Map<string, arkts.ClassProperty>();
    const definition = decl;
    const body = definition.body;
    body.forEach(node => {
        if (node instanceof arkts.ClassProperty && node.key instanceof arkts.Identifier) {
            const key = node.key.name;
            result.set(key, node);
            if (needBuilderParam && hasDecorator(node, DecoratorNames.BUILDER_PARAM)) {
                context.arguments = updateArguments(context, key);
                needBuilderParam = false;
            }
        }
    });
    return result;
}

export function processArgumens(arg: arkts.Expression): arkts.ObjectExpression {
    if (!arkts.isObjectExpression(arg)) {
        throw new Error('Cannot find arguments for InteropComponent');
    }
    const properties = arg.properties.map((property: arkts.Property) => {
        const key = property.key;
        if (arkts.isIdentifier(key) && key.name.startsWith('__backing_')) {
            return arkts.factory.updateProperty(
                property,
                arkts.factory.updateIdentifier(
                    key,
                    key.name.slice('__backing_'.length)
                ),
                property.value
            );
        }
        return property;
    });
    return arkts.factory.updateObjectExpression(
        arg,
        arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
        properties,
        false
    );
}


/**
 * 
 * @param node 
 * @returns After Checked, transform instantiate_Interop -> ArkUICompatible
 */
export function generateArkUICompatible(node: arkts.CallExpression, globalBuilder: boolean): arkts.CallExpression {
    const classInterop = (node.expression as arkts.MemberExpression).object as arkts.Identifier;
    const className = classInterop.name;
    const decl = arkts.getDecl(classInterop);
    if (!(decl instanceof arkts.ClassDefinition)) {
        throw Error("can't find legacy class declaration");
    }
    const filePath = arkts.getProgramFromAstNode(decl).moduleName;
    const args = node.arguments;
    const options = args.length < 2 || arkts.isUndefinedLiteral(args[1]) ? undefined : processArgumens(args[1]);
    const content = args.length < 3 || arkts.isUndefinedLiteral(args[2]) ? undefined : args[2];
    if (!!content) {
        arkts.NodeCache.getInstance().collect(content);
    }
    const context: InteropContext = {
        className: className,
        path: filePath,
        arguments: options,
        content: content,
    };

    const varMap: Map<string, arkts.ClassProperty> = generateVarMap(context, decl);
    const updateProp: arkts.Property[] = [];
    const isComponentV2 = decl.annotations.some(
        annotation => annotation.expr instanceof arkts.Identifier && annotation.expr.name === 'ComponentV2');
    const initializer = createInitializer(context, varMap, updateProp, isComponentV2);
    const updater = createUpdater(updateProp);
    const result = arkts.factory.updateCallExpression(
        node,
        arkts.factory.createIdentifier(InteroperAbilityNames.ARKUICOMPATIBLE),
        undefined,
        [
            initializer,
            updater,
            globalBuilder ? arkts.factory.createUndefinedLiteral() : arkts.factory.createThisExpression(),
        ]
    );
    arkts.NodeCache.getInstance().collect(result);
    return result;
}