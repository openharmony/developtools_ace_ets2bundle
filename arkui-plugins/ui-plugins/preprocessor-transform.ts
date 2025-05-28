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
import { AbstractVisitor } from '../common/abstract-visitor';
import { CustomComponentNames } from './utils';
import { factory } from './ui-factory';

export class PreprocessorTransformer extends AbstractVisitor {
    private structInterfaceImport: arkts.ETSImportDeclaration[] = [];

    isCustomConponentDecl(node: arkts.CallExpression): boolean {
        const nodeName: string = node.expression.dumpSrc();
        if (arkts.hasGlobalStructInfo(nodeName)) {
            return true;
        }
        return false;
    }

    transformComponentCall(node: arkts.CallExpression): arkts.TSAsExpression | arkts.CallExpression {
        if (node.arguments.length === 0 && node.trailingBlock) {
            return node;
        } else if (arkts.isObjectExpression(node.arguments[0])) {
            const componentName: string = `${
                CustomComponentNames.COMPONENT_INTERFACE_PREFIX
            }${node.expression.dumpSrc()}`;
            const newArg = arkts.factory.createTSAsExpression(
                node.arguments[0].clone(),
                arkts.factory.createTypeReference(
                    arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier(componentName))
                ),
                true
            );
            return arkts.factory.updateCallExpression(node, node.expression, node.typeArguments, [
                newArg,
                ...node.arguments.slice(1),
            ]);
        } else {
            return node;
        }
    }

    addDependencesImport(node: arkts.ETSImportDeclaration): void {
        if (!node.source) return;
        node.specifiers.forEach((item: arkts.AstNode) => {
            if (!arkts.isImportSpecifier(item) || !item.imported?.name) return;
            const importName: string = item.imported.name;
            if (arkts.hasGlobalStructInfo(importName)) {
                const interfaceName: string = CustomComponentNames.COMPONENT_INTERFACE_PREFIX + importName;
                const newImport: arkts.ETSImportDeclaration = arkts.factory.createImportDeclaration(
                    node.source?.clone(),
                    [factory.createAdditionalImportSpecifier(interfaceName, interfaceName)],
                    arkts.Es2pandaImportKinds.IMPORT_KINDS_VALUE,
                    this.program!,
                    arkts.Es2pandaImportFlags.IMPORT_FLAGS_NONE
                );
                this.structInterfaceImport.push(newImport);
            }
        });
    }

    updateScriptWithImport(): void {
        if (!this.program) {
            throw Error('Failed to insert import: Transformer has no program');
        }

        this.structInterfaceImport.forEach((element: arkts.ETSImportDeclaration) => {
            arkts.importDeclarationInsert(element, this.program!);
        });
    }

    visitor(node: arkts.AstNode): arkts.AstNode {
        const newNode = this.visitEachChild(node);
        if (arkts.isCallExpression(newNode) && this.isCustomConponentDecl(newNode)) {
            return this.transformComponentCall(newNode);
        }
        if (arkts.isETSImportDeclaration(node)) {
            this.addDependencesImport(node);
        } else if (arkts.isEtsScript(node)) {
            this.updateScriptWithImport();
        }
        return newNode;
    }
}
