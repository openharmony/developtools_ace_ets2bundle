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
import * as path from 'path';
import { annotation, createAndInsertImportDeclaration } from '../../common/arkts-utils';
import { CUSTOM_COMPONENT_IMPORT_SOURCE_NAME, EntryWrapperNames, NavigationNames } from '../../common/predefines';
import { ProjectConfig } from '../../common/plugin-context';
import { factory as uiFactory } from '../ui-factory';
import { getRelativePagePath } from './utils';
import { addMemoAnnotation } from '../../collectors/memo-collectors/utils';

export class factory {
    /**
     * insert an 'entry' method to an entry wrapper class.
     *
     * @param node entry wrapper class declaration node.
     */
    static registerEntryFunction(node: arkts.ClassDeclaration): arkts.AstNode {
        const definition: arkts.ClassDefinition | undefined = node.definition;
        const classname = node?.definition?.ident?.name;
        if (!definition || !classname) {
            throw new Error('Node definition is undefined');
        }
        const updateClassDef: arkts.ClassDefinition = arkts.factory.updateClassDefinition(
            definition,
            definition.ident,
            definition.typeParams,
            definition.superTypeParams,
            definition.implements,
            undefined,
            definition.super,
            [...definition.body, factory.generateEntryFunction(classname)],
            definition.modifiers,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE
        );
        return arkts.factory.updateClassDeclaration(node, updateClassDef);
    }

    /**
     * insert an 'entry' property to an entry wrapper class.
     *
     * @param node entry wrapper class declaration node.
     * @deprecated
     */
    static registerEntryProperty(node: arkts.ClassDeclaration): arkts.AstNode {
        const definition: arkts.ClassDefinition | undefined = node.definition;
        const classname = node?.definition?.ident?.name;
        if (!definition || !classname) {
            throw new Error('Node definition is undefined');
        }
        const updateClassDef: arkts.ClassDefinition = arkts.factory.updateClassDefinition(
            definition,
            definition.ident,
            definition.typeParams,
            definition.superTypeParams,
            definition.implements,
            undefined,
            definition.super,
            [...definition.body, factory.generateEntryProperty(classname)],
            definition.modifiers,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE
        );
        return arkts.factory.updateClassDeclaration(node, updateClassDef);
    }

    /**
     * create `entry(): void { <name>(); }` class method for the entry wrapper class,
     * which calls the struct within the method.
     *
     * @param name class/struct name that has `@Entry` annotation.
     */
    static generateEntryFunction(name: string): arkts.MethodDefinition {
        const exp = arkts.factory.createExpressionStatement(
            arkts.factory.createCallExpression(arkts.factory.createIdentifier(name), undefined, [])
        );
        const key: arkts.Identifier = arkts.factory.createIdentifier(EntryWrapperNames.ENTRY_FUNC);
        const block = arkts.factory.createBlock([exp]);
        const entryScript = arkts.factory
            .createScriptFunction(
                block,
                arkts.FunctionSignature.createFunctionSignature(
                    undefined,
                    [],
                    arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                    false
                ),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
            )
            .setIdent(key);

        const def = arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            key,
            entryScript,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
            false
        );

        return def;
    }

    static generateConstructor(): arkts.MethodDefinition {
        const key: arkts.Identifier = arkts.factory.createIdentifier('constructor');
        const block = arkts.factory.createBlock([]);
        const entryScript = arkts.factory
            .createScriptFunction(
                block,
                arkts.FunctionSignature.createFunctionSignature(undefined, [], undefined, false),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_CONSTRUCTOR |
                    arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_IMPLICIT_SUPER_CALL_NEEDED,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC |
                    arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_CONSTRUCTOR
            )
            .setIdent(key);
        const def = arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_CONSTRUCTOR,
            key,
            entryScript,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            false
        );
        return def;
    }

    /**
     * create `entry = (): void => { <name>(); }` class property for the entry wrapper class,
     * which calls the struct within the arrow function.
     *
     * @param name class/struct name that has `@Entry` annotation.
     * @deprecated
     */
    static generateEntryProperty(name: string): arkts.ClassProperty {
        const exp = arkts.factory.createExpressionStatement(
            arkts.factory.createCallExpression(arkts.factory.createIdentifier(name), undefined, [])
        );
        const key: arkts.Identifier = arkts.factory.createIdentifier(EntryWrapperNames.ENTRY_FUNC);
        const block: arkts.BlockStatement = arkts.factory.createBlock([exp]);
        const signature: arkts.FunctionSignature = arkts.FunctionSignature.createFunctionSignature(
            undefined,
            [],
            arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
            false
        );
        const entryScript: arkts.ScriptFunction = arkts.factory
            .createScriptFunction(
                block,
                signature,
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
            )
            .setIdent(key);

        const def = arkts.factory.createClassProperty(
            key,
            arkts.factory.createArrowFunction(entryScript),
            arkts.factory.createFunctionType(signature, arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW),
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
            false
        );

        return def;
    }

    /**
     * create `__EntryWrapper_Entry` entry wrapper class that contains an 'entry' method that
     * calls the struct within the method.
     *
     * @param name class/struct name that has `@Entry` annotation.
     */
    static generateEntryWrapper(name: string): arkts.ClassDeclaration {
        const ctor = factory.generateConstructor();
        const definition: arkts.ClassDefinition = arkts.factory
            .createClassDefinition(
                arkts.factory.createIdentifier(EntryWrapperNames.WRAPPER_CLASS_NAME),
                undefined,
                undefined,
                [],
                undefined,
                arkts.factory.createTypeReference(
                    arkts.factory.createTypeReferencePart(
                        arkts.factory.createIdentifier(EntryWrapperNames.ENTRY_POINT_CLASS_NAME)
                    )
                ),
                [factory.generateEntryFunction(name), ctor],
                arkts.Es2pandaClassDefinitionModifiers.CLASS_DEFINITION_MODIFIERS_CLASS_DECL |
                    arkts.Es2pandaClassDefinitionModifiers.CLASS_DEFINITION_MODIFIERS_DECLARATION |
                    arkts.Es2pandaClassDefinitionModifiers.CLASS_DEFINITION_MODIFIERS_ID_REQUIRED,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE
            )
            .setCtor(ctor as any);
        const newClass = arkts.factory.createClassDeclaration(definition);
        newClass.modifiers = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE;
        return newClass;
    }

    /**
     * add `@memo` to all class methods that are named 'entry'.
     *
     * @param node class declaration node
     */
    static addMemoToEntryWrapperClassMethods(node: arkts.ClassDeclaration): void {
        node.definition?.body.forEach((member) => {
            if (
                arkts.isMethodDefinition(member) &&
                !!member.scriptFunction.id &&
                member.scriptFunction.id.name === EntryWrapperNames.ENTRY_FUNC
            ) {
                addMemoAnnotation(member.scriptFunction);
                arkts.NodeCache.getInstance().collect(member);
            }
        });
    }

    /**
     * add `@memo` to the class property's value (expecting an arrow function), where the property is named 'entry'.
     *
     * @param node class declaration node
     * @deprecated
     */
    static addMemoToEntryWrapperPropertyValue(node: arkts.ClassDeclaration): void {
        node.definition?.body.forEach((member) => {
            if (
                arkts.isClassProperty(member) &&
                !!member.value &&
                arkts.isArrowFunctionExpression(member.value) &&
                !!member.key &&
                arkts.isIdentifier(member.key) &&
                member.key.name === EntryWrapperNames.ENTRY_FUNC
            ) {
                member.setAnnotations([annotation('Memo')]);
            }
        });
    }

    /**
     * create `private _entry_local_storage_ = <name>;` class property
     * from `{storage: "<name>"}` in `@Entry`'s properties.
     *
     * @param annotation `@Entry` annotation.
     */
    static createEntryLocalStorageInClass(property: arkts.ClassProperty) {
        const value = property.value as arkts.StringLiteral;
        return arkts.factory.createClassProperty(
            arkts.factory.createIdentifier(EntryWrapperNames.ENTRY_STORAGE_LOCAL_STORAGE_PROPERTY_NAME),
            arkts.factory.createIdentifier(value.str),
            undefined,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
            false
        );
    }

    /**
     * create and insert `import { EntryPoint as EntryPoint } from "arkui.component.customComponent";`
     * to the top of script's statements.
     */
    static createAndInsertEntryPointImport(program?: arkts.Program) {
        const source: arkts.StringLiteral = arkts.factory.create1StringLiteral(CUSTOM_COMPONENT_IMPORT_SOURCE_NAME);
        const imported: arkts.Identifier = arkts.factory.createIdentifier(EntryWrapperNames.ENTRY_POINT_CLASS_NAME);
        // Insert this import at the top of the script's statements.
        if (!program) {
            throw Error('Failed to insert import: Transformer has no program');
        }
        createAndInsertImportDeclaration(
            source,
            imported,
            imported,
            arkts.Es2pandaImportKinds.IMPORT_KINDS_VALUE,
            program
        );
    }

    /**
     * transform `@Entry` storage params, e.g. `@Entry`({useSharedStorage: ..., storage: ...})
     */
    static transformStorageParams(
        storage: arkts.ClassProperty | undefined,
        useSharedStorage: arkts.ClassProperty | undefined,
        definition: arkts.ClassDefinition
    ): void {
        if (!storage && !useSharedStorage) {
            return;
        }
        const ctor: arkts.MethodDefinition | undefined = definition.body.find(
            (member) =>
                arkts.isMethodDefinition(member) &&
                member.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_CONSTRUCTOR
        ) as arkts.MethodDefinition | undefined;
        if (!ctor) {
            return;
        }
        let sharedArg = arkts.factory.createBooleanLiteral(false);
        if (useSharedStorage && useSharedStorage.value && arkts.isBooleanLiteral(useSharedStorage.value)) {
            sharedArg = useSharedStorage.value;
        }
        let storageArg = arkts.factory.createUndefinedLiteral();
        if (storage && storage.value && arkts.isStringLiteral(storage.value)) {
            storageArg = arkts.factory.createCallExpression(
                arkts.factory.createIdentifier(storage.value.str),
                undefined,
                undefined
            );
        }
        const superCall = arkts.factory.createExpressionStatement(
            arkts.factory.createCallExpression(arkts.factory.createSuperExpression(), undefined, [
                sharedArg,
                storageArg,
            ])
        );
        if (ctor.scriptFunction.body && arkts.isBlockStatement(ctor.scriptFunction.body)) {
            ctor.scriptFunction.setBody(
                arkts.factory.updateBlock(ctor.scriptFunction.body, [...ctor.scriptFunction.body.statements, superCall])
            );
        }
    }

    /**
     * helper for callRegisterNamedRouter to generate NavInterface arg
     */
    static navInterfaceArg(
        projectConfig: ProjectConfig | undefined,
        fileAbsName: string | undefined
    ): arkts.TSAsExpression {
        const projectRoot = projectConfig?.moduleRootPath
            ? path.join(projectConfig.moduleRootPath, 'src', 'main', 'ets')
            : '';
        const pageFullPath = getRelativePagePath(projectConfig?.projectPath ?? '', fileAbsName ?? '');
        const pagePath = getRelativePagePath(projectRoot, fileAbsName ?? '');
        return arkts.factory.createTSAsExpression(
            arkts.factory.createObjectExpression(
                arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
                [
                    factory.createNavProperty(NavigationNames.BUNDLE_NAME, projectConfig?.bundleName),
                    factory.createNavProperty(NavigationNames.MODULE_NAME, projectConfig?.moduleName),
                    factory.createNavProperty(NavigationNames.PAGE_PATH, pagePath),
                    factory.createNavProperty(NavigationNames.PAGE_FULL_PATH, pageFullPath),
                    factory.createNavProperty(NavigationNames.INTEGRATED_HSP, projectConfig?.integratedHsp?.toString()),
                ],
                false
            ),
            uiFactory.createTypeReferenceFromString(NavigationNames.NAVINTERFACE),
            false
        );
    }

    /**
     * helper for navInterfaceArg to generate class properties, e.g. buneleName: '...'
     */
    static createNavProperty(key: NavigationNames, value: string | undefined): arkts.Property {
        return arkts.factory.createProperty(
            arkts.factory.createIdentifier(key),
            arkts.factory.createStringLiteral(value ?? '')
        );
    }

    /**
     * generate __EntryWrapper.RegisterNamedRouter(...)
     */
    static callRegisterNamedRouter(
        entryRouteName: string | undefined,
        projectConfig: ProjectConfig | undefined,
        fileAbsName: string | undefined
    ): arkts.ExpressionStatement {
        return arkts.factory.createExpressionStatement(
            arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    arkts.factory.createIdentifier(EntryWrapperNames.WRAPPER_CLASS_NAME),
                    arkts.factory.createIdentifier(EntryWrapperNames.REGISTER_NAMED_ROUTER),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                undefined,
                [
                    arkts.factory.createStringLiteral(entryRouteName ?? ''),
                    arkts.factory.createETSNewClassInstanceExpression(
                        arkts.factory.createTypeReference(
                            arkts.factory.createTypeReferencePart(
                                arkts.factory.createIdentifier(EntryWrapperNames.WRAPPER_CLASS_NAME)
                            )
                        ),
                        []
                    ),
                    factory.navInterfaceArg(projectConfig, fileAbsName),
                ]
            )
        );
    }

    /**
     * generate interface NavInterface in header arkui.component.customComponent
     */
    static createNavInterface(): arkts.TSInterfaceDeclaration {
        return arkts.factory.createInterfaceDeclaration(
            [],
            arkts.factory.createIdentifier(NavigationNames.NAVINTERFACE),
            undefined,
            arkts.factory.createInterfaceBody([
                this.createClassProp(NavigationNames.BUNDLE_NAME),
                this.createClassProp(NavigationNames.MODULE_NAME),
                this.createClassProp(NavigationNames.PAGE_PATH),
                this.createClassProp(NavigationNames.PAGE_FULL_PATH),
                this.createClassProp(NavigationNames.INTEGRATED_HSP),
            ]),
            false,
            false
        );
    }

    /**
     * helper for createNavInterface to generate class properties
     */
    static createClassProp(propName: string): arkts.ClassProperty {
        return arkts.factory.createClassProperty(
            arkts.factory.createIdentifier(propName),
            undefined,
            uiFactory.createTypeReferenceFromString('string'),
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
            false
        );
    }

    /**
     * helper for generateRegisterNamedRouter to generate param decl, e.g: `routerName: string`
     */
    static registerRouteParam(name: EntryWrapperNames, type: string): arkts.ETSParameterExpression {
        return arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(name, uiFactory.createTypeReferenceFromString(type)),
            undefined
        );
    }

    /**
     * generate generateRegisterNamedRouter method in header arkui.component.customComponent
     */
    static generateRegisterNamedRouter(): arkts.MethodDefinition {
        const params = [
            factory.registerRouteParam(EntryWrapperNames.ROUTER_NAME, 'string'),
            factory.registerRouteParam(EntryWrapperNames.INSTANCE, EntryWrapperNames.ENTRY_POINT_CLASS_NAME),
            factory.registerRouteParam(EntryWrapperNames.PARAM, NavigationNames.NAVINTERFACE),
        ];
        return uiFactory.createMethodDefinition({
            key: arkts.factory.createIdentifier(EntryWrapperNames.REGISTER_NAMED_ROUTER),
            kind: arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            function: {
                body: arkts.factory.createBlock([]),
                params: params,
                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
                modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC,
            },
            modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC,
        });
    }
}
