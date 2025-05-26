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
import { factory as uiFactory } from './ui-factory';
import { factory as entryFactory } from './entry-translators/factory';
import { AbstractVisitor } from '../common/abstract-visitor';
import { annotation, collect, filterDefined } from '../common/arkts-utils';
import {
    CustomComponentNames,
    getCustomComponentOptionsName,
    getTypeNameFromTypeParameter,
    getTypeParamsFromClassDecl,
    getGettersFromClassDecl,
    addMemoAnnotation,
} from './utils';
import { hasDecorator, DecoratorNames } from './property-translators/utils';
import {
    isCustomComponentClass,
    isKnownMethodDefinition,
    isEtsGlobalClass,
    isReourceNode,
    ScopeInfoCollection,
    CustomComponentScopeInfo,
    isMemoCall,
    findCanAddMemoFromArrowFunction,
} from './struct-translators/utils';
import { isBuilderLambda, isBuilderLambdaMethodDecl } from './builder-lambda-translators/utils';
import { isEntryWrapperClass } from './entry-translators/utils';
import { classifyObservedTrack, classifyProperty, PropertyTranslator } from './property-translators';
import { ObservedTrackTranslator } from './property-translators/observedTrack';
import { nodeByType } from '@koalaui/libarkts/build/src/reexport-for-generated';

export class CheckedTransformer extends AbstractVisitor {
    private scopeInfoCollection: ScopeInfoCollection;
    projectConfig: ProjectConfig | undefined;

    constructor(projectConfig: ProjectConfig | undefined) {
        super();
        this.projectConfig = projectConfig;
        this.scopeInfoCollection = { customComponents: [] };
    }

    reset(): void {
        super.reset();
        this.scopeInfoCollection = { customComponents: [] };
    }

    enter(node: arkts.AstNode): void {
        if (arkts.isClassDeclaration(node) && isCustomComponentClass(node)) {
            this.scopeInfoCollection.customComponents.push({ name: node.definition!.ident!.name });
        }
        if (arkts.isMethodDefinition(node) && this.scopeInfoCollection.customComponents.length > 0) {
            const name = node.name.name;
            const scopeInfo = this.scopeInfoCollection.customComponents.pop()!;
            scopeInfo.hasInitializeStruct ||= name === CustomComponentNames.COMPONENT_INITIALIZE_STRUCT;
            scopeInfo.hasUpdateStruct ||= name === CustomComponentNames.COMPONENT_UPDATE_STRUCT;
            scopeInfo.hasReusableRebind ||= name === CustomComponentNames.REUSABLE_COMPONENT_REBIND_STATE;
            this.scopeInfoCollection.customComponents.push(scopeInfo);
        }
    }

    exit(node: arkts.AstNode): void {
        if (arkts.isClassDeclaration(node) && isCustomComponentClass(node)) {
            this.scopeInfoCollection.customComponents.pop();
        }
    }

    visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
        this.enter(beforeChildren);
        if (arkts.isCallExpression(beforeChildren) && isBuilderLambda(beforeChildren)) {
            const lambda = builderLambdaFactory.transformBuilderLambda(beforeChildren, this.projectConfig);
            return this.visitEachChild(lambda);
        } else if (arkts.isMethodDefinition(beforeChildren) && isBuilderLambdaMethodDecl(beforeChildren)) {
            const lambda = builderLambdaFactory.transformBuilderLambdaMethodDecl(beforeChildren);
            return this.visitEachChild(lambda);
        }
        const node = this.visitEachChild(beforeChildren);
        if (arkts.isClassDeclaration(node) && isCustomComponentClass(node)) {
            let scope: CustomComponentScopeInfo | undefined;
            const scopeInfos: CustomComponentScopeInfo[] = this.scopeInfoCollection.customComponents;
            if (scopeInfos.length > 0) {
                scope = scopeInfos[scopeInfos.length - 1];
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
        } else if (findCanAddMemoFromArrowFunction(node)) {
            return addMemoAnnotation(node);
        } else if (arkts.isClassDeclaration(node)) {
            return transformObservedTracked(node);
        } else if (this.externalSourceName) {
            return structFactory.transformExternalSource(this.externalSourceName, node);
        }
        return node;
    }
}

export type ClassScopeInfo = {
    isObserved: boolean;
    classHasTrack: boolean;
    getters: arkts.MethodDefinition[];
};

function transformObservedTracked(node: arkts.ClassDeclaration): arkts.ClassDeclaration {
    if (!node.definition) {
        return node;
    }
    const isObserved: boolean = hasDecorator(node.definition, DecoratorNames.OBSERVED);
    const classHasTrack: boolean = node.definition.body.some(
        (member) => arkts.isClassProperty(member) && hasDecorator(member, DecoratorNames.TRACK)
    );
    if (!isObserved && !classHasTrack) {
        return node;
    }

    const updateClassDef: arkts.ClassDefinition = arkts.factory.updateClassDefinition(
        node.definition,
        node.definition.ident,
        node.definition.typeParams,
        node.definition.superTypeParams,
        [
            ...node.definition.implements,
            arkts.TSClassImplements.createTSClassImplements(
                arkts.factory.createTypeReference(
                    arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier('IObservedObject'))
                )
            ),
        ],
        undefined,
        node.definition.super,
        observedTrackPropertyMembers(classHasTrack, node.definition, isObserved),
        node.definition.modifiers,
        arkts.classDefinitionFlags(node.definition)
    );
    return arkts.factory.updateClassDeclaration(node, updateClassDef);
}

function observedTrackPropertyMembers(
    classHasTrack: boolean,
    definition: arkts.ClassDefinition,
    isObserved: boolean
): arkts.AstNode[] {
    const watchMembers: arkts.AstNode[] = createWatchMembers();
    const permissibleAddRefDepth: arkts.ClassProperty = arkts.factory.createClassProperty(
        arkts.factory.createIdentifier('_permissibleAddRefDepth'),
        arkts.factory.createNumericLiteral(0),
        arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier('int32'))
        ),
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
        false
    );

    const meta: arkts.ClassProperty = arkts.factory.createClassProperty(
        arkts.factory.createIdentifier('__meta'),
        arkts.factory.createETSNewClassInstanceExpression(
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier('MutableStateMeta'))
            ),
            [arkts.factory.createStringLiteral('@Observe properties (no @Track)')]
        ),
        arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier('MutableStateMeta'))
        ),
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
        false
    );

    const getters: arkts.MethodDefinition[] = getGettersFromClassDecl(definition);

    const classScopeInfo: ClassScopeInfo = {
        isObserved: isObserved,
        classHasTrack: classHasTrack,
        getters: getters,
    };
    
    const propertyTranslators: ObservedTrackTranslator[] = filterDefined(
        definition.body.map((it) => classifyObservedTrack(it, classScopeInfo))
    );

    const propertyMembers = propertyTranslators.map((translator) => translator.translateMember());

    const nonClassPropertyOrGetter: arkts.AstNode[] = definition.body.filter(
        (member) =>
            !arkts.isClassProperty(member) &&
            !(
                arkts.isMethodDefinition(member) &&
                arkts.hasModifierFlag(member, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_GETTER)
            )
    );

    return [
        ...watchMembers,
        ...(classHasTrack ? [permissibleAddRefDepth] : [permissibleAddRefDepth, meta]),
        ...collect(...propertyMembers),
        ...nonClassPropertyOrGetter,
        ...classScopeInfo.getters,
    ];
}

function createWatchMethod(
    methodName: string,
    returnType: arkts.Es2pandaPrimitiveType,
    paramName: string,
    paramType: string,
    isReturnStatement: boolean
): arkts.MethodDefinition {
    return arkts.factory.createMethodDefinition(
        arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
        arkts.factory.createIdentifier(methodName),
        arkts.factory.createFunctionExpression(
            arkts.factory.createScriptFunction(
                arkts.factory.createBlock([
                    isReturnStatement
                        ? arkts.factory.createReturnStatement(
                              arkts.factory.createCallExpression(thisSubscribedWatchesMember(methodName), undefined, [
                                  arkts.factory.createIdentifier(paramName),
                              ])
                          )
                        : arkts.factory.createExpressionStatement(
                              arkts.factory.createCallExpression(thisSubscribedWatchesMember(methodName), undefined, [
                                  arkts.factory.createIdentifier(paramName),
                              ])
                          ),
                ]),
                arkts.factory.createFunctionSignature(
                    undefined,
                    [
                        arkts.factory.createParameterDeclaration(
                            arkts.factory.createIdentifier(
                                paramName,
                                arkts.factory.createTypeReference(
                                    arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier(paramType))
                                )
                            ),
                            undefined
                        ),
                    ],
                    arkts.factory.createPrimitiveType(returnType),
                    false
                ),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
            )
        ),
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
        false
    );
}

function createWatchMembers(): arkts.AstNode[] {
    const subscribedWatches: arkts.ClassProperty = arkts.factory.createClassProperty(
        arkts.factory.createIdentifier('subscribedWatches'),
        arkts.factory.createETSNewClassInstanceExpression(
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier('SubscribedWatches'))
            ),
            []
        ),
        arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier('SubscribedWatches'))
        ),
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
        false
    );

    const addWatchSubscriber = createWatchMethod(
        'addWatchSubscriber',
        arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID,
        'watchId',
        'WatchIdType',
        false
      );
    
      const removeWatchSubscriber = createWatchMethod(
        'removeWatchSubscriber',
        arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_BOOLEAN,
        'watchId',
        'WatchIdType',
        true
      );
    
      const executeOnSubscribingWatches = createWatchMethod(
        'executeOnSubscribingWatches',
        arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID,
        'propertyName',
        'string',
        false
      );
    
    return [subscribedWatches, addWatchSubscriber, removeWatchSubscriber, executeOnSubscribingWatches];
}

function thisSubscribedWatchesMember(member: string): arkts.MemberExpression {
    return arkts.factory.createMemberExpression(
        arkts.factory.createMemberExpression(
            arkts.factory.createThisExpression(),
            arkts.factory.createIdentifier('subscribedWatches'),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        ),
        arkts.factory.createIdentifier(member),
        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
        false,
        false
    );
}

/**
 * @deprecated
 */
function tranformClassMembers(
    node: arkts.ClassDeclaration,
    isDecl?: boolean,
    scope?: CustomComponentScopeInfo
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

    const updateClassDef: arkts.ClassDefinition = structFactory.updateCustomComponentClass(definition, [
        ...translatedMembers,
        ...updateMembers,
    ]);
    return arkts.factory.updateClassDeclaration(node, updateClassDef);
}

/**
 * @deprecated
 */
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
        return structFactory.transformBuildMethodWithOriginBuild(
            member,
            classTypeName ?? className,
            classOptionsName ?? getCustomComponentOptionsName(className),
            isDecl
        );
    }
    return member;
}

/**
 * @deprecated
 */
function tranformPropertyMembers(
    className: string,
    propertyTranslators: PropertyTranslator[],
    optionsTypeName: string,
    isDecl?: boolean,
    scope?: CustomComponentScopeInfo
): arkts.AstNode[] {
    const propertyMembers = propertyTranslators.map((translator) => translator.translateMember());
    const currentStructInfo: arkts.StructInfo = arkts.GlobalInfo.getInfoInstance().getStructInfo(className);
    const collections = [];
    if (!scope?.hasInitializeStruct) {
        collections.push(structFactory.createInitializeStruct(currentStructInfo, optionsTypeName, isDecl));
    }
    if (!scope?.hasUpdateStruct) {
        collections.push(structFactory.createUpdateStruct(currentStructInfo, optionsTypeName, isDecl));
    }
    if (currentStructInfo.isReusable) {
        collections.push(structFactory.toRecord(optionsTypeName, currentStructInfo.toRecordBody));
    }
    return collect(...collections, ...propertyMembers);
}

/**
 * @deprecated
 */
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

/**
 * @deprecated
 */
function transformResource(
    resourceNode: arkts.CallExpression,
    projectConfig: ProjectConfig | undefined
): arkts.CallExpression {
    const newArgs: arkts.AstNode[] = [
        arkts.factory.create1StringLiteral(projectConfig?.bundleName ? projectConfig.bundleName : ''),
        arkts.factory.create1StringLiteral(projectConfig?.moduleName ? projectConfig.moduleName : ''),
        ...resourceNode.arguments,
    ];
    return structFactory.generateTransformedResource(resourceNode, newArgs);
}
