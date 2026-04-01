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
import { AstNodePointer } from '../../../common/safe-types';

export class PropertyRewriteCache {
    private _cache: Map<AstNodePointer, arkts.AstNode[]>;
    private static instance: PropertyRewriteCache;

    private constructor() {
        this._cache = new Map<AstNodePointer, arkts.AstNode[]>();
    }

    static getInstance(): PropertyRewriteCache {
        if (!this.instance) {
            this.instance = new PropertyRewriteCache();
        }
        return this.instance;
    }

    reset(): void {
        this._cache.clear();
    }

    getRewriteNodes(ptr: AstNodePointer): arkts.AstNode[] {
        return this._cache.get(ptr) ?? [];
    }

    collectRewriteNodes(ptr: AstNodePointer, nodes: arkts.AstNode[]): void {
        const originProperties = this._cache.get(ptr) ?? [];
        const newProperties = [...originProperties, ...nodes];
        this._cache.set(ptr, newProperties);
    }
}
