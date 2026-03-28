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

import * as fs from "node:fs";
import * as path from "node:path";
import {
    Es2pandaContextState,
    PluginContext,
    ImportStorage,
    arktsGlobal,
    ProgramTransformer,
    Program,
    ProgramProvider,
    CompilationOptions,
    PluginContextImpl,
    Es2pandaCompilationMode,
} from './arkts-api';
import { Tracer } from './tracer';
import { global } from "./arkts-api/static/global";

export interface RunTransformerHooks {
    onProgramTransformStart?(options: CompilationOptions, program: Program): void;
    onProgramTransformEnd?(options: CompilationOptions, program: Program): void;
}

export class ProfilerHooks implements RunTransformerHooks {
    constructor() {
    }
    onProgramTransformStart(options: CompilationOptions, program: Program) {
        if (!options.isProgramForCodegeneration) arktsGlobal.profiler.transformDepStarted();
    }
    onProgramTransformEnd(options: CompilationOptions, program: Program) {
        if (!options.isProgramForCodegeneration) arktsGlobal.profiler.transformDepEnded();
    }
}

export function runTransformerOnProgram(
    program: Program,
    options: CompilationOptions,
    transform: ProgramTransformer | undefined,
    pluginContext: PluginContext,
    hooks: RunTransformerHooks,
    stableDeps: boolean,
) {
    arktsGlobal.filePath = program.absoluteName;

    Tracer.startProgramTracing(program);

    // Perform some additional actions before the transformation start
    hooks.onProgramTransformStart?.(options, program);

    if (stableDeps) {
        // Run the plugin itself
        transform?.(program, options, pluginContext);
    } else {
        // Save currently existing imports in the program
        const importStorage = new ImportStorage(program, options.state === Es2pandaContextState.ES2PANDA_STATE_PARSED);

        // Run the plugin itself
        transform?.(program, options, pluginContext);

        // Update internal import information based on import modification by plugin
        importStorage.update();
    }

    // Perform some additional actions after the transformation end
    hooks.onProgramTransformEnd?.(options, program);

    Tracer.stopProgramTracing();
}

export function runTransformer(
    prog: Program,
    state: Es2pandaContextState,
    transform: ProgramTransformer | undefined,
    pluginContext: PluginContext,
    stableDeps: boolean = false,
) {
    const hooks = new ProfilerHooks()

    // Program provider used to provide programs to transformer dynamically relative to inserted imports
    const provider = new ProgramProvider(prog, stableDeps);

    // The first program provided by program provider is the main program
    let currentProgram = provider.next();
    let isMainProgram = true;

    while (currentProgram) {
        // Options passed to plugin and hooks
        const options: CompilationOptions = {
            isProgramForCodegeneration: isProgramForCodegeneration(currentProgram, isMainProgram),
            state,
        };

        runTransformerOnProgram(currentProgram, options, transform, pluginContext, hooks, stableDeps);

        // The first program is always the main program
        isMainProgram = false;

        // Proceed to the next program
        currentProgram = provider.next();
    }
}

function isProgramForCodegeneration(program: Program, isMainProgram: boolean): boolean {
    if (arktsGlobal.configObj?.compilationMode != Es2pandaCompilationMode.COMPILATION_MODE_SIMULTANEOUS) {
        return isMainProgram;
    }
    return program.isBuiltSimultaneously;
}

const isDebugDump: boolean = false;

function checkDebugDump() {
    return isDebugDump || process.env.KOALA_DUMP_PLUGIN_AST == "1";
}

export function debugDump(
    dumpDir: string | undefined,
    state: Es2pandaContextState,
    pluginName: string,
    isAfter: boolean,
    program: Program,
) {
    if (!checkDebugDump()) {
        return;
    }
    if (!dumpDir) {
        const outDir = global.arktsconfig?.outDir
        if (outDir) {
            dumpDir = path.join(outDir, "../dist/cache")
        } else {
            dumpDir = "dist/cache"
        }
    }
    const baseDir = path.join(dumpDir,
        `${state}_${isAfter ? "" : "ORI"}_${pluginName}`
    );
    runTransformer(
        program,
        state,
        (program: Program) => {
            if (program.absoluteName == "") {
                return
            }
            const dumpFilePath = path.join(baseDir, path.sep + program.absoluteName)
            fs.mkdirSync(path.dirname(dumpFilePath), { recursive: true })
            fs.writeFileSync(
                dumpFilePath,
                program.ast.dumpSrc(),
                'utf-8',
            )
        },
        new PluginContextImpl(),
        true,
    )
}
