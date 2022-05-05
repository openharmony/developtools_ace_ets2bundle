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
  genTemporaryPath } from './utils';
import { Compilation } from 'webpack';
import { projectConfig } from '../main';

const firstFileEXT: string = '_.js';
const genAbcScript = 'gen_abc.js';
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
let hashJsonObject = {};
let buildPathInfo = '';

const red: string = '\u001b[31m';
const reset: string = '\u001b[39m';
const hashFile = 'gen_hash.json';
const ARK = '/ark/';

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
      compilation.hooks.finishModules.tap("finishModules", handleFinishModules.bind(this));
    });

    compiler.hooks.compilation.tap("GenAbcPlugin", (compilation) => {
      compilation.hooks.afterOptimizeTree.tap("afterOptimizeModules", (chunks, modules) => {
        modules.forEach(module => {
          if (module != undefined && module.resourceResolveData != undefined) {
            let filePath: string = module.resourceResolveData.path;
            console.error(filePath);
          }      
      });
    });

    compilation.hooks.processAssets.tap("processAssets", (assets) => {
      Object.keys(compilation.assets).forEach(key => {
        delete assets[key];
      })
    })

  })

    compiler.hooks.emit.tap('GenAbcPlugin', (compilation) => {
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
      buildPathInfo = output;
      invokeWorkersToGenAbc();
    });


  }
}

function handleFinishModules(modules, callback) {
  modules.forEach(module => {
    if (module != undefined && module.resourceResolveData != undefined) {
      let filePath: string = module.resourceResolveData.path;
      console.error(filePath);
      if (filePath.endsWith('ets')) {
        let tempFilePath = genTemporaryPath(filePath, projectConfig.projectPath, projectConfig.buildPath);
        tempFilePath = tempFilePath.replace(/\.ets$/, '.ets.js');
        tempFilePath = toUnixPath(tempFilePath);
        const abcFilePath = genAbcFileName(tempFilePath);
        processToAbcFile(tempFilePath, abcFilePath);
      } else if (filePath.endsWith('ts')) {
        let tempFilePath = genTemporaryPath(filePath, projectConfig.projectPath, projectConfig.buildPath);
        tempFilePath = tempFilePath.replace(/\.ts$/, '.ts.js');
        tempFilePath = toUnixPath(tempFilePath);
        const abcFilePath = genAbcFileName(tempFilePath);
        processToAbcFile(tempFilePath, abcFilePath);
      } else if (filePath.endsWith('js')) {
        if (filePath.indexOf("node_modules") !== -1) {
          let tempFilePath = genTemporaryPath(filePath, projectConfig.projectPath, projectConfig.buildPath);
          tempFilePath = toUnixPath(tempFilePath);
          const parent: string = path.join(tempFilePath, '..');
          if (!(fs.existsSync(parent) && fs.statSync(parent).isDirectory())) {
            mkDir(parent);
          }
          fs.copyFileSync(filePath, tempFilePath);
          const abcFilePath = genAbcFileName(tempFilePath);
          processToAbcFile(tempFilePath, abcFilePath);
        } else {
          let tempFilePath = genTemporaryPath(filePath, projectConfig.projectPath, projectConfig.buildPath);
          tempFilePath = toUnixPath(tempFilePath);
          const parent: string = path.join(tempFilePath, '..');
          if (!(fs.existsSync(parent) && fs.statSync(parent).isDirectory())) {
            mkDir(parent);
          }
          // fs.copyFileSync(filePath, tempFilePath);
          const abcFilePath = genAbcFileName(tempFilePath);
          processToAbcFile(tempFilePath, abcFilePath);
        }
      } else {
        console.error("=========================handleFinishModules else===================");
        console.error(filePath);
      }
    }
  })
}

function genAbcFileName(temporaryFile: string): string {
  let abcFile: string = temporaryFile;
  if (temporaryFile.endsWith('ts')) {
    abcFile = temporaryFile.replace(/\.ts$/, '.abc');
  } else {
    abcFile = temporaryFile.replace(/\.js$/, '.abc');
  }
  return abcFile;
}

function processToAbcFile(tempFilePath, outPutFile) {
  let js2abc: string = path.join(arkDir, 'build', 'src', 'index.js');
  if (isWin) {
    js2abc = path.join(arkDir, 'build-win', 'src', 'index.js');
  } else if (isMac) {
    js2abc = path.join(arkDir, 'build-mac', 'src', 'index.js');
  }
  
  const args: string[] = [
    '--expose-gc',
    js2abc,
    '-o',
    outPutFile
  ];
  if (isDebug) {
    args.push('--debug');
  }
  args.push(tempFilePath);

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
