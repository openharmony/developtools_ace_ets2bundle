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
import { DecoratorNames } from '../common/predefines';

export class EmitTransformer extends AbstractVisitor {
    constructor(private options?: interop.EmitTransformerOptions) {
        super();
    }

    processComponent(node: arkts.ClassDeclaration): arkts.ClassDeclaration {
        const className = node.definition?.ident?.name;
        if (!className) {
            throw 'Non Empty className expected for Component';
        }

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

    processConsume(node: arkts.ClassProperty): arkts.ClassProperty {
        const annotations: readonly arkts.AnnotationUsage[] = node.annotations;
        annotations.forEach((anno)=>{
            const value = getAnnotationValue(anno, DecoratorNames.CONSUME);
            if (arkts.isIdentifier(node.key)) {
                const property = anno.properties[0] as arkts.ClassProperty;
                anno.setProperties([
                    arkts.factory.updateClassProperty(
                        property,
                        arkts.factory.createIdentifier('value'),
                        value ? property.value : arkts.factory.createStringLiteral(node.key.name),
                        property.typeAnnotation,
                        property.modifiers,
                        false,
                        property.annotations
                    )
                ]);
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
            if (!allowOverrideProp || !aliasProp) continue;
            const aliasValue = aliasProp.value && arkts.isStringLiteral(aliasProp.value) ? aliasProp.value.str : '';
            const allowOverrideValue = allowOverrideProp.value && arkts.isBooleanLiteral(allowOverrideProp.value) ? allowOverrideProp.value.value : false;
            if (allowOverrideValue) {
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
            } else {
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
            }
        }
        return node;
    }


    processClassProperty(node: arkts.ClassProperty): arkts.ClassProperty {
        if (hasDecorator(node, DecoratorNames.PROVIDE)) {
            return this.processProvide(node);
        } else if (hasDecorator(node, DecoratorNames.CONSUME)) {
            return this.processConsume(node);
        }
        return node;
    }


    visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
        const node = this.visitEachChild(beforeChildren);
        if (arkts.isClassDeclaration(node) && node.definition?.isFromStruct) {
            return this.processComponent(node);
        } else if (arkts.isClassProperty(node)) {
            return this.processClassProperty(node);
        }
        return node;
    }
}
