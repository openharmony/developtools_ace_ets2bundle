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
import { AbstractUISyntaxRule } from './ui-syntax-rule';
import { FileManager } from '../../common/file-manager';
import { LANGUAGE_VERSION } from '../../common/predefines';

class ObservedObservedV2Rule extends AbstractUISyntaxRule {
  public setup(): Record<string, string> {
    return {
      conflictingDecorators: `A class cannot be decorated by both '@Observed' and '@ObservedV2' at the same time.`,
      observedV1V2Message: `The type of the '{{annotations}}' property can not be a class decorated with '{{observedAnnotations}}' when interop`,
    };
  }

  public parsed(node: arkts.AstNode): void {
    if (!arkts.isClassDeclaration(node)) {
      return;
    }
    const hasObservedDecorator = node.definition?.annotations?.find(annotations => annotations.expr &&
      arkts.isIdentifier(annotations.expr) &&
      annotations.expr.name === PresetDecorators.OBSERVED_V1);
    const hasObservedV2Decorator = node.definition?.annotations?.find(annotations => annotations.expr &&
      arkts.isIdentifier(annotations.expr) &&
      annotations.expr.name === PresetDecorators.OBSERVED_V2);
    // If the current class is decorated by @Observed and @ObservedV2, an error is reported
    if (hasObservedDecorator && hasObservedV2Decorator) {
      this.report({
        node: hasObservedDecorator,
        message: this.messages.conflictingDecorators,
      });
    }
  }

  public checked(node: arkts.StructDeclaration): void {
    this.checkObservedV1V2WhenInterop(node);
  }

  private checkObservedV1V2WhenInterop(node: arkts.StructDeclaration): void {
    if (!arkts.isClassProperty(node)) {
      return;
    }
    const parentNode: arkts.AstNode = node.parent;
    if (!parentNode) {
      return;
    }
    const hasObservedDecorator = parentNode.annotations?.some(annotations =>
      annotations.expr &&
      arkts.isIdentifier(annotations.expr) &&
      annotations.expr.name === PresetDecorators.OBSERVED_V1
    );
    const hasObservedV2Decorator = parentNode.annotations?.some(annotations =>
      annotations.expr &&
      arkts.isIdentifier(annotations.expr) &&
      annotations.expr.name === PresetDecorators.OBSERVED_V2
    );
    const hasComponentDecorator = parentNode.annotations?.some(annotations =>
      annotations.expr &&
      arkts.isIdentifier(annotations.expr) &&
      annotations.expr.name === PresetDecorators.COMPONENT_V1
    );
    const hasComponentV2Decorator = parentNode.annotations?.some(annotations =>
      annotations.expr &&
      arkts.isIdentifier(annotations.expr) &&
      annotations.expr.name === PresetDecorators.COMPONENT_V2
    );
    if (hasObservedDecorator || hasComponentDecorator) {
      const isFormDynWithObservedV2: boolean = this.getHasAnnotationObserved(node, PresetDecorators.OBSERVED_V2);
      if (isFormDynWithObservedV2) {
        this.doReport(node, PresetDecorators.OBSERVED_V2);
      }
    }
    if (hasObservedV2Decorator || hasComponentV2Decorator) {
      const isFormDynWithObservedV1: boolean = this.getHasAnnotationObserved(node, PresetDecorators.OBSERVED_V1);
      if (isFormDynWithObservedV1) {
        this.doReport(node, PresetDecorators.OBSERVED_V1);
      }
    }
  }

  private doReport(node: arkts.ClassProperty, observedAnnotations: string): void {
    this.report({
      node: node,
      message: this.messages.observedV1V2Message,
      data: {
        annotations: PresetDecorators.REGULAR,
        observedAnnotations: observedAnnotations,
      }
    });
  }

  private getHasAnnotationObserved(node: arkts.ClassProperty, annotationObserved: string): boolean {
    let typeIdentifiers: string[] = [];
    this.extractTypeIdentifiers(node.typeAnnotation, annotationObserved, typeIdentifiers);
    return typeIdentifiers.length > 0;
  }

  private extractTypeIdentifiers(
    typeNode: arkts.AstNode | undefined,
    annotationObserved: string,
    typeIdentifiers: string[]
  ): void {
    if (!typeNode) {
      return;
    }
    if (arkts.isETSTypeReference(typeNode) && typeNode.part && arkts.isETSTypeReferencePart(typeNode.part)) {
      if (this.checkObservedFormDynamic(typeNode.part.name, annotationObserved)) {
        typeIdentifiers.push(typeNode.part.name);
        return;
      }
      const typeParams: arkts.AstNode = typeNode.part.typeParams;
      if (typeParams && arkts.isTSTypeParameterInstantiation(typeParams) && typeParams.params) {
        typeParams.params.forEach((param: arkts.AstNode) =>
          this.extractTypeIdentifiers(param, annotationObserved, typeIdentifiers));
      }
    } else if (arkts.isETSUnionType(typeNode)) {
      typeNode.types.forEach((subType: arkts.AstNode) =>
        this.extractTypeIdentifiers(subType, annotationObserved, typeIdentifiers));
    }
  }

  private checkObservedFormDynamic(typeNode: arkts.AstNode, annotationObserved: string): boolean {
    const typeDecl = arkts.getDecl(typeNode);
    if (!typeDecl || !typeDecl.annotations) {
      return false;
    }
    const program = arkts.getProgramFromAstNode(typeDecl);
    const fileManager = FileManager.getInstance();
    const isFrom1_1 = fileManager.getLanguageVersionByFilePath(program.absName) === LANGUAGE_VERSION.ARKTS_1_1;
    if (!isFrom1_1) {
      return false;
    }
    const hasAnnotation = typeDecl.annotations.some((annotation) =>
      annotation.expr instanceof arkts.Identifier && annotation.expr.name === annotationObserved
    );
    if (hasAnnotation && isFrom1_1) {
      return true;
    }
    return false;
  }
};

export default ObservedObservedV2Rule;
