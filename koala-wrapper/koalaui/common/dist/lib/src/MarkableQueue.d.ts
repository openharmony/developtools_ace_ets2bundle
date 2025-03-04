/**
 * A markable queue that allows to accumulate callbacks and to call them to the latest set marker.
 */
export interface MarkableQueue {
    /** Sets the new marker to the queue. */
    setMarker(): void;
    /** Adds the given callback to the queue. */
    addCallback(callback: () => void): void;
    /** Calls all accumulated callbacks to the latest set marker. */
    callCallbacks(): void;
    /** Clears the queue. */
    clear(): void;
}
/**
 * Creates a new markable queue to safely process callbacks across several threads or tasks.
 * @param reversed - `true` changes the order of calling callbacks
 */
export declare function markableQueue(reversed?: boolean): MarkableQueue;
//# sourceMappingURL=MarkableQueue.d.ts.map