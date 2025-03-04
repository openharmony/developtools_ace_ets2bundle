/**
 * A probe to measure performance.
 *
 * A probe can measure performance of any activity which has an entry and an exit points.
 * Such activity can be a method call, or a sequence of actions, possibly asynchronous.
 *
 * A probe which has been entered and exited is considered a performed probe (see {@link MainPerfProbe.probePerformed}).
 * A probe can be entered recursively. When all the recursive calls exits the probe becomes a performed probe.
 *
 * All performing probes form a hierarchy which is rooted at the main probe (see {@link enterMainPerfProbe}).
 * A last started probe (see {@link MainPerfProbe.enterProbe}) which has not yet performed becomes a parent
 * for the next started probe. It's the responsibility of the API caller to keep this parent-child relationship valid,
 * that is: a child probe should exit before its parent probe exits.
 *
 * Statistics gathered by a probe:
 * - call count
 * - recursive call count
 * - total time and percentage relative to the main (root) probe
 */
export interface PerfProbe {
    /**
     * The name of the probe.
     */
    readonly name: string;
    /**
     * Whether this is a dummy probe which does not measure (a noop).
     *
     * @see MainPerfProbe.getProbe
     */
    readonly dummy: boolean;
    /**
     * Exists the probe.
     *
     * @param log log the gathered statistics.
     * @see MainPerfProbe.enterProbe
     */
    exit(log: boolean | undefined): void;
    /**
     * Cancels measuring the probe and its children probes.
     */
    cancel(): void;
    /**
     * User-defined data associated with the probe.
     */
    userData: string | undefined;
    /**
     * Whether the probe was canceled.
     */
    readonly canceled: boolean;
}
/**
 * The main (root) {@link PerfProbe}.
 *
 * This probe is used to enter the main activity.
 *
 * Calling {@link PerfProbe.cancel} removes the main probe and disposes all its resources.
 *
 * Calling {@link PerfProbe.exit} exits the main probe, cancels it and when the log option is provided
 * logs the gathered statistics.
 *
 * @see enterMainPerfProbe
 * @see getMainPerfProbe
 */
export interface MainPerfProbe extends PerfProbe {
    /**
     * Enters a child probe referenced by the {@link name} and measures it.
     * If the probe does not exist, returns a dummy instance.
     *
     * If the probe already performs a recursive call is counted.
     *
     * @see PerfProbe.exit
     * @see exitProbe
     */
    enterProbe(name: string): PerfProbe;
    /**
     * Exits a child probe referenced by the {@link name}.
     * If the probe does not exist, returns a dummy instance.
     *
     * This is an equivalent of calling {@link getProbe} and then {@link PerfProbe.exit}.
     */
    exitProbe(name: string): PerfProbe;
    /**
     * Returns the child probe referenced by the {@link name} if it exists,
     * otherwise a dummy instance.
     *
     * @see PerfProbe.dummy
     */
    getProbe(name: string): PerfProbe;
    /**
     * Performs the {@link func} of a child probe referenced by the {@link name} and measures it.
     *
     * This is an equivalent of calling {@link enterProbe} and then {@link exitProbe}.
     *
     * If the probe already performs a recursive call is counted.
     */
    performProbe<T>(name: string, func: () => T): T;
    /**
     * Returns true if the probe referenced by the {@link name} has been performed
     * (entered and exited all the recursive calls).
     */
    probePerformed(name: string): boolean;
}
/**
 * Creates a {@link MainPerfProbe} instance with the {@link name} and enters its main probe.
 *
 * If a {@link MainPerfProbe} with this {@link name} already exists then it is canceled and the new one is created.
 *
 * Exit it with {@link MainPerfProbe.exit}.
 */
export declare function enterMainPerfProbe(name: string): MainPerfProbe;
/**
 * Returns {@link MainPerfProbe} instance with the {@link name} if it exists,
 * otherwise a dummy instance.
 *
 * @see MainPerfProbe.dummy
 */
export declare function getMainPerfProbe(name: string): MainPerfProbe;
//# sourceMappingURL=PerfProbe.d.ts.map