"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KBuffer = void 0;
// todo can be removed if passing ArrayBuffer type through interop is possible
class KBuffer {
    get buffer() {
        return this._buffer;
    }
    get length() {
        return this._buffer.length;
    }
    constructor(length) {
        this._buffer = new Uint8Array(length);
    }
    set(index, value) {
        this._buffer[index] = value;
    }
    get(index) {
        return this._buffer[index];
    }
}
exports.KBuffer = KBuffer;
//# sourceMappingURL=buffer.js.map