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
import { getAnnotationUsage, PresetDecorators } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

class EntryStructNoExportRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            noExportWithEntry: `It's not a recommended way to export struct with '@Entry' decorator, which may cause ACE Engine error in component preview mode.`,
        };
    }

    public parsed(node: arkts.AstNode): void {
        // Check if the current node is a schema declaration
        if (!arkts.isStructDeclaration(node)) {
            return;
        }
        // Get the usage of the @Entry decorator
        const entryDecoratorUsage = getAnnotationUsage(
            node,
            PresetDecorators.ENTRY,
        );

        //Determines whether the struct is exported
        const isStructExport = node.isExport;
        const isStructDefaultExport = node.isDefaultExport;

        // If a @Entry decorator is present and the struct is exported
        if (entryDecoratorUsage && (isStructExport || isStructDefaultExport)) {
            this.report({
                node: entryDecoratorUsage,
                message: this.messages.noExportWithEntry,
            });
        }
    }
};

export default EntryStructNoExportRule;