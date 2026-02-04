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
import { ESValueMethodNames, BuilderMethodNames, InteroperAbilityNames, BuilderParams, InteropInternalNames } from './predefines';
import { 
    createELMTID, 
    createEmptyESValue, 
    createGlobal,
    createInitReturn, 
    getPropertyESValue, 
    getWrapValue, 
    setPropertyESValue 
} from './utils';
import { ImportCollector } from '../../common/import-collector';
import { FileManager } from '../../common/file-manager';
import { LANGUAGE_VERSION } from '../../common/predefines';

interface builderParam {
    args: arkts.AstNode[],
    paramsInfo: arkts.Statement[]
}

function invokeFunctionWithParam(functionName: string, result: string, className: string, args: arkts.AstNode[]): arkts.Statement {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [arkts.factory.createVariableDeclarator(
            arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
            arkts.factory.createIdentifier(result),
            arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    arkts.factory.createIdentifier(functionName),
                    arkts.factory.createIdentifier(ESValueMethodNames.INVOKE),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                undefined,
                [
                    getWrapValue(arkts.factory.createIdentifier(className)),
                    arkts.factory.createIdentifier(InteropInternalNames.ELMTID),
                    ...args
                ]
            )
        )]
    );
}

function invokeRunPendingJobs(): arkts.Statement {
    return arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(BuilderMethodNames.RUNPENDINGJOBS),
                arkts.factory.createIdentifier(ESValueMethodNames.INVOKE),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            undefined
        )
    );
}

function invokeComponent(): arkts.Statement[] {
    const viewPU = getPropertyESValue('viewPUCreate', InteropInternalNames.GLOBAL, 'viewPUCreate');
    const create = arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createIdentifier(InteropInternalNames.GLOBAL),
                        arkts.factory.createIdentifier(ESValueMethodNames.GETPROPERTY),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    undefined,
                    [arkts.factory.create1StringLiteral('viewPUCreate')]
                ),
                arkts.factory.createIdentifier('invoke'),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            [
                arkts.factory.createIdentifier(InteropInternalNames.COMPONENT)
            ]
        )
    );
    return [viewPU, create];
}

function createBuilderInitializer(className: string, functionName: string, param: builderParam): arkts.ArrowFunctionExpression {
    const block = arkts.factory.createBlock(
        [
            createGlobal(),
            createELMTID(),
            getPropertyESValue(BuilderMethodNames.CREATECOMPATIBLENODE, InteropInternalNames.GLOBAL, functionName),
            ...param.paramsInfo,
            invokeFunctionWithParam(BuilderMethodNames.CREATECOMPATIBLENODE, InteropInternalNames.COMPONENT, className, param.args),
            ...invokeComponent(),
            createInitReturn(className)
        ]
    );
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

/**
 * getInstanceParam
 * @returns  let instanceParam = (instance.getProperty("arg1") as ESValue);
 */
function getInstanceParam(): arkts.Statement {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [
            arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                arkts.factory.createIdentifier(BuilderParams.INSTANCEPARAM),
                arkts.factory.createTSAsExpression(
                    arkts.factory.createCallExpression(
                        arkts.factory.createMemberExpression(
                            arkts.factory.createIdentifier(InteropInternalNames.INSTANCE),
                            arkts.factory.createIdentifier(ESValueMethodNames.GETPROPERTY),
                            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                            false,
                            false
                        ),
                        undefined,
                        [
                            arkts.factory.createStringLiteral('arg1')
                        ]
                    ),
                    arkts.factory.createTypeReference(
                        arkts.factory.createTypeReferencePart(
                            arkts.factory.createIdentifier(ESValueMethodNames.ESVALUE)
                        )
                    ),
                    false
                )
            )
        ]
    );
}

/**
 * instanceParamTypeOf
 * @returns
 *  if (((instanceParam.typeOf()) != ("object"))) {
          return;
    }
 */
function instanceParamTypeOf(): arkts.Statement {
    return arkts.factory.createIfStatement(
        arkts.factory.createBinaryExpression(
            arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    arkts.factory.createIdentifier(BuilderParams.INSTANCEPARAM),
                    arkts.factory.createIdentifier('typeOf'),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                undefined,
                undefined
            ), arkts.factory.createStringLiteral('object'), arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NOT_EQUAL
        ),
        arkts.factory.createBlock([
            arkts.factory.createReturnStatement()
        ])
    );
}

/**
 * getParamWrapped
 * @param argument param
 * @returns let param_wrapped = ESValue.wrap(param);
 */
function getParamWrapped(argument: arkts.Identifier): arkts.Statement {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [
            arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                arkts.factory.createIdentifier(BuilderParams.PARAM_WRAPPED),
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createIdentifier('ESValue'),
                        arkts.factory.createIdentifier('wrap'),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    undefined,
                    [
                        argument
                    ]
                )
            )
        ]
    );
}

/**
 * getItem
 * @returns let param_wrapped_it = param_wrapped.keys();
 */
function getItem(): arkts.Statement {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [
            arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                arkts.factory.createIdentifier(BuilderParams.PARAM_WRAPPED_IT),
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createIdentifier(BuilderParams.PARAM_WRAPPED),
                        arkts.factory.createIdentifier('keys'),
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

function getResult(): arkts.Statement {
    return arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
        [
            arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_CONST,
                arkts.factory.createIdentifier(BuilderParams.PARAM_WRAPPED_KEY),
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createIdentifier(BuilderParams.PARAM_WRAPPED_IT),
                        arkts.factory.createIdentifier('next'),
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

function getResultDone(): arkts.Statement {
    return arkts.factory.createIfStatement(
        arkts.factory.createMemberExpression(
            arkts.factory.createIdentifier(BuilderParams.PARAM_WRAPPED_KEY),
            arkts.factory.createIdentifier('done'),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        ),
        arkts.factory.createBlock([
            arkts.BreakStatement.createBreakStatement()
        ])
    );
}

function getParamWrappedProperty(): arkts.Statement {
    return arkts.factory.createCallExpression(
        arkts.factory.createMemberExpression(
            arkts.factory.createIdentifier(BuilderParams.PARAM_WRAPPED),
            arkts.factory.createIdentifier(ESValueMethodNames.GETPROPERTY),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        ),
        undefined,
        [
            arkts.factory.createTSAsExpression(
                arkts.factory.createMemberExpression(
                    arkts.factory.createIdentifier(BuilderParams.PARAM_WRAPPED_KEY),
                    arkts.factory.createIdentifier('value'),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),

                arkts.factory.createTypeReference(
                    arkts.factory.createTypeReferencePart(
                        arkts.factory.createIdentifier(ESValueMethodNames.ESVALUE)
                    )
                ),
                false
            ),
        ]
    );
}

function setInstanceParam(): arkts.Statement {
    return arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(BuilderParams.INSTANCEPARAM),
                arkts.factory.createIdentifier(ESValueMethodNames.SETPROPERTY),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            [
                arkts.factory.createTSAsExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createIdentifier(BuilderParams.PARAM_WRAPPED_KEY),
                        arkts.factory.createIdentifier('value'),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    arkts.factory.createTypeReference(
                        arkts.factory.createTypeReferencePart(
                            arkts.factory.createIdentifier(ESValueMethodNames.ESVALUE)
                        )
                    ),
                    false
                ),
                getParamWrappedProperty()
            ]
        )
    );
}

/**
 * getWhile
 * @returns
 *  while (true) {
        let param_wrapped_key = param_wrapped_it.next();
        if (param_wrapped_key.done) {
            break;
        }
        instanceParam.setProperty((param_wrapped_key.value as ESValue),
            param_wrapped.getProperty((param_wrapped_key.value as ESValue)));
    }
 */
function getWhile(): arkts.Statement {
    return arkts.WhileStatement.createWhileStatement(
        arkts.factory.createBooleanLiteral(true),
        arkts.factory.createBlock(
            [
                getResult(),
                getResultDone(),
                setInstanceParam()
            ]
        )
    );
}

function getUpdateArgs(node: arkts.CallExpression | arkts.Property): arkts.Statement[] {
    if (arkts.isProperty(node) || node.arguments.length !== 1) {
        return [];
    }
    let body: arkts.Statement[] = [];
    let argument = node.arguments[0];
    if (arkts.isObjectExpression(argument)) {
        body?.push(getPropertyESValue(InteropInternalNames.PARAM, InteropInternalNames.INSTANCE, 'arg1'));
        for (const property of argument.properties) {
            if (!(property instanceof arkts.Property)) {
                continue;
            }
            const key = property.key;
            const value = property.value;
            if (!(key instanceof arkts.Identifier) || value === undefined) {
                throw Error('Error arguments in Legacy Builder Function');
            }
            body?.push(setPropertyESValue(InteropInternalNames.PARAM, key.name, getWrapValue(value)));
        }
        const endBody =
            [
                createGlobal(),
                getPropertyESValue(BuilderMethodNames.RUNPENDINGJOBS,
                    InteropInternalNames.GLOBAL,
                    BuilderMethodNames.RUNPENDINGJOBS),
                invokeRunPendingJobs()
            ];
        body?.push(...endBody);
    } else if (arkts.isIdentifier(argument)) {
        const functionBody =
        [
            getInstanceParam(),
            instanceParamTypeOf(),
            getParamWrapped(argument),
            getItem(),
            getWhile(),
            createGlobal(),
            getPropertyESValue(BuilderMethodNames.RUNPENDINGJOBS,
                InteropInternalNames.GLOBAL,
                BuilderMethodNames.RUNPENDINGJOBS),
            invokeRunPendingJobs()
        ];
        body?.push(...functionBody);
    }

    return body;
}

function createBuilderUpdate(node: arkts.CallExpression | arkts.Property): arkts.ArrowFunctionExpression {
    return arkts.factory.createArrowFunction(
        arkts.factory.createScriptFunction(
            arkts.factory.createBlock(
                [
                    ...getUpdateArgs(node)
                ]
            ),
            arkts.factory.createFunctionSignature(
                undefined,
                [
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier(InteropInternalNames.INSTANCE,
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

function getInitArgs(node: arkts.CallExpression | arkts.Property): builderParam {
    const args: arkts.AstNode[] = [];
    let ObjectExpressionNum: number = 0;
    const body: arkts.Statement[] = [];
    if (arkts.isCallExpression(node)) {
        node.arguments.forEach((argument) => {
            if (arkts.isObjectExpression(argument)) {
                processArgument(argument, ObjectExpressionNum, body, args);
                ObjectExpressionNum++;
            } else {
                args.push(getWrapValue(argument));
            }
        });
    }
    return { args: args, paramsInfo: body };
}

function processArgument(argument: arkts.ObjectExpression, ObjectExpressionNum:number,
    body: arkts.Statement[], args: arkts.AstNode[]): void {
    const paramName: string = 'paramObject' + ObjectExpressionNum;
    body.push(createEmptyESValue(paramName));
    for (const property of argument.properties) {
        if (!(property instanceof arkts.Property)) {
            continue;
        }
        const key = property.key;
        const value = property.value;
        if (!(key instanceof arkts.Identifier) || value === undefined) {
            throw Error('Error arguments in Legacy Builder Function');
        }
        body.push(setPropertyESValue(paramName, key.name, getWrapValue(value)));
    }
    args.push(arkts.factory.createIdentifier(paramName));
}

/**
 * 
 * @param node node
 * @param moduleName moduleName
 * @returns After Checked, transform builder/WrappedBuilder -> compatibleComponent
 */
export function generateBuilderCompatible(
    node: arkts.CallExpression | arkts.Property,
    moduleName: string
): arkts.AstNode {
    let functionName = getFunctionName(node);
    let param: builderParam = getInitArgs(node);
    const initializer = createBuilderInitializer(moduleName, functionName, param);
    const updater: arkts.ArrowFunctionExpression = createBuilderUpdate(node);
    let result;
    if (arkts.isProperty(node)) {
        const callExpr = arkts.factory.createCallExpression(
            arkts.factory.createIdentifier(InteroperAbilityNames.ARKUICOMPATIBLE),
            undefined,
            [initializer, updater]
        );
        const newValue = arkts.factory.createArrowFunction(
            arkts.factory.createScriptFunction(
                arkts.BlockStatement.createBlockStatement([arkts.factory.createExpressionStatement(callExpr)]),
                arkts.factory.createFunctionSignature(undefined, [], undefined, false),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE
            )
        );
        arkts.NodeCache.getInstance().collect(callExpr);
        result = arkts.factory.updateProperty(node, node.key, newValue);
    } else {
        result = arkts.factory.updateCallExpression(
            node,
            arkts.factory.createIdentifier(InteroperAbilityNames.ARKUICOMPATIBLE),
            undefined,
            [initializer, updater]
        );
    }
    arkts.NodeCache.getInstance().collect(result);
    return result;
}

function getFunctionName(node: arkts.CallExpression | arkts.Property): string {
    if (arkts.isProperty(node)) {
        return 'createCompatibleNodeWithFuncVoid';
    }
    switch (node.arguments.length) {
        case 0:
            return 'createCompatibleNodeWithFuncVoid';
        case 1:
            return 'createCompatibleNodeWithFunc';
        case 2:
            return 'createCompatibleNodeWithFunc2';
        case 3:
            return 'createCompatibleNodeWithFunc3';
        case 4:
            return 'createCompatibleNodeWithFunc4';
        case 5:
            return 'createCompatibleNodeWithFunc5';
        case 6:
            return 'createCompatibleNodeWithFunc6';
        case 7:
            return 'createCompatibleNodeWithFunc7';
        case 8:
            return 'createCompatibleNodeWithFunc8';
        case 9:
            return 'createCompatibleNodeWithFunc9';
        case 10:
            return 'createCompatibleNodeWithFunc10';
        default:
            throw Error('Error arguments in Legacy Builder Function');
    }
}

export function isFromBuilder1_1(decl: arkts.AstNode | undefined): boolean {
    if (!decl || !arkts.isMethodDefinition(decl)) {
        return false;
    }
    const path = arkts.getProgramFromAstNode(decl).absName;
    const fileManager = FileManager.getInstance();
    if (fileManager.getLanguageVersionByFilePath(path) !== LANGUAGE_VERSION.ARKTS_1_1) {
        return false;
    }

    const annotations = decl.scriptFunction.annotations;
    const decorators: string[] = annotations.map((annotation) => {
        return (annotation.expr as arkts.Identifier).name;
    });
    for (const decorator of decorators) {
        if (decorator === 'memo' || decorator === 'Builder' || decorator === 'Memo') {
            return true;
        }
    }
    return false;
}

export function addcompatibleComponentImport(): void {
    ImportCollector.getInstance().collectSource('compatibleComponent', 'arkui.component.interop');
    ImportCollector.getInstance().collectImport('compatibleComponent');
}