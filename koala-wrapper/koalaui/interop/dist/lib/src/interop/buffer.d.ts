export declare class KBuffer {
    private readonly _buffer;
    get buffer(): ArrayBuffer;
    get length(): number;
    constructor(length: number);
    set(index: number, value: number): void;
    get(index: number): number;
}
//# sourceMappingURL=buffer.d.ts.map