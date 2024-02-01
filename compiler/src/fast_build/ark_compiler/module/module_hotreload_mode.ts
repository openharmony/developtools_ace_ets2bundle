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

import fs from 'fs';
import path from 'path';

import { ModuleMode } from './module_mode';
import {
  blue,
  reset,
  MODULES_ABC,
  SOURCEMAPS,
  SYMBOLMAP
} from '../common/ark_define';
import { isJsonSourceFile } from '../utils';
import { newSourceMaps } from '../transform';
import {
  mkdirsSync,
  toUnixPath,
  validateFilePathLength
} from '../../../utils';
import {
  createAndStartEvent,
  stopEvent
} from '../../../ark_utils';

let isFirstBuild: boolean = true;

export class ModuleHotreloadMode extends ModuleMode {
  symbolMapFilePath: string;
  constructor(rollupObject: Object) {
    super(rollupObject);
    if (this.projectConfig.oldMapFilePath) {
      this.symbolMapFilePath = path.join(this.projectConfig.oldMapFilePath, SYMBOLMAP);
    } else {
      this.throwArkTsCompilerError('ArkTS:INTERNAL ERROR: Hotreload failed, ' +
        'symbolMap file is not correctly configured.');
    }
  }

  generateAbc(rollupObject: Object, parentEvent: Object): void {
    if (isFirstBuild) {
      this.compileAllFiles(rollupObject, parentEvent);
      isFirstBuild = false;
    } else {
      this.compileChangeListFiles(rollupObject, parentEvent);
    }
  }

  addHotReloadArgs() {
    if (isFirstBuild) {
      this.cmdArgs.push('--dump-symbol-table');
      this.cmdArgs.push(`"${this.symbolMapFilePath}"`);
      return;
    }
    this.addCacheFileArgs();
    this.cmdArgs.push('--input-symbol-table');
    this.cmdArgs.push(`"${this.symbolMapFilePath}"`);
    this.cmdArgs.push('--hot-reload');
  }

  private compileAllFiles(rollupObject: Object, parentEvent: Object): void {
    this.prepareForCompilation(rollupObject, parentEvent);
    this.buildModuleSourceMapInfo(parentEvent);
    this.generateAbcByEs2abc(parentEvent);
  }

  private compileChangeListFiles(rollupObject: Object, parentEvent: Object): void {
    if (!fs.existsSync(this.projectConfig.changedFileList)) {
      this.logger.debug(blue, `ArkTS: Cannot find file: ${
        this.projectConfig.changedFileList}, skip hot reload build`, reset);
      return;
    }

    const changedFileListJson: string = fs.readFileSync(this.projectConfig.changedFileList).toString();
    const changedFileList: Array<string> = JSON.parse(changedFileListJson).modifiedFiles;
    if (typeof changedFileList === 'undefined' || changedFileList.length === 0) {
      this.logger.debug(blue, `ArkTS: No changed files found, skip hot reload build`, reset);
      return;
    }

    let needHotreloadBuild: boolean = true;
    let changedFileListInAbsolutePath: Array<string> = changedFileList.map((file) => {
      if (isJsonSourceFile(file)) {
        this.logger.debug(blue, `ARKTS: json source file: ${file} changed, skip hot reload build!`, reset);
        needHotreloadBuild = false;
      }
      return path.join(this.projectConfig.projectPath, file);
    });

    if (!needHotreloadBuild) {
      return;
    }

    const eventCollectModuleFileList = createAndStartEvent(parentEvent, 'collect module file list');
    this.collectModuleFileList(rollupObject, changedFileListInAbsolutePath[Symbol.iterator]());
    stopEvent(eventCollectModuleFileList);

    if (!fs.existsSync(this.projectConfig.patchAbcPath)) {
      mkdirsSync(this.projectConfig.patchAbcPath);
    }

    this.updateSourceMapFromFileList(changedFileList, parentEvent);
    const outputABCPath: string = path.join(this.projectConfig.patchAbcPath, MODULES_ABC);
    validateFilePathLength(outputABCPath, this.logger);
    this.moduleAbcPath = outputABCPath;
    this.generateAbcByEs2abc(parentEvent);
  }

  private updateSourceMapFromFileList(fileList: Array<string>, parentEvent: Object): void {
    const eventUpdateSourceMapFromFileList = createAndStartEvent(parentEvent, 'update source map from file list');
    const relativeProjectPath: string = this.projectConfig.projectPath.slice(
      this.projectConfig.projectRootPath.length + path.sep.length);
    let hotReloadSourceMap: Object = {};
    for (const file of fileList) {
      const sourceMapPath: string = toUnixPath(path.join(relativeProjectPath, file));
      validateFilePathLength(sourceMapPath, this.logger);
      hotReloadSourceMap[sourceMapPath] = newSourceMaps[sourceMapPath];
    }
    this.modifySourceMapKeyToCachePath(hotReloadSourceMap);
    const sourceMapFilePath: string = path.join(this.projectConfig.patchAbcPath, SOURCEMAPS);
    validateFilePathLength(sourceMapFilePath, this.logger);
    fs.writeFileSync(sourceMapFilePath,
      JSON.stringify(hotReloadSourceMap, null, 2), 'utf-8');
    stopEvent(eventUpdateSourceMapFromFileList);
  }

  private generateAbcByEs2abc(parentEvent: Object): void {
    this.generateEs2AbcCmd();
    this.addHotReloadArgs();
    this.generateMergedAbcOfEs2Abc(parentEvent);
  }
}
