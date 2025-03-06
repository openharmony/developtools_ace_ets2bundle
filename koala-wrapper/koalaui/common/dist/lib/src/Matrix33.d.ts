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

import { float32 } from "@koalaui/compat";
export declare function mat33(array?: Float32Array): Matrix33;
export declare class Matrix33 {
    readonly array: Float32Array;
    constructor(array?: Float32Array);
    static zero(): Matrix33;
    static makeTranslate(dx: float32, dy: float32): Matrix33;
    static makeScale(dx: float32, dy?: float32): Matrix33;
    static makeRotate(degrees: float32, pivotX?: float32, pivotY?: float32): Matrix33;
    static makeSkew(sx: float32, sy: float32): Matrix33;
    makeConcat(rhs: Matrix33): Matrix33;
    makeTranspose(): Matrix33;
}
//# sourceMappingURL=Matrix33.d.ts.map