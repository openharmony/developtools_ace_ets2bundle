/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
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

const ENTRY_VALUE: string = 'value';
const ENTRY_STORAGE: string = 'storage';
const ENTRY_USE_SHARED_STORAGE: string = 'useSharedStorage';

class EntryComponentV2InvalidParamsRule extends AbstractUISyntaxRule {
  private entryDecoratorHasInvalidEntryOptions: boolean = false;
  private entryDecoratorHasInvalidLocalStorage: boolean = false;

  public setup(): Record<string, string> {
    return {
      invalidEntryOptions: `The "@Entry" decorator that has "storage" or "useSharedStorage" parameters cannot be used together with the "@ComponentV2" decorator.`,
      invalidLocalStorage: `The "@Entry" decorator that has a "LocalStorage" type parameter cannot be used together with the "@ComponentV2" decorator.`
    };
  }

  public parsed(node: arkts.AstNode): void {
    if (!arkts.isETSStructDeclaration(node)) {
      return;
    }

    const componentV2DecoratorUsage = getAnnotationUsage(node, PresetDecorators.COMPONENT_V2);
    if (!componentV2DecoratorUsage) {
      return;
    }

    const entryDecoratorUsage = getAnnotationUsage(node, PresetDecorators.ENTRY);
    if (!entryDecoratorUsage) {
      return;
    }

    this.checkEntryDecoratorHasInvalidEntryOptions(entryDecoratorUsage);
    if (this.entryDecoratorHasInvalidEntryOptions) {
      this.report({
        node: entryDecoratorUsage,
        message: this.messages.invalidEntryOptions,
      });
      return;
    }

    if (this.entryDecoratorHasInvalidLocalStorage) {
      this.report({
        node: entryDecoratorUsage,
        message: this.messages.invalidLocalStorage,
      });
    }
  }

  private checkEntryDecoratorHasInvalidEntryOptions(entryDecorator: arkts.AnnotationUsage): void {
    entryDecorator.properties.forEach((property) => {
      if (arkts.isClassProperty(property) && property.key && arkts.isIdentifier(property.key)) {
        const propertyName = property.key.name;
        if (propertyName === ENTRY_STORAGE || propertyName === ENTRY_USE_SHARED_STORAGE) {
          this.entryDecoratorHasInvalidEntryOptions = true;
        } else if (propertyName === ENTRY_VALUE) {
          this.entryDecoratorHasInvalidLocalStorage = true;
        }
      }
    });
  }
}

export default EntryComponentV2InvalidParamsRule;