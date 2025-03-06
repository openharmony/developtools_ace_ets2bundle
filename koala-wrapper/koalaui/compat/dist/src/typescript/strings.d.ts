/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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