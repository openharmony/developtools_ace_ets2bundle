/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Worker } from 'worker_threads';
import { getMemoryReport, MemoryReport } from './memory_report';
import { projectConfig } from '../../../main';
import path from 'path';
import fs from 'fs';
import { ArkObfuscator } from 'arkguard';
import * as ts  from 'typescript';

export class MemoryMonitor {
  private worker: Worker | undefined;
  private static instance: MemoryMonitor | null = null;
  private pendingQueries: Map<number, (report: MemoryReport) => void> = new Map();
  private requestIdCounter = 0;
  private filePath = '';
  constructor() {
    this.worker = undefined;
  }

  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  getRecordFileName(): string {
    return this.filePath;
  }

  start(): void {
    if (!projectConfig.enableMemoryDotting) {
      return;
    }
    if (
      projectConfig.enableMemoryDotting &&
      projectConfig.memoryDottingPath !== undefined &&
      !fs.existsSync(projectConfig.memoryDottingPath)
    ) {
      fs.mkdirSync(projectConfig.memoryDottingPath);
    } else {
      if (projectConfig.buildPath == undefined) {
        projectConfig.buildPath = '';
      }
      projectConfig.memoryDottingPath = path.resolve(projectConfig.buildPath, '../', '../', 'dottingfile');
    }
    this.filePath = path.resolve(projectConfig.memoryDottingPath, `memory${Date.now()}.log`);
    let bufferInterval =
      (projectConfig.memoryDottingRecordInterval && projectConfig.memoryDottingRecordInterval) || 100;
    let writeInterval =
      (projectConfig.memoryDottingWriteFileInterval && projectConfig.memoryDottingWriteFileInterval) || 1000;
    const workerPath = path.resolve(__dirname, './memory_worker.js');
    this.worker = new Worker(workerPath, {
      workerData: { bufferInterval: bufferInterval, writeInterval: writeInterval, filePath: this.filePath },
    });
    this.worker.on('error', (err) => {
      console.error('Worker error:', err);
    });
    this.worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
    });
    this.worker.on('message', (data) => {
      if (data.action === 'memoryReport') {
        const requestId = data.requestId;
        const report = data.report;
        const resolveCallback = this.pendingQueries.get(requestId);
        if (resolveCallback) {
          resolveCallback(report);
          this.pendingQueries.delete(requestId);
        }
      }
    });
  }

  stop(): void {
    if (this.worker) {
      this.worker.postMessage({ action: 'stop' });
    }
  }

  recordStage(stage: string, parentStage?: string): void {
    if (this.worker) {
      const memoryUsage = getMemoryReport(stage, parentStage);
      this.worker.postMessage({
        action: 'recordStage',
        stage: stage,
        parentStage: parentStage,
        memoryReport: memoryUsage,
      });
    }
  }

  stopRecordStage(stage: string, parentStage?: string): void {
    if (this.worker) {
      const memoryUsage = getMemoryReport(stage, parentStage);
      this.worker.postMessage({ action: 'stopRecordStage', stage: stage, memoryReport: memoryUsage });
    }
  }

  addMemoryReport(memoryReport: MemoryReport): void {
    if (this.worker) {
      this.worker.postMessage({ action: 'addMemoryReport', memoryReport: memoryReport });
    }
  }

  async queryMemoryUsage(stage: string): Promise<MemoryReport> {
    return new Promise((resolve, reject) => {
      if (this.worker) {
        const requestId = ++this.requestIdCounter;
        this.pendingQueries.set(requestId, resolve);
        this.worker.postMessage({ action: 'queryMemoryUsage', requestId, stage });
      } else {
        reject(new Error('Worker is not initialized.'));
      }
    });
  }

  cleanUp(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = undefined;
      MemoryMonitor.instance = null;
    }
  }
}

export function memoryMonitor() {
  return {
    name: 'memoryMonitor',
    buildStart: {
      order: 'pre',
      handler() {
        const memoryMonitorInstance: MemoryMonitor = MemoryMonitor.getInstance();
        memoryMonitorInstance.start();
        if (projectConfig.enableMemoryDotting) {
          if (ts.setMemoryDottingCallBack !== undefined) {
            ts.setMemoryDottingCallBack(
              (stage: string, parentStage?: string) => {
                MemoryMonitor.getInstance().recordStage(stage, parentStage);
              },
              (stage: string, parentStage?: string) => {
                MemoryMonitor.getInstance().stopRecordStage(stage, parentStage);
              }
            );
          }
          if (ArkObfuscator.setMemoryDottingCallBack !== undefined) {
            ArkObfuscator.setMemoryDottingCallBack(
              (stage: string, parentStage?: string) => {
                MemoryMonitor.getInstance().recordStage(stage, parentStage);
              },
              (stage: string, parentStage?: string) => {
                MemoryMonitor.getInstance().stopRecordStage(stage, parentStage);
              }
            );
          }
        }
      },
    },
    buildEnd: {
      order: 'post',
      handler() {
        const memoryMonitorInstance: MemoryMonitor = MemoryMonitor.getInstance();
        memoryMonitorInstance.stop();
      },
    },
  };
}
