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

const rule: UISyntaxRule = {
  name: 'track-decorator-check',
  messages: {
    invalidTarget: `The '@Track' decorator can only be used on class member variables.`,
    invalidClass: `The '@Track' decorator can only be used within a 'class' decorated with '@Observed'.`
  },
  setup(context) {
    return {
      parsed: (node): void => {
        if (arkts.isStructDeclaration(node)) {
          checkInvalidTrackAnnotations(context, node);
        }
        // Check if the current node is a class declaration
        if (arkts.isClassDeclaration(node)) {
          checkTrackOnlyUsedWithObserved(context, node);
        }
      }
    };
  }
};

function checkInvalidTrackAnnotations(context: UISyntaxRuleContext, node: arkts.StructDeclaration): void {
  // Traverse all members of the struct body
  node.definition.body.forEach((member) => {
    // Check whether it is a member variable
    if (arkts.isClassProperty(member)) {
      const hasTrackDecorator = findClassPropertyAnnotation(member, PresetDecorators.TRACK);
      // If a member variable is decorated with @Track, an error is reported immediately
      if (hasTrackDecorator) {
        reportInvalidTarget(context, hasTrackDecorator);
      }
    }
    // Check whether this is the method
    if (arkts.isMethodDefinition(member)) {
      const hasTrackDecorator = getMethodAnnotation(member, PresetDecorators.TRACK);
      // If the method is decorated with @Track, an error is reported immediately
      if (hasTrackDecorator) {
        reportInvalidTarget(context, hasTrackDecorator);
      }
    }
  },);
}

function checkTrackOnlyUsedWithObserved(context: UISyntaxRuleContext, node: arkts.ClassDeclaration): void {
  // Check if the class is decorated with @Observed
  const hasObservedDecorator = node.definition?.annotations?.find(
    annotations =>
      annotations.expr &&
      arkts.isIdentifier(annotations.expr) &&
      annotations.expr.name === PresetDecorators.OBSERVED_V1
  );
  // Traverse all members of the body class
  node.definition?.body.forEach((member) => {
    // Check whether it is a class attribute
    if (arkts.isClassProperty(member)) {
      const hasTrackDecorator = findClassPropertyAnnotation(member, PresetDecorators.TRACK);
      // If the class is not decorated with @Observed and has decorators, an error is reported
      if (!hasObservedDecorator && hasTrackDecorator) {
        reportInvalidClass(context, hasTrackDecorator);
      }
    }
    // Check whether this is the method
    if (arkts.isMethodDefinition(member)) {
      const hasTrackDecorator = getMethodAnnotation(member, PresetDecorators.TRACK);
      // If the method is decorated with @Track, an error is reported immediately
      if (hasTrackDecorator) {
        reportInvalidTarget(context, hasTrackDecorator);
      }
    }
  });
}

function reportInvalidClass(context: UISyntaxRuleContext, hasTrackDecorator: arkts.AnnotationUsage): void {
  context.report({
    node: hasTrackDecorator,
    message: rule.messages.invalidClass,
    fix: (hasTrackDecorator) => {
      const startPosition = arkts.getStartPosition(hasTrackDecorator);
      const endPosition = arkts.getEndPosition(hasTrackDecorator);
      return {
        range: [startPosition, endPosition],
        code: '',
      };
    },
  });
}

function getMethodAnnotation(
  node: arkts.MethodDefinition,
  annotationName: string)
  : arkts.AnnotationUsage | undefined {
  return node.scriptFunction.annotations?.find(
    annotation =>
      annotation.expr &&
      annotation.expr.dumpSrc() === annotationName
  );
}

function findClassPropertyAnnotation(
  node: arkts.ClassProperty,
  annotationName: string)
  : arkts.AnnotationUsage | undefined {
  return node.annotations?.find(annotation =>
    annotation.expr &&
    annotation.expr.dumpSrc() === annotationName
  );
}

function reportInvalidTarget(
  context: UISyntaxRuleContext,
  node: arkts.AnnotationUsage)
  : void {
  context.report({
    node: node,
    message: rule.messages.invalidTarget,
    fix: (node) => {
      const startPosition = arkts.getStartPosition(node);
      const endPosition = arkts.getEndPosition(node);
      return {
        range: [startPosition, endPosition],
        code: '',
      };
    },
  });
}

export default rule;