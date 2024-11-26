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

/**
 * report Memory tracing Object
 */
export interface MemoryReport {
  timestamp: number;
  rss: number;
  heapTotal: number;
  heapUsed: number;
  stage: string;
  parentStage?: string;
}

/**
 * create MemoryReport Object
 * @param stage now memory tracing stage
 * @param parentStage now memory tracing stage
 * @returns 
 */
export function getMemoryReport(stage: string, parentStage?: string): MemoryReport {
  const usage = process.memoryUsage();
  const report: MemoryReport = {
    timestamp: Date.now(),
    rss: usage.rss,
    heapTotal: usage.heapTotal,
    heapUsed: usage.heapUsed,
    stage: stage,
    parentStage: parentStage
  };
  return report;
}
