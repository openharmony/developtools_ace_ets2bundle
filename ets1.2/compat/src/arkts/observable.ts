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

export function getObservableTarget(proxy0: Object): Object {
    try {
        // do not use proxy for own observables
        if (proxy0 instanceof ObservableArray
            || proxy0 instanceof ObservableDate
            || proxy0 instanceof ObservableMap
            || proxy0 instanceof ObservableSet ) {
            return proxy0
        }
        return (proxy.Proxy.tryGetTarget(proxy0) as Object|undefined|null) ?? proxy0
    } catch (error) {
        return proxy0
    }
}

/**
 * Data class decorator that makes all child fields trackable.
 */
export function Observed() {
    throw new Error("TypeScript class decorators are not supported yet")
}

/** @internal */
export interface Observable {
    /**
     *  It is called when the observable value is accessed.
     * @param propertyName - Optional name of the accessed property.
     *                       Should be provided when tracking individual properties.
     *  */
    onAccess(propertyName?: string): void
    /**
     * It is called when the observable value is modified.
     * @param propertyName - Optional name of the modified property.
     *                       Should be provided when tracking individual properties.
     * */
    onModify(propertyName?: string): void
}

/** @internal */
export class ObservableHandler implements Observable {
    private static handlers: WeakMap<Object, ObservableHandler> | undefined = undefined

    private parents = new Set<ObservableHandler>()
    private children = new Map<ObservableHandler, number>()

    private readonly observables = new Set<Observable>()
    private _modified = false

    readonly observed: boolean
    constructor(parent?: ObservableHandler, observed: boolean = false) {
        this.observed = observed
        if (parent) this.addParent(parent)
    }

    onAccess(propertyName?: string): void {
        if (this.observables.size > 0) {
            const it = this.observables.keys()
            while (true) {
                const result = it.next()
                if (result.done) break
                result.value?.onAccess(propertyName)
            }
        }
    }

    onModify(propertyName?: string): void {
        const set = new Set<ObservableHandler>()
        this.collect(true, set)
        set.forEach((handler: ObservableHandler) => {
            handler._modified = true
            if (handler.observables.size > 0) {
                const it = handler.observables.keys()
                while (true) {
                    const result = it.next()
                    if (result.done) break
                    result.value?.onModify(propertyName)
                }
            }
        })
    }

    static dropModified<Value>(value: Value): boolean {
        const handler = ObservableHandler.findIfObject(value)
        if (handler === undefined) return false
        const result = handler._modified
        handler._modified = false
        return result
    }

    /** Adds the specified `observable` to the handler corresponding to the given `value`. */
    static attach<Value>(value: Value, observable: Observable): void {
        const handler = ObservableHandler.findIfObject(value)
        if (handler) handler.observables.add(observable)
    }

    /** Deletes the specified `observable` from the handler corresponding to the given `value`. */
    static detach<Value>(value: Value, observable: Observable): void {
        const handler = ObservableHandler.findIfObject(value)
        if (handler) handler.observables.delete(observable)
    }

    /** @returns the handler corresponding to the given `value` if it was installed */
    private static findIfObject<Value>(value: Value): ObservableHandler | undefined {
        const handlers = ObservableHandler.handlers
        return handlers !== undefined && value instanceof Object ? handlers.get(getObservableTarget(value as Object)) : undefined
    }

    /**
     * @param value - any non-null object including arrays
     * @returns an observable handler or `undefined` if it is not installed
     */
    static find(value: Object): ObservableHandler | undefined {
        const handlers = ObservableHandler.handlers
        return handlers ? handlers.get(getObservableTarget(value)) : undefined
    }

    /**
     * @param value - any non-null object including arrays
     * @param observable - a handler to install on this object
     * @throws an error if observable handler cannot be installed
     */
    static installOn(value: Object, observable?: ObservableHandler): void {
        let handlers = ObservableHandler.handlers
        if (handlers === undefined) {
            handlers = new WeakMap<Object, ObservableHandler>()
            ObservableHandler.handlers = handlers
        }
        observable
            ? handlers.set(getObservableTarget(value), observable)
            : handlers.delete(getObservableTarget(value))
    }

    addParent(parent: ObservableHandler) {
        const count = parent.children.get(this) ?? 0
        parent.children.set(this, count + 1)
        this.parents.add(parent)
    }

    hasChild(child: ObservableHandler): boolean {
        return this.children.has(child)
    }

    removeParent(parent: ObservableHandler) {
        const count = parent.children.get(this) ?? 0
        if (count > 1) {
            parent.children.set(this, count - 1)
        }
        else if (count == 1) {
            parent.children.delete(this)
            this.parents.delete(parent)
        }
    }

    removeChild<Value>(value: Value) {
        const child = ObservableHandler.findIfObject(value)
        if (child) child.removeParent(this)
    }

    private collect(all: boolean, guards: Set<ObservableHandler>) {
        if (guards.has(this)) return guards // already collected
        guards.add(this) // handler is already guarded
        this.parents.forEach((handler: ObservableHandler) => { handler.collect(all, guards) })
        if (all) this.children.forEach((_count: number, handler: ObservableHandler) => { handler.collect(all, guards) })
        return guards
    }

    static contains(observable: ObservableHandler, guards?: Set<ObservableHandler>) {
        if (observable.observed) return true
        if (guards === undefined) guards = new Set<ObservableHandler>() // create if needed
        else if (guards!.has(observable)) return false // already checked
        guards.add(observable) // handler is already guarded
        for (const it of observable.parents.keys()) {
            if (ObservableHandler.contains(it, guards)) return true
        }
        return false
    }
}

/** @internal */
export function observableProxyArray<Value>(...value: Value[]): Array<Value> {
    return observableProxy(Array.of<Value>(...value))
}

/** @internal */
export function observableProxy<Value>(value: Value, parent?: ObservableHandler, observed?: boolean, strict: boolean = true): Value {
    if (value instanceof ObservableHandler) return value as Value // do not proxy a marker itself
    if (value == null || !(value instanceof Object)) return value as Value // only non-null object can be observable
    const observable = ObservableHandler.find(value as Object)
    if (observable) {
        if (parent) {
            if (strict) observable.addParent(parent)
            if (observed === undefined) observed = ObservableHandler.contains(parent)
        }
        if (observed) {
            if (value instanceof Array) {
                for (let index = 0; index < value.length; index++) {
                    value[index] = observableProxy(value[index], observable, observed, false)
                }
            } else {
                // Improve: proxy fields of the given object
            }
        }
        return value as Value
    }
    if (value instanceof Array) {
        return ObservableArray(value, parent, observed) as Value
    } else if (value instanceof Map) {
        return ObservableMap(value, parent, observed) as Value
    } else if (value instanceof Set) {
        return ObservableSet(value, parent, observed) as Value
    } else if (value instanceof Date) {
        return ObservableDate(value, parent, observed) as Value
    }

    // Improve: Fatal error on using proxy with generic types
    // see: panda issue #26492

    const valueType = Type.of(value)
    if (valueType instanceof ClassType && !(value instanceof BaseEnum)) {
        const isObservable = isObservedV1Class(value as Object)
        if (!hasTrackableProperties(value as Object) && !isObservable) {
            return value as Value
        }
        if (valueType.hasEmptyConstructor()) {
            const result = proxy.Proxy.create(value as Object, new CustomProxyHandler<Object>(isObservable)) as Value
            ObservableHandler.installOn(result as Object, new ObservableHandler(parent))
            return result
        } else {
            throw new Error(`Class '${valueType.getName()}' must contain a default constructor`)
        }
    }
    return value as Value
}

class CustomProxyHandler<T extends Object> extends proxy.DefaultProxyHandler<T> {
    private readonly isObservable: boolean

    constructor(isObservable: boolean) {
        super();
        this.isObservable = isObservable
    }

    override get(target: T, name: string): Any {
        const value = super.get(target, name)
        const targetHandler = ObservableHandler.find(target)
        if (targetHandler && this.isObservable) {
            const valueHandler = ObservableHandler.find(value as Object)
            if (valueHandler && !targetHandler.hasChild(valueHandler)) {
                valueHandler.addParent(targetHandler)
            }
        }
        targetHandler?.onAccess(name)
        return value
    }

    override set(target: T, name: string, value: Any): boolean {
        const observable = ObservableHandler.find(target)
        if (observable) {
            observable.onModify(name)
            observable.removeChild(super.get(target, name))
            value = observableProxy(value, observable, ObservableHandler.contains(observable))
        }
        const result = super.set(target, name, value)
        observable?.onModify(name)
        return result
    }
}

function proxyChildrenOnly<T>(array: T[], parent: ObservableHandler, observed?: boolean) {
    for (let i = 0; i < array.length; i++) {
        if (observed === undefined) observed = ObservableHandler.contains(parent)
        array[i] = observableProxy(array[i], parent, observed)
    }
}

class ObservableArray<T> extends Array<T> {
    static $_invoke<T>(array: Array<T>, parent?: ObservableHandler, observed?: boolean): Array<T> {
        return new ObservableArray<T>(array, parent, observed);
    }

    constructor(array: Array<T>, parent?: ObservableHandler, observed?: boolean) {
        super(array.length)
        const handler = new ObservableHandler(parent)
        for (let i = 0; i < array.length; i++) {
            if (observed === undefined) observed = ObservableHandler.contains(handler)
            super.$_set(i, observableProxy(array[i], handler, observed))
        }
        ObservableHandler.installOn(this, handler)
    }

    private get handler(): ObservableHandler | undefined {
        return ObservableHandler.find(this)
    }

    override get length(): int {
        this.handler?.onAccess()
        return super.length
    }

    override set length(length: int) {
        super.length = length
        this.handler?.onModify()
    }

    override at(index: int): T | undefined {
        this.handler?.onAccess()
        return super.at(index)
    }

    override $_get(index: int): T {
        this.handler?.onAccess()
        return super.$_get(index)
    }

    override $_set(index: int, value: T): void {
        const handler = this.handler
        if (handler) {
            handler.removeChild(super.$_get(index))
            value = observableProxy(value, handler)
        }
        super.$_set(index, value)
        handler?.onModify()
    }

    override copyWithin(target: int, start: int, end: int): this {
        super.copyWithin(target, start, end)
        this.handler?.onModify()
        return this
    }

    override fill(value: T, start: int, end: int): this {
        const handler = this.handler
        if (handler) {
            value = observableProxy(value, handler)
        }
        super.fill(value, start, end)
        handler?.onModify()
        return this
    }

    override pop(): T | undefined {
        const handler = this.handler
        const result = super.pop()
        handler?.onModify()
        if (result) {
            handler?.removeChild(result)
        }
        return result
    }

    override pushArray(...items: T[]): number {
        const handler = this.handler
        if (handler) {
            proxyChildrenOnly(items, handler)
        }
        const result = super.pushArray(...items)
        handler?.onModify()
        return result
    }

    override pushOne(value: T): number {
        const handler = this.handler
        if (handler) {
            value = observableProxy(value, handler)
        }
        const result = super.pushOne(value)
        handler?.onModify()
        return result
    }

    override pushECMA(...items: T[]): number {
        const handler = this.handler
        if (handler) {
            proxyChildrenOnly(items, handler)
        }
        const result = super.pushECMA(...items)
        handler?.onModify()
        return result
    }

    override reverse(): this {
        super.reverse()
        this.handler?.onModify()
        return this
    }

    override shift(): T | undefined {
        const handler = this.handler
        const result = super.shift()
        if (result) handler?.removeChild(result)
        handler?.onModify()
        return result
    }

    override sort(comparator?: (a: T, b: T) => number): this {
        super.sort(comparator)
        this.handler?.onModify()
        return this
    }

    override splice(index: int, count: int, ...items: T[]): Array<T> {
        const handler = this.handler
        if (handler) {
            proxyChildrenOnly(items, handler)
            const result = super.splice(index, count, ...items)
            for (let i = 0; i < result.length; i++) {
                handler.removeChild(result[i])
            }
            handler.onModify()
            return result
        }
        return super.splice(index, count, ...items)
    }

    override unshift(...items: T[]): number {
        const handler = this.handler
        if (handler) {
            proxyChildrenOnly(items, handler)
        }
        const result = super.unshift(...items)
        handler?.onModify()
        return result
    }

    override keys(): IterableIterator<Number> {
        this.handler?.onAccess()
        return super.keys()
    }

    // === methods with uncompatible implementation ===

    override filter(predicate: (value: T, index: number, array: Array<T>) => boolean): Array<T> {
        this.handler?.onAccess()
        return super.filter(predicate)
    }

    override flat<U>(depth: int): Array<U> {
        this.handler?.onAccess()
        return super.flat<U>(depth)
    }

    override flatMap<U>(fn: (v: T, k: number, arr: Array<T>) => U): Array<U> {
        this.handler?.onAccess()
        return super.flatMap<U>(fn)
    }

    // === methods common among all arrays ===

    override concat(...items: FixedArray<ConcatArray<T>>): Array<T> {
        this.handler?.onAccess()
        return super.concat(...items)
    }

    override find(predicate: (value: T, index: number, array: Array<T>) => boolean): T | undefined {
        this.handler?.onAccess()
        return super.find(predicate)
    }

    override findIndex(predicate: (value: T, index: number, array: Array<T>) => boolean): number {
        this.handler?.onAccess()
        return super.findIndex(predicate)
    }

    override findLast(predicate: (elem: T, index: number, array: Array<T>) => boolean): T | undefined {
        this.handler?.onAccess()
        return super.findLast(predicate)
    }

    override every(predicate: (value: T, index: number, array: Array<T>) => boolean): boolean {
        this.handler?.onAccess()
        return super.every(predicate)
    }

    override some(predicate: (value: T, index: number, array: Array<T>) => boolean): boolean {
        this.handler?.onAccess()
        return super.some(predicate)
    }

    override findLastIndex(predicate: (element: T, index: number, array: Array<T>) => boolean): number {
        this.handler?.onAccess()
        return super.findLastIndex(predicate)
    }

    override reduce(callbackfn: (previousValue: T, currentValue: T, index: number, array: Array<T>) => T): T {
        this.handler?.onAccess()
        return super.reduce(callbackfn)
    }

    override reduce<U = T>(callbackfn: (previousValue: U, currentValue: T, index: number, array: Array<T>) => U, initialValue: U): U {
        this.handler?.onAccess()
        return super.reduce<U>(callbackfn, initialValue)
    }

    override reduceRight(callbackfn: (previousValue: T, currentValue: T, index: number, array: Array<T>) => T): T {
        this.handler?.onAccess()
        return super.reduceRight(callbackfn)
    }

    override reduceRight<U>(callbackfn: (previousValue: U, currentValue: T, index: number, array: Array<T>) => U, initialValue: U): U {
        this.handler?.onAccess()
        return super.reduceRight<U>(callbackfn, initialValue)
    }

    override forEach(callbackfn: (value: T, index: number, array: Array<T>) => void): void {
        this.handler?.onAccess()
        super.forEach(callbackfn)
    }

    override slice(start: int, end: int): Array<T> {
        this.handler?.onAccess()
        return super.slice(start, end)
    }

    override lastIndexOf(searchElement: T, fromIndex?: int): int {
        this.handler?.onAccess()
        return super.lastIndexOf(searchElement, fromIndex)
    }

    override join(sep?: String): string {
        this.handler?.onAccess()
        return super.join(sep)
    }

    override toLocaleString(): string {
        this.handler?.onAccess()
        return super.toLocaleString()
    }

    override toSpliced(start: int, delete: int, ...items: FixedArray<T>): Array<T> {
        this.handler?.onAccess()
        return super.toSpliced(start, delete, ...items)
    }

    override includes(val: T, fromIndex?: Number): boolean {
        this.handler?.onAccess()
        return super.includes(val, fromIndex)
    }

    override indexOf(val: T, fromIndex?: int): int {
        this.handler?.onAccess()
        return super.indexOf(val, fromIndex)
    }

    override toSorted(): Array<T> {
        this.handler?.onAccess()
        return super.toSorted()
    }

    override toSorted(comparator: (a: T, b: T) => number): Array<T> {
        this.handler?.onAccess()
        return super.toSorted(comparator)
    }

    override toReversed(): Array<T> {
        this.handler?.onAccess()
        return super.toReversed()
    }

    override with(index: int, value: T): Array<T> {
        this.handler?.onAccess()
        return super.with(index, value)
    }

    override values(): IterableIterator<T> {
        this.handler?.onAccess()
        return super.values()
    }

    override entries(): IterableIterator<[number, T]> {
        this.handler?.onAccess()
        return super.entries()
    }

    override map<U>(callbackfn: (value: T, index: number, array: Array<T>) => U): Array<U> {
        this.handler?.onAccess()
        return super.map<U>(callbackfn)
    }
}

class ObservableMap<T, V> extends Map<T, V> {
    static $_invoke<T, V>(data: Map<T, V>, parent?: ObservableHandler, observed?: boolean): Map<T, V> {
        return new ObservableMap<T, V>(data, parent, observed);
    }

    constructor(data: Map<T, V>, parent?: ObservableHandler, observed?: boolean) {
        super()
        const handler = new ObservableHandler(parent)
        for (let item: [T, V] of data.entries()) {
            if (observed === undefined) observed = ObservableHandler.contains(handler)
            super.set(item[0], observableProxy(item[1], handler, observed))
        }
        ObservableHandler.installOn(this, handler)
    }

    private get handler(): ObservableHandler | undefined {
        return ObservableHandler.find(this)
    }

    override get size(): int {
        this.handler?.onAccess()
        return super.size
    }

    override has(key: T): boolean {
        this.handler?.onAccess()
        return super.has(key)
    }

    override get(key: T): V | undefined {
        this.handler?.onAccess()
        return super.get(key)
    }

    override set(key: T, value: V): this {
        const handler = this.handler
        if (handler) {
            const prev = super.get(key)
            if (prev) handler.removeChild(prev)
            value = observableProxy(value, handler)
        }
        super.set(key, value)
        handler?.onModify()
        return this
    }

    override delete(key: T): boolean {
        const handler = this.handler
        if (handler) {
            const value = super.get(key)
            if (value) handler.removeChild(value)
        }
        const result = super.delete(key)
        handler?.onModify()
        return result
    }

    override clear() {
        const handler = this.handler
        if (handler) {
            for (let value of super.values()) {
                handler!.removeChild(value)
            }
        }
        super.clear()
        handler?.onModify()
    }

    override keys(): IterableIterator<T> {
        this.handler?.onAccess()
        return super.keys()
    }

    override values(): IterableIterator<V> {
        this.handler?.onAccess()
        return super.values()
    }

    override $_iterator(): IterableIterator<[T, V]> {
        this.handler?.onAccess()
        return super.$_iterator()
    }

    override entries(): IterableIterator<[T, V]> {
        this.handler?.onAccess()
        return super.entries()
    }

    override forEach(callbackfn: (value: V, key: T, map: Map<T, V>) => void) {
        this.handler?.onAccess()
        super.forEach(callbackfn)
    }

    override toString(): string {
        this.handler?.onAccess()
        return super.toString()
    }
}

class ObservableSet<T> extends Set<T> {
    private readonly elements: Map<T, T>

    static $_invoke<T>(data: Set<T>, parent?: ObservableHandler, observed?: boolean): Set<T> {
        return new ObservableSet<T>(data, parent, observed);
    }

    constructor(data: Set<T>, parent?: ObservableHandler, observed?: boolean) {
        this.elements = new Map<T, T>()
        const handler = new ObservableHandler(parent)
        for (let item of data.values()) {
            if (observed === undefined) observed = ObservableHandler.contains(handler)
            this.elements.set(item, observableProxy(item, handler, observed))
        }
        ObservableHandler.installOn(this, handler)
    }

    private get handler(): ObservableHandler | undefined {
        return ObservableHandler.find(this)
    }

    override toString(): string {
        return new Set<T>(this.elements.keys()).toString()
    }

    override get size(): int {
        this.handler?.onAccess()
        return this.elements.size
    }

    override has(value: T): boolean {
        this.handler?.onAccess()
        return this.elements.has(value)
    }

    override add(value: T): this {
        const handler = this.handler
        let observable = value
        let modified = !this.elements.has(value)
        if (handler) {
            const prev = this.elements.get(value)
            if (prev) handler.removeChild(prev)
            observable = observableProxy(value)
        }
        this.elements.set(value, observable)
        if (modified) handler?.onModify()
        return this
    }

    override delete(value: T): boolean {
        const handler = this.handler
        if (handler) {
            const prev = this.elements.get(value)
            if (prev) handler.removeChild(prev)
        }
        const result = this.elements.delete(value)
        handler?.onModify()
        return result
    }

    override clear() {
        const handler = this.handler
        if (handler) {
            for (let value of this.elements.values()) {
                handler!.removeChild(value)
            }
        }
        this.elements.clear()
        handler?.onModify()
    }

    override keys(): IterableIterator<T> {
        return this.values()
    }

    override values(): IterableIterator<T> {
        this.handler?.onAccess()
        return this.elements.values()
    }

    override $_iterator(): IterableIterator<T> {
        return this.values()
    }

    override entries(): IterableIterator<[T, T]> {
        this.handler?.onAccess()
        return new MappingIterator<T, [T, T]>(this.elements.values(), (item) => [item, item])
    }

    override forEach(callbackfn: (value: T, key: T, set: Set<T>) => void) {
        this.handler?.onAccess()
        const it = this.elements.values()
        while (true) {
            const item = it.next()
            if (item.done) return
            callbackfn(item.value as T, item.value as T, this)
        }
    }
}

class MappingIterator<T, V> implements IterableIterator<V> {
    private it: IterableIterator<T>
    private mapper: (value: T) => V

    constructor(it: IterableIterator<T>, fn: (value: T) => V) {
        this.it = it
        this.mapper = fn
    }

    override next(): IteratorResult<V> {
        const item = this.it.next()
        if (item.done) return new IteratorResult<V>()
        return new IteratorResult<V>(this.mapper(item.value as T))
    }

    override $_iterator(): IterableIterator<V> {
        return this
    }
}

class ObservableDate extends Date {
    static $_invoke(value: Date, parent?: ObservableHandler, observed?: boolean): Date {
        return new ObservableDate(value, parent, observed);
    }

    constructor(value: Date, parent?: ObservableHandler, observed?: boolean) {
        super(value)
        const handler = new ObservableHandler(parent)
        ObservableHandler.installOn(this, handler)
    }

    private get handler(): ObservableHandler | undefined {
        return ObservableHandler.find(this)
    }

    override isDateValid(): boolean {
        this.handler?.onAccess()
        return super.isDateValid()
    }

    override valueOf(): number {
        this.handler?.onAccess()
        return super.valueOf()
    }

    override toLocaleTimeString(): string {
        this.handler?.onAccess()
        return super.toLocaleTimeString()
    }

    override toLocaleString(): string {
        this.handler?.onAccess()
        return super.toLocaleString()
    }

    override toLocaleDateString(): string {
        this.handler?.onAccess()
        return super.toLocaleDateString()
    }

    override toISOString(): string {
        this.handler?.onAccess()
        return super.toISOString()
    }

    override toTimeString(): string {
        this.handler?.onAccess()
        return super.toTimeString()
    }

    override toDateString(): string {
        this.handler?.onAccess()
        return super.toDateString()
    }

    override toString(): string {
        this.handler?.onAccess()
        return super.toString()
    }

    override toUTCString(): string {
        this.handler?.onAccess()
        return super.toUTCString()
    }

    override getDate(): number {
        this.handler?.onAccess()
        return super.getDate()
    }

    override setDate(value: byte) {
        super.setDate(value)
        this.handler?.onModify()
    }

    override setDate(value: number): number {
        const result = super.setDate(value)
        this.handler?.onModify()
        return result
    }

    override getUTCDate(): number {
        this.handler?.onAccess()
        return super.getUTCDate()
    }

    override setUTCDate(value: byte) {
        super.setUTCDate(value)
        this.handler?.onModify()
    }

    override setUTCDate(value: number): number {
        const result = super.setUTCDate(value)
        this.handler?.onModify()
        return result
    }

    override getDay(): number {
        this.handler?.onAccess()
        return super.getDay()
    }

    override setDay(value: byte) {
        super.setDay(value)
        this.handler?.onModify()
    }

    override getUTCDay(): number {
        this.handler?.onAccess()
        return super.getUTCDay()
    }

    override setUTCDay(value: byte) {
        super.setUTCDay(value)
        this.handler?.onModify()
    }

    override setUTCDay(value: number): number {
        const result = super.setUTCDay(value)
        this.handler?.onModify()
        return result
    }

    override getMonth(): number {
        this.handler?.onAccess()
        return super.getMonth()
    }

    override setMonth(value: int) {
        super.setMonth(value)
        this.handler?.onModify()
    }

    override setMonth(value: number, date?: number): number {
        const result = super.setMonth(value, date)
        this.handler?.onModify()
        return result
    }

    override getUTCMonth(): number {
        this.handler?.onAccess()
        return super.getUTCMonth()
    }

    override setUTCMonth(value: int) {
        super.setUTCMonth(value)
        this.handler?.onModify()
    }

    override setUTCMonth(value: number, date?: number): number {
        const result = super.setUTCMonth(value, date)
        this.handler?.onModify()
        return result
    }

    override getYear(): int {
        this.handler?.onAccess()
        return super.getYear()
    }

    override setYear(value: int) {
        super.setYear(value)
        this.handler?.onModify()
    }

    override setYear(value: number) {
        super.setYear(value)
        this.handler?.onModify()
    }

    override getFullYear(): number {
        this.handler?.onAccess()
        return super.getFullYear()
    }

    override setFullYear(value: number, month?: number, date?: number): number {
        const result = super.setFullYear(value, month, date)
        this.handler?.onModify()
        return result
    }

    override setFullYear(value: int) {
        super.setFullYear(value)
        this.handler?.onModify()
    }

    override getUTCFullYear(): number {
        this.handler?.onAccess()
        return super.getUTCFullYear()
    }

    override setUTCFullYear(value: number, month?: number, date?: number): number {
        const result = super.setUTCFullYear(value, month, date)
        this.handler?.onModify()
        return result
    }

    override setUTCFullYear(value: int) {
        super.setUTCFullYear(value)
        this.handler?.onModify()
    }

    override getTime(): number {
        this.handler?.onAccess()
        return super.getTime()
    }

    override setTime(value: long) {
        super.setTime(value)
        this.handler?.onModify()
    }

    override setTime(value: number): number {
        const result = super.setTime(value)
        this.handler?.onModify()
        return result
    }

    override getHours(): number {
        this.handler?.onAccess()
        return super.getHours()
    }

    override setHours(value: number, min?: number, sec?: number, ms?: number): number {
        const result = super.setHours(value, min, sec, ms)
        this.handler?.onModify()
        return result
    }

    override setHours(value: byte) {
        super.setHours(value)
        this.handler?.onModify()
    }

    override getUTCHours(): number {
        this.handler?.onAccess()
        return super.getUTCHours()
    }

    override setUTCHours(value: number, min?: number, sec?: number, ms?: number): number {
        const result = super.setUTCHours(value, min, sec, ms)
        this.handler?.onModify()
        return result
    }

    override setUTCHours(value: byte) {
        super.setUTCHours(value)
        this.handler?.onModify()
    }

    override getMilliseconds(): number {
        this.handler?.onAccess()
        return super.getMilliseconds()
    }

    override setMilliseconds(value: short) {
        super.setMilliseconds(value)
        this.handler?.onModify()
    }

    override setMilliseconds(value: number): number {
        const result = super.setMilliseconds(value)
        this.handler?.onModify()
        return result
    }

    override getUTCMilliseconds(): number {
        this.handler?.onAccess()
        return super.getUTCMilliseconds()
    }

    override setUTCMilliseconds(value: short) {
        super.setUTCMilliseconds(value)
        this.handler?.onModify()
    }

    override setUTCMilliseconds(value: number): number {
        const result = super.setUTCMilliseconds(value)
        this.handler?.onModify()
        return result
    }

    override getSeconds(): number {
        this.handler?.onAccess()
        return super.getSeconds()
    }

    override setSeconds(value: byte) {
        super.setSeconds(value)
        this.handler?.onModify()
    }

    override setSeconds(value: number, ms?: number): number {
        const result = super.setSeconds(value, ms)
        this.handler?.onModify()
        return result
    }

    override getUTCSeconds(): number {
        this.handler?.onAccess()
        return super.getUTCSeconds()
    }

    override setUTCSeconds(value: byte) {
        super.setUTCSeconds(value)
        this.handler?.onModify()
    }

    override setUTCSeconds(value: number, ms?: number): number {
        const result = super.setUTCSeconds(value, ms)
        this.handler?.onModify()
        return result
    }

    override getMinutes(): number {
        this.handler?.onAccess()
        return super.getMinutes()
    }

    override setMinutes(value: byte) {
        super.setMinutes(value)
        this.handler?.onModify()
    }

    override setMinutes(value: number, sec?: Number, ms?: number): number {
        const result = super.setMinutes(value, sec, ms)
        this.handler?.onModify()
        return result
    }

    override getUTCMinutes(): number {
        this.handler?.onAccess()
        return super.getUTCMinutes()
    }

    override setUTCMinutes(value: byte) {
        super.setUTCMinutes(value)
        this.handler?.onModify()
    }

    override setUTCMinutes(value: number, sec?: Number, ms?: number): number {
        const result = super.setUTCMinutes(value, sec, ms)
        this.handler?.onModify()
        return result
    }
}

function getClassMetadata<T>(value: T): ClassMetadata | undefined {
    return value instanceof ObservableClass ? value.getClassMetadata() : undefined
}

function isObservedV1Class(value: Object): boolean {
    return getClassMetadata(value)?.isObservedV1(value) ?? false
}

function hasTrackableProperties(value: Object): boolean {
    return getClassMetadata(value)?.hasTrackableProperties() ?? false
}

/**
 * Interface for getting the observability status of a class
 */
export interface ObservableClass {
    getClassMetadata(): ClassMetadata | undefined
}

/**
 * Interface for checking the observed properties of a class
 */
export interface TrackableProperties {
    isTrackable(propertyName: string): boolean
}

/**
 * If value is a class, then returns a list of trackable properties
 * @param value
 */
export function trackableProperties<T>(value: T): TrackableProperties | undefined {
    return getClassMetadata(value)
}

export class ClassMetadata implements TrackableProperties {
    private readonly parent: ClassMetadata | undefined
    private readonly markAsObservedV1: boolean
    private readonly markAsObservedV2: boolean
    private readonly targetClass: Class
    private static readonly metadataPropName = "__classMetadata"

    /**
     * Class property names marked with the @Track or @Trace decorator
     * @private
     */
    private readonly trackableProperties: ReadonlySet<string> | undefined

    /**
     * Contains fields marked with the @Type decorator.
     * The key of the map is the property name and the value is the typename of the corresponding field.
     * @private
     */
    private readonly typedProperties: ReadonlyMap<string, string> | undefined

    constructor(parent: ClassMetadata | undefined,
                markAsObservedV1: boolean,
                markAsObservedV2: boolean,
                trackable: string[] | undefined,
                typed: [string, string][] | undefined) {
        const target = Class.ofCaller()
        if (target == undefined) {
            throw new Error("ClassMetadata must be created in the class context")
        }
        this.targetClass = target!
        this.parent = parent
        this.markAsObservedV1 = markAsObservedV1
        this.markAsObservedV2 = markAsObservedV2
        if (trackable) {
            this.trackableProperties = new Set<string>(trackable)
        }
        if (typed) {
            this.typedProperties = new Map<string, string>(typed)
        }
    }

    isObservedV1(value: Object): boolean {
        return this.markAsObservedV1 && Class.of(value) == this.targetClass
    }

    isObservedV2(value: Object): boolean {
        return this.markAsObservedV2 && Class.of(value) == this.targetClass
    }

    isTrackable(propertyName: string): boolean {
        return (this.trackableProperties?.has(propertyName) || this.parent?.isTrackable(propertyName)) ?? false
    }

    hasTrackableProperties(): boolean {
        if (this.trackableProperties) {
            return this.trackableProperties!.size > 0
        }
        return this.parent?.hasTrackableProperties() ?? false
    }

    getTypenameTypeDecorator(propertyName: string): string | undefined {
        if (this.typedProperties) {
            return this.typedProperties?.get(propertyName)
        }
        if (this.parent) {
            return this.parent!.getTypenameTypeDecorator(propertyName)
        }
        return undefined
    }

    static findClassMetadata(type: Type): ClassMetadata | undefined {
        if (type instanceof ClassType) {
            const fieldsNum = type.getFieldsNum()
            for (let i = 0; i < fieldsNum; i++) {
                const field = type.getField(i)
                if (field.isStatic() && field.getName() == ClassMetadata.metadataPropName) {
                    const meta = field.getStaticValue()
                    if (meta != undefined && meta instanceof ClassMetadata) {
                        return meta
                    }
                    break
                }
            }
        }
        return undefined
    }
}
