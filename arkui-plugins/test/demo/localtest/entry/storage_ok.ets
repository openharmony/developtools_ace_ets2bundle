/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

// import { Text } from "@ohos.arkui.component.text"
// import { Component } from "@ohos.arkui.component.customComponent"
// import { memo } from "@koalaui.runtime.annotations"  // 临时加，需要使用UI Plugin添加


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

export declare interface StorageProperty {
    key: string;
    defaultValue: number | string | boolean | Object;
}

export type PersistPropsOptions = StorageProperty;

export declare interface AbstractProperty<T> {
    info(): string;
    get(): T;
    set(newValue: T): void;
}

export declare interface SubscribedAbstractProperty<T> extends AbstractProperty<T> {
    aboutToBeDeleted(): void;
}

export declare class LocalStorage {
    static getShared(): LocalStorage | undefined;

    constructor(initializingProperties?: StorageProperty[]);

    has(propName: string): boolean;

    keys(): IterableIterator<string>;

    size(): int;

    get<T>(propName: string): T | undefined;

    set<T>(propName: string, newValue: T): boolean;

    setOrCreate<T>(propName: string, newValue?: T): boolean;

    ref<T>(propName: string): AbstractProperty<T> | undefined;

    setAndRef<T>(propName: string, defaultValue: T): AbstractProperty<T>;

    link<T>(propName: string): SubscribedAbstractProperty<T> | undefined;

    setAndLink<T>(propName: string, defaultValue: T): SubscribedAbstractProperty<T>;

    prop<T>(propName: string): SubscribedAbstractProperty<T> | undefined;

    setAndProp<T>(propName: string, defaultValue: T): SubscribedAbstractProperty<T>;

    delete(propName: string): boolean;

    clear(): boolean;
}

export declare class AppStorage {
    static has(propName: string): boolean;

    static keys(): IterableIterator<string>;

    static size(): int;

    static get<T>(propName: string): T | undefined;

    static set<T>(propName: string, newValue: T): boolean;

    static setOrCreate<T>(propName: string, newValue?: T): boolean;

    static ref<T>(propName: string): AbstractProperty<T> | undefined;

    static setAndRef<T>(propName: string, defaultValue: T): AbstractProperty<T>;

    static link<T>(propName: string): SubscribedAbstractProperty<T> | undefined;

    static setAndLink<T>(propName: string, defaultValue: T): SubscribedAbstractProperty<T>;

    static prop<T>(propName: string): SubscribedAbstractProperty<T> | undefined;

    static setAndProp<T>(propName: string, defaultValue: T): SubscribedAbstractProperty<T>;

    static delete(propName: string): boolean;

    static clear(): boolean;
}

export declare class PersistentStorage {

    static persistProp<T>(key: string, defaultValue: T): void;

    static deleteProp(key: string): void;

    static persistProps(props: PersistPropsOptions[]): void;

    static keys(): Array<string>;
}

export declare interface EnvPropsOptions {
    key: string;
    defaultValue: number | string | boolean;
}

export declare class Environment {
    static envProp<S>(key: string, value: S): boolean;

    static envProps(props: EnvPropsOptions[]): void;

    static keys(): Array<string>;
}
