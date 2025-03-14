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

import * as arkts from "@koalaui/libarkts"

import { AbstractVisitor } from "../../common/abstract-visitor";
import { annotation } from "../../common/arkts-utils";

export class EntryHandler {
    public static instance: EntryHandler = new EntryHandler
    public rememberEntryFunction(node: arkts.ClassDeclaration | arkts.StructDeclaration) {
        const classname = node?.definition?.ident?.name
        if (classname == undefined) {
            return;
        }
        this.entryDefClassName.add(classname)
    }
    public hasEntryAnnotation(node: arkts.ClassDeclaration | arkts.StructDeclaration): boolean {
        const classname = node?.definition?.ident?.name
        if (classname == undefined) {
            return false;
        }
        return classname.startsWith(EntryHandler.WRAPPER_PREFIX) && this.entryDefClassName.has(classname.slice(EntryHandler.WRAPPER_PREFIX.length))
    }
    public registerEntryFunction(node: arkts.ClassDeclaration): arkts.AstNode {
        const definition: arkts.ClassDefinition | undefined = node.definition;
        const classname = node?.definition?.ident?.name
        if (!definition || !classname) {
            throw new Error("Node definition is undefined");
        }
        const updateClassDef: arkts.ClassDefinition = arkts.factory.updateClassDefinition(
            definition,
            definition.ident,
            definition.typeParams,
            definition.superTypeParams,
            definition.implements,
            undefined,
            definition.super,
            [...definition.body, this.generateEntryFunc(classname)],
            definition.modifiers,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE
        )
        return arkts.factory.updateClassDeclaration(node, updateClassDef);
    }
    public createEntryWrapper(): arkts.ClassDefinition[] {
        let result: arkts.ClassDefinition[] = []
        this.entryDefClassName.forEach(classname => {
            result.push(this.generateEntryWrapper(classname))
        }
        )
        return result
    }
    public updateEntryAnnotion(node: arkts.ClassDeclaration | arkts.StructDeclaration) {
        node.definition?.body.forEach(member => {
            console.log("updateEntryAnnotion")
            if (arkts.isMethodDefinition(member)) {
                if (member.scriptFunction.ident?.name == EntryHandler.ENTRY_FUNC) {
                    member.scriptFunction.annotations = [annotation("memo")];
                }
            }
        })
    }

    private static ENTRY_FUNC: string = 'entry'
    private static WRAPPER_PREFIX: string = '__EntryWrapper_'
    private entryDefClassName: Set<string> = new Set<string>()
    private generateEntryFunc(name: string): arkts.MethodDefinition {
        const exp = arkts.factory.createCallExpression(
            arkts.factory.createIdentifier(name),
            undefined,
            [arkts.factory.createUndefinedLiteral()],
        )
        const block = arkts.factory.createBlock(
            [exp]
        )
        const entryScript = arkts.factory.createScriptFunction(
            block,
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_GETTER,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
            false,
            undefined,
            [],
            undefined,
            arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID)
        )
        const def = arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_CONSTRUCTOR,
            arkts.factory.createIdentifier(EntryHandler.ENTRY_FUNC),
            arkts.factory.createFunctionExpression(entryScript),
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
            false
        )
        return def;
    }

    private generateEntryWrapper(name: string): arkts.ClassDefinition {
        return arkts.factory.createClassDefinition(
            arkts.factory.createIdentifier(this.entryWrapper(name)),
            undefined,
            undefined,
            [],
            undefined,
            undefined,
            [this.generateEntryFunc(name)],
            arkts.Es2pandaClassDefinitionModifiers.CLASS_DEFINITION_MODIFIERS_NONE,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        )
    }

    private entryMarker(name: string): string {
        return EntryHandler.ENTRY_FUNC
    }

    private entryWrapper(name: string): string {
        return EntryHandler.WRAPPER_PREFIX + name
    }
}

export class EntryTransformer extends AbstractVisitor {
    visitor(node: arkts.AstNode): arkts.AstNode {
        const newNode = this.visitEachChild(node)
        if (arkts.isClassDeclaration(newNode) && EntryHandler.instance.hasEntryAnnotation(newNode)) {
            return EntryHandler.instance.registerEntryFunction(newNode)
        }
        return newNode
    }
}