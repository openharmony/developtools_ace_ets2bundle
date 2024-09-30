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

import { parentPort, workerData } from 'worker_threads';
import * as fs from 'fs';
import { MemoryReport } from './memory_report';

interface StageReport {
  // Is the current StageReport in the record stage
  record: boolean;
  // Indicates the maximum RSS memory usage in the current Stage
  top: number;
  // The minimum RSS memory usage in the current stage
  bottom: number;
  // the total number of memory reports for the current Stage
  data: MemoryReport[];
}

interface QueryMemReport {
  [stageName: string]: StageReport;
}

class MemoryCollector {
  private reports: MemoryReport[] = [];
  private filePath: string;
  private bufferInterval: number;
  private writeInterval: number;
  private writeTimeoutId: NodeJS.Timeout | null = null;
  private stage: string = '';
  private parentStage: string = '';
  private hasWrittenEnd: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private stopIntervalId: NodeJS.Timeout | null = null;
  private recordMap = new Map<string, string>();
  private recordParentMap = new Map<string, string>();
  private lastRecordTime: number = 0;
  private lastRssValue: number = 0;
  private lastStage: string = '';
  private throttlePercentage: number = 1.05;

  constructor(filePath: string, bufferInterval: number = 100, writeInterval: number = 1000) {
    this.filePath = filePath;
    this.bufferInterval = bufferInterval;
    this.writeInterval = writeInterval;
  }

  private recordMemoryUsage(memReport?: MemoryReport): void {
    const now = Date.now();
    if (!memReport) {
      const usage = process.memoryUsage();
      memReport = {
        timestamp: now,
        rss: usage.rss,
        heapTotal: usage.heapTotal,
        heapUsed: usage.heapUsed,
        stage: this.stage,
        parentStage: this.parentStage,
      };
    }
    
    const currentRss = memReport?.rss || process.memoryUsage().rss;
    if (memReport.stage && memReport.stage !== this.lastStage ||
      now - this.lastRecordTime >= this.bufferInterval ||
      currentRss / this.lastRssValue >= this.throttlePercentage) {
      this.lastRecordTime = now;
      this.lastRssValue = currentRss;
      this.lastStage = this.stage;
      if (memReport.stage !== '') {
        this.reports.push(memReport);
      }
    }
    if (this.writeTimeoutId == null) {
      this.writeTimeoutId = setTimeout(() => {
        this.flushReports();
      }, this.writeInterval);
    }
  }

  private flushReports(isStop?: boolean): void {
    if (this.writeTimeoutId !== null) {
      clearTimeout(this.writeTimeoutId);
      this.writeTimeoutId = null;
    }
    if (this.reports.length > 0) {
      let data = this.reports.map((report) => JSON.stringify(report)).join(',\n') + ',\n';
      this.reports = [];
      try {
        fs.accessSync(this.filePath, fs.constants.F_OK);
      } catch (err) {
        fs.writeFileSync(this.filePath, data, 'utf8');
        return;
      }
      if (!this.hasWrittenEnd) {
        fs.appendFileSync(this.filePath, data, 'utf8');
      }
    }
    if (isStop && !this.hasWrittenEnd) {
      this.hasWrittenEnd = true;
    }
  }

  private containsNonStopValue(map: Map<string, string>): boolean {
    for (let value of map.values()) {
      if (value !== 'stop') {
        return true;
      }
    }
    return false;
  }  
  
  start(): void {
    this.intervalId = setInterval(() => {
      this.recordMemoryUsage();
    }, this.bufferInterval);
  }

  stop(): void {
    this.stopIntervalId = setInterval(() => {
      if (this.containsNonStopValue(this.recordMap)) {
        return;
      }

      if (this.stopIntervalId) {
        clearInterval(this.stopIntervalId);
        this.stopIntervalId = null;
      }
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      if (this.writeTimeoutId) {
        clearTimeout(this.writeTimeoutId);
        this.writeTimeoutId = null;
      }
      this.flushReports(true);
    }, 5);
  }

  record(stage: string, parentStage?: string, memReport?: MemoryReport): void {
    this.recordMap.set(stage, 'record');
    this.stage = stage;
    if (parentStage) {
      this.parentStage = parentStage;
      this.recordParentMap.set(stage, parentStage);
    }
    this.recordMemoryUsage(memReport);
  }

  stopRecord(stage: string, parentStage?: string, memReport?: MemoryReport): void {
    this.recordMap.set(stage, 'stop');
    if (stage === this.stage) {
        if (parentStage) {
            this.stage = parentStage;
            let parent = this.recordParentMap.get(this.stage);
            if (parent !== undefined) {
                this.parentStage = parent;
            }
        } else {
            this.stage = '';
            this.parentStage = '';
        }
    }
    this.recordMemoryUsage(memReport);
  }

  addMemoryUsage(memReport: MemoryReport): void {
    this.recordMemoryUsage(memReport);
  }

  handleRecord(recordStr: string, stage: string, report: QueryMemReport): void {
    try {
      const reportObj = JSON.parse(recordStr);
      if (reportObj.stage === stage) {
        if (reportObj.rss > report.stage.top) {
          report.stage.top = reportObj.rss;
        }
        if (reportObj.rss < report.stage.bottom) {
          report.stage.bottom = reportObj.rss;
        }
        report.stage.data.push(reportObj);
      }
    } catch (e) {
      console.error(`Error parsing JSON: ${recordStr}`);
      console.error(e);
    }
  }

  queryMemoryUsage(requestId: number, stage: string): void {
    let record = this.recordMap.has(stage);
    let stageReport: StageReport = {
      record: record,
      top: -1,
      bottom: -1,
      data: [],
    };
    let report: QueryMemReport = {};
    report[stage] = stageReport;
    let currentRecord = '';
    let inRecord = false;
    const stream = fs.createReadStream(this.filePath, { encoding: 'utf8' });
    stream.on('data', (chunk) => {
      for (let char of chunk) {
        if (char === '{') {
          inRecord = true;
          currentRecord = char;
        } else if (char === '}') {
          inRecord = false;
          currentRecord += char;
          this.handleRecord(currentRecord, stage, report);
          currentRecord = '';
        } else if (inRecord) {
          currentRecord += char;
        }
      }
    });

    stream.on('end', () => {
      parentPort!.postMessage({ action: 'memoryReport', requestId: requestId, report: report });
    });
    stream.on('error', (err) => {
      parentPort!.postMessage({ action: 'memoryReport', requestId: requestId, report: {} });
    });
  }
}

if (workerData) {
  const { filePath, bufferInterval, writeInterval } = workerData;
  const collector = new MemoryCollector(filePath, bufferInterval, writeInterval);
  collector.start();
  parentPort!.on('message', (msg) => {
    if (msg.action === 'stop') {
      collector.stop();
    } else if (msg.action === 'recordStage') {
      collector.record(msg.stage, msg.parentStage, msg.memoryReport);
    } else if (msg.action === 'stopRecordStage') {
      collector.stopRecord(msg.stage, msg.parentStage, msg.memoryReport);
    } else if (msg.action === 'addMemoryReport') {
      collector.addMemoryUsage(msg.memoryReport);
    } else if (msg.action === 'queryMemoryUsage') {
      collector.queryMemoryUsage(msg.requestId, msg.stage);
    }
  });
}
