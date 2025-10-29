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
  getClassPropertyType, PresetDecorators
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

class CheckDecoratedPropertyTypeRule extends AbstractUISyntaxRule {
  public setup(): Record<string, string> {
    return {
      invalidDecoratedPropertyType: `The '@{{decoratorName}}' property '{{propertyName}}' cannot be a '{{propertyType}}' object.`,
    };
  }

  public parsed(node: arkts.StructDeclaration): void {
    if (!arkts.isStructDeclaration(node)) {
      return;
    }
    if (!node.definition) {
      return;
    }
    node.definition.body.forEach(member => {
      this.checkDecoratedPropertyType(member, forbiddenUseStateTypeForDecorators, forbiddenUseStateType);
    });
  }

  private checkDecoratedPropertyType(
    member: arkts.AstNode,
    annoList: string[],
    typeList: string[]
  ): void {
    if (!arkts.isClassProperty(member)) {
      return;
    }
    const propertyName = getClassPropertyName(member);
    const propertyType = getClassPropertyType(member);
    if (!propertyName || !propertyType) {
      return;
    }
    const propertyAnnotationNames: string[] = getClassPropertyAnnotationNames(member);
    const decoratorName: string | undefined =
      propertyAnnotationNames.find((annotation) => annoList.includes(annotation));
    const isType: boolean = typeList.includes(propertyType);
    if (!member.key) {
      return;
    }
    const errorNode = member.key;
    if (decoratorName && isType) {
      this.report({
        node: errorNode,
        message: this.messages.invalidDecoratedPropertyType,
        data: { decoratorName, propertyName, propertyType },
      });
    }
  }
}

export default CheckDecoratedPropertyTypeRule;