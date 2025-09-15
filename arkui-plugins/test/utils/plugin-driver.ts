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

import { isNumber } from './safe-types';
import { Plugins, PluginContext, PluginHandler, PluginState, PluginExecutor } from '../../common/plugin-context';
import { PluginStateId } from './shared-types';
import * as arkts from '@koalaui/libarkts';

export interface PluginDriver {
    initPlugins(plugins: Plugins[]): void;
    getSortedPlugins(state: arkts.Es2pandaContextState): PluginExecutor[] | undefined;
    getPluginContext(): PluginContext;
    getPluginHistory(): PluginStateId[];
    clear(): void;
}

function toCamelCase(str: string): string {
    return str
        .split('_')
        .map((word, index) => {
            if (index === 0) {
                return word;
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join('');
}

function stateName(value: arkts.Es2pandaContextState): PluginState {
    return toCamelCase(
        arkts.Es2pandaContextState[value].substring('ES2PANDA_STATE_'.length).toLowerCase()
    ) as PluginState;
}

function selectPlugins(plugins: Plugins[], stage: PluginState): PluginExecutor[] {
    const pre: PluginExecutor[] = [];
    const normal: PluginExecutor[] = [];
    const post: PluginExecutor[] = [];

    plugins
        .filter((it) => stage in it)
        .forEach((it) => {
            const pluginName: string = it.name;
            const handler: PluginHandler = it[stage]!;
            const order: string | undefined = typeof handler === 'object' ? handler.order : undefined;
            const rawPluginHook: PluginExecutor = {
                name: pluginName,
                handler: typeof handler === 'object' ? handler.handler : handler,
            };

            if (order === 'pre') {
                pre.push(rawPluginHook);
            } else if (order === 'post') {
                post.push(rawPluginHook);
            } else {
                normal.push(rawPluginHook);
            }
        });

    return [...pre, ...normal, ...post];
}

class MockPluginDriver implements PluginDriver {
    private sortedPlugins: Map<arkts.Es2pandaContextState, PluginExecutor[] | undefined>;
    private history: Set<PluginStateId>;
    private context: PluginContext | undefined;

    private static instance: PluginDriver | undefined;

    constructor() {
        this.sortedPlugins = new Map<arkts.Es2pandaContextState, PluginExecutor[] | undefined>();
        this.history = new Set<PluginStateId>();
        this.context = new PluginContext();
    }

    public static getInstance(): PluginDriver {
        if (!this.instance) {
            this.instance = new MockPluginDriver();
        }
        return this.instance;
    }

    private collectHistory(state: PluginState, plugins: PluginExecutor[]) {
        for (const plugin of plugins) {
            this.history.add(`${state}:${plugin.name}`);
        }
        this.history.add(state);
    }

    public initPlugins(plugins: Plugins[]): void {
        const pluginsByState = new Map<arkts.Es2pandaContextState, PluginExecutor[] | undefined>();

        Object.values(arkts.Es2pandaContextState)
            .filter(isNumber)
            .forEach((it) => {
                const state = stateName(it);
                const selected = selectPlugins(plugins, state);
                if (selected.length > 0) {
                    pluginsByState.set(it, selected);
                } else {
                    pluginsByState.set(it, undefined);
                }
                this.collectHistory(state, selected);
            });

        this.sortedPlugins = pluginsByState;
    }

    public getSortedPlugins(state: arkts.Es2pandaContextState): PluginExecutor[] | undefined {
        return this.sortedPlugins.get(state);
    }

    public getPluginContext(): PluginContext {
        if (!this.context) {
            this.context = new PluginContext();
        }
        return this.context;
    }

    public getPluginHistory(): PluginStateId[] {
        return Array.from(this.history);
    }

    public clear(): void {
        this.sortedPlugins.clear();
        this.context = undefined;
    }
}

export { stateName, MockPluginDriver };
