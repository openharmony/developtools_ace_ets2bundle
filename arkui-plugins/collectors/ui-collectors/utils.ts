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

import * as arkts from '@koalaui/libarkts';
import { filterDefined, matchPrefix } from '../../common/arkts-utils';
import { DeclarationCollector } from '../../common/declaration-collector';
import {
    CustomComponentNames,
    ARKUI_IMPORT_PREFIX_NAMES,
    BuiltInNames,
    BuilderLambdaNames,
    Dollars,
    StateManagementTypes,
    ARKUI_BUILDER_SOURCE_NAME,
    DecoratorNames,
    InnerComponentNames,
    InnerComponentAttributes,
    GetSetTypes,
    CustomDialogNames,
} from '../../common/predefines';
import {
    ArrowFunctionInfo,
    CallDeclInfo,
    CallInfo,
    CustomComponentInfo,
    CustomComponentInterfaceInfo,
    CustomComponentInterfacePropertyInfo,
    FunctionInfo,
    NewClassInstanceInfo,
    NormalClassInfo,
    NormalClassMethodInfo,
    NormalClassPropertyInfo,
    NormalInterfaceInfo,
    NormalInterfacePropertyInfo,
    ParameterInfo,
    RecordInfo,
    StructMethodInfo,
    StructPropertyInfo,
} from './records';
import { AnnotationInfo, Annotations } from './records/annotations/base';

export function checkCanCollectNormalClassFromInfo(info: NormalClassInfo, externalSourceName?: string): boolean {
    if (checkIsObservedClassFromInfo(info)) {
        return true;
    }
    if (externalSourceName === ARKUI_BUILDER_SOURCE_NAME && checkIsETSGlobalClassFromInfo(info)) {
        return true;
    }
    return false;
}

export function findRootCallee(callee: arkts.AstNode | undefined): arkts.Identifier | undefined {
    if (!callee) {
        return undefined;
    }
    if (arkts.isIdentifier(callee)) {
        return callee;
    }
    if (arkts.isMemberExpression(callee)) {
        return findRootCallee(callee.property);
    }
    if (arkts.isTSAsExpression(callee)) {
        return findRootCallee(callee.expr);
    }
    if (arkts.isTSNonNullExpression(callee)) {
        return findRootCallee(callee.expr);
    }
    return undefined;
}

export function findRootCallObject(callee: arkts.AstNode | undefined): arkts.Identifier | undefined {
    if (!callee) {
        return undefined;
    }
    if (arkts.isIdentifier(callee)) {
        return callee;
    }
    if (arkts.isMemberExpression(callee)) {
        return findRootCallee(callee.object);
    }
    if (arkts.isTSAsExpression(callee)) {
        return findRootCallee(callee.expr);
    }
    if (arkts.isTSNonNullExpression(callee)) {
        return findRootCallee(callee.expr);
    }
    return undefined;
}

export function getAnnotationName(anno: arkts.AnnotationUsage, ignoreDecl?: boolean): string | undefined {
    if (!anno.expr || !arkts.isIdentifier(anno.expr)) {
        return undefined;
    }
    const expr: arkts.Identifier = anno.expr;
    const name: string = expr.name;
    const whiteList: string[] = getNonArkUIAnnotationWhiteList();
    if (whiteList.includes(name)) {
        return name;
    }
    const decl = arkts.getPeerIdentifierDecl(expr.peer);
    if (!decl) {
        return undefined;
    }
    if (!ignoreDecl && !isDeclFromArkUI(decl)) {
        return undefined;
    }
    return name;
}

export function getNonArkUIAnnotationWhiteList(): string[] {
    return [DecoratorNames.JSONSTRINGIFYIGNORE, DecoratorNames.JSONRENAME];
}

export function getArkUIAnnotationNames(
    annotations: Annotations | undefined,
    info: AnnotationInfo | undefined
): string[] {
    if (!annotations || !info) {
        return [];
    }
    const keys = Object.keys(info);
    if (keys.length === 0) {
        return [];
    }
    const whiteList: string[] = getNonArkUIAnnotationWhiteList();
    let filteredList: string[] = [];
    Object.keys(annotations).forEach((name, idx) => {
        if (whiteList.includes(name) || !keys.at(idx)) {
            return;
        }
        filteredList.push(keys.at(idx)!);
    });
    return filteredList;
}

export function isDeclFromArkUI(
    decl: arkts.AstNode,
    matchSourcePrefix: (string | RegExp)[] = ARKUI_IMPORT_PREFIX_NAMES
): arkts.AstNode | undefined {
    const moduleName: string | undefined = arkts.getProgramFromAstNode(decl)?.moduleName;
    if (!moduleName || !matchPrefix(matchSourcePrefix, moduleName)) {
        return undefined;
    }
    DeclarationCollector.getInstance().collect(decl);
    return decl;
}

export function formatBuiltInInheritPropertyName(name: string): string {
    return name.slice(BuiltInNames.IMPLEMENT_PROPETY_PREFIX.length);
}

export function getStructFromCall(
    callObject: arkts.Identifier | undefined,
    callee: arkts.Identifier | undefined
): arkts.ClassDefinition | undefined {
    if (!callObject || !callee) {
        return undefined;
    }
    if (callee.name !== BuilderLambdaNames.ORIGIN_METHOD_NAME) {
        return undefined;
    }
    const decl = arkts.getPeerIdentifierDecl(callObject.peer);
    if (!decl || !arkts.isClassDefinition(decl) || !decl.ident) {
        return undefined;
    }
    return decl;
}

export function checkIsCallNameFromResource(name: string): name is Dollars.DOLLAR_RESOURCE | Dollars.DOLLAR_RAWFILE {
    return name === Dollars.DOLLAR_RESOURCE || name === Dollars.DOLLAR_RAWFILE;
}

export function checkIsCallNameFromForEach(name: string): name is InnerComponentNames.FOR_EACH {
    return name === InnerComponentNames.FOR_EACH;
}

export function checkIsCallNameFromBindable(name: string): name is Dollars.DOLLAR_DOLLAR {
    return name === Dollars.DOLLAR_DOLLAR;
}

export function checkIsNameStartWithBackingField(node: arkts.AstNode | undefined): boolean {
    if (!node || !arkts.isIdentifier(node)) {
        return false;
    }
    return node.name.startsWith(StateManagementTypes.BACKING);
}

export function checkIsStructFromNode(node: arkts.AstNode, shouldFindStructFlag?: boolean): boolean {
    if (arkts.isETSStructDeclaration(node)) {
        return true;
    }
    if (arkts.isClassDeclaration(node) && !!node.definition) {
        if (!!shouldFindStructFlag) {
            return node.definition.isFromStruct;
        }
        return true;
    }
    return false;
}

export function checkIsCustomComponentFromInfo(
    info: CustomComponentInfo | CustomComponentInterfaceInfo | undefined
): boolean {
    const annotationInfo = info?.annotationInfo ?? {};
    return !!annotationInfo.hasComponent || !!annotationInfo.hasComponentV2 || !!annotationInfo.hasCustomDialog;
}

export function checkIsCustomComponentDeclaredClassFromInfo(info: CustomComponentInfo | undefined): boolean {
    if (!info || !info.name || !info.isDecl || !info.isFromArkUI) {
        return false;
    }
    return (
        info.name === CustomComponentNames.COMPONENT_CLASS_NAME ||
        info.name === CustomComponentNames.COMPONENT_V2_CLASS_NAME ||
        info.name === CustomComponentNames.BASE_CUSTOM_DIALOG_NAME
    );
}

export function checkIsObservedClassFromInfo(info: NormalClassInfo | undefined): boolean {
    const annotationInfo = info?.annotationInfo ?? {};
    return !!annotationInfo.hasObserved || !!annotationInfo.hasObservedV2;
}

export function checkIsNormalClassHasTrackProperty(info: NormalClassInfo | undefined): boolean {
    return !!info?.hasTrackProperty;
}

export function checkIsETSGlobalClassFromInfo(info: NormalClassInfo | undefined): boolean {
    return !!info?.isETSGlobal;
}

export function checkIsCommonMethodInterfaceFromInfo(info: NormalInterfaceInfo | undefined): boolean {
    return info?.name === InnerComponentAttributes.COMMON_METHOD;
}

export function checkIsComponentAttributeInterfaceFromInfo(info: NormalInterfaceInfo | undefined): boolean {
    if (!info?.name) {
        return false;
    }
    const regex: RegExp = /(?<source>\w+Attribute)(?:<.*>)?$/;
    const match: RegExpExecArray | null = regex.exec(info.name);
    const attributeName: string | undefined = match?.groups?.source;
    return !!attributeName;
}

export function checkIsBuilderFromInfo(
    info: ParameterInfo | ArrowFunctionInfo | NormalClassPropertyInfo | StructPropertyInfo | CallDeclInfo | undefined
): boolean {
    return !!info?.annotationInfo?.hasBuilder;
}

export function checkIsBuilderLambdaMethodDeclFromInfo(metadata: StructMethodInfo | FunctionInfo): boolean {
    const isStructMethod = checkIsStructMethodFromInfo(metadata);
    let isBuilderLambda: boolean = !!metadata.annotationInfo?.hasComponentBuilder;
    if (isStructMethod) {
        isBuilderLambda &&=
            checkIsCustomComponentDeclaredClassFromInfo(metadata.structInfo) &&
            metadata.name === BuilderLambdaNames.ORIGIN_METHOD_NAME;
    }
    const isMethodDecl: boolean = !!metadata.isDecl;
    return isBuilderLambda && isMethodDecl;
}

export function checkIsBuilderLambdaFunctionCallFromInfo(info: StructMethodInfo): boolean {
    if (!info.name) {
        return false;
    }
    return (
        info.name !== BuilderLambdaNames.ORIGIN_METHOD_NAME && info.name !== BuilderLambdaNames.TRANSFORM_METHOD_NAME
    );
}

export function checkIsStructMethodFromInfo(info: RecordInfo): info is StructMethodInfo {
    return Object.hasOwn(info, 'structInfo');
}

export function getGetterSetterTypeFromInfo(metadata: NormalClassMethodInfo): GetSetTypes | undefined {
    switch (metadata.kind) {
        case arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET:
            return GetSetTypes.GET;
        case arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET:
            return GetSetTypes.SET;
    }
    return undefined;
}

export function checkIsObservedImplementsMethod(metadata: NormalClassMethodInfo): boolean {
    const needObservedTransform =
        !!metadata.classInfo?.annotationInfo?.hasObserved || !!metadata.inheritPorpertyInfo?.annotationInfo?.hasTrack;
    return needObservedTransform;
}

export function checkIsObservedV2ImplementsMethod(metadata: NormalClassMethodInfo): boolean {
    const needObservedTransform =
        !!metadata.classInfo?.annotationInfo?.hasObservedV2 || !!metadata.inheritPorpertyInfo?.annotationInfo?.hasTrace;
    return needObservedTransform;
}

export function checkIsCustomComponentClassFromInfo(info: CustomComponentInfo): boolean {
    return checkIsCustomComponentFromInfo(info) || checkIsCustomComponentDeclaredClassFromInfo(info);
}

export function checkIsGlobalFunctionFromInfo(info: FunctionInfo): boolean {
    return (
        !Object.hasOwn(info, 'classInfo') && !Object.hasOwn(info, 'structInfo') && !Object.hasOwn(info, 'interfaceInfo')
    );
}

export function checkIsNormalClassMethodFromInfo(info: NormalClassMethodInfo): boolean {
    return Object.hasOwn(info, 'classInfo');
}

export function checkIsStructInterfacePropertyFromInfo(info: CustomComponentInterfacePropertyInfo): boolean {
    if (!Object.hasOwn(info, 'interfaceInfo')) {
        return false;
    }
    return checkIsCustomComponentFromInfo(info.interfaceInfo);
}

export function checkIsNormalInterfacePropertyFromInfo(info: NormalInterfacePropertyInfo): boolean {
    return Object.hasOwn(info, 'interfaceInfo');
}

export function checkIsResourceFromInfo(metadata: CallInfo): boolean {
    return !!metadata.isResourceCall;
}

export function checkIsStructPropertyFromInfo(info: StructPropertyInfo): boolean {
    return Object.hasOwn(info, 'structInfo');
}

export function checkIsNormalClassPropertyFromInfo(info: NormalClassPropertyInfo): boolean {
    return Object.hasOwn(info, 'classInfo');
}

export function checkIsBuilderLambdaFromInfo(metadata: CallInfo): boolean {
    const rootCallInfo: CallInfo | undefined = metadata.rootCallInfo ?? metadata;
    if (!rootCallInfo) {
        return false;
    }
    return !!rootCallInfo.annotationInfo?.hasComponentBuilder;
}

export function checkIsFunctionMethodDeclFromInfo(metadata: StructMethodInfo | FunctionInfo): metadata is FunctionInfo {
    return (
        !!metadata.isDecl &&
        Object.hasOwn(metadata, 'innerComponentInfo') &&
        !!(metadata as FunctionInfo).innerComponentInfo
    );
}

export function checkIsMonitorMethodFromInfo(metadata: StructMethodInfo | NormalClassMethodInfo): boolean {
    return !!metadata.annotationInfo?.hasMonitor;
}

export function checkIsComputedMethodFromInfo(metadata: StructMethodInfo | NormalClassMethodInfo): boolean {
    return !!metadata.annotationInfo?.hasComputed;
}

export function checkIsDialogControllerNewInstanceFromInfo(metadata: NewClassInstanceInfo | undefined): boolean {
    return metadata?.declName === CustomDialogNames.CUSTOM_DIALOG_CONTROLLER;
}

export function checkIsAnimatableExtendMethodFromInfo(metadata: FunctionInfo): boolean {
    return !!metadata.annotationInfo?.hasAnimatableExtend;
}

export function checkIsCallFromLegacyBuilderFromInfo(metadata: CallInfo): boolean {
    if (!metadata.isDeclFromLegacy) {
        return false;
    }
    return !!metadata.annotationInfo?.hasBuilder || !!metadata.ignoredAnnotationInfo?.hasMemo;
}

export function checkIsInteropComponentCallFromInfo(metadata: CallInfo): boolean {
    return !!metadata.structDeclInfo?.isLegacy;
}

export function checkIsCustomDialogControllerBuilderOptionsFromInfo(metadata: NormalInterfacePropertyInfo): boolean {
    return (
        metadata.interfaceInfo?.name === CustomDialogNames.CUSTOM_DIALOG_CONTROLLER_OPTIONS &&
        metadata.name === CustomDialogNames.OPTIONS_BUILDER
    );
}

export function collectStructPropertyInfos(metadata: CallInfo): CustomComponentInterfacePropertyInfo[] {
    if (!metadata.structPropertyInfos) {
        return [];
    }
    return filterDefined(metadata.structPropertyInfos.map((info) => info[1]));
}
