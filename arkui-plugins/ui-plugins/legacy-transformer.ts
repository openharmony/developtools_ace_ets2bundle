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
import { getInteropPath } from '../path';
const interop = require(getInteropPath());
const nullptr = interop.nullptr;
import { AbstractVisitor, VisitorOptions } from '../common/abstract-visitor';
import { InteroperAbilityNames } from '../common/predefines';
import { getCustomComponentOptionsName } from './utils';

interface LegacyTransformerOptions extends VisitorOptions {
    structList?: string[]
}

export class LegacyTransformer extends AbstractVisitor {
    private structList: string[] = [];
    private componentInterfaceCollection: arkts.TSInterfaceDeclaration[] = [];

    constructor(options?: LegacyTransformerOptions) {
        const _options: LegacyTransformerOptions = options ?? {};
        super(_options);
        this.structList = _options.structList ?? [];
    }

    reset(): void {
        super.reset();
        this.componentInterfaceCollection = [];
    }

    getList(): string[] {
        return this.structList;
    }

    createParam(name: string, type: string): arkts.ETSParameterExpression {
        return arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(
                name,
                arkts.factory.createTypeReference(
                    arkts.factory.createTypeReferencePart(
                        arkts.factory.createIdentifier(type)
                    )
                )
            ),
            undefined
        );
    }

    createInteropMethod(name: string): arkts.MethodDefinition {
        const path = this.createParam('path', 'string');
        const line = this.createParam('line', 'number');
        line.setOptional(true);
        const col = this.createParam('col', 'number');
        col.setOptional(true);
        const options = this.createParam('options', getCustomComponentOptionsName(name));
        options.setOptional(true);

        const script = arkts.factory.createScriptFunction(
            arkts.factory.createBlock([]),
            arkts.FunctionSignature.createFunctionSignature(
                undefined,
                [path, line, col, options],
                arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                false
            ),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC
        );

        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            arkts.factory.createIdentifier('instantiate_Interop'),
            script,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC,
            false
        );
    }

    generateMember(map: Map<string, arkts.TypeNode>): arkts.ClassProperty[] {
        const properties: arkts.ClassProperty[] = [];
      
        map.forEach((value, key) => {
          const property = arkts.factory.createClassProperty(
            arkts.factory.createIdentifier(key),
            undefined,
            value,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | 
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_OPTIONAL,
            false
          );
          
          properties.push(property);
        });
      
        return properties;
      }

    generateComponentInterface(name: string, modifiers: number, map: Map<string, arkts.TypeNode>): arkts.TSInterfaceDeclaration {
        const interfaceNode = arkts.factory.createInterfaceDeclaration(
            [],
            arkts.factory.createIdentifier(getCustomComponentOptionsName(name)),
            nullptr,
            arkts.factory.createInterfaceBody([...(this.generateMember(map) || [])]),
            false,
            false
        );
        interfaceNode.modifiers = modifiers;
        return interfaceNode;
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

        const instantiate_Interop: arkts.MethodDefinition = this.createInteropMethod(ident.name);

        const newDefinition = arkts.factory.updateClassDefinition(
            definition,
            definition.ident,
            definition.typeParams,
            definition.superTypeParams,
            definition.implements,
            undefined,
            definition.super,
            [...definition.body, instantiate_Interop],
            definition.modifiers,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE
        );

        console.log('print legacyclass definition' + newDefinition.dumpSrc());


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
        const esvalue = arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(
                arkts.factory.createIdentifier(InteroperAbilityNames.ESVALUE)
            )
        );
        const script = arkts.factory.createScriptFunction(
            arkts.factory.createBlock([]),
            arkts.factory.createFunctionSignature(
                undefined,
                [
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier(InteroperAbilityNames.PARENT, esvalue),
                        undefined,
                    ),
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier(InteroperAbilityNames.PARAM, esvalue),
                        undefined,
                    ),
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier('localStorage', esvalue),
                        undefined,
                    ),
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier(InteroperAbilityNames.ELMTID, esvalue),
                        undefined,
                    ),
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier(InteroperAbilityNames.PARAMSLAMBDA, esvalue),
                        undefined,
                    ),
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier(InteroperAbilityNames.EXTRAINFO, esvalue),
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
            script,
            node.modifiers,
            false
        );
    }

    collectComponentMembers(node: arkts.StructDeclaration, className: string): Map<string, arkts.TypeNode> {
        const result: Map<string, arkts.TypeNode> = new Map();
        node.definition.body.map((it) => {
            if (arkts.isClassProperty(it)) {
                const name = (it.key as arkts.Identifier).name;
                const type = it.typeAnnotation!;
                result.set(name, type);
            }
        });
        return result;
    }

    processEtsScript(node: arkts.EtsScript): arkts.EtsScript {
        let updateStatements: arkts.AstNode[] = [];
        if (this.componentInterfaceCollection.length > 0) {
            updateStatements.push(...this.componentInterfaceCollection);
        }
        if (updateStatements.length > 0) {
            return arkts.factory.updateEtsScript(node, [...node.statements, ...updateStatements]);
        }
        return node;
    }

    visitor(node: arkts.AstNode): arkts.AstNode {
        const newNode = this.visitEachChild(node);
        if (arkts.isEtsScript(newNode)) {
            return this.processEtsScript(newNode);
        }
        if (arkts.isStructDeclaration(newNode)) {
            const className = node.definition?.ident?.name;
            const memberMap = this.collectComponentMembers(node as arkts.StructDeclaration, className);
            this.componentInterfaceCollection.push(this.generateComponentInterface(className, node.modifiers, memberMap));
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