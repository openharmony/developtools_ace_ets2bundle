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

export interface CustomDialogControllerInfo {
    controller: arkts.ETSNewClassInstanceExpression;
}

export class CustomDialogControllerCache {
    private _infos: CustomDialogControllerInfo[] = [];
    private _memoCache: arkts.NodeCache = arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO);
    private static instance: CustomDialogControllerCache | null = null;

    static getInstance(): CustomDialogControllerCache {
        if (!this.instance) {
            this.instance = new CustomDialogControllerCache();
        }
        return this.instance;
    }

    private _updateController(controller: arkts.ETSNewClassInstanceExpression): void {
        if (!this._memoCache.shouldUpdateByPeer(controller.peer)) {
            return;
        }
        let currParent: arkts.AstNode | undefined = controller.parent;
        while (!!currParent && !this._memoCache.shouldUpdateByPeer(currParent.peer)) {
            this._memoCache.addNodeToUpdateByPeer(currParent.peer);
            currParent = currParent.parent;
        }
    }

    get infos(): CustomDialogControllerInfo[] {
        return this._infos;
    }

    collect(info: CustomDialogControllerInfo): this {
        this._infos.push(info);
        return this;
    }

    updateAll(): this {
        this._infos.forEach((info) => {
            this._updateController(info.controller);
        });
        return this;
    }

    reset(): void {
        this._infos = [];
    }
}