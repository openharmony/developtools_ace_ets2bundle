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
import { PresetDecorators, getAnnotationName, getAnnotationUsage, getIdentifierName } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

const oldV1Decorators: string[] = [
  PresetDecorators.STATE,
  PresetDecorators.PROP,
  PresetDecorators.LINK,
  PresetDecorators.PROVIDE,
  PresetDecorators.CONSUME,
  PresetDecorators.WATCH,
  PresetDecorators.STORAGE_LINK,
  PresetDecorators.STORAGE_PROP,
  PresetDecorators.LOCAL_STORAGE_LINK,
  PresetDecorators.LOCAL_STORAGE_PROP,
  PresetDecorators.OBJECT_LINK,
];
const newV2decorators: string[] = [
  PresetDecorators.LOCAL,
  PresetDecorators.PARAM,
  PresetDecorators.ONCE,
  PresetDecorators.EVENT,
  PresetDecorators.MONITOR,
  PresetDecorators.PROVIDER,
  PresetDecorators.CONSUMER,
  PresetDecorators.COMPUTED,
];

function findPropertyDecorator(
  node: arkts.ClassProperty,
  decoratorList: string[]
): arkts.AnnotationUsage | undefined {
  return node.annotations?.find(annotation =>
    annotation.expr &&
    arkts.isIdentifier(annotation.expr) &&
    decoratorList.includes(getIdentifierName(annotation.expr))
  );
}

function reportDecoratorError(
  context: UISyntaxRuleContext,
  hasStateDecorator: arkts.AnnotationUsage,
  hasComponentV2Decorator: arkts.AnnotationUsage,
  structDecoratorName: string
): void {
  let propertyDecoratorName = getAnnotationName(hasStateDecorator);
  context.report({
    node: hasStateDecorator,
    message: rule.messages.oldAndNewDecoratorsMixUse,
    data: {
      decoratorName: propertyDecoratorName,
      component: structDecoratorName,
    },
    fix: () => {
      return {
        range: [hasComponentV2Decorator.startPosition, hasComponentV2Decorator.endPosition],
        code: `@${structDecoratorName}`,
      };
    },
  });
}

function findDecoratorError(
  node: arkts.StructDeclaration,
  context: UISyntaxRuleContext
): void {
  // Gets the decorator version of a custom component
  const hasComponentV2Decorator = getAnnotationUsage(node, PresetDecorators.COMPONENT_V2);
  const hasComponentDecorator = getAnnotationUsage(node, PresetDecorators.COMPONENT_V1);
  node.definition.body.forEach((property) => {
    if (!arkts.isClassProperty(property)) {
      return;
    }
    const hasNewDecorator = findPropertyDecorator(property, newV2decorators);
    const hasOldDecorator = findPropertyDecorator(property, oldV1Decorators);
    // Check that the new decorator is used for componennt v2
    if (hasNewDecorator && !hasComponentV2Decorator && hasComponentDecorator) {
      reportDecoratorError(context, hasNewDecorator, hasComponentDecorator, PresetDecorators.COMPONENT_V2);
    }
    // Check that the old decorator is used for componennt v1
    if (hasOldDecorator && !hasComponentDecorator && hasComponentV2Decorator) {
      reportDecoratorError(context, hasOldDecorator, hasComponentV2Decorator, PresetDecorators.COMPONENT_V1);
    }
  });
}


const rule: UISyntaxRule = {
  name: 'old-new-decorator-mix-use-check',
  messages: {
    oldAndNewDecoratorsMixUse: `The '@{{decoratorName}}' decorator can only be used in a 'struct' decorated with '@{{component}}'.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        if (!arkts.isStructDeclaration(node)) {
          return;
        }
        findDecoratorError(node, context);
      },
    };
  },
};

export default rule;