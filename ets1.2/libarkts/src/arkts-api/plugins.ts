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

import { Es2pandaContextState } from "../../generated/Es2pandaEnums"
import { ETSModule, Program } from "../../generated"
import { ExternalSource } from "./peers/ExternalSource"
import { KNativePointer, nullptr } from "@koalaui/interop"
import { global } from "./static/global"
import { RunTransformerHooks } from "../plugin-utils"

export interface CompilationOptions {
    readonly isProgramForCodegeneration: boolean,
    readonly state: Es2pandaContextState,
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
    projectPath: string,
    projectRootPath: string,
    integratedHsp: boolean
    frameworkMode?: string;
}


export interface PluginContext {
    setParameter<V>(name: string, value: V): void
    parameter<V>(name: string) : V | undefined
}

export class PluginContextImpl implements PluginContext {
    map = new Map<String, Object | undefined>()

    private ast: ETSModule | undefined = undefined
    private projectConfig: ProjectConfig | undefined  = undefined

    parameter<V>(name: string): V|undefined {
        return this.map.get(name) as (V|undefined)
    }
    setParameter<V>(name: string, value: V) {
        this.map.set(name, value as Object)
    }
    getContextPtr(): KNativePointer {
        return global.compilerContext?.peer ?? nullptr
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

}

export type ProgramTransformer = (program: Program, compilationOptions: CompilationOptions, context: PluginContext) => void

export function defaultFilter(name: string) {
    if (name.startsWith("std.")) return false
    if (name.startsWith("escompat")) return false
    return true
}

export function listPrograms(program: Program, filter: (name: string) => boolean = defaultFilter): Program[] {
    return [
        program,
        ...program.getExternalSources().flatMap((it: ExternalSource) => {
            if (filter(it.getName())) {
                return it.programs
            }
            return []
        })
    ]
}

export interface PluginEntry {
    name?: string
    parsed?: (hooks?: RunTransformerHooks) => void
    checked?: (hooks?: RunTransformerHooks) => void
    clean?: (hooks?: RunTransformerHooks) => void
}

export type PluginInitializer = (parsedJson?: Object, checkedJson?: Object) => PluginEntry
