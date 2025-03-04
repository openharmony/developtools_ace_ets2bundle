import { int32 } from "@koalaui/common";
export type CallbackType = (args: Uint8Array, length: int32) => int32;
export declare function wrapCallback(callback: CallbackType, autoDisposable?: boolean): int32;
export declare function wrapSystemCallback(id: number, callback: CallbackType): int32;
export declare function disposeCallback(id: int32): void;
export declare function callCallback(id: int32, args: Uint8Array, length: int32): int32;
//# sourceMappingURL=InteropOps.d.ts.map