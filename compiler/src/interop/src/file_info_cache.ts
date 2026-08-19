/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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

import fs from 'fs';

export interface FileInfo {
  exists: boolean;
  isFile?: boolean;
  isDirectory?: boolean;
  mtimeMs?: number;
}

export class FileInfoCache {
  private share: Object;

  constructor() {
    this.share = null;
  }

  setShare(share: Object): void {
    this.share = share;
  }

  getFileInfo(filePath: string): FileInfo {
    if (this.share && typeof this.share.getCachedFileInfo === 'function') {
      const hvigorCache = this.share.getCachedFileInfo(filePath);
      if (hvigorCache) {
        return hvigorCache;
      }
    }
    try {
      const stats = fs.statSync(filePath);
      return {
        exists: true,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        mtimeMs: stats.mtimeMs
      };
    } catch (e) {
      if (e.code === 'ENOENT') {
        return { exists: false };
      }
      throw e.message;
    }
  }

  isFile(filePath: string): boolean {
    const meta = this.getFileInfo(filePath);
    return meta.exists && meta.isFile;
  }

  isDirectory(filePath: string): boolean {
    const meta = this.getFileInfo(filePath);
    return meta.exists && meta.isDirectory;
  }

  getMtimeMs(filePath: string): number {
    const meta = this.getFileInfo(filePath);
    return meta.exists && meta.mtimeMs !== undefined ? meta.mtimeMs : 0;
  }

  fileExists(filePath: string): boolean {
    const meta = this.getFileInfo(filePath);
    return meta.exists;
  }
}

export const fileInfoCache = new FileInfoCache();
