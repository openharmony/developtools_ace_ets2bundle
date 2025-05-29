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
import { InteroperAbilityNames } from '../../common/predefines';
import { getCustomComponentOptionsName } from '../utils';
import { InteropContext } from '../component-transformer';
import { annotation, backingField, isAnnotation } from '../../common/arkts-utils';
import { processLink, processNormal } from './initstatevar';
import { createProvideInterop, resetFindProvide } from './provide';
import { getPropertyESValue, getWrapValue, setPropertyESValue, hasLink, createEmptyESValue, hasProp } from './utils';

interface propertyInfo {
    decorators: string[],
    type: arkts.TypeNode,
}

function initialArgs(args: arkts.ObjectExpression, varMap: Map<string, propertyInfo>, updateProp: arkts.Property[]): arkts.Statement[] {
    const result: arkts.Statement[] = [];
    const proxySet = new Set<string>();

    for (const property of args.properties) {
        if (!(property instanceof arkts.Property)) {
            continue;
        }
        const key = property.key;
        const value = property.value;
        if (!(key instanceof arkts.Identifier)) {
            throw Error('Error arguments in Legacy Component');
        }
        const keyName = key.name;
        const keyDecorators = varMap.get(keyName)?.decorators;
        const keyType = varMap.get(keyName)?.type!;
        if (value instanceof arkts.MemberExpression && value.object instanceof arkts.ThisExpression) {
            const declResult = arkts.getDecl(value);
        }

        if (keyDecorators === undefined) {
            const initParam = processNormal(keyName, value!);
            result.push(...initParam);
        } else if (hasLink(keyDecorators)) {
            const initParam = processLink(keyName, value!, keyType, proxySet);
            result.push(...initParam);
        } else if (hasProp(keyDecorators)) {
            updateProp.push(property);
            const initParam = processNormal(keyName, value!);
            result.push(...initParam);
        }
    }
    return result;
}

function instantiateComponent(params: arkts.AstNode[]): arkts.VariableDeclaration {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [
            arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                arkts.factory.createIdentifier(InteroperAbilityNames.COMPONENT),
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createIdentifier(InteroperAbilityNames.STRUCTOBJECT),
                        arkts.factory.createIdentifier(InteroperAbilityNames.INSTANTIATE),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    undefined,
                    params
                )
            )
        ]
    );
}

function paramsLambdaDeclaration(name: string, args?: arkts.ObjectExpression): arkts.Statement[] {
    const result = [];
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

function createInitReturn(componentName: string): arkts.ReturnStatement {
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

function createESUndefined(): arkts.Statement {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [
            arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                arkts.factory.createIdentifier('esundefined'),
                getWrapValue(arkts.factory.createUndefinedLiteral())
            )
        ]
    );
}

function createESBlank(): arkts.Statement[] {
    const body: arkts.Statement[] = [];
    const blank = arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [
            arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                arkts.factory.createIdentifier('blank'),
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
                )
            )
        ]
    );
    body.push(blank);
    const asExpression = arkts.factory.createTSAsExpression(
        arkts.factory.createIdentifier('blank'),
        arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(
                arkts.factory.createIdentifier('object')
            )
        ),
        false
    );
    const esblank = arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [
            arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                arkts.factory.createIdentifier('esblank'),
                getWrapValue(asExpression)
            )
        ]
    );
    body.push(esblank);
    return body;
}

function createGlobal(): arkts.Statement {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [arkts.factory.createVariableDeclarator(
            arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
            arkts.factory.createIdentifier('global'),
            arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    arkts.factory.createIdentifier(InteroperAbilityNames.ESVALUE),
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

function createELMTID(): arkts.Statement[] {
    const body: arkts.Statement[] = [];
    const viewStackProcessor = getPropertyESValue('viewStackProcessor', 'global', 'ViewStackProcessor');
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
                    arkts.factory.createIdentifier('invoke'),
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

function createComponent(moduleName: string, className: string): arkts.Statement[] {
    const body: arkts.Statement[] = [];
    const module = arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [
            arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                arkts.factory.createIdentifier(moduleName),
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createIdentifier(InteroperAbilityNames.ESVALUE),
                        arkts.factory.createIdentifier(InteroperAbilityNames.LOAD),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    undefined,
                    [arkts.factory.create1StringLiteral(InteroperAbilityNames.OHMURL)]
                )
            )
        ]
    );
    body.push(module);
    const structObject = getPropertyESValue('structObject', moduleName, className);
    body.push(structObject);
    const component = instantiateComponent(
        [
            arkts.factory.createIdentifier('esundefined'),
            arkts.factory.createIdentifier(InteroperAbilityNames.PARAM),
            arkts.factory.createIdentifier('esundefined'),
            arkts.factory.createIdentifier(InteroperAbilityNames.ELMTID), 
            arkts.factory.createIdentifier('esblank'),
            arkts.factory.createIdentifier(InteroperAbilityNames.EXTRAINFO)
        ]
    );
    body.push(component);
    return body;
}

function invokeViewPUCreate(): arkts.Statement[] {
    const body: arkts.Statement[] = [];
    const createMethod = getPropertyESValue('create', 'structObject', 'create');
    body.push(createMethod);
    const viewPUCreate = arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier('create'),
                arkts.factory.createIdentifier('invoke'),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            [
                arkts.factory.createIdentifier('component')
            ]
        )
    );
    body.push(viewPUCreate);
    return body;
}

function createWrapperBlock(context: InteropContext, varMap: Map<string, propertyInfo>,
    updateProp: arkts.Property[]): arkts.BlockStatement {
    const className = context.className;
    const path = context.path;
    const args = context.arguments;
    const index = path.indexOf('/');
    if (index === -1) {
        throw new Error('Error path of Legacy Component.');
    }
    const moduleName = path.substring(0, index);
    const initial = [
        createGlobal(),
        createEmptyESValue(InteroperAbilityNames.PARAM),
        getPropertyESValue('createState', 'global', 'createStateVariable'),
        ...createProvideInterop()
    ];
    const initialArgsStatement = args ? initialArgs(args, varMap, updateProp) : [];
    return arkts.factory.createBlock(
        [
            ...initial,
            ...initialArgsStatement,
            ...createExtraInfo(['page'], [path]),
            createESUndefined(),
            ...createESBlank(),
            ...createELMTID(),
            ...createComponent(moduleName, className),
            ...invokeViewPUCreate(),
            resetFindProvide(),
            // ...paramsLambdaDeclaration(className, args),
            // setPropertyESValue(
            //     'component', 
            //     'paramsGenerator_', 
            //     arkts.factory.createIdentifier(InteroperAbilityNames.PARAMSLAMBDA)
            // ),
            createInitReturn(className)
        ]
    );
}

function createInitializer(context: InteropContext, varMap: Map<string, propertyInfo>,
    updateProp: arkts.Property[]): arkts.ArrowFunctionExpression {
    const block = createWrapperBlock(context, varMap, updateProp);
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

function updateStateVars(updateProp: arkts.Property[]): arkts.Statement {
    const obj = arkts.factory.createObjectExpression(
        arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
        updateProp,
        false
    );
    return arkts.factory.createCallExpression(
        arkts.factory.createMemberExpression(
            arkts.factory.createIdentifier('component'),
            arkts.factory.createIdentifier('invokeMethod'),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        ),
        undefined,
        [
            arkts.factory.createStringLiteral('updateStateVars'),
            getWrapValue(obj)
        ]
    );
}

function createUpdater(esvalue: arkts.ETSTypeReference, varMap: Map<string, propertyInfo>,
    updateProp: arkts.Property[]): arkts.ArrowFunctionExpression {
    const updateState = updateStateVars(updateProp); 
    return arkts.factory.createArrowFunction(
        arkts.factory.createScriptFunction(
            arkts.factory.createBlock(
                [
                    updateState
                ]
            ),
            arkts.factory.createFunctionSignature(
                undefined,
                [
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier(InteroperAbilityNames.INSTANCE, esvalue),
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

function generateVarMap(node: arkts.Identifier): Map<string, propertyInfo> {
    const decl = arkts.getDecl(node);
    if (!(decl instanceof arkts.ClassDefinition)) {
        throw Error("can't find legacy class declaration");
    }
    const result = new Map<string, propertyInfo>();
    const definition = decl;
    const body = definition.body;
    body.forEach(node => {
        if (node instanceof arkts.ClassProperty && node.key instanceof arkts.Identifier) {
            const key = node.key.name;
            const annotations = node.annotations;
            const decorators: string[] = annotations.map(annotation => {
                return (annotation.expr as arkts.Identifier).name;
            });
            const type: arkts.TypeNode = node.typeAnnotation!;
            result.set(key, {decorators: decorators, type: type});
        }
    });
    return result;
}

function generateStructInfo(context: InteropContext): arkts.AstNode[] {
    const result: arkts.AstNode[] = [
        arkts.factory.createStringLiteral(context.path),
        context.line ? arkts.factory.createIdentifier(context.line.toString()) : arkts.factory.createUndefinedLiteral(),
        context.col ? arkts.factory.createIdentifier(context.col.toString()) : arkts.factory.createUndefinedLiteral(),
        context.arguments ?? arkts.factory.createUndefinedLiteral()
    ];
    return result;

}

/**
 * After Parsed阶段
 * @param {Object} context - 组件上下文信息
 * @param {string} context.className - 组件类名
 * @param {string} context.path - 组件文件路径
 * @param {number} [context.line] - 组件在文件中的行号（可选）
 * @param {number} [context.col] - 组件在文件中的列号（可选）
 * @param {Object} [context.arguments] - 传递给组件的额外参数（可选）
 * @returns {Object} 返回带有互操作标识的1.1组件静态方法，用于承载相关信息
 */
export function generateInstantiateInterop(context: InteropContext): arkts.CallExpression {
    return arkts.factory.createCallExpression(
        arkts.factory.createMemberExpression(
            arkts.factory.createIdentifier(context.className),
            arkts.factory.createIdentifier('instantiate_Interop'),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        ),
        undefined,
        generateStructInfo(context)
    );
}

/**
 * After Checked阶段
 * @param node 
 * @returns {boolean} 判断节点是否为带有互操作标识的CallExpression
 */
export function isArkUICompatible(node: arkts.AstNode): boolean {
    if (node instanceof arkts.CallExpression && node.expression instanceof arkts.MemberExpression &&
        node.expression.property instanceof arkts.Identifier &&
        node.expression.property.name === 'instantiate_Interop') {
        return true;
    }
    return false;
}


/**
 * 
 * @param node 
 * @returns After Checked阶段，将带有互操作标识的1.1组件静态方法转换为ArkUICompatible函数
 */
export function generateArkUICompatible(node: arkts.CallExpression): arkts.CallExpression {
    const classInterop = (node.expression as arkts.MemberExpression).object as arkts.Identifier;
    const className = classInterop.name;
    const args = node.arguments;
    const path = (args[0] as arkts.StringLiteral).str;
    const line = args[1] instanceof arkts.UndefinedLiteral ? undefined : (args[1] as arkts.NumberLiteral).value;
    const col = args[2] instanceof arkts.UndefinedLiteral ? undefined : (args[2] as arkts.NumberLiteral).value;
    const options = args[3] instanceof arkts.UndefinedLiteral ? undefined : args[3] as arkts.ObjectExpression;
    const context: InteropContext = {
        className: className,
        path: path,
        line: line,
        col: col,
        arguments: options
    };

    const varMap: Map<string, propertyInfo> = generateVarMap(classInterop);
    const esvalue = arkts.factory.createTypeReference(
        arkts.factory.createTypeReferencePart(
            arkts.factory.createIdentifier(InteroperAbilityNames.ESVALUE)
        )
    );
    const updateProp:arkts.Property[] = [];
    const initializer = createInitializer(context, varMap, updateProp);
    const updater = createUpdater(esvalue, varMap, updateProp);
    return arkts.factory.updateCallExpression(
        node,
        arkts.factory.createIdentifier(InteroperAbilityNames.ARKUICOMPATIBLE),
        undefined,
        [
            initializer,
            updater,
        ]
    );
}