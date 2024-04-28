/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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

import path from 'path';
import fs from 'fs';
import { createAndStartEvent, stopEvent } from "../../ark_utils";
import {
  EXTNAME_ETS,
  EXTNAME_JS,
  EXTNAME_TS,
  SOURCEMAPS,
  SOURCEMAPS_JSON,
  EXTNAME_MJS,
  EXTNAME_CJS
} from "./common/ark_define";
import {
  changeFileExtension,
  isCommonJsPluginVirtualFile,
  isCurrentProjectFiles,
  isDebug,
  shouldETSOrTSFileTransformToJS
} from "./utils";
import { 
  toUnixPath,
  isPackageModulesFile
} from "../../utils";
import {
  handleObfuscatedFilePath,
  mangleFilePath,
  enableObfuscateFileName
} from './common/ob_config_resolver';

export class SourceMapGenerator {
  private static instance: SourceMapGenerator | undefined = undefined;
  private static rollupObject: Object;

  private projectConfig: Object;
  private sourceMapPath: string;
  private cacheSourceMapPath: string;
  private triggerAsync: Object;
  private triggerEndSignal: Object;
  private throwArkTsCompilerError: Object;
  private sourceMaps: Object = {};
  private isNewSourceMap: boolean = true;
  private keyCache: Map<string, string> = new Map();

  public sourceMapKeyMappingForObf: Map<string, string> = new Map();

  constructor(rollupObject: Object) {
    this.projectConfig = Object.assign(rollupObject.share.arkProjectConfig, rollupObject.share.projectConfig);
    this.throwArkTsCompilerError = rollupObject.share.throwArkTsCompilerError;
    this.sourceMapPath = this.getSourceMapSavePath();
    this.cacheSourceMapPath = path.join(this.projectConfig.cachePath, SOURCEMAPS_JSON);
    this.triggerAsync = rollupObject.async;
    this.triggerEndSignal = rollupObject.signal;
  }

  static init(rollupObject: Object): void {
    SourceMapGenerator.rollupObject = rollupObject;
    SourceMapGenerator.instance = new SourceMapGenerator(SourceMapGenerator.rollupObject);

    // adapt compatibility with hvigor
    if (!SourceMapGenerator.instance.projectConfig.entryModuleName ||
      !SourceMapGenerator.instance.projectConfig.entryModuleVersion) {
        SourceMapGenerator.instance.isNewSourceMap = false;
    }
  }

  static getInstance(): SourceMapGenerator {
    if (!SourceMapGenerator.instance) {
      SourceMapGenerator.instance = new SourceMapGenerator(SourceMapGenerator.rollupObject);
    }
    return SourceMapGenerator.instance;
  }

  //In window plateform, if receive path join by '/', should transform '/' to '\'
  private getAdaptedModuleId(moduleId: string): string {
    return moduleId.replace(/\//g, path.sep);
  }

  private getPkgInfoByModuleId(moduleId: string, shouldObfuscateFileName: boolean = false): Object {
    moduleId = this.getAdaptedModuleId(moduleId);

    const moduleInfo: Object = SourceMapGenerator.rollupObject.getModuleInfo(moduleId);
    if (!moduleInfo) {
      this.throwArkTsCompilerError(`ArkTS:INTERNAL ERROR: Failed to get ModuleInfo,\n` +
        `moduleId: ${moduleId}`);
    }
    const metaInfo: Object = moduleInfo['meta'];
    if (!metaInfo) {
      this.throwArkTsCompilerError(
        `ArkTS:INTERNAL ERROR: Failed to get ModuleInfo properties 'meta',\n` +
        `moduleId: ${moduleId}`);
    }
    const pkgPath = metaInfo['pkgPath'];
    if (!pkgPath) {
      this.throwArkTsCompilerError(
        `ArkTS:INTERNAL ERROR: Failed to get ModuleInfo properties 'meta.pkgPath',\n` +
        `moduleId: ${moduleId}`);
    }

    const dependencyPkgInfo = metaInfo['dependencyPkgInfo'];
    let middlePath = this.getIntermediateModuleId(moduleId.replace(pkgPath + path.sep, ''));
    if (shouldObfuscateFileName) {
      middlePath = mangleFilePath(middlePath);
    }
    return {
      entry: {
        name: this.projectConfig.entryModuleName,
        version: this.projectConfig.entryModuleVersion
      },
      dependency: dependencyPkgInfo ? {
        name: dependencyPkgInfo['pkgName'],
        version: dependencyPkgInfo['pkgVersion']
      } : undefined,
      modulePath: toUnixPath(middlePath)
    };
  }

  public setNewSoureMaps(isNewSourceMap: boolean): void {
    this.isNewSourceMap = isNewSourceMap;
  }

  public isNewSourceMaps(): boolean {
    return this.isNewSourceMap;
  }

  //generate sourcemap key, notice: moduleId is absolute path
  public genKey(moduleId: string, shouldObfuscateFileName: boolean = false): string {
    moduleId = this.getAdaptedModuleId(moduleId);

    let key: string = this.keyCache.get(moduleId);
    if (key && !shouldObfuscateFileName) {
      return key;
    }
    const pkgInfo = this.getPkgInfoByModuleId(moduleId, shouldObfuscateFileName);
    if (pkgInfo.dependency) {
      key = `${pkgInfo.entry.name}|${pkgInfo.dependency.name}|${pkgInfo.dependency.version}|${pkgInfo.modulePath}`;
    } else {
      key = `${pkgInfo.entry.name}|${pkgInfo.entry.name}|${pkgInfo.entry.version}|${pkgInfo.modulePath}`;
    }
    if (key && !shouldObfuscateFileName) {
      this.keyCache.set(moduleId, key);
    }
    return key;
  }

  private getSourceMapSavePath(): string {
    if (this.projectConfig.compileHar && this.projectConfig.sourceMapDir) {
      return path.join(this.projectConfig.sourceMapDir, SOURCEMAPS);
    }
    return isDebug(this.projectConfig) ? path.join(this.projectConfig.aceModuleBuild, SOURCEMAPS) :
      path.join(this.projectConfig.cachePath, SOURCEMAPS);
  }

  public buildModuleSourceMapInfo(parentEvent: Object): void {
    if (this.projectConfig.widgetCompile) {
      return;
    }

    const eventUpdateCachedSourceMaps = createAndStartEvent(parentEvent, 'update cached source maps');
    const cacheSourceMapObject: Object = this.updateCachedSourceMaps();
    stopEvent(eventUpdateCachedSourceMaps);

    this.triggerAsync(() => {
      const eventWriteFile = createAndStartEvent(parentEvent, 'write source map (async)', true);
      fs.writeFile(this.sourceMapPath, JSON.stringify(cacheSourceMapObject, null, 2), 'utf-8', (err) => {
        if (err) {
          this.throwArkTsCompilerError(`ArkTS:INTERNAL ERROR: Failed to write sourceMaps.\n` +
            `File: ${this.sourceMapPath}\n` +
            `Error message: ${err.message}`);
        }
        fs.copyFileSync(this.sourceMapPath, this.cacheSourceMapPath);
        stopEvent(eventWriteFile, true);
        this.triggerEndSignal();
      });
    });
  }

  //update cache sourcemap object
  public updateCachedSourceMaps(): Object {
    if (!this.isNewSourceMap) {
      this.modifySourceMapKeyToCachePath(this.sourceMaps);
    }

    let cacheSourceMapObject: Object;

    if (!fs.existsSync(this.cacheSourceMapPath)) {
      cacheSourceMapObject = this.sourceMaps;
    } else {
      cacheSourceMapObject = JSON.parse(fs.readFileSync(this.cacheSourceMapPath).toString());

      // remove unused source files's sourceMap
      let unusedFiles = [];
      let compileFileList: Set<string> = new Set();
      for (let moduleId of SourceMapGenerator.rollupObject.getModuleIds()) {
        // exclude .dts|.d.ets file
        if (isCommonJsPluginVirtualFile(moduleId) || !isCurrentProjectFiles(moduleId, this.projectConfig)) {
          continue;
        }

        if (this.isNewSourceMap) {
          const isPackageModules = isPackageModulesFile(moduleId, this.projectConfig);
          if (enableObfuscateFileName(isPackageModules, this.projectConfig)){
            compileFileList.add(this.genKey(moduleId, true));
          } else {
            compileFileList.add(this.genKey(moduleId));
          }
          continue;
        }

        // adapt compatibilty with hvigor
        moduleId = this.getIntermediateModuleId(
          toUnixPath(moduleId).replace(toUnixPath(this.projectConfig.projectRootPath), toUnixPath(this.projectConfig.cachePath)));
        compileFileList.add(moduleId);
      }

      Object.keys(cacheSourceMapObject).forEach(key => {
        if (!this.isNewSourceMap) {
          key = toUnixPath(path.join(this.projectConfig.projectRootPath, key));
        }
        if (!compileFileList.has(key)) {
          unusedFiles.push(key);
        }
      });
      unusedFiles.forEach(file => {
        delete cacheSourceMapObject[file];
      })

      // update sourceMap
      Object.keys(this.sourceMaps).forEach(key => {
        cacheSourceMapObject[key] = this.sourceMaps[key];
      });
    }
    // update the key for filename obfuscation
    for (let [key, newKey] of this.sourceMapKeyMappingForObf) {
      if(cacheSourceMapObject.hasOwnProperty(key) && key != newKey){
        this.updateSourceMapKeyWithObf(cacheSourceMapObject, key, newKey);
      }
    }
    return cacheSourceMapObject;
  }

  public getSourceMaps(): Object {
    return this.sourceMaps;
  }

  public getSourceMap(moduleId: string): Object {
    return this.getSpecifySourceMap(this.sourceMaps, moduleId);
  }

  //get specify sourcemap, allow receive param sourcemap
  public getSpecifySourceMap(specifySourceMap: Object, moduleId: string): Object {
    const key = this.isNewSourceMap ? this.genKey(moduleId) : moduleId;
    if (specifySourceMap && specifySourceMap[key]) {
      return specifySourceMap[key];
    }
    return undefined;
  }

  public updateSourceMap(moduleId: string, map: Object) {
    if (!this.sourceMaps) {
      this.sourceMaps = {};
    }
    this.updateSpecifySourceMap(this.sourceMaps, moduleId, map);
  }

  //update specify sourcemap, allow receive param sourcemap
  public updateSpecifySourceMap(specifySourceMap: Object, moduleId: string, sourceMap: Object) {
    const key = this.isNewSourceMap ? this.genKey(moduleId) : moduleId;
    specifySourceMap[key] = sourceMap;
  }

  public fillSourceMapPackageInfo(moduleId: string, sourcemap: Object) {
    if (!this.isNewSourceMap) {
      return;
    }

    const pkgInfo = this.getPkgInfoByModuleId(moduleId);
    sourcemap['entry-package-info'] = `${pkgInfo.entry.name}|${pkgInfo.entry.version}`;
    if (pkgInfo.dependency) {
      sourcemap['package-info'] = `${pkgInfo.dependency.name}|${pkgInfo.dependency.version}`;
    }
  }

  private getIntermediateModuleId(moduleId: string): string {
    let extName: string = "";
    switch (path.extname(moduleId)) {
      case EXTNAME_ETS: {
        extName = shouldETSOrTSFileTransformToJS(moduleId, this.projectConfig) ? EXTNAME_JS : EXTNAME_TS;
        break;
      }
      case EXTNAME_TS: {
        extName = shouldETSOrTSFileTransformToJS(moduleId, this.projectConfig) ? EXTNAME_JS : '';
        break;
      }
      case EXTNAME_JS:
      case EXTNAME_MJS:
      case EXTNAME_CJS: {
        extName = (moduleId.endsWith(EXTNAME_MJS) || moduleId.endsWith(EXTNAME_CJS)) ? EXTNAME_JS : '';
        break;
      }
      default:
        break;
    }
    if (extName.length !== 0) {
      return changeFileExtension(moduleId, extName);
    }
    return moduleId;
  }

  public setSourceMapPath(path: string): void {
    this.sourceMapPath = path;
  }

  public modifySourceMapKeyToCachePath(sourceMap: object): void {
    const projectConfig: object = this.projectConfig;

    // modify source map keys to keep IDE tools right
    const relativeCachePath: string = toUnixPath(projectConfig.cachePath.replace(
      projectConfig.projectRootPath + path.sep, ''));
    Object.keys(sourceMap).forEach(key => {
      let newKey: string = relativeCachePath + '/' + key;
      if (!newKey.endsWith(EXTNAME_JS)) {
        const moduleId: string = this.projectConfig.projectRootPath + path.sep + key;
        const extName: string = shouldETSOrTSFileTransformToJS(moduleId, this.projectConfig) ? EXTNAME_JS : EXTNAME_TS;
        newKey = changeFileExtension(newKey, extName);
      }
      const isOhModules = key.startsWith('oh_modules');
      newKey = handleObfuscatedFilePath(newKey, isOhModules, this.projectConfig);
      sourceMap[newKey] = sourceMap[key];
      delete sourceMap[key];
    });
  }

  public static cleanSourceMapObject(): void {
    if (this.instance) {
      this.instance.keyCache.clear();
      this.instance.sourceMaps = undefined;
      this.instance = undefined;
    }
  }

  private updateSourceMapKeyWithObf(specifySourceMap: Object, key: string, newKey: string): void {
    specifySourceMap[newKey] = specifySourceMap[key];
    delete specifySourceMap[key];
  }

  public saveKeyMappingForObfFileName(originalFilePath: string): void {
    this.sourceMapKeyMappingForObf.set(this.genKey(originalFilePath), this.genKey(originalFilePath, true));
  }

  public ChecksourceMapKeyMappingValue(valueToCheck: string): boolean {
    return Array.from(this.sourceMapKeyMappingForObf.values()).includes(valueToCheck);
  }

  //use by UT
  static initInstance(rollupObject: Object): SourceMapGenerator {
    if (!SourceMapGenerator.instance) {
      SourceMapGenerator.init(rollupObject);
    }
    return SourceMapGenerator.getInstance();
  }
}