"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Point = void 0;
class Point {
    constructor(x, y) {
        this.coordinates = new Float32Array(2);
        this.coordinates[0] = x;
        this.coordinates[1] = y;
    }
    get x() {
        return this.coordinates[0];
    }
    get y() {
        return this.coordinates[1];
    }
    offsetXY(dx, dy) {
        return new Point(this.x + dx, this.y + dy);
    }
    offset(vec) {
        return this.offsetXY(vec.x, vec.y);
    }
    scale(scale) {
        return this.scaleXY(scale, scale);
    }
    scaleXY(sx, sy) {
        return new Point(this.x * sx, this.y * sy);
    }
    toArray() {
        return this.coordinates;
    }
    static flattenArray(points) {
        let array = new Float32Array(points.length * 2);
        for (let i = 0; i < points.length; i++) {
            array[i * 2] = points[i].x;
            array[i * 2 + 1] = points[i].y;
        }
        return array;
    }
    static fromArray(points) {
        if (points.length % 2 != 0)
            throw new Error("Expected " + points.length + " % 2 == 0");
        let array = new Array(points.length / 2);
        for (let i = 0; i < points.length / 2; i++) {
            array[i] = new Point(points[i * 2], points[i * 2 + 1]);
        }
        return array;
    }
}
exports.Point = Point;
Point.ZERO = new Point(0.0, 0.0);
//# sourceMappingURL=Point.js.map