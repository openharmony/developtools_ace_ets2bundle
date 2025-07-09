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
import { getAnnotationUsage, getClassPropertyAnnotationNames, PresetDecorators } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

class EntryLocalStorageCheckRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            entryLocalStorageCheck: `'@Entry' should have a parameter, like '@Entry ({ storage: "__get_local_storage__" })'.`,
        };
    }

    public parsed(node: arkts.AstNode): void {
        if (!arkts.isStructDeclaration(node)) {
            return;
        }
        this.checkLocalStorageLink(node);
    }

    private checkLocalStorageLink(node: arkts.StructDeclaration): void {
        // Check if @Entry decorator exists with parameter
        const entryDecorator = getAnnotationUsage(node, PresetDecorators.ENTRY);
        const isStorageUsed = entryDecorator && node.definition.annotations[0].properties[0];
        // Check if @LocalStorageLink exists
        let localStorageLinkUsed = false;
        node.definition.body.forEach(body => {
            if (!arkts.isClassProperty(body)) {
                return;
            }
            const propertyDecorators = getClassPropertyAnnotationNames(body);
            localStorageLinkUsed = propertyDecorators.some(
                decorator => decorator === PresetDecorators.LOCAL_STORAGE_LINK ||
                    decorator === PresetDecorators.STORAGE_PROP_REF);
        });

        // If @LocalStorageLink is used but @Entry(storage) is missing, report error
        if (entryDecorator && localStorageLinkUsed && !isStorageUsed) {
            this.report({
                node: entryDecorator,
                message: this.messages.entryLocalStorageCheck
            });
        }
    }
}

export default EntryLocalStorageCheckRule;