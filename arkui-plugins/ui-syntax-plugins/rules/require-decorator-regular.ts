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
import { getClassPropertyAnnotationNames, PresetDecorators, isPrivateClassProperty, getClassPropertyName, findDecorator } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

const allowedDecorators = [
    PresetDecorators.STATE,
    PresetDecorators.PROVIDE,
    PresetDecorators.PROP,
    PresetDecorators.PARAM,
    PresetDecorators.BUILDER_PARAM
];

class RequireDecoratorRegularRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            invalidUsage: `The @Require decorator can only be used on a regular variable or a variable decorated by @State, @Provide, @Prop, @Param, or @BuilderParam.`,
            invalidPrivateWithRequire: `Property '{{propertyName}}' can not be decorated with both {{decoratorName}} and private.`,
        };
    }

    public parsed(node: arkts.AstNode): void {
        if (!arkts.isStructDeclaration(node)) {
            return;
        }
        this.checkRequireDecorator(node);
    }

    private checkRequireDecorator(node: arkts.StructDeclaration): void {
        node.definition.body.forEach(member => {
            if (!arkts.isClassProperty(member)) {
                return;
            }
            // Get the list of decorators applied to the class property
            const propertyDecorators = getClassPropertyAnnotationNames(member);
            if (!propertyDecorators.includes(PresetDecorators.REQUIRE)) {
                return;
            }
            if (isPrivateClassProperty(member)) {
                this.handlePrivateWithRequire(member);
            }
            // Filter the decorators to find any that are not allowed with @Require
            const otherDecorator = this.findConflictingDecorator(member, allowedDecorators);
            const requireDecorator = findDecorator(member, PresetDecorators.REQUIRE);
            if (otherDecorator && requireDecorator) {
                this.report({
                    node: requireDecorator,
                    message: this.messages.invalidUsage,
                });
            }
        });
    }

    private findConflictingDecorator(
        member: arkts.ClassProperty,
        allowedDecorators: string[]
    ): arkts.AnnotationUsage | undefined {
        return member.annotations?.find(annotation =>
            annotation.expr && arkts.isIdentifier(annotation.expr) &&
            annotation.expr.name !== PresetDecorators.REQUIRE &&
            !allowedDecorators.includes(annotation.expr.name)
        );
    }

    private handlePrivateWithRequire(member: arkts.ClassProperty): void {
        const requireDecorator = findDecorator(member, PresetDecorators.REQUIRE);
        const propertyName = getClassPropertyName(member);
        if (!propertyName) {
            return;
        }
        if (requireDecorator) {
            this.report({
                node: requireDecorator,
                message: this.messages.invalidPrivateWithRequire,
                data: {
                    propertyName,
                    decoratorName: PresetDecorators.REQUIRE,
                },
            });
        }
    }
}

export default RequireDecoratorRegularRule;