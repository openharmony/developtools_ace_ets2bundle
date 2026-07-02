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
import { AbstractVisitor, VisitorOptions } from '../../common/abstract-visitor';
import { InteroperAbilityNames, InteropInternalNames } from './predefines';
import { collectCustomComponentScopeInfo, getCustomComponentOptionsName } from '../utils';
import { factory as UIFactory } from '../ui-factory';
import { factory as StructFactory } from '../struct-translators/factory';
import { factory as EntryFactory } from '../entry-translators/factory';
import { ImportCollector } from '../../common/import-collector';
import { MetaDataCollector } from '../../common/metadata-collector';
import { isExported } from '../../common/arkts-utils';

interface LegacyTransformerOptions extends VisitorOptions {
    structList?: string[];
}

type ScopeInfo = {
    name: string;
    isDecl: boolean;
    isEntry?: boolean;
    isComponent?: boolean;
    isReusable?: boolean;
};

export class LegacyTransformer extends AbstractVisitor {
    private structList: string[] = [];
    private structInnerClassCollection: arkts.ClassDeclaration[] = [];
    private scopeInfos: ScopeInfo[] = [];

    constructor(options?: LegacyTransformerOptions) {
        const _options: LegacyTransformerOptions = options ?? {};
        super(_options);
        this.structList = _options.structList ?? [];
    }

    init(): void {
        MetaDataCollector.getInstance()
            .setAbsName(this.program?.absoluteName)
            .setExternalSourceName(this.externalSourceName)
            .setIsDeclaration(this.isDeclaration);
    }

    reset(): void {
        super.reset();
        this.structInnerClassCollection = [];
        this.scopeInfos = [];
    }

    createParam(name: string, type: string, isOptional = false): arkts.ETSParameterExpression {
        return arkts.factory.createETSParameterExpression(
            arkts.factory.createIdentifier(
                name,
                arkts.factory.createETSTypeReference(
                    arkts.factory.createETSTypeReferencePart(arkts.factory.createIdentifier(type))
                )
            ),
            isOptional,
            undefined,
        );
    }

    generateMember(map: Map<string, arkts.TypeNode>): arkts.ClassProperty[] {
        const properties: arkts.ClassProperty[] = [];

        map.forEach((value, key) => {
            const property = arkts.factory.createClassProperty(
                arkts.factory.createIdentifier(key),
                undefined,
                value,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_OPTIONAL,
                false
            );

            properties.push(property);
        });

        return properties;
    }

    generateComponentInnerClass(
        name: string,
        modifiers: arkts.Es2pandaModifierFlags,
        structMembersMap: Map<string, arkts.TypeNode>,
        isDecl?: boolean
    ): arkts.ClassDeclaration {
        const ctor = EntryFactory.generateConstructor(isDecl);
        const definition: arkts.ClassDefinition = arkts.factory
            .createClassDefinition(
                arkts.factory.createIdentifier(getCustomComponentOptionsName(name)),
                undefined,
                undefined,
                [],
                undefined,
                undefined,
                [...(this.generateMember(structMembersMap) || []), ctor],
                arkts.Es2pandaClassDefinitionModifiers.CLASS_DEFINITION_MODIFIERS_CLASS_DECL |
                    arkts.Es2pandaClassDefinitionModifiers.CLASS_DEFINITION_MODIFIERS_DECLARATION |
                    arkts.Es2pandaClassDefinitionModifiers.CLASS_DEFINITION_MODIFIERS_ID_REQUIRED,
                modifiers
            )
            .setCtor(ctor);
        const newClass = arkts.factory.createClassDeclaration(definition);
        newClass.modifierFlags = modifiers;
        return newClass;
    }

    createInstantiateMethod(definition: arkts.ClassDefinition, isDecl: boolean): arkts.MethodDefinition {
        const name = definition.ident?.name!;
        return StructFactory.createInvokeMethod(name, isDecl, true);
    }

    processComponent(node: arkts.ETSStructDeclaration, scopeInfo: ScopeInfo): arkts.ClassDeclaration {
        const definition: arkts.ClassDefinition = node.definition!;
        const ident = definition.ident!;
        const hasExportFlag =
            (node.modifierFlags & arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_EXPORT) ===
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_EXPORT;
        if (hasExportFlag) {
            this.structList.push(ident.name);
        }

        const instantiate = this.createInstantiateMethod(definition, scopeInfo.isDecl);

        const newDefinition = arkts.ClassDefinition.update3ClassDefinition(
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
            arkts.Es2pandaLanguage.LANGUAGE_JS,
            definition.annotations
        );

        const _node = arkts.factory.createClassDeclaration(newDefinition);
        _node.modifierFlags = node.modifierFlags;
        return _node;
    }

    processConstructor(node: arkts.MethodDefinition): arkts.MethodDefinition {
        const valueType = arkts.factory.createETSTypeReference(
            arkts.factory.createETSTypeReferencePart(arkts.factory.createIdentifier('Any'))
        );
        const script = UIFactory.createScriptFunction({
            key: node.id?.clone(),
            body: undefined,
            params: [
                arkts.factory
                    .createETSParameterExpression(
                        arkts.factory.createIdentifier(InteropInternalNames.PARENT, valueType),
                        true,
                        undefined
                    ),
                arkts.factory
                    .createETSParameterExpression(
                        arkts.factory.createIdentifier(InteropInternalNames.PARAM, valueType),
                        true,
                        undefined
                    ),
                arkts.factory
                    .createETSParameterExpression(arkts.factory.createIdentifier('localStorage', valueType), true, undefined),
                arkts.factory
                    .createETSParameterExpression(
                        arkts.factory.createIdentifier(InteropInternalNames.ELMTID, valueType),
                        true,
                        undefined
                    ),
                arkts.factory
                    .createETSParameterExpression(
                        arkts.factory.createIdentifier(InteropInternalNames.PARAMSLAMBDA, valueType),
                        true,
                        undefined
                    ),
                arkts.factory
                    .createETSParameterExpression(
                        arkts.factory.createIdentifier(InteropInternalNames.EXTRAINFO, valueType),
                        true,
                        undefined
                    ),
            ],
            flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_CONSTRUCTOR,
            modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | 
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE,
        });
        const scriptExpr = arkts.factory.createFunctionExpression(node.id?.clone(), script)
        return arkts.factory.updateMethodDefinition(node, node.kind, node.id, scriptExpr, node.modifierFlags, false);
    }

    collectComponentMembers(node: arkts.ETSStructDeclaration, className: string): Map<string, arkts.TypeNode> {
        const result: Map<string, arkts.TypeNode> = new Map();
        node.definition?.body.map((it) => {
            if (arkts.isClassProperty(it)) {
                const name = (it.key as arkts.Identifier).name;
                const type = it.typeAnnotation!;
                result.set(name, type);
            }
        });
        return result;
    }

    processETSModule(node: arkts.ETSModule): arkts.ETSModule {
        let newNode: arkts.ETSModule = node;
        let updateStatements: arkts.Statement[] = [];
        if (this.structInnerClassCollection.length > 0) {
            updateStatements.push(...this.structInnerClassCollection);
            newNode = arkts.factory.updateETSModule(newNode, [...newNode.statements, ...updateStatements]);
            this.structInnerClassCollection = [];
        }
        if (ImportCollector.getInstance().importInfos.length > 0) {
            let imports = ImportCollector.getInstance().getImportStatements();
            newNode = arkts.factory.updateETSModule(newNode, [...imports, ...newNode.statements]);
            ImportCollector.getInstance().clearImports();
        }
        return newNode;
    }

    enterStruct(node: arkts.ETSStructDeclaration): void {
        const definition = node.definition;
        if (!definition.ident) {
            return;
        }
        const isComponent = node.definition.annotations.some(
            (annotation) => 
                annotation.expr instanceof arkts.Identifier &&
                (annotation.expr.name === 'Component' || annotation.expr.name === 'ComponentV2')
        );
        const scopeInfo: ScopeInfo = { 
            name: definition.ident.name, 
            isComponent: isComponent,
            isDecl: MetaDataCollector.getInstance().isDeclaration ||
                arkts.hasModifierFlag(definition, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE)
        };
        this.scopeInfos.push(scopeInfo);
    }

    exitStruct(node: arkts.ETSStructDeclaration): void {
        if (!node.definition || !node.definition.ident || this.scopeInfos.length === 0) {
            return;
        }
        if (this.scopeInfos[this.scopeInfos.length - 1]?.name === node.definition.ident.name) {
            this.scopeInfos.pop();
        }
    }

    handleWrappedBuilderNode(node: arkts.ETSTypeReference): arkts.ETSTypeReference {
        if (
            node.part &&
            arkts.isETSTypeReferencePart(node.part) &&
            node.part.name &&
            arkts.isIdentifier(node.part.name) &&
            node.part.name.name === 'WrappedBuilder'
        ) {
            return arkts.factory.createETSTypeReference(
                arkts.factory.createETSTypeReferencePart(arkts.factory.createIdentifier('Any'))
            );
        }
        return node;
    }

    // handle WrappedBuilder
    handleWrappedBuilder(node: arkts.VariableDeclarator): arkts.VariableDeclarator {
        if (arkts.isIdentifier(node.id) && node.id.typeAnnotation) {
            let typeAnnotation = node.id.typeAnnotation;
            // WrappedBuilder<[aa]>[] => Any[]
            if (
                arkts.isTSArrayType(typeAnnotation) &&
                typeAnnotation.elementType &&
                arkts.isETSTypeReference(typeAnnotation.elementType)
            ) {
                return arkts.factory.updateVariableDeclarator(
                    node,
                    node.flag,
                    arkts.factory.updateIdentifier(
                        node.id,
                        node.id.name,
                        arkts.TSArrayType.updateTSArrayType(
                            typeAnnotation,
                            this.handleWrappedBuilderNode(typeAnnotation.elementType)
                        )
                    ),
                    node.init
                );
            }
            // WrappedBuilder<[aa]> => Any
            if (arkts.isETSTypeReference(typeAnnotation)) {
                return arkts.factory.updateVariableDeclarator(
                    node,
                    node.flag,
                    arkts.factory.updateIdentifier(
                        node.id,
                        node.id.name,
                        this.handleWrappedBuilderNode(typeAnnotation)
                    ),
                    node.init
                );
            }
        }
        return node;
    }

    visitor(node: arkts.AstNode): arkts.AstNode {
        if (arkts.isETSStructDeclaration(node)) {
            this.enterStruct(node);
        }
        const newNode = this.visitEachChild(node);
        if (arkts.isETSModule(newNode)) {
            return this.processETSModule(newNode);
        }
        if (arkts.isETSStructDeclaration(newNode) && this.scopeInfos.length > 0) {
            const scopeInfo = this.scopeInfos[this.scopeInfos.length - 1]!;
            const definition = newNode.definition!;
            if (definition.ident?.name === scopeInfo.name) {
                const className = scopeInfo.name;
                const memberMap = this.collectComponentMembers(newNode, className);
                const innerClass = this.generateComponentInnerClass(
                    className,
                    StructFactory.copyStructModifierFlagsToOptionsInnerClass(
                        newNode.modifierFlags, 
                        isExported(this.program, newNode)
                    ),
                    memberMap,
                    scopeInfo.isDecl
                )
                this.structInnerClassCollection.push(innerClass);
                const updateNode = this.processComponent(newNode, scopeInfo);
                this.exitStruct(newNode);
                return updateNode;
            }
            return newNode;
        }
        if (
            this.scopeInfos.length > 0 &&
            this.scopeInfos[this.scopeInfos.length - 1].isComponent === true &&
            arkts.isMethodDefinition(newNode)
        ) {
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
