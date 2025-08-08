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
import {
    CustomComponentNames,
    getCustomComponentOptionsName,
    findLocalImport,
    CustomComponentInfo,
    collectCustomComponentScopeInfo,
    isComponentStruct,
    isCustomDialogControllerOptions,
    getComponentExtendsName,
    ComponentType,
    EntryInfo,
    StructType,
    StructInfo,
} from './utils';
import {
    backingField,
    expectName,
    annotation,
    filterDefined,
    collect,
    isDecoratorAnnotation,
} from '../common/arkts-utils';
import { ProjectConfig } from '../common/plugin-context';
import { getEntryParamsFromAnnotation } from './entry-translators/utils';
import { factory as entryFactory } from './entry-translators/factory';
import { hasDecoratorName, findDecoratorInfos } from './property-translators/utils';
import { factory } from './ui-factory';
import { factory as propertyFactory } from './property-translators/factory';
import { factory as structFactory } from './struct-translators/factory';
import {
    CUSTOM_COMPONENT_IMPORT_SOURCE_NAME,
    DecoratorNames,
    DECORATOR_TYPE_MAP,
    NavigationNames,
    EntryWrapperNames,
    LogType,
} from '../common/predefines';
import { LogCollector } from '../common/log-collector';
import { NamespaceProcessor } from './namespace-processor';

export interface ComponentTransformerOptions extends VisitorOptions {
    arkui?: string;
    projectConfig?: ProjectConfig;
}

type ScopeInfo = CustomComponentInfo;

export interface InteropContext {
    className: string;
    path: string;
    line?: number;
    col?: number;
    arguments?: arkts.ObjectExpression;
    content?: arkts.ArrowFunctionExpression;
}

export class ComponentTransformer extends AbstractVisitor {
    private scopeInfos: ScopeInfo[] = [];
    private entryInfos: EntryInfo[] = [];
    private structMembersMap: Map<string, arkts.AstNode[]> = new Map();
    private projectConfig: ProjectConfig | undefined;
    private componentType: ComponentType = {
        hasComponent: false,
        hasComponentV2: false,
        hasCustomDialog: false,
        hasCustomLayout: false,
    };
    private imports: arkts.ETSImportDeclaration[] = []

    constructor(options?: ComponentTransformerOptions) {
        const _options: ComponentTransformerOptions = options ?? {};
        super(_options);
        this.projectConfig = options?.projectConfig;
    }

    reset(): void {
        super.reset();
        NamespaceProcessor.getInstance().reset();
        this.scopeInfos = [];
        this.entryInfos = [];
        this.structMembersMap = new Map();
        this.componentType = {
            hasComponent: false,
            hasComponentV2: false,
            hasCustomDialog: false,
            hasCustomLayout: false,
        };
        if (LogCollector.getInstance().logInfos.length > 0) {
            LogCollector.getInstance().emitLogInfo();
            LogCollector.getInstance().reset();
        }
    }

    private generateStatementsForEntry(): arkts.Statement[] {
        if (this.entryInfos.length === 0) {
            return [];
        }
        this.createImportDeclaration(CUSTOM_COMPONENT_IMPORT_SOURCE_NAME, CustomComponentNames.PAGE_LIFE_CYCLE);
        if (this.entryInfos.length > 1) {
            this.entryInfos.forEach((info) => {
                LogCollector.getInstance().collectLogInfo({
                    node: info.annotation,
                    message: `A page can't contain more than one '@Entry' annotation.`,
                    level: LogType.ERROR,
                });
            });
            return [];
        }
        const { className, annotation, definition } = this.entryInfos.at(0)!;
        const { storage, useSharedStorage, routeName } = getEntryParamsFromAnnotation(annotation);
        let entryRouteName: string | undefined;
        entryFactory.transformStorageParams(storage, useSharedStorage, definition);
        if (routeName && routeName.value && arkts.isStringLiteral(routeName.value)) {
            entryRouteName = routeName.value.str;
        }
        const updateStatements: arkts.Statement[] = [];
        this.imports.push(entryFactory.createEntryPointImport(this.program));
        updateStatements.push(entryFactory.generateEntryWrapper(className));
        updateStatements.push(
            entryFactory.callRegisterNamedRouter(entryRouteName, this.projectConfig, this.program?.absoluteName)
        );
        this.createImportDeclaration(CUSTOM_COMPONENT_IMPORT_SOURCE_NAME, NavigationNames.NAVINTERFACE);
        return updateStatements;
    }

    enterStruct(node: arkts.ETSStructDeclaration): void {
        if (!node.definition.ident) {
            return;
        }
        const info: ScopeInfo | undefined = collectCustomComponentScopeInfo(node);
        if (info) {
            this.scopeInfos.push(info);
        }
    }

    exitStruct(node: arkts.ETSStructDeclaration | arkts.ClassDeclaration): void {
        if (!node.definition || !node.definition.ident || this.scopeInfos.length === 0) {
            return;
        }
        if (this.scopeInfos[this.scopeInfos.length - 1]?.name === node.definition.ident.name) {
            this.scopeInfos.pop();
        }
    }

    createImportDeclaration(sourceName: string, importedName: string, localName = importedName) {
        const source: arkts.StringLiteral = arkts.factory.createStringLiteral(sourceName);
        const imported: arkts.Identifier = arkts.factory.createIdentifier(importedName);
        const local: arkts.Identifier = arkts.factory.createIdentifier(localName);
        this.imports.push(
            arkts.factory.createETSImportDeclaration(
                source,
                [
                    arkts.factory.createImportSpecifier(
                        imported,
                        local,
                    ),
                ],
                arkts.Es2pandaImportKinds.IMPORT_KINDS_ALL,
            )
        )
    }

    processRootEtsScript(node: arkts.ETSModule): arkts.ETSModule {
        if (this.isExternal && this.externalSourceName === CUSTOM_COMPONENT_IMPORT_SOURCE_NAME) {
            const navInterface = entryFactory.createNavInterface();
            navInterface.modifiers = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_EXPORT;
            return arkts.factory.updateETSModule(node, [...this.imports.splice(0), ...node.statements, navInterface], node.ident, node.getNamespaceFlag(), node.program);
        }
        if (
            this.isExternal &&
            this.entryInfos.length === 0 &&
            NamespaceProcessor.getInstance().totalInterfacesCnt === 0
        ) {
            return node;
        }
        this.insertComponentImport();
        const updateStatements: arkts.Statement[] = this.generateStatementsForEntry();
        if (updateStatements.length > 0 || this.imports.length > 0) {
            const newStatements = collect<arkts.Statement>(this.imports.splice(0), node.statements, updateStatements);
            return arkts.factory.updateETSModule(node, newStatements, node.ident, node.getNamespaceFlag(), node.program);
        }
        return node;
    }

    insertComponentImport(): void {
        if (this.componentType.hasComponent) {
            this.createImportDeclaration(
                CUSTOM_COMPONENT_IMPORT_SOURCE_NAME,
                CustomComponentNames.COMPONENT_CLASS_NAME
            );
        }
        if (this.componentType.hasComponentV2) {
            this.createImportDeclaration(
                CUSTOM_COMPONENT_IMPORT_SOURCE_NAME,
                CustomComponentNames.COMPONENT_V2_CLASS_NAME
            );
        }
        if (this.componentType.hasCustomDialog) {
            this.createImportDeclaration(
                CUSTOM_COMPONENT_IMPORT_SOURCE_NAME,
                CustomComponentNames.BASE_CUSTOM_DIALOG_NAME
            );
        }
        if (this.componentType.hasCustomLayout) {
            this.createImportDeclaration(CUSTOM_COMPONENT_IMPORT_SOURCE_NAME, CustomComponentNames.LAYOUT_CALLBACKS);
        }
    }

    updateEntryPoint(node: arkts.ClassDeclaration): arkts.ClassDeclaration {
        if (!node.definition) {
            return node;
        }
        return arkts.factory.updateClassDeclaration(
            node,
            arkts.factory.updateClassDefinition(
                node.definition,
                node.definition.ident,
                node.definition.typeParams,
                node.definition.superTypeParams,
                node.definition.implements,
                undefined,
                node.definition.super,
                [entryFactory.generateRegisterNamedRouter(), ...node.definition.body],
                node.definition.modifiers,
                arkts.classDefinitionFlags(node.definition),
                node.definition.annotations
            )
        );
    }

    createStaticMethod(definition: arkts.ClassDefinition): arkts.MethodDefinition {
        const isDecl: boolean = arkts.hasModifierFlag(definition, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE);
        const modifiers =
            arkts.classDefinitionFlags(definition) |
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC |
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC;
        const body = isDecl ? undefined : arkts.factory.createBlockStatement([arkts.factory.createReturnStatement()]);
        const param: arkts.ETSParameterExpression = arkts.factory.createETSParameterExpression(
            arkts.factory.createIdentifier(
                CustomComponentNames.OPTIONS,
                factory.createTypeReferenceFromString(getCustomComponentOptionsName(definition.ident!.name))
            ),
            false
        );
        const returnTypeAnnotation = arkts.factory.createETSPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID);
        const flags = arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD;
        const kind = arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD;
        const key = arkts.factory.createIdentifier(CustomComponentNames.BUILDCOMPATIBLENODE);

        return factory.createMethodDefinition({
            key: key.clone(),
            kind,
            function: {
                key,
                body,
                params: [param],
                returnTypeAnnotation,
                flags,
                modifiers,
            },
            modifiers,
        });
    }

    processComponent(
        node: arkts.ClassDeclaration | arkts.ETSStructDeclaration
    ): arkts.ClassDeclaration | arkts.ETSStructDeclaration {
        const scopeInfo = this.scopeInfos[this.scopeInfos.length - 1];
        const className = node.definition?.ident?.name;
        if (!className || scopeInfo?.name !== className) {
            return node;
        }
        if (scopeInfo.type === StructType.INVALID_STRUCT) {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                message: `Annotation '@Component', '@ComponentV2', or '@CustomDialog' is missing for struct '${className}'.`,
                level: LogType.ERROR,
            });
            return node;
        }
        if (scopeInfo.type === StructType.CUSTOM_COMPONENT_DECL) {
            return node;
        }
        if (arkts.isETSStructDeclaration(node)) {
            if (node.definition.super || node.definition.implements.length !== 0) {
                LogCollector.getInstance().collectLogInfo({
                    node: node.definition?.ident ?? node,
                    message: `Structs are not allowed to inherit from classes or implement interfaces.`,
                    level: LogType.ERROR,
                });
                return node;
            }
            this.collectComponentMembers(node, className);
        }
        const customComponentInterface = this.generateComponentInterface(
            className,
            structFactory.copyStructModifierFlagsToOptionsInterface(node.modifiers),
            Object.values(scopeInfo.annotations ?? {}).map((anno) => anno.clone())
        );
        NamespaceProcessor.getInstance().addInterfaceToCurrentNamespace(customComponentInterface);
        const definition: arkts.ClassDefinition = node.definition!;
        const newDefinitionBody: arkts.AstNode[] = [];
        if (!!scopeInfo.annotations?.entry) {
            this.entryInfos.push({ className, annotation: scopeInfo.annotations.entry, definition });
        }
        const newDefinition: arkts.ClassDefinition = this.createNewDefinition(
            node,
            className,
            definition,
            newDefinitionBody,
            scopeInfo
        );

        if (arkts.isETSStructDeclaration(node)) {
            newDefinition.setFromStructModifier()
            const _node = arkts.factory.createClassDeclaration(newDefinition, node.modifierFlags);
            _node.startPosition = node.startPosition;
            _node.endPosition = node.endPosition;
            return _node;
        } else {
            return arkts.factory.updateClassDeclaration(node, newDefinition);
        }
    }

    createNewDefinition(
        node: arkts.ClassDeclaration | arkts.ETSStructDeclaration,
        className: string,
        definition: arkts.ClassDefinition,
        newDefinitionBody: arkts.AstNode[],
        scopeInfo: StructInfo
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
        const extendsName: string = getComponentExtendsName(scopeInfo.annotations!, this.componentType);
        return arkts.factory
            .createClassDefinition(
                definition.ident,
                undefined,
                undefined, // superTypeParams doen't work
                collect(definition.implements, factory.generateImplementsForStruct(scopeInfo.annotations!)),
                undefined,
                arkts.factory.createETSTypeReference(
                    arkts.factory.createETSTypeReferencePart(
                        arkts.factory.createIdentifier(extendsName),
                        arkts.factory.createTSTypeParameterInstantiation([
                            factory.createTypeReferenceFromString(className),
                            factory.createTypeReferenceFromString(
                                `${CustomComponentNames.COMPONENT_INTERFACE_PREFIX}${className}`
                            ),
                        ])
                    )
                ),
                collect(
                    newDefinitionBody,
                    definition.body.map((st: arkts.AstNode) =>
                        factory.PreprocessClassPropertyModifier(st, scopeInfo.isDecl)
                    ),
                    staticMethodBody,
                ),
                definition.modifiers,
                arkts.classDefinitionFlags(definition) | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_FINAL,
                definition.annotations
            );
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
                undefined,
                arkts.factory.createTSInterfaceBody([...(this.structMembersMap.get(name) || [])]),
                false,
                false
            )
            .setAnnotations(annotations ?? []);
        interfaceNode.modifiers = modifiers;
        return interfaceNode;
    }

    collectComponentMembers(node: arkts.ETSStructDeclaration, className: string): void {
        const members = filterDefined(
            collect(
                ...node.definition!.body.filter(arkts.isClassProperty).map((it) => {
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
        const infos = findDecoratorInfos(member);
        const annotations = infos.map((it) => it.annotation.clone());
        const originalName: string = expectName(member.key);
        const originMember: arkts.ClassProperty = propertyFactory
            .createOptionalClassProperty(
                originalName,
                member,
                undefined,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
            )
            .setAnnotations(annotations);
        const optionsHasMember = factory.createOptionsHasMember(originalName);
        const typedAnnotations = infos
            .filter((it) => DECORATOR_TYPE_MAP.has(it.name))
            .map((it) => it.annotation.clone());
        if (typedAnnotations.length > 0) {
            const newName: string = backingField(originalName);
            const newMember: arkts.ClassProperty = propertyFactory
                .createOptionalClassProperty(
                    newName,
                    member,
                    undefined,
                    arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
                )
                .setAnnotations(typedAnnotations);
            return [originMember, newMember, optionsHasMember];
        }
        return [originMember, optionsHasMember];
    }

    visitStruct(node: arkts.ETSStructDeclaration): arkts.ETSStructDeclaration | arkts.ClassDeclaration {
        this.enterStruct(node);
        if (this.scopeInfos.length > 0 && isComponentStruct(node, this.scopeInfos[this.scopeInfos.length - 1])) {
            const updateNode = this.processComponent(node);
            this.exitStruct(updateNode);
            return updateNode;
        }
        return node;
    }

    visitETSModule(node: arkts.ETSModule): arkts.ETSModule {
        NamespaceProcessor.getInstance().enter();
        const isNamespace = node.isNamespace;
        const newStatements = node.statements.map((st) => {
            if (arkts.isETSStructDeclaration(st)) {
                return this.visitStruct(st);
            }
            if (arkts.isETSModule(st)) {
                return this.visitETSModule(st);
            }
            if (!isNamespace) {
                if (
                    arkts.isClassDeclaration(st) &&
                    this.externalSourceName === CUSTOM_COMPONENT_IMPORT_SOURCE_NAME &&
                    st.definition?.ident?.name === EntryWrapperNames.ENTRY_POINT_CLASS_NAME
                ) {
                    return this.updateEntryPoint(st);
                }
                if (
                    arkts.isTSInterfaceDeclaration(st) &&
                    isCustomDialogControllerOptions(st, this.externalSourceName)
                ) {
                    return factory.updateCustomDialogOptionsInterface(st);
                }
            }
            return st;
        });
        let newNode = arkts.factory.updateETSModule(node, newStatements, node.ident, node.getNamespaceFlag(), node.program);
        if (isNamespace) {
            newNode = NamespaceProcessor.getInstance().updateCurrentNamespace(newNode);
        } else {
            newNode = NamespaceProcessor.getInstance().updateCurrentNamespace(this.processRootEtsScript(newNode));
        }
        NamespaceProcessor.getInstance().exit();
        return newNode;
    }

    visitor(node: arkts.AstNode): arkts.AstNode {
        if (!arkts.isETSModule(node)) {
            return node;
        }
        return this.visitETSModule(node);
    }
}
