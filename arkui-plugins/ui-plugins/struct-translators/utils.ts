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
import { CustomComponentInfo } from '../utils';
import { matchPrefix } from '../../common/arkts-utils';
import {
    ARKUI_IMPORT_PREFIX_NAMES,
    Dollars,
    ModuleType,
    DefaultConfiguration,
    LogType,
    RESOURCE_TYPE,
    InnerComponentNames,
    ARKUI_FOREACH_SOURCE_NAME,
} from '../../common/predefines';
import { DeclarationCollector } from '../../common/declaration-collector';
import { ProjectConfig } from '../../common/plugin-context';
import { LogCollector } from '../../common/log-collector';

export type ScopeInfoCollection = {
    customComponents: CustomComponentScopeInfo[];
};

export type CustomComponentScopeInfo = CustomComponentInfo & {
    hasInitializeStruct?: boolean;
    hasUpdateStruct?: boolean;
    hasReusableRebind?: boolean;
};

type ResourceMap = Map<string, Record<string, number>>;

export interface ResourceList {
    [key: string]: ResourceMap;
}

export interface ResourceInfo {
    resourcesList: ResourceList;
    rawfile: Set<string>;
}

export interface LoaderJson {
    hspResourcesMap: Record<string, string>;
}

export interface ResourceParameter {
    id: number;
    type: number;
    params: arkts.Expression[];
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
    if (node.definition?.ident?.name === 'ETSGLOBAL') {
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
        const decl = arkts.getDecl(node.expression);
        if (!decl) {
            return false;
        }
        const moduleName: string = arkts.getProgramFromAstNode(decl).moduleName;
        if (!moduleName || !matchPrefix(ARKUI_IMPORT_PREFIX_NAMES, moduleName)) {
            return false;
        }
        DeclarationCollector.getInstance().collect(decl);
    }
    return true;
}

export function isForEachCall(node: arkts.CallExpression): boolean {
    if (
        arkts.isIdentifier(node.expression) &&
        node.expression.name === InnerComponentNames.FOR_EACH &&
        node.arguments.length >= 2
    ) {
        return true;
    }
    return false;
}

/**
 * Read the content of file 'loader.json'.
 *
 * @param projectConfig configuration information of the project.
 */
export function loadBuildJson(projectConfig: ProjectConfig | undefined): any {
    if (!!projectConfig && projectConfig.buildLoaderJson && fs.existsSync(projectConfig.buildLoaderJson)) {
        try {
            const content = fs.readFileSync(projectConfig.buildLoaderJson, 'utf-8');
            const parsedContent = JSON.parse(content);
            return parsedContent;
        } catch (error) {
            throw new Error('Error: The file is not a valid JSON format.');
        }
    }
    return {};
}

/**
 * Initialize all resources information, including app resources, system resources, dependent hap resources and rawfile resources.
 *
 * @param projectConfig configuration information of the project.
 * @param aceBuildJson content of the file 'loader.json'.
 */
export function initResourceInfo(projectConfig: ProjectConfig | undefined, aceBuildJson: LoaderJson): ResourceInfo {
    let resourcesList: ResourceList = {
        app: new Map<string, Record<string, number>>(),
        sys: new Map<string, Record<string, number>>(),
    };
    let rawfile: Set<string> = new Set<string>();
    if (!!projectConfig) {
        readAppResource(resourcesList, projectConfig, aceBuildJson, rawfile);
    }
    return { resourcesList, rawfile };
}

/**
 * Fill in the resource details to the resourcesList and rawfile.
 *
 * @param resourcesList resources including app, sys and hsp.
 * @param projectConfig configuration information of the project.
 * @param aceBuildJson content of the file 'loader.json'.
 * @param rawfile rawfile resource name set.
 */
function readAppResource(
    resourcesList: ResourceList,
    projectConfig: ProjectConfig,
    aceBuildJson: LoaderJson,
    rawfile: Set<string>
): void {
    if ('hspResourcesMap' in aceBuildJson && aceBuildJson.hspResourcesMap) {
        readHspResource(aceBuildJson, projectConfig, resourcesList);
    }
    readSystemResource(resourcesList);
    if (!!projectConfig.appResource && fs.existsSync(projectConfig.appResource)) {
        const appResource: string = fs.readFileSync(projectConfig.appResource, 'utf-8');
        const resourceArr: string[] = appResource.split(/\n/);
        const resourceMap: ResourceMap = new Map<string, Record<string, number>>();
        processResourceArr(resourceArr, resourceMap, projectConfig.appResource);
        for (let [key, value] of resourceMap) {
            resourcesList.app.set(key, value);
        }
    }
    if (projectConfig.rawFileResource) {
        processResourcesRawfile(projectConfig, projectConfig.rawFileResource, rawfile);
    }
}

/**
 * Fill in the resource details to the system resource.
 *
 * @param resourcesList resources including app, sys and hsp.
 */
function readSystemResource(resourcesList: ResourceList): void {
    const sysResourcePath = path.resolve(__dirname, '../sysResource.js');
    if (fs.existsSync(sysResourcePath)) {
        const sysObj: Record<string, Record<string, number>> = require(sysResourcePath).sys;
        Object.keys(sysObj).forEach((key: string) => {
            resourcesList.sys.set(key, sysObj[key]);
        });
    }
}

/**
 * generate resource map.
 *
 * @param resourceArr lines of file 'ResourceTable.txt'.
 * @param resourceMap A map that records the mapping of resource type, name and id.
 * @param resourcePath path of file 'ResourceTable.txt'.
 */
function processResourceArr(
    resourceArr: string[],
    resourceMap: Map<string, Record<string, number>>,
    resourcePath: string
): void {
    for (let i = 0; i < resourceArr.length; i++) {
        if (!resourceArr[i].length) {
            continue;
        }
        const resourceData = resourceArr[i].split(/\s/);
        if (resourceData.length === 3 && !isNaN(Number(resourceData[2]))) {
            rescordResourceNameAndIdMap(resourceMap, resourceData);
        } else {
            console.warn(`ArkTS:WARN The format of file '${resourcePath}' is incorrect.`);
            break;
        }
    }
}

/**
 * Construct the mapping of resource type, name and id with 'ResourceTable.txt'.
 *
 * @param resourceMap A map that records the mapping of resource type, name and id.
 * @param resourceData array of type, name and id.
 */
function rescordResourceNameAndIdMap(resourceMap: Map<string, Record<string, number>>, resourceData: string[]): void {
    if (resourceMap.get(resourceData[0])) {
        const resourceNameAndId: Record<string, number> = resourceMap.get(resourceData[0])!;
        if (!resourceNameAndId[resourceData[1]] || resourceNameAndId[resourceData[1]] !== Number(resourceData[2])) {
            resourceNameAndId[resourceData[1]] = Number(resourceData[2]);
        }
    } else {
        let obj: Record<string, number> = {};
        obj[resourceData[1]] = Number(resourceData[2]);
        resourceMap.set(resourceData[0], obj);
    }
}

/**
 * Fill in the resource details to the hsp resource.
 *
 * @param projectConfig configuration information of the project.
 * @param aceBuildJson content of the file 'loader.json'.
 * @param resourcesList resources including app, sys and hsp.
 */
function readHspResource(aceBuildJson: LoaderJson, projectConfig: ProjectConfig, resourcesList: ResourceList): void {
    projectConfig.hspResourcesMap = true;
    for (const hspName in aceBuildJson.hspResourcesMap) {
        if (fs.existsSync(aceBuildJson.hspResourcesMap[hspName])) {
            const resourceMap: ResourceMap = new Map<string, Record<string, number>>();
            resourcesList[hspName] = new Map<string, Record<string, number>>();
            const hspResource: string = fs.readFileSync(aceBuildJson.hspResourcesMap[hspName], 'utf-8');
            const resourceArr: string[] = hspResource.split(/\n/);
            processResourceArr(resourceArr, resourceMap, aceBuildJson.hspResourcesMap[hspName]);
            for (const [key, value] of resourceMap) {
                resourcesList[hspName].set(key, value);
            }
        }
    }
}

/**
 * Record the information of the rawfile resource.
 *
 * @param projectConfig configuration information of the project.
 * @param rawfilePath path of rawfile directory.
 * @param rawfileSet a set includes rawfile resource names.
 * @param resourceName combination of existing directory names.
 */
function processResourcesRawfile(
    projectConfig: ProjectConfig,
    rawfilePath: string,
    rawfileSet: Set<string>,
    resourceName: string = ''
): void {
    if (fs.existsSync(projectConfig.rawFileResource) && fs.statSync(rawfilePath).isDirectory()) {
        const files: string[] = fs.readdirSync(rawfilePath);
        files.forEach((file: string) => {
            if (fs.statSync(path.join(rawfilePath, file)).isDirectory()) {
                processResourcesRawfile(
                    projectConfig,
                    path.join(rawfilePath, file),
                    rawfileSet,
                    resourceName ? resourceName + '/' + file : file
                );
            } else {
                addRawfileResourceToSet(rawfileSet, file, resourceName);
            }
        });
    }
}

/**
 * Add rawfile name to the collection of rawfile set.
 *
 * @param rawfileSet a set includes rawfile resource names.
 * @param file rawfile name.
 * @param resourceName combination of existing directory names.
 */
function addRawfileResourceToSet(rawfileSet: Set<string>, file: string, resourceName: string = ''): void {
    if (resourceName) {
        rawfileSet.add(resourceName + '/' + file);
    } else {
        rawfileSet.add(file);
    }
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
            type: LogType.ERROR,
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
            type: LogType.ERROR,
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
            type: logType,
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

/**
 * Determine whether the node is ForEach method declaration.
 *
 * @param node method definition node.
 * @param sourceName external source name.
 */
export function isForEachDecl(node: arkts.MethodDefinition, sourceName: string | undefined): boolean {
    const isForEach: boolean = !!node.name && node.name.name === InnerComponentNames.FOR_EACH;
    const isMethodDecl: boolean =
        !!node.scriptFunction &&
        arkts.hasModifierFlag(node.scriptFunction, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE);
    return isForEach && isMethodDecl && !!sourceName && sourceName === ARKUI_FOREACH_SOURCE_NAME;
}
