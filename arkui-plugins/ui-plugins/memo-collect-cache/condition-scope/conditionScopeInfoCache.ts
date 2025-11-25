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
import { NodeCacheNames } from '../../../common/predefines';

export interface ConditionScopeInfo {
    arg: arkts.ArrowFunctionExpression;
    call: arkts.CallExpression;
}

export class ConditionScopeInfoCache {
    private _infos: ConditionScopeInfo[] = [];
    private static instance: ConditionScopeInfoCache | null = null;

    static getInstance(): ConditionScopeInfoCache {
        if (!this.instance) {
            this.instance = new ConditionScopeInfoCache();
        }
        return this.instance;
    }

    private _updateConditionArg(arg: arkts.ArrowFunctionExpression): void {
        const scriptFunc = arg.scriptFunction;
        arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).addNodeToUpdateByPeer(scriptFunc.peer);
        const body = scriptFunc.body;
        if (!!body) {
            arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).addNodeToUpdateByPeer(body.peer);
        }
        arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(arg);
    }

    private _updateConditionCall(call: arkts.CallExpression): void {
        arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(call);
    }

    get infos(): ConditionScopeInfo[] {
        return this._infos;
    }

    collect(info: ConditionScopeInfo): this {
        this._infos.push(info);
        return this;
    }

    updateAll(): this {
        this._infos.forEach((info) => {
            this._updateConditionArg(info.arg);
            this._updateConditionCall(info.call);
        });
        return this;
    }

    reset(): void {
        this._infos = [];
    }
}
