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
import { AbstractVisitor } from '../../common/abstract-visitor';
import { annotation, collect, filterDefined } from '../../common/arkts-utils';
import { ProjectConfig } from '../../common/plugin-context';
import { classifyProperty, PropertyTranslator } from '../property-translators';
import {
    CustomComponentNames,
    getCustomComponentOptionsName,
    getTypeNameFromTypeParameter,
    getTypeParamsFromClassDecl,
} from '../utils';
import { isCustomComponentClass, isKnownMethodDefinition, isEtsGlobalClass, isReourceNode } from './utils';
import { factory as uiFactory } from '../ui-factory';
import { factory } from './factory';
import { isEntryWrapperClass } from '../entry-translators/utils';
import { factory as entryFactory } from '../entry-translators/factory';
import { DecoratorNames, hasDecorator } from '../property-translators/utils';
import { ScopeInfo } from './utils';

function tranformPropertyMembers(
    className: string,
    propertyTranslators: PropertyTranslator[],
    optionsTypeName: string,
    isDecl?: boolean,
    scope?: ScopeInfo
): arkts.AstNode[] {
    const propertyMembers = propertyTranslators.map((translator) => translator.translateMember());
    const currentStructInfo: arkts.StructInfo = arkts.GlobalInfo.getInfoInstance().getStructInfo(className);
    const collections = [];
    if (!scope?.hasInitializeStruct) {
        collections.push(factory.createInitializeStruct(currentStructInfo, optionsTypeName, isDecl));
    }
    if (!scope?.hasUpdateStruct) {
        collections.push(factory.createUpdateStruct(currentStructInfo, optionsTypeName, isDecl));
    }
    if (currentStructInfo.isReusable) {
        collections.push(factory.toRecord(optionsTypeName, currentStructInfo.toRecordBody));
    }
    return collect(...collections, ...propertyMembers);
}

function transformEtsGlobalClassMembers(node: arkts.ClassDeclaration): arkts.ClassDeclaration {
    if (!node.definition) {
        return node;
    }
    node.definition.body.map((member: arkts.AstNode) => {
        if (arkts.isMethodDefinition(member) && hasDecorator(member, DecoratorNames.BUILDER)) {
            member.scriptFunction.setAnnotations([annotation('memo')]);
        }
        return member;
    });
    return node;
}

function transformOtherMembersInClass(
    member: arkts.AstNode,
    classTypeName: string | undefined,
    classOptionsName: string | undefined,
    className: string,
    isDecl?: boolean
): arkts.AstNode {
    if (arkts.isMethodDefinition(member) && hasDecorator(member, DecoratorNames.BUILDER)) {
        member.scriptFunction.setAnnotations([annotation('memo')]);
        return member;
    }
    if (
        arkts.isMethodDefinition(member) &&
        isKnownMethodDefinition(member, CustomComponentNames.COMPONENT_CONSTRUCTOR_ORI) &&
        !isDecl
    ) {
        return uiFactory.createConstructorMethod(member);
    }
    if (arkts.isMethodDefinition(member) && isKnownMethodDefinition(member, CustomComponentNames.COMPONENT_BUILD_ORI)) {
        return factory.transformBuildMethodWithOriginBuild(
            member,
            classTypeName ?? className,
            classOptionsName ?? getCustomComponentOptionsName(className),
            isDecl
        );
    }
    return member;
}

function tranformClassMembers(
    node: arkts.ClassDeclaration,
    isDecl?: boolean,
    scope?: ScopeInfo
): arkts.ClassDeclaration {
    if (!node.definition) {
        return node;
    }

    let classTypeName: string | undefined;
    let classOptionsName: string | undefined;
    if (isDecl) {
        const [classType, classOptions] = getTypeParamsFromClassDecl(node);
        classTypeName = getTypeNameFromTypeParameter(classType);
        classOptionsName = getTypeNameFromTypeParameter(classOptions);
    }
    const definition: arkts.ClassDefinition = node.definition;
    const className: string | undefined = node.definition.ident?.name;
    if (!className) {
        throw new Error('Non Empty className expected for Component');
    }

    const propertyTranslators: PropertyTranslator[] = filterDefined(
        definition.body.map((it) => classifyProperty(it, className))
    );
    const translatedMembers: arkts.AstNode[] = tranformPropertyMembers(
        className,
        propertyTranslators,
        classOptionsName ?? getCustomComponentOptionsName(className),
        isDecl,
        scope
    );
    const updateMembers: arkts.AstNode[] = definition.body
        .filter((member) => !arkts.isClassProperty(member))
        .map((member: arkts.AstNode) =>
            transformOtherMembersInClass(member, classTypeName, classOptionsName, className, isDecl)
        );

    const updateClassDef: arkts.ClassDefinition = factory.updateCustomComponentClass(definition, [
        ...translatedMembers,
        ...updateMembers,
    ]);
    return arkts.factory.updateClassDeclaration(node, updateClassDef);
}

function transformResource(
    resourceNode: arkts.CallExpression,
    projectConfig: ProjectConfig | undefined
): arkts.CallExpression {
    const newArgs: arkts.AstNode[] = [
        arkts.factory.create1StringLiteral(projectConfig?.bundleName ? projectConfig.bundleName : ''),
        arkts.factory.create1StringLiteral(projectConfig?.moduleName ? projectConfig.moduleName : ''),
        ...resourceNode.arguments,
    ];
    return factory.generateTransformedResource(resourceNode, newArgs);
}

export class StructTransformer extends AbstractVisitor {
    private scopeInfos: ScopeInfo[] = [];
    projectConfig: ProjectConfig | undefined;

    constructor(projectConfig: ProjectConfig | undefined) {
        super();
        this.projectConfig = projectConfig;
    }

    reset(): void {
        super.reset();
        this.scopeInfos = [];
    }

    enter(node: arkts.AstNode): void {
        if (arkts.isClassDeclaration(node) && isCustomComponentClass(node)) {
            this.scopeInfos.push({ name: node.definition!.ident!.name });
        }
        if (arkts.isMethodDefinition(node) && this.scopeInfos.length > 0) {
            const name = node.name.name;
            const scopeInfo = this.scopeInfos.pop()!;
            scopeInfo.hasInitializeStruct ||= name === CustomComponentNames.COMPONENT_INITIALIZE_STRUCT;
            scopeInfo.hasUpdateStruct ||= name === CustomComponentNames.COMPONENT_UPDATE_STRUCT;
            scopeInfo.hasReusableRebind ||= name === CustomComponentNames.REUSABLE_COMPONENT_REBIND_STATE;
            this.scopeInfos.push(scopeInfo);
        }
    }

    exit(node: arkts.AstNode): void {
        if (arkts.isClassDeclaration(node) && isCustomComponentClass(node)) {
            this.scopeInfos.pop();
        }
    }

    visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
        this.enter(beforeChildren);
        const node = this.visitEachChild(beforeChildren);
        if (arkts.isClassDeclaration(node) && isCustomComponentClass(node)) {
            let scope: ScopeInfo | undefined;
            if (this.scopeInfos.length > 0) {
                scope = this.scopeInfos[this.scopeInfos.length - 1];
            }
            const newClass: arkts.ClassDeclaration = tranformClassMembers(
                node,
                arkts.hasModifierFlag(node, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE),
                scope
            );
            this.exit(beforeChildren);
            return newClass;
        } else if (isEntryWrapperClass(node)) {
            entryFactory.addMemoToEntryWrapperClassMethods(node);
            return node;
        } else if (arkts.isClassDeclaration(node) && isEtsGlobalClass(node)) {
            return transformEtsGlobalClassMembers(node);
        } else if (arkts.isCallExpression(node) && isReourceNode(node)) {
            return transformResource(node, this.projectConfig);
        }
        return node;
    }
}
