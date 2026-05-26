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

import { AbstractVisitor } from '../common/abstract-visitor';

import { debugLog } from '../common/debug';
import { hasDecorator, getAnnotationValue } from '../ui-plugins/property-translators/utils'
import { DecoratorNames, DeprecatedDecoratorNames, StructDecoratorNames, GlobalReusePoolNames } from '../common/predefines';

export class EmitTransformer extends AbstractVisitor {
    constructor(private options?: interop.EmitTransformerOptions) {
        super();
    }

    processComponent(node: arkts.ClassDeclaration): arkts.ClassDeclaration {
        const className = node.definition?.ident?.name;
        if (!className) {
            throw 'Non Empty className expected for Component';
        }

        this.transformReusePoolInAnnotations(node.definition!);

        const newDefinition = arkts.factory.updateClassDefinition(
            node.definition,
            node.definition?.ident,
            undefined,
            undefined,
            node.definition?.implements,
            undefined,
            undefined,
            node.definition?.body,
            node.definition?.modifiers,
            arkts.classDefinitionFlags(node.definition) | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            node.definition.annotations
        );

        let newDec: arkts.ClassDeclaration = arkts.factory.updateClassDeclaration(node, newDefinition);

        debugLog(`DeclTransformer:checked:struct_ast:${newDefinition.dumpJson()}`);
        newDec.modifiers = node.modifiers;
        return newDec;
    }

    private transformReusePoolInAnnotations(definition: arkts.ClassDefinition): void {
        const annotations = definition.annotations;
        if (!annotations || annotations.length === 0) {
            return;
        }
        for (const anno of annotations) {
            if (!anno.expr || !arkts.isIdentifier(anno.expr)) {
                continue;
            }
            const annoName = anno.expr.name;
            if (annoName !== StructDecoratorNames.COMPONENT && annoName !== StructDecoratorNames.COMPONENT_V2) {
                continue;
            }
            const reusePoolProp = this.getClassPropByName(anno, GlobalReusePoolNames.REUSE_POOL);
            const poolAcceptsProp = this.getClassPropByName(anno, GlobalReusePoolNames.POOL_ACCEPTS);
            if (!reusePoolProp || !reusePoolProp.value || !poolAcceptsProp) {
                continue;
            }
            const value = reusePoolProp.value;
            if (!arkts.isMemberExpression(value) || !arkts.isIdentifier(value.property)) {
                continue;
            }
            const poolOwnership = value.property.name;
            const freezeProp = arkts.factory.createClassProperty(
                arkts.factory.createIdentifier('freezeWhenInactive'),
                arkts.factory.createBooleanLiteral(true),
                undefined,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
                false
            );
            if (poolOwnership === GlobalReusePoolNames.REUSE_POOL_OWNERSHIP_OFF) {
                anno.setProperties([freezeProp]);
                continue;
            }
            const reusePoolStr = poolOwnership === 'SHARED' ? 'shared' : 'perInstance';
            const updatedReusePoolProp = arkts.factory.updateClassProperty(
                reusePoolProp,
                reusePoolProp.key,
                arkts.factory.createStringLiteral(reusePoolStr),
                reusePoolProp.typeAnnotation,
                reusePoolProp.modifiers,
                false
            );
            const updatedPoolAcceptsProp = this.transformPoolAccepts(poolAcceptsProp);
            anno.setProperties([
                ...anno.properties.map((p) => p === reusePoolProp ? updatedReusePoolProp : p === poolAcceptsProp ? updatedPoolAcceptsProp : p),
                freezeProp
            ]);
        }
    }

    private transformPoolAccepts(poolAcceptsProp: arkts.ClassProperty): arkts.ClassProperty {
        const value = poolAcceptsProp.value;
        if (!value || !arkts.isArrayExpression(value)) {
            return poolAcceptsProp;
        }
        const newElements = value.elements.map((elem) => {
            if (arkts.isStringLiteral(elem)) {
                return arkts.factory.createIdentifier(elem.str);
            }
            return elem;
        });
        const newArray = arkts.factory.createArrayExpression(newElements);
        return arkts.factory.updateClassProperty(
            poolAcceptsProp,
            poolAcceptsProp.key,
            newArray,
            poolAcceptsProp.typeAnnotation,
            poolAcceptsProp.modifiers,
            false
        );
    }

    processAlias(node: arkts.ClassProperty, decoratorName: DecoratorNames): arkts.ClassProperty {
        const annotations: readonly arkts.AnnotationUsage[] = node.annotations;
        annotations.forEach((anno) => {
            const value = getAnnotationValue(anno, decoratorName);
            if (!!node.key && arkts.isIdentifier(node.key)) {
                const property = anno.properties[0];
                if (property === undefined || !arkts.isClassProperty(property)) {
                    anno.setProperties([
                        arkts.factory.createClassProperty(
                            arkts.factory.createIdentifier('value'),
                            arkts.factory.createStringLiteral(node.key.name),
                            undefined,
                            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
                            false
                        )
                    ]);
                } else {
                    anno.setProperties([
                        arkts.factory.updateClassProperty(
                            property,
                            arkts.factory.createIdentifier('value'),
                            value ? property.value : arkts.factory.createStringLiteral(node.key.name),
                            property.typeAnnotation,
                            property.modifiers,
                            false
                        )
                    ]);
                }
            }
        })
        return node;
    }

    getClassPropByName(anno: arkts.AnnotationUsage, name: string): arkts.ClassProperty | undefined {
        return anno.properties.find (
            (p): p is arkts.ClassProperty =>
            arkts.isClassProperty(p) &&
            p.key != null &&
            arkts.isIdentifier(p.key) &&
            p.key.name === name
        );
    }


    processProvide(node: arkts.ClassProperty): arkts.ClassProperty {
        for (const anno of node.annotations ?? []) {
            const allowOverrideProp = this.getClassPropByName(anno, 'allowOverride');
            const aliasProp = this.getClassPropByName(anno, 'alias');
            if (!allowOverrideProp && !aliasProp) { 
                continue;
            }
            const aliasValue = aliasProp && aliasProp.value && arkts.isStringLiteral(aliasProp.value) ? aliasProp.value.str : '';
            const allowOverrideValue = allowOverrideProp && allowOverrideProp.value && arkts.isBooleanLiteral(allowOverrideProp.value) ? allowOverrideProp.value.value : false;
            if (allowOverrideValue && allowOverrideProp) {
                anno.setProperties([
                    arkts.factory.updateClassProperty(
                        allowOverrideProp,
                        allowOverrideProp.key,
                        arkts.factory.createStringLiteral(aliasValue),
                        allowOverrideProp.typeAnnotation,
                        allowOverrideProp.modifiers,
                        false,
                        allowOverrideProp.annotations
                    )
                ]);
            } else if (aliasProp) {
                anno.setProperties([
                    arkts.factory.updateClassProperty(
                        aliasProp,
                        arkts.factory.createIdentifier('value'),
                        aliasProp.value,
                        aliasProp.typeAnnotation,
                        aliasProp.modifiers,
                        false,
                        aliasProp.annotations
                    )
                ]);
            } else {
                anno.setProperties([]);
            }
        }
        return node;
    }

    private refMap = new Map<string, string>([
        [DecoratorNames.PROP_REF, DeprecatedDecoratorNames.PROP],
        [DecoratorNames.STORAGE_PROP_REF, DeprecatedDecoratorNames.STORAGE_PROP],
        [DecoratorNames.LOCAL_STORAGE_PROP_REF, DeprecatedDecoratorNames.LOCAL_STORAGE_PROP],
    ]);

    private processRefDecorators(node: arkts.ClassProperty): arkts.ClassProperty {
        const updatedAnnos = node.annotations.map((anno) => {
            if (anno.expr && arkts.isIdentifier(anno.expr)) {
                const target = this.refMap.get(anno.expr.name);
                if (target) {
                    return arkts.AnnotationUsage.update1AnnotationUsage(
                    anno,
                    arkts.factory.updateIdentifier(anno.expr, target),
                    anno.properties
                    );
                }
            }
            return anno;
        });
        node.setAnnotations(updatedAnnos);
        return node;
    }

    processClassProperty(node: arkts.ClassProperty): arkts.ClassProperty {
        if (hasDecorator(node, DecoratorNames.PROVIDE)) {
            return this.processProvide(node);
        } else if (hasDecorator(node, DecoratorNames.PROVIDER) || hasDecorator(node, DecoratorNames.CONSUME) || hasDecorator(node, DecoratorNames.CONSUMER)) {
            const aliasDecorator = hasDecorator(node, DecoratorNames.PROVIDER) ? DecoratorNames.PROVIDER
                : hasDecorator(node, DecoratorNames.CONSUME) ? DecoratorNames.CONSUME : DecoratorNames.CONSUMER;
            return this.processAlias(node, aliasDecorator);
        } else if (
            hasDecorator(node, DecoratorNames.PROP_REF) ||
            hasDecorator(node, DecoratorNames.STORAGE_PROP_REF) ||
            hasDecorator(node, DecoratorNames.LOCAL_STORAGE_PROP_REF)
            ) {
                return this.processRefDecorators(node);
            }
        return node;
    }

    processMethodDefinition(node: arkts.MethodDefinition): arkts.MethodDefinition {
        if (hasDecorator(node, DecoratorNames.MONITOR) || hasDecorator(node, DecoratorNames.COMPUTED)){
            node.scriptFunction.setAnnotations([]);
        }
        return node;
    }

    visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
        const node = this.visitEachChild(beforeChildren);
        if (arkts.isClassDeclaration(node) && node.definition?.isFromStruct) {
            return this.processComponent(node);
        } else if (arkts.isClassProperty(node)) {
            return this.processClassProperty(node);
        } else if (arkts.isMethodDefinition(node)) {
            return this.processMethodDefinition(node);
        }
        return node;
    }
}
