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

import * as arkts from '@koalaui/libarkts';
import EventEmitter from 'events';
import type { JobInfo, PluginTestContext, ProcessEvent, SingleProgramContext, TraceOptions } from './shared-types';
import { MockPluginDriver, stateName } from './plugin-driver';
import { createCacheContextFromFile, destroyContext, resetConfig } from './global';
import { PluginDriver } from './plugin-driver';
import { PluginState, PluginContext, PluginExecutor } from '../../common/plugin-context';

function insertPlugin(driver: PluginDriver, plugin: PluginExecutor | undefined): boolean {
    const pluginContext: PluginContext = driver.getPluginContext();
    if (plugin) {
        plugin.handler.apply(pluginContext);
    }
    return true;
}

function collectPluginTestContext(
    context: arkts.Context,
    isExternal: boolean,
    tracing: TraceOptions
): PluginTestContext {
    const pluginTestContext: PluginTestContext = {};
    try {
        const program: arkts.Program = arkts.getOrUpdateGlobalContext(context.peer).program;
        // TODO: add error/warning handling after plugin
        if (!isExternal) {
            const script: arkts.EtsScript = program.astNode;
            pluginTestContext.scriptSnapshot = script.dumpSrc();
        } else {
            const declContexts: Record<string, SingleProgramContext> = {};
            const externalSources: arkts.ExternalSource[] = program.externalSources;
            externalSources
                .filter((source) => {
                    const sourceProgram: arkts.Program = source.programs[0];
                    return (
                        tracing.externalSourceNames.includes(source.getName()) &&
                        sourceProgram &&
                        sourceProgram.isASTLowered()
                    );
                })
                .forEach((source) => {
                    const sourceProgram: arkts.Program = source.programs[0];
                    const sourceTestContext: SingleProgramContext = {};
                    const name: string = source.getName();
                    const script: arkts.EtsScript = sourceProgram.astNode;
                    const scriptSnapshot = script.dumpSrc();
                    sourceTestContext.scriptSnapshot = scriptSnapshot;
                    declContexts[name] = sourceTestContext;
                });
            pluginTestContext.declContexts = declContexts;
        }
    } catch (e) {
        // Do nothing
    } finally {
        return pluginTestContext;
    }
}

/**
 * @param emitter event emitter.
 * @param jobInfo job info.
 * @param state the current state.
 * @param context context for the single file.
 * @param isExternal boolean indicates if plugin is compiling external sources.
 * @param stopAfter state that should stop after running plugins.
 * @returns boolean indicates whether should proceed to the next state.
 */
function runPluginsAtState(
    emitter: EventEmitter<ProcessEvent>,
    jobInfo: JobInfo,
    state: arkts.Es2pandaContextState,
    context: arkts.Context,
    isExternal: boolean,
    tracing: TraceOptions,
    stopAfter?: PluginState
): boolean {
    const stateStr = stateName(state);
    const plugins = MockPluginDriver.getInstance().getSortedPlugins(state);
    const fileName = jobInfo.compileFileInfo!.fileName;
    if (plugins && plugins.length > 0) {
        plugins.forEach((plugin) => {
            insertPlugin(MockPluginDriver.getInstance(), plugin);
            const pluginName: string = plugin.name;
            const pluginStateId: `${PluginState}:${string}` = `${stateStr}:${pluginName}`;
            const pluginTestContext = collectPluginTestContext(context, isExternal, tracing);
            emitter.emit('TASK_COLLECT', {
                jobId: jobInfo.id,
                pluginStateId,
                pluginTestContext: pluginTestContext,
                fileName,
            });
        });
    }
    const pluginStateId: PluginState = `${stateStr}`;
    const pluginTestContext = collectPluginTestContext(context, isExternal, tracing);
    emitter.emit('TASK_COLLECT', {
        jobId: jobInfo.id,
        pluginStateId,
        pluginTestContext: pluginTestContext,
        fileName,
    });
    return !!stopAfter && stopAfter === stateStr;
}

function createContextForAbcCompilation(jobInfo: JobInfo): arkts.Context {
    const fileInfo = jobInfo.compileFileInfo!;
    const globalContextPtr = jobInfo.globalContextPtr!;
    const ets2pandaCmd = [
        '_',
        '--extension',
        'ets',
        '--arktsconfig',
        fileInfo.arktsConfigFile,
        '--output',
        fileInfo.abcFilePath,
    ];
    ets2pandaCmd.push(fileInfo.filePath);
    const config = resetConfig(ets2pandaCmd);
    const context = createCacheContextFromFile(config, fileInfo.filePath, globalContextPtr, false);
    return context;
}

function createContextForExternalCompilation(jobInfo: JobInfo): arkts.Context {
    const fileInfo = jobInfo.compileFileInfo!;
    const globalContextPtr = jobInfo.globalContextPtr!;
    const ets2pandaCmd = ['-', '--extension', 'ets', '--arktsconfig', fileInfo.arktsConfigFile];
    ets2pandaCmd.push(fileInfo.filePath);
    const config = resetConfig(ets2pandaCmd);
    const context = createCacheContextFromFile(config, fileInfo.filePath, globalContextPtr, true);
    return context;
}

function compileAbc(emitter: EventEmitter<ProcessEvent>, jobInfo: JobInfo, tracing: TraceOptions): void {
    MockPluginDriver.getInstance().initPlugins(jobInfo.plugins ?? []);
    const context = createContextForAbcCompilation(jobInfo);
    MockPluginDriver.getInstance().getPluginContext().setContextPtr(context.peer);
    const stopAfter = jobInfo.stopAfter!;
    let shouldStop = false;
    arkts.proceedToState(arkts.Es2pandaContextState.ES2PANDA_STATE_PARSED, context.peer);
    shouldStop = runPluginsAtState(
        emitter,
        jobInfo,
        arkts.Es2pandaContextState.ES2PANDA_STATE_PARSED,
        context,
        false,
        tracing,
        stopAfter
    );
    if (shouldStop) {
        destroyContext(context);
        MockPluginDriver.getInstance().clear();
        return;
    }
    arkts.proceedToState(arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED, context.peer);
    shouldStop = runPluginsAtState(
        emitter,
        jobInfo,
        arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED,
        context,
        false,
        tracing,
        stopAfter
    );
    if (shouldStop) {
        destroyContext(context);
        MockPluginDriver.getInstance().clear();
        return;
    }
    arkts.proceedToState(arkts.Es2pandaContextState.ES2PANDA_STATE_BIN_GENERATED, context.peer);
    destroyContext(context);
    MockPluginDriver.getInstance().clear();
}

function compileExternalProgram(emitter: EventEmitter<ProcessEvent>, jobInfo: JobInfo, tracing: TraceOptions): void {
    MockPluginDriver.getInstance().initPlugins(jobInfo.plugins ?? []);
    const context = createContextForExternalCompilation(jobInfo);
    MockPluginDriver.getInstance().getPluginContext().setContextPtr(context.peer);
    arkts.proceedToState(arkts.Es2pandaContextState.ES2PANDA_STATE_PARSED, context.peer);
    runPluginsAtState(emitter, jobInfo, arkts.Es2pandaContextState.ES2PANDA_STATE_PARSED, context, true, tracing);
    arkts.proceedToState(arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED, context.peer);
    runPluginsAtState(emitter, jobInfo, arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED, context, true, tracing);
    arkts.proceedToState(arkts.Es2pandaContextState.ES2PANDA_STATE_LOWERED, context.peer);
    destroyContext(context);
    MockPluginDriver.getInstance().clear();
}

export { compileAbc, compileExternalProgram };
