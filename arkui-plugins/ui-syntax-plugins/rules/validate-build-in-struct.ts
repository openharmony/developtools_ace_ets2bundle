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
import { getIdentifierName, BUILD_NAME } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

const NOT_PARAM_LENGTH: number = 0;
const BUILD_FUNCTION_COUNT_INI: number = 0;
const BUILD_FUNCTION_COUNT: number = 1;
const NOT_STATEMENT_LENGTH: number = 0;

class ValidateBuildInStructRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            invalidComponent: `The 'build' method can not have arguments.`,
            invalidBuild: `The struct '{{structName}}' must have at least and at most one 'build' method.`,
        };
    }

    public parsed(node: arkts.AstNode): void {
        if (!arkts.isStructDeclaration(node)) {
            return;
        }
        let buildFunctionCount: number = BUILD_FUNCTION_COUNT_INI;
        this.validateBuild(node, buildFunctionCount);
    }

    private validateBuild(
        node: arkts.StructDeclaration,
        buildFunctionCount: number
    ): void {
        node.definition.body.forEach((member) => {
            // Check if the member is defined for the method and the method name is 'build'
            if (arkts.isMethodDefinition(member) && arkts.isIdentifier(member.name) && getIdentifierName(member.name) === BUILD_NAME) {
                buildFunctionCount++;
                this.validateBuildFunctionParameters(member);
                this.validateDuplicateBuild(buildFunctionCount, member);
            }
            // rule2: This rule validates the use of the 'build' function
            if (arkts.isMethodDefinition(member) &&
                arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_CONSTRUCTOR === member.kind) {
                this.validateConstructorForBuildFunction(node, member, buildFunctionCount);
            }
        });
    }

    // rule1: Check if the build function contains arguments and report an error
    private validateBuildFunctionParameters(buildFunction: arkts.MethodDefinition): void {
        const paramsNodes = buildFunction.scriptFunction.params;
        if (paramsNodes.length > NOT_PARAM_LENGTH) {
            paramsNodes.forEach((param) => {
                if (arkts.isEtsParameterExpression(param)) {
                    this.reportBuildParamNotAllowed(param);
                }
            });
        }
    }

    private validateDuplicateBuild(
        buildFunctionCount: number,
        member: arkts.MethodDefinition,
    ): void {
        if (buildFunctionCount > BUILD_FUNCTION_COUNT) {
            const buildNode = member.scriptFunction.id;
            if (!buildNode) {
                return;
            }
            if (!arkts.isIdentifier(buildNode)) {
                return;
            }
            this.report({
                node: member,
                message: this.messages.invalidBuild,
                data: {
                    structName: getIdentifierName(buildNode),
                },
                fix: () => {
                    const startPosition = member.startPosition;
                    const endPosition = member.endPosition;
                    return {
                        title: 'Remove the duplicate build function.',
                        range: [startPosition, endPosition],
                        code: ``
                    };
                }
            });
        }
    }

    private validateConstructorForBuildFunction(
        node: arkts.StructDeclaration,
        member: arkts.MethodDefinition,
        buildFunctionCount: number,
    ): void {
        const blockStatement = member.scriptFunction.body;
        if (!blockStatement || !arkts.isBlockStatement(blockStatement)) {
            return;
        }
        const statements = blockStatement.statements;
        const structName = node.definition.ident;
        if (buildFunctionCount === BUILD_FUNCTION_COUNT_INI &&
            statements.length === NOT_STATEMENT_LENGTH) {
            this.reportMissingBuildInStruct(structName, node);
        }
    }

    // Report an error with an unallowed parameter in the build function
    private reportBuildParamNotAllowed(
        param: arkts.ETSParameterExpression,
    ): void {
        this.report({
            node: param,
            message: this.messages.invalidComponent,
            fix: (param) => {
                const startPosition = param.startPosition;
                const endPosition = param.endPosition;
                return {
                    title: 'Remove the parmeters of the build function',
                    range: [startPosition, endPosition],
                    code: ''
                };
            }
        });
    }

    private reportMissingBuildInStruct(
        structName: arkts.Identifier | undefined,
        node: arkts.StructDeclaration,
    ): void {
        if (!structName) {
            return;
        }
        this.report({
            node: structName,
            message: this.messages.invalidBuild,
            data: {
                structName: getIdentifierName(structName),
            },
            fix: () => {
                let startPosition = node.endPosition;
                startPosition = arkts.SourcePosition.create(startPosition.index() - 1, startPosition.line());
                const endPosition = startPosition;
                return {
                    title: 'Add a build function to the custom component',
                    range: [startPosition, endPosition],
                    code: 'build() {\n}\n'
                };
            }
        });
    }
}

export default ValidateBuildInStructRule;