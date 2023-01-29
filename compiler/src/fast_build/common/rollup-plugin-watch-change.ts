/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
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

import {
  shouldWriteChangedList,
  writeFileSync,
  getHotReloadFiles
} from '../../utils';
import { projectConfig } from '../../../main';
import {
  incrementWatchFile,
  hotReloadSupportFiles
} from '../../ets_checker';

export function watchChangeFiles() {
  function addFileToCache(this: any, key: string, id: string) {
    let modifiedFiles: string[] = [];
    if (this.cache && this.cache.has(key)) {
      modifiedFiles = this.cache.get(key);
      modifiedFiles.push(id);
    } else {
      modifiedFiles.push(id);
    }
    this.cache.set(key, modifiedFiles);
  }
  return {
    name: 'watchChangedFiles',
    watchChange(id: string, change: {event: 'create' | 'update' | 'delete'}): void {
      if (change.event === 'update') {
        addFileToCache.call(this, 'watchModifiedFiles', id);
      }
      if (['create', 'delete'].includes(change.event)) {
        addFileToCache.call(this, 'watchRemovedFiles', id);
      }
    },
    beforeBuild() {
      this.cache.set('watchChangedFilesCache', 'watchChangedFiles');
      const watchModifiedFiles: string[] = this.cache.get('watchModifiedFiles') || [];
      const watchRemovedFiles: string[] = this.cache.get('watchRemovedFiles') || [];
      if (shouldWriteChangedList(watchModifiedFiles, watchRemovedFiles)) {
        writeFileSync(projectConfig.changedFileList, JSON.stringify(
          getHotReloadFiles(watchModifiedFiles, watchRemovedFiles, hotReloadSupportFiles)));
      }
      incrementWatchFile(watchModifiedFiles, watchRemovedFiles);
    }
  };
}
