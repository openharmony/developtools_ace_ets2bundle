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

export function getPropertyRewriteKey(node: arkts.ClassElement, name: string): string {
    const prefix: string = arkts.isClassProperty(node) ? "%%prop%%" : "%%other%%";
    return `${prefix}${name}`;
}

export class PropertyRewriteCache {
    private _cache: Map<string, arkts.AstNode[]>;
    private _releasedNames: Set<string>;
    private static instance: PropertyRewriteCache;

    private constructor() {
        this._cache = new Map<string, arkts.AstNode[]>();
        this._releasedNames = new Set<string>();
    }

    static getInstance(): PropertyRewriteCache {
        if (!this.instance) {
            this.instance = new PropertyRewriteCache();
        }
        return this.instance;
    }

    reset(): void {
        this._cache.clear();
        this._releasedNames.clear();
    }

    getRewriteNodes(name: string): arkts.AstNode[] {
        return this._cache.get(name) ?? [];
    }

    release(name: string): this {
        if (this._cache.has(name)) {
            this._releasedNames.add(name);
        }
        return this;
    }

    isReleased(name: string): boolean {
        return this._releasedNames.has(name);
    }

    collectRewriteNodes(name: string, nodes: arkts.AstNode[]): void {
        const originProperties = this._cache.get(name) ?? [];
        const newProperties = [...originProperties, ...nodes];
        this._cache.set(name, newProperties);
    }
}
