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

import * as fs from 'fs';
import * as path from 'path';
import * as arkts from '@koalaui/libarkts';
import { CustomComponentInfo, isKnownMethodDefinition } from '../utils';
import { matchPrefix } from '../../common/arkts-utils';
import {
    ARKUI_IMPORT_PREFIX_NAMES,
    Dollars,
    ModuleType,
    DefaultConfiguration,
    LogType,
    RESOURCE_TYPE,
    DecoratorNames,
    CustomComponentNames,
    CustomDialogNames,
} from '../../common/predefines';
import { DeclarationCollector } from '../../common/declaration-collector';
import { ProjectConfig, ResourceList } from '../../common/plugin-context';
import { LogCollector } from '../../common/log-collector';
import { hasDecorator } from '../property-translators/utils';

export enum StructType {
    STRUCT,
    CUSTOM_COMPONENT_DECL,
}

export type ScopeInfoCollection = {
    customComponents: CustomComponentScopeInfo[];
};

export type CustomComponentScopeInfo = CustomComponentInfo & {
    hasInitializeStruct?: boolean;
    hasUpdateStruct?: boolean;
    hasReusableRebind?: boolean;
    keyRange?: arkts.SourceRange;
};

export interface ResourceParameter {
    id: number;
    type: number;
    params: arkts.Expression[];
}

export interface ObservedAnnoInfo {
    className: string;
    isObserved: boolean;
    isObservedV2: boolean;
    classHasTrace: boolean;
    classHasTrack: boolean;
}

export type ClassScopeInfo = ObservedAnnoInfo & {
    getters: arkts.MethodDefinition[];
};

export function getCustomComponentNameFromInfo(info: CustomComponentScopeInfo): string {
    if (!!info.annotations.componentV2) {
        return CustomComponentNames.COMPONENT_V2_CLASS_NAME;
    } else if (!!info.annotations.customDialog) {
        return CustomComponentNames.BASE_CUSTOM_DIALOG_NAME;
    }
    return CustomComponentNames.COMPONENT_CLASS_NAME;
}

export function getResourceParams(id: number, type: number, params: arkts.Expression[]): ResourceParameter {
    return { id, type, params };
}

/**
 * Determine whether it is ETSGLOBAL class.
 *
 * @param node class declaration node
 */
export function isEtsGlobalClass(node: arkts.ClassDeclaration): boolean {
    if (node.definition?.isGlobal) {
        return true;
    }
    return false;
}

/**
 * Determine whether it is resource node begin with `$r` or `$rawfile`.
 *
 * @param node call expression node
 */
export function isResourceNode(node: arkts.CallExpression, ignoreDecl: boolean = false): boolean {
    if (
        !(
            arkts.isIdentifier(node.expression) &&
            (node.expression.name === Dollars.DOLLAR_RESOURCE || node.expression.name === Dollars.DOLLAR_RAWFILE)
        )
    ) {
        return false;
    }
    if (!ignoreDecl) {
        const decl = arkts.getPeerIdentifierDecl(node.expression.peer);
        if (!decl) {
            return false;
        }
        const moduleName = arkts.getProgramFromAstNode(decl)?.moduleName;
        if (!moduleName || !matchPrefix(ARKUI_IMPORT_PREFIX_NAMES, moduleName)) {
            return false;
        }
        DeclarationCollector.getInstance().collect(decl);
    }
    return true;
}

/**
 * Verify whether the rawfile resource exists in the current module.
 *
 * @param resourceNode resource node.
 * @param rawfileStr rawfile string.
 * @param fromOtherModule flag about whether it is a resource for other modules.
 * @param rawfileSet a set that records all the rawfile resources.
 */
export function checkRawfileResource(
    resourceNode: arkts.CallExpression,
    rawfileStr: arkts.StringLiteral,
    fromOtherModule: boolean,
    rawfileSet: Set<string>
): void {
    if (!fromOtherModule && !rawfileSet.has(rawfileStr.str)) {
        LogCollector.getInstance().collectLogInfo({
            level: LogType.ERROR,
            node: resourceNode,
            message: `No such '${rawfileStr.str}' resource in current module.`,
            code: '10904333',
        });
    }
}

/**
 * Check the format and the existance of resource string literal.
 *
 * @param resourceData array of resource string literals.
 * @param resourcesList resources including app, sys and hsp.
 * @param literalArg string literal argument node.
 * @param fromOtherModule flag about whether it is a resource for other modules.
 * @param projectConfig configuration information of the project.
 */
export function preCheckResourceData(
    resourceNode: arkts.CallExpression,
    resourceData: string[],
    resourcesList: ResourceList,
    fromOtherModule: boolean,
    projectConfig: ProjectConfig
): boolean {
    let code: string | undefined;
    let message: string | undefined;
    if (resourceData.length !== 3) {
        message = 'The input parameter is not supported.';
        code = '10905332';
    }
    if (!RESOURCE_TYPE[resourceData[1]]) {
        message = `The resource type ${resourceData[1]} is not supported.`;
        code = '10906334';
    }
    if (!!code && !!message) {
        LogCollector.getInstance().collectLogInfo({
            level: LogType.ERROR,
            node: resourceNode,
            message: message,
            code: code,
        });
        return false;
    }
    return preCheckResourceDataExistance(resourceNode, resourceData, resourcesList, fromOtherModule, projectConfig);
}

/**
 * Check the existance of resource string literal when the format of the string literal is correct.
 *
 * @param resourceData array of resource string literals.
 * @param resourcesList resources including app, sys and hsp.
 * @param literalArg string literal argument node.
 * @param fromOtherModule flag about whether it is a resource for other modules.
 * @param projectConfig configuration information of the project.
 */
export function preCheckResourceDataExistance(
    resourceNode: arkts.CallExpression,
    resourceData: string[],
    resourcesList: ResourceList,
    fromOtherModule: boolean,
    projectConfig: ProjectConfig
): boolean {
    if (fromOtherModule) {
        if (/^\[.*\]$/.test(resourceData[0]) && projectConfig.hspResourcesMap) {
            const resourceDataFirst: string = resourceData[0].replace(/^\[/, '').replace(/\]$/, '').trim();
            return resourceCheck(resourceNode, resourceData, resourcesList, true, resourceDataFirst, false);
        } else {
            return resourceCheck(resourceNode, resourceData, resourcesList, false, resourceData[0], true);
        }
    } else {
        return resourceCheck(resourceNode, resourceData, resourcesList, false, resourceData[0], false);
    }
}

/**
 * Verify whether the app resource exists in the current module.
 *
 * @param resourceNode resource node.
 * @param resourceData array of resource string literals.
 * @param resourcesList resources including app, sys and hsp.
 * @param isHarHspResourceModule flag about whether it is from hsp or har module.
 * @param resourceDataFirst the first element of resource string literals.
 * @param noHspResourcesMap the non-existence of hspResourcesMap.
 */
function resourceCheck(
    resourceNode: arkts.CallExpression,
    resourceData: string[],
    resourcesList: ResourceList,
    isHarHspResourceModule: boolean,
    resourceDataFirst: string,
    noHspResourcesMap: boolean
): boolean {
    let checkResult: boolean = true;
    const logType: LogType = isHarHspResourceModule ? LogType.WARN : LogType.ERROR;
    let code: string | undefined;
    let message: string | undefined;
    if (!noHspResourcesMap && !resourcesList[resourceDataFirst]) {
        code = '10903331';
        message = `Unknown resource source '${resourceDataFirst}'.`;
        checkResult = isHarHspResourceModule ? checkResult : false;
    } else if (!noHspResourcesMap && !resourcesList[resourceDataFirst].get(resourceData[1])) {
        code = '10903330';
        message = `Unknown resource type '${resourceData[1]}'.`;
        checkResult = isHarHspResourceModule ? checkResult : false;
    } else if (!noHspResourcesMap && !resourcesList[resourceDataFirst].get(resourceData[1])![resourceData[2]]) {
        code = '10903329';
        message = `Unknown resource name '${resourceData[2]}'.`;
        checkResult = isHarHspResourceModule ? checkResult : false;
    }
    if (!!code && !!message) {
        LogCollector.getInstance().collectLogInfo({
            level: logType,
            node: resourceNode,
            message: message,
            code: code,
        });
    }
    return checkResult;
}

/**
 * generate bundleName for $r and $rawfile.
 *
 * @param projectConfig project config.
 * @param isDynamicBundleOrModule a flag for determining whether to use dynamic module name and bundle name.
 */
export function generateResourceBundleName(projectConfig: ProjectConfig, isDynamicBundleOrModule: boolean): string {
    if (projectConfig.resetBundleName || projectConfig.allowEmptyBundleName) {
        return '';
    }
    if (isDynamicBundleOrModule) {
        return DefaultConfiguration.DYNAMIC_BUNDLE_NAME;
    }
    return projectConfig.moduleType === ModuleType.HAR
        ? DefaultConfiguration.HAR_DEFAULT_BUNDLE_NAME
        : projectConfig.bundleName
          ? projectConfig.bundleName
          : '';
}

/**
 * generate moduleName for $r and $rawfile.
 *
 * @param projectConfig project config.
 * @param isDynamicBundleOrModule a flag for determining whether to use dynamic module name and bundle name.
 */
export function generateResourceModuleName(
    projectConfig: ProjectConfig,
    isDynamicBundleOrModule: boolean = false,
    resourceModuleName: string,
    fromOtherModule: boolean
): string {
    if (fromOtherModule && resourceModuleName) {
        return resourceModuleName.replace(/^\[|\]$/g, '');
    }
    if (isDynamicBundleOrModule) {
        return DefaultConfiguration.DYNAMIC_MODULE_NAME;
    }
    return projectConfig.moduleType === ModuleType.HAR
        ? DefaultConfiguration.HAR_DEFAULT_MODULE_NAME
        : projectConfig.moduleName
          ? projectConfig.moduleName
          : '';
}

/**
 * Determine whether to use dynamic module name and bundle name.
 *
 * @param projectConfig project config.
 */
export function isDynamicName(projectConfig: ProjectConfig): boolean {
    const isByteCodeHar: boolean = projectConfig.moduleType === ModuleType.HAR && projectConfig.byteCodeHar;
    const uiTransformOptimization: boolean = !!projectConfig.uiTransformOptimization;
    return uiTransformOptimization ? uiTransformOptimization : isByteCodeHar;
}

export function getCustomDialogController(node: arkts.ClassProperty): string {
    const key = node.key;
    let controllerName: string = '';
    if (!(key && arkts.isIdentifier(key) && node.typeAnnotation)) {
        return '';
    }
    const typeAnno = node.typeAnnotation;
    if (arkts.isETSUnionType(typeAnno)) {
        for (const type of typeAnno.types) {
            if (arkts.isETSTypeReference(type)) {
                controllerName = hasController(type, key.name);
            }
        }
    } else if (arkts.isETSTypeReference(typeAnno)) {
        controllerName = hasController(typeAnno, key.name);
    }
    return controllerName;
}

export function hasController(node: arkts.ETSTypeReference, keyName: string): string {
    const ident = node.part?.name;
    if (ident && arkts.isIdentifier(ident) && ident.name === CustomDialogNames.CUSTOM_DIALOG_CONTROLLER) {
        return keyName;
    }
    return '';
}

export function isInvalidDialogControllerOptions(args: readonly arkts.Expression[]): boolean {
    const firstOptionsParameter: arkts.AstNode = args[0];
    return (
        args.length <= 0 ||
        !(isObjectAsExpression(firstOptionsParameter) || arkts.isObjectExpression(firstOptionsParameter))
    );
}

function isObjectAsExpression(param: arkts.AstNode): boolean {
    return arkts.isTSAsExpression(param) && !!param.expr && arkts.isObjectExpression(param.expr);
}

export function isComputedMethod(node: arkts.AstNode): boolean {
    return arkts.isMethodDefinition(node) && hasDecorator(node, DecoratorNames.COMPUTED);
}

export function findBuilderIndexInControllerOptions(properties: readonly arkts.Expression[]): number {
    return properties.findIndex((item: arkts.Expression) => {
        return (
            arkts.isProperty(item) &&
            !!item.key &&
            arkts.isIdentifier(item.key) &&
            item.key.name === CustomDialogNames.OPTIONS_BUILDER
        );
    });
}

export function getNoTransformationMembersInClass(
    definition: arkts.ClassDefinition,
    ObservedAnno: ObservedAnnoInfo
): arkts.AstNode[] {
    return definition.body.filter(
        (member) =>
            !arkts.isClassProperty(member) &&
            !(
                arkts.isMethodDefinition(member) &&
                arkts.hasModifierFlag(member, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_GETTER)
            ) &&
            !(
                ObservedAnno.isObservedV2 &&
                arkts.isMethodDefinition(member) &&
                (hasDecorator(member, DecoratorNames.COMPUTED) ||
                    isKnownMethodDefinition(member, CustomComponentNames.COMPONENT_CONSTRUCTOR_ORI))
            )
    );
}