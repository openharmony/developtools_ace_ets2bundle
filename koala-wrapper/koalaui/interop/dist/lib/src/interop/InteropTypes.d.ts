import { int32, int64, float32, float64 } from "@koalaui/common";
export type KStringPtr = int32 | string | null;
export type KStringArrayPtr = int32 | Uint8Array | null;
export type KInt32ArrayPtr = int32 | Int32Array | null;
export type KFloat32ArrayPtr = int32 | Float32Array | null;
export type KUint8ArrayPtr = int32 | Uint8Array | null;
export type KInt = int32;
export type KUInt = int32;
export type KLong = int64;
export type KFloat = float32;
export type KDouble = float64;
export type KBoolean = int32;
export type KPointer = number | bigint;
export type pointer = KPointer;
export type KNativePointer = KPointer;
export type KInteropReturnBuffer = Uint8Array;
//# sourceMappingURL=InteropTypes.d.ts.map