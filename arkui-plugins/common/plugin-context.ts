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

import * as path from 'path';
import * as fs from 'fs';
import * as arkts from '@koalaui/libarkts';
import { FileManager } from './file-manager';

// This is the same plugin-context in the build-system.
export class PluginContext {
    private ast: arkts.EtsScript | undefined;
    private program: arkts.Program | undefined;
    private projectConfig: ProjectConfig | undefined;
    private contextPtr: number | undefined;
    private codingFilePath: string | undefined;
    private fileManager: FileManager | undefined;

    constructor() {
        this.ast = undefined;
        this.program = undefined;
        this.projectConfig = undefined;
        this.contextPtr = undefined;
        this.codingFilePath = undefined;
        this.fileManager = undefined;
    }

    public getFileManager(): FileManager | undefined {
        return this.fileManager;
    }

    /**
     * @deprecated
     */
    public setArkTSAst(ast: arkts.EtsScript): void {
        this.ast = ast;
    }

    /**
     * @deprecated
     */
    public getArkTSAst(): arkts.EtsScript | undefined {
        return this.ast;
    }

    /**
     * @deprecated
     */
    public setArkTSProgram(program: arkts.Program): void {
        this.program = program;
    }

    /**
     * @deprecated
     */
    public getArkTSProgram(): arkts.Program | undefined {
        return this.program;
    }

    public setProjectConfig(projectConfig: ProjectConfig): void {
        this.projectConfig = projectConfig;
    }

    public getProjectConfig(): ProjectConfig | undefined {
        return this.projectConfig;
    }

    public setContextPtr(ptr: number): void {
        this.contextPtr = ptr;
    }

    public getContextPtr(): number | undefined {
        return this.contextPtr;
    }

    public setCodingFilePath(codingFilePath: string): void {
        this.codingFilePath = codingFilePath;
    }

    public getCodingFilePath(): string | undefined {
        return this.codingFilePath;
    }

    public isCoding(): boolean {
        return this.codingFilePath !== undefined;
    }
}

/**
 * Read the content of file 'loader.json'.
 *
 * @param projectConfig configuration information of the project.
 */
export function loadBuildJson(projectConfig: ProjectConfig | undefined): Partial<LoaderJson> {
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
 * Initializes routerInfo which maps absolute file paths to corresponding build functions
 *
 * @param aceBuildJson content of the file 'loader.json'.
 */
export function initRouterInfo(aceBuildJson: Partial<LoaderJson>): Map<string, RouterInfo[]> {
    const routerInfo: Map<string, RouterInfo[]> = new Map<string, RouterInfo[]>();
    if (!aceBuildJson || !aceBuildJson.routerMap || !Array.isArray(aceBuildJson.routerMap)) {
        return routerInfo;
    }
    aceBuildJson.routerMap.forEach((item) => {
        if (item.pageSourceFile && item.name && item.buildFunction) {
            setRouterInfo(routerInfo, item);
        }
    });
    return routerInfo;
}


/**
 * Initialize all resources information, including app resources, system resources, dependent hap resources and rawfile resources.
 *
 * @param projectConfig configuration information of the project.
 * @param aceBuildJson content of the file 'loader.json'.
 */
export function initResourceInfo(
    projectConfig: ProjectConfig | undefined, 
    aceBuildJson: Partial<LoaderJson>,
    sysResourcePath: string
): ResourceInfo {
    let resourcesList: ResourceList = {
        app: new Map<string, Record<string, number>>(),
        sys: new Map<string, Record<string, number>>(),
    };
    let rawfile: Set<string> = new Set<string>();
    if (!!projectConfig && !!aceBuildJson) {
        readAppResource(sysResourcePath, resourcesList, projectConfig, aceBuildJson, rawfile);
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
    sysResourcePath: string,
    resourcesList: ResourceList,
    projectConfig: ProjectConfig,
    aceBuildJson: Partial<LoaderJson>,
    rawfile: Set<string>
): void {
    if ('hspResourcesMap' in aceBuildJson && aceBuildJson.hspResourcesMap) {
        readHspResource(aceBuildJson, projectConfig, resourcesList);
    }
    readSystemResource(resourcesList, sysResourcePath);
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
export function readSystemResource(resourcesList: ResourceList, resourcePath: string): void {
    const sysResourcePath = resourcePath;
    if (fs.existsSync(sysResourcePath)) {
        const sysObj: Record<string, Record<string, number>> = require(sysResourcePath).sys;
        Object.keys(sysObj).forEach((key: string) => {
            resourcesList.sys.set(key, sysObj[key]);
        });
    }
}

/**
 * set router info based on the information of router map.
 */
function setRouterInfo(routerInfo: Map<string, RouterInfo[]>, routerMapItem: RouterMap): void {
    const { pageSourceFile, name, buildFunction } = routerMapItem;
    const filePath = path.resolve(pageSourceFile);
    if (routerInfo.has(filePath)) {
        routerInfo.get(filePath)!.push({ name: name, buildFunction: buildFunction });
    } else {
        routerInfo.set(filePath, [{ name: name, buildFunction: buildFunction }]);
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
function readHspResource(aceBuildJson: Partial<LoaderJson>, projectConfig: ProjectConfig, resourcesList: ResourceList): void {
    if (aceBuildJson.hspResourcesMap === undefined) {
        return;
    }
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

export interface DependentModuleConfig {
    packageName: string;
    moduleName: string;
    moduleType: string;
    modulePath: string;
    sourceRoots: string[];
    entryFile: string;
    language: string;
    declFilesPath?: string;
    dependencies?: string[];
}

export interface ProjectConfig {
    bundleName: string;
    moduleName: string;
    cachePath: string;
    dependentModuleList: DependentModuleConfig[];
    appResource: string;
    rawFileResource: string;
    buildLoaderJson: string;
    hspResourcesMap: boolean;
    compileHar: boolean;
    byteCodeHar: boolean;
    uiTransformOptimization: boolean;
    resetBundleName: boolean;
    allowEmptyBundleName: boolean;
    moduleType: string;
    moduleRootPath: string;
    aceModuleJsonPath: string;
    ignoreError: boolean;
    projectPath: string;
    projectRootPath: string;
    integratedHsp: boolean;
    frameworkMode?: string;
    externalApiPaths: string[];
    externalApiPath: string;
    compatibleSdkVersion?: number;
    debugLine?: boolean;
    aceProfilePath?: string;// 获取意图7.0 缓存文件存放路径
}

export type PluginHandlerFunction = () => void;

export type PluginHandlerObject = {
    order: 'pre' | 'post' | undefined;
    handler: PluginHandlerFunction;
};

export type PluginHandler = PluginHandlerFunction | PluginHandlerObject;

export interface Plugins {
    name: string;
    afterNew?: PluginHandler;
    parsed?: PluginHandler;
    scopeInited?: PluginHandler;
    checked?: PluginHandler;
    lowered?: PluginHandler;
    asmGenerated?: PluginHandler;
    binGenerated?: PluginHandler;
    clean?: PluginHandler;
}

export type PluginState = keyof Omit<Plugins, 'name'>;

export type PluginExecutor = {
    name: string;
    handler: PluginHandlerFunction;
};

export interface BuildConfig {
    compileFiles: string[];
}

// RESOURCE TYPES
export type ResourceMap = Map<string, Record<string, number>>;

export interface ResourceList {
    [key: string]: ResourceMap;
}

export interface ResourceInfo {
    resourcesList: ResourceList;
    rawfile: Set<string>;
}

export interface LoaderJson {
    hspResourcesMap: Record<string, string>;
    routerMap: RouterMap;
}

export type RouterMap = RouterInfo & {
    ohmurl: string;
    pageSourceFile: string;
};

export type RouterInfo = {
    name: string;
    buildFunction: string;
};

export type ConsistentResourceMap = Map<string, ConsistentResourceInfo[]>;

export type ConsistentResourceInfo = {
    id: string;
    resourceName: string;
}

// UI COMPONENT TYPES
export interface UIComponents {
    builtInAttributes: string[];
    containerComponents: string[];
    atomicComponents: string[];
    singleChildComponents: string[];
    validParentComponent: Map<string, string[]>;
    validChildComponent: Map<string, string[]>;
}

export interface ComponentJson {
    name: string;
    atomic?: boolean;
    attrs: string[];
    single?: boolean;
    parents?: string[];
    children?: string[];
}

// APPLICATION MAIN PAGE TYPES
export type ApplicationModuleConfig = {
    module: {
        pages: string;
    };
};

export type ApplicationMainPages = {
    src: string[];
};
