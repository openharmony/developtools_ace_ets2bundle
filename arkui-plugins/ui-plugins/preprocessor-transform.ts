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

export class PreprocessorTransformer extends AbstractVisitor {
    private importStatements: arkts.ETSImportDeclaration[] = [];
    importMap: Map<string, Set<string>> = this.initImportMap();
    outputMap: Map<string, string[]> = this.initOutputMap();

    initImportMap(): Map<string, Set<string>> {
        return new Map<string, Set<string>>([
            ["@ohos.arkui.external", new Set(["$r", "$rawfile"])],
            ["@ohos.arkui.stateManagement", new Set(["State", "Prop"])]
        ]);
    }

    initOutputMap(): Map<string, string[]> {
        return new Map<string, string[]>([
            ["$r", ["_r"]],
            ["$rawfile", ["_rawfile"]],
            ["State", ["StateDecoratedVariable"]]
        ])
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
            return arkts.factory.createTSAsExpression(
                node.arguments[0].clone(),
                arkts.factory.createTypeReference(
                    arkts.factory.createTypeReferencePart(
                        arkts.factory.createIdentifier(componentName)
                    )
                ),
                true
            );
        } else {
            return node;
        }
    }

    addDependencesImport(node: arkts.ETSImportDeclaration): void {
        node.specifiers.forEach((item: arkts.AstNode) => {
                if (arkts.isImportSpecifier(item)) {
                    this.addImportWithSpecifier(item);
                }
            }
        );
    }

    getSourceDependency(sourceName: string): string {
        let dependencyName: string = "";
        this.importMap.forEach((value: Set<string>, key: string) => {
            if (value.has(sourceName)) {
                dependencyName = key;
            }
        })
        return dependencyName;
    }

    getSpecifierDependency(importName: string): arkts.ImportSpecifier[] {
        const res: arkts.ImportSpecifier[] = [];
        if (this.outputMap.has(importName)) {
            this.outputMap.get(importName)!.forEach((item: string) => {
                res.push(factory.createAdditionalImportSpecifier(item, item));
            })
        }
        return res;
    }

    addImportWithSpecifier(node: arkts.ImportSpecifier): void {
        if (!node.imported?.name) {
            return;
        }

        const source: string = this.getSourceDependency(node.imported.name);
        const specifiers: arkts.ImportSpecifier[] = this.getSpecifierDependency(node.imported.name);
        
        if (source && specifiers.length) {
            const newImport: arkts.ETSImportDeclaration = arkts.factory.createImportDeclaration(
                arkts.factory.create1StringLiteral(source),
                specifiers,
                arkts.Es2pandaImportKinds.IMPORT_KINDS_TYPE
            );
            this.importStatements.push(newImport);
        }
    }

    updateScriptWithImport(node: arkts.EtsScript): arkts.EtsScript {
        if (this.importStatements.length > 0) {
            return arkts.factory.updateEtsScript(
                node,
                [
                    ...this.importStatements,
                    ...node.statements,
                ]
            );
        }
        return node;
    }

    visitor(node: arkts.AstNode): arkts.AstNode {
        const newNode = this.visitEachChild(node)
        if (arkts.isCallExpression(newNode) && this.isCustomConponentDecl(newNode)) {
            return this.transformComponentCall(newNode);
        } else if (arkts.isETSImportDeclaration(newNode)) {
            this.addDependencesImport(newNode);
        } else if (arkts.isEtsScript(node)) {
            return this.updateScriptWithImport(node);
        }
        return newNode;
    }
}
