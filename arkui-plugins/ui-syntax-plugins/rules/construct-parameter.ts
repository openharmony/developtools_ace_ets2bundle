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
import { AbstractUISyntaxRule } from './ui-syntax-rule';

// When a specific decorator is used as a parameter, the assigned decorator is not allowed
const disallowAssignedDecorators: string[] = [
  PresetDecorators.REGULAR, PresetDecorators.LINK, PresetDecorators.OBJECT_LINK,
  PresetDecorators.BUILDER_PARAM, PresetDecorators.BUILDER, PresetDecorators.STATE,
  PresetDecorators.PROP_REF, PresetDecorators.PROVIDE, PresetDecorators.CONSUME,
  PresetDecorators.BUILDER,
];
// The decorator structure prohibits initializing the assignment list
const restrictedDecoratorInitializations: Map<string, string[]> = new Map([
  [PresetDecorators.REGULAR, [PresetDecorators.OBJECT_LINK, PresetDecorators.LINK]],
  [PresetDecorators.PROVIDE, [PresetDecorators.REGULAR]],
  [PresetDecorators.CONSUME, [PresetDecorators.REGULAR]],
  [PresetDecorators.STORAGE_PROP_REF, [PresetDecorators.REGULAR]],
  [PresetDecorators.VARIABLE, [PresetDecorators.LINK]],
  [PresetDecorators.LOCAL_STORAGE_LINK, [PresetDecorators.REGULAR]],
]);
// When there are multiple Decorators, filter out the Decorators that are not relevant to the rule
const decoratorsFilter: string[] = [
  PresetDecorators.PROVIDE, PresetDecorators.CONSUME, PresetDecorators.STORAGE_PROP_REF,
  PresetDecorators.LOCAL_STORAGE_LINK, PresetDecorators.BUILDER_PARAM,
];

class ConstructParameterRule extends AbstractUISyntaxRule {
  private propertyMap: Map<string, Map<string, string>> = new Map();
  private regularVariableList: string[] = [];
  private builderFunctionList: string[] = [];

  public setup(): Record<string, string> {
    return {
      constructParameter: `The '{{initializer}}' property '{{initializerName}}' cannot be assigned to the '{{parameter}}' property '{{parameterName}}'.`,
      initializerIsBuilder: `'@Builder' function '{{initializerName}}' can only initialize '@BuilderParam' attribute.`,
      parameterIsBuilderParam: `'@BuilderParam' attribute '{{parameterName}}' can only initialized by '@Builder' function or '@Builder' method in struct.`,
    };
  }

  public beforeTransform(): void {
    this.propertyMap = new Map();
    this.regularVariableList = [];
    this.builderFunctionList = [];
  }

  public parsed(node: arkts.StructDeclaration): void {
    this.initList(node);
    this.initPropertyMap(node);
    this.checkConstructParameter(node);
  }

  private getPropertyAnnotationName(node: arkts.AstNode, propertyName: string): string {
    while (!arkts.isStructDeclaration(node)) {
      if (!node.parent) {
        return '';
      }
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
  private addProperty(
    structName: string,
    propertyName: string,
    annotationName: string
  ): void {
    if (!this.propertyMap.has(structName)) {
      this.propertyMap.set(structName, new Map());
    }
    const structProperties = this.propertyMap.get(structName);
    if (!structProperties) {
      return;
    }
    structProperties.set(propertyName, annotationName);
  }

  private collectBuilderFunctions(member: arkts.AstNode): void {
    if (!arkts.isFunctionDeclaration(member) || !member.annotations) {
      return;
    }
    member.annotations.forEach(annotation => {
      if (annotation.expr && getIdentifierName(annotation.expr) === PresetDecorators.BUILDER &&
        member.scriptFunction.id) {
        this.builderFunctionList.push(member.scriptFunction.id.name);
      }
    });
  }

  private collectRegularVariables(member: arkts.AstNode): void {
    if (!arkts.isVariableDeclaration(member) || !member.declarators) {
      return;
    }
    member.getChildren().forEach((item) => {
      if (!arkts.isVariableDeclarator(item) || !item.name ||
        (item.initializer && arkts.isArrowFunctionExpression(item.initializer))) {
        return;
      }
      this.regularVariableList.push(item.name.name);
    });
  }

  private initList(node: arkts.AstNode): void {
    // Record variables and functions that @builder decorate
    if (arkts.nodeType(node) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
      return;
    }
    node.getChildren().forEach((member) => {
      this.collectBuilderFunctions(member);
      this.collectRegularVariables(member);
    });
  }

  private recordRestrictedDecorators(
    item: arkts.AstNode,
    structName: string,
  ): void {
    if (!arkts.isClassProperty(item) || !item.key) {
      return;
    }
    let propertyName: string = getIdentifierName(item.key);
    // If there is no decorator, it is a regular type
    if (item.annotations.length === 0) {
      let annotationName: string = PresetDecorators.REGULAR;
      this.addProperty(structName, propertyName, annotationName);
    }
    // Iterate through the decorator of the property, and when the decorator is in the disallowAssignedDecorators array, the property is recorded
    item.annotations.forEach((annotation) => {
      if (!annotation.expr) {
        return;
      }
      let annotationName: string = getIdentifierName(annotation.expr);
      if (disallowAssignedDecorators.includes(annotationName)) {
        this.addProperty(structName, propertyName, annotationName);
      }
    });
  }

  private initPropertyMap(node: arkts.AstNode): void {
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
        this.recordRestrictedDecorators(item, structName);
      });
    });
  }

  private reportRegularVariableError(
    property: arkts.AstNode,
    childType: string,
    childName: string,
  ): void {
    if (!arkts.isProperty(property) || !property.value) {
      return;
    }
    if (childType !== PresetDecorators.LINK) {
      return;
    }
    if (arkts.isIdentifier(property.value) && this.regularVariableList.includes(property.value.name)) {
      this.report({
        node: property,
        message: this.messages.constructParameter,
        data: {
          initializer: PresetDecorators.REGULAR,
          initializerName: property.value.name,
          parameter: `@${childType}`,
          parameterName: childName,
        },
      });
    }
  }

  private reportBuilderError(
    property: arkts.AstNode,
    childType: string,
    childName: string,
  ): void {
    if (!arkts.isProperty(property) || !property.value) {
      return;
    }
    const propertyValue: arkts.Expression = property.value;
    if (arkts.isArrowFunctionExpression(propertyValue)) {
      return;
    }
    let isBuilderInStruct: boolean = false;
    if (arkts.isMemberExpression(propertyValue) && arkts.isIdentifier(propertyValue.property)) {
      const parentName = propertyValue.property.name;
      const parentType: string = this.getPropertyAnnotationName(property, parentName);
      if (parentType === '') {
        return;
      }
      isBuilderInStruct = parentType === PresetDecorators.BUILDER;
    }
    let isBuilder: boolean = false;
    if (arkts.isIdentifier(propertyValue)) {
      isBuilder = this.builderFunctionList.includes(propertyValue.name);
      if (this.builderFunctionList.includes(propertyValue.name) && childType !== PresetDecorators.BUILDER_PARAM) {
        this.report({
          node: property,
          message: this.messages.initializerIsBuilder,
          data: {
            initializerName: propertyValue.name,
            parameterName: childName,
          },
        });
      }
    }
    if (childType === PresetDecorators.BUILDER_PARAM && !isBuilder && !isBuilderInStruct) {
      this.report({
        node: property,
        message: this.messages.parameterIsBuilderParam,
        data: {
          parameterName: childName,
        },
      });
    }
  }

  private checkConstructParameter(node: arkts.AstNode): void {
    if (!arkts.isIdentifier(node) || !this.propertyMap.has(getIdentifierName(node))) {
      return;
    }
    let structName: string = getIdentifierName(node);
    if (!node.parent) {
      return;
    }
    let parentNode: arkts.AstNode = node.parent;
    if (!arkts.isCallExpression(parentNode)) {
      return;
    }
    // Gets all the properties recorded by the struct
    const childPropertyName: Map<string, string> = this.propertyMap.get(structName)!;
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
        this.reportRegularVariableError(property, childType, childName);
        this.reportBuilderError(property, childType, childName);
        if (!arkts.isMemberExpression(property.value) || !arkts.isThisExpression(property.value.object)) {
          return;
        }
        const parentName = getIdentifierName(property.value.property);
        const parentType: string = this.getPropertyAnnotationName(node, parentName);
        if (parentType === '') {
          return;
        }
        if (restrictedDecoratorInitializations.has(parentType) &&
          restrictedDecoratorInitializations.get(parentType)!.includes(childType)) {
          this.report({
            node: property,
            message: this.messages.constructParameter,
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
}

export default ConstructParameterRule;
