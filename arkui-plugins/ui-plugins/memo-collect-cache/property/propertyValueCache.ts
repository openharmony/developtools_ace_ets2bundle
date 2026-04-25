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
import { NodeCacheNames } from '../../../common/predefines';

export interface PropertyValueInfo {
    value: arkts.AstNode;
}

export class PropertyValueCache {
    private _infos: PropertyValueInfo[] = [];
    private static instance: PropertyValueCache | null = null;

    static getInstance(): PropertyValueCache {
        if (!this.instance) {
            this.instance = new PropertyValueCache();
        }
        return this.instance;
    }

    private _updateValue(value: arkts.AstNode): void {
        let currParent: arkts.AstNode | undefined = value.parent;
        while (!!currParent && !arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).shouldUpdateByPeer(currParent.peer)) {
            arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).addNodeToUpdateByPeer(currParent.peer);
            currParent = currParent.parent;
        }
    }

    get infos(): PropertyValueInfo[] {
        return this._infos;
    }

    collect(info: PropertyValueInfo): this {
        this._infos.push(info);
        return this;
    }

    updateAll(): this {
        this._infos.forEach((info) => {
            this._updateValue(info.value);
        });
        return this;
    }

    reset(): void {
        this._infos = [];
    }
}