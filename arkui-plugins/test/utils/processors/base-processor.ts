/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Plugins, PluginState, ProjectConfig } from '../../../common/plugin-context';
import { mockBuildConfig, mockProjectConfig } from '../artkts-config';
import { ArkTSConfigContextCache } from '../cache';
import { BuildConfig, CompileFileInfo, Processor, TraceOptions } from '../shared-types';

abstract class BaseProcessor implements Processor {
    hashId: string;
    buildConfig: BuildConfig;
    projectConfig: ProjectConfig;
    tracing: TraceOptions;
    cacheDir: string;
    arktsConfigFile: string;
    compileFiles: Map<string, CompileFileInfo>;

    constructor(hashId: string, buildConfig?: BuildConfig, projectConfig?: ProjectConfig, tracing?: TraceOptions) {
        this.hashId = hashId;
        this.tracing = tracing ?? { externalSourceNames: [] };

        const _buildConfig: BuildConfig = buildConfig ?? mockBuildConfig();
        this.buildConfig = _buildConfig;
        this.cacheDir = _buildConfig.cachePath;
        this.arktsConfigFile = this.getArktsConfigFile();
        this.compileFiles = this.getCompileFiles();

        const _projectConfig: ProjectConfig = projectConfig ?? mockProjectConfig();
        this.projectConfig = _projectConfig;
    }

    private getArktsConfigFile(): string {
        const arktsConfigFile = ArkTSConfigContextCache.getInstance().get(this.hashId)?.arktsConfigFile;
        if (!arktsConfigFile) {
            const err = `[${this.hashId}] TaskProcessor cannot get arktsConfigFile`;
            console.error(err);
            throw new Error(err);
        }
        return arktsConfigFile;
    }

    private getCompileFiles(): Map<string, CompileFileInfo> {
        const compileFiles = ArkTSConfigContextCache.getInstance().get(this.hashId)?.compileFiles;
        if (!compileFiles) {
            const err = `[${this.hashId}] TaskProcessor cannot get compileFiles`;
            console.error(err);
            throw new Error(err);
        }
        return compileFiles;
    }

    abstract invokeWorkers(plugins: Plugins[], stopAfter?: PluginState): Promise<void>;

    abstract clear(): void;
}

export { BaseProcessor };
