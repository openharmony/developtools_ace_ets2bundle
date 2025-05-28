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
import { EntryWrapperNames } from './utils';
import { annotation, createAndInsertImportDeclaration } from '../../common/arkts-utils';
import { ENTRY_POINT_IMPORT_SOURCE_NAME } from '../../common/predefines';

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
            arkts.factory.createCallExpression(
                arkts.factory.createIdentifier(name),
                undefined,
                []
            )
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
                member.scriptFunction.setAnnotations([annotation('memo')]);
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
                member.setAnnotations([annotation('memo')]);
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
     * create and insert `import { EntryPoint as EntryPoint } from "@ohos.arkui.UserView";`
     * to the top of script's statements.
     */
    static createAndInsertEntryPointImport(program?: arkts.Program) {
        const source: arkts.StringLiteral = arkts.factory.create1StringLiteral(ENTRY_POINT_IMPORT_SOURCE_NAME);
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
}
