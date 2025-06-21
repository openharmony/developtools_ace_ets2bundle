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

// This is the same plugin-context in the build-system.
export class PluginContext {
    private ast: arkts.EtsScript | undefined;
    private program: arkts.Program | undefined;
    private projectConfig: ProjectConfig | undefined;
    private contextPtr: number | undefined;

    constructor() {
        this.ast = undefined;
        this.program = undefined;
        this.projectConfig = undefined;
        this.contextPtr = undefined;
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
}

export interface DependentModuleConfig {
    packageName: string;
    moduleName: string;
    moduleType: string;
    modulePath: string;
    sourceRoots: string[];
    entryFile: string;
    language: string,
    declFilesPath?: string,
    dependencies?: string[]
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
    projectPath: string,
    projectRootPath: string,
    integratedHsp: boolean
    frameworkMode?: string;
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
