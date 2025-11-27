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
import { InteroperAbilityNames, InteropInternalNames } from './predefines';
import { getCustomComponentOptionsName } from '../utils';
import { factory } from '../ui-factory';
import { createAndInsertImportDeclaration } from '../../common/arkts-utils';

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
        this.componentInterfaceCollection = [];
        this.scopeInfos = [];
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

    createParamsForInstatiate(name: string): arkts.ETSParameterExpression[] {
        const paramInitializers: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(
                InteroperAbilityNames.INITIALIZERS,
                factory.createTypeReferenceFromString('__Options_' + name)
            ),
            undefined
        );
        paramInitializers.setOptional(true);
        const paramStorage: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(
                InteroperAbilityNames.STORAGE,
                factory.createTypeReferenceFromString('LocalStorage')
            ),
            undefined
        );
        paramStorage.setOptional(true);
        const paramContent: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(
                InteroperAbilityNames.CONTENT,
                factory.createLambdaFunctionType()
            ),
            undefined
        );
        paramContent.setOptional(true);
        paramContent.annotations = [
            arkts.factory.createAnnotationUsage(
                arkts.factory.createIdentifier('Builder')
            )
        ];
        return [paramInitializers, paramStorage, paramContent];
    }

    createInstantiateMethod(definition: arkts.ClassDefinition): arkts.MethodDefinition {
        const name = definition.ident?.name!;
        const isDecl: boolean = arkts.hasModifierFlag(definition, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE);
        const modifiers =
            arkts.classDefinitionFlags(definition) |
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC |
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC;
        const body = isDecl ? undefined : arkts.factory.createBlock([arkts.factory.createReturnStatement()]);
        const params = this.createParamsForInstatiate(name);      
        const returnTypeAnnotation = factory.createTypeReferenceFromString('Object');
        const flags = arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD;
        const kind = arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD;
        const key = arkts.factory.createIdentifier(InteroperAbilityNames.INVOKE);

        return factory.createMethodDefinition({
            key,
            kind,
            function: {
                key,
                body,
                params: params,
                returnTypeAnnotation,
                flags,
                modifiers,
            },
            modifiers,
        });
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

        const instantiate = this.createInstantiateMethod(definition);

        const newDefinition = arkts.factory.updateClassDefinition(
            definition,
            definition.ident,
            definition.typeParams,
            definition.superTypeParams,
            definition.implements,
            undefined,
            definition.super,
            [...definition.body, instantiate],
            definition.modifiers,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            arkts.Es2pandaLanguage.JS
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
                    arkts.factory.createIdentifier(InteropInternalNames.PARENT, valueType),
                    undefined,
                ).setOptional(true),
                arkts.factory.createParameterDeclaration(
                    arkts.factory.createIdentifier(InteropInternalNames.PARAM, valueType),
                    undefined,
                ).setOptional(true),
                arkts.factory.createParameterDeclaration(
                    arkts.factory.createIdentifier('localStorage', valueType),
                    undefined,
                ).setOptional(true),
                arkts.factory.createParameterDeclaration(
                    arkts.factory.createIdentifier(InteropInternalNames.ELMTID, valueType),
                    undefined,
                ).setOptional(true),
                arkts.factory.createParameterDeclaration(
                    arkts.factory.createIdentifier(InteropInternalNames.PARAMSLAMBDA, valueType),
                    undefined,
                ).setOptional(true),
                arkts.factory.createParameterDeclaration(
                    arkts.factory.createIdentifier(InteropInternalNames.EXTRAINFO, valueType),
                    undefined,
                ).setOptional(true),
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

    createBuilderImport(): void {
        if (!this.program) {
            throw new Error('Failed to insert import: Transformer has no program');
        }
        const source = arkts.factory.createStringLiteral('@ohos.arkui.component');
        const imported = arkts.factory.createIdentifier('Builder');
        createAndInsertImportDeclaration(
            source,
            imported,
            imported,
            arkts.Es2pandaImportKinds.IMPORT_KINDS_VALUE,
            this.program
        );
    }

    processEtsScript(node: arkts.EtsScript): arkts.EtsScript {
        this.createBuilderImport();
        let updateStatements: arkts.AstNode[] = [];
        if (this.componentInterfaceCollection.length > 0) {
            updateStatements.push(...this.componentInterfaceCollection);
            return arkts.factory.updateEtsScript(node, [...node.statements, ...updateStatements]);
        }
        return node;
    }

    enter(node: arkts.AstNode): void {
        if ((arkts.isStructDeclaration(node) || arkts.isClassDeclaration(node)) && !!node.definition.ident) {
            const isComponent = node.definition.annotations.some(annotation => annotation.expr instanceof arkts.Identifier &&
                (annotation.expr.name === 'Component' || annotation.expr.name === 'ComponentV2'));
            const scopeInfo: ScopeInfo = { name: node.definition.ident.name, isComponent: isComponent};
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
        if (arkts.isStructDeclaration(newNode) || arkts.isClassDeclaration(newNode)) {
            const definition = newNode.definition!;
            const annotations = definition.annotations;
            if (annotations.some(annotation => annotation.expr instanceof arkts.Identifier &&
                (annotation.expr.name === 'Component' || annotation.expr.name === 'ComponentV2'))) {
                const className = newNode.definition?.ident?.name!;
                const memberMap = this.collectComponentMembers(newNode as arkts.StructDeclaration, className);
                this.componentInterfaceCollection.push(this.generateComponentInterface(className, node.modifiers, memberMap));
                const updateNode = this.processComponent(newNode);
                this.exit(newNode);
                return updateNode;
            }
            return newNode;
        }
        if (this.scopeInfos.length > 0 && this.scopeInfos[this.scopeInfos.length - 1].isComponent === true &&
            arkts.isMethodDefinition(newNode)) {
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