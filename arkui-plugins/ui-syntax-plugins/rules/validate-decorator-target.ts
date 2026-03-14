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

const ComponentDecorators: Set<string> = new Set([
    PresetDecorators.ENTRY,
    PresetDecorators.PREVIEW,
    PresetDecorators.COMPONENT_V1,
    PresetDecorators.COMPONENT_V2,
    PresetDecorators.CUSTOM_DIALOG,
    PresetDecorators.REUSABLE_V1,
    PresetDecorators.REUSABLE_V2,
]);

const ComponentMemberDecorators: Set<string> = new Set([
    PresetDecorators.STATE,
    PresetDecorators.PROP_REF,
    PresetDecorators.STORAGE_PROP_REF,
    PresetDecorators.LOCAL_STORAGE_PROP_REF,
    PresetDecorators.LINK,
    PresetDecorators.OBJECT_LINK,
    PresetDecorators.STORAGE_LINK,
    PresetDecorators.LOCAL_STORAGE_LINK,
    PresetDecorators.PROVIDE,
    PresetDecorators.CONSUME,
    PresetDecorators.WATCH,
    PresetDecorators.BUILDER_PARAM,
    PresetDecorators.REQUIRE,
    PresetDecorators.EVENT,
    PresetDecorators.CONSUMER,
    PresetDecorators.PROVIDER,
    PresetDecorators.ONCE,
    PresetDecorators.LOCAL,
    PresetDecorators.PARAM,
    PresetDecorators.ENV,
]);

const LifecycleDecorators: Set<string> = new Set([
    PresetDecorators.COMPONENTINIT,
    PresetDecorators.COMPONENTAPPEAR,
    PresetDecorators.COMPONENTBUILT,
    PresetDecorators.COMPONENTRECYCLE,
    PresetDecorators.COMPONENTREUSE,
    PresetDecorators.COMPONENTDISAPPEAR,
]);

// Can only be used with decorators for struct
const structOnlyDecorators = [...ComponentDecorators, ...ComponentMemberDecorators, ...LifecycleDecorators];

// Can only be used with decorators for property
const propertyOnlyDecorators = [
    PresetDecorators.STATE,
    PresetDecorators.PROP_REF,
    PresetDecorators.LINK,
    PresetDecorators.PROVIDE,
    PresetDecorators.CONSUME,
    PresetDecorators.STORAGE_LINK,
    PresetDecorators.STORAGE_PROP_REF,
    PresetDecorators.LOCAL_STORAGE_LINK,
    PresetDecorators.WATCH,
    PresetDecorators.REQUIRE,
    PresetDecorators.OBJECT_LINK,
];

interface DecoratorInfo {
    decorator: arkts.AnnotationUsage;
    isInStruct: boolean;
}

type PropertyOnlyNodeType =
    | arkts.ScriptFunction
    | arkts.VariableDeclaration
    | arkts.TSInterfaceDeclaration
    | arkts.TSTypeAliasDeclaration;

class ValidateDecoratorTargetRule extends AbstractUISyntaxRule {
    private allDecorators: DecoratorInfo[] = [];
    private propertyOnlyNodes: PropertyOnlyNodeType[] = [];

    public setup(): Record<string, string> {
        return {
            decoratorOnlyWithStruct: `The '@{{decoratorName}}' annotation can only be used with 'struct'.`,
            decoratorOnlyWithProperty: `'@{{decoratorName}}' can only decorate member property.`
        };
    }

    public beforeTransform(): void {
        this.allDecorators = [];
        this.propertyOnlyNodes = [];
    }

    public parsed(node: arkts.AstNode): void {
        if (arkts.isEtsScript(node)) {
            this.collectNodes(node);
        }
    }

    public afterTransform(): void {
        this.validateDecoratorStructOnly();
        this.validateDecoratorPropertyOnly();
    }

    private collectNodes(node: arkts.EtsScript): void {
        this.traverseNodes(node, false);
    }

    private traverseNodes(node: arkts.AstNode, isInStruct: boolean): void {
        if (arkts.isAnnotationUsage(node)) {
            this.allDecorators.push({
                decorator: node,
                isInStruct: isInStruct
            });
        }
        if (
            arkts.isScriptFunction(node) ||
            arkts.isVariableDeclaration(node) ||
            arkts.isTSInterfaceDeclaration(node) ||
            arkts.isTSTypeAliasDeclaration(node)
        ) {
            this.propertyOnlyNodes.push(node);
        }
        if (arkts.isStructDeclaration(node)) {
            isInStruct = true;
        }
        node.getChildren().forEach((child) => {
            this.traverseNodes(child, isInStruct);
        });
    }

    private validateDecoratorPropertyOnly(): void {
        for (const item of this.propertyOnlyNodes) {
            item.annotations.forEach((annotation) => {
                this.validateDecorator(annotation, propertyOnlyDecorators, this.messages.decoratorOnlyWithProperty);
            });
        }
    }

    private validateDecoratorStructOnly(): void {
        for (const item of this.allDecorators) {
            if (item.isInStruct) {
                continue;
            }
            this.validateDecorator(item.decorator, structOnlyDecorators, this.messages.decoratorOnlyWithStruct);
        }
    }

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
