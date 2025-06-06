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

import { float32 } from "#koalaui/compat";
export declare class Point {
    coordinates: Float32Array;
    constructor(x: float32, y: float32);
    get x(): float32;
    get y(): float32;
    offsetXY(dx: float32, dy: float32): Point;
    offset(vec: Point): Point;
    scale(scale: float32): Point;
    scaleXY(sx: float32, sy: float32): Point;
    static ZERO: Point;
    toArray(): Float32Array;
    static flattenArray(points: Array<Point>): Float32Array;
    static fromArray(points: Float32Array): Array<Point>;
}
//# sourceMappingURL=Point.d.ts.map