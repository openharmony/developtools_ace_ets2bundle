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
import { getClassPropertyType, PresetDecorators, getAnnotationUsage, isClassPropertyOptional } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

const CUSTOM_DIALOG_CONTROLLER: string = 'CustomDialogController';

class CustomDialogMissingControllerRule extends AbstractUISyntaxRule {
  public setup(): Record<string, string> {
    return {
      missingController: `The @CustomDialog decorated custom component must contain a property of the CustomDialogController type.`,
    };
  }

  public parsed(node: arkts.AstNode): void {
    if (!arkts.isETSStructDeclaration(node)) {
      return;
    }
    this.checkMissingController(node);
  }

  // Check if the @CustomDialog-decorated struct contains a property of type CustomDialogController
  private checkMissingController(node: arkts.ETSStructDeclaration): void {
    const customDialogDecorator = getAnnotationUsage(node, PresetDecorators.CUSTOM_DIALOG);

    if (!customDialogDecorator) {
      return;
    }

    const structName = node.definition?.ident;
    if (!structName) {
      return;
    }

    let hasControllerProperty = false;

    node.definition.body.forEach((property) => {
      if (arkts.isClassProperty(property)) {
        // Check if it's a union type, such as CustomDialogController | undefined
        if (this.hasCustomDialogControllerInUnion(property)) {
          hasControllerProperty = true;
          return;
        }

        // Check if it's directly of the CustomDialogController type
        const propertyType = getClassPropertyType(property);
        if (propertyType === CUSTOM_DIALOG_CONTROLLER) {
          hasControllerProperty = true;
        }
      }
    });

    if (!hasControllerProperty) {
      this.report({
        node: structName,
        message: this.messages.missingController,
      });
    }
  }

  // Check that the property is of a form that contains a CustomDialogController in the union type (for example: CustomDialogController | undefined）
  private hasCustomDialogControllerInUnion(property: arkts.ClassProperty): boolean {
    if (!isClassPropertyOptional(property)) {
      return false;
    }

    if (!property.typeAnnotation || !arkts.isETSUnionType(property.typeAnnotation)) {
      return false;
    }

    for (const type of property.typeAnnotation.types) {
      if (!arkts.isETSTypeReference(type)) {
        continue;
      }

      const part = type.part;
      if (!part || !arkts.isETSTypeReferencePart(part)) {
        continue;
      }

      const name = part.name;
      if (name && arkts.isIdentifier(name) && name.name === CUSTOM_DIALOG_CONTROLLER) {
        return true;
      }
    }
    return false;
  }
}

export default CustomDialogMissingControllerRule;