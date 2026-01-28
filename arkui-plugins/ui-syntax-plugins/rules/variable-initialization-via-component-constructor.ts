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

import { FileManager } from '../../common/file-manager';
import { LANGUAGE_VERSION } from '../../common/predefines';

import {
    getIdentifierName,
    getClassPropertyAnnotationNames,
    PresetDecorators,
    $_INVOKE, COMPONENT_BUILDER
} from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

interface PropertyInitInfo {
    hasRequire: boolean;
    hasBuilderParam: boolean;
    hasTrailingClosure: boolean;
    shouldInitViaComponentConstructor: boolean;
    cannotInitViaComponentConstructor: boolean;
    annotationName: string;
}

class VariableInitializationViaComponentConstructorRule extends AbstractUISyntaxRule {
    private static readonly shouldInitViaComponentConstructor: string[] = [
        PresetDecorators.LINK,
        PresetDecorators.OBJECT_LINK
    ];

    private static readonly disallowInitViaComponentConstructor: string[] = [
        PresetDecorators.CONSUME,
        PresetDecorators.STORAGE_LINK,
        PresetDecorators.STORAGE_PROP_REF,
        PresetDecorators.LOCAL_STORAGE_LINK,
        PresetDecorators.LOCAL_STORAGE_PROP_REF
    ];

    public setup(): Record<string, string> {
        return {
            shouldInitializeViaComponentConstructor: `The property '{{varName}}' must be initialized through the component constructor.`,
            requireVariableInitializationViaComponentConstructor: `'@Require' decorated '{{varName}}' must be initialized through the component constructor.`,
            disallowVariableInitializationViaComponentConstructor: `The '{{decoratorName}}' property '{{varName}}' in the custom component '{{customComponentName}}' cannot be initialized here (forbidden to specify).`,
            variableMixVerifyMessage: `The @{{childDecorator}} '{{childComponentName}}' cannot be used in the @{{parentDecorator}} '{{parentComponentName}}' when interop.`,
        };
    }

    public checked(node: arkts.StructDeclaration): void {
        this.checkVariableInitializationViaConstructor(node);
        this.checkVariableInitializationWithDecorator(node);
    }

    private getChildKeyNameArray(node: arkts.CallExpression): string[] {
        const childKeyNameArray: string[] = [];
        node.arguments.forEach((member) => {
            member.getChildren().forEach((property) => {
                if (!arkts.isProperty(property)) {
                    return;
                }
                if (!property.key || !arkts.isIdentifier(property.key)) {
                    return;
                }
                const childKeyName = property.key.name;
                if (childKeyName !== '') {
                    childKeyNameArray.push(childKeyName);
                }
            });
        });
        return childKeyNameArray;
    }

    private isComponentBuilder(node: arkts.MemberExpression): boolean {
        const property = node.property;
        if (!arkts.isIdentifier(property)) {
            return false;
        }
        const propertyName: string = property.name;
        if (propertyName !== $_INVOKE) {
            return false;
        }
        const symbol: arkts.AstNode | undefined = arkts.getDecl(property);
        if (!symbol || !arkts.isMethodDefinition(symbol)) {
            return false;
        }
        return symbol.scriptFunction.annotations.some(annotation => {
            return annotation.expr && arkts.isIdentifier(annotation.expr) &&
                annotation.expr.name === COMPONENT_BUILDER;
        }) || this.isDynStruct(symbol);
    }

    isDynStruct(symbol: arkts.AstNode): boolean {
        const fileManager: FileManager = FileManager.getInstance();
        const path: string = arkts.getProgramFromAstNode(symbol)?.absName;
        const version: string = LANGUAGE_VERSION.ARKTS_1_1;
        return fileManager.getLanguageVersionByFilePath(path) === version;
    }

    private checkVariableInitializationViaConstructor(node: arkts.AstNode): void {
        if (!arkts.isCallExpression(node) || !node.expression) {
            return;
        }
        if (!arkts.isIdentifier(node.expression) && !arkts.isMemberExpression(node.expression)) {
            return;
        }
        let structName: string = '';
        let structDecl: arkts.AstNode | undefined = undefined;
        if (arkts.isMemberExpression(node.expression)) {
            if (!this.isComponentBuilder(node.expression) ||
                !arkts.isIdentifier(node.expression.object)) {
                return;
            }
            structName = node.expression.object.name;
            structDecl = arkts.getDecl(node.expression.object);
        } else {
            structName = getIdentifierName(node.expression);
            structDecl = arkts.getDecl(node.expression);
        }
        if (!structDecl) {
            return;
        }
        const props: string[] = this.getChildKeyNameArray(node);
        const hasTrailingClosure: boolean = node.isTrailingCall;
        structDecl?.getChildren?.().forEach(member => {
            if (!arkts.isClassProperty(member) || !member.key || !arkts.isIdentifier(member.key)) {
                return;
            }
            const propertyName: string = member.key.name;
            if (member.annotations.length === 0 || propertyName === '') {
                return;
            }
            const propertyInitInfo: PropertyInitInfo = this.getStructPropertyInfo(member, hasTrailingClosure);
            const messageId: string | undefined = this.getMessageId(propertyInitInfo, propertyName, props);
            if (!messageId) {
                return;
            }
            this.report({
                node: node,
                message: messageId,
                data: {
                    decoratorName: `@${propertyInitInfo.annotationName}`,
                    varName: propertyName,
                    customComponentName: structName,
                },
            });
        });
    }

    private getStructPropertyInfo(member: arkts.ClassProperty, hasTrailingClosure: boolean): PropertyInitInfo {
        let hasRequire: boolean = false;
        let hasBuilderParam: boolean = false;
        let shouldInitializeViaComponentConstructor: boolean = false;
        let cannotInitViaComponentConstructor: boolean = false;
        let annotationName: string = '';
        const annotationArray: string[] = getClassPropertyAnnotationNames(member);
        annotationArray.forEach(annotation => {
            if (annotation === PresetDecorators.REQUIRE) {
                hasRequire = true;
            }
            if (annotation === PresetDecorators.BUILDER_PARAM) {
                hasBuilderParam = true;
            }
            if (VariableInitializationViaComponentConstructorRule.disallowInitViaComponentConstructor.includes(annotation)) {
                cannotInitViaComponentConstructor = true;
                annotationName = annotation;
            }
            if (VariableInitializationViaComponentConstructorRule.shouldInitViaComponentConstructor.includes(annotation)) {
                shouldInitializeViaComponentConstructor = true;
            }
        });
        return {
            hasRequire: hasRequire,
            hasBuilderParam: hasBuilderParam,
            hasTrailingClosure: hasTrailingClosure,
            shouldInitViaComponentConstructor: shouldInitializeViaComponentConstructor,
            cannotInitViaComponentConstructor: cannotInitViaComponentConstructor,
            annotationName: annotationName
        };
    }

    private getMessageId(info: PropertyInitInfo, propertyName: string, props: string[]): string | undefined {
        let messageId: string | undefined = undefined;
        let hasProp: boolean = props.some(tempProp => tempProp === propertyName);
        if (info.hasRequire && !hasProp && !(info.hasTrailingClosure && info.hasBuilderParam)) {
            messageId = this.messages.requireVariableInitializationViaComponentConstructor;
        }
        if (info.shouldInitViaComponentConstructor && !hasProp) {
            messageId = this.messages.shouldInitializeViaComponentConstructor;
        }
        if (info.cannotInitViaComponentConstructor && hasProp) {
            messageId = this.messages.disallowVariableInitializationViaComponentConstructor;
        }
        return messageId;
    }

    private isDynStructForVerifyDecorator(node: arkts.MemberExpression): boolean {
        const symbol: arkts.AstNode | undefined = this.getProperty(node);
        if (!symbol || !arkts.isMethodDefinition(symbol)) {
            return false;
        }
        return this.isDynStruct(symbol);
    }

    private getProperty(node: arkts.MemberExpression): arkts.AstNode | undefined {
        const property = node.property;
        if (!arkts.isIdentifier(property)) {
            return undefined;
        }
        const propertyName: string = property.name;
        if (propertyName !== $_INVOKE) {
            return undefined;
        }
        const symbol: arkts.AstNode | undefined = arkts.getDecl(property);
        return symbol;
    }

    private checkVariableInitializationWithDecorator(node: arkts.AstNode): void {
        if (!arkts.isCallExpression(node) ||
            !node.expression ||
            !arkts.isMemberExpression(node.expression) ||
            !this.isDynStructForVerifyDecorator(node.expression)) {
            return;
        }
        const parentNode: arkts.AstNode | undefined = this.getParentNode(node);
        if (!parentNode) {
          return;
        }
        if (!parentNode.definition ||
            !parentNode.definition.ident ||
            !arkts.isIdentifier(parentNode.definition.ident) ||
            !parentNode.definition.annotations) {
            return;
        }
        const isComponentV2InSta: boolean = parentNode.definition.annotations.some((annotation) => 
            arkts.isIdentifier(annotation.expr) && annotation.expr.name === PresetDecorators.COMPONENT_V2
        );
        const parentStructName: string = parentNode.definition.ident.name;
        const parentStructDecorator: string =
            isComponentV2InSta ? PresetDecorators.COMPONENT_V2 : PresetDecorators.COMPONENT_V1;
        let structDecl: arkts.AstNode | undefined = undefined;
        if (node.expression.object && arkts.isIdentifier(node.expression.object)) {
            structDecl = arkts.getDecl(node.expression.object);
        }
        if (!structDecl) {
            return;
        }
        const isComponentV2InDyn = structDecl.annotations.some((annotation) =>
            arkts.isIdentifier(annotation.expr) && annotation.expr.name === PresetDecorators.COMPONENT_V2
        );
        const childStructName = node.expression.object.name;
        const childStructDecorator: string =
            isComponentV2InDyn ? PresetDecorators.COMPONENT_V2 : PresetDecorators.COMPONENT_V1;
        if ((isComponentV2InSta && !isComponentV2InDyn) ||
            (!isComponentV2InSta && isComponentV2InDyn)) {
            this.doReport(node, childStructDecorator, childStructName, parentStructDecorator, parentStructName);
        }
    }

    private getParentNode(node: arkts.AstNode): arkts.classDeclaration | undefined {
        if (arkts.isClassDeclaration(node)) {
            return node;
        }
        if (!node.parent) {
            return undefined;
        }
        return this.getParentNode(node.parent);
    }

    private doReport(
      node: arkts.AstNode,
      childStructDecorator: string,
      childStructName: string,
      parentStructDecorator: string,
      parentStructName: string
    ): void {
      this.report({
          node: node,
          message: this.messages.variableMixVerifyMessage,
          data: {
              childDecorator: childStructDecorator,
              childComponentName: childStructName,
              parentDecorator: parentStructDecorator,
              parentComponentName: parentStructName,
          }
      });
    }
}

export default VariableInitializationViaComponentConstructorRule;