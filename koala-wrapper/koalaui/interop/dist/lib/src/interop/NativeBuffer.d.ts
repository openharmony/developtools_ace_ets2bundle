import { pointer } from './InteropTypes';
import { int32, int64 } from '@koalaui/common';
export declare class NativeBuffer extends ArrayBuffer {
    data: pointer;
    length: int64;
    resourceId: int32;
    hold: pointer;
    release: pointer;
    constructor(data: pointer, length: int64, resourceId: int32, hold: pointer, release: pointer);
    static wrap(data: pointer, length: int64, resourceId: int32, hold: pointer, release: pointer): NativeBuffer;
}
//# sourceMappingURL=NativeBuffer.d.ts.map