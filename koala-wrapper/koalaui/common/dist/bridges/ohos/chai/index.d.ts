export interface Assert {
    (expression: any, message?: string): asserts expression;
    /**
     * Asserts non-strict equality (==) of actual and expected.
     */
    equal<T>(actual: T, expected: T, message?: string): void;
    /**
     * Asserts non-strict inequality (!=) of actual and expected.
     */
    notEqual<T>(actual: T, expected: T, message?: string): void;
    /**
     * Asserts strict equality (===) of actual and expected.
     */
    strictEqual<T>(actual: T, expected: T, message?: string): void;
    /**
     * Asserts strict inequality (!==) of actual and expected.
     */
    notStrictEqual<T>(actual: T, expected: T, message?: string): void;
    deepEqual(actual: any, expected: any, message?: string): void;
    notDeepEqual(actual: any, expected: any, message?: string): void;
    isTrue(value: any, message?: string): void;
    isFalse(value: any, message?: string): void;
    closeTo(actual: number, expected: number, delta: number, message?: string): void;
    fail(message?: string): void;
    isNull(value: any, message?: string): void;
    isNotNull(value: any, message?: string): void;
    instanceOf(value: any, constructor: Function, message?: string): void;
    isAtLeast(valueToCheck: number, valueToBeAtLeast: number, message?: string): void;
    exists(value: any, message?: string): void;
    throw(fn: () => void, message?: string): void;
    throws(fn: () => void, message?: string): void;
    isAbove(valueToCheck: number, valueToBeAbove: number, message?: string): void;
    isBelow(valueToCheck: number, valueToBeBelow: number, message?: string): void;
    match(value: string, regexp: RegExp, message?: string): void;
    isDefined(value: any, message?: string): void;
    isUndefined(value: any, message?: string): void;
    isEmpty(object: any, message?: string): void;
    isNotEmpty(object: any, message?: string): void;
}
export declare var assert: Assert;
//# sourceMappingURL=index.d.ts.map