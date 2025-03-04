import { int32 } from "@koalaui/common";
import { KPointer } from "../../interop/InteropTypes";
export declare const nullptr: number;
export declare function isNullPtr(value: KPointer): boolean;
export declare function ptrToString(ptr: KPointer): string;
export declare function isSamePtr(a: KPointer, b: KPointer): boolean;
export declare function ptrToBits(ptr: KPointer): Uint32Array;
export declare function bitsToPtr(array: Int32Array, offset: int32): KPointer;
//# sourceMappingURL=Wrapper.d.ts.map