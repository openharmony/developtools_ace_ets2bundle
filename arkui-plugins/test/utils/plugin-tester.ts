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
import {
    canProceedToState,
    destroyConfig,
    destroyContext,
    initGlobal,
    resetConfig,
    resetContext,
} from './global';
import { insertPlugin } from './compile';
import { PluginExecutor, Plugins, PluginState } from '../../common/plugin-context';
import { TesterCache } from './cache';
import * as arkts from '@koalaui/libarkts';
import * as fs from 'fs';

type TestParams = Parameters<typeof test>;

type SkipFirstParam<T extends unknown[]> = T extends [unknown, ...infer Rest] ? Rest : never;

type PluginTestHooks = {
    [K in PluginState | `${PluginState}:${string}`]?: SkipFirstParam<TestParams>;
};

type TestHooks = {
    beforeAll?: Parameters<jest.Lifecycle>;
    beforeEach?: Parameters<jest.Lifecycle>;
    afterEach?: Parameters<jest.Lifecycle>;
};

export interface PluginTestContext {
    scriptSnapshot?: string;
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
    private cache: TesterCache<PluginTestContext>;

    constructor(describe: string, buildConfig?: BuildConfig) {
        this.describe = describe;
        this.configBuilder = new MockArktsConfigBuilder(buildConfig);
        this.pluginDriver = new MockPluginDriver();
        this.cache = TesterCache.getInstance();
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
        let cached: boolean = false;
        const cacheKey: string = `${testName}-${key}`;
        if (index > arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED) {
            return;
        }
        if (canProceedToState(index)) {
            arkts.proceedToState(index);
        }
        if (plugin) {
            insertPlugin(this.pluginDriver, plugin, index);
            this.captureContext(cacheKey);
            cached = true;
        }
        const hook: SkipFirstParam<TestParams> | undefined = pluginHooks[key];
        if (!!hook) {
            if (!cached) this.captureContext(cacheKey);
            test(testName, hook[0]?.bind(this.cache.get(cacheKey)), hook[1]);
        }
    }

    private captureContext(cacheKey: string): void {
        try {
            // TODO: add error/warning handling after plugin
            const context: PluginTestContext = this.cache.get(cacheKey) ?? {};
            const script: arkts.EtsScript = arkts.EtsScript.fromContext();
            context.scriptSnapshot = script.dumpSrc();
            this.cache.set(cacheKey, context);
        } catch (e) {
            // Do nothing
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

        Object.values(arkts.Es2pandaContextState)
            .filter(isNumber)
            .forEach((it) => {
                if (shouldStop) {
                    return;
                }
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
        let once: boolean = false;
        this.configBuilder.moduleInfos.forEach((moduleInfo) => {
            moduleInfo.compileFileInfos.forEach((fileInfo) => {
                if (!once) {
                    initGlobal(fileInfo, this.configBuilder.isDebug);
                    once = true;
                } else {
                    const source: string = fs.readFileSync(fileInfo.filePath).toString();
                    resetContext(source);
                }
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

        this.cache.clear();
        this.loadPluginDriver(plugins);

        const that = this;
        describe(this.describe, () => {
            if (testHooks?.beforeAll) {
                beforeAll(...testHooks.beforeAll);
            }
            if (testHooks?.beforeEach) {
                beforeEach(...testHooks.beforeEach);
            }
            if (testHooks?.afterEach) {
                afterEach(...testHooks.afterEach);
            }
            afterAll(() => {
                destroyContext();
                destroyConfig();
            });
            that.traverseFile(testName, pluginHooks, options.stopAfter);
        });
    }
}

export { PluginTester };
