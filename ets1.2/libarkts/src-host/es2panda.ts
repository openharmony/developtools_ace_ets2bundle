/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
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

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
    resolveSDK,
    checkSDK,
    arktsGlobal as global,
    findStdlib,
    listPrograms,
    initVisitsTable,
    PluginContextImpl,
} from '@koalaui/libarkts';
import { Plugins } from '@koalaui/libarkts';
import { Command } from 'commander';
import { Es2pandaContextState } from '@koalaui/libarkts';
import { Tracer, traceGlobal, Options, Config, Context, proceedToState, dumpArkTsConfigInfo, Performance } from '@koalaui/libarkts';

interface CommandLineOptions {
    files: string[];
    configPath: string;
    outputs: string[];
    dumpAst: boolean;
    simultaneous: boolean;
    profileMemory: boolean;
    trace: boolean;
    joint: boolean;
}

function readResponseFile(arg: string | undefined): string | undefined {
    if (!arg) {
        return undefined;
    }
    if (!arg.startsWith('@')) {
        return arg;
    }
    return fs.readFileSync(arg.slice(1), 'utf-8');
}

function parseCommandLineArgs(): CommandLineOptions {
    const commander = new Command()
        .argument('[file]', 'Path to files to be compiled')
        .option('--file, <char>', 'Path to file to be compiled (deprecated)')
        .option('--arktsconfig, <char>', 'Path to arkts configuration file')
        .option('--ets-module', 'Do nothing, legacy compatibility')
        .option('--output, <char>', 'The name of result file')
        .option('--dump-plugin-ast', 'Dump ast before and after each plugin')
        .option('--simultaneous', 'Use "simultaneous" mode of compilation')
        .option('--joint', 'Use "plugins_joint" section instead of "plugins"')
        .option('--profile-memory', 'Profile memory usage')
        .option('--trace', 'Trace plugin compilation')
        .parse(process.argv);

    const cliOptions = commander.opts();
    const cliArgs = commander.args;
    const fileArg = readResponseFile(cliOptions.file ?? cliArgs[0]);
    if (!fileArg) {
        reportErrorAndExit(`Either --file option or file argument is required`);
    }
    const files = fileArg
        .split(/[ :]/g)
        .map((it) => (it.startsWith("'") ? it.slice(1, -1) : it))
        .map((it: string) => path.resolve(it));
    const configPath = path.resolve(cliOptions.arktsconfig);
    const outputArg = cliOptions.output;
    const outputs = outputArg.split(':').map((it: string) => path.resolve(it));
    files.forEach((it: string) => {
        if (!fs.existsSync(it)) {
            reportErrorAndExit(`File path doesn't exist: ${it}`);
        }
    });
    if (!fs.existsSync(configPath)) {
        reportErrorAndExit(`Arktsconfig path doesn't exist: ${configPath}`);
    }

    const dumpAst = cliOptions.dumpPluginAst ?? false;
    const simultaneous = cliOptions.simultaneous ?? false;
    const profileMemory = cliOptions.profileMemory ?? false;
    const trace = cliOptions.trace ?? false;
    const joint = cliOptions.joint ?? false;

    return { files, configPath, outputs, dumpAst, simultaneous, profileMemory, trace, joint };
}

const pluginContext = new PluginContextImpl();

function insertPlugin(pluginEntry: Plugins, state: Es2pandaContextState) {
    const pluginName = `${pluginEntry.name}-${Es2pandaContextState[state].substring(`ES2PANDA_STATE_`.length).toLowerCase()}`;
    global.profiler.curPlugin = pluginName;
    global.profiler.curContextState = state;
    global.profiler.transformStarted();

    if (state === Es2pandaContextState.ES2PANDA_STATE_PARSED) {
        if (typeof pluginEntry.parsed == "function") {
            pluginEntry.parsed?.call(pluginContext);
        }
    }

    if (state === Es2pandaContextState.ES2PANDA_STATE_CHECKED) {
        if (typeof pluginEntry.checked == "function") {
            pluginEntry.checked?.call(pluginContext);
        }
    }

    global.profiler.transformEnded();
    global.profiler.curPlugin = '';
}

function format(value: number): string {
    return `${(value / 1024 / 1024 / 1024).toFixed(4)} GB`
}

// Improve: move to profiler
function dumpMemoryProfilerInfo(str: string) {
    console.log(str, format(process.memoryUsage().rss));
}

function dumpCompilationInfo(simultaneous: boolean) {
    traceGlobal(() => {
        const programs = listPrograms(global.compilerContext!.program);
        if (simultaneous) {
            const programsForCodegeneration = programs.filter((it) => it.isGenAbcForExternal);
            traceGlobal(() => `Programs for codegeneration        : ${programsForCodegeneration.length}`);
            traceGlobal(
                () => `External programs passed to plugins: ${programs.length - programsForCodegeneration.length - 1}`
            );
        } else {
            traceGlobal(() => `Programs for codegeneration        : 1`);
            traceGlobal(() => `External programs passed to plugins: ${programs.length - 1}`);
        }
    });
}

function createContextAdapter(filePaths: string[]): Context {
    return Context.createFromFile(filePaths[0]);
}

function invoke(
    configPath: string,
    filePaths: string[],
    outputPath: string,
    plugins: Map<string, Plugins>,
    profileMemory: boolean,
    trace: boolean,
    simultaneous: boolean,
    createContext: (fileNames: string[]) => Context
): void {
    const stdlib = findStdlib();
    const cmd = ['--arktsconfig', configPath, '--extension', 'ets', '--stdlib', stdlib, '--output', outputPath];
    if (simultaneous) {
        cmd.push('--simultaneous');
    }
    cmd.push(filePaths[0]);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    if (trace) {
        Tracer.startGlobalTracing(path.dirname(outputPath));
    }
    Tracer.pushContext('es2panda');

    initVisitsTable();

    const compilerConfig = Config.create(['_', ...cmd]);
    global.config = compilerConfig.peer;
    if (!global.configIsInitialized()) throw new Error(`Wrong config: path=${configPath}`);

    const compilerContext = createContext(filePaths);
    global.compilerContext = compilerContext;

    const options = Options.createOptions(new Config(global.config));
    global.arktsconfig = options.getArkTsConfig();
    dumpArkTsConfigInfo(global.arktsconfig);

    if (profileMemory) dumpMemoryProfilerInfo('Memory usage before proceed to parsed:');
    proceedToState(Es2pandaContextState.ES2PANDA_STATE_PARSED);
    if (profileMemory) dumpMemoryProfilerInfo('Memory usage after proceed to parsed:');

    plugins.forEach((plugin) => {
        if (profileMemory) dumpMemoryProfilerInfo(`Memory usage before ${plugin.name}-parsed:`);
        insertPlugin(plugin, Es2pandaContextState.ES2PANDA_STATE_PARSED);
        if (profileMemory) dumpMemoryProfilerInfo(`Memory usage after ${plugin.name}-parsed:`);
    });

    dumpCompilationInfo(simultaneous);

    if (profileMemory) dumpMemoryProfilerInfo('Memory usage before proceed to checked:');
    proceedToState(Es2pandaContextState.ES2PANDA_STATE_CHECKED);
    if (profileMemory) dumpMemoryProfilerInfo('Memory usage after proceed to checked:');

    plugins.forEach((plugin) => {
        if (profileMemory) dumpMemoryProfilerInfo(`Memory usage before ${plugin.name}-checked:`);
        insertPlugin(plugin, Es2pandaContextState.ES2PANDA_STATE_CHECKED);
        if (profileMemory) dumpMemoryProfilerInfo(`Memory usage after ${plugin.name}-checked:`);
    });

    if (profileMemory) dumpMemoryProfilerInfo('Memory usage before proceed to asm:');
    proceedToState(Es2pandaContextState.ES2PANDA_STATE_ASM_GENERATED);
    if (profileMemory) dumpMemoryProfilerInfo('Memory usage after proceed to asm:');

    if (profileMemory) dumpMemoryProfilerInfo('Memory usage before proceed to bin:');
    proceedToState(Es2pandaContextState.ES2PANDA_STATE_BIN_GENERATED);
    if (profileMemory) dumpMemoryProfilerInfo('Memory usage after proceed to bin:');

    global.profiler.compilationEnded();
    global.profiler.report();
    global.profiler.reportToFile(true);

    compilerContext.destroy();
    compilerConfig.destroy();

    Tracer.popContext();
    if (trace) {
        Tracer.stopGlobalTracing();
    }
}

function loadPlugin(configDir: string, transform: string) {
    const plugin =
        transform.startsWith('.') || transform.startsWith('/') ? path.resolve(configDir, transform) : transform;
    const pluginEntry = require(plugin);
    if (!pluginEntry.init) {
        throw new Error(`init is not specified in plugin ${transform}`);
    }
    if (typeof pluginEntry.init !== 'function') {
        throw new Error(`init is not a function in plugin ${transform}`);
    }
    return pluginEntry.init;
}

function loadPlugins(configDir: string, plugins: Object) {
    const result = new Map<string, Plugins>()
    for (const [name, transform] of Object.entries(plugins)) {
        result.set(name, loadPlugin(configDir, transform)())
    }
    return result
}

export function main() {
    resolveSDK();
    checkSDK();
    const performance = Performance.getInstance();
    performance.enableMemoryTracker(true);
    const { files, configPath, outputs, dumpAst, simultaneous, profileMemory, trace, joint } = parseCommandLineArgs();
    if (!simultaneous && files.length !== outputs.length) {
        reportErrorAndExit('Different length of inputs and outputs');
    }
    if (joint)
        console.log(`Use joint plugins`)
    else
        console.log(`Use NG plugins`)
    const arktsconfig = JSON.parse(fs.readFileSync(configPath).toString());
    const configDir = path.dirname(configPath);
    const plugins = (joint ? arktsconfig.plugins_joint : arktsconfig.plugins) ?? {};
    const loadedPlugins = loadPlugins(configDir, plugins);

    pluginContext.setProjectConfig({
        bundleName: 'bundle',
        moduleName: 'module',
        cachePath: './dist',
        dependentModuleList: [],
        appResource: '',
        rawFileResource: '',
        buildLoaderJson: '',
        hspResourcesMap: false,
        compileHar: false,
        byteCodeHar: false,
        uiTransformOptimization: false,
        resetBundleName: true,
        allowEmptyBundleName: true,
        moduleType: 'module',
        moduleRootPath: '.',
        aceModuleJsonPath: './module.json',
        ignoreError: false,
        projectPath: '.',
        projectRootPath: '.',
        integratedHsp: false,
        frameworkMode: arktsconfig.frameworkMode,
        isUi2abc: true,
        memoPluginOptions: arktsconfig.memoPluginOptions,
        uiPluginOptions: arktsconfig.uiPluginOptions
    });

    if (simultaneous) {
        invoke(
            configPath,
            files,
            outputs[0],
            loadedPlugins,
            profileMemory,
            trace,
            simultaneous,
            Context.createContextGenerateAbcForExternalSourceFiles
        );
    } else {
        for (var i = 0; i < files.length; i++) {
            invoke(
                configPath,
                [files[i]],
                outputs[i],
                loadedPlugins,
                profileMemory,
                trace,
                simultaneous,
                createContextAdapter
            );
        }
    }
    performance.memoryTrackerPrintCurrent('End of compilation')
}

function reportErrorAndExit(message: string): never {
    console.error(message);
    process.exit(1);
}

main();
