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
import Compiler from 'webpack/lib/Compiler';
import { logger } from './compile_info';
import { toUnixPath } from './utils';
import { createHash } from 'crypto';

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
let intermediateJsBundle: Array<File> = [];
let fileterIntermediateJsBundle: Array<File> = [];
let hashJsonObject = {};
let buildPathInfo = "";

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
  let result = [];
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
  const useNewApi = currentNodeVersion >= clusterNewApiVersion ? true : false;

  if ((useNewApi && cluster.isPrimary) || (!useNewApi && cluster.isMaster)) {
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
      let workerData = {
        "inputs": JSON.stringify(splitedBundles[i]),
        "cmd": cmdPrefix
      }
      cluster.fork(workerData);
    }

    cluster.on('exit', (worker, code, signal) => {
      logger.debug(`worker ${worker.process.pid} finished`);
    });

    process.on('exit', (code) => {
      if (buildPathInfo.indexOf(ARK)) {
        const hashPath = genHashJsonPath(buildPathInfo);
        const hashFilePath = path.join(hashPath, hashFile);
        const parent: string = path.join(hashFilePath, '..');
        if (!(fs.existsSync(parent) && !fs.statSync(parent).isFile())) {
          mkDir(parent);
        }
        for (let i = 0; i < fileterIntermediateJsBundle.length; ++i) {
          let input = fileterIntermediateJsBundle[i].path;
          let abcPath = input.replace(/_.js$/, '.abc');
          if (fs.existsSync(input) && fs.existsSync(abcPath)) {
            const inputContent = fs.readFileSync(input);
            const hashInput = createHash('sha256');
            hashInput.update(inputContent);
            const hashInputContentData = hashInput.digest('hex');
            const abcContent = fs.readFileSync(abcPath);
            const hashAbc = createHash('sha256');
            hashAbc.update(abcContent);
            const hashAbcContentData = hashAbc.digest('hex');
            hashJsonObject[input] = hashInputContentData;
            hashJsonObject[abcPath] = hashAbcContentData;
          }
          if (fs.existsSync(input)) {
            fs.unlinkSync(input);
          }
        }
        fs.writeFileSync(hashFilePath, JSON.stringify(hashJsonObject));
      }
    })
  }
}

function filterIntermediateJsBundleByHashJson(buildPath: string, inputPaths: File[]) {
  for (let i = 0; i < inputPaths.length; ++i) {
    fileterIntermediateJsBundle.push(inputPaths[i]);
  }
  let updateJsonObject = {};
  if (buildPath.indexOf(ARK)) {
    const hashPath = genHashJsonPath(buildPath);
    const hashFilePath = path.join(hashPath, hashFile);
    let jsonObject = {};
    let jsonFile = "";
    if (fs.existsSync(hashFilePath)) {
      jsonFile = fs.readFileSync(hashFilePath).toString();
      jsonObject = JSON.parse(jsonFile);
      fileterIntermediateJsBundle = [];
      for (let i = 0; i < inputPaths.length; ++i) {
        let input = inputPaths[i].path;
        let abcPath = input.replace(/_.js$/, '.abc');
        if (fs.existsSync(input) && fs.existsSync(abcPath)) {
          const inputContent = fs.readFileSync(input);
          const hashInput = createHash('sha256');
          hashInput.update(inputContent);
          const hashInputContentData = hashInput.digest('hex');
          const abcContent = fs.readFileSync(abcPath);
          const hashAbc = createHash('sha256');
          hashAbc.update(abcContent);
          const hashAbcContentData = hashAbc.digest('hex');
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
  }

  hashJsonObject = updateJsonObject;
}

function genHashJsonPath(buildPath: string) {
  buildPath = toUnixPath(buildPath);
  const dataTmps = buildPath.split(ARK);
  return path.join(dataTmps[0], ARK);
}
