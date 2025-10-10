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

export interface ComputedInfo {
    newName: string;
}

export class ComputedCache {
    private _cache: Map<string, Array<ComputedInfo>>;
    private static instance: ComputedCache | null = null;

    private constructor() {
        this._cache = new Map<string, Array<ComputedInfo>>();
    }

    static getInstance(): ComputedCache {
        if (!this.instance) {
            this.instance = new ComputedCache();
        }
        return this.instance;
    }

    reset(): void {
        this._cache.clear();
    }

    getCachedComputed(className: string): arkts.AstNode[] {
        if (!this._cache.has(className)) {
            return [];
        }
        return Object.entries(this._cache.get(className)!).map((item: [string, ComputedInfo]) => {
            const newName: string = item[1].newName;
            return factory.generateComputedOwnerAssignment(newName);
        });
    }

    collectComputed(className: string, info: ComputedInfo): void {
        let classCache: Array<ComputedInfo> = [];
        if (this._cache.has(className)) {
            classCache = this._cache.get(className)!;
        }
        classCache.push(info);
        this._cache.set(className, classCache);
    }
}
