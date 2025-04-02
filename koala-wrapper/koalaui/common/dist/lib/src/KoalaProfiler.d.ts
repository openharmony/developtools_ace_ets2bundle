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

import { int32 } from "#koalaui/compat";
export declare class KoalaProfiler {
    private static readonly map;
    static nodeCreated(nodeType: int32, node: Object): void;
    static nodeDisposed(nodeType: int32, node: Object): void;
    static counters: KoalaProfiler | undefined;
    private invalidations;
    private computes;
    private builds;
    private nodes;
    private realDraws;
    private cachedDraws;
    private measures;
    private layouts;
    private frames;
    private lastTime;
    private lastFPS;
    private updateEnterTime;
    private updateExitTime;
    private updateTime;
    private buildEnterTime;
    private buildExitTime;
    private buildTime;
    private layoutEnterTime;
    private layoutExitTime;
    private layoutTime;
    private drawEnterTime;
    private drawExitTime;
    private drawTime;
    private updatableStates;
    private mutableStates;
    private computableValues;
    static enable(): void;
    static disable(): void;
    static enabled(): boolean;
    reset(): void;
    report(): void;
    getReport(): string;
    invalidation(): void;
    compute(): void;
    build(): void;
    node(): void;
    realDraw(): void;
    cachedDraw(): void;
    layout(): void;
    measure(): void;
    frame(ms: number): void;
    buildRootEnter(): void;
    buildRootExit(): void;
    layoutEnter(): void;
    layoutExit(): void;
    drawEnter(): void;
    drawExit(): void;
    updateSnapshotEnter(): void;
    updateSnapshotExit(): void;
    updateSnapshot(modified: int32, all?: int32): void;
}
//# sourceMappingURL=KoalaProfiler.d.ts.map