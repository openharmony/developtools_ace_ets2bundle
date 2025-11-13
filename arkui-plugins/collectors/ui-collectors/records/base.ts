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

export interface RecordOptions {
    shouldIgnoreDecl: boolean;
}

export abstract class BaseRecord<Node extends arkts.AstNode, T extends Record<string, unknown>> {
    protected info: T | undefined;
    protected _shouldIgnoreDecl: boolean;

    private _isChanged: boolean = false;
    private _isCollected: boolean = false;

    constructor(options: RecordOptions) {
        this._shouldIgnoreDecl = options.shouldIgnoreDecl;
    }

    protected get isChanged(): boolean {
        return this._isChanged;
    }

    protected set isChanged(isChanged: boolean) {
        this._isChanged = isChanged;
    }

    get isCollected(): boolean {
        return this._isCollected;
    }

    get shouldIgnoreDecl(): boolean {
        return this._shouldIgnoreDecl;
    }

    set shouldIgnoreDecl(value: boolean) {
        this._shouldIgnoreDecl = value;
    }

    getOptions(): RecordOptions {
        return {
            shouldIgnoreDecl: this._shouldIgnoreDecl
        }
    }

    toRecord(): T | undefined {
        this.refresh();
        return this.info;
    }

    collect(node: Node): void {
        this.collectFromNode(node);
        this.isChanged = true;
        this._isCollected = true;
    }

    refresh(): void {
        if (!this.isChanged) {
            return;
        }
        this.refreshOnce();
        this.isChanged = false;
    }

    protected abstract collectFromNode(node: Node): void;

    protected abstract refreshOnce(): void;

    abstract toJSON(): T;
}