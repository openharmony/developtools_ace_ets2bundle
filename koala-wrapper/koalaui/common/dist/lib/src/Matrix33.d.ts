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