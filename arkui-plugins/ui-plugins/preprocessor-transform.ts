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
import {
    AbstractVisitor,
    VisitorOptions
} from "../common/abstract-visitor";
import {
    CustomComponentNames
} from "./utils";
import {
    factory
} from "./ui-factory";
import { 
    IMPORT_SOURCE_MAP,
    OUTPUT_DEPENDENCY_MAP
} from "../common/predefines";

export class PreprocessorTransformer extends AbstractVisitor {
    private outNameArr: string[] = [];
    private structInterfaceImport: arkts.ETSImportDeclaration[] = [];

    reset(): void {
        super.reset();
        this.outNameArr = [];
        this.structInterfaceImport = [];
    }

    isCustomConponentDecl(node: arkts.CallExpression) {
        const structCollection: Set<string> = 
            arkts.GlobalInfo.getInfoInstance().getStructCollection();
        const nodeName: string = node.expression.dumpSrc();
        if (structCollection.has(nodeName)) {
            return true;
        }
        return false;
    }

    transformComponentCall(node: arkts.CallExpression): arkts.TSAsExpression | arkts.CallExpression {
        if (arkts.isObjectExpression(node.arguments[0])) {
            const componentName: string = 
                `${CustomComponentNames.COMPONENT_INTERFACE_PREFIX}${node.expression.dumpSrc()}`;
            const newArg = arkts.factory.createTSAsExpression(
                node.arguments[0].clone(),
                arkts.factory.createTypeReference(
                    arkts.factory.createTypeReferencePart(
                        arkts.factory.createIdentifier(componentName)
                    )
                ),
                true
            );
            return arkts.factory.updateCallExpression(
                node,
                node.expression,
                node.typeArguments,
                [newArg, ...node.arguments.slice(1)],
                node.trailingBlock
            );
        } else {
            return node;
        }
    }

    addDependencesImport(node: arkts.ETSImportDeclaration): void {
        const structCollection: Set<string> = arkts.GlobalInfo.getInfoInstance().getStructCollection();
        node.specifiers.forEach((item: arkts.AstNode) => {
                if (!arkts.isImportSpecifier(item)) return;
 
                if (
                    item.imported?.name &&
                    structCollection.has(item.imported?.name) &&
                    this.isExternal === false
                ) {
                    const interfaceName: string = CustomComponentNames.COMPONENT_INTERFACE_PREFIX + item.imported?.name;
                    const newImport: arkts.ETSImportDeclaration = arkts.factory.createImportDeclaration(
                        node.source?.clone(),
                        [factory.createAdditionalImportSpecifier(interfaceName, interfaceName)],
                        arkts.Es2pandaImportKinds.IMPORT_KINDS_VALUE
                    );
                    this.structInterfaceImport.push(newImport);
                } else {
                    this.addImportWithSpecifier(item);
                }
            }
        );
    }

    getSourceDependency(sourceName: string): string {
        let dependencyName: string = "";
        IMPORT_SOURCE_MAP.forEach((value: Set<string>, key: string) => {
            if (value.has(sourceName)) {
                dependencyName = key;
            }
        })
        return dependencyName;
    }

    getOutDependencyName(inputName: string): string[] {
        const sourceName: string[] = [];
        if (OUTPUT_DEPENDENCY_MAP.has(inputName)) {
            OUTPUT_DEPENDENCY_MAP.get(inputName)!.forEach((item: string) => {
                sourceName.push(item);
            })
        }
        return sourceName;
    }

    addImportWithSpecifier(node: arkts.ImportSpecifier): void {
        if (!node.imported?.name) {
            return;
        }

        const outName: string[] = this.getOutDependencyName(node.imported?.name);
        this.outNameArr.push(...outName);
    }

    updateScriptWithImport(): void {
        new Set(this.outNameArr).forEach((item: string) => {
            const source: string = this.getSourceDependency(item);
            const newImport: arkts.ETSImportDeclaration = arkts.factory.createImportDeclaration(
                arkts.factory.create1StringLiteral(source),
                [factory.createAdditionalImportSpecifier(item, item)],
                arkts.Es2pandaImportKinds.IMPORT_KINDS_VALUE
            );
            arkts.importDeclarationInsert(newImport);
        });
        this.structInterfaceImport.forEach((element: arkts.ETSImportDeclaration) => {
            arkts.importDeclarationInsert(element);
        });
    }

    visitor(node: arkts.AstNode): arkts.AstNode {
        const newNode = this.visitEachChild(node)
        if (arkts.isCallExpression(newNode) && this.isCustomConponentDecl(newNode)) {
            return this.transformComponentCall(newNode);
        } else if (arkts.isETSImportDeclaration(newNode)) {
            this.addDependencesImport(newNode);
        } else if (arkts.isEtsScript(node)) {
            this.updateScriptWithImport();
        }
        return newNode;
    }
}
