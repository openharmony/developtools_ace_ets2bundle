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

import { ArktsConfigBuilder, MockArktsConfigBuilder } from './artkts-config';
import { MockPluginDriver } from './plugin-driver';
import {
    BuildConfig,
    CompileFileInfo,
    PluginStateId,
    PluginTestContext,
    Processor,
    SingleProgramContext,
    TraceOptions,
} from './shared-types';
import { HashGenerator } from './hash-generator';
import { PluginTestContextCache } from './cache';
import { Plugins, PluginState, ProjectConfig } from '../../common/plugin-context';
import { concatObject } from './serializable';
import { ProcessorBuilder } from './processor-builder';
import { MainProcessor } from './processors/main-processor';

type TestParams = Parameters<typeof test>;

type SkipFirstParam<T extends unknown[]> = T extends [unknown, ...infer Rest] ? Rest : never;

type PluginTestHooks = {
    [K in PluginStateId]?: SkipFirstParam<TestParams>;
};

type TestHooks = {
    beforeAll?: Parameters<jest.Lifecycle>;
    beforeEach?: Parameters<jest.Lifecycle>;
    afterEach?: Parameters<jest.Lifecycle>;
};

export interface PluginTesterOptions {
    stopAfter: PluginState;
    buildConfig?: BuildConfig;
    projectConfig?: ProjectConfig;
    tracing?: TraceOptions;
}

class PluginTester {
    private hashId: string;
    private describe: string;
    private configBuilder: ArktsConfigBuilder;
    private taskProcessor?: Processor;
    private resolve?: Promise<void>;

    constructor(describe: string, buildConfig?: BuildConfig, projectConfig?: ProjectConfig) {
        this.describe = describe;
        this.hashId = HashGenerator.getInstance().dynamicSha1Id(describe, 13);
        this.configBuilder = new MockArktsConfigBuilder(this.hashId, buildConfig);
    }

    private clear(): void {
        this.clearCache();
        this.configBuilder.clear();
        this.taskProcessor?.clear();
        MockPluginDriver.getInstance().clear();
    }

    private clearCache(): void {
        const moduleInfo = this.configBuilder.moduleInfos.get(this.configBuilder.moduleRootPath)!;
        const fileHistory = moduleInfo.compileFileInfos.map((fileInfo) => fileInfo.fileName) ?? [];
        const pluginHistory = MockPluginDriver.getInstance().getPluginHistory();
        for (const pluginStateId of pluginHistory) {
            const abcKey = this.getCacheKey(pluginStateId);
            const externalKey = this.getCacheKey(pluginStateId, true);
            for (const fileName of fileHistory) {
                PluginTestContextCache.getInstance().delete(`${abcKey}:${fileName}`);
                PluginTestContextCache.getInstance().delete(`${externalKey}:${fileName}`);
            }
        }
    }

    private getCacheKey(pluginStateId: PluginStateId, isExternal?: boolean) {
        return [this.hashId, !!isExternal ? 'external' : 'abc', pluginStateId].join(':');
    }

    private prepareContext(pluginStateId: PluginStateId, fileInfos: CompileFileInfo[]): PluginTestContext {
        const fileNames: string[] = fileInfos.map((fileInfo) => fileInfo.fileName);

        const abcKey = this.getCacheKey(pluginStateId);
        const externalKey = this.getCacheKey(pluginStateId, true);

        const sourceContexts: Record<string, SingleProgramContext> = {};
        let declContexts: Record<string, SingleProgramContext> = {};
        fileNames.forEach((fileName) => {
            const sourceKey = `${abcKey}:${fileName}`;
            const sourceContext = PluginTestContextCache.getInstance().get(sourceKey) ?? {};
            if (!!sourceContext.declContexts) {
                declContexts = concatObject(declContexts, sourceContext.declContexts);
                delete sourceContext.declContexts;
            }
            sourceContexts[fileName] = sourceContext;

            const declKey = `${externalKey}:${fileName}`;
            const declContext = PluginTestContextCache.getInstance().get(declKey) ?? {};
            declContexts = concatObject(declContexts, declContext.declContexts ?? {});
        });

        return { sourceContexts, declContexts };
    }

    private findContext(testContext: PluginTestContext | undefined, fileName?: string): PluginTestContext | undefined {
        if (!testContext) {
            return undefined;
        }
        if (!testContext.sourceContexts) {
            return { declContexts: testContext.declContexts };
        }
        const sourceContext = fileName
            ? testContext.sourceContexts[fileName]
            : Object.values(testContext.sourceContexts)[Symbol.iterator]().next().value;
        return { ...sourceContext, declContexts: testContext.declContexts };
    }

    private test(
        pluginStateId: PluginStateId,
        testName: string,
        hook: SkipFirstParam<TestParams> | undefined,
        compileFiles: CompileFileInfo[],
        fileName?: string
    ): void {
        if (!!hook) {
            const that = this;
            test(
                testName,
                async () => {
                    let context: PluginTestContext | undefined;
                    await that.resolve?.then(async () => {
                        const testContext = this.prepareContext(pluginStateId, compileFiles ?? []);
                        context = this.findContext(testContext, fileName);
                    });
                    hook[0]?.bind(context)(undefined as any);
                },
                hook[1]
            );
        }
    }

    private pluginTests(key: PluginStateId, testName: string, pluginHooks: PluginTestHooks): void {
        const moduleInfo = this.configBuilder.moduleInfos.get(this.configBuilder.moduleRootPath)!;
        const compileFiles = moduleInfo.compileFileInfos;
        compileFiles?.forEach((fileInfo) => {
            const fileName = fileInfo.fileName;
            const name: string = `[${key}] ${moduleInfo.packageName} - ${fileName}: ${testName}`;
            this.test(key, name, pluginHooks[`${key}:${fileName}`], compileFiles, fileName);
        });
        const name: string = `[${key}] ${moduleInfo.packageName}: ${testName}`;
        this.test(key, name, pluginHooks[key], compileFiles);
    }

    private compileTests(testName: string, pluginHooks: PluginTestHooks): void {
        const history = MockPluginDriver.getInstance().getPluginHistory();
        history.forEach((key) => {
            this.pluginTests(key, testName, pluginHooks);
        });
    }

    private async compile(plugins: Plugins[], stopAfter?: PluginState, tracing?: TraceOptions): Promise<void> {
        this.taskProcessor = ProcessorBuilder.build(
            MainProcessor,
            this.hashId,
            this.configBuilder.buildConfig,
            this.configBuilder.projectConfig,
            tracing
        );
        return this.taskProcessor.invokeWorkers(plugins, stopAfter);
    }

    run(
        testName: string,
        plugins: Plugins[],
        pluginHooks: PluginTestHooks,
        options: PluginTesterOptions,
        testHooks?: TestHooks
    ): void {
        if (!!options.buildConfig) {
            this.configBuilder = this.configBuilder.withBuildConfig(options.buildConfig);
        }
        if (!!options.projectConfig) {
            this.configBuilder = this.configBuilder.withProjectConfig(options.projectConfig);
        }

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
                that.clear();
            });

            that.resolve = that.compile(plugins, options.stopAfter, options.tracing);
            that.compileTests(testName, pluginHooks);
        });
    }
}

export { PluginTester };
