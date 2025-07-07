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
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

// Report an Observed version violation error
function reportObservedConflict(
  node: arkts.ClassProperty,
  context: UISyntaxRuleContext,
  message: string
): void {
  node.annotations.forEach((anno) => {
    if (anno.expr?.dumpSrc()) {
      context.report({
        node: anno,
        message: message,
        data: {
          annotation: anno.expr?.dumpSrc(),
        }
      });
    }
  });
}

function processNode(
  node: arkts.ClassProperty,
  annotationName: string,
  observedV1Name: Set<string>,
  observedV2Name: Set<string>,
  context: UISyntaxRuleContext
): void {
  const queue: Array<arkts.AstNode> = [node];
  while (queue.length > 0) {
    const currentNode: arkts.AstNode = queue.shift() as arkts.AstNode;
    if (arkts.isIdentifier(currentNode)) {
      if (observedV1Name.has(currentNode.dumpSrc()) && annotationName === PresetDecorators.COMPONENT_V2) {
        reportObservedConflict(node, context, rule.messages.observedv1_v2);
        break;
      }
      if (observedV2Name.has(currentNode.dumpSrc()) && annotationName === PresetDecorators.COMPONENT_V1) {
        reportObservedConflict(node, context, rule.messages.observedv2_v1);
        break;
      }
    }
    const children = currentNode.getChildren();
    for (const child of children) {
      queue.push(child);
    }
  }
}

function traverseTree(
  node: arkts.AstNode,
  annotationName: string,
  observedV1Name: Set<string>,
  observedV2Name: Set<string>,
  context: UISyntaxRuleContext
): void {
  if (arkts.isClassProperty(node)) {
    processNode(node, annotationName, observedV1Name, observedV2Name, context);
  }
  const children = node.getChildren();
  for (const child of children) {
    traverseTree(child, annotationName, observedV1Name, observedV2Name, context);
  }
}

function findAllObserved(node: arkts.AstNode, observedV1Name: Set<string>, observedV2Name: Set<string>): void {
  if (arkts.isClassDeclaration(node)) {
    node.definition?.annotations.forEach((anno) => {
      if (anno.expr?.dumpSrc() === PresetDecorators.OBSERVED_V1) {
        const componentV1Name = node?.definition?.ident?.name;
        componentV1Name ? observedV1Name.add(componentV1Name) : null;
      }
      if (anno.expr?.dumpSrc() === PresetDecorators.OBSERVED_V2) {
        const componentV2Name = node?.definition?.ident?.name;
        componentV2Name ? observedV2Name.add(componentV2Name) : null;
      }
    });
  }
  const children = node.getChildren();
  for (const child of children) {
    findAllObserved(child, observedV1Name, observedV2Name);
  }
}

function findAllTSTypeAliasDeclaration(
  node: arkts.AstNode,
  observedV1Name: Set<string>,
  observedV2Name: Set<string>
): void {
  if (arkts.nodeType(node) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_TS_TYPE_ALIAS_DECLARATION) {
    node.getChildren().forEach((child) => {
      if (arkts.isIdentifier(child)) {
        const typeName = child.dumpSrc();
        findAllObservedType(node, typeName, observedV1Name, observedV2Name);
      }
    });
  }
  const children = node.getChildren();
  for (const child of children) {
    findAllTSTypeAliasDeclaration(child, observedV1Name, observedV2Name);
  }
}

function findAllObservedType(
  node: arkts.AstNode,
  typeName: string,
  observedV1Name: Set<string>,
  observedV2Name: Set<string>
): void {
  if (arkts.isIdentifier(node) && observedV1Name.has(node.dumpSrc())) {
    observedV1Name.add(typeName);
  }
  if (arkts.isIdentifier(node) && observedV2Name.has(node.dumpSrc())) {
    observedV2Name.add(typeName);
  }
  const children = node.getChildren();
  for (const child of children) {
    findAllObservedType(child, typeName, observedV1Name, observedV2Name);
  }
}

function processComponentAnnotations(
  node: arkts.StructDeclaration,
  observedV1Name: Set<string>,
  observedV2Name: Set<string>,
  context: UISyntaxRuleContext
): void {
  node?.definition?.annotations.forEach((anno) => {
    if (anno.expr?.dumpSrc() === PresetDecorators.COMPONENT_V2) {
      traverseTree(node, PresetDecorators.COMPONENT_V2, observedV1Name, observedV2Name, context);
    }
    if (anno.expr?.dumpSrc() === PresetDecorators.COMPONENT_V1) {
      traverseTree(node, PresetDecorators.COMPONENT_V1, observedV1Name, observedV2Name, context);
    }
  });
}

const rule: UISyntaxRule = {
  name: 'component-componentV2-mix-use-check',
  messages: {
    observedv1_v2: `The type of the @{{annotation}} Decorator property can not be a class decorated with @Observed.`,
    observedv2_v1: `The type of the @{{annotation}} Decorator property can not be a class decorated with @ObservedV2.`
  },
  setup(context) {
    let observedV1Name: Set<string> = new Set();
    let observedV2Name: Set<string> = new Set();
    return {
      parsed: (node): void => {
        if (arkts.nodeType(node) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
          findAllObserved(node, observedV1Name, observedV2Name);
          findAllTSTypeAliasDeclaration(node, observedV1Name, observedV2Name);
        }
        if (arkts.isStructDeclaration(node)) {
          processComponentAnnotations(node, observedV1Name, observedV2Name, context);
        }
      },
    };
  },
};

export default rule;