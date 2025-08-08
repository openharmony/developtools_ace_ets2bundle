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
import { NodeCacheNames } from '../../common/predefines';
import { AstNodeCacheValueMetadata, NodeCache, NodeCacheFactory } from '../../common/node-cache';

export interface BaseCacheInfo<T extends arkts.AstNode> {
    node: T;
    metadata?: AstNodeCacheValueMetadata;
}

export class BaseMemoCollectCache<T extends arkts.AstNode, Info extends BaseCacheInfo<T>> {
    protected _infos: Info[] = [];

    protected _updateInfo(info: Info): void {
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(info.node, info.metadata);
    }

    get infos(): Info[] {
        return this._infos;
    }

    collect(info: Info): void {
        this._infos.push(info);
    }

    updateAll(): this {
        this._infos.forEach((info) => {
            this._updateInfo(info);
        });
        return this;
    }

    reset(): void {
        this._infos = [];
    }
}
