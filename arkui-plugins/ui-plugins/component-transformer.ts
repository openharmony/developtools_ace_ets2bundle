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
import {
    CustomComponentNames,
    getCustomComponentOptionsName,
    findLocalImport,
    CustomComponentInfo,
    collectCustomComponentScopeInfo,
    isComponentStruct,
} from './utils';
import { backingField, expectName, annotation, filterDefined, collect } from '../common/arkts-utils';
import { EntryWrapperNames, findEntryWithStorageInClassAnnotations } from './entry-translators/utils';
import { factory as entryFactory } from './entry-translators/factory';
import {
    hasDecoratorName,
    DecoratorNames,
    findDecoratorInfos,
    isDecoratorAnnotation,
    decoratorTypeMap,
    DecoratorIntrinsicNames,
} from './property-translators/utils';
import { factory } from './ui-factory';
import { factory as propertyFactory } from './property-translators/factory';
import { StructMap } from '../common/program-visitor';
import { generateTempCallFunction } from './interop';

export interface ComponentTransformerOptions extends VisitorOptions {
    arkui?: string;
}

type ScopeInfo = CustomComponentInfo;

export interface InteropContext {
    className: string;
    path: string;
    line?: number;
    col?: number;
    arguments?: arkts.ObjectExpression;
}

export class ComponentTransformer extends AbstractVisitor {
    private scopeInfos: ScopeInfo[] = [];
    private componentInterfaceCollection: arkts.TSInterfaceDeclaration[] = [];
    private entryNames: string[] = [];
    private readonly arkui?: string;
    private structMembersMap: Map<string, arkts.AstNode[]> = new Map();
    private isCustomComponentImported: boolean = false;
    private isEntryPointImported: boolean = false;
    private shouldAddLinkIntrinsic: boolean = false;
    private hasLegacy: boolean = false;
    private legacyStructMap: Map<string, StructMap> = new Map();
    private legacyCallMap: Map<string, string> = new Map();

    constructor(options?: ComponentTransformerOptions) {
        const _options: ComponentTransformerOptions = options ?? {};
        super(_options);
        this.arkui = _options.arkui;
    }

    reset(): void {
        super.reset();
        this.scopeInfos = [];
        this.componentInterfaceCollection = [];
        this.entryNames = [];
        this.structMembersMap = new Map();
        this.isCustomComponentImported = false;
        this.isEntryPointImported = false;
        this.shouldAddLinkIntrinsic = false;
        this.hasLegacy = false;
        this.legacyStructMap = new Map();
        this.legacyCallMap = new Map();
    }

    enter(node: arkts.AstNode) {
        if (arkts.isStructDeclaration(node) && !!node.definition.ident) {
            const info: ScopeInfo | undefined = collectCustomComponentScopeInfo(node);
            if (info) {
                this.scopeInfos.push(info);
            }
        }
        if (arkts.isETSImportDeclaration(node) && !this.isCustomComponentImported) {
            this.isCustomComponentImported = !!findLocalImport(
                node,
                CustomComponentNames.COMPONENT_DEFAULT_IMPORT,
                CustomComponentNames.COMPONENT_CLASS_NAME
            );
        }
        if (arkts.isETSImportDeclaration(node) && !this.isEntryPointImported) {
            this.isEntryPointImported = !!findLocalImport(
                node,
                EntryWrapperNames.ENTRY_DEFAULT_IMPORT,
                EntryWrapperNames.ENTRY_POINT_CLASS_NAME
            );
        }
    }

    exit(node: arkts.AstNode) {
        if (arkts.isStructDeclaration(node) || arkts.isClassDeclaration(node)) {
            if (!node.definition || !node.definition.ident || this.scopeInfos.length === 0) return;
            if (this.scopeInfos[this.scopeInfos.length - 1]?.name === node.definition.ident.name) {
                this.scopeInfos.pop();
            }
        }
    }

    createImportDeclaration(): void {
        const source: arkts.StringLiteral = arkts.factory.create1StringLiteral(
            this.arkui ?? CustomComponentNames.COMPONENT_DEFAULT_IMPORT
        );
        const imported: arkts.Identifier = arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_CLASS_NAME);
        // Insert this import at the top of the script's statements.
        if (!this.program) {
            throw Error('Failed to insert import: Transformer has no program');
        }
        factory.createAndInsertImportDeclaration(
            source,
            imported,
            imported,
            arkts.Es2pandaImportKinds.IMPORT_KINDS_VALUE,
            this.program
        );
    }

    processEtsScript(node: arkts.EtsScript): arkts.EtsScript {
        if (this.isExternal && this.componentInterfaceCollection.length === 0 && this.entryNames.length === 0) {
            return node;
        }
        const updateStatements: arkts.AstNode[] = [];
        if (this.shouldAddLinkIntrinsic) {
            const expr = arkts.factory.createIdentifier(DecoratorIntrinsicNames.LINK);
            updateStatements.push(factory.createIntrinsicAnnotationDeclaration({ expr }));
        }
        if (this.componentInterfaceCollection.length > 0) {
            if (!this.isCustomComponentImported) this.createImportDeclaration();
            updateStatements.push(...this.componentInterfaceCollection);
        }

        if (this.entryNames.length > 0) {
            if (!this.isEntryPointImported) entryFactory.createAndInsertEntryPointImport(this.program);
            // normally, we should only have at most one @Entry component in a single file.
            // probably need to handle error message here.
            updateStatements.push(...this.entryNames.map(entryFactory.generateEntryWrapper));
        }
        if (updateStatements.length > 0) {
            return arkts.factory.updateEtsScript(node, [...node.statements, ...updateStatements]);
        }
        return node;
    }

    createStaticMethod(definition: arkts.ClassDefinition): arkts.MethodDefinition {
        const param: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(
                CustomComponentNames.OPTIONS,
                arkts.factory.createTypeReference(
                    arkts.factory.createTypeReferencePart(
                        arkts.factory.createIdentifier(getCustomComponentOptionsName(definition.ident!.name))
                    )
                )
            ),
            undefined
        );

        const script = arkts.factory.createScriptFunction(
            arkts.factory.createBlock([arkts.factory.createReturnStatement()]),
            arkts.FunctionSignature.createFunctionSignature(
                undefined,
                [param],
                arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                false
            ),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC
        );

        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            arkts.factory.createIdentifier(CustomComponentNames.BUILDCOMPATIBLENODE),
            script,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC,
            false
        );
    }

    processComponent(
        node: arkts.ClassDeclaration | arkts.StructDeclaration
    ): arkts.ClassDeclaration | arkts.StructDeclaration {
        const scopeInfo = this.scopeInfos[this.scopeInfos.length - 1];
        const className = node.definition?.ident?.name;
        if (!className || scopeInfo?.name !== className) {
            return node;
        }

        arkts.insertGlobalStructInfo(className);

        if (arkts.isStructDeclaration(node)) {
            this.collectComponentMembers(node, className);
        }

        const customComponentInterface = this.generateComponentInterface(
            className,
            node.modifiers | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_EXPORT,
            Object.values(scopeInfo.annotations ?? {}).map((anno) => anno.clone())
        );
        this.componentInterfaceCollection.push(customComponentInterface);

        const definition: arkts.ClassDefinition = node.definition!;
        const newDefinitionBody: arkts.AstNode[] = [];
        if (!!scopeInfo.annotations?.entry) {
            this.entryNames.push(className);
            const entryWithStorage: arkts.ClassProperty | undefined =
                findEntryWithStorageInClassAnnotations(definition);
            if (!!entryWithStorage) {
                newDefinitionBody.push(entryFactory.createEntryLocalStorageInClass(entryWithStorage));
            }
        }
        const newDefinition: arkts.ClassDefinition = this.createNewDefinition(
            node,
            className,
            definition,
            newDefinitionBody
        );

        if (arkts.isStructDeclaration(node)) {
            const _node = arkts.factory.createClassDeclaration(newDefinition);
            _node.modifiers = node.modifiers;
            return _node;
        } else {
            return arkts.factory.updateClassDeclaration(node, newDefinition);
        }
    }

    createNewDefinition(
        node: arkts.ClassDeclaration | arkts.StructDeclaration,
        className: string,
        definition: arkts.ClassDefinition,
        newDefinitionBody: arkts.AstNode[]
    ): arkts.ClassDefinition {
        const staticMethodBody: arkts.AstNode[] = [];
        const hasExportFlag =
            (node.modifiers & arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_EXPORT) ===
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_EXPORT;
        if (hasExportFlag) {
            const buildCompatibleNode: arkts.MethodDefinition = this.createStaticMethod(definition);
            if (!!buildCompatibleNode) {
                staticMethodBody.push(buildCompatibleNode);
            }
        }
        return arkts.factory
            .createClassDefinition(
                definition.ident,
                undefined,
                undefined, // superTypeParams doen't work
                definition.implements,
                undefined,
                arkts.factory.createTypeReference(
                    arkts.factory.createTypeReferencePart(
                        arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_CLASS_NAME),
                        arkts.factory.createTSTypeParameterInstantiation([
                            arkts.factory.createTypeReference(
                                arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier(className))
                            ),
                            arkts.factory.createTypeReference(
                                arkts.factory.createTypeReferencePart(
                                    arkts.factory.createIdentifier(
                                        `${CustomComponentNames.COMPONENT_INTERFACE_PREFIX}${className}`
                                    )
                                )
                            ),
                        ])
                    )
                ),
                [
                    ...newDefinitionBody,
                    ...definition.body.map((st: arkts.AstNode) => factory.PreprocessClassPropertyModifier(st)),
                    ...staticMethodBody,
                ],
                definition.modifiers,
                arkts.classDefinitionFlags(definition) | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_FINAL
            )
            .setAnnotations(definition.annotations);
    }

    generateComponentInterface(
        name: string,
        modifiers: number,
        annotations?: readonly arkts.AnnotationUsage[]
    ): arkts.TSInterfaceDeclaration {
        const interfaceNode = arkts.factory
            .createInterfaceDeclaration(
                [],
                arkts.factory.createIdentifier(getCustomComponentOptionsName(name)),
                nullptr,
                arkts.factory.createInterfaceBody([...(this.structMembersMap.get(name) || [])]),
                false,
                false
            )
            .setAnnotations(annotations ?? []);
        interfaceNode.modifiers = modifiers;
        return interfaceNode;
    }

    collectComponentMembers(node: arkts.StructDeclaration, className: string): void {
        const members = filterDefined(
            collect(
                ...node.definition.body.filter(arkts.isClassProperty).map((it) => {
                    if (hasDecoratorName(it, DecoratorNames.PROVIDE)) {
                        factory.processNoAliasProvideVariable(it);
                    }
                    return this.createInterfaceInnerMember(it);
                })
            )
        );
        this.structMembersMap.set(className, members);
    }

    createInterfaceInnerMember(member: arkts.ClassProperty): arkts.ClassProperty[] {
        const originalName: string = expectName(member.key);
        const originMember: arkts.ClassProperty = propertyFactory.createOptionalClassProperty(
            originalName,
            member,
            undefined,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
        );
        const infos = findDecoratorInfos(member);
        const buildParamInfo = infos.find((it) =>
            isDecoratorAnnotation(it.annotation, DecoratorNames.BUILDER_PARAM, true)
        );
        if (!!buildParamInfo) {
            originMember.setAnnotations([buildParamInfo.annotation.clone()]);
            return [originMember];
        }
        const targetInfo = infos.find((it) => decoratorTypeMap.has(it.name));
        if (!!targetInfo) {
            const newName: string = backingField(originalName);
            const newMember: arkts.ClassProperty = propertyFactory
                .createOptionalClassProperty(
                    newName,
                    member,
                    undefined,
                    arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
                )
                .setAnnotations([targetInfo.annotation.clone()]);
            if (isDecoratorAnnotation(targetInfo.annotation, DecoratorNames.LINK, true)) {
                this.shouldAddLinkIntrinsic = true;
                originMember.setAnnotations([annotation(DecoratorIntrinsicNames.LINK)]);
            }
            return [originMember, newMember];
        }
        return [originMember];
    }

    registerMap(map: Map<string, StructMap>): void {
        this.legacyStructMap = map;
        this.hasLegacy = true;
    }

    processImport(node: arkts.ETSImportDeclaration): void {
        const source = node.source?.str!;
        const specifiers = node.specifiers as arkts.ImportSpecifier[];
        if (this.legacyStructMap.has(source)) {
            const structMap = this.legacyStructMap.get(source);
            if (!structMap) {
                return;
            }
            for (const specifier of specifiers) {
                const name = specifier.local?.name;
                if (!!name && structMap[name]) {
                    this.legacyCallMap.set(name, structMap[name]);
                }
            }
        }
    }

    visitor(node: arkts.AstNode): arkts.AstNode {
        this.enter(node);
        const newNode = this.visitEachChild(node);
        if (arkts.isEtsScript(newNode)) {
            return this.processEtsScript(newNode);
        }
        if (
            arkts.isStructDeclaration(newNode) &&
            this.scopeInfos.length > 0 &&
            isComponentStruct(newNode, this.scopeInfos[this.scopeInfos.length - 1])
        ) {
            const updateNode = this.processComponent(newNode);
            this.exit(newNode);
            return updateNode;
        }
        if (!this.hasLegacy) {
            return newNode;
        }
        if (arkts.isETSImportDeclaration(newNode)) {
            this.processImport(newNode);
        }
        if (arkts.isCallExpression(newNode) && arkts.isIdentifier(newNode.expression)) {
            const className = newNode.expression.name;
            if (this.legacyCallMap.has(className)) {
                const path = this.legacyCallMap.get(className)!;
                const args = newNode.arguments;
                const context: InteropContext = {
                    className: className,
                    path: path,
                    arguments:
                        args && args.length === 1 && args[0] instanceof arkts.ObjectExpression ? args[0] : undefined,
                };
                return generateTempCallFunction(context);
            }
        }
        return newNode;
    }
}
