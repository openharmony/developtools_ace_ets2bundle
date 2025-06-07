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
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

const invalidDecorators = [PresetDecorators.PROP, PresetDecorators.LINK, PresetDecorators.OBJECT_LINK];

function checkNoPropLinkOrObjectLinkInEntry(context: UISyntaxRuleContext, node: arkts.StructDeclaration): void {
  // Check if the struct has the @Entry decorator
  const isEntryComponent = !!getAnnotationUsage(node, PresetDecorators.ENTRY);
  if (!node.definition.ident || !arkts.isIdentifier(node.definition.ident)) {
    return;
  }
  const componentName = node.definition.ident.name;
  if (!isEntryComponent) {
    return;
  }
  node.definition.body.forEach(body => {
    if (!arkts.isClassProperty(body)) {
      return;
    }
    if (!body.key || !arkts.isIdentifier(body.key)) {
      return;
    }
    const propertyName = body.key.name;
    // Check if any invalid decorators are applied to the class property
    body.annotations?.forEach(annotation => {
      reportInvalidDecorator(context, annotation, invalidDecorators, componentName, propertyName);
    });
  });
}

function reportInvalidDecorator(context: UISyntaxRuleContext, annotation: arkts.AnnotationUsage,
  invalidDecorators: string[], componentName: string, propertyName: string): void {
  if (annotation.expr && arkts.isIdentifier(annotation.expr) && invalidDecorators.includes(annotation.expr.name)) {
    const decoratorName = annotation.expr.name;
    context.report({
      node: annotation,
      message: rule.messages.disallowDecoratorInEntry,
      data: {
        componentName,
        decoratorName,
        propertyName,
      },
      fix: (annotation) => {
        const startPosition = annotation.startPosition;
        const endPosition = annotation.endPosition;
        return {
          range: [startPosition, endPosition],
          code: '',
        };
      },
    });
  }
}

const rule: UISyntaxRule = {
  name: 'no-prop-link-objectlink-in-entry',
  messages: {
    disallowDecoratorInEntry: `The '@Entry' component '{{componentName}}' cannot have the '@{{decoratorName}}' property '{{propertyName}}'.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        if (!arkts.isStructDeclaration(node)) {
          return;
        }
        checkNoPropLinkOrObjectLinkInEntry(context, node);
      },
    };
  },
};

export default rule;
