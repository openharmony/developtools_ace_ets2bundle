"use strict";
/*
 * Copyright (c) 2022-2023 Huawei Device Co., Ltd.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KoalaProfiler = void 0;
/**
 * Adds statistics for constructing/disposing of the TreeNode instances.
 * It is disabled by default because collecting such data affects performance.
 */
const DEBUG_WITH_NODE_STATS = false;
class KoalaProfiler {
    constructor() {
        this.invalidations = 0;
        this.computes = 0;
        this.builds = 0;
        this.nodes = 0;
        this.realDraws = 0;
        this.cachedDraws = 0;
        this.measures = 0;
        this.layouts = 0;
        this.frames = 0;
        this.lastTime = 0.0;
        this.lastFPS = 0;
        this.updateEnterTime = 0.0;
        this.updateExitTime = 0.0;
        this.updateTime = 0.0;
        this.buildEnterTime = 0.0;
        this.buildExitTime = 0.0;
        this.buildTime = 0.0;
        this.layoutEnterTime = 0.0;
        this.layoutExitTime = 0.0;
        this.layoutTime = 0.0;
        this.drawEnterTime = 0.0;
        this.drawExitTime = 0.0;
        this.drawTime = 0.0;
        this.updatableStates = 0;
        this.mutableStates = 0;
        this.computableValues = 0;
    }
    static nodeCreated(nodeType, node) {
        if (KoalaProfiler.map === undefined)
            return;
        let set = KoalaProfiler.map.get(nodeType);
        if (set === undefined) {
            set = new Set();
            KoalaProfiler.map.set(nodeType, set);
        }
        set.add(node);
    }
    static nodeDisposed(nodeType, node) {
        if (KoalaProfiler.map === undefined)
            return;
        let set = KoalaProfiler.map.get(nodeType);
        if (set === undefined)
            throw new Error("node never existed");
        if (!set.delete(node))
            console.log("node is already disposed");
    }
    static enable() {
        KoalaProfiler.counters = new KoalaProfiler();
    }
    static disable() {
        KoalaProfiler.counters = undefined;
    }
    static enabled() {
        return KoalaProfiler.counters != undefined;
    }
    reset() {
        this.invalidations = 0;
        this.computes = 0;
        this.builds = 0;
        this.nodes = 0;
        this.realDraws = 0;
        this.cachedDraws = 0;
        this.layouts = 0;
        this.measures = 0;
        this.updateEnterTime = 0;
        this.updateExitTime = 0;
        this.updatableStates = 0;
        this.mutableStates = 0;
        this.computableValues = 0;
    }
    report() {
        console.log(this.getReport());
    }
    getReport() {
        var _a;
        const updateTime = Math.round(1000 * (this.updateExitTime - this.updateEnterTime));
        const buildTime = Math.round(1000 * (this.buildExitTime - this.buildEnterTime));
        const layoutTime = Math.round(1000 * (this.layoutExitTime - this.layoutEnterTime));
        const drawTime = Math.round(1000 * (this.drawExitTime - this.drawEnterTime));
        if (this.updateTime < updateTime)
            this.updateTime = updateTime;
        if (this.buildTime < buildTime)
            this.buildTime = buildTime;
        if (this.layoutTime < layoutTime)
            this.layoutTime = layoutTime;
        if (this.drawTime < drawTime)
            this.drawTime = drawTime;
        // TODO: OHOS does not properly handle \n in template literals
        const array = Array.of(`invalidations: ${this.invalidations}`, `modified states: ${this.mutableStates}/${this.updatableStates} + ${this.computableValues}`, `update states (mks): ${this.updateTime} / ${updateTime}`, `build root node (mks): ${this.buildTime} / ${buildTime}`, `layout view (mks): ${this.layoutTime} / ${layoutTime}`, `draw view (mks): ${this.drawTime} / ${drawTime}`, `computes: ${this.computes}`, `builds: ${this.builds}`, `nodes: ${this.nodes}`, `realDraws: ${this.realDraws}`, `cachedDraws: ${this.cachedDraws}`, `measures: ${this.measures}`, `layouts: ${this.layouts}`, `FPS: ${this.lastFPS}`);
        (_a = KoalaProfiler.map) === null || _a === void 0 ? void 0 : _a.forEach((set, kind) => {
            if (set.size > 0)
                array.push(kind + ":" + set.size);
        });
        return array.join("\n");
    }
    invalidation() { this.invalidations++; }
    compute() { this.computes++; }
    build() { this.builds++; }
    node() { this.nodes++; }
    realDraw() { this.realDraws++; }
    cachedDraw() { this.cachedDraws++; }
    layout() { this.layouts++; }
    measure() { this.measures++; }
    frame(ms) {
        if (ms - this.lastTime <= 1000) {
            this.frames++;
        }
        else {
            this.lastFPS = Math.round(this.frames * 1000 / (ms - this.lastTime));
            this.frames = 1;
            this.lastTime = ms;
        }
    }
    buildRootEnter() {
        this.buildEnterTime = Date.now();
    }
    buildRootExit() {
        this.buildExitTime = Date.now();
    }
    layoutEnter() {
        this.layoutEnterTime = Date.now();
    }
    layoutExit() {
        this.layoutExitTime = Date.now();
    }
    drawEnter() {
        this.drawEnterTime = Date.now();
    }
    drawExit() {
        this.drawExitTime = Date.now();
    }
    updateSnapshotEnter() {
        this.updateEnterTime = Date.now();
    }
    updateSnapshotExit() {
        this.updateExitTime = Date.now();
    }
    updateSnapshot(modified, all) {
        if (all === undefined) {
            this.computableValues = modified - this.mutableStates;
        }
        else {
            this.mutableStates = modified;
            this.updatableStates = all;
        }
    }
}
exports.KoalaProfiler = KoalaProfiler;
KoalaProfiler.map = DEBUG_WITH_NODE_STATS
    ? new Map()
    : undefined;
KoalaProfiler.counters = undefined;
//# sourceMappingURL=KoalaProfiler.js.map