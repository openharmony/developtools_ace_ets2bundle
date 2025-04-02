/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
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

export declare function getObservableTarget(proxy: Object): Object;
/**
 * Data class decorator that makes all child fields trackable.
 */
export declare function Observed(constructorFunction: Function): void;
/** @internal */
export interface Observable {
    /** It is called when the observable value is accessed. */
    onAccess(): void;
    /** It is called when the observable value is modified. */
    onModify(): void;
}
/** @internal */
export declare class ObservableHandler implements Observable {
    private static handlers;
    private parents;
    private children;
    private readonly observables;
    private _modified;
    readonly observed: boolean;
    constructor(parent?: ObservableHandler, observed?: boolean);
    onAccess(): void;
    onModify(): void;
    static dropModified<Value>(value: Value): boolean;
    /** Adds the specified `observable` to the handler corresponding to the given `value`. */
    static attach<Value>(value: Value, observable: Observable): void;
    /** Deletes the specified `observable` from the handler corresponding to the given `value`. */
    static detach<Value>(value: Value, observable: Observable): void;
    /** @returns the handler corresponding to the given `value` if it was installed */
    private static findIfObject;
    /**
     * @param value - any non-null object including arrays
     * @returns an observable handler or `undefined` if it is not installed
     */
    static find(value: Object): ObservableHandler | undefined;
    /**
     * @param value - any non-null object including arrays
     * @param observable - a handler to install on this object
     * @throws an error if observable handler cannot be installed
     */
    static installOn(value: Object, observable?: ObservableHandler): void;
    addParent(parent: ObservableHandler): void;
    removeParent(parent: ObservableHandler): void;
    removeChild<Value>(value: Value): void;
    private collect;
    static contains(observable: ObservableHandler, guards?: Set<ObservableHandler>): boolean;
}
/** @internal */
export declare function observableProxyArray<Value>(...value: Value[]): Array<Value>;
/** @internal */
export declare function observableProxy<Value>(value: Value, parent?: ObservableHandler, observed?: boolean, strict?: boolean): Value;
//# sourceMappingURL=observable.d.ts.map