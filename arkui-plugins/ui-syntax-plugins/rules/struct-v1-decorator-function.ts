/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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
import { PresetDecorators, findDecorator } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

const V1Decorators: string[] = [
    PresetDecorators.STATE,
    PresetDecorators.PROP_REF,
    PresetDecorators.PROVIDE,
    PresetDecorators.LINK,
    PresetDecorators.CONSUME,
    PresetDecorators.STORAGE_LINK,
    PresetDecorators.LOCAL_STORAGE_LINK,
    PresetDecorators.STORAGE_PROP_REF,
    PresetDecorators.LOCAL_STORAGE_PROP_REF,
];

class StructV1DecoratorFunctionRule extends AbstractUISyntaxRule {
    private typeAliasMap: Map<string, arkts.TypeNode> = new Map();

    public setup(): Record<string, string> {
        return {
            IllegalFunction: `The V1 decorator '{{decorateNameProxy}}' cannot be applied to a Function-type variable '{{propertyName}}'`,
        };
    }

    public parsed(node: arkts.AstNode): void {
        if (arkts.isTSTypeAliasDeclaration(node) && node.id && node.typeAnnotation) {
            this.typeAliasMap.set(node.id.name, node.typeAnnotation);
            return;
        }
        if (!arkts.isStructDeclaration(node)) {
            return;
        }
        node.definition.body.forEach(member => {
            if (arkts.isClassProperty(member)) {
                this.reportIllegalFunctionError(member);
            }
        });
    }

    private hasDecoratorWithFunctionType(
        member: arkts.ClassProperty,
        decorators: string[]
    ): boolean {
        const hasTargetDecorator = member.annotations.some((annotation: arkts.AnnotationUsage) => {
            return (
                annotation.expr &&
                arkts.isIdentifier(annotation.expr) &&
                decorators.includes(annotation.expr.name)
            );
        });

        if (!hasTargetDecorator) {
            return false;
        }
        if (member.typeAnnotation) {
            if (this.isFunctionType(member.typeAnnotation, new Set<string>())) {
                return true;
            }
        }
        return false;
    }

    private isFunctionType(typeNode: arkts.TypeNode, visited: Set<string>): boolean {
        if (arkts.isETSFunctionType(typeNode)) {
            return true;
        }
        if (this.isFunctionTypeReference(typeNode, visited)) {
            return true;
        }
        if (arkts.isETSUnionType(typeNode)) {
            return this.isUnionOfTypeOnlyFunction(typeNode, visited);
        }
        return false;
    }

    private isFunctionTypeReference(typeNode: arkts.TypeNode, visited: Set<string>): boolean {
        if (!arkts.isETSTypeReference(typeNode)) {
            return false;
        }
        const ref = typeNode as arkts.ETSTypeReference;
        if (!ref.part || !arkts.isETSTypeReferencePart(ref.part)) {
            return false;
        }
        const part = ref.part as arkts.ETSTypeReferencePart;
        if (!part.name || !arkts.isIdentifier(part.name)) {
            return false;
        }
        const typeName = part.name.name;
        if (typeName === 'Function') {
            return true;
        }
        const aliasedType = this.typeAliasMap.get(typeName);
        if (!aliasedType || visited.has(typeName)) {
            return false;
        }
        visited.add(typeName);
        return this.isFunctionType(aliasedType, visited);
    }

    private isUnionOfTypeOnlyFunction(unionType: arkts.ETSUnionType, visited: Set<string>): boolean {
        const types = unionType.types;
        for (const type of types) {
            if (this.isFunctionType(type, new Set(visited))) {
                return true;
            }
        }
        return false;
    }

    private reportIllegalFunctionError(member: arkts.ClassProperty): void {
        if (member.key && arkts.isIdentifier(member.key)) {
            const propertyName = member.key.name.toString();
            const decorateNameProxy = V1Decorators.find(decoratorName => {
                return findDecorator(member, decoratorName);
            });
            if (this.hasDecoratorWithFunctionType(member, V1Decorators) && decorateNameProxy) {
                this.report({
                    node: member,
                    message: this.messages.IllegalFunction,
                    data: {
                        decorateNameProxy: decorateNameProxy,
                        propertyName: propertyName,
                    },
                });
            }
        }
    }
}

export default StructV1DecoratorFunctionRule;
