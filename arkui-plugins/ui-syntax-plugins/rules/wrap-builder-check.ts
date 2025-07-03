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
import { getIdentifierName, PresetDecorators, WRAP_BUILDER, getFunctionAnnotationUsage } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

class StructNoExtendsRule extends AbstractUISyntaxRule {
    private builderFunctionNames: string[] = [];

    public setup(): Record<string, string> {
        return {
            invalidWrapBuilderCheck: 'The wrapBuilder\'s parameter should be @Builder function.',
        };
    }

    public beforeTransform(): void {
        this.builderFunctionNames = [];
    }

    public parsed(node: arkts.StructDeclaration): void {
        this.collectBuilderFunctions(node);
        this.validateWrapBuilderInIdentifier(node);
    }

    // Collect all the function names that are decorated with @Builder
    private collectBuilderFunctions(node: arkts.AstNode): void {
        if (!arkts.isEtsScript(node)) {
            return;
        }
        node.statements.forEach((statement) => {
            if (!arkts.isFunctionDeclaration(statement)) {
                return;
            }
            const buildDecoratorUsage = getFunctionAnnotationUsage(statement, PresetDecorators.BUILDER);
            if (!buildDecoratorUsage) {
                return;
            }
            const functionName = statement.scriptFunction.id?.name;
            if (!functionName || functionName === '' || this.builderFunctionNames.includes(functionName)) {
                return;
            }
            this.builderFunctionNames.push(functionName);
        });
    }

    private validateWrapBuilderInIdentifier(node: arkts.AstNode): void {
        if (!arkts.isCallExpression(node) || !node.expression) {
            return;
        }
        // If the current node is not a wrap builder, return
        if (!arkts.isIdentifier(node.expression) || getIdentifierName(node.expression) !== WRAP_BUILDER) {
            return;
        }
        let functionName: string = '';
        // Get the parameters of the wrap builder
        node.arguments.forEach(argument => {
            if (!arkts.isIdentifier(argument)) {
                return;
            }
            functionName = argument.name;
        });
        // If the function name is not empty and not decorated by the @builder, an error is reported
        if (functionName === '' || !this.builderFunctionNames.includes(functionName)) {
            const errorNode = node.arguments[0];
            this.report({
                node: errorNode,
                message: this.messages.invalidWrapBuilderCheck,
            });
        }
    }
}

export default StructNoExtendsRule;