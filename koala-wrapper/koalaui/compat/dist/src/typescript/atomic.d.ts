/**
 * A reference that may be updated atomically.
 */
export declare class AtomicRef<Value> {
    value: Value;
    /**
     * Creates a new reference object with the given initial value.
     * @param value - the new value
     */
    constructor(value: Value);
    /**
     * Atomically sets the reference value to the given value and returns the previous one.
     * @param value - the new value
     * @returns the previous value
     */
    getAndSet(value: Value): Value;
}
//# sourceMappingURL=atomic.d.ts.map