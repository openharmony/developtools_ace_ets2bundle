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
import { PresetDecorators } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

// Can only be used with decorators for struct
const structOnlyDecorators = [
    PresetDecorators.REUSABLE_V1,
    PresetDecorators.REUSABLE_V2,
    PresetDecorators.COMPONENT_V1,
    PresetDecorators.COMPONENT_V2,
    PresetDecorators.ENTRY,
    PresetDecorators.PREVIEW,
    PresetDecorators.CUSTOM_DIALOG,
];

// Can only be used with decorators for property
const propertyOnlyDecorators = [
    PresetDecorators.STATE,
    PresetDecorators.PROP,
    PresetDecorators.LINK,
    PresetDecorators.PROVIDE,
    PresetDecorators.CONSUME,
    PresetDecorators.STORAGE_LINK,
    PresetDecorators.STORAGE_PROP,
    PresetDecorators.LOCAL_STORAGE_LINK,
    PresetDecorators.LOCAL_STORAGE_PROP,
    PresetDecorators.LOCAL,
    PresetDecorators.PARAM,
    PresetDecorators.EVENT,
    PresetDecorators.PROVIDER,
    PresetDecorators.CONSUMER,
    PresetDecorators.WATCH,
    PresetDecorators.REQUIRE,
    PresetDecorators.OBJECT_LINK,
    PresetDecorators.TRACK,
    PresetDecorators.ONCE
];

class ValidateDecoratorTargetRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            decoratorOnlyWithStruct: `The '@{{decoratorName}}' decorator can only be used with 'struct'.`,
            decoratorOnlyWithMemberProperty: `'@{{decoratorName}}' can only decorate member property.`
        };
    }

    public parsed(node: arkts.AstNode): void {
        this.validateDecoratorPropertyOnly(node);

        if (!arkts.isStructDeclaration(node)) {
            this.validateDecoratorStructOnly(node);
        }
    }

    private validateDecoratorPropertyOnly(
        node: arkts.AstNode,
    ): void {

        if (arkts.isScriptFunction(node) || arkts.isVariableDeclaration(node) || arkts.isTSInterfaceDeclaration(node) ||
            arkts.isTSTypeAliasDeclaration(node)) {
            node.annotations.forEach((annotation) => {
                this.validateDecorator(annotation, propertyOnlyDecorators, this.messages.decoratorOnlyWithMemberProperty);
            });
        }
    }

    private validateDecoratorStructOnly(node: arkts.AstNode): void {
        // class
        if (arkts.isClassDeclaration(node)) {
            node.definition?.annotations?.forEach((annotation) => {
                this.validateDecorator(annotation, structOnlyDecorators, this.messages.decoratorOnlyWithStruct);
            });
        }
        // function/ variable/ method/ classproperty/ interface/ type alias declaration
        if (arkts.isFunctionDeclaration(node) ||
            arkts.isVariableDeclaration(node) ||
            arkts.isClassProperty(node) ||
            arkts.isScriptFunction(node) ||
            arkts.isTSInterfaceDeclaration(node) ||
            arkts.isTSTypeAliasDeclaration(node)
        ) {
            node.annotations.forEach((annotation) => {
                this.validateDecorator(annotation, structOnlyDecorators, this.messages.decoratorOnlyWithStruct);
            });
        }

        // get /set method
        if (arkts.isMethodDefinition(node) &&
            (node.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET ||
                node.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET)) {
            node.scriptFunction.annotations.forEach((annotation) => {
                this.validateDecorator(annotation, structOnlyDecorators, this.messages.decoratorOnlyWithStruct);
            });
        }
    }

    // decorator check function
    private validateDecorator(
        annotation: arkts.AnnotationUsage,
        decorator: string[],
        message: string,
    ): void {
        if (annotation.expr && arkts.isIdentifier(annotation.expr)) {
            if (decorator.includes(annotation.expr.name)) {
                this.report({
                    node: annotation,
                    message: message,
                    data: {
                        decoratorName: annotation.expr.name,
                    },
                });
            }
        }
    }
}

export default ValidateDecoratorTargetRule;