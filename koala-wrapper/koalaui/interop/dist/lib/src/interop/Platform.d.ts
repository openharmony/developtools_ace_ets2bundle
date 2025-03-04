import { int32 } from "@koalaui/common";
import { Wrapper } from "./Wrapper";
import { KPointer } from "./InteropTypes";
export declare abstract class NativeStringBase extends Wrapper {
    constructor(ptr: KPointer);
    protected abstract bytesLength(): int32;
    protected abstract getData(data: Uint8Array): void;
    toString(): string;
    abstract close(): void;
}
export declare abstract class ArrayDecoder<T> {
    abstract getArraySize(blob: KPointer): int32;
    abstract disposeArray(blob: KPointer): void;
    abstract getArrayElement(blob: KPointer, index: int32): T;
    decode(blob: KPointer): Array<T>;
}
export interface CallbackRegistry {
    registerCallback(callback: any, obj: any): KPointer;
}
export interface PlatformDefinedData {
    nativeString(ptr: KPointer): NativeStringBase;
    nativeStringArrayDecoder(): ArrayDecoder<NativeStringBase>;
    callbackRegistry(): CallbackRegistry | undefined;
}
export declare function providePlatformDefinedData(platformDataParam: PlatformDefinedData): void;
export declare function withStringResult(ptr: KPointer): string | undefined;
export declare function withStringArrayResult(ptr: KPointer): Array<string>;
//# sourceMappingURL=Platform.d.ts.map