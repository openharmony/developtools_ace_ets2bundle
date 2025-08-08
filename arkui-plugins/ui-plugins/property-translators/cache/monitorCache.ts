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

import * as arkts from '@koalaui/libarkts';
import { factory } from '../factory';

export interface MonitorInfo {
    monitorItem: string[] | undefined;
    originalName: string;
    newName: string;
}

export class MonitorCache {
    private _cache: Map<string, Record<string, MonitorInfo>>;
    private static instance: MonitorCache | null = null;

    private constructor() {
        this._cache = new Map<string, Record<string, MonitorInfo>>();
    }

    static getInstance(): MonitorCache {
        if (!this.instance) {
            this.instance = new MonitorCache();
        }
        return this.instance;
    }

    reset(): void {
        this._cache.clear();
    }

    getCachedMonitors(className: string): arkts.AstNode[] {
        if (!this._cache.has(className)) {
            return [];
        }
        return Object.entries(this._cache.get(className)!).map((item: [string, MonitorInfo]) => {
            const { monitorItem, originalName, newName } = item[1];
            return factory.generateinitAssignment(monitorItem, originalName, newName);
        });
    }

    collectMonitors(className: string, monitorPath: string, info: MonitorInfo): void {
        let classCache: Record<string, MonitorInfo> = {};
        if (this._cache.has(className)) {
            classCache = this._cache.get(className)!;
        }
        classCache[monitorPath] = info;
        this._cache.set(className, classCache);
    }
}
