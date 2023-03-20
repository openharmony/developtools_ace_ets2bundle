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

import path from 'path';
import fs from 'fs';
import cluster from 'cluster';
import childProcess from 'child_process';

import { CommonMode } from '../common/common_mode';
import {
  changeFileExtension,
  genCachePath,
  getEs2abcFileThreadNumber,
  genTemporaryModuleCacheDirectoryForBundle,
  isMasterOrPrimary,
  isSpecifiedExt
} from '../utils';
import {
  ES2ABC,
  EXTNAME_ABC,
  EXTNAME_JS,
  FILESINFO_TXT,
  JSBUNDLE,
  MAX_WORKER_NUMBER,
  TEMP_JS,
  TS2ABC,
  red,
  blue,
  FAIL,
  reset
} from '../common/ark_define';
import {
  mkDir,
  toHashData,
  toUnixPath,
  unlinkSync,
  validateFilePathLength
} from '../../../utils';
import {
  isEs2Abc,
  isTs2Abc
} from '../../../ark_utils';

interface File {
  filePath: string;
  cacheFilePath: string;
  sourceFile: string;
  size: number;
}

export class BundleMode extends CommonMode {
  intermediateJsBundle: Map<string, File>;
  filterIntermediateJsBundle: Array<File>;
  hashJsonObject: any;
  filesInfoPath: string;

  constructor(rollupObject: any, rollupBundleFileSet: any) {
    super(rollupObject);
    this.intermediateJsBundle = new Map<string, File>();
    this.filterIntermediateJsBundle = [];
    this.hashJsonObject = {};
    this.filesInfoPath = '';
    this.prepareForCompilation(rollupObject, rollupBundleFileSet);
  }

  prepareForCompilation(rollupObject: any, rollupBundleFileSet: any) {
    this.collectBundleFileList(rollupBundleFileSet);
    this.removeCacheInfo(rollupObject);
    this.filterBundleFileListWithHashJson();
  }

  collectBundleFileList(rollupBundleFileSet: any) {
    Object.keys(rollupBundleFileSet).forEach((fileName) => {
      // choose *.js
      if (this.projectConfig.aceModuleBuild && isSpecifiedExt(fileName, EXTNAME_JS)) {
        const tempFilePath: string = changeFileExtension(fileName, TEMP_JS);
        const outputPath: string = path.resolve(this.projectConfig.aceModuleBuild, tempFilePath);
        const cacheOutputPath: string = this.genCacheBundleFilePath(outputPath, tempFilePath);
        let rollupBundleSourceCode: string = '';
        if (rollupBundleFileSet[fileName].type === 'asset') {
          rollupBundleSourceCode = rollupBundleFileSet[fileName].source;
        } else if (rollupBundleFileSet[fileName].type === 'chunk') {
          rollupBundleSourceCode = rollupBundleFileSet[fileName].code;
        } else {
          this.throwArkTsCompilerError('ArkTS:ERROR failed to get rollup bundle file source code');
        }
        fs.writeFileSync(cacheOutputPath, rollupBundleSourceCode, 'utf-8');
        if (!fs.existsSync(cacheOutputPath)) {
          this.throwArkTsCompilerError('ArkTS:ERROR failed to generate cached source file');
        }
        this.collectIntermediateJsBundle(outputPath, cacheOutputPath);
      }
    });
  }

  filterBundleFileListWithHashJson() {
    if (this.intermediateJsBundle.size === 0) {
      return;
    }
    if (!fs.existsSync(this.hashJsonFilePath) || this.hashJsonFilePath.length === 0) {
      this.intermediateJsBundle.forEach((value) => {
        this.filterIntermediateJsBundle.push(value);
      });
      return;
    }
    let updatedJsonObject: any = {};
    let jsonObject: any = {};
    let jsonFile: string = '';
    jsonFile = fs.readFileSync(this.hashJsonFilePath).toString();
    jsonObject = JSON.parse(jsonFile);
    this.filterIntermediateJsBundle = [];
    for (const value of this.intermediateJsBundle.values()) {
      const cacheFilePath: string = value.cacheFilePath;
      const cacheAbcFilePath: string = changeFileExtension(cacheFilePath, EXTNAME_ABC);
      if (!fs.existsSync(cacheFilePath)) {
        this.throwArkTsCompilerError(`ArkTS:ERROR ${cacheFilePath} is lost`);
      }
      if (fs.existsSync(cacheAbcFilePath)) {
        const hashCacheFileContentData: any = toHashData(cacheFilePath);
        const hashAbcContentData: any = toHashData(cacheAbcFilePath);
        if (jsonObject[cacheFilePath] === hashCacheFileContentData &&
          jsonObject[cacheAbcFilePath] === hashAbcContentData) {
          updatedJsonObject[cacheFilePath] = hashCacheFileContentData;
          updatedJsonObject[cacheAbcFilePath] = hashAbcContentData;
          continue;
        }
      }
      this.filterIntermediateJsBundle.push(value);
    }

    this.hashJsonObject = updatedJsonObject;
  }

  executeArkCompiler() {
    if (isEs2Abc(this.projectConfig)) {
      this.filesInfoPath = this.generateFileInfoOfBundle();
      this.generateEs2AbcCmd(this.filesInfoPath);
      this.executeEs2AbcCmd();
    } else if (isTs2Abc(this.projectConfig)) {
      const splittedBundles: any[] = this.getSplittedBundles();
      this.invokeTs2AbcWorkersToGenAbc(splittedBundles);
    } else {
      this.throwArkTsCompilerError(`Invalid projectConfig.pandaMode for bundle build, should be either
        "${TS2ABC}" or "${ES2ABC}"`);
    }
  }

  afterCompilationProcess() {
    this.writeHashJson();
    this.copyFileFromCachePathToOutputPath();
    this.cleanTempCacheFiles();
  }

  private generateEs2AbcCmd(filesInfoPath: string) {
    const fileThreads: number = getEs2abcFileThreadNumber();
    this.cmdArgs.push(
      `"@${filesInfoPath}"`,
      '--file-threads',
      `"${fileThreads}"`
    );
  }

  private generateFileInfoOfBundle(): string {
    const filesInfoPath: string = genCachePath(FILESINFO_TXT, this.projectConfig, this.logger);
    let filesInfo: string = '';
    this.filterIntermediateJsBundle.forEach((info) => {
      const cacheFilePath: string = info.cacheFilePath;
      const recordName: string = 'null_recordName';
      const moduleType: string = 'script';
      const sourceFile: string = info.sourceFile;
      const abcFilePath: string = changeFileExtension(cacheFilePath, EXTNAME_ABC);
      filesInfo += `${cacheFilePath};${recordName};${moduleType};${sourceFile};${abcFilePath}\n`;
    });
    fs.writeFileSync(filesInfoPath, filesInfo, 'utf-8');

    return filesInfoPath;
  }

  private executeEs2AbcCmd() {
    // collect data error from subprocess
    let errMsg: string = '';
    const genAbcCmd: string = this.cmdArgs.join(' ');
    try {
      const child = this.triggerAsync(() => {
        return childProcess.exec(genAbcCmd, { windowsHide: true });
      });
      child.on('exit', (code: any) => {
        if (code === FAIL) {
          this.throwArkTsCompilerError('ArkTS:ERROR failed to execute es2abc');
        }
        this.afterCompilationProcess();
        this.triggerEndSignal();
      });

      child.on('error', (err: any) => {
        this.throwArkTsCompilerError(err.toString());
      });

      child.stderr.on('data', (data: any) => {
        errMsg += data.toString();
      });

      child.stderr.on('end', () => {
        if (errMsg !== undefined && errMsg.length > 0) {
          this.logger.error(red, errMsg, reset);
        }
      });
    } catch (e) {
      this.throwArkTsCompilerError('ArkTS:ERROR failed to execute es2abc with async handler: ' + e.toString());
    }
  }

  private genCacheBundleFilePath(outputPath: string, tempFilePath: string): string {
    let cacheOutputPath: string = '';
    if (this.projectConfig.cachePath) {
      cacheOutputPath = path.join(genTemporaryModuleCacheDirectoryForBundle(this.projectConfig), tempFilePath);
    } else {
      cacheOutputPath = outputPath;
    }
    validateFilePathLength(cacheOutputPath, this.logger);
    const parentDir: string = path.join(cacheOutputPath, '..');
    if (!(fs.existsSync(parentDir) && fs.statSync(parentDir).isDirectory())) {
      mkDir(parentDir);
    }

    return cacheOutputPath;
  }

  private collectIntermediateJsBundle(filePath: string, cacheFilePath: string) {
    const fileSize: any = fs.statSync(cacheFilePath).size;
    let sourceFile: string = changeFileExtension(filePath, '_.js', TEMP_JS);
    if (!this.arkConfig.isDebug && this.projectConfig.projectRootPath) {
      sourceFile = sourceFile.replace(this.projectConfig.projectRootPath + path.sep, '');
    }

    filePath = toUnixPath(filePath);
    cacheFilePath = toUnixPath(cacheFilePath);
    sourceFile = toUnixPath(sourceFile);
    const bundleFile: File = {
      filePath: filePath,
      cacheFilePath: cacheFilePath,
      sourceFile: sourceFile,
      size: fileSize
    };
    this.intermediateJsBundle.set(filePath, bundleFile);
  }

  private getSplittedBundles(): any[] {
    const splittedBundles: any[] = this.splitJsBundlesBySize(this.filterIntermediateJsBundle, MAX_WORKER_NUMBER);
    return splittedBundles;
  }

  private invokeTs2AbcWorkersToGenAbc(splittedBundles) {
    if (isMasterOrPrimary()) {
      this.setupCluster(cluster);
      const workerNumber: number = splittedBundles.length < MAX_WORKER_NUMBER ? splittedBundles.length : MAX_WORKER_NUMBER;
      for (let i = 0; i < workerNumber; ++i) {
        const workerData: any = {
          inputs: JSON.stringify(splittedBundles[i]),
          cmd: this.cmdArgs.join(' '),
          mode: JSBUNDLE
        };
        this.triggerAsync(() => {
          const worker: any = cluster.fork(workerData);
          worker.on('message', (errorMsg) => {
            this.logger.error(red, errorMsg.data.toString(), reset);
            this.throwArkTsCompilerError('ArkTS:ERROR failed to execute ts2abc, received error message.');
          });
        });
      }

      let workerCount: number = 0;
      cluster.on('exit', (worker, code, signal) => {
        if (code === FAIL) {
          this.throwArkTsCompilerError('ArkTS:ERROR failed to execute ts2abc, exit code non-zero');
        }
        workerCount++;
        if (workerCount === workerNumber) {
          this.afterCompilationProcess();
        }
        this.triggerEndSignal();
      });
    }
  }

  private getSmallestSizeGroup(groupSize: Map<number, number>): any {
    const groupSizeArray: any = Array.from(groupSize);
    groupSizeArray.sort(function(g1, g2) {
      return g1[1] - g2[1]; // sort by size
    });
    return groupSizeArray[0][0];
  }

  private splitJsBundlesBySize(bundleArray: Array<File>, groupNumber: number): any {
    const result: any = [];
    if (bundleArray.length < groupNumber) {
      for (const value of bundleArray) {
        result.push([value]);
      }
      return result;
    }

    bundleArray.sort(function(f1: File, f2: File) {
      return f2.size - f1.size;
    });
    const groupFileSize: any = new Map();
    for (let i = 0; i < groupNumber; ++i) {
      result.push([]);
      groupFileSize.set(i, 0);
    }

    let index: number = 0;
    while (index < bundleArray.length) {
      const smallestGroup: any = this.getSmallestSizeGroup(groupFileSize);
      result[smallestGroup].push(bundleArray[index]);
      const sizeUpdate: any = groupFileSize.get(smallestGroup) + bundleArray[index].size;
      groupFileSize.set(smallestGroup, sizeUpdate);
      index++;
    }
    return result;
  }

  private writeHashJson() {
    if (this.hashJsonFilePath.length === 0) {
      return;
    }

    for (let i = 0; i < this.filterIntermediateJsBundle.length; ++i) {
      const cacheFilePath: string = this.filterIntermediateJsBundle[i].cacheFilePath;
      const cacheAbcFilePath: string = changeFileExtension(cacheFilePath, EXTNAME_ABC);
      if (!fs.existsSync(cacheFilePath) || !fs.existsSync(cacheAbcFilePath)) {
        this.throwArkTsCompilerError(`ArkTS:ERROR ${cacheFilePath} or ${cacheAbcFilePath} is lost`);
      }
      const hashCacheFileContentData: any = toHashData(cacheFilePath);
      const hashCacheAbcContentData: any = toHashData(cacheAbcFilePath);
      this.hashJsonObject[cacheFilePath] = hashCacheFileContentData;
      this.hashJsonObject[cacheAbcFilePath] = hashCacheAbcContentData;
    }

    fs.writeFileSync(this.hashJsonFilePath, JSON.stringify(this.hashJsonObject), 'utf-8');
  }

  private copyFileFromCachePathToOutputPath() {
    for (const value of this.intermediateJsBundle.values()) {
      const abcFilePath: string = changeFileExtension(value.filePath, EXTNAME_ABC, TEMP_JS);
      const cacheAbcFilePath: string = changeFileExtension(value.cacheFilePath, EXTNAME_ABC);
      if (!fs.existsSync(cacheAbcFilePath)) {
        this.throwArkTsCompilerError(`ArkTS:ERROR ${cacheAbcFilePath} is lost`);
      }
      const parent: string = path.join(abcFilePath, '..');
      if (!(fs.existsSync(parent) && fs.statSync(parent).isDirectory())) {
        mkDir(parent);
      }
      // for preview mode, cache path and old abc file both exist, should copy abc file for updating
      if (this.projectConfig.cachePath !== undefined) {
        fs.copyFileSync(cacheAbcFilePath, abcFilePath);
      }
    }
  }

  private cleanTempCacheFiles() {
    // in xts mode, as cache path is not provided, cache files are located in output path, clear them
    if (this.projectConfig.cachePath !== undefined) {
      return;
    }

    for (const value of this.intermediateJsBundle.values()) {
      if (fs.existsSync(value.cacheFilePath)) {
        fs.unlinkSync(value.cacheFilePath);
      }
    }

    if (isEs2Abc(this.projectConfig) && fs.existsSync(this.filesInfoPath)) {
      unlinkSync(this.filesInfoPath);
    }
  }

  private removeCompilationCache(): void {
    if (fs.existsSync(this.hashJsonFilePath)) {
      fs.unlinkSync(this.hashJsonFilePath);
    }
  }
}
