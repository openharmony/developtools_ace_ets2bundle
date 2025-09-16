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

class ObservedObservedV2Rule extends AbstractUISyntaxRule {
  public setup(): Record<string, string> {
    return {
      conflictingDecorators: `A class cannot be decorated by both '@Observed' and '@ObservedV2' at the same time.`,
    };
  }

  public parsed(node: arkts.AstNode): void {
    if (!arkts.isClassDeclaration(node)) {
      return;
    }
    const hasObservedDecorator = node.definition?.annotations?.find(annotations => annotations.expr &&
      arkts.isIdentifier(annotations.expr) &&
      annotations.expr.name === PresetDecorators.OBSERVED_V1);
    const hasObservedV2Decorator = node.definition?.annotations?.find(annotations => annotations.expr &&
      arkts.isIdentifier(annotations.expr) &&
      annotations.expr.name === PresetDecorators.OBSERVED_V2);
    // If the current class is decorated by @Observed and @ObservedV2, an error is reported
    if (hasObservedDecorator && hasObservedV2Decorator) {
      this.report({
        node: hasObservedDecorator,
        message: this.messages.conflictingDecorators,
      });
    }
  }
};

export default ObservedObservedV2Rule;
