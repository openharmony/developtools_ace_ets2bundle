import { float32 } from "@koalaui/compat";
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