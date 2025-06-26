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
import { PresetDecorators, getIdentifierName } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

const v1ComponentDecorators: string[] = [
  PresetDecorators.STATE,
  PresetDecorators.PROP,
  PresetDecorators.LINK,
  PresetDecorators.PROVIDE,
  PresetDecorators.CONSUME,
  PresetDecorators.STORAGE_LINK,
  PresetDecorators.STORAGE_PROP,
  PresetDecorators.LOCAL_STORAGE_LINK,
  PresetDecorators.LOCAL_STORAGE_PROP,
];

class ComponentComponentV2MixUseCheckRule extends AbstractUISyntaxRule {
  private observedV2Names: Set<string> = new Set();

  public setup(): Record<string, string> {
    return {
      observedv2_v1: `The type of the @{{annotation}} property cannot be a class decorated with '@ObservedV2'.`
    };
  }

  public parsed(node: arkts.AstNode): void {
    if (arkts.nodeType(node) === arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
      this.findAllObserved(node);
      this.findAllTSTypeAliasDeclaration(node);
    }

    if (arkts.isStructDeclaration(node)) {
      this.processComponentAnnotations(node);
    }
  }

  private findAllObserved(node: arkts.AstNode): void {
    if (arkts.isClassDeclaration(node)) {
      node.definition?.annotations.forEach((anno) => {
        if (!anno.expr) {
          return;
        }

        const annotationName = getIdentifierName(anno.expr);

        if (annotationName === PresetDecorators.OBSERVED_V2) {
          const componentV2Name = node.definition?.ident?.name;
          componentV2Name ? this.observedV2Names.add(componentV2Name) : null;
        }
      });
    }

    for (const child of node.getChildren()) {
      this.findAllObserved(child);
    }
  }

  private findAllTSTypeAliasDeclaration(node: arkts.AstNode): void {
    if (
      arkts.nodeType(node) ===
      arkts.Es2pandaAstNodeType.AST_NODE_TYPE_TS_TYPE_ALIAS_DECLARATION
    ) {
      for (const child of node.getChildren()) {
        if (arkts.isIdentifier(child)) {
          const typeName = getIdentifierName(child);
          this.findAllObservedType(node, typeName);
        }
      }
    }

    for (const child of node.getChildren()) {
      this.findAllTSTypeAliasDeclaration(child);
    }
  }

  private findAllObservedType(
    node: arkts.AstNode,
    typeName: string
  ): void {
    if (arkts.isIdentifier(node)) {
      const name = getIdentifierName(node);
     
      if (this.observedV2Names.has(name)) {
        this.observedV2Names.add(typeName);
      }
    }

    for (const child of node.getChildren()) {
      this.findAllObservedType(child, typeName);
    }
  }

  private processComponentAnnotations(
    node: arkts.StructDeclaration
  ): void {
    node.definition.annotations.forEach((anno) => {
      if (!anno.expr) {
        return;
      }
      const annotationName = getIdentifierName(anno.expr);
      if (
        annotationName === PresetDecorators.COMPONENT_V2 ||
        annotationName === PresetDecorators.COMPONENT_V1
      ) {
        this.traverseTree(node, annotationName);
      }
    });
  }

  private traverseTree(
    node: arkts.AstNode,
    annotationName: string
  ): void {
    if (arkts.isClassProperty(node)) {
      this.processNode(node, annotationName);
    }

    for (const child of node.getChildren()) {
      this.traverseTree(child, annotationName);
    }
  }

  private processNode(
    node: arkts.ClassProperty,
    annotationName: string
  ): void {
    const queue: Array<arkts.AstNode> = [node];
    while (queue.length > 0) {
      const currentNode: arkts.AstNode = queue.shift() as arkts.AstNode;
      if (arkts.isIdentifier(currentNode)) {
        const name = getIdentifierName(currentNode);

        if (
          annotationName === PresetDecorators.COMPONENT_V1 &&
          this.observedV2Names.has(name)
        ) {
          this.checkObservedConflict(node, v1ComponentDecorators);
          break;
        }
      }
      const children = currentNode.getChildren();
      for (const child of children) {
        queue.push(child);
      }
    }
  }

  private checkObservedConflict(
    node: arkts.ClassProperty,
    componentDecorators: string[]
  ): void {
    node.annotations.forEach((anno) => {
      if (!anno.expr) {
        return;
      }

      const annotationName = getIdentifierName(anno.expr);
      if (annotationName && componentDecorators.includes(annotationName)) {
        this.report({
          node: anno,
          message: this.messages.observedv2_v1,
          data: {
            annotation: annotationName,
          },
        });
      }
    });
  }
}

export default ComponentComponentV2MixUseCheckRule;