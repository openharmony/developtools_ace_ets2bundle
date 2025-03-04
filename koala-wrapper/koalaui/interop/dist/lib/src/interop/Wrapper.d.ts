import { KPointer } from "./InteropTypes";
export { isNullPtr, nullptr, ptrToBits, bitsToPtr, isSamePtr, ptrToString } from "#common/wrappers/Wrapper";
/**
 * An object holding reference to the native pointer.
 */
export declare class Wrapper {
    ptr: KPointer;
    constructor(ptr: KPointer);
    toString(): string;
}
export declare function getPtr(value: Wrapper | undefined): KPointer;
export declare function ptrEqual(a: Wrapper | undefined, b: Wrapper | undefined): boolean;
//# sourceMappingURL=Wrapper.d.ts.map