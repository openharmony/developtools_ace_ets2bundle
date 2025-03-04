"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.int32BitsFromFloat = exports.float32FromBits = exports.asString = exports.asFloat64 = void 0;
function asFloat64(value) {
    return Number(value);
}
exports.asFloat64 = asFloat64;
function asString(value) {
    return value === null || value === void 0 ? void 0 : value.toString();
}
exports.asString = asString;
function float32FromBits(value) {
    return value;
}
exports.float32FromBits = float32FromBits;
function int32BitsFromFloat(value) {
    return value;
}
exports.int32BitsFromFloat = int32BitsFromFloat;
//# sourceMappingURL=double.js.map