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

export interface PropertyCachedBody {
    initializeBody?: arkts.AstNode[];
    updateBody?: arkts.AstNode[];
    toRecordBody?: arkts.Property[];
    constructorBody?: arkts.AstNode[];
    monitorBody?: arkts.AstNode[];
}

export class PropertyCache {
    private _cache: Map<string, PropertyCachedBody>;
    private static instance: PropertyCache;

    private constructor() {
        this._cache = new Map<string, PropertyCachedBody>();
    }

    static getInstance(): PropertyCache {
        if (!this.instance) {
            this.instance = new PropertyCache();
        }
        return this.instance;
    }

    reset(): void {
        this._cache.clear();
    }

    getInitializeBody(name: string): arkts.AstNode[] {
        return this._cache.get(name)?.initializeBody ?? [];
    }

    getUpdateBody(name: string): arkts.AstNode[] {
        return this._cache.get(name)?.updateBody ?? [];
    }

    getToRecordBody(name: string): arkts.Property[] {
        return this._cache.get(name)?.toRecordBody ?? [];
    }

    collectInitializeStruct(name: string, initializeStruct: arkts.AstNode[]): void {
        const initializeBody = this._cache.get(name)?.initializeBody ?? [];
        const newInitializeBody = [...initializeBody, ...initializeStruct];
        this._cache.set(name, { ...this._cache.get(name), initializeBody: newInitializeBody });
    }

    collectUpdateStruct(name: string, updateStruct: arkts.AstNode[]): void {
        const updateBody = this._cache.get(name)?.updateBody ?? [];
        const newUpdateBody = [...updateBody, ...updateStruct];
        this._cache.set(name, { ...this._cache.get(name), updateBody: newUpdateBody });
    }

    collectToRecord(name: string, toRecord: arkts.Property[]): void {
        const toRecordBody = this._cache.get(name)?.toRecordBody ?? [];
        const newToRecordBody = [...toRecordBody, ...toRecord];
        this._cache.set(name, { ...this._cache.get(name), toRecordBody: newToRecordBody });
    }
}
