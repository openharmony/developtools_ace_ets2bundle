"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.markableQueue = void 0;
const compat_1 = require("@koalaui/compat");
/**
 * Creates a new markable queue to safely process callbacks across several threads or tasks.
 * @param reversed - `true` changes the order of calling callbacks
 */
function markableQueue(reversed = false) {
    return reversed ? new ReversedQueue() : new DefaultQueue();
}
exports.markableQueue = markableQueue;
class DefaultQueue {
    constructor() {
        this.last = new compat_1.AtomicRef(new Block());
        this.first = new compat_1.AtomicRef(this.last.value);
        this.marker = new compat_1.AtomicRef(undefined);
    }
    setMarker() {
        const marker = new Block();
        this.last.getAndSet(marker).next.value = marker;
        this.marker.value = marker;
    }
    addCallback(callback) {
        const block = new Block(callback);
        this.last.getAndSet(block).next.value = block;
    }
    callCallbacks() {
        var _a;
        const marker = this.marker.getAndSet(undefined);
        if (marker) {
            let block = this.first.getAndSet(marker);
            while (block !== marker) {
                (_a = block.callback) === null || _a === void 0 ? void 0 : _a.call(block);
                block = block.next.value;
            }
        }
    }
    clear() {
        this.last.value = this.first.value;
        this.marker.value = undefined;
    }
}
class ReversedQueue {
    constructor() {
        this.last = new compat_1.AtomicRef(undefined);
        this.marker = new compat_1.AtomicRef(undefined);
    }
    setMarker() {
        const marker = new Block();
        marker.next.value = this.last.getAndSet(marker);
        this.marker.value = marker;
    }
    addCallback(callback) {
        const block = new Block(callback);
        block.next.value = this.last.getAndSet(block);
    }
    callCallbacks() {
        var _a, _b;
        const marker = this.marker.getAndSet(undefined);
        if (marker) {
            let block = marker.next.getAndSet(undefined);
            while (block) {
                (_b = (_a = block).callback) === null || _b === void 0 ? void 0 : _b.call(_a);
                block = block.next.value;
            }
        }
    }
    clear() {
        this.last.value = undefined;
        this.marker.value = undefined;
    }
}
class Block {
    constructor(callback) {
        this.next = new compat_1.AtomicRef(undefined);
        this.callback = callback;
    }
}
//# sourceMappingURL=MarkableQueue.js.map