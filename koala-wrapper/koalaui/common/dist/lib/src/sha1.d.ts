import { int32 } from "@koalaui/compat";
export declare function createSha1(): SHA1Hash;
export declare class SHA1Hash {
    private A;
    private B;
    private C;
    private D;
    private E;
    private readonly _byte;
    private readonly _word;
    private _size;
    private _sp;
    constructor();
    updateString(data: string, encoding?: string): SHA1Hash;
    updateInt32(data: int32): SHA1Hash;
    update(data: Int32Array | Float32Array | Uint32Array | Uint8Array): SHA1Hash;
    private _uint8;
    private _utf8;
    private _int32;
    digest(encoding?: string): Uint8Array | string;
    private _hex;
    private _bin;
}
//# sourceMappingURL=sha1.d.ts.map