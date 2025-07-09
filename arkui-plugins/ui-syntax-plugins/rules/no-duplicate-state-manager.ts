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
import { getClassPropertyAnnotationNames, getIdentifierName, PresetDecorators, getAnnotationUsage } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

const stateManagementDecorator = {
  STATE: PresetDecorators.STATE,
  PROP: PresetDecorators.PROP,
  LINK: PresetDecorators.LINK,
  PROVIDE: PresetDecorators.PROVIDER,
  CONSUME: PresetDecorators.CONSUME
};

const CLASS_PROPERTY_ANNOTATION_ONE: number = 1;

class NoDuplicateStateManagerRule extends AbstractUISyntaxRule {
  public setup(): Record<string, string> {
    return {
      duplicateState: `The property '{{attributeName}}' cannot have multiple state management decorators.`,
    };
  }

  public parsed(node: arkts.AstNode): void {
    if (!arkts.isStructDeclaration(node)) {
      return;
    }

    // If it's a struct for @ComponentV2, the check is skipped
    const componentV2Decorator = getAnnotationUsage(node, PresetDecorators.COMPONENT_V2);
    if (componentV2Decorator) {
      return;
    }

    this.checkForDuplicateStateDecorators(node);
  }

  // Check that the properties in the struct are not reused with state management-related decorators
  private checkForDuplicateStateDecorators(node: arkts.StructDeclaration): void {
    node.definition.body.forEach((body) => {
      if (!arkts.isClassProperty(body)) {
        return;
      }

      const propertyDecorators = getClassPropertyAnnotationNames(body);
      // Filter the decorators to get those related to state management
      const stateDecorators = propertyDecorators.filter(decorator =>
        Object.values(stateManagementDecorator).includes(decorator)
      );

      const propertyNameNode = body.key;
      if (!propertyNameNode || !arkts.isIdentifier(propertyNameNode)) {
        return;
      }

      const attributeName = getIdentifierName(propertyNameNode);
      if (stateDecorators.length > CLASS_PROPERTY_ANNOTATION_ONE) {
        this.report({
          node: propertyNameNode,
          message: this.messages.duplicateState,
          data: { attributeName },
        });
      }
    });
  }
}

export default NoDuplicateStateManagerRule;
