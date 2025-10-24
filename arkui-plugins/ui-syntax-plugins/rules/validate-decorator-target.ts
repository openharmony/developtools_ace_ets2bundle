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
import { PresetDecorators, isInStructContext } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

// Can only be used with decorators for struct
const structOnlyDecorators = [
    // componentDecorators
    PresetDecorators.ENTRY,
    PresetDecorators.PREVIEW,
    PresetDecorators.COMPONENT_V1,
    PresetDecorators.CUSTOM_DIALOG,
    PresetDecorators.REUSABLE_V1,
    PresetDecorators.COMPONENT_V2,
    PresetDecorators.REUSABLE_V2,

    // componentMemberDecorators
    PresetDecorators.STATE,
    PresetDecorators.PROP_REF,
    PresetDecorators.LINK,
    PresetDecorators.STORAGE_PROP_REF,
    PresetDecorators.STORAGE_LINK,
    PresetDecorators.PROVIDE,
    PresetDecorators.CONSUME,
    PresetDecorators.OBJECT_LINK,
    PresetDecorators.WATCH,
    PresetDecorators.BUILDER_PARAM,
    PresetDecorators.LOCAL_STORAGE_LINK,
    PresetDecorators.LOCAL_STORAGE_PROP_REF,
    PresetDecorators.REQUIRE,

    // componentV2MemberDecorators
    PresetDecorators.LOCAL,
    PresetDecorators.PARAM,
    PresetDecorators.ONCE,
    PresetDecorators.EVENT,
    PresetDecorators.PROVIDER,
    PresetDecorators.CONSUMER,
];

// Property decorators
const propertyOnlyDecorators = [
    PresetDecorators.STATE,
    PresetDecorators.PROP_REF,
    PresetDecorators.LINK,
    PresetDecorators.STORAGE_PROP_REF,
    PresetDecorators.STORAGE_LINK,
    PresetDecorators.PROVIDE,
    PresetDecorators.CONSUME,
    PresetDecorators.OBJECT_LINK,
    PresetDecorators.WATCH,
    PresetDecorators.LOCAL_STORAGE_LINK,
    PresetDecorators.LOCAL_STORAGE_PROP_REF,
    PresetDecorators.REQUIRE,
    PresetDecorators.LOCAL,
    PresetDecorators.PARAM,
    PresetDecorators.ONCE,
    PresetDecorators.EVENT,
    PresetDecorators.PROVIDER,
    PresetDecorators.CONSUMER,
    PresetDecorators.ENV,
    PresetDecorators.MONITOR,
];

class ValidateDecoratorTargetRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            decoratorOnlyWithStruct: `The '@{{decoratorName}}' annotation can only be used with 'struct'.`,
            decoratorOnlyWithMemberProperty: `'@{{decoratorName}}' can only decorate member property.`
        };
    }

    public parsed(node: arkts.AstNode): void {
        this.validateDecoratorPropertyOnly(node);
        this.validateDecoratorStructOnly(node);
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
        // If it's not inside a struct don't check it
        if (isInStructContext(node)) {
            return;
        }
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