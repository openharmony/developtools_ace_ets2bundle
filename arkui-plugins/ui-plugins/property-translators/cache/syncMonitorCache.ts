/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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

export interface SyncMonitorInfo {
    monitorItem: string[] | undefined;
    originalName: string;
    newName: string;
    isFromStruct: boolean;
    paramsLength: number;
}

export class SyncMonitorCache {
    private _cache: Map<string, Record<string, SyncMonitorInfo>>;
    private static instance: SyncMonitorCache | null = null;

    private constructor() {
        this._cache = new Map<string, Record<string, SyncMonitorInfo>>();
    }

    static getInstance(): SyncMonitorCache {
        if (!this.instance) {
            this.instance = new SyncMonitorCache();
        }
        return this.instance;
    }

    reset(): void {
        this._cache.clear();
    }

    getCachedSyncMonitors(className: string): arkts.AstNode[] {
        if (!this._cache.has(className)) {
            return [];
        }
        return Object.entries(this._cache.get(className)!).map((item: [string, SyncMonitorInfo]) => {
            const { monitorItem, originalName, newName, isFromStruct, paramsLength } = item[1];
            return factory.generateSyncMonitorAssignment(monitorItem, originalName, newName, isFromStruct, paramsLength);
        });
    }

    collectSyncMonitors(className: string, monitorPath: string, info: SyncMonitorInfo): void {
        let classCache: Record<string, SyncMonitorInfo> = {};
        if (this._cache.has(className)) {
            classCache = this._cache.get(className)!;
        }
        classCache[monitorPath] = info;
        this._cache.set(className, classCache);
    }
}
