"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomDeserializer = exports.DeserializerBase = void 0;
/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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
const common_1 = require("@koalaui/common");
const SerializerBase_1 = require("./SerializerBase");
const InteropNativeModule_1 = require("./InteropNativeModule");
class DeserializerBase {
    static registerCustomDeserializer(deserializer) {
        let current = DeserializerBase.customDeserializers;
        if (current == undefined) {
            DeserializerBase.customDeserializers = deserializer;
        }
        else {
            while (current.next != undefined) {
                current = current.next;
            }
            current.next = deserializer;
        }
    }
    constructor(buffer, length) {
        this.position = 0;
        this.buffer = buffer;
        this.length = length;
        this.view = new DataView(this.buffer);
    }
    static get(factory, args, length) {
        // TBD: Use cache
        return factory(args, length);
    }
    asArray(position, length) {
        return new Uint8Array(this.buffer, position, length);
    }
    currentPosition() {
        return this.position;
    }
    resetCurrentPosition() {
        this.position = 0;
    }
    checkCapacity(value) {
        if (value > this.length) {
            throw new Error(`${value} is less than remaining buffer length`);
        }
    }
    readInt8() {
        this.checkCapacity(1);
        const value = this.view.getInt8(this.position);
        this.position += 1;
        return value;
    }
    readInt32() {
        this.checkCapacity(4);
        const value = this.view.getInt32(this.position, true);
        this.position += 4;
        return value;
    }
    readInt64() {
        this.checkCapacity(8);
        const value = this.view.getBigInt64(this.position, true);
        this.position += 8;
        return Number(value);
    }
    readPointer() {
        this.checkCapacity(8);
        const value = this.view.getBigInt64(this.position, true);
        this.position += 8;
        return value;
    }
    readFloat32() {
        this.checkCapacity(4);
        const value = this.view.getFloat32(this.position, true);
        this.position += 4;
        return value;
    }
    readBoolean() {
        this.checkCapacity(1);
        const value = this.view.getInt8(this.position);
        this.position += 1;
        return value == 1;
    }
    readFunction() {
        // TODO: not exactly correct.
        const id = this.readInt32();
        return id;
    }
    readMaterialized() {
        const ptr = this.readPointer();
        return { ptr: ptr };
    }
    readString() {
        const length = this.readInt32();
        this.checkCapacity(length);
        // read without null-terminated byte
        const value = DeserializerBase.textDecoder.decode(this.asArray(this.position, length - 1));
        this.position += length;
        return value;
    }
    readCustomObject(kind) {
        let current = DeserializerBase.customDeserializers;
        while (current) {
            if (current.supports(kind)) {
                return current.deserialize(this, kind);
            }
            current = current.next;
        }
        // consume tag
        const tag = this.readInt8();
        return undefined;
    }
    readNumber() {
        const tag = this.readInt8();
        switch (tag) {
            case SerializerBase_1.Tags.UNDEFINED:
                return undefined;
            case SerializerBase_1.Tags.INT32:
                return this.readInt32();
            case SerializerBase_1.Tags.FLOAT32:
                return this.readFloat32();
            default:
                throw new Error(`Unknown number tag: ${tag}`);
                break;
        }
    }
    readCallbackResource() {
        return {
            resourceId: this.readInt32(),
            hold: this.readPointer(),
            release: this.readPointer(),
        };
    }
    static lengthUnitFromInt(unit) {
        let suffix;
        switch (unit) {
            case 0:
                suffix = "px";
                break;
            case 1:
                suffix = "vp";
                break;
            case 3:
                suffix = "%";
                break;
            case 4:
                suffix = "lpx";
                break;
            default:
                suffix = "<unknown>";
        }
        return suffix;
    }
    readBuffer() {
        const resource = this.readCallbackResource();
        const data = this.readPointer();
        const length = this.readInt64();
        return InteropNativeModule_1.InteropNativeModule._MaterializeBuffer(data, length, resource.resourceId, resource.hold, resource.release);
    }
}
exports.DeserializerBase = DeserializerBase;
DeserializerBase.textDecoder = new common_1.CustomTextDecoder();
DeserializerBase.customDeserializers = undefined;
class CustomDeserializer {
    constructor(supported) {
        this.supported = supported;
        this.next = undefined;
    }
    supports(kind) {
        return this.supported.includes(kind);
    }
}
exports.CustomDeserializer = CustomDeserializer;
class DateDeserializer extends CustomDeserializer {
    constructor() {
        super(["Date"]);
    }
    deserialize(serializer, kind) {
        return new Date(serializer.readString());
    }
}
DeserializerBase.registerCustomDeserializer(new DateDeserializer());
//# sourceMappingURL=DeserializerBase.js.map