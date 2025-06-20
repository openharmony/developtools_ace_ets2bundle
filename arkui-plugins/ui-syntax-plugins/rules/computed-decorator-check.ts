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
import { getIdentifierName, PresetDecorators, getAnnotationName, getAnnotationUsage, BUILD_NAME } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';


class ComputedDecoratorCheckRule extends AbstractUISyntaxRule {
  private computedGetters: Map<string, arkts.MethodDefinition> = new Map();
  private computedSetters: Map<string, arkts.MethodDefinition> = new Map();

  public setup(): Record<string, string> {
    return {
      onlyOnGetter: `@Computed can only decorate 'GetAccessor'.`,
      onlyInObservedV2: `The '@Computed' can decorate only member method within a 'class' decorated with ObservedV2.`,
      componentV2InStruct: `The '@Computed' decorator can only be used in a 'struct' decorated with ComponentV2.`,
      noTwoWayBinding: `A property decorated by '@Computed' cannot be used with two-way bind syntax.`,
      computedMethodDefineSet: `A property decorated by '@Computed' cannot define a set method.`
    };
  }

  public parsed(node: arkts.AstNode): void {
    if (arkts.isStructDeclaration(node)) {
      this.validateComponentV2InStruct(node);
      this.validateStructBody(node);
    }

    if (arkts.isClassDeclaration(node)) {
      this.validateClassBody(node);
    }
  }

  private validateStructBody(node: arkts.StructDeclaration): void {
    let computedDecorator: arkts.AnnotationUsage | undefined;
    node.definition.body.forEach((member) => {
      if (arkts.isClassProperty(member)) {
        this.validateComputedOnClassProperty(member);
        return;
      }

      if (arkts.isMethodDefinition(member)) {
        const methodName = getIdentifierName(member.name);
        computedDecorator = member.scriptFunction.annotations?.find(annotation =>
          annotation.expr && arkts.isIdentifier(annotation.expr) &&
          annotation.expr.name === PresetDecorators.COMPUTED
        );

        this.validateComputedMethodKind(member, computedDecorator, methodName);
        if (member.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET) {
          this.computedSetters.set(methodName, member);
        }

        if (methodName === BUILD_NAME) {
          this.validateBuildMethod(member);
        }
      }
    });

    this.validateGetterSetterConflict();
  }

  private validateComputedOnClassProperty(member: arkts.ClassProperty): void {
    const computedDecorator = member.annotations?.find(annotation =>
      annotation.expr && arkts.isIdentifier(annotation.expr) &&
      annotation.expr.name === PresetDecorators.COMPUTED
    );
    if (computedDecorator) {
      this.report({
        node: computedDecorator,
        message: this.messages.onlyOnGetter,
        fix: (computedDecorator) => {
          const startPosition = computedDecorator.startPosition;
          const endPosition = computedDecorator.endPosition;
          return {
            range: [startPosition, endPosition],
            code: '',
          };
        },
      });
    }
  }

  private validateComputedMethodKind(
    member: arkts.MethodDefinition,
    computedDecorator: arkts.AnnotationUsage | undefined,
    methodName: string
  ): void {
    if (computedDecorator) {
      const isGetter = member.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET;
      if (!isGetter) {
        this.reportValidateComputedMethodKind(computedDecorator);
      } else {
        this.computedGetters.set(methodName, member);
      }
    }
  }

  private reportValidateComputedMethodKind(computedDecorator: arkts.AnnotationUsage | undefined): void {
    if (!computedDecorator) {
      return;
    }
    this.report({
      node: computedDecorator,
      message: this.messages.onlyOnGetter,
      fix: (computedDecorator) => {
        const startPosition = computedDecorator.startPosition;
        const endPosition = computedDecorator.endPosition;
        return {
          range: [startPosition, endPosition],
          code: '',
        };
      },
    });
  }

  private validateBuildMethod(member: arkts.MethodDefinition): void {
    member.scriptFunction.body?.getChildren().forEach((childNode) => {
      if (!arkts.isExpressionStatement(childNode)) {
        return;
      }

      const queue: Array<arkts.AstNode> = [childNode];
      while (queue.length > 0) {
        const currentNode: arkts.AstNode = queue.shift() as arkts.AstNode;
        if (arkts.isCallExpression(currentNode)) {
          this.validateCallExpression(currentNode);
        }
        // Continue traversing the child nodes
        const children = currentNode.getChildren();
        for (const child of children) {
          queue.push(child);
        }
      }
    });
  }

  private validateCallExpression(currentNode: arkts.CallExpression): void {
    if (!arkts.isIdentifier(currentNode.expression) || getIdentifierName(currentNode.expression) !== '$$') {
      return;
    }

    currentNode.arguments.forEach((argument) => {
      if (arkts.isMemberExpression(argument)) {
        const getterName = getIdentifierName(argument.property);
        this.reportValidateCallExpression(currentNode, getterName);
      }
    });
  }

  private reportValidateCallExpression(
    currentNode: arkts.CallExpression,
    getterName: string
  ): void {
    if (this.computedGetters.has(getterName)) {
      this.report({
        node: currentNode,
        message: this.messages.noTwoWayBinding,
        fix: (currentNode) => {
          const startPosition = currentNode.startPosition;
          const endPosition = currentNode.endPosition;
          return {
            range: [startPosition, endPosition],
            code: '',
          };
        },
      });
    }
  }

  private validateGetterSetterConflict(): void {
    for (const [name] of this.computedGetters) {
      if (this.computedSetters.has(name)) {
        this.reportValidateGetterSetterConflict(name);
      }
    }
  }

  private reportValidateGetterSetterConflict(name: string): void {
    const setter = this.computedSetters.get(name)!;
    this.report({
      node: setter,
      message: this.messages.computedMethodDefineSet,
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

  private validateClassBody(node: arkts.ClassDeclaration): void {
    const observedV2Decorator = node.definition?.annotations.find(annotation =>
      getAnnotationName(annotation) === PresetDecorators.OBSERVED_V2
    );

    node.definition?.body.forEach((member) => {
      if (arkts.isMethodDefinition(member)) {

        this.validateComputedInClass(node, member, observedV2Decorator);
        const computedDecorator = member.scriptFunction.annotations?.find(annotation =>
          annotation.expr && arkts.isIdentifier(annotation.expr) &&
          annotation.expr.name === PresetDecorators.COMPUTED
        );
        if (!arkts.isIdentifier(member.name)) {
          return;
        }
        const methodName = getIdentifierName(member.name);

        this.validateComputedMethodKind(member, computedDecorator, methodName);
      }
    });
  }

  private validateComponentV2InStruct(node: arkts.StructDeclaration): void {
    const componentV2Decorator = getAnnotationUsage(node, PresetDecorators.COMPONENT_V2);
    const componentDecorator = getAnnotationUsage(node, PresetDecorators.COMPONENT_V1);

    node.definition?.body.forEach((member) => {
      if (arkts.isMethodDefinition(member)) {
        this.checkComponentV2InStruct(node, member, componentV2Decorator, componentDecorator);
      }
    });
  }

  private checkComponentV2InStruct(
    node: arkts.StructDeclaration | arkts.ClassDeclaration,
    member: arkts.MethodDefinition,
    componentV2Decorator: arkts.AnnotationUsage | undefined,
    componentDecorator: arkts.AnnotationUsage | undefined
  ): void {
    const computedDecorator = member.scriptFunction.annotations?.find(annotation =>
      annotation.expr && arkts.isIdentifier(annotation.expr) &&
      annotation.expr.name === PresetDecorators.COMPUTED
    );
    if (computedDecorator && !componentV2Decorator && !componentDecorator) {
      this.report({
        node: computedDecorator,
        message: this.messages.componentV2InStruct,
        fix: () => {
          const startPosition = node.startPosition;
          const endPosition = node.startPosition;
          return {
            range: [startPosition, endPosition],
            code: `@${PresetDecorators.COMPONENT_V2}\n`,
          };
        },
      });
    }

    if (computedDecorator && !componentV2Decorator && componentDecorator) {
      this.report({
        node: computedDecorator,
        message: this.messages.componentV2InStruct,
        fix: () => {
          const startPosition = componentDecorator.startPosition;
          const endPosition = componentDecorator.endPosition;
          return {
            range: [startPosition, endPosition],
            code: `@${PresetDecorators.COMPONENT_V2}`,
          };
        },
      });
    }
  }

  private validateComputedInClass(
    node: arkts.AstNode,
    member: arkts.MethodDefinition,
    observedV2Decorator: arkts.AnnotationUsage | undefined,
  ): void {
    const computedDecorator = member.scriptFunction.annotations?.find(annotation =>
      annotation.expr && arkts.isIdentifier(annotation.expr) &&
      annotation.expr.name === PresetDecorators.COMPUTED
    );
    if (computedDecorator && !observedV2Decorator &&
      arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET === member.kind) {
      this.report({
        node: computedDecorator,
        message: this.messages.onlyInObservedV2,
        fix: () => {
          const startPosition = node.startPosition;
          return {
            range: [startPosition, startPosition],
            code: `@${PresetDecorators.OBSERVED_V2}\n`,
          };
        },
      });
    }
  }
}

export default ComputedDecoratorCheckRule;

