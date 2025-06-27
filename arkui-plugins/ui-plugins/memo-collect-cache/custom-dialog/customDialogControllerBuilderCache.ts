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

export interface customDialogControllerBuilderInfo {
    arrowFunc: arkts.ArrowFunctionExpression;
    call?: arkts.CallExpression;
}

export class CustomDialogControllerBuilderCache {
    private _infos: customDialogControllerBuilderInfo[] = [];
    private _memoCache: arkts.NodeCache = arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO);
    private static instance: CustomDialogControllerBuilderCache | null = null;

    static getInstance(): CustomDialogControllerBuilderCache {
        if (!this.instance) {
            this.instance = new CustomDialogControllerBuilderCache();
        }
        return this.instance;
    }

    private _updateBuilderArrowFunc(arrowFunc: arkts.ArrowFunctionExpression): void {
        const scriptFunc = arrowFunc.scriptFunction;
        this._memoCache.addNodeToUpdateByPeer(scriptFunc.peer);
        const body = scriptFunc.body;
        if (!!body) {
            this._memoCache.addNodeToUpdateByPeer(body.peer);
        }
        this._memoCache.collect(arrowFunc);
    }

    private _updateBuilderCall(call?: arkts.CallExpression): void {
        if (!call) {
            return;
        }
        this._memoCache.collect(call);
    }

    get infos(): customDialogControllerBuilderInfo[] {
        return this._infos;
    }

    collect(info: customDialogControllerBuilderInfo): this {
        this._infos.push(info);
        return this;
    }

    updateAll(): this {
        this._infos.forEach((info) => {
            this._updateBuilderArrowFunc(info.arrowFunc);
            this._updateBuilderCall(info.call);
        });
        return this;
    }

    reset(): void {
        this._infos = [];
    }
}
