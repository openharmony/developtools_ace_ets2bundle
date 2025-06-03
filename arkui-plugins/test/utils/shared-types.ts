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

import type { Plugins, PluginState } from '../../common/plugin-context';

export type PluginTesterId = string | `${string}:${string}`;

export type PluginStateId = PluginState | `${PluginState}:${PluginTesterId}`;

export interface SingleProgramContext {
    scriptSnapshot?: string;
    errors?: string[];
    warnings?: string[];
}

export interface PluginTestContext extends SingleProgramContext {
    declContexts?: Record<string, SingleProgramContext>;
    sourceContexts?: Record<string, SingleProgramContext>;
}

export interface ArkTSConfigContext {
    arktsConfigFile: string;
    compileFiles: Map<string, CompileFileInfo>;
}

export interface FileDependencyContext {
    depInputFile: string;
    fileDepsInfoJson: string;
}

export interface CompileFileInfo {
    fileName: string;
    filePath: string;
    dependentFiles: string[];
    abcFilePath: string;
    arktsConfigFile: string;
    stdLibPath: string;
}

export interface BuildConfig {
    packageName: string;
    compileFiles: string[];
    loaderOutPath: string;
    cachePath: string;
    pandaSdkPath: string;
    buildSdkPath: string;
    depAnalyzerPath: string;
    sourceRoots: string[];
    moduleRootPath: string;
    dependentModuleList: DependentModule[];
}

export type ModuleType = 'har' | string; // TODO: module type unclear

export interface DependentModule {
    packageName: string;
    moduleName: string;
    moduleType: ModuleType;
    modulePath: string;
    sourceRoots: string[];
    entryFile: string;
}

export interface JobInfo {
    id: string;
    isCompileAbc: boolean; // TODO: change to enum
    compileFileInfo?: CompileFileInfo;
    buildConfig?: BuildConfig;
    plugins?: Plugins[];
    globalContextPtr?: number;
    stopAfter?: PluginState;
}

export interface TraceOptions {
    externalSourceNames: string[];
}

export interface ProcessTaskFinishEvent {
    type: 'TASK_FINISH';
    jobId: string;
}

export interface ProcessExitEvent {
    type: 'EXIT';
}

export interface ProcessAssignTaskEvent {
    type: 'ASSIGN_TASK';
    jobInfo: JobInfo;
}

export interface ProcessTaskCollectEvent {
    type: 'TASK_COLLECT';
    jobId: string;
    pluginStateId: PluginStateId;
    pluginTestContext: PluginTestContext;
    fileName: string;
}

export type ProcessEvents =
    | ProcessAssignTaskEvent
    | ProcessTaskFinishEvent
    | ProcessTaskCollectEvent
    | ProcessExitEvent;

export type ProcessEvent = {
    [E in ProcessEvents as E['type']]: Omit<E, 'type'>[];
};
