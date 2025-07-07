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
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';
import { PresetDecorators } from '../utils/index';

function getObservedDecorator(node: arkts.AstNode, observedClasses: string[], observedV2Classes: string[]): void {
  for (const child of node.getChildren()) {
    // Check if it is of the ClassDeclaration type
    if (arkts.isClassDeclaration(child)) {
      // Get a list of annotations
      const annotations = child.definition?.annotations ?? [];
      // Check for @Observed decorators
      const hasObservedDecorator = annotations.find((annotation: any) =>
        annotation.expr.name === PresetDecorators.OBSERVED_V1);
      // Check if there is a @ObservedV2 decorator
      const hasObservedV2Decorator = annotations.find((annotation: any) =>
        annotation.expr.name === PresetDecorators.OBSERVED_V2);
      // If there is a @Observed decorator, record the class name
      if (hasObservedDecorator) {
        const className = child.definition?.ident?.name ?? '';
        observedClasses.push(className);
      }
      // If there is a @ObservedV2 decorator, record the class name
      if (hasObservedV2Decorator) {
        const className = child.definition?.ident?.name ?? '';
        observedV2Classes.push(className);
      }
    }
  }
}

function checkInheritanceCompatibility(context: UISyntaxRuleContext, node: arkts.ClassDeclaration,
  observedClasses: string[], observedV2Classes: string[]): void {
  const observedV1Decorator = node.definition?.annotations?.find(annotations =>
    annotations.expr &&
    arkts.isIdentifier(annotations.expr) &&
    annotations.expr.name === PresetDecorators.OBSERVED_V1
  );
  const observedV2Decorator = node.definition?.annotations?.find(annotations =>
    annotations.expr &&
    arkts.isIdentifier(annotations.expr) &&
    annotations.expr.name === PresetDecorators.OBSERVED_V2
  );

  //Get the name of the superClass
  const superClassName = node.definition?.super?.dumpSrc();
  if (!superClassName) {
    return;
  }
  // Verify that the inheritance relationship is compatible
  if (observedV1Decorator && observedV2Classes.includes(superClassName)) {
    context.report({
      node: observedV1Decorator,
      message: rule.messages.incompatibleHeritageObservedToObservedV2,
    });
  }
  if (observedV2Decorator && observedClasses.includes(superClassName)) {
    context.report({
      node: observedV2Decorator,
      message: rule.messages.incompatibleHeritageObservedV2ToObserved,
    });
  }
}

const rule: UISyntaxRule = {
  name: 'observed-heritage-compatible-check',
  messages: {
    incompatibleHeritageObservedToObservedV2: `The current class is decorated by '@Observed', it cannot inherit a class decorated by '@ObservedV2'.`,
    incompatibleHeritageObservedV2ToObserved: `The current class is decorated by '@ObservedV2', it cannot inherit a class decorated by '@Observed'.`,
  },
  setup(context) {
    // Record the class name decorated with @Observed and @ObservedV2
    const observedClasses: string[] = [];
    const observedV2Classes: string[] = [];
    return {
      parsed: (node): void => {
        // Check if it's of type "Program".
        if (arkts.nodeType(node) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
          getObservedDecorator(node, observedClasses, observedV2Classes);
        }

        // Check if the current node is a class declaration
        if (!arkts.isClassDeclaration(node)) {
          return;
        }
        checkInheritanceCompatibility(context, node, observedClasses, observedV2Classes);
      },
    };
  },
};

export default rule;