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
import { getAnnotationUsage, MAX_ENTRY_DECORATOR_COUNT, PresetDecorators } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

class NoDuplicateEntryRule extends AbstractUISyntaxRule {
    private entryDecoratorUsages: arkts.AnnotationUsage[] = [];
    private entryDecoratorUsageIndex = 1;

    public setup(): Record<string, string> {
        return {
            duplicateEntry: `A page can't contain more then one '@Entry' annotation.`,
        };
    }

    public beforeTransform(): void {
        this.entryDecoratorUsages = [];
        this.entryDecoratorUsageIndex = 1;
    }

    public parsed(node: arkts.StructDeclaration): void {
        if (!arkts.isStructDeclaration(node)) {
            return;
        }
        let entryDecoratorUsage = getAnnotationUsage(node, PresetDecorators.ENTRY);
        if (entryDecoratorUsage) {
            this.entryDecoratorUsages.push(entryDecoratorUsage);
        }
        // If more than one entry decorator is recorded, an error is reported
        if (this.entryDecoratorUsages.length <= MAX_ENTRY_DECORATOR_COUNT) {
            return;
        }
        if (this.entryDecoratorUsageIndex === MAX_ENTRY_DECORATOR_COUNT) {
            const entryDecoratorUsage = this.entryDecoratorUsages.at(0)!;
            this.report({
                node: entryDecoratorUsage,
                message: this.messages.duplicateEntry,
                fix: () => {
                    return {
                        range: [entryDecoratorUsage.startPosition, entryDecoratorUsage.endPosition],
                        code: '',
                    };
                },
            });
        }
        entryDecoratorUsage = this.entryDecoratorUsages.at(this.entryDecoratorUsageIndex)!;
        this.report({
            node: entryDecoratorUsage,
            message: this.messages.duplicateEntry,
            fix: () => {
                return {
                    range: [entryDecoratorUsage.startPosition, entryDecoratorUsage.endPosition],
                    code: '',
                };
            },
        });
        this.entryDecoratorUsageIndex++;
    }
}

export default NoDuplicateEntryRule;
