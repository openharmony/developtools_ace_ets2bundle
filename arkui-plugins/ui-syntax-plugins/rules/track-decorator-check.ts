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
    trackOnClassMemberOnly: `The '@Track' decorator can decorate only member variables of a class.`,
    trackMustUsedWithObserved: `'@Track' cannot be used with classes decorated by '@ObservedV2'. Use the '@Trace' decorator instead.`,
  },
  setup(context) {
    return {
      parsed: (node): void => {
        if (arkts.isStructDeclaration(node)) {
          checkInvalidTrackAnnotations(context, node);
        }
        // Check if the current node is a class declaration
        if (arkts.isClassDeclaration(node)) {
          checkTrackUsedWithObservedV2(context, node);
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
      const trackDecorator = findClassPropertyAnnotation(member, PresetDecorators.TRACK);
      // If a member variable is decorated with @Track, an error is reported immediately
      if (trackDecorator) {
        reportInvalidTarget(context, trackDecorator);
      }
    }
    // Check whether this is the method
    if (arkts.isMethodDefinition(member)) {
      const trackDecorator = getMethodAnnotation(member, PresetDecorators.TRACK);
      // If the method is decorated with @Track, an error is reported immediately
      if (trackDecorator) {
        reportInvalidTarget(context, trackDecorator);
      }
    }
  },);
}

function checkTrackUsedWithObservedV2(context: UISyntaxRuleContext, node: arkts.ClassDeclaration): void {
  // Check if the class is decorated with @Observed
  const observedV2Decorator = node.definition?.annotations?.find(
    annotations =>
      annotations.expr &&
      arkts.isIdentifier(annotations.expr) &&
      annotations.expr.name === PresetDecorators.OBSERVED_V2
  );
  // Traverse all members of the body class
  node.definition?.body.forEach((member) => {
    // Check whether it is a class attribute
    if (arkts.isClassProperty(member)) {
      const trackDecorator = findClassPropertyAnnotation(member, PresetDecorators.TRACK);
      // If the class is not decorated with @Observed and has decorators, an error is reported
      if (observedV2Decorator && !(node.definition?.annotations.length === 0) && trackDecorator) {
        reportInvalidClass(context, trackDecorator);
      }
    }
    // Check whether this is the method
    if (arkts.isMethodDefinition(member)) {
      const trackDecorator = getMethodAnnotation(member, PresetDecorators.TRACK);
      // If the method is decorated with @Track, an error is reported immediately
      if (trackDecorator) {
        reportInvalidTarget(context, trackDecorator);
      }
    }
  });
}

function reportInvalidClass(context: UISyntaxRuleContext, trackDecorator: arkts.AnnotationUsage): void {
  context.report({
    node: trackDecorator,
    message: rule.messages.trackMustUsedWithObserved,
    fix: (trackDecorator) => {
      const startPosition = trackDecorator.startPosition;
      const endPosition = trackDecorator.endPosition;
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
      arkts.isIdentifier(annotation.expr) &&
      annotation.expr.name === annotationName
  );
}

function findClassPropertyAnnotation(
  node: arkts.ClassProperty,
  annotationName: string)
  : arkts.AnnotationUsage | undefined {
  return node.annotations?.find(annotation =>
    annotation.expr &&
    arkts.isIdentifier(annotation.expr) &&
    annotation.expr.name === annotationName
  );
}

function reportInvalidTarget(
  context: UISyntaxRuleContext,
  node: arkts.AnnotationUsage)
  : void {
  context.report({
    node: node,
    message: rule.messages.trackOnClassMemberOnly,
    fix: (node) => {
      const startPosition = node.startPosition;
      const endPosition = node.endPosition;
      return {
        range: [startPosition, endPosition],
        code: '',
      };
    },
  });
}

export default rule;