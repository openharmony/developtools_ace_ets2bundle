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
import { ProjectConfig } from '../common/plugin-context';
import { factory as structFactory } from './struct-translators/factory';
import { factory as builderLambdaFactory } from './builder-lambda-translators/factory';
import { factory as entryFactory } from './entry-translators/factory';
import { AbstractVisitor } from '../common/abstract-visitor';
import { isBuilderLambda, isBuilderLambdaMethodDecl } from './builder-lambda-translators/utils';
import { isEntryWrapperClass } from './entry-translators/utils';
import { ImportCollector } from '../common/import-collector';
import { DeclarationCollector } from '../common/declaration-collector';
import { PropertyCache } from './property-translators/cache/propertyCache';
import { LogCollector } from '../common/log-collector';
import {
    CustomComponentScopeInfo,
    initResourceInfo,
    loadBuildJson,
    LoaderJson,
    ResourceInfo,
    ScopeInfoCollection,
    initRouterInfo,
} from './struct-translators/utils';
import {
    collectCustomComponentScopeInfo,
    CustomComponentNames,
    CustomDialogNames,
    isCustomComponentClass,
    isSpecificNewClass,
} from './utils';
import { findAndCollectMemoableNode } from '../collectors/memo-collectors/factory';
import { generateBuilderCompatible } from './interop/builder-interop';
import { builderRewriteByType } from './builder-lambda-translators/builder-factory';
import { MetaDataCollector } from '../common/metadata-collector';
import { ComponentAttributeCache } from './builder-lambda-translators/cache/componentAttributeCache';
import { MonitorCache } from './property-translators/cache/monitorCache';
import { ComputedCache } from './property-translators/cache/computedCache';
import { FileManager } from '../common/file-manager';
import { LANGUAGE_VERSION } from '../common/predefines';

export class CheckedTransformer extends AbstractVisitor {
    private scope: ScopeInfoCollection;
    projectConfig: ProjectConfig | undefined;
    aceBuildJson: LoaderJson;
    resourceInfo: ResourceInfo;

    constructor(projectConfig: ProjectConfig | undefined) {
        super();
        this.projectConfig = projectConfig;
        this.scope = { customComponents: [] };
        this.aceBuildJson = loadBuildJson(this.projectConfig);
        this.resourceInfo = initResourceInfo(this.projectConfig, this.aceBuildJson);
        MetaDataCollector.getInstance()
            .setProjectConfig(this.projectConfig)
            .setRouterInfo(initRouterInfo(this.aceBuildJson));
    }

    init(): void {
        MetaDataCollector.getInstance()
            .setAbsName(this.program?.absName)
            .setExternalSourceName(this.externalSourceName);
    }

    reset(): void {
        super.reset();
        this.scope = { customComponents: [] };
        PropertyCache.getInstance().reset();
        MonitorCache.getInstance().reset();
        ComputedCache.getInstance().reset();
        ComponentAttributeCache.getInstance().reset();
        ImportCollector.getInstance().reset();
        DeclarationCollector.getInstance().reset();
        LogCollector.getInstance().reset();
    }

    enter(node: arkts.AstNode): void {
        if (arkts.isClassDeclaration(node) && !!node.definition && node.definition.body.length > 0) {
            const customComponentInfo = collectCustomComponentScopeInfo(node);
            if (!!customComponentInfo) {
                this.scope.customComponents.push(customComponentInfo);
            }
        }
        if (arkts.isMethodDefinition(node) && this.scope.customComponents.length > 0) {
            const name = node.name.name;
            const scopeInfo = this.scope.customComponents.pop()!;
            scopeInfo.hasInitializeStruct ||= name === CustomComponentNames.COMPONENT_INITIALIZE_STRUCT;
            scopeInfo.hasUpdateStruct ||= name === CustomComponentNames.COMPONENT_UPDATE_STRUCT;
            this.scope.customComponents.push(scopeInfo);
        }
    }

    exit(node: arkts.AstNode): void {
        if (
            arkts.isClassDeclaration(node) &&
            this.scope.customComponents.length > 0 &&
            isCustomComponentClass(node, this.scope.customComponents[this.scope.customComponents.length - 1])
        ) {
            this.scope.customComponents.pop();
        }
    }

    isFromBuilder1_1(decl: arkts.AstNode | undefined): boolean {
        if (!decl || !arkts.isMethodDefinition(decl)) {
            return false;
        }
        const path = arkts.getProgramFromAstNode(decl).absName;
        const fileManager = FileManager.getInstance();
        if (fileManager.getLanguageVersionByFilePath(path) !== LANGUAGE_VERSION.ARKTS_1_1) {
            return false;
        }

        const annotations = decl.scriptFunction.annotations;
        const decorators: string[] = annotations.map((annotation) => {
            return (annotation.expr as arkts.Identifier).name;
        });
        for (const decorator of decorators) {
            if (decorator === 'memo' || decorator === 'Builder' || decorator === 'Memo') {
                return true;
            }
        }
        return false;
    }

    addcompatibleComponentImport(): void {
        ImportCollector.getInstance().collectSource('compatibleComponent', 'arkui.component.interop');
        ImportCollector.getInstance().collectImport('compatibleComponent');
    }

    visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
        this.enter(beforeChildren);
        if (arkts.isCallExpression(beforeChildren)) {
            const decl = arkts.getDecl(beforeChildren.expression);
            if (arkts.isIdentifier(beforeChildren.expression) && this.isFromBuilder1_1(decl)) {
                // Builder
                this.addcompatibleComponentImport();
                return generateBuilderCompatible(beforeChildren, beforeChildren.expression.name);
            } else if (isBuilderLambda(beforeChildren, decl)) {
                const lambda = builderLambdaFactory.transformBuilderLambda(beforeChildren);
                return this.visitEachChild(lambda);
            }
        } else if (arkts.isMethodDefinition(beforeChildren) && isBuilderLambdaMethodDecl(beforeChildren)) {
            const lambda = builderLambdaFactory.transformBuilderLambdaMethodDecl(beforeChildren);
            return this.visitEachChild(lambda);
        }
        let node = this.visitEachChild(beforeChildren);
        findAndCollectMemoableNode(node, (currNode: arkts.AstNode, nodeType: arkts.Es2pandaAstNodeType) => {
            if (builderRewriteByType.has(nodeType)) {
                node = builderRewriteByType.get(nodeType)!(currNode);
            }
            return currNode;
        });
        if (
            arkts.isClassDeclaration(node) &&
            this.scope.customComponents.length > 0 &&
            isCustomComponentClass(node, this.scope.customComponents[this.scope.customComponents.length - 1])
        ) {
            const scope: CustomComponentScopeInfo = this.scope.customComponents[this.scope.customComponents.length - 1];
            const newClass: arkts.ClassDeclaration = structFactory.tranformClassMembers(node, scope);
            this.exit(beforeChildren);
            return newClass;
        }

        return this.visitorAstNode(node);
    }

    visitorAstNode(node: arkts.AstNode): arkts.AstNode {
        if (isEntryWrapperClass(node)) {
            entryFactory.addMemoToEntryWrapperClassMethods(node);
            return node;
        } else if (arkts.isClassDeclaration(node)) {
            return structFactory.transformNormalClass(node, this.externalSourceName);
        } else if (arkts.isCallExpression(node)) {
            return structFactory.transformCallExpression(node, this.projectConfig, this.resourceInfo, this.scope.customComponents.length === 0);
        } else if (arkts.isTSInterfaceDeclaration(node)) {
            return structFactory.tranformInterfaceMembers(node, this.externalSourceName);
        } else if (
            arkts.isETSNewClassInstanceExpression(node) &&
            isSpecificNewClass(node, CustomDialogNames.CUSTOM_DIALOG_CONTROLLER)
        ) {
            return structFactory.transformCustomDialogController(node);
        }
        if (arkts.isEtsScript(node) && !node.isNamespace && ImportCollector.getInstance().importInfos.length > 0) {
            const newScript = structFactory.insertClassInEtsScript(node);
            ImportCollector.getInstance().insertCurrentImports(this.program);
            LogCollector.getInstance().shouldIgnoreError(this.projectConfig?.ignoreError);
            LogCollector.getInstance().emitLogInfo();
            return newScript;
        }
        return node;
    }
}
