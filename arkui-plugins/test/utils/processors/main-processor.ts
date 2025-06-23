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

import EventEmitter from 'events';
import {
    BuildConfig,
    CompileFileInfo,
    CompileStrategy,
    JobInfo,
    PluginTestContext,
    ProcessEvent,
    TraceOptions,
} from '../shared-types';
import { BaseProcessor } from './base-processor';
import { PluginTestContextCache } from '../cache';
import { concatObject, serializable } from '../serializable';
import { Plugins, PluginState, ProjectConfig } from '../../../common/plugin-context';
import { createGlobalConfig, destroyGlobalConfig } from '../global';
import { compileAbcWithExternal } from '../compile';

class MainProcessor extends BaseProcessor {
    filePaths: string[];

    readonly emitter: EventEmitter<ProcessEvent> = new EventEmitter<ProcessEvent>();

    constructor(hashId: string, buildConfig?: BuildConfig, projectConfig?: ProjectConfig, tracing?: TraceOptions) {
        super(hashId, buildConfig, projectConfig, tracing);
        this.filePaths = this.getCompileFilePaths();
    }

    private getCompileFilePaths(): string[] {
        return Array.from(this.compileFiles.values()).map((fileInfo) => fileInfo.filePath);
    }

    private subscribe(): void {
        this.emitter.on('TASK_COLLECT', (msg) => {
            const sourceType = 'abc';
            const pluginStateId = msg.pluginStateId;
            const fileName = msg.fileName;
            const pluginTestContext = msg.pluginTestContext as PluginTestContext;
            const key = `${this.hashId}:${sourceType}:${pluginStateId}:${fileName}`;
            let currentPluginTestContext;
            if (PluginTestContextCache.getInstance().has(key)) {
                const oldContext = PluginTestContextCache.getInstance().get(key)!;
                currentPluginTestContext = concatObject(oldContext, pluginTestContext);
            } else {
                currentPluginTestContext = pluginTestContext;
            }
            PluginTestContextCache.getInstance().set(key, currentPluginTestContext);
        });
    }

    private assignTask(fileInfo: CompileFileInfo, plugins: Plugins[], stopAfter?: PluginState): void {
        const jobInfo: JobInfo = {
            id: 'compile-abc-with-external',
            isCompileAbc: CompileStrategy.ABC_WTIH_EXTERNAL,
            compileFileInfo: fileInfo,
            buildConfig: serializable(this.buildConfig),
            projectConfig: serializable(this.projectConfig),
            plugins,
            stopAfter,
            filePaths: this.filePaths,
        };
        compileAbcWithExternal(this.emitter, jobInfo, this.tracing);
    }

    async invokeWorkers(plugins: Plugins[], stopAfter?: PluginState): Promise<void> {
        return new Promise<void>((resolve) => {
            const fileInfo: CompileFileInfo = this.compileFiles.values().next().value!;
            const config = createGlobalConfig(fileInfo, true, false);
            this.subscribe();
            this.emitter.on('TASK_FINISH', (msg) => {
                console.log('All tasks completed. Exiting...');
                destroyGlobalConfig(config, false);
                resolve();
            });
            this.assignTask(fileInfo, plugins, stopAfter);
        });
    }

    clear(): void {}
}

export { MainProcessor };
