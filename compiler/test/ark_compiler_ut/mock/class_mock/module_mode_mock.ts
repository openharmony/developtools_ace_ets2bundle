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
import path from 'path';
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
import {
  getNormalizedOhmUrlByFilepath,
  transformOhmurlToPkgName,
  transformOhmurlToRecordName
} from '../../../../lib/ark_utils';
import { changeFileExtension } from '../../../../lib/fast_build/ark_compiler/utils';
import { toUnixPath } from '../../../../lib/utils';
import { META } from '../rollup_mock/common';
import { sharedModuleSet } from '../../../../lib/fast_build/ark_compiler/check_shared_module';
import { SourceMapGenerator } from '../../../../lib/fast_build/ark_compiler/generate_sourcemap';
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

  addSourceMapMock(rollupObject: object, sourceMapGenerator: SourceMapGenerator) {
    for (const filePath of rollupObject.getModuleIds()) {
      const isValidSuffix: boolean =
        filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS);
      if (!isValidSuffix)
        continue;
      if (sourceMapGenerator.isNewSourceMaps()) {
        sourceMapGenerator.updateSourceMap(filePath, {});
      } else {
        const filePathCache: string = this.genFileCachePath(
          filePath, this.projectConfig.projectRootPath, this.projectConfig.cachePath)
        sourceMapGenerator.updateSourceMap(
          filePathCache.replace(this.projectConfig.projectRootPath + path.sep, ''), {});
      }
    }
  }

  static getModuleInfosAndSourceMapMock(rollupObject: object, sourceMapGenerator: SourceMapGenerator) {
    const moduleMode = new ModuleModeMock(rollupObject);
    moduleMode.addSourceMapMock(rollupObject, sourceMapGenerator);
    moduleMode.addModuleInfoItemMock(rollupObject, false, '');
    return { moduleInfos: moduleMode.moduleInfos, sourceMap: sourceMapGenerator.getSourceMaps() };
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

  generateCompileContextInfoMock(rollupObject: object): void {
      this.compileContextInfoPath = this.generateCompileContextInfo(rollupObject);
  }

  checkGenerateCompileContextInfo(rollupObject: object): boolean {
    const cacheCompileContextInfo = fs.readFileSync(this.compileContextInfoPath, 'utf-8');

    let compileContextInfo: Object = {};
    let hspPkgNames: Array<string> = [];
    for (const hspName in rollupObject.share.projectConfig.hspNameOhmMap) {
      let hspPkgName: string = hspName;
      if (rollupObject.share.projectConfig.dependencyAliasMap.has(hspName)) {
        hspPkgName = rollupObject.share.projectConfig.dependencyAliasMap.get(hspName);
      }
      hspPkgNames.push(toUnixPath(hspPkgName));
    }
    compileContextInfo.hspPkgNames = hspPkgNames;
    let compileEntries: Set<string> = new Set();
    let entryObj: Object = this.projectConfig.entryObj;
    if (this.projectConfig.widgetCompile) {
      entryObj = this.projectConfig.cardEntryObj;
    }
    for (const key in entryObj) {
      let moduleId: string = entryObj[key];
      let moduleInfo: Object = rollupObject.getModuleInfo(moduleId);
      let metaInfo: Object = moduleInfo.meta;
      const pkgParams = {
        pkgName: metaInfo.pkgName,
        pkgPath: metaInfo.pkgPath,
        isRecordName: true
      };
      let recordName: string = getNormalizedOhmUrlByFilepath(moduleId, rollupObject.share.projectConfig,
        rollupObject.share.logger, pkgParams, undefined);
      compileEntries.add(recordName);
    }
    this.collectDeclarationFilesEntry(compileEntries, hspPkgNames);
    compileContextInfo.compileEntries = Array.from(compileEntries);
    if (Object.prototype.hasOwnProperty.call(rollupObject.share.projectConfig, 'pkgContextInfo')) {
      compileContextInfo.pkgContextInfo = rollupObject.share.projectConfig.pkgContextInfo;
    }
    if (JSON.stringify(compileContextInfo) === cacheCompileContextInfo) {
      return true;
    }
    return false;
  }

  checkGenerateCompileFilesInfo(): boolean {
    let mockfilesInfo: string = '';
    const filesInfo = fs.readFileSync(this.filesInfoPath, 'utf-8');
    this.moduleInfos.forEach((info) => {
      const moduleType: string = info.isCommonJs ? COMMONJS : ESM;
      const isSharedModule: boolean = sharedModuleSet.has(info.filePath);
      mockfilesInfo +=
        `${info.cacheFilePath};${info.recordName};${moduleType};${info.sourceFile};${info.packageName};` +
        `${isSharedModule}\n`;
    });
    this.abcPaths.forEach((abcPath) => {
      mockfilesInfo += `${abcPath};;;;;\n`;
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

  checkGetPackageEntryInfo(rollup: object, isTestErrorLog: boolean = false) {
    this.pkgEntryInfos = new Map<String, PackageEntryInfo>();
    const mockFileList = rollup.getModuleIds();
    for (const filePath of mockFileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS) || filePath.endsWith(EXTNAME_JS)) {
        const moduleInfos = rollup.getModuleInfo(filePath);
        moduleInfos.setIsLocalDependency(false);
        moduleInfos.setIsNodeEntryFile(true);
        const metaInfo: object = moduleInfos[META];
        if (isTestErrorLog) {
          metaInfo['pkgPath'] = '';
        }
        this.getPackageEntryInfo(filePath, metaInfo, this.pkgEntryInfos);
      }
    }
  }

  updateCachedSourceMapsMock(sourceMapGenerator: Object) {
    sourceMapGenerator.updateCachedSourceMaps();
  }

  buildModuleSourceMapInfoMock(sourceMapGenerator: Object) {
    sourceMapGenerator.buildModuleSourceMapInfo();
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

  generateMergedAbcOfEs2AbcMock(parentEvent: Object) {
    this.generateMergedAbcOfEs2Abc(parentEvent)
  }

  filterModulesByHashJsonMock() {
    this.filterModulesByHashJson();
  }

  invokeTs2AbcWorkersToGenProtoMock(splittedModules: Object) {
    this.invokeTs2AbcWorkersToGenProto(splittedModules)
  }

  
}

export default ModuleModeMock;