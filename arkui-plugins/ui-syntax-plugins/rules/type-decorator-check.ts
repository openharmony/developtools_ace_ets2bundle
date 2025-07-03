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
import { getAnnotationName, PresetDecorators, findDecorator, getClassDeclarationAnnotation } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

class TypeDecoratorCheckRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            invalidType: `The @Type decorator is not allowed here. It must be used in a class.`,
            invalidDecoratorWith: `The @Type decorator can not be used within a 'class' decorated with @Observed.`,
            invalidTypeMember: `The @Type decorator is not allowed here. It can only decorate properties of a class.`
        };
    }

    public parsed(node: arkts.AstNode): void {

        this.checkTypeOnlyForClass(node);

        // Check the decorator on the class
        if (arkts.isClassDeclaration(node)) {
            this.checkObservedAndTypeConflict(node);
        }

        if (arkts.isScriptFunction(node)) {
            this.validateScriptFunctionForTypeDecorator(node);
        }
    }

    // rule1: @Type can only be used for class
    private checkTypeOnlyForClass(node: arkts.AstNode): void {
        if (arkts.isStructDeclaration(node)) {
            node.definition?.body.forEach(member => {
                if (arkts.isClassProperty(member)) {
                    this.validateDecorator(member, PresetDecorators.TYPE);
                }
                if (arkts.isMethodDefinition(member)) {
                    this.validateDecorator(member.scriptFunction, PresetDecorators.TYPE);
                }
            });
            return;
        }

        // function/ variable/ interface/ type alias declaration
        if (arkts.isFunctionDeclaration(node) ||
            arkts.isVariableDeclaration(node) ||
            arkts.isTSInterfaceDeclaration(node) ||
            arkts.isTSTypeAliasDeclaration(node)
        ) {
            this.validateDecorator(node, PresetDecorators.TYPE);
        }
    }

    // rule2: Conflict between @Type and @Observed
    private checkObservedAndTypeConflict(
        node: arkts.ClassDeclaration,
    ): void {
        let typeDecorator: arkts.AnnotationUsage | undefined;
        node.definition?.body.forEach(member => {
            if (arkts.isClassProperty(member)) {
                typeDecorator = findDecorator(member, PresetDecorators.TYPE);
            }
        });
        const annotation = getClassDeclarationAnnotation(node, PresetDecorators.OBSERVED_V1);
        if (typeDecorator && annotation) {
            this.reportObservedAndTypeDecoratorConflict(typeDecorator);
        }
    }

    // rule3: @TypeCannot be used for function members
    private validateScriptFunctionForTypeDecorator(
        node: arkts.ScriptFunction,
    ): void {
        const typeDecorator = findDecorator(node, PresetDecorators.TYPE);
        this.reportInvalidTypeDecorator(typeDecorator);
    }

    private validateDecorator(
        node: arkts.ClassProperty | arkts.VariableDeclaration | arkts.FunctionDeclaration |
            arkts.ScriptFunction | arkts.TSInterfaceDeclaration | arkts.TSTypeAliasDeclaration,
        decoratorName: string
    ): void {
        const decorator = findDecorator(node, decoratorName);
        if (!decorator) {
            return;
        }

        this.report({
            node: decorator,
            message: this.messages.invalidType,
            fix: (decorator) => {
                const startPosition = decorator.startPosition;
                const endPosition = decorator.endPosition;
                return {
                    range: [startPosition, endPosition],
                    code: ''
                };
            }
        });
    }

    private reportObservedAndTypeDecoratorConflict(
        typeDecorator: arkts.AnnotationUsage | undefined,
    ): void {
        if (!typeDecorator) {
            return;
        }
        this.report({
            node: typeDecorator,
            message: this.messages.invalidDecoratorWith,
            fix: () => {
                const startPosition = typeDecorator.startPosition;
                const endPosition = typeDecorator.endPosition;
                return {
                    range: [startPosition, endPosition],
                    code: ''
                };
            }
        });
    }

    private reportInvalidTypeDecorator(
        typeDecorator: arkts.AnnotationUsage | undefined,
    ): void {
        if (!typeDecorator) {
            return;
        }
        this.report({
            node: typeDecorator,
            message: this.messages.invalidTypeMember,
            fix: (typeDecorator) => {
                const startPosition = typeDecorator.startPosition;
                const endPosition = typeDecorator.endPosition;
                return {
                    range: [startPosition, endPosition],
                    code: ''
                };
            }
        });
    }
}

export default TypeDecoratorCheckRule;