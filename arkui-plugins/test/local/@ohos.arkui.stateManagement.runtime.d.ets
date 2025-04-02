/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { LocalStorage } from "@ohos.arkui.stateManagement.storage"

// From incremental engine
@Retention({policy: "SOURCE"})
export declare @interface memo {};

export type __memo_context_type = StateContext;
export type __memo_id_type = MemoCallSiteKey;

export type MemoCallSiteKey = int;

export declare interface Disposable {
    readonly disposed: boolean;
    dispose(): void;
}

export declare interface State<T> {
    readonly modified: boolean;
    readonly value: T;
}

export declare interface MutableState<T> extends Disposable, State<T> {
    value: T;
}

export type Equivalent<T> = (oldV: T, newV: T) => boolean;

export declare interface InternalScope<Value> {
    readonly unchanged: boolean;
    readonly cached: Value;
    recache(newValue?: Value): Value;
    param<T>(index: int, value: T, equivalent?: Equivalent<T>, name?: string, contextLocal?: boolean): State<T>;
}

export declare interface StateContext {
    scope<T>(id: MemoCallSiteKey, paramCount?: int): InternalScope<T>;
}

// From Arkoala
export declare function propState<T>(value?: T): MutableState<T>;
export declare function objectLinkState<T>(value?: T): MutableState<T>;
export declare function stateOf<T>(value: T): MutableState<T>;
export declare function contextLocalStateOf<T>(value: T, key: () => T): MutableState<T>;
export declare function contextLocal<T>(value: T): MutableState<T>;
export declare function observableProxy<T>(value: T): T;
export declare function StorageLinkState<T>(storage: LocalStorage, name: string, value: T): MutableState<T>
export declare function AppStorageLinkState<T>(name: string, value: T): MutableState<T>;