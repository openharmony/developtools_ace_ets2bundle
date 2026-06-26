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
    getCustomComponentOptionsName,
    CustomComponentInfo,
    CustomComponentAnontations,
    collectCustomComponentScopeInfo,
    isComponentStruct,
    isCustomDialogControllerOptions,
    getComponentExtendsName,
    ComponentType,
    EntryAnnoInfo,
    getValueInObjectAnnotation,
} from './utils';
import {
    backingField,
    expectName,
    annotation,
    filterDefined,
    collect,
    isDecoratorAnnotation,
    withAPIVersion,
    expectNameInTypeReference,
    isExported,
} from '../common/arkts-utils';
import { ProjectConfig } from '../common/plugin-context';
import { findNavigationModuleInfo, getEntryRouteParam } from './entry-translators/utils';
import { factory as EntryFactory } from './entry-translators/factory';
import { hasDecoratorName, findDecoratorInfos, DecoratorInfo, parseStructPropertyAnnotations, checkIsRequiredPropertyFromAnnotationInfo, collectAnnotationsFromInfo, collectAnnotationForBackingFromInfo } from './property-translators/utils';
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
    ReusableOptions,
    APIVersions,
    APIComparison,
    StateManagementTypes,
    ARKUI_STATE_MANAGEMENT_DECORATOR_SOURCE_NAME,
} from '../common/predefines';
import { ImportCollector } from '../common/import-collector';
import { MetaDataCollector } from '../common/metadata-collector';
import {
    LogCollector,
    createSuggestion,
    getPositionRangeFromAnnotation,
    getPositionRangeFromNode,
} from '../common/log-collector';
import { NamespaceProcessor } from './namespace-processor';
import { AstNodePointer } from '../common/safe-types';
import { AnnotationRecord } from '../collectors/ui-collectors/records/annotations/base';
import { StructPropertyAnnotationInfo, StructPropertyAnnotations } from '../collectors/ui-collectors/records';

export interface ComponentTransformerOptions extends VisitorOptions {
    arkui?: string;
}

type ScopeInfo = CustomComponentInfo;

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
    private entryRouteName: arkts.Expression | undefined;
    private componentType: ComponentType = {
        hasComponent: false,
        hasComponentV2: false,
        hasCustomDialog: false,
        hasCustomLayout: false,
        hasReusable: false,
        hasReusableV2: false
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
            .setAbsName(this.program?.absoluteName)
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
            hasReusable: false,
            hasReusableV2: false
        };
    }

    enterStruct(node: arkts.ETSStructDeclaration): void {
        if (!node.definition.ident) {
            return;
        }
        const info: ScopeInfo | undefined = collectCustomComponentScopeInfo(node);
        if (info) {
            this.scopeInfos.push(info);
        } else {
            // info is undefined means the struct lacks @Component, @ComponentV2, or @CustomDialog
            LogCollector.getInstance().collectLogInfo({
                node: node,
                message: `Annotation '@Component', '@ComponentV2', or '@CustomDialog' is missing for struct '${node.definition.ident.name}'.`,
                level: LogType.ERROR,
            });
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

    getUpdateStatements(): arkts.Statement[] {
        let updateStatements: arkts.Statement[] = [];
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
                        this.program?.absoluteName,
                        item.startPosition,
                        item.endPosition
                    )
                )
            );
            this.importCollector.collectSource(NavigationNames.NAVINTERFACE, CUSTOM_COMPONENT_IMPORT_SOURCE_NAME);
            this.importCollector.collectImport(NavigationNames.NAVINTERFACE);
        }
        return updateStatements;
    }

    processRootETSModule(node: arkts.ETSModule): arkts.ETSModule {
        if (this.isExternal && this.externalSourceName === CUSTOM_COMPONENT_IMPORT_SOURCE_NAME) {
            const navInterface = EntryFactory.createNavInterface();
            navInterface.modifierFlags = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_EXPORT;
            return arkts.factory.updateETSModule(node, [...node.statements, navInterface]);
        }
        let _newNode: arkts.ETSModule | undefined;
        withAPIVersion(
            { version: APIVersions.API_24, compare: APIComparison.LESS_THAN_OR_EQUAL },
            (sdkVersion: APIVersions) => {
                if (
                    this.externalSourceName === ARKUI_NAVIGATION_SOURCE_NAME ||
                    this.externalSourceName === ARKUI_NAV_DESTINATION_SOURCE_NAME
                ) {
                    const statements = node.statements;
                    const foundDecl = findNavigationModuleInfo(statements, this.externalSourceName);
                    if (!foundDecl) {
                        _newNode = arkts.factory.updateETSModule(node, [
                            ...node.statements,
                            EntryFactory.createNavigationModuleInfo(this.externalSourceName),
                        ]);
                    }
                }
            },
            { ignoreCompare: true }
        );
        if (_newNode !== undefined) {
            return _newNode;
        }
        if (
            this.isExternal &&
            this.entryAnnoInfo.length === 0 &&
            NamespaceProcessor.getInstance().totalInnerClassesCnt === 0
        ) {
            return node;
        }
        const navigationBuilderClass = StructFactory.createNavigationBuilderRegisterClass(
            node,
            MetaDataCollector.getInstance().routerInfo, 
            MetaDataCollector.getInstance().fileAbsName
        );
        this.insertComponentImport();
        const updateStatements: arkts.Statement[] = this.getUpdateStatements();
        if (updateStatements.length > 0 || this.importCollector.importInfos.length > 0 || navigationBuilderClass !== undefined) {
            const newStatements = collect<arkts.Statement>(
                this.importCollector.getImportStatements(),
                node.statements,
                navigationBuilderClass ? [navigationBuilderClass] : [],
                updateStatements
            );
            return arkts.factory.updateETSModule(node, newStatements);
        }
        return node;
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
            this._collectImportFromCustomComponentSource(StateManagementTypes.REUSE_POOL_OWNERSHIP);
        }
        if (this.componentType.hasComponentV2) {
            this._collectImportFromCustomComponentSource(CustomComponentNames.COMPONENT_V2_CLASS_NAME);
            this._collectImportFromCustomComponentSource(StateManagementTypes.REUSE_POOL_OWNERSHIP);
        }
        if (this.componentType.hasCustomDialog) {
            this._collectImportFromCustomComponentSource(CustomComponentNames.BASE_CUSTOM_DIALOG_NAME);
        }
        if (this.componentType.hasCustomLayout) {
            this._collectImportFromCustomComponentSource(CustomComponentNames.LAYOUT_CALLBACKS);
        }
        if (this.componentType.hasReusable || this.componentType.hasReusableV2) {
            this._collectImportFromCustomComponentSource(ReusableOptions.REUSABLE_MEM_OPT_STRATEGY);
        }
        if (this.entryAnnoInfo.length > 0) {
            this._collectImportFromEntrySource(EntryWrapperNames.ENTRY_POINT_CLASS_NAME);
            this._collectImportFromCustomComponentSource(CustomComponentNames.PAGE_LIFE_CYCLE);
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
                [
                    EntryFactory.generateRegisterNamedRouter(),
                    EntryFactory.generateNavigationBuilderRegister(),
                    ...node.definition.body,
                ],
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
                UIFactory.createTypeReferenceFromString(getCustomComponentOptionsName(definition.ident!.name))
            ),
            false
        );
        const returnTypeAnnotation = arkts.factory.createETSPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID);
        const flags = arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD;
        const kind = arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD;
        const key = arkts.factory.createIdentifier(CustomComponentNames.BUILDCOMPATIBLENODE);

        return UIFactory.createMethodDefinition({
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
        const structPropAnnoMap = new Map();
        const definition: arkts.ClassDefinition = node.definition!;
        if (arkts.isETSStructDeclaration(node)) {
            if (definition.super || definition.implements.length !== 0) {
                LogCollector.getInstance().collectLogInfo({
                    node: definition?.ident ?? node,
                    message: `Structs are not allowed to inherit from classes or implement interfaces.`,
                    level: LogType.ERROR,
                });
                return node;
            }
            this.validateBuildMethod(node, className);
            const innerClassFields: arkts.AstNode[] = [];
            definition.body.forEach((it) => {
                if (!arkts.isClassProperty(it)) {
                    return;
                }
                const structPropAnnoRecord = parseStructPropertyAnnotations(it);
                structPropAnnoMap.set(it.peer, structPropAnnoRecord);
                innerClassFields.push(...this.createInterfaceInnerMember(it, structPropAnnoRecord));
            })
            this.structMembersMap.set(className, innerClassFields);
        }
        const customComponentInnerClass = this.generateComponentInnerClass(
            className,
            StructFactory.copyStructModifierFlagsToOptionsInnerClass(node.modifierFlags, isExported(node)),
            Object.values(scopeInfo.annotations ?? {}).map((anno) => anno.clone())
        );
        NamespaceProcessor.getInstance().addInnerClassToCurrentNamespace(customComponentInnerClass);

        if (!!scopeInfo.annotations?.entry) {
            this.validateEntryParams(scopeInfo.annotations);
            this.entryAnnoInfo.push({
                name: className,
                startPosition: scopeInfo.annotations.entry.startPosition,
                endPosition: scopeInfo.annotations.entry.endPosition,
                annotation: scopeInfo.annotations.entry,
            });
            const routeName = getEntryRouteParam(definition);
            if (routeName && routeName.value) {
                this.entryRouteName = routeName.value;
            }
        }
        const newDefinition: arkts.ClassDefinition = this.createNewDefinition(
            node, 
            className, 
            definition, 
            structPropAnnoMap
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

    private validateBuildMethod(node: arkts.ETSStructDeclaration, className: string): void {
        const buildMethods = node.definition!.body.filter((member): member is arkts.MethodDefinition => {
            if (!arkts.isMethodDefinition(member)) {
                return false;
            }
            return !!member.id && arkts.isIdentifier(member.id) && member.id.name === 'build';
        });

        if (buildMethods.length === 0) {
            const position = arkts.createSourcePosition(node.endPosition.getIndex() - 1, node.endPosition.getLine());
            LogCollector.getInstance().collectLogInfo({
                node: node.definition?.ident ?? node,
                message: `The struct '${className}' must have at least and at most one 'build' method.`,
                level: LogType.ERROR,
                suggestions: [createSuggestion('build() {\n}\n', position, position, `Add a build function to the custom component`)],
            });
            return;
        }

        if (buildMethods.length > 1) {
            for (const buildMethod of buildMethods) {
                LogCollector.getInstance().collectLogInfo({
                    node: buildMethod.id ?? buildMethod,
                    message: `The struct '${className}' must have at least and at most one 'build' method.`,
                    level: LogType.ERROR,
                    suggestions: [createSuggestion('', buildMethod.startPosition, buildMethod.endPosition, `Remove the duplicate build function`)],
                });
            }
            return;
        }

        const buildMethod = buildMethods[0];
        const params = buildMethod.function?.params ?? [];
        if (params.length > 0) {
            const firstParam = params[0];
            const lastParam = params[params.length - 1];
            for (const param of params) {
                LogCollector.getInstance().collectLogInfo({
                    node: param,
                    message: `The 'build' method can not have arguments.`,
                    level: LogType.ERROR,
                    suggestions: [createSuggestion('', firstParam.startPosition, lastParam.endPosition, `Remove the parameters of the build function`)],
                });
            }
        }
    }

    private validateEntryParams(annotations: CustomComponentAnontations): void {
        const entryAnnotation = annotations.entry;
        const componentV2Annotation = annotations.componentV2;
        if (!entryAnnotation || !componentV2Annotation) {
            return;
        }
        const hasInvalidParam = entryAnnotation.properties.some(
            (property) =>
                arkts.isClassProperty(property) &&
                property.key &&
                arkts.isIdentifier(property.key) &&
                (property.key.name === 'storage' || property.key.name === 'useSharedStorage')
        );
        if (!hasInvalidParam) {
            return;
        }
        LogCollector.getInstance().collectLogInfo({
            node: entryAnnotation,
            message: `The "@Entry" decorator that has "storage" or "useSharedStorage" parameters cannot be used together with the "@ComponentV2" decorator.`,
            level: LogType.ERROR,
        });
    }

    getSystemEnvKeyType(envKeyClass: string): string | undefined {
        if (envKeyClass === StateManagementTypes.WRITABLE_ENV_KEY) {
            return StateManagementTypes.WRITABLE_SYSTEM_ENV_KEY;
        }
        if (envKeyClass === StateManagementTypes.READONLY_ENV_KEY) {
            return StateManagementTypes.READONLY_SYSTEM_ENV_KEY;
        }
        return undefined;
    }

    generateEnvTypeCheckStatements(
        definition: arkts.ClassDefinition
    ): arkts.Statement[] {
        const statements: arkts.Statement[] = [];
        for (const member of definition.body) {
            if (!arkts.isClassProperty(member) || !hasDecoratorName(member, DecoratorNames.ENV)) {
                continue;
            }
            const propertyName: string = expectName(member.key);
            const typeAnnotation = member.typeAnnotation;
            let envValueExpr: arkts.Expression | undefined;
            for (const anno of member.annotations) {
                if (anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === DecoratorNames.ENV) {
                    envValueExpr = getValueInObjectAnnotation(anno, DecoratorNames.ENV, 'value');
                    break;
                }
            }
            if (!envValueExpr || !arkts.isStringLiteral(envValueExpr)) {
                continue;
            }
            const envPattern = /^(WritableEnvKey|ReadonlyEnvKey)\.(\w+)$/;
            const match = envPattern.exec(envValueExpr.str);
            if (!match) {
                continue;
            }
            const envKeyClass = match[1];
            const envKeyMember = match[2];
            const systemEnvKeyType = this.getSystemEnvKeyType(envKeyClass);
            if (!systemEnvKeyType) {
                continue;
            }

            this.importCollector.collectSource(envKeyClass, ARKUI_STATE_MANAGEMENT_DECORATOR_SOURCE_NAME);
            this.importCollector.collectImport(envKeyClass);
            this.importCollector.collectSource(systemEnvKeyType, ARKUI_STATE_MANAGEMENT_DECORATOR_SOURCE_NAME);
            this.importCollector.collectImport(systemEnvKeyType);

            const memberExpr = arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(envKeyClass),
                arkts.factory.createIdentifier(envKeyMember),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            );
            if (envValueExpr.startPosition && envValueExpr.endPosition) {
                memberExpr.startPosition = envValueExpr.startPosition;
                memberExpr.endPosition = envValueExpr.endPosition;
            }

            const systemEnvKeyRef = arkts.factory.createETSTypeReference(
                arkts.factory.createETSTypeReferencePart(
                    arkts.factory.createIdentifier(systemEnvKeyType),
                    typeAnnotation
                        ? arkts.factory.createTSTypeParameterInstantiation([typeAnnotation.clone()])
                        : undefined
                )
            );
            const varDeclarator = arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_CONST,
                arkts.factory.createIdentifier(`__env_${propertyName}`, systemEnvKeyRef),
                memberExpr
            );
            const varDecl = arkts.factory.createVariableDeclaration(
                arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_CONST,
                [varDeclarator]
            );
            if (envValueExpr.startPosition && envValueExpr.endPosition) {
                varDecl.startPosition = envValueExpr.startPosition;
                varDecl.endPosition = envValueExpr.endPosition;
            }
            statements.push(varDecl);
        }
        return statements;
    }

    generateCustomEnvTypeCheckStatements(
        definition: arkts.ClassDefinition
    ): arkts.Statement[] {
        const statements: arkts.Statement[] = [];
        for (const member of definition.body) {
            if (!arkts.isClassProperty(member) || !hasDecoratorName(member, DecoratorNames.CUSTOM_ENV)) {
                continue;
            }
            const propertyName: string = expectName(member.key);
            const typeAnnotation = member.typeAnnotation;
            let envKeyExpr: arkts.Expression | undefined;
            for (const anno of member.annotations) {
                if (anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === DecoratorNames.CUSTOM_ENV) {
                    envKeyExpr = getValueInObjectAnnotation(anno, DecoratorNames.CUSTOM_ENV, 'value');
                    break;
                }
            }
            if (!envKeyExpr || !arkts.isStringLiteral(envKeyExpr)) {
                continue;
            }
            const envKeyId = arkts.factory.createIdentifier(envKeyExpr.str);
            if (envKeyExpr.startPosition && envKeyExpr.endPosition) {
                envKeyId.startPosition = envKeyExpr.startPosition;
                envKeyId.endPosition = envKeyExpr.endPosition;
            }
            const customEnvKeyType = arkts.factory.createETSTypeReference(
                arkts.factory.createETSTypeReferencePart(
                    arkts.factory.createIdentifier(StateManagementTypes.CUSTOM_ENV_KEY),
                    typeAnnotation
                        ? arkts.factory.createTSTypeParameterInstantiation([typeAnnotation.clone()])
                        : undefined
                )
            );
            const varDeclarator = arkts.factory.createVariableDeclarator(
                arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_CONST,
                arkts.factory.createIdentifier(`__customEnv_${propertyName}`, customEnvKeyType),
                envKeyId
            );
            const varDecl = arkts.factory.createVariableDeclaration(
                arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_CONST,
                [varDeclarator]
            );
            if (envKeyExpr.startPosition && envKeyExpr.endPosition) {
                varDecl.startPosition = envKeyExpr.startPosition;
                varDecl.endPosition = envKeyExpr.endPosition;
            }
            statements.push(varDecl);
        }
        return statements;
    }

    generateResolveDecoratorSymbolsMethod(
        definition: arkts.ClassDefinition
    ): arkts.MethodDefinition | undefined {
        const bodyStatements: arkts.Statement[] = [
            ...this.generateEnvTypeCheckStatements(definition),
            ...this.generateCustomEnvTypeCheckStatements(definition),
        ];
        if (bodyStatements.length === 0) {
            return undefined;
        }

        const body = arkts.factory.createBlockStatement(bodyStatements);
        const returnTypeAnnotation = arkts.factory.createETSPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID);
        const key = arkts.factory.createIdentifier(CustomComponentNames.RESOLVE_DECORATOR_SYMBOLS_METHOD);
        const modifiers =
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC |
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC;

        const scriptFunction = arkts.factory.createScriptFunction(
            body,
            undefined,
            [],
            returnTypeAnnotation,
            false,
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            key,
            undefined
        );

        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            key.clone(),
            arkts.factory.createFunctionExpression(key.clone(), scriptFunction),
            modifiers,
            false
        );
    }

    createNewDefinition(
        node: arkts.ClassDeclaration | arkts.ETSStructDeclaration,
        className: string,
        definition: arkts.ClassDefinition,
        structPropAnnoMap: Map<AstNodePointer, AnnotationRecord<StructPropertyAnnotations, StructPropertyAnnotationInfo> | undefined>
    ): arkts.ClassDefinition {
        const staticMethodBody: arkts.AstNode[] = [];
        const isExportClass = arkts.hasModifierFlag(node, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_EXPORT);
        if (isExportClass) {
            const buildCompatibleNode: arkts.MethodDefinition = this.createStaticMethod(definition);
            if (!!buildCompatibleNode) {
                staticMethodBody.push(buildCompatibleNode);
            }
        }
        const resolveMethod = this.generateResolveDecoratorSymbolsMethod(definition);
        if (resolveMethod) {
            staticMethodBody.push(resolveMethod);
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
                arkts.factory.createETSTypeReference(
                    arkts.factory.createETSTypeReferencePart(
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
                        if (!scopeInfo.isDecl && arkts.isClassProperty(st)) {
                            UIFactory.preprocessClassPropertyModifier(st, structPropAnnoMap.get(st.peer));
                        }
                        return StructFactory.updateStructConstructor(st, scopeInfo);
                    }),
                    ...staticMethodBody,
                ],
                definition.modifiers,
                arkts.classDefinitionFlags(definition) | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_FINAL,
                definition.annotations
            );
    }

    generateComponentInnerClass(
        name: string,
        modifiers: arkts.Es2pandaModifierFlags,
        annotations?: readonly arkts.AnnotationUsage[]
    ): arkts.ClassDeclaration {
        const ctor = EntryFactory.generateConstructor();
        const definition: arkts.ClassDefinition = arkts.factory
            .createClassDefinition(
                arkts.factory.createIdentifier(getCustomComponentOptionsName(name)),
                undefined,
                undefined,
                [],
                undefined,
                undefined,
                [...(this.structMembersMap.get(name) || []), ctor],
                arkts.Es2pandaClassDefinitionModifiers.CLASS_DEFINITION_MODIFIERS_CLASS_DECL |
                    arkts.Es2pandaClassDefinitionModifiers.CLASS_DEFINITION_MODIFIERS_DECLARATION |
                    arkts.Es2pandaClassDefinitionModifiers.CLASS_DEFINITION_MODIFIERS_ID_REQUIRED,
                modifiers
            )
            .setCtor(ctor)
            .setAnnotations(annotations ?? []);
        const newClass = arkts.factory.createClassDeclaration(definition);
        newClass.modifierFlags = modifiers;
        return newClass;
    }

    createInterfaceInnerMember(
        member: arkts.ClassProperty, 
        annotationRecord: AnnotationRecord<StructPropertyAnnotations, StructPropertyAnnotationInfo> | undefined
    ): arkts.AstNode[] {
        const annotations: arkts.AnnotationUsage[] = collectAnnotationsFromInfo(annotationRecord);
        const isRequired: boolean = checkIsRequiredPropertyFromAnnotationInfo(annotationRecord);
        const originalName: string = expectName(member.key);
        const originalMember: arkts.ClassProperty = PropertyFactory.createOptionalClassProperty({
            name: originalName,
            propertyType: member.typeAnnotation?.clone(),
            modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
            isRequired
        })
        .setAnnotations(annotations);
        const optionsHasMember = UIFactory.createOptionsHasMember(originalName);
        const typedAnnotations = collectAnnotationForBackingFromInfo(annotationRecord);
        if (typedAnnotations.length > 0) {
            const newName: string = backingField(originalName);
            const newMember: arkts.ClassProperty = PropertyFactory
                .createOptionalClassProperty({
                    name: newName,
                    propertyType: member.typeAnnotation?.clone(),
                    modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
                })
                .setAnnotations(typedAnnotations);
            return [originalMember, newMember, optionsHasMember];
        }
        return [originalMember, optionsHasMember];
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

    private checkDuplicateEntry(): void {
        if (this.entryAnnoInfo.length <= 1) {
            return;
        }
        for (const info of this.entryAnnoInfo) {
            const annotation = info.annotation;
            if (!annotation) {
                continue;
            }
            LogCollector.getInstance().collectLogInfo({
                node: annotation,
                message: `A page can't contain more than one '@Entry' annotation.`,
                level: LogType.ERROR,
                suggestions: [createSuggestion('', ...getPositionRangeFromAnnotation(annotation), `Remove the duplicate '@Entry' annotation.`)],
            });
        }
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
                let _newSt: arkts.Statement | undefined;
                withAPIVersion(
                    { version: APIVersions.API_24, compare: APIComparison.LESS_THAN_OR_EQUAL },
                    (sdkVersion: APIVersions) => {
                        if (
                            arkts.isTSInterfaceDeclaration(st) &&
                            isCustomDialogControllerOptions(st, this.externalSourceName)
                        ) {
                            _newSt = UIFactory.updateCustomDialogOptionsInterface(st);
                        }
                    },
                    { ignoreCompare: true }
                );
                if (_newSt !== undefined) {
                    return _newSt;
                }
                withAPIVersion(
                    { version: APIVersions.API_24, compare: APIComparison.GREATER_THAN },
                    (sdkVersion: APIVersions) => {
                        if (
                            arkts.isFunctionDeclaration(st) 
                                && arkts.hasModifierFlag(st, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE)
                                && hasDecoratorName(st, DecoratorNames.BUILDER)
                        ) {
                            const functionName = st.function!.id?.name;
                            const returnType = st.function!.returnTypeAnnotation;
                            const returnTypeName = expectNameInTypeReference(returnType);
                            if (!!functionName && !!returnTypeName && returnTypeName.name === `${functionName}Attribute`) {
                                st.function!.setReturnTypeAnnotation(
                                    arkts.factory.createETSPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID)
                                );
                            }
                        }
                    }
                );
            }
            return st;
        });
        let newNode = arkts.factory.updateETSModule(node, newStatements);
        if (isNamespace) {
            newNode = NamespaceProcessor.getInstance().updateCurrentNamespace(newNode);
        } else {
            newNode = NamespaceProcessor.getInstance().updateCurrentNamespace(this.processRootETSModule(newNode));
        }
        NamespaceProcessor.getInstance().exit();
        return newNode;
    }

    visitor(node: arkts.AstNode): arkts.AstNode {
        if (!arkts.isETSModule(node)) {
            return node;
        }
        const newNode = this.visitETSModule(node);
        this.checkDuplicateEntry();
        LogCollector.getInstance().emitLogInfo();
        LogCollector.getInstance().reset();
        return newNode;
    }
}
