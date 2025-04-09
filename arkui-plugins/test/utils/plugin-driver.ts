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
import { isNumber } from './safe-types';
import { Plugins, PluginContext, PluginHandler, PluginState, PluginExecutor } from '../../common/plugin-context';

export interface PluginDriver {
    initPlugins(plugins: Plugins[]): void;
    getSortedPlugins(state: arkts.Es2pandaContextState): PluginExecutor[] | undefined;
    getPluginContext(): PluginContext;
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
    private context: PluginContext;

    constructor() {
        this.sortedPlugins = new Map<arkts.Es2pandaContextState, PluginExecutor[] | undefined>();
        this.context = new PluginContext();
    }

    public initPlugins(plugins: Plugins[]): void {
        const pluginsByState = new Map<arkts.Es2pandaContextState, PluginExecutor[] | undefined>();

        Object.values(arkts.Es2pandaContextState)
            .filter(isNumber)
            .forEach((it) => {
                const selected = selectPlugins(plugins, stateName(it));
                if (selected.length > 0) {
                    pluginsByState.set(it, selected);
                } else {
                    pluginsByState.set(it, undefined);
                }
            });

        this.sortedPlugins = pluginsByState;
    }

    public getSortedPlugins(state: arkts.Es2pandaContextState): PluginExecutor[] | undefined {
        return this.sortedPlugins.get(state);
    }

    public getPluginContext(): PluginContext {
        return this.context;
    }
}

export { stateName, MockPluginDriver };
