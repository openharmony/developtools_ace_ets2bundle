import { Finalizable } from "./Finalizable";
import { pointer } from "./InteropTypes";
export declare class NativeString extends Finalizable {
    constructor(ptr: pointer);
    static Make(value: string): NativeString;
    toString(): string;
}
//# sourceMappingURL=NativeString.d.ts.map