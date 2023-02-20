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

import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';
import cluster from 'cluster';

import {
  AUXILIARY,
  COMMONJS,
  ESM,
  EXTNAME_CJS,
  EXTNAME_ETS,
  EXTNAME_JS,
  EXTNAME_JSON,
  EXTNAME_MJS,
  EXTNAME_TS,
  FILESINFO_TXT,
  MAIN,
  MODULES_ABC,
  MODULES_CACHE,
  NPMENTRIES_TXT,
  SOURCEMAPS,
  SOURCEMAPS_JSON,
  TEMPORARY,
  HAP_PACKAGE,
  PACKAGES,
  PROJECT_PACKAGE
} from '../common/ark_define';
import {
  ESMODULE,
  EXTNAME_PROTO_BIN,
  EXTNAME_TXT,
  FILESINFO,
  MAX_WORKER_NUMBER,
  NPM_ENTRIES_PROTO_BIN,
  PROTOS,
  PROTO_FILESINFO_TXT,
  FAIL,
  red,
  reset
} from '../common/ark_define';
import {
  needAotCompiler,
  isMasterOrPrimary
} from '../utils';
import { CommonMode } from '../common/common_mode';
import { newSourceMaps } from '../transform';
import {
  changeFileExtension,
  genCachePath,
  getEs2abcFileThreadNumber,
  isCommonJsPluginVirtualFile,
  isCurrentProjectFiles
} from '../utils';
import {
  isPackageModulesFile,
  mkdirsSync,
  toUnixPath,
  toHashData,
  validateFilePathLength
} from '../../../utils';
import {
  getPackageInfo,
  getOhmUrlByFilepath
} from '../../../ark_utils';
import {
  generateAot,
  generateBuiltinAbc,
  FaultHandler
} from '../../../gen_aot'

export class ModuleInfo {
  filePath: string;
  cacheFilePath: string;
  recordName: string;
  isCommonJs: boolean;
  sourceFile: string;
  packageName: string;

  constructor(filePath: string, cacheFilePath: string, isCommonJs: boolean, recordName: string, sourceFile: string,
    packageName: string
  ) {
    this.filePath = filePath;
    this.cacheFilePath = cacheFilePath;
    this.recordName = recordName;
    this.isCommonJs = isCommonJs;
    this.sourceFile = sourceFile;
    this.packageName = packageName;
  }
}

export class PackageEntryInfo {
  // There are two types of modules : node_modules and oh_modules. Only one type exists in a project.
  // And there are two types of directories modules placed in: project root directory and entry directory.
  // take json5, a node_moduels placed in project root directory, as an example:
  // pkgEntryPath will be 'pkg_modules/0/json5', pkgBuildPath will be 'pkg_modules/0/json5/index'
  // 'pkg_modules' represents both oh_modules and node_moduels
  // '0' represents this module is placed in project root dir, modules placed in entry dir will be '1'
  pkgEntryPath: string;
  pkgBuildPath: string;
  constructor(pkgEntryPath: string, pkgBuildPath: string) {
    this.pkgEntryPath = pkgEntryPath;
    this.pkgBuildPath = pkgBuildPath;
  }
}

export class ModuleMode extends CommonMode {
  moduleInfos: Map<String, ModuleInfo>;
  pkgEntryInfos: Map<String, PackageEntryInfo>;
  hashJsonObject: any;
  cacheSourceMapObject: any;
  filesInfoPath: string;
  npmEntriesInfoPath: string;
  moduleAbcPath: string;
  sourceMapPath: string;
  cacheFilePath: string;
  cacheSourceMapPath: string;
  workerNumber: number;
  npmEntriesProtoFilePath: string;
  protoFilePath: string;
  filterModuleInfos: Map<String, ModuleInfo>;

  constructor(rollupObject: any) {
    super(rollupObject);
    this.moduleInfos = new Map<String, ModuleInfo>();
    this.pkgEntryInfos = new Map<String, PackageEntryInfo>();
    this.hashJsonObject = {};
    this.cacheSourceMapObject = {};
    this.filesInfoPath = path.join(this.projectConfig.cachePath, FILESINFO_TXT);
    this.npmEntriesInfoPath = path.join(this.projectConfig.cachePath, NPMENTRIES_TXT);
    this.moduleAbcPath = path.join(this.projectConfig.aceModuleBuild, MODULES_ABC);
    this.sourceMapPath = path.join(this.projectConfig.aceModuleBuild, SOURCEMAPS);
    this.cacheFilePath = path.join(this.projectConfig.cachePath, MODULES_CACHE);
    this.cacheSourceMapPath = path.join(this.projectConfig.cachePath, SOURCEMAPS_JSON);
    this.workerNumber = MAX_WORKER_NUMBER;
    this.npmEntriesProtoFilePath = path.join(this.projectConfig.cachePath, PROTOS, NPM_ENTRIES_PROTO_BIN);
    this.protoFilePath = path.join(this.projectConfig.cachePath, PROTOS, PROTO_FILESINFO_TXT);
    this.hashJsonObject = {};
    this.filterModuleInfos = new Map<String, ModuleInfo>();
  }

  collectModuleFileList(module: any, fileList: IterableIterator<string>) {
    let moduleInfos: Map<String, ModuleInfo> = new Map<String, ModuleInfo>();
    let pkgEntryInfos: Map<String, PackageEntryInfo> = new Map<String, PackageEntryInfo>();
    for (const moduleId of fileList) {
      if (isCommonJsPluginVirtualFile(moduleId) || !isCurrentProjectFiles(moduleId, this.projectConfig)) {
        continue;
      }
      const moduleInfo: any = module.getModuleInfo(moduleId);
      if (moduleInfo['meta']['isNodeModuleEntryFile']) {
        this.getPackageEntryInfo(moduleId, moduleInfo['meta'], pkgEntryInfos);
      }

      this.processModuleInfos(moduleId, moduleInfos, moduleInfo['meta']);
    }
    this.moduleInfos = moduleInfos;
    this.pkgEntryInfos = pkgEntryInfos;
  }

  private getPackageEntryInfo(filePath: string, metaInfo: any, pkgEntryInfos: Map<String, PackageEntryInfo>) {
    if (!metaInfo['packageJson']) {
      this.logger.debug("Failed to get 'packageJson' from metaInfo. File: ", filePath);
      return;
    }
    const pkgPath: string = metaInfo['packageJson']['pkgPath'];
    let originPkgEntryPath: string = toUnixPath(filePath.replace(pkgPath, ''));
    if (originPkgEntryPath.startsWith('/')) {
      originPkgEntryPath = originPkgEntryPath.slice(1, originPkgEntryPath.length);
    }
    const pkgEntryPath: string = toUnixPath(this.getPkgModulesFilePkgName(pkgPath));
    let pkgBuildPath: string = path.join(pkgEntryPath, originPkgEntryPath);
    pkgBuildPath = toUnixPath(pkgBuildPath.substring(0, pkgBuildPath.lastIndexOf('.')));

    pkgEntryInfos.set(pkgPath, new PackageEntryInfo(pkgEntryPath, pkgBuildPath));
  }

  private processModuleInfos(moduleId: string, moduleInfos: Map<String, ModuleInfo>, metaInfo?: any) {
    switch (path.extname(moduleId)) {
      case EXTNAME_ETS: {
        const extName: string = this.projectConfig.processTs ? EXTNAME_TS : EXTNAME_JS;
        this.addModuleInfoItem(moduleId, false, extName, metaInfo, moduleInfos);
        break;
      }
      case EXTNAME_TS: {
        const extName: string = this.projectConfig.processTs ? '' : EXTNAME_JS;
        this.addModuleInfoItem(moduleId, false, extName, metaInfo, moduleInfos);
        break;
      }
      case EXTNAME_JS:
      case EXTNAME_MJS:
      case EXTNAME_CJS: {
        const extName: string = (moduleId.endsWith(EXTNAME_MJS) || moduleId.endsWith(EXTNAME_CJS)) ? EXTNAME_JS : '';
        const isCommonJS: boolean = metaInfo && metaInfo['commonjs'] && metaInfo['commonjs']['isCommonJS'];
        this.addModuleInfoItem(moduleId, isCommonJS, extName, metaInfo, moduleInfos);
        break;
      }
      case EXTNAME_JSON: {
        this.addModuleInfoItem(moduleId, false, '', metaInfo, moduleInfos);
        break;
      }
      default:
        break;
    }
  }

  private addModuleInfoItem(filePath: string, isCommonJs: boolean, extName: string, metaInfo: any, moduleInfos: any) {
    let recordName: string = getOhmUrlByFilepath(filePath, this.projectConfig, this.logger);
    let sourceFile: string = filePath.replace(this.projectConfig.projectRootPath + path.sep, '');
    let cacheFilePath: string = '';
    let packageName: string = '';
    if (isPackageModulesFile(filePath, this.projectConfig)) {
      cacheFilePath = this.genPkgModulesFileCachePath(filePath, this.projectConfig.cachePath, this.projectConfig);
      packageName = this.getPkgModulesFilePkgName(metaInfo['packageJson']['pkgPath']);
    } else {
      cacheFilePath = this.genFileCachePath(filePath, this.projectConfig.projectPath, this.projectConfig.cachePath);
      packageName = getPackageInfo(this.projectConfig.aceModuleJsonPath)[1];
    }

    if (extName.length !== 0) {
      cacheFilePath = changeFileExtension(cacheFilePath, extName);
    }

    cacheFilePath = toUnixPath(cacheFilePath);
    recordName = toUnixPath(recordName);
    sourceFile = toUnixPath(sourceFile);
    packageName = toUnixPath(packageName);

    moduleInfos.set(filePath, new ModuleInfo(filePath, cacheFilePath, isCommonJs, recordName, sourceFile, packageName));
  }

  updateCachedSourceMaps(): void {
    if (!fs.existsSync(this.cacheSourceMapPath)) {
      this.cacheSourceMapObject = newSourceMaps;
      return;
    }

    this.cacheSourceMapObject = JSON.parse(fs.readFileSync(this.cacheSourceMapPath).toString());

    // remove unused source files's sourceMap
    let unusedFiles = [];
    let compileFileList: Set<string> = new Set();
    this.moduleInfos.forEach((moduleInfo: ModuleInfo, moduleId: string) => {
      compileFileList.add(toUnixPath(moduleId));
    })

    Object.keys(this.cacheSourceMapObject).forEach(key => {
      const sourceFileAbsolutePath: string = toUnixPath(path.join(this.projectConfig.projectRootPath, key));
      if (!compileFileList.has(sourceFileAbsolutePath)) {
        unusedFiles.push(key);
      }
    });
    unusedFiles.forEach(file => {
      delete this.cacheSourceMapObject[file];
    })

    // update sourceMap
    Object.keys(newSourceMaps).forEach(key => {
      this.cacheSourceMapObject[key] = newSourceMaps[key];
    });
  }

  buildModuleSourceMapInfo() {
    if (!this.arkConfig.isDebug) {
      return;
    }

    this.updateCachedSourceMaps();
    fs.writeFile(this.sourceMapPath, JSON.stringify(this.cacheSourceMapObject, null, 2), 'utf-8', (err) => {
      if (err) {
        this.throwArkTsCompilerError('ArkTS:ERROR failed to write sourceMaps');
      }
      fs.copyFileSync(this.sourceMapPath, this.cacheSourceMapPath);
    });
  }

  generateEs2AbcCmd() {
    const fileThreads = getEs2abcFileThreadNumber();
    this.cmdArgs.push(`"@${this.filesInfoPath}"`);
    this.cmdArgs.push('--npm-module-entry-list');
    this.cmdArgs.push(`"${this.npmEntriesInfoPath}"`);
    this.cmdArgs.push('--output');
    this.cmdArgs.push(`"${this.moduleAbcPath}"`);
    this.cmdArgs.push('--file-threads');
    this.cmdArgs.push(`"${fileThreads}"`);
    this.cmdArgs.push('--cache-file');
    this.cmdArgs.push(`"${this.cacheFilePath}"`);
    this.cmdArgs.push('--merge-abc');
  }

  private generateCompileFilesInfo() {
    let filesInfo: string = '';
    this.moduleInfos.forEach((info) => {
      const moduleType: string = info.isCommonJs ? COMMONJS : ESM;
      filesInfo += `${info.cacheFilePath};${info.recordName};${moduleType};${info.sourceFile};${info.packageName}\n`;
    });
    fs.writeFileSync(this.filesInfoPath, filesInfo, 'utf-8');
  }

  private generateNpmEntriesInfo() {
    let entriesInfo: string = '';
    for (const value of this.pkgEntryInfos.values()) {
      entriesInfo += `${value.pkgEntryPath}:${value.pkgBuildPath}\n`;
    }
    fs.writeFileSync(this.npmEntriesInfoPath, entriesInfo, 'utf-8');
  }

  private genDescriptionsForMergedEs2abc() {
    this.generateCompileFilesInfo();
    this.generateNpmEntriesInfo();
  }

  generateMergedAbcOfEs2Abc() {
    // collect data error from subprocess
    let errMsg: string = '';
    this.genDescriptionsForMergedEs2abc();
    const genAbcCmd: string = this.cmdArgs.join(' ');
    try {
      const child = this.triggerAsync(() => {
        return childProcess.exec(genAbcCmd, { windowsHide: true });
      });
      child.on('exit', (code: any) => {
        if (code === FAIL) {
          this.throwArkTsCompilerError('ArkTS:ERROR failed to execute es2abc');
        }
        this.triggerEndSignal();
      });

      child.on('error', (err: any) => {
        this.throwArkTsCompilerError(err.toString());
      });

      child.stderr.on('data', (data: any) => {
        errMsg += data.toString();
      });

      child.stderr.on('end', (data: any) => {
        if (errMsg !== undefined && errMsg.length > 0) {
          this.logger.error(red, errMsg, reset);
        }
      });
    } catch (e) {
      this.throwArkTsCompilerError('ArkTS:ERROR failed to execute es2abc. Error message: ' + e.toString());
    }
  }

  filterModulesByHashJson() {
    if (this.hashJsonFilePath.length === 0 || !fs.existsSync(this.hashJsonFilePath)) {
      for (const key of this.moduleInfos.keys()) {
        this.filterModuleInfos.set(key, this.moduleInfos.get(key));
      }
      return;
    }

    let updatedJsonObject: any = {};
    let jsonObject: any = {};
    let jsonFile: string = '';

    if (fs.existsSync(this.hashJsonFilePath)) {
      jsonFile = fs.readFileSync(this.hashJsonFilePath).toString();
      jsonObject = JSON.parse(jsonFile);
      this.filterModuleInfos = new Map<string, ModuleInfo>();
      for (const [key, value] of this.moduleInfos) {
        const cacheFilePath: string = value.cacheFilePath;
        const cacheProtoFilePath: string = changeFileExtension(cacheFilePath, EXTNAME_PROTO_BIN);
        if (!fs.existsSync(cacheFilePath)) {
          this.throwArkTsCompilerError(`ArkTS:ERROR ${cacheFilePath} is lost`);
        }
        if (fs.existsSync(cacheProtoFilePath)) {
          const hashCacheFileContentData: any = toHashData(cacheFilePath);
          const hashProtoFileContentData: any = toHashData(cacheProtoFilePath);
          if (jsonObject[cacheFilePath] === hashCacheFileContentData &&
            jsonObject[cacheProtoFilePath] === hashProtoFileContentData) {
            updatedJsonObject[cacheFilePath] = cacheFilePath;
            updatedJsonObject[cacheProtoFilePath] = cacheProtoFilePath;
            continue;
          }
        }
        this.filterModuleInfos.set(key, value);
      }
    }

    this.hashJsonObject = updatedJsonObject;
  }

  getSplittedModulesByNumber() {
    const result: any = [];
    if (this.filterModuleInfos.size < this.workerNumber) {
      for (const value of this.filterModuleInfos.values()) {
        result.push([value]);
      }
      return result;
    }

    for (let i = 0; i < this.workerNumber; ++i) {
      result.push([]);
    }

    let pos: number = 0;
    for (const value of this.filterModuleInfos.values()) {
      const chunk = pos % this.workerNumber;
      result[chunk].push(value);
      pos++;
    }

    return result;
  }

  invokeTs2AbcWorkersToGenProto(splittedModules) {
    let ts2abcCmdArgs: string[] = this.cmdArgs.slice(0);
    ts2abcCmdArgs.push('--output-proto');
    ts2abcCmdArgs.push('--merge-abc');
    ts2abcCmdArgs.push('--input-file');
    if (isMasterOrPrimary()) {
      this.setupCluster(cluster);
      this.workerNumber = splittedModules.length;
      for (let i = 0; i < this.workerNumber; ++i) {
        const sn: number = i + 1;
        const workerFileName: string = `${FILESINFO}_${sn}${EXTNAME_TXT}`;
        const workerData: any = {
          inputs: JSON.stringify(splittedModules[i]),
          cmd: ts2abcCmdArgs.join(' '),
          workerFileName: workerFileName,
          mode: ESMODULE,
          cachePath: this.projectConfig.cachePath
        };
        this.triggerAsync(() => {
          const worker: any = cluster.fork(workerData);
          worker.on('message', (errorMsg) => {
            this.logger.error(red, errorMsg.data.toString(), reset);
            this.throwArkTsCompilerError('ArkTS:ERROR failed to execute ts2abc');
          });
        });
      }
    }
  }

  processTs2abcWorkersToGenAbc() {
    this.generateNpmEntriesInfo();
    let workerCount: number = 0;
    if (isMasterOrPrimary()) {
      cluster.on('exit', (worker, code, signal) => {
        if (code === FAIL) {
          this.throwArkTsCompilerError('ArkTS:ERROR failed to execute ts2abc');
        }
        workerCount++;
        if (workerCount === this.workerNumber) {
          this.generateNpmEntryToGenProto();
          this.generateProtoFilesInfo();
          this.mergeProtoToAbc();
          this.processAotIfNeeded();
          this.afterCompilationProcess();
        }
        this.triggerEndSignal();
      });
      if (this.workerNumber == 0) {
        // process aot for no source file changed.
        this.processAotIfNeeded();
      }
    }
  }

  private processAotIfNeeded(): void {
    if (!needAotCompiler(this.projectConfig)) {
      return;
    }
    let faultHandler: FaultHandler = ((error: string) => { this.throwArkTsCompilerError(error); })
    const builtinAbcPath: string = generateBuiltinAbc(this.arkConfig.arkRootPath, this.cmdArgs,
      this.projectConfig.cachePath, this.logger, faultHandler);
    generateAot(this.arkConfig.arkRootPath, builtinAbcPath, this.projectConfig, this.logger, faultHandler);
  }

  private genFileCachePath(filePath: string, projectPath: string, cachePath: string,
    buildInHar: boolean = false): string {
    const sufStr: string = filePath.replace(projectPath, '');
    const output: string = path.join(cachePath, buildInHar ? '' : TEMPORARY, sufStr);
    return output;
  }

  private genPkgModulesFileCachePath(filePath: string, cachePath: string, projectConfig: any,
    buildInHar: boolean = false): string {
    const packageDir: string = projectConfig.packageDir;
    const fakePkgModulesPath: string = toUnixPath(path.join(projectConfig.projectRootPath, packageDir));
    filePath = toUnixPath(filePath);
    let output: string = '';
    if (filePath.indexOf(fakePkgModulesPath) === -1) {
      const hapPath: string = toUnixPath(projectConfig.projectRootPath);
      const tempFilePath: string = filePath.replace(hapPath, '');
      const sufStr: string = tempFilePath.substring(tempFilePath.indexOf(packageDir) + packageDir.length + 1);
      output = path.join(cachePath, buildInHar ? '' : TEMPORARY, packageDir, MAIN, sufStr);
    } else {
      output = filePath.replace(fakePkgModulesPath,
        path.join(cachePath, buildInHar ? '' : TEMPORARY, packageDir, AUXILIARY));
    }
    return output;
  }

  private getPkgModulesFilePkgName(pkgPath: string) {
    pkgPath = toUnixPath(pkgPath);
    const packageDir: string = this.projectConfig.packageDir;
    const projectRootPath = toUnixPath(this.projectConfig.projectRootPath);
    const projectPkgModulesPath: string = toUnixPath(path.join(projectRootPath, packageDir));
    let pkgName: string = '';
    if (pkgPath.includes(projectPkgModulesPath)) {
      pkgName = path.join(PACKAGES, PROJECT_PACKAGE, pkgPath.replace(projectPkgModulesPath, ''));
    } else {
      const tempFilePath: string = pkgPath.replace(projectRootPath, '');
      pkgName = path.join(PACKAGES, HAP_PACKAGE,
        tempFilePath.substring(tempFilePath.indexOf(packageDir) + packageDir.length + 1));
    }

    return pkgName.replace(packageDir, PACKAGES);
  }

  private generateProtoFilesInfo() {
    validateFilePathLength(this.protoFilePath, this.logger);
    mkdirsSync(path.dirname(this.protoFilePath));
    let protoFilesInfo: string = '';
    const sortModuleInfos: any = new Map([...this.moduleInfos].sort());
    for (const value of sortModuleInfos.values()) {
      const cacheProtoPath: string = changeFileExtension(value.cacheFilePath, EXTNAME_PROTO_BIN);
      protoFilesInfo += `${toUnixPath(cacheProtoPath)}\n`;
    }
    if (this.pkgEntryInfos.size > 0) {
      protoFilesInfo += `${toUnixPath(this.npmEntriesProtoFilePath)}\n`;
    }
    fs.writeFileSync(this.protoFilePath, protoFilesInfo, 'utf-8');
  }

  private mergeProtoToAbc() {
    mkdirsSync(this.projectConfig.aceModuleBuild);
    const cmd: any = `"${this.arkConfig.mergeAbcPath}" --input "@${this.protoFilePath}" --outputFilePath "${
      this.projectConfig.aceModuleBuild}" --output ${MODULES_ABC} --suffix protoBin`;
    try {
      childProcess.execSync(cmd, { windowsHide: true });
    } catch (e) {
      this.throwArkTsCompilerError(`ArkTS:ERROR failed to merge proto file to abc, error message:` + e.toString());
    }
  }

  private afterCompilationProcess() {
    this.writeHashJson();
  }

  private writeHashJson() {
    if (this.hashJsonFilePath.length === 0) {
      return;
    }

    for (const value of this.filterModuleInfos.values()) {
      const cacheFilePath: string = value.cacheFilePath;
      const cacheProtoFilePath: string = changeFileExtension(cacheFilePath, EXTNAME_PROTO_BIN);
      if (!fs.existsSync(cacheFilePath) || !fs.existsSync(cacheProtoFilePath)) {
        this.throwArkTsCompilerError(
          `ArkTS:ERROR ${cacheFilePath} or  ${cacheProtoFilePath} is lost`
        );
      }
      const hashCacheFileContentData: any = toHashData(cacheFilePath);
      const hashCacheProtoContentData: any = toHashData(cacheProtoFilePath);
      this.hashJsonObject[cacheFilePath] = hashCacheFileContentData;
      this.hashJsonObject[cacheProtoFilePath] = hashCacheProtoContentData;
    }

    fs.writeFileSync(this.hashJsonFilePath, JSON.stringify(this.hashJsonObject));
  }

  private generateNpmEntryToGenProto() {
    if (this.pkgEntryInfos.size <= 0) {
      return;
    }
    mkdirsSync(path.dirname(this.npmEntriesProtoFilePath));
    const cmd: string = `"${this.arkConfig.js2abcPath}" --compile-npm-entries "${
      this.npmEntriesInfoPath}" "${this.npmEntriesProtoFilePath}"`;
    try {
      childProcess.execSync(cmd, { windowsHide: true });
    } catch (e) {
      this.throwArkTsCompilerError(`ArkTS:ERROR failed to generate npm proto file to abc. Error message: ` + e.toString());
    }
  }
}
