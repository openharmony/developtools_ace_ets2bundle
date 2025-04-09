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
import { CustomComponentNames } from './utils';
import { factory } from './ui-factory';
import {
    ARKUI_COMPONENT_IMPORT_NAME,
    IMPORT_SOURCE_MAP,
    OUTPUT_DEPENDENCY_MAP,
    ARKUI_STATEMANAGEMENT_IMPORT_NAME,
    KIT_ARKUI_NAME,
} from '../common/predefines';
import { NameCollector } from './name-collector';

export class PreprocessorTransformer extends AbstractVisitor {
    private outNameArr: string[] = [];
    private structInterfaceImport: arkts.ETSImportDeclaration[] = [];
    private localComponentNames: string[] = [];

    private readonly nameCollector: NameCollector;

    constructor(options?: VisitorOptions) {
        super(options);
        this.nameCollector = NameCollector.getInstance();
    }

    reset(): void {
        super.reset();
        this.outNameArr = [];
        this.structInterfaceImport = [];
        this.localComponentNames = [];
    }

    isCustomConponentDecl(node: arkts.CallExpression): boolean {
        const nodeName: string = node.expression.dumpSrc();
        if (arkts.hasGlobalStructInfo(nodeName)) {
            return true;
        }
        return false;
    }

    isComponentFunctionCall(node: arkts.CallExpression): boolean {
        if (!node || !arkts.isIdentifier(node.expression)) return false;
        return this.localComponentNames.includes(node.expression.name);
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

    transformComponentFunctionCall(node: arkts.CallExpression) {
        if (!node || !arkts.isIdentifier(node.expression)) return node;

        const componentInfo = this.nameCollector.getComponentInfo(node.expression.name);
        if (!componentInfo) return node;
        if (componentInfo.argsNum === 0) return node;
        if (node.arguments.length >= componentInfo.argsNum - 1) return node;

        const defaultArgs: arkts.UndefinedLiteral[] = [];
        let count = 0;
        while (count < componentInfo.argsNum - node.arguments.length - 1) {
            defaultArgs.push(arkts.factory.createUndefinedLiteral());
            count++;
        }
        return arkts.factory.updateCallExpression(node, node.expression, node.typeArguments, [
            ...node.arguments,
            ...defaultArgs,
        ]);
    }

    addDependencesImport(node: arkts.ETSImportDeclaration): void {
        if (!node.source) return;

        const isFromCompImport: boolean = node.source.str === ARKUI_COMPONENT_IMPORT_NAME || node.source.str === KIT_ARKUI_NAME;
        node.specifiers.forEach((item: arkts.AstNode) => {
            if (!arkts.isImportSpecifier(item) || !item.imported?.name) return;

            const importName: string = item.imported.name;
            if (isFromCompImport && this.nameCollector.getComponents().includes(importName)) {
                this.localComponentNames.push(item.local?.name ?? importName);
            }

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
            } else {
                this.addImportWithSpecifier(item, node.source!);
            }
        });
    }

    getSourceDependency(sourceName: string): string {
        let dependencyName: string = '';
        IMPORT_SOURCE_MAP.forEach((value: Set<string>, key: string) => {
            if (value.has(sourceName)) {
                dependencyName = key;
            }
        });
        return dependencyName;
    }

    updateSourceDependencyMap(key: string, value: string[]): void {
        const newValue: Set<string> = IMPORT_SOURCE_MAP.get(key) ?? new Set();
        for (const v of value) {
            newValue.add(v);
        }
        IMPORT_SOURCE_MAP.set(key, newValue);
    }

    getOutDependencyName(inputName: string): string[] {
        const sourceName: string[] = [];
        if (OUTPUT_DEPENDENCY_MAP.has(inputName)) {
            OUTPUT_DEPENDENCY_MAP.get(inputName)!.forEach((item: string) => {
                sourceName.push(item);
            });
        }
        return sourceName;
    }

    updateOutDependencyMap(key: string, value: string[]): void {
        const oldValue: string[] = OUTPUT_DEPENDENCY_MAP.get(key) ?? [];
        const newValue: string[] = [...value, ...oldValue];
        OUTPUT_DEPENDENCY_MAP.set(key, newValue);
    }

    clearGenSymInOutDependencyMap(genSymKey: string): void {
        if (OUTPUT_DEPENDENCY_MAP.has(genSymKey)) {
            OUTPUT_DEPENDENCY_MAP.delete(genSymKey);
        }
    }

    addImportWithSpecifier(node: arkts.ImportSpecifier, source: arkts.StringLiteral): void {
        if (!node.imported?.name) return;

        const outName: string[] = this.getOutDependencyName(node.imported?.name);
        this.outNameArr.push(...outName);
    }

    updateScriptWithImport(): void {
        if (!this.program) {
            throw Error('Failed to insert import: Transformer has no program');
        }

        const outNames = new Set([...this.outNameArr]);
        outNames.forEach((item: string) => {
            const source: string = this.getSourceDependency(item);
            const newImport: arkts.ETSImportDeclaration = arkts.factory.createImportDeclaration(
                arkts.factory.create1StringLiteral(source),
                [factory.createAdditionalImportSpecifier(item, item)],
                arkts.Es2pandaImportKinds.IMPORT_KINDS_VALUE,
                this.program!,
                arkts.Es2pandaImportFlags.IMPORT_FLAGS_NONE
            );
            arkts.importDeclarationInsert(newImport, this.program!);
        });
        this.structInterfaceImport.forEach((element: arkts.ETSImportDeclaration) => {
            arkts.importDeclarationInsert(element, this.program!);
        });
    }

    enter(node: arkts.AstNode): void {
        if (this.isExternal && arkts.isFunctionDeclaration(node)) {
            const component = this.nameCollector.findComponentFunction(node);
            if (!!component) this.nameCollector.collectInfoFromComponentFunction(component);
        }
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
