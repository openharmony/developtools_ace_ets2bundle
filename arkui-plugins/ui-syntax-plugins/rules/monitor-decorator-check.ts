/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
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

const MONITOR_COUNT_LIMIT = 1;

class MonitorDecoratorCheckRule extends AbstractUISyntaxRule {
  public setup(): Record<string, string> {
    return {
      monitorUsedAlone:
        `The member property or method can not be decorated by multiple built-in decorators.`,
      monitorUsedInObservedV2Class:
        `The '@Monitor' can decorate only member method within a 'class' decorated with @ObservedV2.`,
      monitorUsedInComponentV2Struct:
        `The '@Monitor' decorator can only be used in a 'struct' decorated with '@ComponentV2'.`,
      monitorDecorateMethod:
        `@Monitor can only decorate method.`,
      duplicatedMonitor: `Duplicate decorators for method are not allowed.`,
    };
  }

  public parsed(node: arkts.AstNode): void {
    if (!arkts.isClassDeclaration(node) && !arkts.isStructDeclaration(node)) {
      return;
    }

    let monitorUsed = false;

    const isObservedV2 = arkts.isClassDeclaration(node) && this.checkIfClassIsObservedV2(node);
    const isComponentV2 = arkts.isStructDeclaration(node) && this.checkIfStructIsComponentV2(node);

    monitorUsed = this.checkMultipleDecorators(node);

    // Check for errors related to @Monitor usage
    if (monitorUsed && !isObservedV2 && arkts.isClassDeclaration(node)) {
      this.reportInvalidUsage(
        node,
        this.messages.monitorUsedInObservedV2Class,
        `@${PresetDecorators.OBSERVED_V2}`
      );
    }
    if (monitorUsed && !isComponentV2 && arkts.isStructDeclaration(node)) {
      this.reportInvalidUsage(
        node,
        this.messages.monitorUsedInComponentV2Struct,
        `@${PresetDecorators.COMPONENT_V2}\n`
      );
    }
    this.checkDecorateMethod(node);
  }
  private checkIfClassIsObservedV2(node: arkts.ClassDeclaration): boolean {
    return node.definition?.annotations?.some(
      observedV2 => observedV2.expr && arkts.isIdentifier(observedV2.expr) &&
        observedV2.expr?.name === PresetDecorators.OBSERVED_V2
    ) ?? false;

  }

  private checkIfStructIsComponentV2(node: arkts.StructDeclaration): boolean {
    return node.definition.annotations?.some(
      componentV2 => componentV2.expr && arkts.isIdentifier(componentV2.expr) &&
        componentV2.expr?.name === PresetDecorators.COMPONENT_V2
    ) ?? false;
  }

  private checkMultipleDecorators(
    node: arkts.ClassDeclaration | arkts.StructDeclaration
  ): boolean {
    // Traverse body of the class to check for @Monitor usage
    let monitorUsed: boolean = false;

    node.definition?.body.forEach((body) => {
      if (!arkts.isMethodDefinition(body)) {
        return;
      }

      const duplicatedMonitor = this.getMonitor(body);
      const localMonitorUsed = this.getLocalMonitorUsed(body);

      if (duplicatedMonitor.length > MONITOR_COUNT_LIMIT && localMonitorUsed) {
        this.reportDuplicatedMonitor(localMonitorUsed);
      }

      if (localMonitorUsed) {
        monitorUsed = true;
        this.checkConflictingDecorators(body, localMonitorUsed);
        return; // Stop further checks for this method
      }
    }
    );

    return monitorUsed;
  }

  private getMonitor(body: arkts.MethodDefinition): arkts.AnnotationUsage[] {
    const monitor = body.scriptFunction.annotations?.filter(
      annotation => annotation.expr && arkts.isIdentifier(annotation.expr) &&
        annotation.expr.name === PresetDecorators.MONITOR
    );
    return monitor;
  }

  private getLocalMonitorUsed(body: arkts.MethodDefinition): arkts.AnnotationUsage | undefined {
    const localMonitorUsed = body.scriptFunction.annotations?.find(
      annotation => annotation.expr && arkts.isIdentifier(annotation.expr) &&
        annotation.expr.name === PresetDecorators.MONITOR
    );
    return localMonitorUsed;
  }

  private checkConflictingDecorators(body: arkts.MethodDefinition, localMonitorUsed: arkts.AnnotationUsage): boolean {
    const conflictingDecorators = body.scriptFunction.annotations?.filter(
      annotation => annotation.expr && arkts.isIdentifier(annotation.expr) &&
        annotation.expr.name !== PresetDecorators.MONITOR
    );
    if (conflictingDecorators?.length > 0) {
      this.reportConflictingDecorators(localMonitorUsed, conflictingDecorators);
      return true;
    }
    return false;
  }

  private reportConflictingDecorators(localMonitorUsed: arkts.AstNode, conflictingDecorators: arkts.AnnotationUsage[]): void {
    this.report({
      node: localMonitorUsed,
      message: this.messages.monitorUsedAlone,
      fix: () => {
        const startPositions = conflictingDecorators.map(annotation =>
          annotation.startPosition);
        const endPositions = conflictingDecorators.map(annotation => annotation.endPosition);
        const startPosition = startPositions[0];
        const endPosition = endPositions[endPositions.length - 1];
        return {
          range: [startPosition, endPosition],
          code: ''
        };
      }
    });
  }

  private reportDuplicatedMonitor(localMonitorUsed: arkts.AstNode): void {
    this.report({
      node: localMonitorUsed,
      message: this.messages.duplicatedMonitor,
      fix: () => {
        const startPosition = localMonitorUsed.startPosition;
        const endPosition = localMonitorUsed.endPosition;
        return {
          range: [startPosition, endPosition],
          code: ''
        };
      }
    });
  }

  private reportInvalidUsage(node: arkts.AstNode, message: string, fixCode: string): void {
    this.report({
      node,
      message,
      fix: () => ({
        range: [node.startPosition, node.startPosition],
        code: fixCode
      })
    });
  }

  private checkDecorateMethod(node: arkts.ClassDeclaration | arkts.StructDeclaration): void {
    // Check if @Monitor is used on a property (which is not allowed)
    node.definition?.body.forEach((body) => {
      if (!arkts.isClassProperty(body)) {
        return;
      }

      const monitorDecorator = body.annotations?.find(
        (annotation) =>
          annotation.expr &&
          arkts.isIdentifier(annotation.expr) &&
          annotation.expr.name === PresetDecorators.MONITOR
      );

      if (monitorDecorator === undefined) {
        return;
      }
      this.report({
        node: monitorDecorator,
        message: this.messages.monitorDecorateMethod,
        fix: () => {
          const startPosition = monitorDecorator.startPosition;
          const endPosition = monitorDecorator.endPosition;
          return {
            range: [startPosition, endPosition],
            code: '',
          };
        },
      });
    });
  }
}

export default MonitorDecoratorCheckRule;