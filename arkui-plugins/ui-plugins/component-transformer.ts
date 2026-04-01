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
    getCustomComponentOptionsName,
    CustomComponentInfo,
    collectCustomComponentScopeInfo,
    isComponentStruct,
    isCustomDialogControllerOptions,
    getComponentExtendsName,
    ComponentType,
    EntryAnnoInfo,
} from './utils';
import {
    backingField,
    expectName,
    annotation,
    filterDefined,
    collect,
    createAndInsertImportDeclaration,
    isDecoratorAnnotation,
} from '../common/arkts-utils';
import { ProjectConfig } from '../common/plugin-context';
import { getEntryRouteParam } from './entry-translators/utils';
import { factory as EntryFactory } from './entry-translators/factory';
import { hasDecoratorName, findDecoratorInfos, DecoratorInfo } from './property-translators/utils';
import { factory as UIFactory } from './ui-factory';
import { factory as PropertyFactory } from './property-translators/factory';
import { factory as StructFactory } from './struct-translators/factory';
import {
    ARKUI_NAVIGATION_SOURCE_NAME,
    ARKUI_NAV_DESTINATION_SOURCE_NAME,
    ARKUI_COMPONENT_COMMON_SOURCE_NAME,
    CUSTOM_COMPONENT_IMPORT_SOURCE_NAME,
    DecoratorNames,
    DECORATOR_TYPE_MAP,
    NavigationNames,
    EntryWrapperNames,
    ReuseNames,
    CustomComponentNames,
    LogType,
} from '../common/predefines';
import { ImportCollector } from '../common/import-collector';
import { MetaDataCollector } from '../common/metadata-collector';
import { LogCollector } from '../common/log-collector';
import { NamespaceProcessor } from './namespace-processor';

export interface ComponentTransformerOptions extends VisitorOptions {
    arkui?: string;
}

type ScopeInfo = CustomComponentInfo;

const isRequiredDecorators = [DecoratorNames.OBJECT_LINK, DecoratorNames.REQUIRE];

export interface InteropContext {
    className: string;
    path?: string;
    line?: number;
    col?: number;
    arguments?: arkts.ObjectExpression;
    content?: arkts.ArrowFunctionExpression;
    storage?: arkts.Identifier;
}

export class ComponentTransformer extends AbstractVisitor {
    private scopeInfos: ScopeInfo[] = [];
    private componentInterfaceCollection: arkts.TSInterfaceDeclaration[] = [];
    private entryAnnoInfo: EntryAnnoInfo[] = [];
    private structMembersMap: Map<string, arkts.AstNode[]> = new Map();
    private projectConfig: ProjectConfig | undefined;
    private entryRouteName: arkts.AstNode | undefined;
    private componentType: ComponentType = {
        hasComponent: false,
        hasComponentV2: false,
        hasCustomDialog: false,
        hasCustomLayout: false,
    };
    private importCollector: ImportCollector;

    constructor(options?: ComponentTransformerOptions) {
        const _options: ComponentTransformerOptions = options ?? {};
        super(_options);
        this.projectConfig = MetaDataCollector.getInstance().projectConfig;
        this.importCollector = ImportCollector.getInstance();
    }

    init(): void {
        MetaDataCollector.getInstance()
            .setProjectConfig(this.projectConfig)
            .setAbsName(this.program?.absName)
            .setExternalSourceName(this.externalSourceName);
    }

    reset(): void {
        super.reset();
        this.importCollector.reset();
        this.scopeInfos = [];
        this.componentInterfaceCollection = [];
        this.entryAnnoInfo = [];
        NamespaceProcessor.getInstance().reset();
        this.structMembersMap = new Map();
        this.componentType = {
            hasComponent: false,
            hasComponentV2: false,
            hasCustomDialog: false,
            hasCustomLayout: false,
        };
    }

    enterStruct(node: arkts.StructDeclaration): void {
        if (!node.definition.ident) {
            return;
        }
        const info: ScopeInfo | undefined = collectCustomComponentScopeInfo(node);
        if (info) {
            this.scopeInfos.push(info);
        }
    }

    exitStruct(node: arkts.StructDeclaration | arkts.ClassDeclaration): void {
        if (!node.definition || !node.definition.ident || this.scopeInfos.length === 0) {
            return;
        }
        if (this.scopeInfos[this.scopeInfos.length - 1]?.name === node.definition.ident.name) {
            this.scopeInfos.pop();
        }
    }

    createImportDeclaration(sourceName: string, importedName: string): void {
        const source: arkts.StringLiteral = arkts.factory.create1StringLiteral(sourceName);
        const imported: arkts.Identifier = arkts.factory.createIdentifier(importedName);
        // Insert this import at the top of the script's statements.
        if (!this.program) {
            throw Error('Failed to insert import: Transformer has no program');
        }
        createAndInsertImportDeclaration(
            source,
            imported,
            imported,
            arkts.Es2pandaImportKinds.IMPORT_KINDS_VALUE,
            this.program
        );
    }

    getUpdateStatements(): arkts.AstNode[] {
        let updateStatements: arkts.AstNode[] = [];
        if (this.componentInterfaceCollection.length > 0) {
            this.insertComponentImport();
            updateStatements.push(...this.componentInterfaceCollection);
        }
        if (this.entryAnnoInfo.length > 0) {
            // normally, we should only have at most one @Entry component in a single file.
            // probably need to handle error message here.
            updateStatements.push(...this.entryAnnoInfo.map(EntryFactory.generateEntryWrapper));
            updateStatements.push(
                ...this.entryAnnoInfo.map((item: EntryAnnoInfo) =>
                    EntryFactory.callRegisterNamedRouter(
                        this.entryRouteName,
                        this.projectConfig,
                        this.program?.absName,
                        item.range
                    )
                )
            );
            this.createImportDeclaration(CUSTOM_COMPONENT_IMPORT_SOURCE_NAME, NavigationNames.NAVINTERFACE);
        }
        return updateStatements;
    }

    processRootEtsScript(node: arkts.EtsScript): arkts.EtsScript {
        if (this.isExternal && this.externalSourceName === CUSTOM_COMPONENT_IMPORT_SOURCE_NAME) {
            const navInterface = EntryFactory.createNavInterface();
            navInterface.modifiers = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_EXPORT;
            return arkts.factory.updateEtsScript(node, [...node.statements, navInterface]);
        }
        if (
            this.externalSourceName === ARKUI_NAVIGATION_SOURCE_NAME ||
            this.externalSourceName === ARKUI_NAV_DESTINATION_SOURCE_NAME
        ) {
            return arkts.factory.updateEtsScript(node, [
                ...node.statements,
                EntryFactory.createNavigationModuleInfo(this.externalSourceName),
            ]);
        }
        if (
            this.isExternal &&
            this.entryAnnoInfo.length === 0 &&
            NamespaceProcessor.getInstance().totalInterfacesCnt === 0
        ) {
            return node;
        }
        let newNode: arkts.EtsScript = StructFactory.insertNavigationBuilderRegisterClass(
            node, 
            MetaDataCollector.getInstance().routerInfo, 
            MetaDataCollector.getInstance().fileAbsName
        );
        this.insertComponentImport();
        const updateStatements: arkts.AstNode[] = this.getUpdateStatements();
        if (updateStatements.length > 0) {
            return arkts.factory.updateEtsScript(newNode, [...newNode.statements, ...updateStatements]);
        }
        return newNode;
    }

    private _collectImportFromCustomComponentSource(importName: string): void {
        this.importCollector.collectSource(importName, CUSTOM_COMPONENT_IMPORT_SOURCE_NAME);
        this.importCollector.collectImport(importName);
    }

    private _collectImportFromEntrySource(importName: string): void {
        this.importCollector.collectSource(importName, CUSTOM_COMPONENT_IMPORT_SOURCE_NAME);
        this.importCollector.collectImport(importName);
    }

    insertComponentImport(): void {
        if (this.componentType.hasComponent) {
            this._collectImportFromCustomComponentSource(CustomComponentNames.COMPONENT_CLASS_NAME);
        }
        if (this.componentType.hasComponentV2) {
            this._collectImportFromCustomComponentSource(CustomComponentNames.COMPONENT_V2_CLASS_NAME);
        }
        if (this.componentType.hasCustomDialog) {
            this._collectImportFromCustomComponentSource(CustomComponentNames.BASE_CUSTOM_DIALOG_NAME);
        }
        if (this.componentType.hasCustomLayout) {
            this._collectImportFromCustomComponentSource(CustomComponentNames.LAYOUT_CALLBACKS);
        }
        if (this.entryAnnoInfo.length > 0) {
            this._collectImportFromEntrySource(EntryWrapperNames.ENTRY_POINT_CLASS_NAME);
            this._collectImportFromCustomComponentSource(CustomComponentNames.PAGE_LIFE_CYCLE);
        }
        this.importCollector.insertCurrentImports(this.program);
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
                [
                    EntryFactory.generateRegisterNamedRouter(),
                    EntryFactory.generateNavigationBuilderRegister(),
                    ...node.definition.body,
                ],
                node.definition.modifiers,
                arkts.classDefinitionFlags(node.definition)
            )
        );
    }

    createStaticMethod(definition: arkts.ClassDefinition): arkts.MethodDefinition {
        const isDecl: boolean = arkts.hasModifierFlag(definition, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE);
        const modifiers =
            arkts.classDefinitionFlags(definition) |
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC |
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC;
        const body = isDecl ? undefined : arkts.factory.createBlock([arkts.factory.createReturnStatement()]);
        const param: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(
                CustomComponentNames.OPTIONS,
                UIFactory.createTypeReferenceFromString(getCustomComponentOptionsName(definition.ident!.name))
            ),
            undefined
        );
        const returnTypeAnnotation = arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID);
        const flags = arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD;
        const kind = arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD;
        const key = arkts.factory.createIdentifier(CustomComponentNames.BUILDCOMPATIBLENODE);

        return UIFactory.createMethodDefinition({
            key,
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
        node: arkts.ClassDeclaration | arkts.StructDeclaration
    ): arkts.ClassDeclaration | arkts.StructDeclaration {
        const scopeInfo = this.scopeInfos[this.scopeInfos.length - 1];
        const className = node.definition?.ident?.name;
        if (!className || scopeInfo?.name !== className) {
            return node;
        }
        if (arkts.isStructDeclaration(node)) {
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
            StructFactory.copyStructModifierFlagsToOptionsInterface(node.modifiers),
            Object.values(scopeInfo.annotations ?? {}).map((anno) => anno.clone())
        );
        NamespaceProcessor.getInstance().addInterfaceToCurrentNamespace(customComponentInterface);
        const definition: arkts.ClassDefinition = node.definition!;
        if (!!scopeInfo.annotations?.entry) {
            this.entryAnnoInfo.push({ name: className, range: scopeInfo.annotations.entry.range });
            const routeName = getEntryRouteParam(definition);
            if (routeName && routeName.value) {
                this.entryRouteName = routeName.value;
            }
        }
        const newDefinition: arkts.ClassDefinition = this.createNewDefinition(node, className, definition);

        if (arkts.isStructDeclaration(node)) {
            arkts.classDefinitionSetFromStructModifier(newDefinition);
            const _node = arkts.factory.createClassDeclaration(newDefinition);
            _node.modifiers = node.modifiers;
            _node.startPosition = node.startPosition;
            _node.endPosition = node.endPosition;
            return _node;
        } else {
            return arkts.factory.updateClassDeclaration(node, newDefinition);
        }
    }

    createNewDefinition(
        node: arkts.ClassDeclaration | arkts.StructDeclaration,
        className: string,
        definition: arkts.ClassDefinition
    ): arkts.ClassDefinition {
        const staticMethodBody: arkts.AstNode[] = [];
        const isExportClass = arkts.hasModifierFlag(node, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_EXPORT);
        if (isExportClass) {
            const buildCompatibleNode: arkts.MethodDefinition = this.createStaticMethod(definition);
            if (!!buildCompatibleNode) {
                staticMethodBody.push(buildCompatibleNode);
            }
        }
        const scopeInfo = this.scopeInfos[this.scopeInfos.length - 1];
        const isDecl = scopeInfo.isDecl;
        const extendsName: string = getComponentExtendsName(scopeInfo.annotations, this.componentType);
        return arkts.factory
            .createClassDefinition(
                definition.ident,
                undefined,
                undefined, // superTypeParams doen't work
                [...definition.implements, ...UIFactory.generateImplementsForStruct(scopeInfo.annotations)],
                undefined,
                arkts.factory.createTypeReference(
                    arkts.factory.createTypeReferencePart(
                        arkts.factory.createIdentifier(extendsName),
                        arkts.factory.createTSTypeParameterInstantiation([
                            UIFactory.createTypeReferenceFromString(className),
                            UIFactory.createTypeReferenceFromString(
                                `${CustomComponentNames.COMPONENT_INTERFACE_PREFIX}${className}`
                            ),
                        ])
                    )
                ),
                [
                    StructFactory.createInvokeMethod(className, isDecl),
                    ...definition.body.map((st: arkts.AstNode) => {
                        UIFactory.preprocessClassPropertyModifier(st, scopeInfo.isDecl);
                        return StructFactory.updateStructConstructor(st, scopeInfo);
                    }),
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
                        UIFactory.processNoAliasProvideVariable(it);
                    }
                    return this.createInterfaceInnerMember(it);
                })
            )
        );
        this.structMembersMap.set(className, members);
    }

    createInterfaceInnerMember(member: arkts.ClassProperty): arkts.ClassProperty[] {
        const infos: DecoratorInfo[] = findDecoratorInfos(member);
        const annotations = infos.map((it) => it.annotation.clone());
        const originalName: string = expectName(member.key);
        const isRequired = isRequiredDecorators.some((decoratorName) => {
            return hasDecoratorName(member, decoratorName);
        });
        const originMember: arkts.ClassProperty = PropertyFactory
            .createOptionalClassProperty(
                originalName,
                member,
                undefined,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
                false,
                isRequired
            )
            .setAnnotations(annotations);
        const optionsHasMember = UIFactory.createOptionsHasMember(originalName);
        const typedAnnotations = infos
            .filter((it) => DECORATOR_TYPE_MAP.has(it.name))
            .map((it) => it.annotation.clone());
        if (typedAnnotations.length > 0) {
            const newName: string = backingField(originalName);
            const newMember: arkts.ClassProperty = PropertyFactory
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

    visitStruct(node: arkts.StructDeclaration): arkts.StructDeclaration | arkts.ClassDeclaration {
        this.enterStruct(node);
        if (this.scopeInfos.length > 0 && isComponentStruct(node, this.scopeInfos[this.scopeInfos.length - 1])) {
            const updateNode = this.processComponent(node);
            this.exitStruct(updateNode);
            return updateNode;
        }
        return node;
    }

    visitETSModule(node: arkts.EtsScript): arkts.EtsScript {
        NamespaceProcessor.getInstance().enter();
        const isNamespace = node.isNamespace;
        const newStatements = node.statements.map((st) => {
            if (arkts.isStructDeclaration(st)) {
                return this.visitStruct(st);
            }
            if (arkts.isEtsScript(st)) {
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
                    return UIFactory.updateCustomDialogOptionsInterface(st);
                }
            }
            return st;
        });
        let newNode = arkts.factory.updateEtsScript(node, newStatements);
        if (isNamespace) {
            newNode = NamespaceProcessor.getInstance().updateCurrentNamespace(newNode);
        } else {
            newNode = NamespaceProcessor.getInstance().updateCurrentNamespace(this.processRootEtsScript(newNode));
        }
        NamespaceProcessor.getInstance().exit();
        return newNode;
    }

    visitor(node: arkts.AstNode): arkts.AstNode {
        if (!arkts.isEtsScript(node)) {
            return node;
        }
        return this.visitETSModule(node);
    }
}
