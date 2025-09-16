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

import * as process from 'process';
import { global as localGlobal} from '../static/global';

const BYTES_PER_KIBIBYTE = 1024;

interface MemoryContext {
    startTime: number;
    startMemory: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
        arrayBuffers: number;
    };
}

interface Event {
    name: string,
    startTime: number,
    endTime?: number,
    parentEvent?: string,
    duration?: number
}

function formatTime(ms: number): string {
    const milliseconds = Math.floor(ms % 1000);
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
  
    return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}:${pad(milliseconds, 3)}`;
}

function pad(value: number, length: number): string {
    return value.toString().padStart(length, '0');
}

function round(value: number, index: number = 2): number {
    const factor = Math.pow(10, index);
    return Math.round(value * factor) / factor;
}

export class Performance {
    private static instance: Performance;
    private events: Map<string, Event>;
    private historyEvents = new Map<string | null, Event[]>();
    private scopes: string[];
    private shouldSkip: boolean;
    private totalDuration: number;
    private memoryContexts = new Map<string, MemoryContext>();
    private memoryTrackerEnable: boolean;
    private constructor() {
        this.events = new Map();
        this.historyEvents = new Map();
        this.scopes = [];
        this.shouldSkip = true;
        this.memoryTrackerEnable = false;
        this.totalDuration = 0;
    }

    public static getInstance(): Performance {
        if (!this.instance) {
            this.instance = new Performance();
        }
        return this.instance;
    }

    skip(shouldSkip: boolean = true): void {
        this.shouldSkip = shouldSkip;
    }

    enableMemoryTracker(enableMemoryTracker: boolean = false): void {
        this.memoryTrackerEnable = enableMemoryTracker;
    }

    createEvent(name: string): Event {
        if (this.shouldSkip) {
            return { name: '', startTime: 0 };
        }
        const startTime: number = performance.now();
        const newEvent: Event = { name, startTime };
        this.events.set(name, newEvent);
        this.scopes.push(name);
        return newEvent;
    }

    stopEvent(name: string, shouldLog: boolean = false): Event {
        if (this.shouldSkip) {
            return { name: '', startTime: 0 };
        }
        if (!this.events.has(name) || this.scopes.length === 0) {
            throw new Error(`Event ${name} is not created.`);
        }
        if (this.scopes[this.scopes.length - 1] !== name) {
            console.warn(`[PERFORMANCE WARNING] Event ${name} early exit.`);
        }
        this.scopes.pop();

        const event: Event = this.events.get(name)!;
        const endTime: number = performance.now();
        const parentEvent: string = this.scopes[this.scopes.length - 1];
        const duration: number = endTime - event.startTime;
        if (!parentEvent) {
            this.totalDuration += duration;
        }

        if (shouldLog) {
            console.log(
                `[PERFORMANCE] name: ${event.name}, parent: ${parentEvent}, duration: ${formatTime(duration)}(${round(duration)}), total: ${formatTime(this.totalDuration)}(${round(this.totalDuration)})`
            );
        }

        const newEvent = { ...event, endTime, parentEvent, duration };
        const history = this.historyEvents.get(parentEvent ?? null) || [];
        this.historyEvents.set(parentEvent ?? null, [...history, newEvent]);
        return newEvent;
    }

    stopLastEvent(shouldLog: boolean = false): Event {
        if (this.shouldSkip) {
            return { name: '', startTime: 0 };
        }
        if (this.scopes.length === 0) {
            throw new Error("No last event");
        }
        const name: string = this.scopes.pop()!;
        if (!this.events.has(name)) {
            throw new Error(`Event ${name} is not created.`);
        }

        const event: Event = this.events.get(name)!;
        const endTime: number = performance.now();
        const parentEvent: string = this.scopes[this.scopes.length - 1];
        const duration: number = endTime - event.startTime;
        if (!parentEvent) {
            this.totalDuration += duration;
        }

        if (shouldLog) {
            console.log(
                `[PERFORMANCE] name: ${event.name}, parent: ${parentEvent}, duration: ${formatTime(duration)}(${round(duration)}), total: ${formatTime(this.totalDuration)}(${round(this.totalDuration)})`
            );
        }

        const newEvent = { ...event, endTime, parentEvent, duration };
        const history = this.historyEvents.get(parentEvent ?? null) || [];
        this.historyEvents.set(parentEvent ?? null, [...history, newEvent]);
        return newEvent;
    }

    clearAllEvents(shouldLog: boolean = false): void {
        if (this.shouldSkip) {
            return;
        }
        for (let i = 0; i < this.scopes.length; i ++) {
            this.stopLastEvent(shouldLog);
        }
        this.events = new Map();
    }

    clearTotalDuration(): void {
        this.totalDuration = 0;
    }

    clearHistory(): void {
        this.historyEvents = new Map();
    }

    visualizeEvents(shouldLog: boolean = false): void {
        if (this.shouldSkip) {
            return;
        }
        const that = this;
        function buildVisualization(parentKey: string | null, indentLevel: number): [string, number] {
            const children = that.historyEvents.get(parentKey) || [];
            let result = '';

            children.forEach(child => {
                const indent = '  '.repeat(indentLevel);
                const duration = child.duration ?? 0;
                const [_result, count] = buildVisualization(child.name, indentLevel + 1);
                result += `${indent}- ${child.name}: ${formatTime(duration)}(${round(duration)}), ${count}\n`;
                result += _result;
            });

            return [result, children.length];
        }

        const [finalResult, _] = buildVisualization(null, 0);
        if (shouldLog) {
          console.log(`[PERFORMANCE] ===== FINAL RESULT ====`);
          console.log(`TOTAL: ${formatTime(this.totalDuration)}(${round(this.totalDuration)})`);
          console.log(finalResult.trimEnd());
          console.log(`[PERFORMANCE] ===== FINAL RESULT ====`);
        }
    }

    startMemRecord(label: string = `measurement-${Date.now()}`): void {
        // 强制进行垃圾回收（需要 Node.js 启动时添加 --expose-gc 参数）
        if (!this.memoryTrackerEnable) {
            return;
        }
        if (global.gc) {
            (global as any).gc();
        }
        const startMemory = process.memoryUsage();
        this.memoryContexts.set(label, {
            startTime: Date.now(),
            startMemory: {
                rss: startMemory.rss / (BYTES_PER_KIBIBYTE * BYTES_PER_KIBIBYTE),
                heapTotal: startMemory.heapTotal / (BYTES_PER_KIBIBYTE * BYTES_PER_KIBIBYTE),
                heapUsed: startMemory.heapUsed / (BYTES_PER_KIBIBYTE * BYTES_PER_KIBIBYTE),
                external: startMemory.external / (BYTES_PER_KIBIBYTE * BYTES_PER_KIBIBYTE),
                arrayBuffers: (startMemory.arrayBuffers || 0) / (BYTES_PER_KIBIBYTE * BYTES_PER_KIBIBYTE)
            }
        });

        return;
    }

    stopMemRecord(label: string = `measurement-${Date.now()}`, runGc: boolean = false): void {
        if (!this.memoryTrackerEnable) {
            return;
        }
        const context = this.memoryContexts.get(label);

        if (!context) {
            console.error(`未找到标签为 "${label}" 的内存测量上下文`);
            return;
        }

        // 可选：在测量结束前执行垃圾回收
        if (runGc && global.gc) {
            (global as any).gc();
        }

        // 记录结束时的内存使用情况
        const endTime = Date.now();
        const endMemory = process.memoryUsage();

        // 计算内存使用增量
        const memoryDiff = {
            rss: endMemory.rss / (BYTES_PER_KIBIBYTE * BYTES_PER_KIBIBYTE) - context.startMemory.rss,
            heapTotal: endMemory.heapTotal / (BYTES_PER_KIBIBYTE * BYTES_PER_KIBIBYTE) - context.startMemory.heapTotal,
            heapUsed: endMemory.heapUsed / (BYTES_PER_KIBIBYTE * BYTES_PER_KIBIBYTE) - context.startMemory.heapUsed,
            external: endMemory.external / (BYTES_PER_KIBIBYTE * BYTES_PER_KIBIBYTE) - context.startMemory.external,
            arrayBuffers: ((endMemory.arrayBuffers || 0) / (BYTES_PER_KIBIBYTE * BYTES_PER_KIBIBYTE)) - context.startMemory.arrayBuffers
        };
        const duration = endTime - context.startTime;

        console.log('[PERFORMANCE]', `内存测量结果 [标签: ${label}]`);
        console.log('[PERFORMANCE]', `执行时间: ${duration}ms`);
        console.log('---------------------------------------------------------------');
        console.log('[PERFORMANCE]', `内存类型       | 开始值(MB) | 结束值(MB) | 增量(MB)`);
        console.log('---------------------------------------------------------------');
        console.log('[PERFORMANCE]', `RSS            | ${context.startMemory.rss.toFixed(2)}    | ${(endMemory.rss / (BYTES_PER_KIBIBYTE * BYTES_PER_KIBIBYTE)).toFixed(2)}    | ${memoryDiff.rss.toFixed(2)}`);
        console.log('[PERFORMANCE]', `Heap Total     | ${context.startMemory.heapTotal.toFixed(2)}    | ${(endMemory.heapTotal / (BYTES_PER_KIBIBYTE * BYTES_PER_KIBIBYTE)).toFixed(2)}    | ${memoryDiff.heapTotal.toFixed(2)}`);
        console.log('[PERFORMANCE]', `Heap Used      | ${context.startMemory.heapUsed.toFixed(2)}    | ${(endMemory.heapUsed / (BYTES_PER_KIBIBYTE * BYTES_PER_KIBIBYTE)).toFixed(2)}    | ${memoryDiff.heapUsed.toFixed(2)}`);
        console.log('[PERFORMANCE]', `External       | ${context.startMemory.external.toFixed(2)}    | ${(endMemory.external / (BYTES_PER_KIBIBYTE * BYTES_PER_KIBIBYTE)).toFixed(2)}    | ${memoryDiff.external.toFixed(2)}`);
        if (endMemory.arrayBuffers !== undefined) {
            console.log(`Array Buffers  | ${context.startMemory.arrayBuffers.toFixed(2)}    | ${((endMemory.arrayBuffers || 0) / (BYTES_PER_KIBIBYTE * BYTES_PER_KIBIBYTE)).toFixed(2)}    | ${memoryDiff.arrayBuffers.toFixed(2)}`);
        }
        console.log('---------------------------------------------------------------');
        this.memoryContexts.delete(label);
        return;
    }

    memoryTrackerReset(): void {
        if (!this.memoryTrackerEnable) {
            return;
        }
        localGlobal.es2panda._MemoryTrackerReset(localGlobal.context);
    }

    memoryTrackerGetDelta(tag: string): void {
        if (!this.memoryTrackerEnable) {
            return;
        }
        console.log('---------------------------------------------------------------');
        console.log('[PERFORMANCE] Increamental memory:', tag);
        localGlobal.es2panda._MemoryTrackerGetDelta(localGlobal.context);
        console.log('---------------------------------------------------------------');
    }

    memoryTrackerPrintCurrent(tag: string): void {
        if (!this.memoryTrackerEnable) {
            return;
        }
        console.log('---------------------------------------------------------------');
        console.log('[PERFORMANCE] Current total memory:', tag);
        localGlobal.es2panda._MemoryTrackerPrintCurrent(localGlobal.context);
        console.log('---------------------------------------------------------------');
    }
}