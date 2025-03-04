import { float32 } from "@koalaui/compat";
export declare class Point3 {
    x: float32;
    y: float32;
    z: float32;
    constructor(x: float32, y: float32, z: float32);
    subtract(value: Point3): Point3;
    cross(value: Point3): Point3;
    normalize(): Point3;
}
//# sourceMappingURL=Point3.d.ts.map