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
import {
    CompileStrategy,
    JobInfo,
    PluginTestContext,
    ProcessEvent,
    SingleProgramContext,
    TraceOptions,
} from './shared-types';
import { MockPluginDriver, stateName } from './plugin-driver';
import {
    createContextGenerateAbcForExternalSourceFiles,
    createCacheContextFromFile,
    destroyContext,
    resetConfig,
} from './global';
import { PluginDriver } from './plugin-driver';
import { PluginState, PluginContext, PluginExecutor } from '../../common/plugin-context';
import { concatObject } from './serializable';

function insertPlugin(driver: PluginDriver, plugin: PluginExecutor | undefined): boolean {
    const pluginContext: PluginContext = driver.getPluginContext();
    if (plugin) {
        plugin.handler.apply(pluginContext);
    }
    return true;
}

function collectPluginTextContextFromSourceProgram(program: arkts.Program, tracing: TraceOptions): PluginTestContext {
    const pluginTestContext: PluginTestContext = {};
    const script: arkts.EtsScript = program.astNode;
    pluginTestContext.scriptSnapshot = script.dumpSrc();
    return pluginTestContext;
}

function collectPluginTextContextFromExternalSource(
    externalSources: arkts.ExternalSource[],
    tracing: TraceOptions,
    matchSourceName: (name: string) => boolean,
    useCache?: boolean
) {
    let pluginTestContext: PluginTestContext = {};
    const filteredExternalSourceNames: string[] = [...tracing.externalSourceNames];
    const filteredExternalSources = externalSources.filter((source) => {
        const name = source.getName();
        const sourceProgram: arkts.Program = source.programs[0];
        const shouldCollectByName = filteredExternalSourceNames.includes(name) || matchSourceName(name);
        const shouldCollectByProgram = sourceProgram && (!useCache || sourceProgram.isASTLowered());
        return shouldCollectByName && shouldCollectByProgram;
    });
    const declContexts: Record<string, SingleProgramContext> = {};
    filteredExternalSources.forEach((source) => {
        const name: string = source.getName();
        const sourceProgram: arkts.Program = source.programs[0];
        if (matchSourceName(name)) {
            pluginTestContext = concatObject(
                pluginTestContext,
                collectPluginTextContextFromSourceProgram(sourceProgram, tracing)
            );
        } else {
            const sourceTestContext: SingleProgramContext = {};
            const script: arkts.EtsScript = sourceProgram.astNode;
            const scriptSnapshot = script.dumpSrc();
            sourceTestContext.scriptSnapshot = scriptSnapshot;
            declContexts[name] = sourceTestContext;
        }
    });
    pluginTestContext.declContexts = declContexts;
    return pluginTestContext;
}

function collectPluginTestContext(
    context: arkts.Context,
    compileStrategy: CompileStrategy,
    tracing: TraceOptions,
    matchSourceName: (name: string) => boolean
): PluginTestContext {
    const useCache: boolean = compileStrategy !== CompileStrategy.ABC_WTIH_EXTERNAL;
    const canCollectSource: boolean = !useCache || compileStrategy === CompileStrategy.ABC;
    const canCollectExternal: boolean = !useCache || compileStrategy === CompileStrategy.EXTERNAL;
    let pluginTestContext: PluginTestContext = {};
    try {
        const program: arkts.Program = arkts.getOrUpdateGlobalContext(context.peer).program;
        // TODO: add error/warning handling after plugin
        if (canCollectSource) {
            pluginTestContext = concatObject(
                pluginTestContext,
                collectPluginTextContextFromSourceProgram(program, tracing)
            );
        }
        if (canCollectExternal) {
            const externalSources: arkts.ExternalSource[] = program.externalSources;
            pluginTestContext = concatObject(
                pluginTestContext,
                collectPluginTextContextFromExternalSource(externalSources, tracing, matchSourceName, useCache)
            );
        }
    } catch (e) {
        // Do nothing
    } finally {
        return pluginTestContext;
    }
}

function buildMatchNameFunc(prefix: string, suffix: string): (name: string) => boolean {
    return (name: string): boolean => {
        return name.startsWith(`${prefix}.`) && name.endsWith(`.${suffix}`);
    };
}

/**
 * @param emitter event emitter.
 * @param jobInfo job info.
 * @param state the current state.
 * @param context context for the single file.
 * @param stopAfter state that should stop after running plugins.
 * @returns boolean indicates whether should proceed to the next state.
 */
function runPluginsAtState(
    emitter: EventEmitter<ProcessEvent>,
    jobInfo: JobInfo,
    state: arkts.Es2pandaContextState,
    context: arkts.Context,
    tracing: TraceOptions,
    stopAfter?: PluginState
): boolean {
    const stateStr = stateName(state);
    const plugins = MockPluginDriver.getInstance().getSortedPlugins(state);
    const packageName = jobInfo.buildConfig!.packageName;
    const fileName = jobInfo.compileFileInfo!.fileName;
    const matchSourceName = buildMatchNameFunc(packageName, fileName);
    const compileStrategy = jobInfo.isCompileAbc;
    if (plugins && plugins.length > 0) {
        plugins.forEach((plugin) => {
            insertPlugin(MockPluginDriver.getInstance(), plugin);
            const pluginName: string = plugin.name;
            const pluginStateId: `${PluginState}:${string}` = `${stateStr}:${pluginName}`;
            const pluginTestContext = collectPluginTestContext(context, compileStrategy, tracing, matchSourceName);
            emitter.emit('TASK_COLLECT', {
                jobId: jobInfo.id,
                pluginStateId,
                pluginTestContext: pluginTestContext,
                fileName,
            });
        });
    }
    const pluginStateId: PluginState = `${stateStr}`;
    const pluginTestContext = collectPluginTestContext(context, compileStrategy, tracing, matchSourceName);
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

function compileAbcWithExternal(emitter: EventEmitter<ProcessEvent>, jobInfo: JobInfo, tracing: TraceOptions): void {
    MockPluginDriver.getInstance().initPlugins(jobInfo.plugins ?? []);
    MockPluginDriver.getInstance().getPluginContext().setProjectConfig(jobInfo.projectConfig!);
    const context = createContextGenerateAbcForExternalSourceFiles(jobInfo.filePaths!);
    MockPluginDriver.getInstance().getPluginContext().setContextPtr(context.peer);
    const stopAfter = jobInfo.stopAfter!;
    let shouldStop = false;
    arkts.proceedToState(arkts.Es2pandaContextState.ES2PANDA_STATE_PARSED, context.peer);
    shouldStop = runPluginsAtState(
        emitter,
        jobInfo,
        arkts.Es2pandaContextState.ES2PANDA_STATE_PARSED,
        context,
        tracing,
        stopAfter
    );
    if (shouldStop) {
        destroyContext(context);
        MockPluginDriver.getInstance().clear();
        emitter.emit('TASK_FINISH', { jobId: 'compile-abc-with-external' });
        return;
    }
    arkts.proceedToState(arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED, context.peer);
    shouldStop = runPluginsAtState(
        emitter,
        jobInfo,
        arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED,
        context,
        tracing,
        stopAfter
    );
    if (shouldStop) {
        destroyContext(context);
        MockPluginDriver.getInstance().clear();
        emitter.emit('TASK_FINISH', { jobId: 'compile-abc-with-external' });
        return;
    }
    arkts.proceedToState(arkts.Es2pandaContextState.ES2PANDA_STATE_BIN_GENERATED, context.peer);
    destroyContext(context);
    MockPluginDriver.getInstance().clear();
    emitter.emit('TASK_FINISH', { jobId: 'compile-abc-with-external' });
}

function compileAbc(emitter: EventEmitter<ProcessEvent>, jobInfo: JobInfo, tracing: TraceOptions): void {
    MockPluginDriver.getInstance().initPlugins(jobInfo.plugins ?? []);
    MockPluginDriver.getInstance().getPluginContext().setProjectConfig(jobInfo.projectConfig!);
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
    MockPluginDriver.getInstance().getPluginContext().setProjectConfig(jobInfo.projectConfig!);
    const context = createContextForExternalCompilation(jobInfo);
    MockPluginDriver.getInstance().getPluginContext().setContextPtr(context.peer);
    arkts.proceedToState(arkts.Es2pandaContextState.ES2PANDA_STATE_PARSED, context.peer);
    runPluginsAtState(emitter, jobInfo, arkts.Es2pandaContextState.ES2PANDA_STATE_PARSED, context, tracing);
    arkts.proceedToState(arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED, context.peer);
    runPluginsAtState(emitter, jobInfo, arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED, context, tracing);
    arkts.proceedToState(arkts.Es2pandaContextState.ES2PANDA_STATE_LOWERED, context.peer);
    destroyContext(context);
    MockPluginDriver.getInstance().clear();
}

export { compileAbcWithExternal, compileAbc, compileExternalProgram };
