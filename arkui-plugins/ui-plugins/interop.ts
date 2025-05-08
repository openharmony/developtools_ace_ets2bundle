/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
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
import { InteroperAbilityNames } from '../common/predefines';
import { getCustomComponentOptionsName } from './utils';
import { InteropContext } from './component-transformer';

export function createEmptyESValue(name: string): arkts.VariableDeclaration {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [
            arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                arkts.factory.createIdentifier(name),
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createIdentifier(InteroperAbilityNames.ESVALUE),
                        arkts.factory.createIdentifier(InteroperAbilityNames.INITEMPTYOBJECT),
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

export function getWrapValue(value: arkts.AstNode, type?: string): arkts.AstNode {
    let wrapMethod = InteroperAbilityNames.WRAP;
    if (!!type && value instanceof arkts.StringLiteral) {
        wrapMethod = InteroperAbilityNames.WRAPSTRING;
    } else if (!!type && value instanceof arkts.NumberLiteral) {
        wrapMethod = InteroperAbilityNames.WRAPINT;
    }

    return arkts.factory.createCallExpression(
        arkts.factory.createMemberExpression(
            arkts.factory.createIdentifier(InteroperAbilityNames.ESVALUE),
            arkts.factory.createIdentifier(wrapMethod),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        ),
        undefined,
        [value]
    );
}

export function setPropertyESValue(name: string, key: arkts.StringLiteral, wrapValue: arkts.AstNode): arkts.ExpressionStatement {
    return arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(name),
                arkts.factory.createIdentifier(InteroperAbilityNames.SETPROPERTY),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            [
                key,
                wrapValue
            ]
        )
    );
}

export function getPropertyESValue(result: string, object: string, key: string): arkts.VariableDeclaration {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [
            arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                arkts.factory.createIdentifier(result),
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createIdentifier(object),
                        arkts.factory.createIdentifier(InteroperAbilityNames.GETPROPERTY),
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

function initialArgs(name: string, context: InteropContext): arkts.Statement[] {
    const args = context.arguments;
    const stateVarMap = context.stateVarMap;
    if (!args) {
        return [];
    }
    const result: arkts.Statement[] = [];

    for (const property of args.properties) {
        if (!(property instanceof arkts.Property)) {
            continue;
        }
        const key = property.key;
        if (!(key instanceof arkts.Identifier)){
            throw Error('Error arguments in Legacy Component');
        }
        const value = property.value!;
        const type = stateVarMap.get(key.name);
        const key_string = arkts.factory.createStringLiteral(key.name);
        const wrapValue = getWrapValue(value, type);
        const setProperty = setPropertyESValue(name, key_string, wrapValue);
        result.push(setProperty);
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
            arkts.factory.createStringLiteral(prop),
            arkts.factory.createStringLiteral(val))
        );
    })
    return body;
}

function createESParent(): arkts.Statement {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [
            arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                arkts.factory.createIdentifier('esparent'),
                getWrapValue(arkts.factory.createIdentifier(InteroperAbilityNames.PARENT))
            )
        ]
    );
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
    )
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
    )
    body.push(esblank);
    return body;
}

function createELMTID(): arkts.Statement[] {
    const body: arkts.Statement[] = [];
    const global = arkts.factory.createVariableDeclaration(
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
    body.push(global);
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
    )
    body.push(component);
    return body;
}

function invokeViewPUCreate(): arkts.Statement[]  {
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
    )
    body.push(viewPUCreate);
    return body;
}

function createWrapperBlock(context: InteropContext): arkts.BlockStatement {
    const className = context.className;
    const path = context.path;
    const args = context.arguments;
    const index = path.indexOf('/');
    if (index === -1) {
        throw new Error('Error path of Legacy Component.');
    }
    const moduleName = path.substring(0, index);
    const initialArgsStatement = initialArgs(InteroperAbilityNames.PARAM, context);
    return arkts.factory.createBlock(
        [
            createEmptyESValue(InteroperAbilityNames.PARAM),
            ...initialArgsStatement,
            ...createExtraInfo(['page'], [path]),
            // createESParent(),
            createESUndefined(),
            ...createESBlank(),
            ...createELMTID(),
            ...createComponent(moduleName, className),
            ...invokeViewPUCreate(),
            // ...paramsLambdaDeclaration(className, args),
            // setPropertyESValue(
            //     'component', 
            //     arkts.factory.create1StringLiteral('paramsGenerator_'), 
            //     arkts.factory.createIdentifier(InteroperAbilityNames.PARAMSLAMBDA)
            // ),
            createInitReturn(className)
        ]
    );
}

function createInitializer(context: InteropContext): arkts.ArrowFunctionExpression {
    const block = createWrapperBlock(context);
    const builderNode = arkts.factory.createTypeReference(
        arkts.factory.createTypeReferencePart(
            arkts.factory.createIdentifier('BuilderNode')
        )
    )
    return arkts.factory.createArrowFunction(
        arkts.factory.createScriptFunction(
            block,
            arkts.factory.createFunctionSignature(
                undefined,
                [
                    // arkts.factory.createParameterDeclaration(
                    //     arkts.factory.createIdentifier(InteroperAbilityNames.PARENT, builderNode),
                    //     undefined,
                    // ),
                ],
                undefined,
                false,
            ),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        )
    );
}

function createUpdater(number: arkts.ETSTypeReference, esvalue: arkts.ETSTypeReference): arkts.ArrowFunctionExpression {
    return arkts.factory.createArrowFunction(
        arkts.factory.createScriptFunction(
            arkts.factory.createBlock(
                [

                ]
            ),
            arkts.factory.createFunctionSignature(
                undefined,
                [
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier(InteroperAbilityNames.ELMTID, number),
                        undefined,
                    ),
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

export function processStructCall(context: InteropContext): arkts.CallExpression {
    const number = arkts.factory.createTypeReference(
        arkts.factory.createTypeReferencePart(
            arkts.factory.createIdentifier(InteroperAbilityNames.NUMBER)
        )
    );
    const esvalue = arkts.factory.createTypeReference(
        arkts.factory.createTypeReferencePart(
            arkts.factory.createIdentifier(InteroperAbilityNames.ESVALUE)
        )
    );
    const initializer = createInitializer(context);
    // console.log('print intt:'+ initializer.dumpSrc());
    const updater = createUpdater(number, esvalue);
    return arkts.factory.createCallExpression(
        arkts.factory.createIdentifier(InteroperAbilityNames.ARKUICOMPATIBLE),
        undefined,
        [
            initializer,
            updater,
        ]
    );
}

export function updateStateVar(node: arkts.CallExpression): arkts.CallExpression {
    const ident = node.expression;
    if (!(ident instanceof arkts.Identifier)) {
        return node;
    }
    const name = ident.name;
    if (name !== 'ArkUICompatible') {
        return node;
    }
    const init = node.arguments[0] as arkts.ArrowFunctionExpression;
    const script = init.scriptFunction;
    const body = script.body as arkts.BlockStatement;
    const statements = body.statements;
    const varStatement = statements[1].expression as arkts.CallExpression;
    const params = varStatement.arguments;
    const wrapVar = params[1] as arkts.CallExpression;
    const stateVar = wrapVar.arguments[0] as arkts.MemberExpression;
    const newStateVar = arkts.factory.updateMemberExpression(
        stateVar,
        stateVar.object,
        arkts.factory.createIdentifier('__backing_' + stateVar.property.name),
        stateVar.kind,
        stateVar.computed,
        stateVar.optional
    );
    const newWrapVar = arkts.factory.updateCallExpression(
        wrapVar,
        wrapVar.expression,
        wrapVar.typeArguments,
        [newStateVar],
    );
    const newVarStatement = arkts.factory.updateCallExpression(
        varStatement,
        varStatement.expression,
        varStatement.typeArguments,
        [params[0], newWrapVar]
    );
    const newBody = arkts.factory.updateBlock(
        body,
        [
            statements[0],
            newVarStatement,
            ...statements.slice(2)
        ]
    );
    const newInit = arkts.factory.updateArrowFunction(
        init,
        arkts.factory.updateScriptFunction(
            script,
            newBody,
            arkts.factory.createFunctionSignature(
                script.typeParams,
                script.params,
                script.returnTypeAnnotation,
                script.hasReceiver,
            ),
            script.flags,
            script.modifiers
        )
    );
    const newNode = arkts.factory.updateCallExpression(
        node,
        node.expression,
        node.typeArguments,
        [
            newInit,
            node.arguments[1]
        ],
    );
    return newNode;
}