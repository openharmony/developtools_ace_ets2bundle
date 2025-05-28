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
import { getIdentifierName, getClassPropertyAnnotationNames, PresetDecorators } from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

// Define a function to add property data to the property map
function addProperty(propertyMap: Map<string, Map<string, string>>, structName: string,
  propertyName: string, annotationName: string): void {
  if (!propertyMap.has(structName)) {
    propertyMap.set(structName, new Map());
  }
  const structProperties = propertyMap.get(structName);
  if (structProperties) {
    structProperties.set(propertyName, annotationName);
  }
}
// categorizePropertyBasedOnAnnotations
function checkPropertyByAnnotations(
  item: arkts.AstNode,
  structName: string,
  mustInitMap: Map<string, Map<string, string>>,
  cannotInitMap: Map<string, Map<string, string>> = new Map(),
  mustInitArray: string[][],
  cannotInitArray: string[][]
): void {
  if (!arkts.isClassProperty(item)) {
    return;
  }
  const propertyName: string = item.key?.dumpSrc() ?? '';
  if (item.annotations.length === 0 || propertyName === '') {
    return;
  }
  const annotationArray: string[] = getClassPropertyAnnotationNames(item);
  // If the member variable is decorated, it is added to the corresponding map
  mustInitArray.forEach(arr => {
    if (arr.every(annotation => annotationArray.includes(annotation))) {
      const annotationName: string = arr[0];
      addProperty(mustInitMap, structName, propertyName, annotationName);
    }
  });
  cannotInitArray.forEach(arr => {
    if (arr.every(annotation => annotationArray.includes(annotation))) {
      const annotationName: string = arr[0];
      addProperty(cannotInitMap, structName, propertyName, annotationName);
    }
  });
}

function initMap(
  node: arkts.AstNode,
  mustInitMap: Map<string, Map<string, string>>,
  cannotInitMap: Map<string, Map<string, string>> = new Map(),
  mustInitArray: string[][],
  cannotInitArray: string[][]
): void {
  if (arkts.nodeType(node) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
    return;
  }
  node.getChildren().forEach((member) => {
    if (!arkts.isStructDeclaration(member)) {
      return;
    }
    const structName: string = member.definition.ident?.name ?? '';
    if (structName === '') {
      return;
    }
    member.definition?.body.forEach((item) => {
      checkPropertyByAnnotations(item, structName, mustInitMap, cannotInitMap, mustInitArray, cannotInitArray);
    });
  });
}

function getChildKeyNameArray(member: arkts.AstNode): string[] {
  const childkeyNameArray: string[] = [];
  member.getChildren().forEach((property) => {
    if (arkts.isProperty(property)) {
      const childkeyName = property.key?.dumpSrc() ?? '';
      if (childkeyName !== '') {
        childkeyNameArray.push(childkeyName);
      }
    }
  });
  return childkeyNameArray;
}

function checkMustInitialize(
  node: arkts.AstNode,
  context: UISyntaxRuleContext,
  mustInitMap: Map<string, Map<string, string>>
): void {
  if (!arkts.isIdentifier(node)) {
    return;
  }
  const structName: string = getIdentifierName(node);
  if (!mustInitMap.has(structName)) {
    return;
  }
  const parentNode: arkts.AstNode = node.parent;
  if (!arkts.isCallExpression(parentNode)) {
    return;
  }
  // Get all the properties of a record via StructName
  const mustInitName: Map<string, string> = mustInitMap.get(structName)!;
  parentNode.arguments?.forEach((member) => {
    const childkeyNameArray: string[] = getChildKeyNameArray(member);
    mustInitName.forEach((value, key) => {
      // If an attribute that must be initialized is not initialized, an error is reported
      if (!childkeyNameArray.includes(key)) {
        context.report({
          node: parentNode,
          message: rule.messages.mustInitializeRule,
          data: {
            annotationName: value,
            propertyName: key,
          },
        });
      }
    });
  });
}

function checkCannotInitialize(
  node: arkts.AstNode,
  context: UISyntaxRuleContext,
  cannotInitMap: Map<string, Map<string, string>>
): void {
  if (!arkts.isIdentifier(node)) {
    return;
  }
  const structName: string = getIdentifierName(node);
  if (!cannotInitMap.has(structName)) {
    return;
  }
  const parentNode: arkts.AstNode = node.parent;
  if (!arkts.isCallExpression(parentNode)) {
    return;
  }
  // Get all the properties of a record via StructName
  const cannotInitName: Map<string, string> = cannotInitMap.get(structName)!;
  parentNode.arguments.forEach((member) => {
    member.getChildren().forEach((property) => {
      if (!arkts.isProperty(property)) {
        return;
      }
      if (!property.key) {
        return;
      }
      const propertyName = property.key.dumpSrc();
      // If a property that cannot be initialized is initialized, an error is reported
      if (cannotInitName.has(propertyName)) {
        context.report({
          node: property.key,
          message: rule.messages.cannotInitializeRule,
          data: {
            annotationName: cannotInitName.get(propertyName)!,
            propertyName: propertyName,
          },
        });
      }
    });
  });
}

const rule: UISyntaxRule = {
  name: 'variable-initialization-via-component-cons',
  messages: {
    mustInitializeRule: `'@{{annotationName}}' decorated '{{propertyName}}' must be initialized through the component constructor.`,
    cannotInitializeRule: `'@{{annotationName}}' decorated '{{propertyName}}' cannot be initialized through the component constructor.`,
  },
  setup(context) {
    let mustInitMap: Map<string, Map<string, string>> = new Map();
    let cannotInitMap: Map<string, Map<string, string>> = new Map();
    const mustInitArray: string[][] = [
      [PresetDecorators.REQUIRE, PresetDecorators.PROP],
      [PresetDecorators.REQUIRE, PresetDecorators.BUILDER_PARAM],
      [PresetDecorators.LINK],
      [PresetDecorators.OBJECT_LINK]
    ];
    const cannotInitArray: string[][] = [
      [PresetDecorators.STORAGE_LINK],
      [PresetDecorators.STORAGE_PROP],
      [PresetDecorators.CONSUME],
      [PresetDecorators.LOCAL_STORAGE_LINK],
      [PresetDecorators.LOCAL_STORAGE_PROP]
    ];
    return {
      parsed: (node): void => {
        initMap(node, mustInitMap, cannotInitMap, mustInitArray, cannotInitArray);
        checkMustInitialize(node, context, mustInitMap);
        checkCannotInitialize(node, context, cannotInitMap);
      },
    };
  },
};

export default rule;