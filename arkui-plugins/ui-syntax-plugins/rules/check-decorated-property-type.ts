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
import { AbstractUISyntaxRule } from './ui-syntax-rule';
import {
  forbiddenUseStateType,
  getAnnotationUsage, getClassPropertyAnnotationNames, getClassPropertyName,
  getClassPropertyType, PresetDecorators,
} from '../utils';

const forbiddenUseStateTypeForDecorators: string[] = [
  PresetDecorators.STATE,
  PresetDecorators.PROP_REF,
  PresetDecorators.LINK,
  PresetDecorators.PROVIDE,
  PresetDecorators.CONSUME,
  PresetDecorators.OBJECT_LINK,
  PresetDecorators.BUILDER_PARAM,
  PresetDecorators.STORAGE_PROP_REF,
  PresetDecorators.STORAGE_LINK,
  PresetDecorators.LOCAL_STORAGE_LINK,
];

const forbiddenUseStateTypeForDecoratorsForV2: string[] = [
  PresetDecorators.BUILDER_PARAM,
  PresetDecorators.PARAM,
  PresetDecorators.ONCE,
  PresetDecorators.LOCAL,
  PresetDecorators.CONSUME,
  PresetDecorators.EVENT,
  PresetDecorators.PROVIDER,
  PresetDecorators.CONSUMER,
];

class CheckDecoratedPropertyTypeRule extends AbstractUISyntaxRule {
  public setup(): Record<string, string> {
    return {
      invalidDecoratedPropertyType: `The '@{{decoratorName}}' property '{{propertyName}}' cannot be a '{{propertyType}}' object.`,
      specifyPropertyType: `The property '{{propertyName}}' must specify a type.`,
    };
  }

  public parsed(node: arkts.StructDeclaration): void {
    if (!arkts.isStructDeclaration(node) || !node.definition) {
      return;
    }

    const forbiddenDecorators = this.getForbiddenDecoratorList(node);
    if (!forbiddenDecorators.length) return;

    node.definition.body.forEach(member => {
      this.checkDecoratedPropertyType(member, forbiddenDecorators, forbiddenUseStateType);
    });
  }

  private getForbiddenDecoratorList(node: arkts.StructDeclaration): string[] {
    const componentV2Decorator = getAnnotationUsage(node, PresetDecorators.COMPONENT_V2);
    const componentDecorator = getAnnotationUsage(node, PresetDecorators.COMPONENT_V1);

    if (componentV2Decorator) {
      return forbiddenUseStateTypeForDecoratorsForV2;
    } else if (componentDecorator) {
      return forbiddenUseStateTypeForDecorators;
    }

    return [];
  }

  private checkDecoratedPropertyType(
    member: arkts.AstNode,
    annoList: string[],
    typeList: string[],
  ): void {
    if (!arkts.isClassProperty(member)) {
      return;
    }
    const propertyName = getClassPropertyName(member);
    const propertyType = getClassPropertyType(member);
    const propertyAnnotationNames: string[] = getClassPropertyAnnotationNames(member);
    const decoratorName: string | undefined =
      propertyAnnotationNames.find((annotation) => annoList.includes(annotation));

    if (!member.key || !propertyName || !decoratorName) {
      return;
    }

    const errorNode = member.key;
    if (!propertyType) {
      this.report({
        node: errorNode,
        message: this.messages.specifyPropertyType,
        data: { propertyName },
      });
    } else if (typeList.includes(propertyType)) {
      this.report({
        node: errorNode,
        message: this.messages.invalidDecoratedPropertyType,
        data: { decoratorName, propertyName, propertyType },
      });
    }
  }
}

export default CheckDecoratedPropertyTypeRule;