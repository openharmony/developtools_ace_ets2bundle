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
import { AbstractVisitor, VisitorOptions } from "../common/abstract-visitor";
import { hasDecorator, DecoratorNames, isDecoratorAnnotation } from "./property-translators/utils"
import { EntryHandler } from "./entry-translators/entry"
import { CustomComponentNames } from "./utils";

export interface ComponentTransformerOptions extends VisitorOptions {
    arkui?: string
}

export class ComponentTransformer extends AbstractVisitor {
    private structAnnotationMap: Map<string, readonly arkts.AnnotationUsage[]>;
    private arkui?: string;

    constructor(options?: ComponentTransformerOptions) {
        const _options: ComponentTransformerOptions = options ?? {};
        super(_options);
        this.arkui = _options.arkui;
        this.structAnnotationMap = new Map();
    }

    private context: { componentNames: string[] } = { componentNames: [] }

    isComponentStruct(node: arkts.StructDeclaration): boolean {
        // For now just rewrite any struct
        return true;
    }

    createImportDeclaration(): void {
        const source: arkts.StringLiteral = arkts.factory.create1StringLiteral(
            this.arkui ?? CustomComponentNames.COMPONENT_DEFAULT_IMPORT
        );
        const resolvedSource: arkts.StringLiteral = arkts.factory.create1StringLiteral(
            arkts.ImportPathManager.create().resolvePath('', source.str)
        );
        const imported: arkts.Identifier = arkts.factory.createIdentifier(
            CustomComponentNames.COMPONENT_CLASS_NAME
        );
        const importDecl: arkts.ETSImportDeclaration = arkts.factory.createImportDeclaration(
            arkts.ImportSource.createImportSource(
                source,
                resolvedSource,
                false
            ),
            [
                arkts.factory.createImportSpecifier(
                    imported,
                    imported
                )
            ],
            arkts.Es2pandaImportKinds.IMPORT_KINDS_VALUE
        )
        // Insert this import at the top of the script's statements.
        arkts.importDeclarationInsert(importDecl);
        return;
    }

    processEtsScript(node: arkts.EtsScript): arkts.EtsScript {
        const entryWrapper = EntryHandler.instance.createEntryWrapper();
        const interfaceDeclarations = this.context.componentNames.map(
            name => arkts.factory.createInterfaceDeclaration(
                [],
                arkts.factory.createIdentifier(
                    `${CustomComponentNames.COMPONENT_INTERFACE_PREFIX}${name}`
                ),
                nullptr, // TODO: wtf
                arkts.factory.createBlock([]),
                false,
                false
            )
        )
        if (!this.isExternal) {
            this.createImportDeclaration();
        }
        return arkts.factory.updateEtsScript(
            node,
            [
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
        const annotations = this.structAnnotationMap.get(className) ?? [];
        if (annotations.some((anno) => isDecoratorAnnotation(anno, DecoratorNames.ENTRY))) {
            EntryHandler.instance.rememberEntryFunction(node)
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
            node.definition?.implements,
            undefined,
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(
                    arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_CLASS_NAME),
                    arkts.factory.createTSTypeParameterInstantiation(
                        [
                            arkts.factory.createTypeReference(
                                arkts.factory.createTypeReferencePart(
                                    arkts.factory.createIdentifier(className)
                                )
                            ),
                            arkts.factory.createTypeReference(
                                arkts.factory.createTypeReferencePart(
                                    arkts.factory.createIdentifier(
                                        `${CustomComponentNames.COMPONENT_INTERFACE_PREFIX}${className}`
                                    )
                                )
                            ),
                        ]
                    )
                )
            ),
            node.definition?.body,
            node.definition?.modifiers,
            arkts.classDefinitionFlags(node.definition) | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_FINAL
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

    collectComponentAnnotations(statement: arkts.Statement) {
        if (
            arkts.isStructDeclaration(statement)
            && !!statement.definition.ident
            && this.isComponentStruct(statement)
        ) {
            const className: string = statement.definition.ident.name;
            const annotations: readonly arkts.AnnotationUsage[] = statement.definition.annotations;
            this.structAnnotationMap.set(className, annotations);
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
