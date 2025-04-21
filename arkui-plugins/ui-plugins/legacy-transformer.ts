/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
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
import { AbstractVisitor, VisitorOptions } from '../common/abstract-visitor';
import { InteroperAbilityNames } from '../common/predefines';

interface LegacyTransformerOptions extends VisitorOptions {
    structList?: string[]
}

export class LegacyTransformer extends AbstractVisitor {
    private structList: string[] = [];

    constructor(options?: LegacyTransformerOptions) {
        const _options: LegacyTransformerOptions = options ?? {};
        super(_options);
        this.structList = _options.structList ?? [];
    }

    getList(): string[] {
        return this.structList;
    }

    processComponent(node: arkts.StructDeclaration): arkts.StructDeclaration | arkts.ClassDeclaration {
        const definition: arkts.ClassDefinition = node.definition!;
        const ident = definition.ident!;
        const hasExportFlag =
            (node.modifiers & arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_EXPORT) ===
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_EXPORT;
        if (hasExportFlag) {
            this.structList.push(ident.name);
        }
        const newDefinition = arkts.factory.updateClassDefinition(
            definition,
            definition.ident,
            definition.typeParams,
            definition.superTypeParams,
            definition.implements,
            undefined,
            definition.super,
            [...definition.body],
            definition.modifiers,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE
        );

        //TODO: need check
        if (arkts.isStructDeclaration(node)) {
            const _node = arkts.factory.createClassDeclaration(newDefinition);
            _node.modifiers = node.modifiers;
            return _node;
        } else {
            return arkts.factory.updateClassDeclaration(node, newDefinition);
        }
    }

    processConstructor(node: arkts.MethodDefinition): arkts.MethodDefinition {
        const esobject = arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(
                arkts.factory.createIdentifier(InteroperAbilityNames.ESOBJECT)
            )
        );
        const script = arkts.factory.createScriptFunction(
            arkts.factory.createBlock([]),
            arkts.factory.createFunctionSignature(
                undefined,
                [
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier(InteroperAbilityNames.PARENT, esobject),
                        undefined,
                    ),
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier(InteroperAbilityNames.PARAM, esobject),
                        undefined,
                    ),
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier('localStorage', esobject),
                        undefined,
                    ),
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier(InteroperAbilityNames.ELMTID, esobject),
                        undefined,
                    ),
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier(InteroperAbilityNames.PARAMSLAMBDA, esobject),
                        undefined,
                    ),
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier(InteroperAbilityNames.EXTRAINFO, esobject),
                        undefined,
                    )
                ], undefined, false),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_CONSTRUCTOR,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
        );
        return arkts.factory.updateMethodDefinition(
            node,
            node.kind,
            node.name,
            arkts.factory.createFunctionExpression(script),
            node.modifiers,
            false
        );
    }

    visitor(node: arkts.AstNode): arkts.AstNode {
        const newNode = this.visitEachChild(node);
        if (arkts.isStructDeclaration(newNode)) {
            const updateNode = this.processComponent(newNode);
            return updateNode;
        }
        if (arkts.isMethodDefinition(newNode)) {
            const kind = newNode.kind;
            if (kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_CONSTRUCTOR) {
                const updateNode = this.processConstructor(newNode);
                return updateNode;
            }
        }
        return newNode;
    }
}