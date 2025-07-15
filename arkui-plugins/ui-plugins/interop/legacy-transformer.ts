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
import { getInteropPath } from '../../path';
const interop = require(getInteropPath());
const nullptr = interop.nullptr;
import { AbstractVisitor, VisitorOptions } from '../../common/abstract-visitor';
import { InteroperAbilityNames } from './predefines';
import { getCustomComponentOptionsName } from '../utils';
import { factory } from '../ui-factory';

interface LegacyTransformerOptions extends VisitorOptions {
    structList?: string[]
}

type ScopeInfo = {
    name: string;
    isEntry?: boolean;
    isComponent?: boolean;
    isReusable?: boolean;
};

export class LegacyTransformer extends AbstractVisitor {
    private structList: string[] = [];
    private componentInterfaceCollection: arkts.TSInterfaceDeclaration[] = [];
    private scopeInfos: ScopeInfo[] = [];

    constructor(options?: LegacyTransformerOptions) {
        const _options: LegacyTransformerOptions = options ?? {};
        super(_options);
        this.structList = _options.structList ?? [];
    }

    // TODO: check reset
    reset(): void {
        super.reset();
        this.structList = [];
        this.componentInterfaceCollection = [];
        this.scopeInfos = [];
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

        if (arkts.isStructDeclaration(node)) {
            const _node = arkts.factory.createClassDeclaration(newDefinition);
            _node.modifiers = node.modifiers;
            return _node;
        } else {
            return arkts.factory.updateClassDeclaration(node, newDefinition);
        }
    }

    processConstructor(node: arkts.MethodDefinition): arkts.MethodDefinition {
        const valueType = arkts.factory.createUnionType([
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(
                    arkts.factory.createIdentifier('Object')
                )
            ),
            arkts.factory.createETSUndefinedType()
        ]);
        const script = factory.createScriptFunction({
            body: arkts.factory.createBlock([]),
            params: [
                arkts.factory.createParameterDeclaration(
                    arkts.factory.createIdentifier(InteroperAbilityNames.PARENT, valueType),
                    undefined,
                ),
                arkts.factory.createParameterDeclaration(
                    arkts.factory.createIdentifier(InteroperAbilityNames.PARAM, valueType),
                    undefined,
                ),
                arkts.factory.createParameterDeclaration(
                    arkts.factory.createIdentifier('localStorage', valueType),
                    undefined,
                ),
                arkts.factory.createParameterDeclaration(
                    arkts.factory.createIdentifier(InteroperAbilityNames.ELMTID, valueType),
                    undefined,
                ),
                arkts.factory.createParameterDeclaration(
                    arkts.factory.createIdentifier(InteroperAbilityNames.PARAMSLAMBDA, valueType),
                    undefined,
                ),
                arkts.factory.createParameterDeclaration(
                    arkts.factory.createIdentifier(InteroperAbilityNames.EXTRAINFO, valueType),
                    undefined,
                )
            ],
            flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_CONSTRUCTOR,
            modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
        })
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

    enter(node: arkts.AstNode): void {
        if (arkts.isStructDeclaration(node) && !!node.definition.ident) {
            const scopeInfo: ScopeInfo = { name: node.definition.ident.name };
            this.scopeInfos.push(scopeInfo);
        }
    }

    exit(node: arkts.AstNode): void {
        if (arkts.isStructDeclaration(node) || arkts.isClassDeclaration(node)) {
            if (!node.definition || !node.definition.ident || this.scopeInfos.length === 0) {
                return;
            }
            if (this.scopeInfos[this.scopeInfos.length - 1]?.name === node.definition.ident.name) {
                this.scopeInfos.pop();
            }
        }
    }

    handleWrappedBuilderNode(node: arkts.ETSTypeReference): arkts.ETSTypeReference {
        if (node.part && arkts.isETSTypeReferencePart(node.part) && node.part.name &&
            arkts.isIdentifier(node.part.name) && node.part.name.name === 'WrappedBuilder') {
            return arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(
                    arkts.factory.createIdentifier('Any')
                )
            );
        }
        return node;
    }

    // handle WrappedBuilder
    handleWrappedBuilder(node: arkts.VariableDeclarator): arkts.VariableDeclarator {
        if (arkts.isIdentifier(node.name) && node.name.typeAnnotation) {
            let typeAnnotation = node.name.typeAnnotation;
            // WrappedBuilder<[aa]>[] => Any[]
            if (arkts.isTSArrayType(typeAnnotation) && typeAnnotation.elementType &&
                arkts.isETSTypeReference(typeAnnotation.elementType)) {
                return arkts.factory.updateVariableDeclarator(
                    node,
                    node.flag,
                    arkts.factory.updateIdentifier(
                        node.name,
                        node.name.name,
                        arkts.TSArrayType.updateTSArrayType(
                            typeAnnotation,
                            this.handleWrappedBuilderNode(typeAnnotation.elementType)
                        )
                    ),
                    node.initializer
                );
            }
            // WrappedBuilder<[aa]> => Any
            if (arkts.isETSTypeReference(typeAnnotation)) {
                return arkts.factory.updateVariableDeclarator(
                    node,
                    node.flag,
                    arkts.factory.updateIdentifier(
                        node.name,
                        node.name.name,
                        this.handleWrappedBuilderNode(typeAnnotation)
                    ),
                    node.initializer
                );
            }
        }
        return node;
    }

    visitor(node: arkts.AstNode): arkts.AstNode {
        this.enter(node);
        const newNode = this.visitEachChild(node);
        if (arkts.isEtsScript(newNode)) {
            return this.processEtsScript(newNode);
        }
        if (arkts.isStructDeclaration(newNode)) {
            const definition = newNode.definition!;
            const annotations = definition.annotations;
            if (annotations.some(annotation => annotation instanceof arkts.Identifier && annotation.name === 'Component')) {
                return newNode;
            }
            const className = newNode.definition?.ident?.name!;
            const memberMap = this.collectComponentMembers(newNode as arkts.StructDeclaration, className);
            this.componentInterfaceCollection.push(this.generateComponentInterface(className, node.modifiers, memberMap));
            const updateNode = this.processComponent(newNode);
            this.exit(newNode);
            return updateNode;
        }
        if (this.scopeInfos.length > 0 && arkts.isMethodDefinition(newNode)) {
            const kind = newNode.kind;
            if (kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_CONSTRUCTOR) {
                const updateNode = this.processConstructor(newNode);
                return updateNode;
            }
        }
        if (arkts.isVariableDeclarator(newNode)) {
            return this.handleWrappedBuilder(newNode);
        }
        return newNode;
    }
}