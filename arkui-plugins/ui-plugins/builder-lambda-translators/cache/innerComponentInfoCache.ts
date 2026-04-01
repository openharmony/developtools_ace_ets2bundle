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

import { InnerComponentFunctionInfo } from '../../../collectors/ui-collectors/records';
import { TypeRecord } from '../../../collectors/utils/collect-types';

export class InnerComponentInfoCache {
    private _cache: Map<string, InnerComponentFunctionInfo[]>;
    private _componentNames: Set<string>;
    private _hasLastTrailingLambda: Record<string, boolean>;
    private _attributeNameMap: Record<string, string>;
    private _attributeTypeParamsMap: Record<string, TypeRecord[]>;
    private _isCollected: boolean = false;
    private static instance: InnerComponentInfoCache;

    private constructor() {
        this._cache = new Map<string, InnerComponentFunctionInfo[]>();
        this._componentNames = new Set();
        this._attributeNameMap = {};
        this._attributeTypeParamsMap = {};
        this._hasLastTrailingLambda = {};
    }

    static getInstance(): InnerComponentInfoCache {
        if (!this.instance) {
            this.instance = new InnerComponentInfoCache();
        }
        return this.instance;
    }

    private collectComponentRecord(name: string, info: InnerComponentFunctionInfo): void {
        const collectedInfos: InnerComponentFunctionInfo[] = this._cache.get(name) ?? [];
        collectedInfos.push(info);
        this._cache.set(name, collectedInfos);
    }

    private collectAttributeName(name: string, attributeName: string): void {
        const collectedNames: string = this._attributeNameMap[name] ?? attributeName;
        this._attributeNameMap[name] = collectedNames;
    }

    private collectAttributeTypeParams(name: string, attributeTypeParams: TypeRecord[] | undefined): void {
        if (!attributeTypeParams) {
            return;
        }
        const collectedTypeParams: TypeRecord[] = this._attributeTypeParamsMap[name] ?? attributeTypeParams;
        this._attributeTypeParamsMap[name] = collectedTypeParams;
    }

    private collectHasLastTrailingLambda(name: string, hasLastTrailingLambda: boolean): void {
        this._hasLastTrailingLambda[name] ||= hasLastTrailingLambda;
    }

    reset(): void {
        this._cache.clear();
        this._componentNames.clear();
        this._attributeNameMap = {};
        this._attributeTypeParamsMap = {};
        this._hasLastTrailingLambda = {};
        this._isCollected = false;
    }

    isCollected(): boolean {
        return this._isCollected;
    }

    hasComponentName(name: string): boolean {
        return this._componentNames.has(name);
    }

    collect(componentName?: string, info?: InnerComponentFunctionInfo): void {
        if (!componentName || !info || !info.attributeName) {
            return;
        }
        this.collectComponentRecord(componentName, info);
        this.collectHasLastTrailingLambda(componentName, !!info.hasLastTrailingLambda);
        this.collectAttributeName(componentName, info.attributeName);
        this.collectAttributeTypeParams(componentName, info.attributeTypeParams);
        this._componentNames.add(componentName);
        this._isCollected = true;
    }

    getComponentRecord(name: string): InnerComponentFunctionInfo[] | undefined {
        return this._cache.get(name);
    }

    getAttributeName(name: string): string | undefined {
        return this._attributeNameMap[name];
    }

    getAttributeTypeParams(name: string): TypeRecord[] | undefined {
        return this._attributeTypeParamsMap[name];
    }

    getHasLastTrailingLambda(name: string): boolean {
        return !!this._hasLastTrailingLambda[name];
    }

    getAllComponentNames(): string[] {
        return Array.from(this._componentNames.values());
    }
}
