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
import { getClassPropertyAnnotationNames, getClassPropertyName, getIdentifierName, PresetDecorators } from '../utils';


class ConstructParameterLiteralRule extends AbstractUISyntaxRule {
    // Record all @Link and @ObjectLink attributes
    private linkMap: Map<string, Map<string, string>> = new Map();

    public setup(): Record<string, string> {
        return {
            initializerIsLiteral: `The 'regular' property '{{initializerName}}' cannot be assigned to the '{{parameter}}' property '{{parameterName}}'.`,
        };
    }

    public beforeTransform(): void {
        this.linkMap = new Map();
    }

    public parsed(node: arkts.StructDeclaration): void {
        this.initMap(node);
        this.checkInitializeWithLiteral(node);
    }

    private addLinkProperty(
        structName: string,
        propertyName: string,
        annotationName: string
    ): void {
        if (!this.linkMap.has(structName)) {
            this.linkMap.set(structName, new Map());
        }
        const structProperties = this.linkMap.get(structName);
        if (!structProperties) {
            return;
        }
        structProperties.set(propertyName, annotationName);
    }

    private recordStructWithLinkDecorators(item: arkts.AstNode, structName: string): void {
        if (!arkts.isClassProperty(item)) {
            return;
        }
        const ClassPropertyAnnotations = getClassPropertyAnnotationNames(item);

        const classPropertyName = getClassPropertyName(item);
        if (!classPropertyName) {
            return;
        }
        if (ClassPropertyAnnotations.includes(PresetDecorators.OBJECT_LINK)) {
            this.addLinkProperty(structName, classPropertyName, PresetDecorators.OBJECT_LINK);
        }
        if (ClassPropertyAnnotations.includes(PresetDecorators.LINK)) {
            this.addLinkProperty(structName, classPropertyName, PresetDecorators.LINK);
        }
    }

    private initMap(node: arkts.AstNode): void {
        // Check if the current node is the root node
        if (arkts.nodeType(node) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
            return;
        }
        node.getChildren().forEach((member) => {
            if (!(arkts.isStructDeclaration(member))) {
                return;
            }
            if (!member.definition || !member.definition.ident || !arkts.isIdentifier(member.definition.ident)) {
                return;
            }
            const structName: string = member.definition.ident.name;
            if (structName === '') {
                return;
            }
            member.definition?.body?.forEach((item) => {
                this.recordStructWithLinkDecorators(item, structName);
            });
        });
    }

    private checkInitializeWithLiteral(node: arkts.AstNode): void {
        if (!arkts.isCallExpression(node) || !arkts.isIdentifier(node.expression)) {
            return;
        }
        const componentName = node.expression.name;
        // Only assignments to properties decorated with Link or ObjectLink trigger rule checks
        if (!this.linkMap.has(componentName)) {
            return;
        }
        const structLinkMap = this.linkMap.get(componentName);
        if (!structLinkMap) {
            return;
        }
        node.arguments.forEach((member) => {
            member.getChildren().forEach((property) => {
                if (!arkts.isProperty(property) || !property.key || !property.value) {
                    return;
                }
                const propertyName: string = getIdentifierName(property.key);
                if (propertyName === '' || !structLinkMap.has(propertyName)) {
                    return;
                }
                // If the statement type is single-level MemberExpression or Identifier, construct-parameter is validated.
                if (arkts.isMemberExpression(property.value) && arkts.isThisExpression(property.value.object)) {
                    return;
                }
                if (arkts.isIdentifier(property.value)) {
                    return;
                }
                const initializerName = property.value.dumpSrc().replace(/\(this\)/g, 'this');
                this.report({
                    node: property,
                    message: this.messages.initializerIsLiteral,
                    data: {
                        initializerName: initializerName,
                        parameter: `@${structLinkMap.get(propertyName)}`,
                        parameterName: propertyName,
                    },
                });
            });
        });
    }
}

export default ConstructParameterLiteralRule;