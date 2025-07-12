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
import { ESValueMethodNames, builderMethodNames, InteroperAbilityNames } from './predefines';
import { 
    createELMTID, 
    createEmptyESValue, 
    createGlobal,
    createInitReturn, 
    getPropertyESValue, 
    getWrapValue, 
    setPropertyESValue 
} from './utils';

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
                    arkts.factory.createIdentifier(InteroperAbilityNames.ELMTID),
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
                arkts.factory.createIdentifier(builderMethodNames.RUNPENDINGJOBS),
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
    const viewPU = getPropertyESValue('viewPUCreate', InteroperAbilityNames.GLOBAL, 'viewPUCreate');
    const create = arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier('viewPUCreate'),
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
    return [viewPU, create];
}

function createBuilderInitializer(className: string, functionName: string, param: builderParam): arkts.ArrowFunctionExpression {
    const block = arkts.factory.createBlock(
        [
            createGlobal(),
            ...createELMTID(),
            getPropertyESValue(builderMethodNames.CREATECOMPATIBLENODE, InteroperAbilityNames.GLOBAL, functionName),
            ...param.paramsInfo,
            invokeFunctionWithParam(builderMethodNames.CREATECOMPATIBLENODE, InteroperAbilityNames.COMPONENT, className, param.args),
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

function getUpdateArgs(node: arkts.CallExpression): arkts.Statement[] {
    if (node.arguments.length !== 1) {
        return [];
    }
    let body: arkts.Statement[] = [];
    let argument = node.arguments[0];
    if (arkts.isObjectExpression(argument)) {
        body?.push(getPropertyESValue('param', InteroperAbilityNames.INSTANCE, 'arg1'));
        for (const property of argument.properties) {
            if (!(property instanceof arkts.Property)) {
                continue;
            }
            const key = property.key;
            const value = property.value;
            if (!(key instanceof arkts.Identifier) || value === undefined) {
                throw Error('Error arguments in Legacy Builder Function');
            }
            body?.push(setPropertyESValue('param', key.name, getWrapValue(value)));
        }
        const endBody =
            [
                createGlobal(),
                getPropertyESValue(builderMethodNames.RUNPENDINGJOBS,
                    InteroperAbilityNames.GLOBAL,
                    builderMethodNames.RUNPENDINGJOBS),
                invokeRunPendingJobs()
            ];
        body?.push(...endBody);
    }

    return body;
}

function createBuilderUpdate(node: arkts.CallExpression): arkts.ArrowFunctionExpression {
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

function getInitArgs(node: arkts.CallExpression): builderParam {
    const args: arkts.AstNode[] = [];
    let ObjectExpressionNum: number = 0;
    const body: arkts.Statement[] = [];
    node.arguments.forEach((argument) => {
        if (arkts.isObjectExpression(argument)) {
            processArgument(argument, ObjectExpressionNum, body, args);
            ObjectExpressionNum++;
        } else {
            args.push(getWrapValue(argument));
        }
    });
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
export function generateBuilderCompatible(node: arkts.CallExpression, moduleName: string): arkts.CallExpression {
    let functionName;
    switch (node.arguments.length) {
        case 0:
            functionName = 'createCompatibleNodeWithFuncVoid';
            break;
        case 1:
            functionName = 'createCompatibleNodeWithFunc';
            break;
        case 2:
            functionName = 'createCompatibleNodeWithFunc2';
            break;
        case 3:
            functionName = 'createCompatibleNodeWithFunc3';
            break;
        case 4:
            functionName = 'createCompatibleNodeWithFunc4';
            break;
        case 5:
            functionName = 'createCompatibleNodeWithFunc5';
            break;
        default:
            throw Error('Error arguments in Legacy Builder Function');
    }
    let param: builderParam = getInitArgs(node);
    const initializer = createBuilderInitializer(moduleName, functionName, param);
    const updater: arkts.ArrowFunctionExpression = createBuilderUpdate(node);
    const result = arkts.factory.updateCallExpression(
        node,
        arkts.factory.createIdentifier(InteroperAbilityNames.ARKUICOMPATIBLE),
        undefined,
        [
            initializer,
            updater,
        ]
    );
    arkts.NodeCache.getInstance().collect(result);
    return result;
}