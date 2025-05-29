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
  getClassPropertyAnnotationNames, PresetDecorators, getAnnotationUsage, getClassPropertyName, getIdentifierName
} from '../utils';
import { UISyntaxRule, UISyntaxRuleContext } from './ui-syntax-rule';

const builtInDecorators = [PresetDecorators.LOCAL, PresetDecorators.PARAM, PresetDecorators.EVENT];
// Helper functions for rules
const hasisComponentV2 = (node: arkts.StructDeclaration): boolean => !!getAnnotationUsage(node,
  PresetDecorators.COMPONENT_V2);

const hasComponent = (node: arkts.StructDeclaration): boolean => !!getAnnotationUsage(node,
  PresetDecorators.COMPONENT_V1);
function checkMultipleBuiltInDecorators(context: UISyntaxRuleContext, member: arkts.ClassProperty,
  propertyDecorators: string[]): void {
  const appliedBuiltInDecorators = propertyDecorators.filter(d => builtInDecorators.includes(d));
  if (appliedBuiltInDecorators.length > 1) {
    member.annotations?.forEach(annotation => {
      if (annotation.expr && arkts.isIdentifier(annotation.expr)) {
        const annotationsName = annotation.expr.name;
        reportMultipleBuiltInDecoratorsError(context, annotation, annotationsName, builtInDecorators);
      }
    });
  }
};

function reportMultipleBuiltInDecoratorsError(context: UISyntaxRuleContext, annotation: arkts.AstNode,
  annotationsName: string | undefined, builtInDecorators: string[]): void {
  if (annotationsName && builtInDecorators.includes(annotationsName)) {
    context.report({
      node: annotation,
      message: rule.messages.multipleBuiltInDecorators,
      fix: (annotation) => {
        const startPosition = annotation.startPosition;
        const endPosition = annotation.endPosition;
        return {
          range: [startPosition, endPosition],
          code: '',
        };
      },
    });
  }
}

function checkDecoratorOnlyInisComponentV2(context: UISyntaxRuleContext, member: arkts.ClassProperty,
  node: arkts.StructDeclaration, hasisComponentV2: boolean, hasComponent: boolean): void {
  member.annotations?.forEach(annotation => {
    if (annotation.expr && arkts.isIdentifier(annotation.expr)) {
      const annotationsName = annotation.expr?.name;
      if (annotationsName && builtInDecorators.includes(annotationsName) && !hasisComponentV2 && !hasComponent) {
        reportDecoratorOnlyInisComponentV2Error(context, annotation, annotationsName, node);
      }
    }
  });
};

function reportDecoratorOnlyInisComponentV2Error(context: UISyntaxRuleContext, annotation: arkts.AnnotationUsage,
  annotationsName: string, node: arkts.StructDeclaration): void {
  context.report({
    node: annotation,
    message: rule.messages.decoratorOnlyInisComponentV2,
    data: { annotationsName },
    fix: (annotation) => {
      const startPosition = node.definition.startPosition;
      return {
        range: [startPosition, startPosition],
        code: `@${PresetDecorators.COMPONENT_V2}\n`,
      };
    },
  });
}

function checkParamRequiresRequire(context: UISyntaxRuleContext, member: arkts.ClassProperty,
  propertyDecorators: string[]): void {
  if (propertyDecorators.includes(PresetDecorators.PARAM) && !member.value &&
    !propertyDecorators.includes(PresetDecorators.REQUIRE) && member.key) {
    const memberKey = member.key;
    context.report({
      node: memberKey,
      message: rule.messages.paramRequiresRequire,
      fix: (memberKey) => {
        const startPosition = memberKey.startPosition;
        return {
          range: [startPosition, startPosition],
          code: `@${PresetDecorators.REQUIRE} `,
        };
      },
    });
  }
};

function checkRequireOnlyWithParam(context: UISyntaxRuleContext, member: arkts.ClassProperty,
  propertyDecorators: string[], isComponentV2: boolean): void {
  const requireDecorator = member.annotations?.find(annotation =>
    annotation.expr && arkts.isIdentifier(annotation.expr) && annotation.expr.name === PresetDecorators.REQUIRE
  );
  if (isComponentV2 && requireDecorator && !propertyDecorators.includes(PresetDecorators.PARAM)) {
    context.report({
      node: requireDecorator,
      message: rule.messages.requireOnlyWithParam,
      fix: (requireDecorator) => {
        const startPosition = requireDecorator.startPosition;
        const endPosition = requireDecorator.endPosition;
        return {
          range: [startPosition, endPosition],
          code: '',
        };
      },
    });
  }
};

function checkuseStateDecoratorsWithProperty(context: UISyntaxRuleContext, method: arkts.MethodDefinition): void {
  method.scriptFunction.annotations?.forEach(annotation => {
    if (annotation.expr && arkts.isIdentifier(annotation.expr) && builtInDecorators.includes(annotation.expr.name)) {
      const annotationName = annotation.expr.name;
      reportInvalidDecoratorOnMethod(context, annotation, annotationName);
    }
  });
}

function reportInvalidDecoratorOnMethod(context: UISyntaxRuleContext, annotation: arkts.AnnotationUsage,
  annotationName: string): void {
  context.report({
    node: annotation,
    message: rule.messages.useStateDecoratorsWithProperty,
    data: { annotationName },
    fix: (annotation) => {
      const startPosition = annotation.startPosition;
      const endPosition = annotation.endPosition;
      return {
        range: [startPosition, endPosition],
        code: '',
      };
    },
  });
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
          message: rule.messages.paramNeedInit,
          data: {
            name: key,
          },
        });
      }
    });
  });
}

function getChildKeyNameArray(member: arkts.AstNode): string[] {
  const childkeyNameArray: string[] = [];
  member.getChildren().forEach((property) => {
    if (!arkts.isProperty(property) || !property.key || !arkts.isIdentifier(property.key)) {
      return;
    }
    const childkeyName = property.key.name;
    if (childkeyName !== '') {
      childkeyNameArray.push(childkeyName);
    }
  });
  return childkeyNameArray;
}

function initMap(node: arkts.AstNode, mustInitMap: Map<string, Map<string, string>>, mustInitArray: string[][],
): void {
  if (arkts.nodeType(node) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
    return;
  }
  node.getChildren().forEach((member) => {
    if (!(arkts.isStructDeclaration(member) ||
      (arkts.isClassDeclaration(member) && !!member.definition &&
        arkts.classDefinitionIsFromStructConst(member.definition))
    )) {
      return;
    }
    const structName: string = member.definition!.ident?.name ?? '';
    if (structName === '') {
      return;
    }
    member.definition?.body.forEach((item) => {
      checkPropertyByAnnotations(item, structName, mustInitMap, mustInitArray);
    });
  });
}

function checkPropertyByAnnotations(
  item: arkts.AstNode,
  structName: string,
  mustInitMap: Map<string, Map<string, string>>,
  mustInitArray: string[][]
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
  mustInitArray.forEach(arr => {
    if (arr.every(annotation => annotationArray.includes(annotation))) {
      const annotationName: string = arr[0];
      addProperty(mustInitMap, structName, propertyName, annotationName);
    }
  });
}

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

function validateClassPropertyDecorators(context: UISyntaxRuleContext, node: arkts.StructDeclaration): void {
  const isComponentV2 = hasisComponentV2(node);
  const isComponent = hasComponent(node);
  node.definition.body.forEach(member => {
    if (!arkts.isClassProperty(member)) {
      return;
    }
    const propertyDecorators = getClassPropertyAnnotationNames(member);
    // Rule 1: Multiple built-in decorators
    checkMultipleBuiltInDecorators(context, member, propertyDecorators);

    // Rule 2: Built-in decorators only allowed in @isComponentV2
    checkDecoratorOnlyInisComponentV2(context, member, node, isComponentV2, isComponent);

    // Rule 3: @Param without default value must be combined with @Require
    checkParamRequiresRequire(context, member, propertyDecorators);

    // Rule 4: @Require must be used together with @Param
    checkRequireOnlyWithParam(context, member, propertyDecorators, isComponentV2);
  });
}

function checkDecorator(annoArray: readonly arkts.AnnotationUsage[], decorator: string): boolean {
  let flag = false;
  annoArray.forEach((anno) => {
    if (!anno.expr) {
      return;
    }
    const annoName = getIdentifierName(anno.expr);
    if (annoName === decorator) {
      flag = true;
    }
  });
  return flag;
}

// Define a function to add property data to the property map
function addPropertyMap(
  structName: string,
  propertyName: string,
  annotationName: string,
  propertyMap: Map<string, Map<string, string>>
): void {
  if (!propertyMap.has(structName)) {
    propertyMap.set(structName, new Map());
  }
  const structProperties = propertyMap.get(structName);
  if (structProperties) {
    structProperties.set(propertyName, annotationName);
  }
}

// Iterate through the incoming componentv2 node to see if there are any state variables for decorator decorations
function initComponentV2PropertyMap(
  node: arkts.AstNode,
  componentV2PropertyMap: Map<string, Map<string, string>>
): void {
  if (arkts.nodeType(node) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
    return;
  }
  node.getChildren().forEach((member) => {
    if (!arkts.isStructDeclaration(member) || !member.definition.ident ||
      !checkDecorator(member?.definition.annotations, PresetDecorators.COMPONENT_V2)) {
      return;
    }
    let structName: string = member.definition.ident?.name ?? '';
    member.definition?.body?.forEach((item) => {
      processClassPropertyAnnotations(item, structName, componentV2PropertyMap);
    });
  });
}

function processClassPropertyAnnotations(
  item: arkts.AstNode,
  structName: string,
  componentV2PropertyMap: Map<string, Map<string, string>>
): void {
  if (!arkts.isClassProperty(item) || !item.key) {
    return;
  }
  let propertyName: string = getIdentifierName(item.key);
  // If there is no decorator, it is a regular type
  if (item.annotations.length === 0) {
    let annotationName: string = PresetDecorators.REGULAR;
    addPropertyMap(structName, propertyName, annotationName, componentV2PropertyMap);
  }
  item.annotations.forEach((annotation) => {
    if (!annotation.expr) {
      return;
    }
    let annotationName: string = getIdentifierName(annotation.expr);
    if (annotationName === PresetDecorators.LOCAL) {
      addPropertyMap(structName, propertyName, annotationName, componentV2PropertyMap);
    }
  });
}


function checkInitializeRule(
  node: arkts.AstNode,
  context: UISyntaxRuleContext,
  componentV2PropertyMap: Map<string, Map<string, string>>,
): void {
  if (!arkts.isIdentifier(node) || !componentV2PropertyMap.has(getIdentifierName(node))) {
    return;
  }
  let structName: string = getIdentifierName(node);
  let parentNode: arkts.AstNode = node.parent;
  if (!arkts.isCallExpression(parentNode)) {
    return;
  }
  let structNode = node.parent;
  while (!arkts.isStructDeclaration(structNode)) {
    if (!structNode.parent) {
      return;
    }
    structNode = structNode.parent;
  }
  let parentPropertyMap: Map<string, string[]> = new Map();
  structNode.definition.body.forEach((property) => {
    if (!arkts.isClassProperty(property)) {
      return;
    }
    let propertyArray: string[] = [];
    property.annotations.forEach((annotation) => {
      if (!annotation.expr || !arkts.isIdentifier(annotation.expr)) {
        return;
      }
      propertyArray.push(annotation.expr.name);
    });
    parentPropertyMap.set(getClassPropertyName(property), propertyArray);
  });
  // Gets all the properties recorded by the struct
  const childPropertyName: Map<string, string> = componentV2PropertyMap.get(structName)!;
  parentNode.arguments.forEach((argument) => {
    if (!arkts.isObjectExpression(argument)) {
      return;
    }
    argument.getChildren().forEach((property) => {
      if (!arkts.isProperty(property) || !property.key) {
        return;
      }
      const childkeyName = getIdentifierName(property.key);
      if (!childPropertyName.has(childkeyName)) {
        return;
      }
      reportLocalNeedInit(childPropertyName, childkeyName, context, property, structName);
    });
  });
}

function reportLocalNeedInit(childPropertyName: Map<string, string>, childkeyName: string, context: UISyntaxRuleContext,
  property: arkts.Property, structName: string): void {
  if (childPropertyName.get(childkeyName) === PresetDecorators.LOCAL) {
    context.report({
      node: property,
      message: rule.messages.localNeedNoInit,
      data: {
        decoratorName: '@' + childPropertyName.get(childkeyName)!,
        key: childkeyName,
        componentName: structName,
      },
      fix: (property) => {
        return {
          range: [property.startPosition, property.endPosition],
          code: '',
        };
      }
    });
  }
  if (childPropertyName.get(childkeyName) === PresetDecorators.REGULAR) {
    context.report({
      node: property,
      message: rule.messages.localNeedNoInit,
      data: {
        decoratorName: PresetDecorators.REGULAR,
        key: childkeyName,
        componentName: structName,
      },
      fix: (property) => {
        return {
          range: [property.startPosition, property.endPosition],
          code: '',
        };
      }
    });
  }
}

const rule: UISyntaxRule = {
  name: 'componentV2-state-usage-validation',
  messages: {
    multipleBuiltInDecorators: `The member property or method cannot be decorated by multiple built-in decorators.`,
    decoratorOnlyInisComponentV2: `The '@{{annotationsName}}' decorator can only be used in a 'struct' decorated with '@ComponentV2'.`,
    paramRequiresRequire: `When a variable decorated with '@Param' is not assigned a default value, it must also be decorated with '@Require'.`,
    requireOnlyWithParam: `In a struct decorated with '@ComponentV2', '@Require' can only be used with @Param.`,
    localNeedNoInit: `The '{{decoratorName}}' property '{{key}}' in the custom component '{{componentName}}' cannot be initialized here (forbidden to specify).`,
    paramNeedInit: `Property '{{name}}' must be initialized through the component constructor.`,
    useStateDecoratorsWithProperty: `'@{{annotationName}}' can only decorate member property.`,
  },

  setup(context) {
    let mustInitMap: Map<string, Map<string, string>> = new Map();
    const mustInitArray: string[][] = [[PresetDecorators.REQUIRE, PresetDecorators.PARAM]];
    let componentV2PropertyMap: Map<string, Map<string, string>> = new Map();
    return {
      parsed: (node): void => {
        initComponentV2PropertyMap(node, componentV2PropertyMap);
        checkInitializeRule(node, context, componentV2PropertyMap);
        initMap(node, mustInitMap, mustInitArray);
        // Rule 6: Property with require and Param must be initialized through the component constructor
        checkMustInitialize(node, context, mustInitMap);
        if (arkts.isMethodDefinition(node)) {
          // Rule 7: Local, Param, Event decorators must be used with Property
          checkuseStateDecoratorsWithProperty(context, node);
        }
        if (!arkts.isStructDeclaration(node)) {
          return;
        }
        validateClassPropertyDecorators(context, node);
      },
    };
  },
};

export default rule;