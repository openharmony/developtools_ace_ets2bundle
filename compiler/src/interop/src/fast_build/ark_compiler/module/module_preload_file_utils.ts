/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

import path from 'path';
import fs from 'fs';
import {
  CommonLogger,
  LogData,
  LogDataFactory
} from '../logger';
import {
  ArkTSInternalErrorDescription,
  ErrorCode
} from '../error_code';

interface PreloadEntry {
  name: string;
  srcEntry: string;
  ohmurl: string;
  moduleId: string;
}

interface PreloadFileStructure {
  systemPreloadHintStartupTasks: PreloadEntry[];
}

export class PreloadFileModules {
  private static needPreloadSo: boolean = true;
  private static preloadEntries: Array<{ name: string; srcEntry: string; ohmurl: string }> = [];
  private static preloadEntriesBack: Array<{ name: string; srcEntry: string; ohmurl: string; moduleId: string }> = [];
  private static preloadFilePath: string;
  private static preloadFilePathBack: string;
  private static projectConfig: Object;
  private static logger: CommonLogger;
  private static moduleIds: string[] = [];

  public static initialize(rollupObject: Object): void {
    this.projectConfig = Object.assign(rollupObject.share.arkProjectConfig, rollupObject.share.projectConfig);
    this.logger = CommonLogger.getInstance(rollupObject);
    if (this.projectConfig.widgetCompile) {
      this.needPreloadSo = false;
      return;
    }
    if (!this.projectConfig.preloadSoFilePath) {
      this.needPreloadSo = false;
      return;
    }
    this.needPreloadSo = true;
    this.preloadFilePath = this.projectConfig.preloadSoFilePath;
    this.preloadFilePathBack = this.preloadFilePath.replace('.json', '.backup.json');
  }

  public static updatePreloadFileDataByItems(moduleRequest: string, ohmurl: string, moduleId: string): void {
    if (!this.needPreloadSo) {
      return;
    }

    const newEntryBack = { name: moduleRequest, srcEntry: moduleRequest, ohmurl: ohmurl, moduleId: moduleId };
    // One file is only need record once so
    const backExists = this.preloadEntriesBack.some(
      entry => entry.moduleId === moduleId && entry.name === moduleRequest
    );
    if (!backExists) {
      this.preloadEntriesBack.push(newEntryBack);
    }
  }

  public static removePreloadSoDataByModuleIds(): void {
    if (!this.needPreloadSo) {
      return;
    }

    const backupFilePath = this.preloadFilePathBack;
    if (!fs.existsSync(backupFilePath)) {
      this.preloadEntries = [...this.deduplicateByName(this.preloadEntriesBack)];
      return;
    }

    try {
      const rawData = fs.readFileSync(backupFilePath, 'utf8');
      const parsed: PreloadFileStructure = JSON.parse(rawData);

      if (!parsed || !Array.isArray(parsed.systemPreloadHintStartupTasks)) {
        const errInfo = LogDataFactory.newInstance(
          ErrorCode.ETS2BUNDLE_INTERNAL_WRITE_PERLOAD_SO_FAILED,
          ArkTSInternalErrorDescription,
          'Invalid JSON structure in preload so backup file.'
        );
        this.logger?.printError?.(errInfo);
      }

      const filtered = parsed.systemPreloadHintStartupTasks.filter(
        entry => !this.moduleIds.includes(entry.moduleId)
      );

      const merged = [...this.preloadEntriesBack, ...filtered];
      const uniqueEntries = Array.from(
        merged.reduce((map, entry) => {
          const key = `${entry.moduleId}-${entry.name}`;
          if (!map.has(key)) {
            map.set(key, entry);
          }
          return map;
        }, new Map<string, typeof entry>()).values()
      );
      this.preloadEntriesBack = uniqueEntries;
      this.preloadEntries = [...this.deduplicateByName(this.preloadEntriesBack)];
    } catch (e) {
      const errInfo = LogDataFactory.newInstance(
        ErrorCode.ETS2BUNDLE_INTERNAL_WRITE_PERLOAD_SO_FAILED,
        ArkTSInternalErrorDescription,
        `Failed to update preload so backup file: ${e.message}`
      );
      this.logger?.printError?.(errInfo);
    }
  }

  private static deduplicateByName<T extends { name: string }>(entries: T[]): T[] {
    const seenNames = new Set<string>();
    return entries
      .map(({ moduleId, ...rest }) => rest)
      .filter(entry => {
        if (seenNames.has(entry.name)) {
          return false;
        }
        seenNames.add(entry.name);
        return true;
      });
  }

  public static finalizeWritePreloadSoList(): void {
    if (!this.needPreloadSo) {
      return;
    }

    try {
      this.removePreloadSoDataByModuleIds();

      const PRELOAD_FILE_STRUCTURE = {
        systemPreloadHintStartupTasks: this.preloadEntries
      };

      const PRELOAD_FILE_STRUCTURE_BACK = {
        systemPreloadHintStartupTasks: this.preloadEntriesBack
      };

      this.ensureDirectoryExistence(this.preloadFilePath);
      fs.writeFileSync(this.preloadFilePath, JSON.stringify(PRELOAD_FILE_STRUCTURE, null, 2), 'utf8');

      this.ensureDirectoryExistence(this.preloadFilePathBack);
      fs.writeFileSync(this.preloadFilePathBack, JSON.stringify(PRELOAD_FILE_STRUCTURE_BACK, null, 2), 'utf8');
    } catch (error) {
      const errInfo = LogDataFactory.newInstance(
        ErrorCode.ETS2BUNDLE_INTERNAL_WRITE_PERLOAD_SO_FAILED,
        ArkTSInternalErrorDescription,
        `Failed to write preload so file: ${error.message}`
      );
      this.logger?.printError?.(errInfo);
    }
  }

  static collectModuleIds(moduleId: string): void {
    if (!this.needPreloadSo) {
      return;
    }
    this.moduleIds.push(moduleId);
  }

  private static ensureDirectoryExistence(filePath: string): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  public static cleanUpPreloadSoObjects(): void {
    this.preloadEntries = [];
    this.preloadEntriesBack = [];
    this.preloadFilePath = '';
    this.preloadFilePathBack = '';
    this.logger = undefined;
    this.projectConfig = undefined;
    this.moduleIds = [];
    this.needPreloadSo = true;
  }
}