export interface Thunk {
    clean(): void;
}
export declare function finalizerRegister(target: object, thunk: object): void;
export declare function finalizerUnregister(target: object): void;
//# sourceMappingURL=finalization.d.ts.map