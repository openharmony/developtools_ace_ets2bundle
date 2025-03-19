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

import * as arkts from "@koalaui/libarkts"
import { getInteropPath } from "../path"
const interop = require(getInteropPath())
const nullptr = interop.nullptr
import { AbstractVisitor } from "../common/abstract-visitor";
import { hasDecorator, DecoratorNames } from "./property-translators/utils"
import { EntryHandler } from "./entry-translators/entry"

export interface ComponentTransformerOptions {
    arkui: string
}

export class ComponentTransformer extends AbstractVisitor {
    constructor(private options?: ComponentTransformerOptions) {
        super()
    }

    private context: { componentNames: string[] } = { componentNames: [] }

    isComponentStruct(node: arkts.StructDeclaration): boolean {
        // For now just rewrite any struct
        return true
    }

    createImportDeclaration() {
        return arkts.factory.createImportDeclaration(
            // TODO: es2panda has already resolved the "paths" section
            arkts.factory.create1StringLiteral(this.options?.arkui ?? '@ohos.arkui.runtime'),
            [
                arkts.factory.createImportSpecifier(
                    arkts.factory.createIdentifier('StructBase'),
                    nullptr // TODO: wtf
                )
            ],
            arkts.Es2pandaImportKinds.IMPORT_KINDS_TYPE,
            false
        )
    }

    processEtsScript(node: arkts.EtsScript): arkts.EtsScript {
        const entryWrapper = EntryHandler.instance.createEntryWrapper();
        const interfaceDeclarations = this.context.componentNames.map(
            name => arkts.factory.createInterfaceDeclaration(
                [],
                arkts.factory.createIdentifier(`__Options_${name}`),
                nullptr, // TODO: wtf
                arkts.factory.createBlock([]),
                false,
                false
            )
        )
        return arkts.factory.updateEtsScript(
            node,
            [
                this.createImportDeclaration(),
                ...node.statements,
                ...interfaceDeclarations,
                ...entryWrapper
            ]
        )
    }

    processComponent(node: arkts.ClassDeclaration | arkts.StructDeclaration): arkts.ClassDeclaration | arkts.StructDeclaration {
        const className = node.definition?.ident?.name
        if (!className) {
            throw "Non Empty className expected for Component"
        }
        let entryStorageProperty = null;
        if (hasDecorator(node.definition, DecoratorNames.ENTRY)) {
            EntryHandler.instance.rememberEntryFunction(node);
            if (node.definition?.annotations[0].properties[0] != undefined) {
                const key = JSON.parse(node.definition?.annotations[0].properties[0].dumpJson())["key"]["name"];
                const EntryRightValue = JSON.parse(node.definition?.annotations[0].properties[0].dumpJson())["value"]["value"];
                if (key === 'storage') {
                    entryStorageProperty = arkts.factory.createClassProperty(
                        arkts.factory.createIdentifier("_entry_local_storage_"),
                        arkts.factory.createIdentifier(EntryRightValue),
                        undefined,
                        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
                        false
                    );
                }
            }
        }
        arkts.GlobalInfo.getInfoInstance().add(className);
        this.context.componentNames.push(className)

        if (!node.definition) {
            return node
        }
        const newDefinition = arkts.factory.updateClassDefinition(
            node.definition,
            node.definition?.ident,
            undefined,
            undefined, // superTypeParams doen't work
            // arkts.factory.createTSTypeParameterInstantiation(
            //     [
            //         arkts.factory.createTypeReference(
            //             arkts.factory.createTypeReferencePart(
            //                 arkts.factory.createIdentifier("H")
            //             )
            //         ),
            //         arkts.factory.createTypeReferenceFromId(
            //             arkts.factory.createIdentifier(`__Options_${className}`)
            //         ),
            //     ]
            // ),
            node.definition?.implements,
            undefined,
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(
                    arkts.factory.createIdentifier('StructBase'),
                    arkts.factory.createTSTypeParameterInstantiation(
                        [
                            arkts.factory.createTypeReference(
                                arkts.factory.createTypeReferencePart(
                                    arkts.factory.createIdentifier(className)
                                )
                            ),
                            arkts.factory.createTypeReference(
                                arkts.factory.createTypeReferencePart(
                                    arkts.factory.createIdentifier(`__Options_${className}`)
                                )
                            ),
                        ]
                    )
                )
            ),
            entryStorageProperty ? [entryStorageProperty, ...node.definition?.body] : node.definition?.body,
            node.definition?.modifiers,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_FINAL
        )

        if (arkts.isStructDeclaration(node)) {
            return arkts.factory.createClassDeclaration(
                newDefinition
            )
        } else {
            return arkts.factory.updateClassDeclaration(
                node,
                newDefinition
            )
        }
    }

    visitor(node: arkts.AstNode): arkts.AstNode {
        const newNode = this.visitEachChild(node)
        if (arkts.isEtsScript(newNode)) {
            return this.processEtsScript(newNode)
        }
        if (arkts.isStructDeclaration(newNode) && this.isComponentStruct(newNode)) {
            return this.processComponent(newNode)
        }
        return newNode
    }
}
