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
import { getAnnotationUsage, MAX_PREVIEW_DECORATOR_COUNT, PresetDecorators } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

class NoDuplicatePreviewRule extends AbstractUISyntaxRule {
    private previewDecoratorUsages: arkts.AnnotationUsage[] = [];
    private previewDecoratorUsageIndex = 10;

    public setup(): Record<string, string> {
        return {
            duplicateEntry: `A page can contain at most 10 '@Preview' annotations.`,
        };
    }

    public beforeTransform(): void {
        this.previewDecoratorUsages = [];
        this.previewDecoratorUsageIndex = 10;
    }

    public parsed(node: arkts.ETSStructDeclaration): void {
        if (!arkts.isETSStructDeclaration(node)) {
            return;
        }
        const previewDecoratorUsage = getAnnotationUsage(
            node,
            PresetDecorators.PREVIEW,
        );
        if (previewDecoratorUsage) {
            this.previewDecoratorUsages.push(previewDecoratorUsage);
        }
        // If the number of preview decorators is less than 10, no error is reported
        if (this.previewDecoratorUsages.length <= MAX_PREVIEW_DECORATOR_COUNT) {
            return;
        }
        if (this.previewDecoratorUsageIndex === MAX_PREVIEW_DECORATOR_COUNT) {
            this.previewDecoratorUsages.forEach((previewDecoratorUsage) => {
                this.reportError(previewDecoratorUsage);
            });
        } else {
            let previewDecoratorUsage = this.previewDecoratorUsages.at(this.previewDecoratorUsageIndex);
            if (!previewDecoratorUsage) {
                return;
            }
            this.reportError(previewDecoratorUsage);
        }
        this.previewDecoratorUsageIndex++;
    }

    private reportError(errorNode: arkts.AnnotationUsage): void {
        let startPosition = errorNode.startPosition;
        startPosition = arkts.createSourcePosition(startPosition.getIndex() - 1, startPosition.getLine());
        this.report({
            node: errorNode,
            message: this.messages.duplicateEntry,
            fix: () => {
                return {
                    title: 'Remove the duplicate \'Preview\' annotation',
                    range: [startPosition, errorNode.endPosition],
                    code: '',
                };
            }
        });
    }
}

export default NoDuplicatePreviewRule;