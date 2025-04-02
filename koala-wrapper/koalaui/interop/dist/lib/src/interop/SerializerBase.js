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
exports.unsafeCast = exports.SerializerBase = exports.CustomSerializer = exports.registerMaterialized = exports.registerCallback = exports.isInstanceOf = exports.isResource = exports.runtimeType = exports.Tags = exports.RuntimeType = void 0;
const InteropOps_1 = require("./InteropOps");
const InteropNativeModule_1 = require("./InteropNativeModule");
const ResourceManager_1 = require("../arkts/ResourceManager");
// imports required interfaces (now generation is disabled)
// import { Resource } from "@arkoala/arkui"
/**
 * Value representing possible JS runtime object type.
 * Must be synced with "enum RuntimeType" in C++.
 */
var RuntimeType;
(function (RuntimeType) {
    RuntimeType[RuntimeType["UNEXPECTED"] = -1] = "UNEXPECTED";
    RuntimeType[RuntimeType["NUMBER"] = 1] = "NUMBER";
    RuntimeType[RuntimeType["STRING"] = 2] = "STRING";
    RuntimeType[RuntimeType["OBJECT"] = 3] = "OBJECT";
    RuntimeType[RuntimeType["BOOLEAN"] = 4] = "BOOLEAN";
    RuntimeType[RuntimeType["UNDEFINED"] = 5] = "UNDEFINED";
    RuntimeType[RuntimeType["BIGINT"] = 6] = "BIGINT";
    RuntimeType[RuntimeType["FUNCTION"] = 7] = "FUNCTION";
    RuntimeType[RuntimeType["SYMBOL"] = 8] = "SYMBOL";
    RuntimeType[RuntimeType["MATERIALIZED"] = 9] = "MATERIALIZED";
})(RuntimeType = exports.RuntimeType || (exports.RuntimeType = {}));
/**
 * Value representing object type in serialized data.
 * Must be synced with "enum Tags" in C++.
 */
var Tags;
(function (Tags) {
    Tags[Tags["UNDEFINED"] = 101] = "UNDEFINED";
    Tags[Tags["INT32"] = 102] = "INT32";
    Tags[Tags["FLOAT32"] = 103] = "FLOAT32";
    Tags[Tags["STRING"] = 104] = "STRING";
    Tags[Tags["LENGTH"] = 105] = "LENGTH";
    Tags[Tags["RESOURCE"] = 106] = "RESOURCE";
    Tags[Tags["OBJECT"] = 107] = "OBJECT";
})(Tags = exports.Tags || (exports.Tags = {}));
function runtimeType(value) {
    let type = typeof value;
    if (type == "number")
        return RuntimeType.NUMBER;
    if (type == "string")
        return RuntimeType.STRING;
    if (type == "undefined")
        return RuntimeType.UNDEFINED;
    if (type == "object")
        return RuntimeType.OBJECT;
    if (type == "boolean")
        return RuntimeType.BOOLEAN;
    if (type == "bigint")
        return RuntimeType.BIGINT;
    if (type == "function")
        return RuntimeType.FUNCTION;
    if (type == "symbol")
        return RuntimeType.SYMBOL;
    throw new Error(`bug: ${value} is ${type}`);
}
exports.runtimeType = runtimeType;
function isResource(value) {
    return value !== undefined
        && typeof value === 'object'
        && value !== null
        && value.hasOwnProperty("bundleName")
        && value.hasOwnProperty("moduleName");
}
exports.isResource = isResource;
// Poor man's instanceof, fails on subclasses
function isInstanceOf(className, value) {
    return (value === null || value === void 0 ? void 0 : value.constructor.name) === className;
}
exports.isInstanceOf = isInstanceOf;
function registerCallback(value) {
    return (0, InteropOps_1.wrapCallback)((args, length) => {
        // TBD: deserialize the callback arguments and call the callback
        return 42;
    });
}
exports.registerCallback = registerCallback;
function registerMaterialized(value) {
    // TODO: fix me!
    return 42;
}
exports.registerMaterialized = registerMaterialized;
/* Serialization extension point */
class CustomSerializer {
    constructor(supported) {
        this.supported = supported;
        this.next = undefined;
    }
    supports(kind) { return this.supported.includes(kind); }
}
exports.CustomSerializer = CustomSerializer;
class SerializerBase {
    static registerCustomSerializer(serializer) {
        if (SerializerBase.customSerializers == undefined) {
            SerializerBase.customSerializers = serializer;
        }
        else {
            let current = SerializerBase.customSerializers;
            while (current.next != undefined) {
                current = current.next;
            }
            current.next = serializer;
        }
    }
    constructor() {
        this.position = 0;
        this.heldResources = [];
        this.buffer = new ArrayBuffer(96);
        this.view = new DataView(this.buffer);
    }
    release() {
        this.releaseResources();
        this.position = 0;
    }
    asArray() {
        return new Uint8Array(this.buffer);
    }
    length() {
        return this.position;
    }
    currentPosition() { return this.position; }
    checkCapacity(value) {
        if (value < 1) {
            throw new Error(`${value} is less than 1`);
        }
        let buffSize = this.buffer.byteLength;
        if (this.position > buffSize - value) {
            const minSize = this.position + value;
            const resizedSize = Math.max(minSize, Math.round(3 * buffSize / 2));
            let resizedBuffer = new ArrayBuffer(resizedSize);
            // TODO: can we grow without new?
            new Uint8Array(resizedBuffer).set(new Uint8Array(this.buffer));
            this.buffer = resizedBuffer;
            this.view = new DataView(resizedBuffer);
        }
    }
    holdAndWriteCallback(callback, hold = 0, release = 0, call = 0, callSync = 0) {
        const resourceId = ResourceManager_1.ResourceHolder.instance().registerAndHold(callback);
        this.heldResources.push(resourceId);
        this.writeInt32(resourceId);
        this.writePointer(hold);
        this.writePointer(release);
        this.writePointer(call);
        this.writePointer(callSync);
        return resourceId;
    }
    holdAndWriteCallbackForPromiseVoid(hold = 0, release = 0, call = 0, callSync = 0) {
        let resourceId;
        const promise = new Promise((resolve, reject) => {
            const callback = (err) => {
                if (err !== undefined)
                    reject(err);
                else
                    resolve();
            };
            resourceId = this.holdAndWriteCallback(callback, hold, release, call, callSync);
        });
        return [promise, resourceId];
    }
    holdAndWriteCallbackForPromise(hold = 0, release = 0, call = 0) {
        let resourceId;
        const promise = new Promise((resolve, reject) => {
            const callback = (value, err) => {
                if (err !== undefined)
                    reject(err);
                else
                    resolve(value);
            };
            resourceId = this.holdAndWriteCallback(callback, hold, release, call);
        });
        return [promise, resourceId];
    }
    writeCallbackResource(resource) {
        this.writeInt32(resource.resourceId);
        this.writePointer(resource.hold);
        this.writePointer(resource.release);
    }
    releaseResources() {
        for (const resourceId of this.heldResources)
            InteropNativeModule_1.InteropNativeModule._ReleaseCallbackResource(resourceId);
        // todo think about effective array clearing/pushing
        this.heldResources = [];
    }
    writeCustomObject(kind, value) {
        let current = SerializerBase.customSerializers;
        while (current) {
            if (current.supports(kind)) {
                current.serialize(this, value, kind);
                return;
            }
            current = current.next;
        }
        console.log(`Unsupported custom serialization for ${kind}, write undefined`);
        this.writeInt8(Tags.UNDEFINED);
    }
    writeNumber(value) {
        this.checkCapacity(5);
        if (value == undefined) {
            this.view.setInt8(this.position, Tags.UNDEFINED);
            this.position++;
            return;
        }
        if (value == Math.round(value)) {
            this.view.setInt8(this.position, Tags.INT32);
            this.view.setInt32(this.position + 1, value, true);
            this.position += 5;
            return;
        }
        this.view.setInt8(this.position, Tags.FLOAT32);
        this.view.setFloat32(this.position + 1, value, true);
        this.position += 5;
    }
    writeInt8(value) {
        this.checkCapacity(1);
        this.view.setInt8(this.position, value);
        this.position += 1;
    }
    writeInt32(value) {
        this.checkCapacity(4);
        this.view.setInt32(this.position, value, true);
        this.position += 4;
    }
    writeInt64(value) {
        this.checkCapacity(8);
        this.view.setBigInt64(this.position, BigInt(value), true);
        this.position += 8;
    }
    writePointer(value) {
        this.checkCapacity(8);
        this.view.setBigInt64(this.position, BigInt(value !== null && value !== void 0 ? value : 0), true);
        this.position += 8;
    }
    writeFloat32(value) {
        this.checkCapacity(4);
        this.view.setFloat32(this.position, value, true);
        this.position += 4;
    }
    writeBoolean(value) {
        this.checkCapacity(1);
        this.view.setInt8(this.position, value == undefined ? RuntimeType.UNDEFINED : +value);
        this.position++;
    }
    writeFunction(value) {
        this.writeInt32(registerCallback(value));
    }
    writeString(value) {
        this.checkCapacity(4 + value.length * 4); // length, data
        let encodedLength = InteropNativeModule_1.InteropNativeModule._ManagedStringWrite(value, new Uint8Array(this.view.buffer, 0), this.position + 4);
        this.view.setInt32(this.position, encodedLength, true);
        this.position += encodedLength + 4;
    }
    writeBuffer(buffer) {
        const resourceId = ResourceManager_1.ResourceHolder.instance().registerAndHold(buffer);
        this.writeCallbackResource({
            resourceId,
            hold: 0,
            release: 0
        });
        const ptr = InteropNativeModule_1.InteropNativeModule._GetNativeBufferPointer(buffer);
        this.writePointer(ptr);
        this.writeInt64(buffer.byteLength);
    }
}
exports.SerializerBase = SerializerBase;
SerializerBase.customSerializers = undefined;
class DateSerializer extends CustomSerializer {
    constructor() {
        super(["Date"]);
    }
    serialize(serializer, value, kind) {
        serializer.writeString(value.toISOString());
    }
}
SerializerBase.registerCustomSerializer(new DateSerializer());
function unsafeCast(value) {
    return value;
}
exports.unsafeCast = unsafeCast;
//# sourceMappingURL=SerializerBase.js.map