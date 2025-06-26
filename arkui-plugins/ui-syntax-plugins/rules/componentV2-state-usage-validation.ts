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
import { AbstractUISyntaxRule } from './ui-syntax-rule';

const builtInDecorators = [PresetDecorators.LOCAL, PresetDecorators.PARAM, PresetDecorators.EVENT];

class ComponentV2StateUsageValidationRule extends AbstractUISyntaxRule {
  private componentV2PropertyMap: Map<string, Map<string, string>> = new Map();

  public beforeTransform(): void {
    this.componentV2PropertyMap = new Map();
  }

  public setup(): Record<string, string> {
    return {
      multipleBuiltInDecorators: `The member property or method cannot be decorated by multiple built-in decorators.`,
      paramRequiresRequire: `When a variable decorated with '@Param' is not assigned a default value, it must also be decorated with '@Require'.`,
      requireOnlyWithParam: `In a struct decorated with '@ComponentV2', '@Require' can only be used with '@Param' or '@BuilderParam'.`,
      localNeedNoInit: `The '{{decoratorName}}' property '{{key}}' in the custom component '{{componentName}}' cannot be initialized here (forbidden to specify).`,
      useStateDecoratorsWithProperty: `'@{{annotationName}}' can only decorate member property.`,
    };
  }

  public parsed(node: arkts.AstNode): void {
    this.initComponentV2PropertyMap(node, this.componentV2PropertyMap);
    this.checkInitializeRule(node, this.componentV2PropertyMap);
    if (arkts.isMethodDefinition(node)) {
      // Rule 5: Local, Param, Event decorators must be used with Property
      this.checkuseStateDecoratorsWithProperty(node);
    }
    if (!arkts.isStructDeclaration(node)) {
      return;
    }
    this.validateClassPropertyDecorators(node);
  }

  private hasisComponentV2 = (node: arkts.StructDeclaration): boolean => !!getAnnotationUsage(node,
    PresetDecorators.COMPONENT_V2);

  private hasComponent = (node: arkts.StructDeclaration): boolean => !!getAnnotationUsage(node,
    PresetDecorators.COMPONENT_V1);

  private checkMultipleBuiltInDecorators(member: arkts.ClassProperty,
    propertyDecorators: string[]): void {
    const appliedBuiltInDecorators = propertyDecorators.filter(d => builtInDecorators.includes(d));
    if (appliedBuiltInDecorators.length > 1) {
      member.annotations.forEach(annotation => {
        if (annotation.expr && arkts.isIdentifier(annotation.expr)) {
          const annotationsName = annotation.expr.name;
          this.reportMultipleBuiltInDecoratorsError(annotation, annotationsName, builtInDecorators);
        }
      });
    }
  };

  private reportMultipleBuiltInDecoratorsError(annotation: arkts.AstNode,
    annotationsName: string | undefined, builtInDecorators: string[]): void {
    if (annotationsName && builtInDecorators.includes(annotationsName)) {
      this.report({
        node: annotation,
        message: this.messages.multipleBuiltInDecorators,
      });
    }
  }

  private checkParamRequiresRequire(member: arkts.ClassProperty,
    propertyDecorators: string[]): void {
    if (propertyDecorators.includes(PresetDecorators.PARAM) && !member.value &&
      !propertyDecorators.includes(PresetDecorators.REQUIRE) && member.key) {
      const memberKey = member.key;
      this.report({
        node: memberKey,
        message: this.messages.paramRequiresRequire,
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

  private checkRequireOnlyWithParam(member: arkts.ClassProperty,
    propertyDecorators: string[], isComponentV2: boolean): void {
    const requireDecorator = member.annotations.find(annotation =>
      annotation.expr && arkts.isIdentifier(annotation.expr) && annotation.expr.name === PresetDecorators.REQUIRE
    );
    if (isComponentV2 &&
      requireDecorator &&
      !propertyDecorators.includes(PresetDecorators.PARAM) &&
      !propertyDecorators.includes(PresetDecorators.BUILDER_PARAM)) {
      this.report({
        node: requireDecorator,
        message: this.messages.requireOnlyWithParam,
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

  private checkuseStateDecoratorsWithProperty(method: arkts.MethodDefinition): void {
    method.scriptFunction.annotations.forEach(annotation => {
      if (annotation.expr && arkts.isIdentifier(annotation.expr) && builtInDecorators.includes(annotation.expr.name)) {
        const annotationName = annotation.expr.name;
        this.reportInvalidDecoratorOnMethod(annotation, annotationName);
      }
    });
  }

  private reportInvalidDecoratorOnMethod(annotation: arkts.AnnotationUsage,
    annotationName: string): void {
    this.report({
      node: annotation,
      message: this.messages.useStateDecoratorsWithProperty,
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

  private validateClassPropertyDecorators(node: arkts.StructDeclaration): void {
    const isComponentV2 = this.hasisComponentV2(node);
    node.definition.body.forEach(member => {
      if (!arkts.isClassProperty(member)) {
        return;
      }
      const propertyDecorators = getClassPropertyAnnotationNames(member);
      // Rule 1: Multiple built-in decorators
      this.checkMultipleBuiltInDecorators(member, propertyDecorators);

      // Rule 2: @Param without default value must be combined with @Require
      this.checkParamRequiresRequire(member, propertyDecorators);

      // Rule 3: @Require must be used together with @Param
      this.checkRequireOnlyWithParam(member, propertyDecorators, isComponentV2);
    });
  }

  private checkDecorator(annoArray: readonly arkts.AnnotationUsage[], decorator: string): boolean {
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
  private addPropertyMap(
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
  private initComponentV2PropertyMap(
    node: arkts.AstNode,
    componentV2PropertyMap: Map<string, Map<string, string>>
  ): void {
    if (arkts.nodeType(node) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
      return;
    }
    node.getChildren().forEach((member) => {
      if (!arkts.isStructDeclaration(member) || !member.definition.ident ||
        !this.checkDecorator(member.definition.annotations, PresetDecorators.COMPONENT_V2)) {
        return;
      }
      let structName: string = member.definition.ident.name;
      member.definition.body.forEach((item) => {
        this.processClassPropertyAnnotations(item, structName, componentV2PropertyMap);
      });
    });
  }

  private processClassPropertyAnnotations(
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
      this.addPropertyMap(structName, propertyName, annotationName, componentV2PropertyMap);
    }
    item.annotations.forEach((annotation) => {
      if (!annotation.expr) {
        return;
      }
      let annotationName: string = getIdentifierName(annotation.expr);
      if (annotationName === PresetDecorators.LOCAL) {
        this.addPropertyMap(structName, propertyName, annotationName, componentV2PropertyMap);
      }
    });
  }

  private checkInitializeRule(
    node: arkts.AstNode,

    componentV2PropertyMap: Map<string, Map<string, string>>,
  ): void {
    if (!arkts.isIdentifier(node) || !componentV2PropertyMap.has(getIdentifierName(node)) || !node.parent) {
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
      const classPropertyName = getClassPropertyName(property);
      if (!classPropertyName) {
        return;
      }
      parentPropertyMap.set(classPropertyName, propertyArray);
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
        this.reportLocalNeedInit(childPropertyName, childkeyName, property, structName);
      });
    });
  }

  private reportLocalNeedInit(childPropertyName: Map<string, string>, childkeyName: string,
    property: arkts.Property, structName: string): void {
    if (childPropertyName.get(childkeyName) === PresetDecorators.LOCAL) {
      this.report({
        node: property,
        message: this.messages.localNeedNoInit,
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
      this.report({
        node: property,
        message: this.messages.localNeedNoInit,
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
};

export default ComponentV2StateUsageValidationRule;