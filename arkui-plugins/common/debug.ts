/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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
import * as fs from 'fs';
import * as path from 'path';
import * as arkts from '@koalaui/libarkts';
import { NodeCacheFactory } from './node-cache';

// Moved from koala-wrapper

export class Debugger {
    private static instance: Debugger | null = null;
    private phasesDebug: boolean;
    private constructor() {
        this.phasesDebug = false;
    }

    public static getInstance(): Debugger {
        if (!this.instance) {
            this.instance = new Debugger();
        }
        return this.instance;
    }

    enablePhasesDebug(phasesDebug: boolean = false): void {
        this.phasesDebug = phasesDebug;
    }

    phasesDebugLog(tag: string): void {
        if (!this.phasesDebug) {
            return;
        }
        console.log(tag);
    }
}

// 

const isDebugLog: boolean = false;
const isDebugDump: boolean = false;
const isPerformance: boolean = false;
const isPerformanceDetail: boolean = false;
const isNodeCacheLogPerformance: boolean = false;
const enableMemoryTracker: boolean = false;
const enablePhasesDebug: boolean = false;
arkts.Performance.getInstance().skip(!isPerformance);
arkts.Performance.getInstance().enableMemoryTracker(enableMemoryTracker);
Debugger.getInstance().enablePhasesDebug(enablePhasesDebug);
arkts.Performance.getInstance().skip(!isPerformance).skipDetail(!isPerformanceDetail);
arkts.Performance.getInstance().enableMemoryTracker(enableMemoryTracker);
NodeCacheFactory.getInstance().shouldPerfLog(isNodeCacheLogPerformance);
export function getEnumName(enumType: any, value: number): string | undefined {
    return enumType[value];
}

function mkDir(filePath: string): void {
    const parent = path.join(filePath, '..');
    if (!(fs.existsSync(parent) && !fs.statSync(parent).isFile())) {
        mkDir(parent);
    }
    fs.mkdirSync(filePath);
}

export function debugLogAstNode(message: string, node: arkts.AstNode): void {
    if (!isDebugLog) {
        return;
    }
    console.log(message);
    console.log(node.dumpSrc());
}

export function debugDumpAstNode(
    node: arkts.AstNode,
    fileName: string,
    cachePath: string | undefined,
    programFileName: string
): void {
    if (!isDebugDump) {
        return;
    }
    const currentDirectory = process.cwd();
    const modifiedFileName = programFileName.replaceAll('.', '_');
    const outputDir: string = cachePath
        ? path.resolve(currentDirectory, cachePath, modifiedFileName)
        : path.resolve(currentDirectory, 'dist', 'cache', modifiedFileName);
    const filePath: string = path.resolve(outputDir, fileName.replaceAll('\/', '_'));
    if (!fs.existsSync(outputDir)) {
        mkDir(outputDir);
    }
    try {
        fs.writeFileSync(filePath, node.dumpSrc(), 'utf8');
    } catch (error) {
        console.error('文件操作失败:', error);
    }
}

export function debugLog(message?: any, ...optionalParams: any[]): void {
    if (!isDebugLog) return;
    console.log(message, ...optionalParams);
}

export function getDumpFileName(state: number, prefix: string, index: number | undefined, suffix: string): string {
    return `${state}_${prefix}_${index ?? ''}_${suffix}.sts`;
}

export function getPerfName(level: number[], name: string): string {
    if (!isPerformanceDetail) {
        return '';
    }
    const levelName: string = level.join('.');
    return [levelName, name].join(' --- ');
}

export function performanceLog<T extends any[], R>(
  fn: (...args: T) => R,
  label: string = fn.name
): (...args: T) => R {
  const timedFunction = function (this: any, ...args: T): R {
    arkts.Performance.getInstance().createDetailedEvent(label);
    try {
      const result = fn.apply(this, args);
      if (result instanceof Promise) {
        return result.finally(() => {
            arkts.Performance.getInstance().stopDetailedEvent(label); 
        }) as R;
      }
      arkts.Performance.getInstance().stopDetailedEvent(label);
      return result;
    } catch (error) {
      arkts.Performance.getInstance().stopDetailedEvent(label); 
      throw error;
    }
  };

  Object.defineProperty(timedFunction, 'name', { 
    value: label || fn.name, 
    configurable: true 
  });
  
  return timedFunction;
}