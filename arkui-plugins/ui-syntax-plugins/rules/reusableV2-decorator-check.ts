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
import { PresetDecorators, getAnnotationUsage } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

class ReusableV2DecoratorCheckRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            conflictingDecorators: `The '@Reusable' and '@ReusableV2' annotations cannot be applied simultaneously.`,
            invalidDecoratorUsage: `@ReusableV2 is only applicable to custom components decorated by @ComponentV2.`,
        };
    }

    public parsed(node: arkts.AstNode): void {
        if (!arkts.isETSStructDeclaration(node)) {
            return;
        }
        if (!node.definition) {
            return;
        }
        if (!arkts.isClassDefinition(node.definition)) {
            return;
        }
        const structNode = node.definition.ident;
        // Check whether the decoration exists, and mark true if it does
        const reusableDecoratorUsage = getAnnotationUsage(node, PresetDecorators.REUSABLE_V1);
        const reusableV2DecoratorUsage = getAnnotationUsage(node, PresetDecorators.REUSABLE_V2);
        const componentV2DecoratorUsage = getAnnotationUsage(node, PresetDecorators.COMPONENT_V2);

        // Check whether @Reusable and @ReusableV2 exist at the same time
        if (reusableV2DecoratorUsage && reusableDecoratorUsage && structNode) {
            this.reportConflictingDecorators(reusableDecoratorUsage, structNode);
        }

        // Check if @ReusableV2 is applied to a class decorated by @ComponentV2
        if (reusableV2DecoratorUsage && !componentV2DecoratorUsage && structNode) {
            this.reportInvalidDecoratorUsage(node, structNode);
        }
    }

    private reportConflictingDecorators(
        reusableDecoratorUsage: arkts.AnnotationUsage | undefined,
        structNode: arkts.Identifier | undefined,
    ): void {
        if (!structNode || !reusableDecoratorUsage) {
            return;
        }
        this.report({
            node: structNode,
            message: this.messages.conflictingDecorators,
        });
    }

    private reportInvalidDecoratorUsage(
        node: arkts.ETSStructDeclaration,
        structNode: arkts.Identifier | undefined,
    ): void {
        if (!structNode || !node) {
            return;
        }
        this.report({
            node: structNode,
            message: this.messages.invalidDecoratorUsage,
        });
    }
}

export default ReusableV2DecoratorCheckRule;