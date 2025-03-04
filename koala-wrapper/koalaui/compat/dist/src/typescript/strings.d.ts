import { int32 } from "./types";
interface SystemTextEncoder {
    encode(input?: string): Uint8Array;
    encodeInto(src: string, dest: Uint8Array): void;
}
interface WithStreamOption {
    stream?: boolean | undefined;
}
interface SystemTextDecoder {
    decode(input?: ArrayBuffer | null, options?: WithStreamOption): string;
}
export declare class CustomTextEncoder {
    static readonly HeaderLen: int32;
    constructor(encoder?: SystemTextEncoder | undefined);
    private readonly encoder;
    static stringLength(input: string): int32;
    encodedLength(input: string): int32;
    private addLength;
    static getHeaderLength(array: Uint8Array, offset?: int32): int32;
    encode(input: string | undefined, addLength?: boolean): Uint8Array;
    encodeArray(strings: Array<string>): Uint8Array;
    encodeInto(input: string, result: Uint8Array, position: int32): Uint8Array;
}
export declare class CustomTextDecoder {
    static cpArrayMaxSize: number;
    constructor(decoder?: SystemTextDecoder | undefined);
    private readonly decoder;
    decode(input: Uint8Array): string;
}
export {};
//# sourceMappingURL=strings.d.ts.map