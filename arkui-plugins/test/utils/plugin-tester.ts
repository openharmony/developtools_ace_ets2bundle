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

import { ArktsConfigBuilder, BuildConfig, CompileFileInfo, MockArktsConfigBuilder, ModuleInfo } from './artkts-config';
import { MockPluginDriver, PluginDriver, stateName } from './plugin-driver';
import { isNumber } from './safe-types';
import { canProceedToState, initGlobal } from './global';
import { insertPlugin, restartCompilerUptoState } from './compile';
import { PluginExecutor, Plugins, PluginState } from '../../common/plugin-context';
import * as arkts from '@koalaui/libarkts';

type TestParams = Parameters<typeof test>;

type SkipFirstParam<T extends unknown[]> = T extends [unknown, ...infer Rest] ? Rest : never;

type PluginTestHooks = {
    [K in PluginState | `${PluginState}:${string}`]?: SkipFirstParam<TestParams>;
};

type TestHooks = {
    beforeAll?: Parameters<jest.Lifecycle>;
    afterAll?: Parameters<jest.Lifecycle>;
    beforeEach?: Parameters<jest.Lifecycle>;
    afterEach?: Parameters<jest.Lifecycle>;
};

export interface PluginTestContext {
    script?: arkts.AstNode;
    errors?: string[];
    warnings?: string[];
}

export interface PluginTesterOptions {
    stopAfter: PluginState;
    buildConfig?: BuildConfig;
}

class PluginTester {
    private configBuilder: ArktsConfigBuilder;
    private pluginDriver: PluginDriver;
    private describe: string;
    private cache?: PluginTestContext;

    constructor(describe: string, buildConfig?: BuildConfig) {
        this.describe = describe;
        this.configBuilder = new MockArktsConfigBuilder(buildConfig);
        this.pluginDriver = new MockPluginDriver();
    }

    private loadPluginDriver(plugins: Plugins[]): void {
        this.pluginDriver.initPlugins(plugins);
    }

    private test(
        key: PluginState | `${PluginState}:${string}`,
        index: arkts.Es2pandaContextState,
        testName: string,
        pluginHooks: PluginTestHooks,
        plugin?: PluginExecutor
    ): void {
        if (!this.cache) {
            this.cache = {};
        }
        if (index > arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED) {
            return;
        }
        if (canProceedToState(index)) {
            arkts.proceedToState(index);
        }
        if (plugin) {
            insertPlugin(this.pluginDriver, plugin, index);
            // TODO: add error/warning handling after plugin
            this.cache.script = arkts.EtsScript.fromContext();
        }
        const hook: SkipFirstParam<TestParams> | undefined = pluginHooks[key];
        if (!!hook) {
            test(testName, hook[0]?.bind(this.cache), hook[1]);
        }
    }

    private proceedToState(
        state: PluginState,
        index: arkts.Es2pandaContextState,
        testName: string,
        pluginHooks: PluginTestHooks,
        plugins?: PluginExecutor[]
    ): void {
        if (plugins && plugins.length > 0) {
            plugins.forEach((plugin) => {
                const pluginName: string = plugin.name;
                const key: `${PluginState}:${string}` = `${state}:${pluginName}`;
                this.test(key, index, `[${key}] ${testName}`, pluginHooks, plugin);
            });
        }
        this.test(state, index, `[${state}] ${testName}`, pluginHooks);
    }

    private singleFileCompile(
        fileInfo: CompileFileInfo,
        moduleInfo: ModuleInfo,
        testName: string,
        pluginHooks: PluginTestHooks,
        stopAfter: PluginState
    ): void {
        let shouldStop: boolean = false;

        initGlobal(fileInfo, this.configBuilder.isDebug);

        Object.values(arkts.Es2pandaContextState)
            .filter(isNumber)
            .forEach((it) => {
                if (shouldStop) return;
                const state: PluginState = stateName(it);
                const plugins: PluginExecutor[] | undefined = this.pluginDriver.getSortedPlugins(it);
                this.proceedToState(
                    state,
                    it,
                    `${moduleInfo.packageName} - ${fileInfo.fileName}: ${testName}`,
                    pluginHooks,
                    plugins
                );
                shouldStop = state === stopAfter;
            });
    }

    private traverseFile(testName: string, pluginHooks: PluginTestHooks, stopAfter: PluginState): void {
        this.configBuilder.moduleInfos.forEach((moduleInfo) => {
            moduleInfo.compileFileInfos.forEach((fileInfo) => {
                this.singleFileCompile(fileInfo, moduleInfo, testName, pluginHooks, stopAfter);
            });
        });
    }

    run(
        testName: string,
        plugins: Plugins[],
        pluginHooks: PluginTestHooks,
        options: PluginTesterOptions,
        testHooks?: TestHooks
    ): void {
        if (!!options.buildConfig) {
            this.configBuilder = new MockArktsConfigBuilder(options.buildConfig);
        }

        this.loadPluginDriver(plugins);

        describe(this.describe, () => {
            if (testHooks?.beforeAll) {
                beforeAll(...testHooks.beforeAll);
            }
            if (testHooks?.afterAll) {
                afterAll(...testHooks.afterAll);
            }
            if (testHooks?.beforeEach) {
                beforeEach(...testHooks.beforeEach);
            }
            if (testHooks?.afterEach) {
                afterEach(...testHooks.afterEach);
            }
            this.traverseFile(testName, pluginHooks, options.stopAfter);
        });
    }
}

export { PluginTester };
