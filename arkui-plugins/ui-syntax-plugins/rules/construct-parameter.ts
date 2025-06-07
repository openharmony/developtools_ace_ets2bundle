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
import {
  getIdentifierName,
  getClassPropertyName,
  getClassPropertyAnnotationNames,
  PresetDecorators,
  getAnnotationName,
} from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

// When a specific decorator is used as a parameter, the assigned decorator is not allowed
const disallowAssignedDecorators: string[] = [
  PresetDecorators.REGULAR, PresetDecorators.LINK, PresetDecorators.OBJECT_LINK,
  PresetDecorators.BUILDER_PARAM, PresetDecorators.LOCAL_BUILDER, PresetDecorators.STATE,
  PresetDecorators.PROP, PresetDecorators.PROVIDE, PresetDecorators.CONSUME,
  PresetDecorators.BUILDER,
];
// The decorator structure prohibits initializing the assignment list
const restrictedDecoratorInitializations: Map<string, string[]> = new Map([
  [PresetDecorators.REGULAR, [PresetDecorators.OBJECT_LINK, PresetDecorators.LINK]],
  [PresetDecorators.PROVIDE, [PresetDecorators.REGULAR]],
  [PresetDecorators.CONSUME, [PresetDecorators.REGULAR]],
  [PresetDecorators.STORAGE_PROP, [PresetDecorators.REGULAR]],
  [PresetDecorators.VARIABLE, [PresetDecorators.LINK]],
  [PresetDecorators.LOCAL_STORAGE_LINK, [PresetDecorators.REGULAR]],
  [PresetDecorators.LOCAL_STORAGE_PROP, [PresetDecorators.REGULAR]],
]);
// When there are multiple Decorators, filter out the Decorators that are not relevant to the rule
const decoratorsFilter: string[] = [
  PresetDecorators.PROVIDE, PresetDecorators.CONSUME, PresetDecorators.STORAGE_PROP,
  PresetDecorators.LOCAL_STORAGE_LINK, PresetDecorators.LOCAL_STORAGE_PROP, PresetDecorators.BUILDER_PARAM,
];

function getPropertyAnnotationName(node: arkts.AstNode, propertyName: string): string {
  while (!arkts.isStructDeclaration(node)) {
    node = node.parent;
  }
  let annotationNames: string[] = [];
  node.definition.body.forEach((item) => {
    if (arkts.isClassProperty(item) && getClassPropertyName(item) === propertyName) {
      annotationNames = getClassPropertyAnnotationNames(item);
    }
    if (arkts.isMethodDefinition(item) && getIdentifierName(item.name) === propertyName) {
      annotationNames = item.scriptFunction.annotations.map((annotation) =>
        getAnnotationName(annotation)
      );
    }
  });
  if (annotationNames.length === 0) {
    return PresetDecorators.REGULAR;
  }
  const annotationName = annotationNames.find((item) => { return decoratorsFilter.includes(item) });
  if (annotationName) {
    return annotationName;
  }
  return '';
}

// Define a function to add property data to the property map
function addProperty(
  structName: string,
  propertyName: string,
  annotationName: string,
  propertyMap: Map<string, Map<string, string>>
): void {
  if (!propertyMap.has(structName)) {
    propertyMap.set(structName, new Map());
  }
  const structProperties = propertyMap.get(structName);
  if (!structProperties) {
    return;
  }
  structProperties.set(propertyName, annotationName);
}

function collectBuilderFunctions(member: arkts.AstNode, builderFunctionList: string[]): void {
  if (!arkts.isFunctionDeclaration(member) || !member.annotations) {
    return;
  }
  member.annotations.forEach(annotation => {
    if (annotation.expr && getIdentifierName(annotation.expr) === PresetDecorators.BUILDER &&
      member.scriptFunction.id) {
      builderFunctionList.push(member.scriptFunction.id.name);
    }
  });
}

function collectRegularVariables(member: arkts.AstNode, regularVariableList: string[]): void {
  if (!arkts.isVariableDeclaration(member) || !member.declarators) {
    return;
  }
  member.getChildren().forEach((item) => {
    if (!arkts.isVariableDeclarator(item) || !item.name ||
      (item.initializer && arkts.isArrowFunctionExpression(item.initializer))) {
      return;
    }
    regularVariableList.push(item.name.name);
  });
}

function initList(node: arkts.AstNode, regularVariableList: string[], builderFunctionList: string[]): void {
  // Record variables and functions that @builder decorate
  if (arkts.nodeType(node) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
    return;
  }
  node.getChildren().forEach((member) => {
    collectBuilderFunctions(member, builderFunctionList);
    collectRegularVariables(member, regularVariableList);
  });
}

function recordRestrictedDecorators(
  item: arkts.AstNode,
  structName: string,
  propertyMap: Map<string, Map<string, string>>
): void {
  if (!arkts.isClassProperty(item) || !item.key) {
    return;
  }
  let propertyName: string = getIdentifierName(item.key);
  // If there is no decorator, it is a regular type
  if (item.annotations.length === 0) {
    let annotationName: string = PresetDecorators.REGULAR;
    addProperty(structName, propertyName, annotationName, propertyMap);
  }
  // Iterate through the decorator of the property, and when the decorator is in the disallowAssignedDecorators array, the property is recorded
  item.annotations.forEach((annotation) => {
    if (!annotation.expr) {
      return;
    }
    let annotationName: string = getIdentifierName(annotation.expr);
    if (disallowAssignedDecorators.includes(annotationName)) {
      addProperty(structName, propertyName, annotationName, propertyMap);
    }
  });
}

function initPropertyMap(node: arkts.AstNode, propertyMap: Map<string, Map<string, string>>): void {
  // Iterate through the root node ahead of time, noting the structure name, variable name, and corresponding decorator type
  if (arkts.nodeType(node) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
    return;
  }
  node.getChildren().forEach((member) => {
    if (!arkts.isStructDeclaration(member) || !member.definition.ident) {
      return;
    }
    let structName: string = member.definition.ident?.name ?? '';
    if (structName === '') {
      return;
    }
    member.definition?.body?.forEach((item) => {
      recordRestrictedDecorators(item, structName, propertyMap);
    });
  });
}

function reportRegularVariableError(
  property: arkts.AstNode,
  context: UISyntaxRuleContext,
  childType: string,
  childName: string,
  regularVariableList: string[]
): void {
  if (!arkts.isProperty(property) || !property.value) {
    return;
  }
  if (childType !== PresetDecorators.LINK) {
    return;
  }
  if (arkts.isIdentifier(property.value) && regularVariableList.includes(property.value.name)) {
    context.report({
      node: property,
      message: rule.messages.constructParameter,
      data: {
        initializer: PresetDecorators.REGULAR,
        initializerName: property.value.name,
        parameter: `@${childType}`,
        parameterName: childName,
      },
    });
  }
}

function reportBuilderError(
  property: arkts.AstNode,
  context: UISyntaxRuleContext,
  childType: string,
  childName: string,
  builderFunctionList: string[],
): void {
  if (!arkts.isProperty(property) || !property.value) {
    return;
  }
  let isLocalBuilder: boolean = false;
  if (arkts.isMemberExpression(property.value) && arkts.isIdentifier(property.value.property)) {
    const parentName = property.value.property.name;
    const parentType: string = getPropertyAnnotationName(property, parentName);
    if (parentType === '') {
      return;
    }
    isLocalBuilder = parentType === PresetDecorators.LOCAL_BUILDER;
  }
  let isBuilder: boolean = false;
  if (arkts.isIdentifier(property.value)) {
    isBuilder = builderFunctionList.includes(property.value.name);
    if (builderFunctionList.includes(property.value.name) && childType !== PresetDecorators.BUILDER_PARAM) {
      context.report({
        node: property,
        message: rule.messages.initializerIsBuilder,
        data: {
          initializerName: property.value.name,
          parameterName: childName,
        },
      });
    }
  }
  if (childType === PresetDecorators.BUILDER_PARAM && !isBuilder && !isLocalBuilder) {
    context.report({
      node: property,
      message: rule.messages.parameterIsBuilderParam,
      data: {
        parameterName: childName,
      },
    });
  }
}

function checkConstructParameter(
  node: arkts.AstNode,
  context: UISyntaxRuleContext,
  propertyMap: Map<string, Map<string, string>>,
  regularVariableList: string[],
  builderFunctionList: string[],
): void {
  if (!arkts.isIdentifier(node) || !propertyMap.has(getIdentifierName(node))) {
    return;
  }
  let structName: string = getIdentifierName(node);
  let parentNode: arkts.AstNode = node.parent;
  if (!arkts.isCallExpression(parentNode)) {
    return;
  }
  // Gets all the properties recorded by the struct
  const childPropertyName: Map<string, string> = propertyMap.get(structName)!;
  parentNode.arguments.forEach((member) => {
    member.getChildren().forEach((property) => {
      if (!arkts.isProperty(property) || !property.key) {
        return;
      }
      const childName = getIdentifierName(property.key);
      if (!childPropertyName.has(childName) || !property.value) {
        return;
      }
      const childType: string = childPropertyName.get(childName)!;
      reportRegularVariableError(property, context, childType, childName, regularVariableList);
      reportBuilderError(property, context, childType, childName, builderFunctionList);
      if (!arkts.isMemberExpression(property.value) || !arkts.isThisExpression(property.value.object)) {
        return;
      }
      const parentName = getIdentifierName(property.value.property);
      const parentType: string = getPropertyAnnotationName(node, parentName);
      if (parentType === '') {
        return;
      }
      if (restrictedDecoratorInitializations.has(parentType) &&
        restrictedDecoratorInitializations.get(parentType)!.includes(childType)) {
        context.report({
          node: property,
          message: rule.messages.constructParameter,
          data: {
            initializer: parentType === PresetDecorators.REGULAR ? PresetDecorators.REGULAR : `@${parentType}`,
            initializerName: parentName,
            parameter: childType === PresetDecorators.REGULAR ? PresetDecorators.REGULAR : `@${childType}`,
            parameterName: childName,
          },
        });
      }
    });
  });
}

const rule: UISyntaxRule = {
  name: 'construct-parameter',
  messages: {
    constructParameter: `The '{{initializer}}' property '{{initializerName}}' cannot be assigned to the '{{parameter}}' property '{{parameterName}}'.`,
    initializerIsBuilder: `'@Builder' function '{{initializerName}}' can only initialize '@BuilderParam' attribute.`,
    parameterIsBuilderParam: `'@BuilderParam' attribute '{{parameterName}}' can only initialized by '@Builder' function or '@LocalBuilder' method in struct.`,
  },
  setup(context) {
    let propertyMap: Map<string, Map<string, string>> = new Map();
    let regularVariableList: string[] = [];
    let builderFunctionList: string[] = [];

    return {
      parsed: (node): void => {
        initList(node, regularVariableList, builderFunctionList);
        initPropertyMap(node, propertyMap);
        checkConstructParameter(node, context, propertyMap, regularVariableList, builderFunctionList);
      },
    };
  },
};

export default rule;