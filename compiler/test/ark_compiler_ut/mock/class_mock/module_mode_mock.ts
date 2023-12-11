/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use rollupObject file except in compliance with the License.
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
import {
  COMMONJS,
  ESM,
  EXTNAME_PROTO_BIN,
  EXTNAME_JS,
  EXTNAME_TS,
  EXTNAME_ETS
} from '../../../../lib/fast_build/ark_compiler/common/ark_define';
import {
  ModuleMode,
  PackageEntryInfo
} from '../../../../lib/fast_build/ark_compiler/module/module_mode';
import { changeFileExtension } from '../../../../lib/fast_build/ark_compiler/utils';
import { META } from '../rollup_mock/common';
class ModuleModeMock extends ModuleMode {
  collectModuleFileListMock(rollupObject: object) {
    const fileList = Array.from(rollupObject.getModuleIds());
    this.collectModuleFileList(rollupObject, fileList);
  }

  addModuleInfoItemMock(rollupObject: object, isCommonJs: boolean, extName: string) {
    const mockFileList = rollupObject.getModuleIds();
    for (const filePath of mockFileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS)) {
        const moduleInfo: object = rollupObject.getModuleInfo(filePath);
        const metaInfo: object = moduleInfo[META];
        this.addModuleInfoItem(filePath, isCommonJs, extName, metaInfo, this.moduleInfos);
      }
    }
  }

  generateCompileFilesInfoMock() {
    this.generateCompileFilesInfo();
  }

  generateNpmEntriesInfoMock() {
    this.generateNpmEntriesInfo();
  }

  generateAbcCacheFilesInfoMock() {
    this.generateAbcCacheFilesInfo();
  }

  checkGenerateCompileFilesInfo(): boolean {
    let mockfilesInfo: string = '';
    const filesInfo = fs.readFileSync(this.filesInfoPath, 'utf-8');
    this.moduleInfos.forEach((info) => {
      const moduleType: string = info.isCommonJs ? COMMONJS : ESM;
      mockfilesInfo +=
        `${info.cacheFilePath};${info.recordName};${moduleType};${info.sourceFile};${info.packageName}\n`;
    });
    if (filesInfo === mockfilesInfo) {
      return true;
    }
    return false;
  }

  checkGenerateNpmEntriesInfo(): boolean {
    let mockentriesInfo: string = '';
    const filesInfo = fs.readFileSync(this.npmEntriesInfoPath, 'utf-8');
    for (const value of this.pkgEntryInfos.values()) {
      mockentriesInfo += `${value.pkgEntryPath}:${value.pkgBuildPath}\n`;
    }
    if (filesInfo === mockentriesInfo) {
      return true;
    }
    return false;
  }

  checkGenerateAbcCacheFilesInfo(): boolean {
    let mockabcCacheFilesInfo: string = '';
    const filesInfo = fs.readFileSync(this.cacheFilePath, 'utf-8');
    this.moduleInfos.forEach((info) => {
      const abcCacheFilePath: string = changeFileExtension(info.cacheFilePath, EXTNAME_PROTO_BIN);
      mockabcCacheFilesInfo += `${info.cacheFilePath};${abcCacheFilePath}\n`;
    });

    const npmEntriesCacheFilePath: string = changeFileExtension(this.npmEntriesInfoPath, EXTNAME_PROTO_BIN);
    mockabcCacheFilesInfo += `${this.npmEntriesInfoPath};${npmEntriesCacheFilePath}\n`;

    if (filesInfo === mockabcCacheFilesInfo) {
      return true;
    }
    return false;
  }

  checkGetPackageEntryInfo(rollup: object) {
    this.pkgEntryInfos = new Map<String, PackageEntryInfo>();
    const mockFileList = rollup.getModuleIds();
    for (const filePath of mockFileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS)) {
        const moduleInfos = rollup.getModuleInfo(filePath);
        moduleInfos.setIsLocalDependency(false);
        moduleInfos.setIsNodeEntryFile(true);
        const metaInfo: object = moduleInfos[META];
        this.getPackageEntryInfo(filePath, metaInfo, this.pkgEntryInfos);
      }
    }
  }

  updateCachedSourceMapsMock() {
    this.updateCachedSourceMaps();
  }

  buildModuleSourceMapInfoMock() {
    this.buildModuleSourceMapInfo();
  }

  checkModuleSourceMapInfoMock(): boolean {
    const readSourceMap = fs.readFileSync(this.sourceMapPath, 'utf-8');
    const readCacheSourceMap = fs.readFileSync(this.cacheSourceMapPath, 'utf-8');
    if (readSourceMap.length == 0 && readCacheSourceMap.length == 0) {
      return true;
    } else if (readSourceMap === readCacheSourceMap) {
      return true;
    } else {
      return false;
    }
  }
}

export default ModuleModeMock;