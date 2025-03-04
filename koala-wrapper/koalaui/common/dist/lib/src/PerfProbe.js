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
exports.getMainPerfProbe = exports.enterMainPerfProbe = void 0;
const compat_1 = require("@koalaui/compat");
/**
 * Creates a {@link MainPerfProbe} instance with the {@link name} and enters its main probe.
 *
 * If a {@link MainPerfProbe} with this {@link name} already exists then it is canceled and the new one is created.
 *
 * Exit it with {@link MainPerfProbe.exit}.
 */
function enterMainPerfProbe(name) {
    return new MainPerfProbeImpl(name);
}
exports.enterMainPerfProbe = enterMainPerfProbe;
/**
 * Returns {@link MainPerfProbe} instance with the {@link name} if it exists,
 * otherwise a dummy instance.
 *
 * @see MainPerfProbe.dummy
 */
function getMainPerfProbe(name) {
    const instance = MainPerfProbeImpl.mainProbes.get(name);
    return instance ? instance : MainPerfProbeImpl.DUMMY;
}
exports.getMainPerfProbe = getMainPerfProbe;
class DummyPerfProbe {
    get name() { return "dummy"; }
    get dummy() { return true; }
    exit(log) { }
    cancel() { }
    get canceled() { return false; }
    enterProbe(name) { return PerfProbeImpl.DUMMY; }
    exitProbe(name) { return PerfProbeImpl.DUMMY; }
    getProbe(name) { return PerfProbeImpl.DUMMY; }
    //performProbe: <T>(_: string, func: () => T) => func(),
    performProbe(name, func) { return func(); }
    probePerformed(_) { return false; }
    get userData() {
        return undefined;
    }
    set userData(_) { }
}
class PerfProbeImpl {
    constructor(name, main, parent, remainder = false) {
        this.children = new Array();
        this.childrenSorted = false;
        this.index = 0;
        this.startTime = 0.0;
        this.totalTime = 0.0;
        this.callCount = 0;
        this.currentRecursionDepth = 0;
        this.recursiveCallCount = 0;
        this._canceled = false;
        this._name = name;
        this._main = main;
        this.parent = parent;
        this.remainder = remainder;
    }
    get name() {
        return this._name;
    }
    get dummy() {
        return false;
    }
    get main() {
        return this._main;
    }
    get performing() {
        return this.startTime > 0;
    }
    get userData() {
        return this._userData;
    }
    set userData(value) {
        this._userData = value;
    }
    exit(log) {
        if (this.canceled)
            return;
        if (this.currentRecursionDepth == 0) {
            this.totalTime += (0, compat_1.timeNow)() - this.startTime;
            this.startTime = 0;
        }
        else {
            this.currentRecursionDepth--;
        }
        if (!this.performing) {
            this.main.pop(this);
        }
        if (log)
            this.log();
    }
    cancel(cancelChildren = true) {
        this._canceled = true;
        if (cancelChildren)
            this.maybeCancelChildren();
    }
    maybeCancelChildren() {
        MainPerfProbeImpl.visit(this, false, (probe, depth) => {
            if (probe.performing)
                probe.cancel(false);
        });
    }
    get canceled() {
        return this._canceled;
    }
    toString() {
        if (this.canceled) {
            return `[${this.name}] canceled`;
        }
        if (this.performing) {
            return `[${this.name}] still performing...`;
        }
        const mainProbe = this.main.probes.get(this.main.name);
        const percentage = mainProbe.totalTime > 0 ? Math.round((100 / mainProbe.totalTime) * this.totalTime) : 0;
        let result = `[${this.name}] call count: ${this.callCount}`
            + ` | recursive call count: ${this.recursiveCallCount}`
            + ` | time: ${this.totalTime}ms ${percentage}%`;
        if (this.userData) {
            result += ` | user data: ${this.userData}`;
        }
        return result;
    }
    log(prefix) {
        console.log(prefix ? `${prefix}${this.toString()}` : this.toString());
    }
}
PerfProbeImpl.DUMMY = new DummyPerfProbe();
class MainPerfProbeImpl extends PerfProbeImpl {
    constructor(name) {
        super(name);
        this.probes = new Map();
        const prev = MainPerfProbeImpl.mainProbes.get(name);
        if (prev)
            prev.cancel();
        MainPerfProbeImpl.mainProbes.set(name, this);
        this.currentProbe = this.enterProbe(name);
    }
    createProbe(name) {
        const probes = name == this.name ? this : new PerfProbeImpl(name, this);
        this.push(probes);
        return probes;
    }
    get main() {
        return this;
    }
    push(probe) {
        probe.parent = this.currentProbe;
        probe.index = probe.parent ? probe.parent.children.length : 0;
        if (probe.parent)
            probe.parent.children.push(probe);
        this.currentProbe = probe;
    }
    pop(probe) {
        if (probe.parent) {
            this.currentProbe = probe.parent;
        }
    }
    performProbe(name, func) {
        const probe = this.enterProbe(name);
        try {
            return func();
        }
        finally {
            probe.exit();
        }
    }
    enterProbe(name) {
        let probe = this.probes.get(name);
        if (!probe) {
            probe = this.createProbe(name);
            this.probes.set(name, probe);
        }
        probe._canceled = false;
        if (probe.performing) {
            probe.recursiveCallCount++;
            probe.currentRecursionDepth++;
        }
        else {
            probe.startTime = (0, compat_1.timeNow)();
            probe.callCount++;
        }
        return probe;
    }
    exitProbe(name) {
        const probe = this.getProbe(name);
        probe.exit(undefined);
        return probe;
    }
    getProbe(name) {
        const probe = this.probes.get(name);
        return probe !== undefined ? probe : PerfProbeImpl.DUMMY;
    }
    probePerformed(name) {
        const probe = this.probes.get(name);
        return probe != undefined && !probe.performing && !probe.canceled;
    }
    exit(log) {
        super.exit();
        if (log)
            this.log();
        this.cancel();
    }
    cancel() {
        MainPerfProbeImpl.mainProbes.delete(this.name);
    }
    static visit(root, logging, apply) {
        let current = root;
        let index = 0;
        let depth = 0;
        let visiting = true;
        while (true) {
            if (visiting) {
                current.index = 0;
                apply(current, depth);
            }
            if (index >= current.children.length) {
                if (!current.parent) {
                    break;
                }
                current = current.parent;
                index = ++current.index;
                depth--;
                visiting = false;
                continue;
            }
            visiting = true;
            if (logging && !current.childrenSorted) {
                current.childrenSorted = true;
                current.children = current.children.sort((p1, p2) => p2.totalTime - p1.totalTime);
                if (depth == 0) {
                    // a special probe to log the time remained
                    current.children.push(new PerfProbeImpl("<remainder>", root.main, current, true));
                }
            }
            current = current.children[index];
            index = 0;
            depth++;
        }
    }
    log(prefix) {
        prefix = prefix !== undefined ? `${prefix}: ` : "";
        console.log(`${prefix}perf probes:`);
        MainPerfProbeImpl.visit(this.main, true, (probe, depth) => {
            let indent = "\t";
            for (let i = 0; i < depth; i++)
                indent += "\t";
            if (probe.remainder) {
                const parentTime = probe.parent.totalTime;
                let childrenTime = 0;
                probe.parent.children.forEach((a) => { childrenTime += a.totalTime; });
                probe.totalTime = Math.max(0, parentTime - childrenTime);
                const percentage = parentTime > 0 ? Math.round((100 / parentTime) * probe.totalTime) : 0;
                console.log(`${prefix}${indent}[${probe.name}] time: ${(0, compat_1.numberToFixed)(probe.totalTime, 2)}ms ${percentage}%`);
            }
            else {
                console.log(`${prefix}${indent}${probe.toString()}`);
            }
        });
    }
}
MainPerfProbeImpl.mainProbes = new Map();
MainPerfProbeImpl.DUMMY = new DummyPerfProbe();
//# sourceMappingURL=PerfProbe.js.map