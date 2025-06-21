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

const mustInitInConstructorDecorators: string[][] = [
  [PresetDecorators.REQUIRE],
  [PresetDecorators.REQUIRE, PresetDecorators.STATE],
  [PresetDecorators.REQUIRE, PresetDecorators.PROVIDE],
  [PresetDecorators.REQUIRE, PresetDecorators.PROP],
  [PresetDecorators.REQUIRE, PresetDecorators.BUILDER_PARAM],
  [PresetDecorators.REQUIRE, PresetDecorators.PARAM]
];
const notAllowInitInConstructorDecorators: string[][] = [
  [PresetDecorators.STORAGE_LINK],
  [PresetDecorators.STORAGE_PROP],
  [PresetDecorators.CONSUME],
  [PresetDecorators.LOCAL_STORAGE_LINK],
  [PresetDecorators.LOCAL_STORAGE_PROP]
];

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
  cannotInitMap: Map<string, Map<string, string>>
): void {
  if (!arkts.isClassProperty(item) || !item.key || !arkts.isIdentifier(item.key)) {
    return;
  }
  const propertyName: string = item.key.name;
  if (item.annotations.length === 0 || propertyName === '') {
    return;
  }
  const annotationArray: string[] = getClassPropertyAnnotationNames(item);
  // If the member variable is decorated, it is added to the corresponding map
  mustInitInConstructorDecorators.forEach(arr => {
    if (arr.every(annotation => annotationArray.includes(annotation))) {
      const annotationName: string = arr[0];
      addProperty(mustInitMap, structName, propertyName, annotationName);
    }
  });
  notAllowInitInConstructorDecorators.forEach(arr => {
    if (arr.every(annotation => annotationArray.includes(annotation))) {
      const annotationName: string = arr[0];
      addProperty(cannotInitMap, structName, propertyName, annotationName);
    }
  });
}

function initMap(
  node: arkts.AstNode,
  mustInitMap: Map<string, Map<string, string>>,
  cannotInitMap: Map<string, Map<string, string>>
): void {
  if (arkts.nodeType(node) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
    return;
  }
  node.getChildren().forEach((member) => {
    if (!arkts.isStructDeclaration(member)) {
      return;
    }
    if (!member.definition || !member.definition.ident || !arkts.isIdentifier(member.definition.ident)) {
      return;
    }
    const structName: string = member.definition.ident.name;
    if (structName === '') {
      return;
    }
    member.definition?.body.forEach((item) => {
      checkPropertyByAnnotations(item, structName, mustInitMap, cannotInitMap);
    });
  });
}

function getChildKeyNameArray(node: arkts.CallExpression): string[] {
  const childkeyNameArray: string[] = [];
  node.arguments.forEach((member) => {
    member.getChildren().forEach((property) => {
      if (!arkts.isProperty(property)) {
        return;
      }
      if (!property.key || !arkts.isIdentifier(property.key)) {
        return;
      }
      const childkeyName = property.key.name;
      if (childkeyName !== '') {
        childkeyNameArray.push(childkeyName);
      }
    });
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
  if (!mustInitMap.has(structName) || !node.parent) {
    return;
  }
  const parentNode: arkts.AstNode = node.parent;
  if (!arkts.isCallExpression(parentNode)) {
    return;
  }
  // Get all the properties of a record via StructName
  const mustInitProperty: Map<string, string> = mustInitMap.get(structName)!;
  const childkeyNameArray: string[] = getChildKeyNameArray(parentNode);
  // If an attribute that must be initialized is not initialized, an error is reported
  mustInitProperty.forEach((value, key) => {
    if (!childkeyNameArray.includes(key)) {
      context.report({
        node: parentNode,
        message: rule.messages.requireVariableInitializationViaComponentConstructor,
        data: {
          varName: key,
        },
      });
    }
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
  if (!cannotInitMap.has(structName) || !node.parent) {
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
      if (!property.key || !arkts.isIdentifier(property.key)) {
        return;
      }
      const propertyName = property.key.name;
      // If a property that cannot be initialized is initialized, an error is reported
      if (cannotInitName.has(propertyName)) {
        const propertyType: string = cannotInitName.get(propertyName)!;
        context.report({
          node: property,
          message: rule.messages.disallowVariableInitializationViaComponentConstructor,
          data: {
            decoratorName: `@${propertyType}`,
            varName: propertyName,
            customComponentName: structName
          },
        });
      }
    });
  });
}

const rule: UISyntaxRule = {
  name: 'variable-initialization-via-component-constructor',
  messages: {
    requireVariableInitializationViaComponentConstructor: `'@Require' decorated '{{varName}}' must be initialized through the component constructor.`,
    disallowVariableInitializationViaComponentConstructor: `The '{{decoratorName}}' property '{{varName}}' in the custom component '{{customComponentName}}' cannot be initialized here (forbidden to specify).`,
  },
  setup(context) {
    let mustInitMap: Map<string, Map<string, string>> = new Map();
    let cannotInitMap: Map<string, Map<string, string>> = new Map();
    return {
      parsed: (node): void => {
        initMap(node, mustInitMap, cannotInitMap);
        checkMustInitialize(node, context, mustInitMap);
        checkCannotInitialize(node, context, cannotInitMap);
      },
    };
  },
};

export default rule;