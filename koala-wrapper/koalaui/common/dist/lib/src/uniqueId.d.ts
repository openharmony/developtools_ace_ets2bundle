import { int32 } from "@koalaui/compat";
export declare class UniqueId {
    private sha;
    addString(data: string): UniqueId;
    addI32(data: int32): UniqueId;
    addF32Array(data: Float32Array): UniqueId;
    addI32Array(data: Int32Array): UniqueId;
    addU32Array(data: Uint32Array): UniqueId;
    addU8Array(data: Uint8Array): UniqueId;
    addPtr(data: Uint32Array | number): UniqueId;
    compute(): string;
}
//# sourceMappingURL=uniqueId.d.ts.map