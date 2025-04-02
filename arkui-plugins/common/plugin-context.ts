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

import * as arkts from "@koalaui/libarkts"

// TODO: move this to arkts-api
export class PluginContext {
    private ast: arkts.EtsScript | undefined;
    private program: arkts.Program | undefined;
    private projectConfig: ProjectConfig | undefined;
  
    constructor() {
        this.ast = undefined;
        this.program = undefined;
        this.projectConfig = undefined;
    }
  
    public setArkTSAst(ast: arkts.EtsScript): void {
        this.ast = ast;
    }
  
    public getArkTSAst(): arkts.EtsScript | undefined {
        return this.ast;
    }
  
    public setArkTSProgram(program: arkts.Program): void {
        this.program = program;
    }
  
    public getArkTSProgram(): arkts.Program | undefined {
        return this.program;
    }

    public setProjectConfig(projectConfig: ProjectConfig): void {
        throw new Error("do not set projectConfig!");
    }

    public getProjectConfig(): ProjectConfig | undefined {
         return this.projectConfig;
    }
}

export interface ProjectConfig {
    bundleName: string,
    moduleName: string
}

export type PluginHandlerFunction = () => void;

export type PluginHandlerObject = {
  order: 'pre' | 'post' | undefined
  handler: PluginHandlerFunction
};

export type PluginHandler = PluginHandlerFunction | PluginHandlerObject;

export interface Plugins {
    name: string;
    afterNew?: PluginHandler,
    parsed?: PluginHandler,
    scopeInited?: PluginHandler,
    checked?: PluginHandler,
    lowered?: PluginHandler,
    asmGenerated?: PluginHandler,
    binGenerated?: PluginHandler,
    clean?: PluginHandler,
};

export type PluginState = keyof Omit<Plugins, "name">;

export type PluginExecutor = {
    name: string
    handler: PluginHandlerFunction
};
