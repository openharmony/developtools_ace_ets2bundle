import { Wrapper } from "./Wrapper";
import { Thunk } from "@koalaui/common";
import { pointer } from "./InteropTypes";
export declare class NativeThunk implements Thunk {
    finalizer: pointer;
    obj: pointer;
    name: string | undefined;
    constructor(obj: pointer, finalizer: pointer, name?: string);
    clean(): void;
    destroyNative(ptr: pointer, finalizer: pointer): void;
}
/**
 * Class with the custom finalizer, usually used to release a native peer.
 * Do not use directly, only via subclasses.
 */
export declare class Finalizable extends Wrapper {
    finalizer: pointer;
    cleaner?: NativeThunk;
    managed: boolean;
    constructor(ptr: pointer, finalizer: pointer, managed?: boolean);
    createHandle(): string | undefined;
    makeNativeThunk(ptr: pointer, finalizer: pointer, handle: string | undefined): NativeThunk;
    close(): void;
    release(): pointer;
    resetPeer(pointer: pointer): void;
    use<R>(body: (value: Finalizable) => R): R;
}
//# sourceMappingURL=Finalizable.d.ts.map