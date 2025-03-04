import { float32 } from "@koalaui/compat";
import { Matrix33 } from "./Matrix33";
import { Point3 } from "./Point3";
export interface RotateOptions {
    angle?: float32;
    x?: float32;
    y?: float32;
    z?: float32;
    pivotX?: float32;
    pivotY?: float32;
    pivotZ?: float32;
}
export interface ScaleOptions {
    x?: float32;
    y?: float32;
    z?: float32;
    pivotX?: float32;
    pivotY?: float32;
    pivotZ?: float32;
}
export interface TranslateOptions {
    x?: float32;
    y?: float32;
    z?: float32;
}
export declare function mat44(array?: Float32Array): Matrix44;
/**
 * 4x4 matrix with right-handed coordinate system:
 * +x goes to the right
 * +y goes down
 * +z goes into the screen (away from the viewer)
 */
export declare class Matrix44 {
    readonly array: Float32Array;
    constructor(array?: Float32Array);
    static identity(): Matrix44;
    static zero(): Matrix44;
    static lookAt(eye: Point3, center: Point3, up: Point3): Matrix44;
    static perspective(depth: float32): Matrix44;
    static perspectiveFov(fov: float32, near: float32, far: float32): Matrix44;
    /**
     * Returns new matrix, made from Matrix33.
     *
     * @param matrix - 3x3 matrix
     * @returns the new instance of Matrix44
     *
     */
    static makeFromMatrix33(matrix: Matrix33): Matrix44;
    /**
     * Returns new 3x3 matrix, made from this matrix by dropping the third row and the third column.
     *
     * @returns the new instance of Matrix33
     *
     */
    asMatrix33(): Matrix33;
    copy(): Matrix44;
    concat(matrix: Matrix44): Matrix44;
    scale(options: ScaleOptions): Matrix44;
    rotate(options: RotateOptions): Matrix44;
    translate(options: TranslateOptions): Matrix44;
    invert(): Matrix44;
    transpose(): Matrix44;
    skew(x?: float32, y?: float32): Matrix44;
}
//# sourceMappingURL=Matrix44.d.ts.map