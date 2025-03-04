import { float64 } from "@koalaui/compat";
/**
 * Computes the linear interpolation between `source` and `target` based on `weight`.
 *
 * @param weight - interpolation factor in the range [0..1]
 * @param source - a value corresponding to weight 0
 * @param target - a value corresponding to weight 1
 * @returns interpolated value
 */
export declare function lerp(weight: float64, source: float64, target: float64): float64;
/**
 * Clamps a {@link value} within the specified range.
 *
 * @param value - a value to clamp
 * @param min - the lower boundary of the range
 * @param max - the upper boundary of the range
 * @returns `min` if `value` is less than `min`,
 *          `max` if `value` is greater than `max`,
 *          `value` otherwise
 */
export declare function clamp(value: float64, min: float64, max: float64): float64;
/**
 * Calculates the difference between the argument and
 * the largest (closest to positive infinity) integer value
 * that is less than or equal to the argument.
 *
 * @param value a floating-point value to process
 * @returns a floor modulus of the given value in the range [0..1)
 */
export declare function modulo(value: float64): float64;
/**
 * @param str a string to parse
 * @param name a name for error message
 * @param verify whether to verify parsing validity
 * @returns a floating-point number
 * @throws Error if `str` cannot be parsed
 */
export declare function parseNumber(str: string, name?: string, verify?: boolean): float64;
/**
 * An ArkTS-compliant replacement for {@link isFinite}.
 */
export declare function isFiniteNumber(number: float64): boolean;
export declare function getDistancePx(startX: float64, startY: float64, endX: float64, endY: float64): float64;
//# sourceMappingURL=math.d.ts.map