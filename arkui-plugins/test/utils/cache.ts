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

import { ArkTSConfigContext, FileDependencyContext, PluginTestContext } from './shared-types';

class TesterCache<T> {
    private cacheInfo: Map<string, T>;

    constructor() {
        this.cacheInfo = new Map<string, T>();
    }

    public delete(key: string) {
        if (this.cacheInfo.has(key)) {
            this.cacheInfo.delete(key);
        }
    }

    public get(key: string) {
        if (this.cacheInfo.has(key)) {
            return this.cacheInfo.get(key);
        }
        return undefined;
    }

    public has(key: string) {
        return this.cacheInfo.has(key);
    }

    public set(key: string, value: T) {
        if (!this.cacheInfo.has(key)) {
            this.cacheInfo.set(key, value);
        }
    }

    public clear() {
        this.cacheInfo.clear();
    }
}

class PluginTestContextCache extends TesterCache<PluginTestContext> {
    private static _instance: TesterCache<any>;

    static getInstance<T extends PluginTestContext>(): TesterCache<T> {
        if (!this._instance) {
            this._instance = new PluginTestContextCache();
        }
        return this._instance;
    }
}

class ArkTSConfigContextCache extends TesterCache<ArkTSConfigContext> {
    private static _instance: TesterCache<any>;

    static getInstance<T extends ArkTSConfigContext>(): TesterCache<T> {
        if (!this._instance) {
            this._instance = new ArkTSConfigContextCache();
        }
        return this._instance;
    }
}

class FileDependencyContextCache extends TesterCache<FileDependencyContext> {
    private static _instance: TesterCache<any>;

    static getInstance<T extends FileDependencyContext>(): TesterCache<T> {
        if (!this._instance) {
            this._instance = new FileDependencyContextCache();
        }
        return this._instance;
    }
}

export { TesterCache, PluginTestContextCache, ArkTSConfigContextCache, FileDependencyContextCache };
