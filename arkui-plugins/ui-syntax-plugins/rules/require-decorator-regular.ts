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

class RequireDecoratorRegularRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            invalidPrivateWithRequire: `Property '{{propertyName}}' can not be decorated with both {{decoratorName}} and private.`,
        };
    }

    public parsed(node: arkts.AstNode): void {
        if (!arkts.isETSStructDeclaration(node)) {
            return;
        }
        this.checkRequireDecorator(node);
    }

    private checkRequireDecorator(node: arkts.ETSStructDeclaration): void {
        node.definition?.body.forEach(member => {
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
        });
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