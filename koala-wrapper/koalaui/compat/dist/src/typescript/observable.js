"use strict";
/*
 * Copyright (c) 2022-2024 Huawei Device Co., Ltd.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.observableProxy = exports.observableProxyArray = exports.ObservableHandler = exports.Observed = exports.getObservableTarget = void 0;
const OBSERVABLE_TARGET = "__proxy_observable_target__";
function getObservableTarget(proxy) {
    var _a;
    return (_a = getPropertyValue(OBSERVABLE_TARGET, proxy)) !== null && _a !== void 0 ? _a : proxy;
}
exports.getObservableTarget = getObservableTarget;
function getPropertyValue(name, object) {
    return object[name];
}
/**
 * Data class decorator that makes all child fields trackable.
 */
function Observed(constructorFunction) {
    constructorFunction.prototype[OBSERVED] = true;
}
exports.Observed = Observed;
const OBSERVED = "__ObservedByArkUI__";
function isObserved(value) {
    return value[OBSERVED] === true;
}
/** @internal */
class ObservableHandler {
    constructor(parent, observed = false) {
        this.parents = new Set();
        this.children = new Map();
        this.observables = new Set();
        this._modified = false;
        this.observed = observed;
        if (parent)
            this.addParent(parent);
    }
    onAccess() {
        var _a;
        if (this.observables.size > 0) {
            const it = this.observables.keys();
            while (true) {
                const result = it.next();
                if (result.done)
                    break;
                (_a = result.value) === null || _a === void 0 ? void 0 : _a.onAccess();
            }
        }
    }
    onModify() {
        const set = new Set();
        this.collect(true, set);
        set.forEach((handler) => {
            var _a;
            handler._modified = true;
            if (handler.observables.size > 0) {
                const it = handler.observables.keys();
                while (true) {
                    const result = it.next();
                    if (result.done)
                        break;
                    (_a = result.value) === null || _a === void 0 ? void 0 : _a.onModify();
                }
            }
        });
    }
    static dropModified(value) {
        const handler = ObservableHandler.findIfObject(value);
        if (handler === undefined)
            return false;
        const result = handler._modified;
        handler._modified = false;
        return result;
    }
    /** Adds the specified `observable` to the handler corresponding to the given `value`. */
    static attach(value, observable) {
        const handler = ObservableHandler.findIfObject(value);
        if (handler)
            handler.observables.add(observable);
    }
    /** Deletes the specified `observable` from the handler corresponding to the given `value`. */
    static detach(value, observable) {
        const handler = ObservableHandler.findIfObject(value);
        if (handler)
            handler.observables.delete(observable);
    }
    /** @returns the handler corresponding to the given `value` if it was installed */
    static findIfObject(value) {
        const handlers = ObservableHandler.handlers;
        return handlers !== undefined && value instanceof Object ? handlers.get(getObservableTarget(value)) : undefined;
    }
    /**
     * @param value - any non-null object including arrays
     * @returns an observable handler or `undefined` if it is not installed
     */
    static find(value) {
        const handlers = ObservableHandler.handlers;
        return handlers ? handlers.get(getObservableTarget(value)) : undefined;
    }
    /**
     * @param value - any non-null object including arrays
     * @param observable - a handler to install on this object
     * @throws an error if observable handler cannot be installed
     */
    static installOn(value, observable) {
        let handlers = ObservableHandler.handlers;
        if (handlers === undefined) {
            handlers = new WeakMap();
            ObservableHandler.handlers = handlers;
        }
        observable
            ? handlers.set(getObservableTarget(value), observable)
            : handlers.delete(getObservableTarget(value));
    }
    addParent(parent) {
        var _a;
        const count = (_a = parent.children.get(this)) !== null && _a !== void 0 ? _a : 0;
        parent.children.set(this, count + 1);
        this.parents.add(parent);
    }
    removeParent(parent) {
        var _a;
        const count = (_a = parent.children.get(this)) !== null && _a !== void 0 ? _a : 0;
        if (count > 1) {
            parent.children.set(this, count - 1);
        }
        else if (count == 1) {
            parent.children.delete(this);
            this.parents.delete(parent);
        }
    }
    removeChild(value) {
        const child = ObservableHandler.findIfObject(value);
        if (child)
            child.removeParent(this);
    }
    collect(all, guards = new Set()) {
        if (guards.has(this))
            return guards; // already collected
        guards.add(this); // handler is already guarded
        this.parents.forEach(handler => handler.collect(all, guards));
        if (all)
            this.children.forEach((_count, handler) => handler.collect(all, guards));
        return guards;
    }
    static contains(observable, guards) {
        if (observable.observed)
            return true;
        if (guards === undefined)
            guards = new Set(); // create if needed
        else if (guards.has(observable))
            return false; // already checked
        guards.add(observable); // handler is already guarded
        for (const it of observable.parents.keys()) {
            if (ObservableHandler.contains(it, guards))
                return true;
        }
        return false;
    }
}
exports.ObservableHandler = ObservableHandler;
ObservableHandler.handlers = undefined;
/** @internal */
function observableProxyArray(...value) {
    return observableProxy(value);
}
exports.observableProxyArray = observableProxyArray;
/** @internal */
function observableProxy(value, parent, observed, strict = true) {
    if (value instanceof ObservableHandler)
        return value; // do not proxy a marker itself
    if (value === null || !(value instanceof Object))
        return value; // only non-null object can be observable
    const observable = ObservableHandler.find(value);
    if (observable) {
        if (parent) {
            if (strict)
                observable.addParent(parent);
            if (observed === undefined)
                observed = ObservableHandler.contains(parent);
        }
        if (observed) {
            if (Array.isArray(value)) {
                for (let index = 0; index < value.length; index++) {
                    value[index] = observableProxy(value[index], observable, observed, false);
                }
            }
            else {
                proxyFields(value, false, observable);
            }
        }
        return value;
    }
    if (Array.isArray(value)) {
        const handler = new ObservableHandler(parent);
        const array = proxyChildrenOnly(value, handler, observed);
        copyWithinObservable(array);
        fillObservable(array);
        popObservable(array);
        pushObservable(array);
        reverseObservable(array);
        shiftObservable(array);
        sortObservable(array);
        spliceObservable(array);
        unshiftObservable(array);
        return proxyObject(array, handler);
    }
    if (value instanceof Date) {
        const valueAsAny = value;
        const handler = new ObservableHandler(parent);
        const setMethods = new Set([
            "setFullYear", "setMonth", "setDate", "setHours", "setMinutes", "setSeconds",
            "setMilliseconds", "setTime", "setUTCFullYear", "setUTCMonth", "setUTCDate",
            "setUTCHours", "setUTCMinutes", "setUTCSeconds", "setUTCMilliseconds"
        ]);
        setMethods.forEach((method) => {
            const originalMethod = method + 'Original';
            if (valueAsAny[originalMethod] !== undefined) {
                return;
            }
            valueAsAny[originalMethod] = valueAsAny[method];
            valueAsAny[method] = function (...args) {
                var _a;
                (_a = ObservableHandler.find(this)) === null || _a === void 0 ? void 0 : _a.onModify();
                return this[originalMethod](...args);
            };
        });
        return proxyObject(value, handler);
    }
    // TODO: support set/map
    const handler = new ObservableHandler(parent, isObserved(value));
    if (handler.observed || observed)
        proxyFields(value, true, handler);
    return proxyObject(value, handler);
}
exports.observableProxy = observableProxy;
function proxyObject(value, observable) {
    ObservableHandler.installOn(value, observable);
    return new Proxy(value, {
        get(target, property, receiver) {
            var _a;
            if (property == OBSERVABLE_TARGET)
                return target;
            const value = Reflect.get(target, property, receiver);
            (_a = ObservableHandler.find(target)) === null || _a === void 0 ? void 0 : _a.onAccess();
            return typeof value == "function"
                ? value.bind(target)
                : value;
        },
        set(target, property, value, receiver) {
            const old = Reflect.get(target, property, receiver);
            if (value === old)
                return true;
            const observable = ObservableHandler.find(target);
            if (observable) {
                observable.onModify();
                observable.removeChild(old);
                const observed = ObservableHandler.contains(observable);
                if (observed || Array.isArray(target)) {
                    value = observableProxy(value, observable, observed);
                }
            }
            return Reflect.set(target, property, value, receiver);
        },
        deleteProperty(target, property) {
            var _a;
            (_a = ObservableHandler.find(target)) === null || _a === void 0 ? void 0 : _a.onModify();
            delete target[property];
            return true;
        },
    });
}
function proxyFields(value, strict, parent) {
    for (const name of Object.getOwnPropertyNames(value)) {
        const descriptor = Object.getOwnPropertyDescriptor(value, name);
        if (descriptor === null || descriptor === void 0 ? void 0 : descriptor.writable)
            value[name] = observableProxy(value[name], parent, true, strict);
    }
}
function proxyChildrenOnly(array, parent, observed) {
    if (observed === undefined)
        observed = ObservableHandler.contains(parent);
    return array.map(it => observableProxy(it, parent, observed));
}
function copyWithinObservable(array) {
    if (array.copyWithinOriginal === undefined) {
        array.copyWithinOriginal = array.copyWithin;
        array.copyWithin = function (target, start, end) {
            const observable = ObservableHandler.find(this);
            observable === null || observable === void 0 ? void 0 : observable.onModify();
            return this.copyWithinOriginal(target, start, end);
        };
    }
}
function fillObservable(array) {
    if (array.fillOriginal === undefined) {
        array.fillOriginal = array.fill;
        array.fill = function (value, start, end) {
            const observable = ObservableHandler.find(this);
            observable === null || observable === void 0 ? void 0 : observable.onModify();
            if (observable)
                value = observableProxy(value, observable);
            return this.fillOriginal(value, start, end);
        };
    }
}
function popObservable(array) {
    if (array.popOriginal === undefined) {
        array.popOriginal = array.pop;
        array.pop = function (...args) {
            const observable = ObservableHandler.find(this);
            observable === null || observable === void 0 ? void 0 : observable.onModify();
            const result = this.popOriginal(...args);
            if (observable)
                observable.removeChild(result);
            return result;
        };
    }
}
function pushObservable(array) {
    if (array.pushOriginal === undefined) {
        array.pushOriginal = array.push;
        array.push = function (...args) {
            const observable = ObservableHandler.find(this);
            observable === null || observable === void 0 ? void 0 : observable.onModify();
            if (observable)
                args = proxyChildrenOnly(args, observable);
            return this.pushOriginal(...args);
        };
    }
}
function reverseObservable(array) {
    if (array.reverseOriginal === undefined) {
        array.reverseOriginal = array.reverse;
        array.reverse = function () {
            const observable = ObservableHandler.find(this);
            observable === null || observable === void 0 ? void 0 : observable.onModify();
            return this.reverseOriginal();
        };
    }
}
function shiftObservable(array) {
    if (array.shiftOriginal === undefined) {
        array.shiftOriginal = array.shift;
        array.shift = function (...args) {
            const observable = ObservableHandler.find(this);
            observable === null || observable === void 0 ? void 0 : observable.onModify();
            const result = this.shiftOriginal(...args);
            if (observable)
                observable.removeChild(result);
            return result;
        };
    }
}
function sortObservable(array) {
    if (array.sortOriginal === undefined) {
        array.sortOriginal = array.sort;
        array.sort = function (compareFn) {
            const observable = ObservableHandler.find(this);
            observable === null || observable === void 0 ? void 0 : observable.onModify();
            return this.sortOriginal(compareFn);
        };
    }
}
function spliceObservable(array) {
    if (array.spliceOriginal === undefined) {
        array.spliceOriginal = array.splice;
        array.splice = function (start, deleteCount, ...items) {
            const observable = ObservableHandler.find(this);
            observable === null || observable === void 0 ? void 0 : observable.onModify();
            if (observable)
                items = proxyChildrenOnly(items, observable);
            if (deleteCount === undefined)
                deleteCount = array.length;
            const result = this.spliceOriginal(start, deleteCount, ...items);
            if (observable && Array.isArray(result)) {
                result.forEach(it => observable.removeChild(it));
            }
            return result;
        };
    }
}
function unshiftObservable(array) {
    if (array.unshiftOriginal === undefined) {
        array.unshiftOriginal = array.unshift;
        array.unshift = function (...items) {
            const observable = ObservableHandler.find(this);
            observable === null || observable === void 0 ? void 0 : observable.onModify();
            if (observable)
                items = proxyChildrenOnly(items, observable);
            return this.unshiftOriginal(...items);
        };
    }
}
//# sourceMappingURL=observable.js.map