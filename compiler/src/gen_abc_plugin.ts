/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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

import * as fs from 'fs';
import * as path from 'path';
import cluster from 'cluster';
import process from 'process';
import * as  child_process from 'child_process'
import Compiler from 'webpack/lib/Compiler';
import { logger } from './compile_info';
import { 
  toUnixPath,
  toHashData,
  genTemporaryPath, 
  genBuilldPath,
  genAbcFileName, 
  mkdirsSync,
  genSourceMapFileName,
  checkNodeModulesFile} from './utils';
import { Compilation } from 'webpack';
import { projectConfig } from '../main';

const firstFileEXT: string = '_.js';
const genAbcScript = 'gen_abc.js';
const genModuleAbcScript = 'gen_module_abc.js';
let output: string;
let isWin: boolean = false;
let isMac: boolean = false;
let isDebug: boolean = false;
let arkDir: string;
let nodeJs: string;

interface File {
  path: string,
  size: number
}
const intermediateJsBundle: Array<File> = [];
let fileterIntermediateJsBundle: Array<File> = [];
let moduleInfos = new Array<ModuleInfo>();
let filterModuleInfos = new Array<ModuleInfo>();
let commonJsModuleInfos = new Array<ModuleInfo>();
let ESMModuleInfos = new Array<ModuleInfo>();
let entryInfos = new Map<string, EntryInfo>();
let hashJsonObject = {};
let moduleHashJsonObject = {};
let buildPathInfo = '';

const red: string = '\u001b[31m';
const reset: string = '\u001b[39m';
const hashFile = 'gen_hash.json';
const ARK = '/ark/';

class ModuleInfo {
  filePath: string;
  tempFilePath: string;
  buildFilePath: string;
  abcFilePath: string;
  isCommonJs: boolean;

  constructor(filePath: string, tempFilePath: string, buildFilePath: string, abcFilePath: string, isCommonJs: boolean) {
    this.filePath  = filePath;
    this.tempFilePath = tempFilePath;
    this.buildFilePath = buildFilePath;
    this.abcFilePath = abcFilePath;
    this.isCommonJs = isCommonJs;
  }
}

class EntryInfo {
  npmInfo: string;
  abcFileName: string;
  buildPath: string;
  entry: string;

  constructor(npmInfo: string, abcFileName: string, buildPath: string, entry: string) {
    this.npmInfo = npmInfo;
    this.abcFileName = abcFileName;
    this.buildPath = buildPath;
    this.entry = entry;
  }
}

export class GenAbcPlugin {
  constructor(output_, arkDir_, nodeJs_, isDebug_) {
    output = output_;
    arkDir = arkDir_;
    nodeJs = nodeJs_;
    isDebug = isDebug_;
  }
  apply(compiler: Compiler) {
    if (fs.existsSync(path.resolve(arkDir, 'build-win'))) {
      isWin = true;
    } else {
      if (fs.existsSync(path.resolve(arkDir, 'build-mac'))) {
        isMac = true;
      } else {
        if (!fs.existsSync(path.resolve(arkDir, 'build'))) {
          logger.error(red, 'ETS:ERROR find build fail', reset);
          return;
        }
      }
    }

    compiler.hooks.compilation.tap("GenAbcPlugin", (compilation) => {
      if (process.env.bundleless === 'false') {
        return ;
      }
      buildPathInfo = output;
      compilation.hooks.finishModules.tap("finishModules", handleFinishModules.bind(this));
    });

    compiler.hooks.compilation.tap("GenAbcPlugin", (compilation) => {
      compilation.hooks.afterOptimizeTree.tap("afterOptimizeModules", (chunks, modules) => {
        if (process.env.bundleless === 'false') {
          return ;
        }
        modules.forEach(module => {
          if (module != undefined && module.resourceResolveData != undefined) {
            let filePath: string = module.resourceResolveData.path;
          }      
      });
    });

    compilation.hooks.processAssets.tap("processAssets", (assets) => {
      if (process.env.bundleless === 'false') {
        return ;
      }
      Object.keys(compilation.assets).forEach(key => {
        delete assets[key];
      })
    })

  })

    compiler.hooks.emit.tap('GenAbcPlugin', (compilation) => {
      if (process.env.bundleless === 'true') {
        return ;
      }
      Object.keys(compilation.assets).forEach(key => {
        // choose *.js
        if (output && path.extname(key) === '.js') {
          const newContent: string = compilation.assets[key].source();
          const keyPath: string = key.replace(/\.js$/, firstFileEXT);
          writeFileSync(newContent, path.resolve(output, keyPath), key);
        }
      });
    });

    compiler.hooks.afterEmit.tap('GenAbcPluginMultiThread', () => {
      if (process.env.bundleless === 'true') {
        return ;
      }
      buildPathInfo = output;
      invokeWorkersToGenAbc();
    });


  }
}

function getEntryInfo(tempFilePath: string, resourceResolveData: any) {
  if (!resourceResolveData.descriptionFilePath) {
    return ;
  }
  let packageName = resourceResolveData.descriptionFileData['name'];
  let packageJsonPath = resourceResolveData.descriptionFilePath;
  let npmInfoPath = path.resolve(packageJsonPath, "..");
  let fakeEntryPath = path.resolve(npmInfoPath, "fake.js");
  let tempFakeEntryPath = genTemporaryPath(fakeEntryPath, projectConfig.projectPath, process.env.cachePath);
  let buildFakeEntryPath = genBuilldPath(fakeEntryPath, projectConfig.projectPath, projectConfig.buildPath);
  npmInfoPath = toUnixPath(path.resolve(tempFakeEntryPath, ".."));
  let buildNpmInfoPath = toUnixPath(path.resolve(buildFakeEntryPath, ".."));
  if (entryInfos.has(npmInfoPath)) {
    return ;
  }

  let npmInfoPaths = npmInfoPath.split("node_modules");
  let npmInfo = ["node_modules", npmInfoPaths[npmInfoPaths.length - 1]].join(path.sep);
  npmInfo = toUnixPath(npmInfo);
  let abcFileName = genAbcFileName(tempFilePath);
  let abcFilePaths = abcFileName.split("node_modules");
  abcFileName = ["node_modules", abcFilePaths[abcFilePaths.length - 1]].join(path.sep);
  abcFileName = toUnixPath(abcFileName);
  // let entry = resourceResolveData.descriptionFileData['main'] ?? "";
  let packagePaths = tempFilePath.split('node_modules');
  let entryPaths = packagePaths[packagePaths.length-1].split(packageName);
  let entry = toUnixPath(entryPaths[entryPaths.length - 1]);
  let entryInfo = new EntryInfo(npmInfoPath, abcFileName, buildNpmInfoPath, entry);
  entryInfos.set(npmInfoPath, entryInfo);
}

function processNodeModulesFile(filePath: string, tempFilePath: string, buildFilePath: string, abcFilePath: string, nodeModulesFile: Array<string>, module: any) {
  getEntryInfo(tempFilePath, module.resourceResolveData);
  let descriptionFileData = module.resourceResolveData.descriptionFileData
  if (descriptionFileData && descriptionFileData["type"] && descriptionFileData["type"] == "module") {
    let tempModuleInfo = new ModuleInfo(filePath, tempFilePath, buildFilePath, abcFilePath, false);
    moduleInfos.push(tempModuleInfo);
    nodeModulesFile.push(tempFilePath);
  } else if (filePath.endsWith('mjs')) {
    let tempModuleInfo = new ModuleInfo(filePath, tempFilePath, buildFilePath, abcFilePath, false);
    moduleInfos.push(tempModuleInfo);
    nodeModulesFile.push(tempFilePath);
  } else {
    let tempModuleInfo = new ModuleInfo(filePath, tempFilePath, buildFilePath, abcFilePath, true);
    moduleInfos.push(tempModuleInfo);
    nodeModulesFile.push(tempFilePath);
  }

  return ;
}

function processEtsModule(filePath: string, tempFilePath: string, buildFilePath: string, nodeModulesFile: Array<string>, module: any) {
  if (process.env.processTs && process.env.processTs === 'true') {
    tempFilePath = tempFilePath.replace(/\.ets$/, '.ets.ts');
    buildFilePath = buildFilePath.replace(/\.ets$/, '.ets.ts');
  } else {
    tempFilePath = tempFilePath.replace(/\.ets$/, '.ets.js');
    buildFilePath = buildFilePath.replace(/\.ets$/, '.ets.js');
  }
  const abcFilePath = genAbcFileName(tempFilePath);
  if (checkNodeModulesFile(filePath,  projectConfig.projectPath)) {
    processNodeModulesFile(filePath, tempFilePath, buildFilePath, abcFilePath, nodeModulesFile, module);
  } else {
    let tempModuleInfo = new ModuleInfo(filePath, tempFilePath, buildFilePath, abcFilePath, false);
    moduleInfos.push(tempModuleInfo);
  }
}

function processTsModule(filePath: string, tempFilePath: string, buildFilePath: string, nodeModulesFile: Array<string>, module: any) {
  if (process.env.processTs && process.env.processTs === 'false') {
    tempFilePath = tempFilePath.replace(/\.ts$/, '.ts.js');
    buildFilePath = buildFilePath.replace(/\.ts$/, '.ts.js');
  }
  const abcFilePath = genAbcFileName(tempFilePath);
  if (checkNodeModulesFile(filePath,  projectConfig.projectPath)) {
    processNodeModulesFile(filePath, tempFilePath, buildFilePath, abcFilePath, nodeModulesFile, module);
  } else {
    let tempModuleInfo = new ModuleInfo(filePath, tempFilePath, buildFilePath, abcFilePath, false);
    moduleInfos.push(tempModuleInfo);
  }
}

function processJsModule(filePath: string, tempFilePath: string, buildFilePath: string, nodeModulesFile: Array<string>, module: any) {
  const parent: string = path.join(tempFilePath, '..');
  if (!(fs.existsSync(parent) && fs.statSync(parent).isDirectory())) {
    mkDir(parent);
  }
  if (filePath.endsWith('mjs') || filePath.endsWith('cjs')) {
    fs.copyFileSync(filePath, tempFilePath);
  }
  const abcFilePath = genAbcFileName(tempFilePath);
  if (checkNodeModulesFile(filePath,  projectConfig.projectPath)) {
    processNodeModulesFile(filePath, tempFilePath, buildFilePath, abcFilePath, nodeModulesFile, module);
  } else {
    let tempModuleInfo = new ModuleInfo(filePath, tempFilePath, buildFilePath, abcFilePath, false);
    moduleInfos.push(tempModuleInfo);
  }
}

function handleFinishModules(modules, callback) {
  let nodeModulesFile = new Array<string>();
  modules.forEach(module => {
    if (module != undefined && module.resourceResolveData != undefined) {
      let filePath: string = module.resourceResolveData.path;
      let tempFilePath = genTemporaryPath(filePath, projectConfig.projectPath, process.env.cachePath);
      let buildFilePath = genBuilldPath(filePath, projectConfig.projectPath, projectConfig.buildPath);
      tempFilePath = toUnixPath(tempFilePath);
      buildFilePath = toUnixPath(buildFilePath);
      if (tempFilePath.length === 0) {
        return ;
      }
      if (filePath.endsWith('ets')) {
        processEtsModule(filePath, tempFilePath, buildFilePath, nodeModulesFile, module);
      } else if (filePath.endsWith('ts')) {
        processTsModule(filePath, tempFilePath, buildFilePath, nodeModulesFile, module);
      } else if (filePath.endsWith('js') || filePath.endsWith('mjs') || filePath.endsWith('cjs')) {
        processJsModule(filePath, tempFilePath, buildFilePath, nodeModulesFile, module);
      } else {
        console.error("ETS error: Cannot find resolve this file path: ", filePath);
      }
    }
  });

  invokeWorkersModuleToGenAbc(moduleInfos);
  processEntryToGenAbc(entryInfos);
}

function processEntryToGenAbc(entryInfos: Map<string, EntryInfo>) {
  for(let [key, value] of entryInfos) {
    let tempAbcFilePath = toUnixPath(path.resolve(value.npmInfo, 'entry.txt'));
    let buildAbcFilePath = toUnixPath(path.resolve(value.buildPath, 'entry.txt'));
    fs.writeFileSync(tempAbcFilePath, value.entry, 'utf-8');
    if (!fs.existsSync(buildAbcFilePath)) {
      mkDir(value.buildPath);
    }
    fs.copyFileSync(tempAbcFilePath, buildAbcFilePath);
  }
}

function processToAbcFile(nodeModulesFile: Array<string>) {
  let js2abc: string = path.join(arkDir, 'build', 'src', 'index.js');
  if (isWin) {
    js2abc = path.join(arkDir, 'build-win', 'src', 'index.js');
  } else if (isMac) {
    js2abc = path.join(arkDir, 'build-mac', 'src', 'index.js');
  }
  
  const args: string[] = [
    '--expose-gc',
    js2abc
  ];
  if (isDebug) {
    args.push('--debug');
  }
  nodeModulesFile.forEach(ele => {
    args.push(ele);
  });

  child_process.execFileSync(nodeJs, args);
}

function writeFileSync(inputString: string, output: string, jsBundleFile: string): void {
  const parent: string = path.join(output, '..');
  if (!(fs.existsSync(parent) && fs.statSync(parent).isDirectory())) {
    mkDir(parent);
  }
  fs.writeFileSync(output, inputString);
  if (fs.existsSync(output)) {
    const fileSize = fs.statSync(output).size;
    intermediateJsBundle.push({path: output, size: fileSize});
  } else {
    logger.error(red, `ETS:ERROR Failed to convert file ${jsBundleFile} to bin. ${output} is lost`, reset);
  }
}

function mkDir(path_: string): void {
  const parent: string = path.join(path_, '..');
  if (!(fs.existsSync(parent) && !fs.statSync(parent).isFile())) {
    mkDir(parent);
  }
  fs.mkdirSync(path_);
}

function getSmallestSizeGroup(groupSize: Map<number, number>) {
  const groupSizeArray = Array.from(groupSize);
  groupSizeArray.sort(function(g1, g2) {
    return g1[1] - g2[1]; // sort by size
  });
  return groupSizeArray[0][0];
}

function splitJsBundlesBySize(bundleArray: Array<File>, groupNumber: number) {
  const result = [];
  if (bundleArray.length < groupNumber) {
    result.push(bundleArray);
    return result;
  }

  bundleArray.sort(function(f1: File, f2: File) {
    return f2.size - f1.size;
  });
  const groupFileSize = new Map();
  for (let i = 0; i < groupNumber; ++i) {
    result.push([]);
    groupFileSize.set(i, 0);
  }

  let index = 0;
  while (index < bundleArray.length) {
    const smallestGroup = getSmallestSizeGroup(groupFileSize);
    result[smallestGroup].push(bundleArray[index]);
    const sizeUpdate = groupFileSize.get(smallestGroup) + bundleArray[index].size;
    groupFileSize.set(smallestGroup, sizeUpdate);
    index++;
  }
  return result;
}

function invokeWorkersModuleToGenAbc(moduleInfos: Array<ModuleInfo>) {
  if (fs.existsSync(buildPathInfo)) {
    fs.rmdirSync(buildPathInfo, { recursive : true});
  }
  filterIntermediateModuleByHashJson(buildPathInfo, moduleInfos);
  filterModuleInfos.forEach(moduleInfo => {
    if (moduleInfo.isCommonJs) {
      commonJsModuleInfos.push(moduleInfo);
    } else {
      ESMModuleInfos.push(moduleInfo);
    }
  });

  invokeCluterModuleToAbc();
}

function initAbcEnv() : string[] {
  let js2abc: string = path.join(arkDir, 'build', 'src', 'index.js');
  if (isWin) {
    js2abc = path.join(arkDir, 'build-win', 'src', 'index.js');
  } else if (isMac) {
    js2abc = path.join(arkDir, 'build-mac', 'src', 'index.js');
  }

  const args: string[] = [
    '--expose-gc',
    js2abc
  ];
  if (isDebug) {
    args.push('--debug');
  }

  return args;
}

function invokeCluterModuleToAbc() {
  let abcArgs = initAbcEnv();

  const clusterNewApiVersion = 16;
  const currentNodeVersion = parseInt(process.version.split('.')[0]);
  const useNewApi = currentNodeVersion >= clusterNewApiVersion;

  if (useNewApi && cluster.isPrimary || !useNewApi && cluster.isMaster) {
    if (useNewApi) {
      cluster.setupPrimary({
        exec: path.resolve(__dirname, genModuleAbcScript)
      });
    } else {
      cluster.setupMaster({
        exec: path.resolve(__dirname, genModuleAbcScript)
      });
    }

    if (commonJsModuleInfos.length > 0) {
      let tempAbcArgs = abcArgs.slice(0);
      tempAbcArgs.push("-c");
      let commonJsCmdPrefix =  `${nodeJs} ${tempAbcArgs.join(" ")}`;
      const workerData = {
        'inputs': JSON.stringify(commonJsModuleInfos),
        'cmd': commonJsCmdPrefix
      };
      cluster.fork(workerData);
    }
    if (ESMModuleInfos.length > 0) {
      let tempAbcArgs = abcArgs.slice(0);
      tempAbcArgs.push("-m");
      let ESMCmdPrefix =  `${nodeJs} ${tempAbcArgs.join(" ")}`;
      const workerData = {
        'inputs': JSON.stringify(ESMModuleInfos),
        'cmd': ESMCmdPrefix
      };
      cluster.fork(workerData);
    }

    cluster.on('exit', (worker, code, signal) => {
      logger.debug(`worker ${worker.process.pid} finished`);
    });

    process.on('exit', (code) => {
      writeModuleHashJson();
    });
  }
}

function splitModuleBySize(moduleInfos: Array<ModuleInfo>, groupNumber: number) {
  const result = [];
  if (moduleInfos.length < groupNumber) {
    result.push(moduleInfos);
    return result;
  }

  for (let i = 0; i < groupNumber; ++i) {
    result.push([]);
  }
  for (let i =0;i<moduleInfos.length;i++) {
    let pos = i%groupNumber;
    result[pos].push(moduleInfos[i]);
  }
  return result;
}

function invokeWorkersToGenAbc() {
  let param: string = '';
  if (isDebug) {
    param += ' --debug';
  }

  let js2abc: string = path.join(arkDir, 'build', 'src', 'index.js');
  if (isWin) {
    js2abc = path.join(arkDir, 'build-win', 'src', 'index.js');
  } else if (isMac) {
    js2abc = path.join(arkDir, 'build-mac', 'src', 'index.js');
  }

  filterIntermediateJsBundleByHashJson(buildPathInfo, intermediateJsBundle);
  const maxWorkerNumber = 3;
  const splitedBundles = splitJsBundlesBySize(fileterIntermediateJsBundle, maxWorkerNumber);
  const workerNumber = maxWorkerNumber < splitedBundles.length ? maxWorkerNumber : splitedBundles.length;
  const cmdPrefix: string = `${nodeJs} --expose-gc "${js2abc}" ${param} `;

  const clusterNewApiVersion = 16;
  const currentNodeVersion = parseInt(process.version.split('.')[0]);
  const useNewApi = currentNodeVersion >= clusterNewApiVersion;

  if (useNewApi && cluster.isPrimary || !useNewApi && cluster.isMaster) {
    if (useNewApi) {
      cluster.setupPrimary({
        exec: path.resolve(__dirname, genAbcScript)
      });
    } else {
      cluster.setupMaster({
        exec: path.resolve(__dirname, genAbcScript)
      });
    }

    for (let i = 0; i < workerNumber; ++i) {
      const workerData = {
        'inputs': JSON.stringify(splitedBundles[i]),
        'cmd': cmdPrefix
      };
      cluster.fork(workerData);
    }

    cluster.on('exit', (worker, code, signal) => {
      logger.debug(`worker ${worker.process.pid} finished`);
    });

    process.on('exit', (code) => {
      writeHashJson();
    });
  }
}

function filterIntermediateModuleByHashJson(buildPath: string, moduleInfos: Array<ModuleInfo>) {
  for (let i = 0; i < moduleInfos.length; ++i) {
    filterModuleInfos.push(moduleInfos[i]);
  }
  const hashFilePath = genHashJsonPath(buildPath);
  if (hashFilePath.length === 0) {
    return;
  }
  const updateJsonObject = {};
  let jsonObject = {};
  let jsonFile = '';
  if (fs.existsSync(hashFilePath)) {
    jsonFile = fs.readFileSync(hashFilePath).toString();
    jsonObject = JSON.parse(jsonFile);
    filterModuleInfos = [];
    for (let i = 0; i < moduleInfos.length; ++i) {
      const input = moduleInfos[i].tempFilePath;
      const abcPath = moduleInfos[i].abcFilePath;
      if (!fs.existsSync(input)) {
        logger.error(red, `ETS:ERROR ${input} is lost`, reset);
        continue;
      }
      if (fs.existsSync(abcPath)) {
        const hashInputContentData = toHashData(input);
        const hashAbcContentData = toHashData(abcPath);
        if (jsonObject[input] === hashInputContentData && jsonObject[abcPath] === hashAbcContentData) {
          updateJsonObject[input] = hashInputContentData;
          updateJsonObject[abcPath] = hashAbcContentData;
          mkdirsSync(path.dirname(moduleInfos[i].buildFilePath));
          fs.copyFileSync(moduleInfos[i].tempFilePath, moduleInfos[i].buildFilePath);
          fs.copyFileSync(genAbcFileName(moduleInfos[i].tempFilePath), genAbcFileName(moduleInfos[i].buildFilePath));
          if (process.env.buildMode == "debug" && fs.existsSync(genSourceMapFileName(moduleInfos[i].tempFilePath))) {
            fs.copyFileSync(genSourceMapFileName(moduleInfos[i].tempFilePath), genSourceMapFileName(moduleInfos[i].buildFilePath));
          }
        } else {
          filterModuleInfos.push(moduleInfos[i]);
        }
      } else {
        filterModuleInfos.push(moduleInfos[i]);
      }
    }
  }

  moduleHashJsonObject = updateJsonObject;
}

function writeModuleHashJson() {
  for (let i = 0; i < filterModuleInfos.length; ++i) {
    const input = filterModuleInfos[i].tempFilePath;
    const abcPath = filterModuleInfos[i].abcFilePath;
    if (!fs.existsSync(input) || !fs.existsSync(abcPath)) {
      logger.error(red, `ETS:ERROR ${input} is lost`, reset);
      continue;
    }
    const hashInputContentData = toHashData(input);
    const hashAbcContentData = toHashData(abcPath);
    moduleHashJsonObject[input] = hashInputContentData;
    moduleHashJsonObject[abcPath] = hashAbcContentData;
    mkdirsSync(path.dirname(filterModuleInfos[i].buildFilePath));
    fs.copyFileSync(filterModuleInfos[i].tempFilePath, filterModuleInfos[i].buildFilePath);
    fs.copyFileSync(genAbcFileName(filterModuleInfos[i].tempFilePath), genAbcFileName(filterModuleInfos[i].buildFilePath));
    if (process.env.buildMode == "debug" && fs.existsSync(genSourceMapFileName(moduleInfos[i].tempFilePath))) {
      fs.copyFileSync(genSourceMapFileName(moduleInfos[i].tempFilePath), genSourceMapFileName(moduleInfos[i].buildFilePath));
    }
  }
  const hashFilePath = genHashJsonPath(buildPathInfo);
  if (hashFilePath.length === 0) {
    return;
  }
  fs.writeFileSync(hashFilePath, JSON.stringify(moduleHashJsonObject));
}

function filterIntermediateJsBundleByHashJson(buildPath: string, inputPaths: File[]) {
  for (let i = 0; i < inputPaths.length; ++i) {
    fileterIntermediateJsBundle.push(inputPaths[i]);
  }
  const hashFilePath = genHashJsonPath(buildPath);
  if (hashFilePath.length === 0) {
    return;
  }
  const updateJsonObject = {};
  let jsonObject = {};
  let jsonFile = '';
  if (fs.existsSync(hashFilePath)) {
    jsonFile = fs.readFileSync(hashFilePath).toString();
    jsonObject = JSON.parse(jsonFile);
    fileterIntermediateJsBundle = [];
    for (let i = 0; i < inputPaths.length; ++i) {
      const input = inputPaths[i].path;
      const abcPath = input.replace(/_.js$/, '.abc');
      if (!fs.existsSync(input)) {
        logger.error(red, `ETS:ERROR ${input} is lost`, reset);
        continue;
      }
      if (fs.existsSync(abcPath)) {
        const hashInputContentData = toHashData(input);
        const hashAbcContentData = toHashData(abcPath);
        if (jsonObject[input] === hashInputContentData && jsonObject[abcPath] === hashAbcContentData) {
          updateJsonObject[input] = hashInputContentData;
          updateJsonObject[abcPath] = hashAbcContentData;
          fs.unlinkSync(input);
        } else {
          fileterIntermediateJsBundle.push(inputPaths[i]);
        }
      } else {
        fileterIntermediateJsBundle.push(inputPaths[i]);
      }
    }
  }

  hashJsonObject = updateJsonObject;
}

function writeHashJson() {
  for (let i = 0; i < fileterIntermediateJsBundle.length; ++i) {
    const input = fileterIntermediateJsBundle[i].path;
    const abcPath = input.replace(/_.js$/, '.abc');
    if (!fs.existsSync(input) || !fs.existsSync(abcPath)) {
      logger.error(red, `ETS:ERROR ${input} is lost`, reset);
      continue;
    }
    const hashInputContentData = toHashData(input);
    const hashAbcContentData = toHashData(abcPath);
    hashJsonObject[input] = hashInputContentData;
    hashJsonObject[abcPath] = hashAbcContentData;
    fs.unlinkSync(input);
  }
  const hashFilePath = genHashJsonPath(buildPathInfo);
  if (hashFilePath.length === 0) {
    return;
  }
  fs.writeFileSync(hashFilePath, JSON.stringify(hashJsonObject));
}

function genHashJsonPath(buildPath: string) {
  buildPath = toUnixPath(buildPath);
  if (process.env.cachePath) {
    if (!fs.existsSync(process.env.cachePath) || !fs.statSync(process.env.cachePath).isDirectory()) {
      logger.error(red, `ETS:ERROR hash path does not exist`, reset);
      return '';
    }
    return path.join(process.env.cachePath, hashFile);
  } else if (buildPath.indexOf(ARK) >= 0) {
    const dataTmps = buildPath.split(ARK);
    const hashPath = path.join(dataTmps[0], ARK);
    if (!fs.existsSync(hashPath) || !fs.statSync(hashPath).isDirectory()) {
      logger.error(red, `ETS:ERROR hash path does not exist`, reset);
      return '';
    }
    return path.join(hashPath, hashFile);
  } else {
    logger.debug(red, `ETS:ERROR not cache exist`, reset);
    return '';
  }
}
