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

import { Es2pandaContextState } from '../../generated/Es2pandaEnums';
import { ETSModule, Program } from '../../generated';
import { ExternalSource } from './peers/ExternalSource';
import { KNativePointer, nullptr } from '@koalaui/interop';
import { global } from './static/global';
import { Context } from './peers/Context';

export interface CompilationOptions {
    readonly isProgramForCodegeneration: boolean;
    readonly state: Es2pandaContextState;
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
    isUi2abc?: boolean;
    memoPluginOptions?: Object;
    uiPluginOptions?: Object;
}

export interface PluginContextBase {
    setParameter<V>(name: string, value: V): void;
    parameter<V>(name: string): V | undefined;
}

export interface PluginContext extends PluginContextBase {
    /**
     * @deprecated
     */
    setArkTSProgram(program: Program): void

    /**
     * @deprecated
     */
    getArkTSProgram(): Program | undefined

    setCodingFilePath(codingFilePath: string): void

    getCodingFilePath(): string | undefined

    isCoding(): boolean

    getProjectConfig(): ProjectConfig | undefined 
}


export class PluginContextBaseImpl implements PluginContextBase {
    map = new Map<string, object | undefined>();

    parameter<V>(name: string): V | undefined {
        return this.map.get(name) as V | undefined;
    }
    setParameter<V>(name: string, value: V): void {
        this.map.set(name, value as object);
    }
}

// Temporary hack to use plugin context's parameters when compiling with driver
export function extendPluginContext(context: PluginContextImpl) {
    if (typeof context.setParameter == "function") {
        return
    }
    const pluginContextBaseImpl = new PluginContextBaseImpl()
    context.map = pluginContextBaseImpl.map
    context.setParameter = pluginContextBaseImpl.setParameter
    context.parameter = pluginContextBaseImpl.parameter
}

export class PluginContextImpl extends PluginContextBaseImpl implements PluginContext {
    private ast: ETSModule | undefined;
    private projectConfig: ProjectConfig | undefined;

    private program: Program | undefined;
    private codingFilePath: string | undefined;

    setContextPtr(ptr: KNativePointer): void {
        if (!global.compilerContext) {
            global.compilerContext = new Context(ptr);
        } else {
            global.compilerContext.peer = ptr;
        }
    }

    getContextPtr(): KNativePointer {
        return global.compilerContext?.peer ?? nullptr;
    }

    public setProjectConfig(projectConfig: ProjectConfig): void {
        this.projectConfig = projectConfig;
    }

    public getProjectConfig(): ProjectConfig | undefined {
        return this.projectConfig;
    }
    /**
     * @deprecated
     */
    public setArkTSAst(ast: ETSModule): void {
        this.ast = ast;
    }

    /**
     * @deprecated
     */
    public getArkTSAst(): ETSModule | undefined {
        return this.ast;
    }

    /**
     * @deprecated
     */
    public setArkTSProgram(program: Program): void {
        this.program = program;
    }

    /**ProjectConfig
     * @deprecated
     */
    public getArkTSProgram(): Program | undefined {
        return this.program;
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

export type PluginHandlerFunction = () => void;

export type PluginHandlerObject = {
    order: 'pre' | 'post' | undefined;
    handler: PluginHandlerFunction;
};

export type PluginHandler = PluginHandlerFunction | PluginHandlerObject;

export type ProgramTransformer = (
    program: Program,
    compilationOptions: CompilationOptions,
    context: PluginContext
) => void;

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


export function defaultFilter(name: string): boolean {
    if (name.startsWith('std.')) return false;
    if (name.startsWith('escompat')) return false;
    return true;
}

export function listPrograms(program: Program, filter: (name: string) => boolean = defaultFilter): readonly Program[] {
    return [
        program,
        ...program.getExternalSources().flatMap((it: ExternalSource): readonly Program[] => {
            if (filter(it.getName())) {
                return it.programs;
            }
            return [];
        }),
    ];
}
