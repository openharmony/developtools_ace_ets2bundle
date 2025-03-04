import { int32 } from "@koalaui/common";
export declare enum Access {
    READ = 1,
    WRITE = 2,
    READWRITE = 3
}
export declare function isRead(access: Access): number;
export declare function isWrite(access: Access): number;
export type Exec<P, R> = (pointer: P) => R;
export type ExecWithLength<P, R> = (pointer: P, length: int32) => R;
export type TypedArray = Uint8Array | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array | Float32Array | Float64Array;
export type PtrArray = Uint32Array | BigUint64Array;
//# sourceMappingURL=arrays.d.ts.map