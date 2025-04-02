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