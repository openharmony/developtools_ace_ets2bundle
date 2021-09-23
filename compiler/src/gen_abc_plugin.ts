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

import * as process from 'child_process';
import * as fs from 'fs';

import * as path from 'path';
import Compiler from 'webpack/lib/Compiler';
import { logger } from './compile_info';

const arkDir: string = path.join(__dirname, '..', 'bin', 'ark');

const firstFileEXT: string = '_.js';
let output: string;
let webpackPath: string;
let isWin: boolean = false;
let isMac: boolean = false;
let isDebug: boolean = false;

const red: string = '\u001b[31m';
const blue: string = '\u001b[34m';
const reset: string = '\u001b[39m';

export class GenAbcPlugin {
  constructor(output_, webpackPath_, isDebug_) {
    output = output_;
    webpackPath = webpackPath_;
    isDebug = isDebug_;
  }
  apply(compiler: Compiler) {
    if (fs.existsSync(path.resolve(webpackPath, 'ark/build-win'))) {
      isWin = true;
    } else {
      if (fs.existsSync(path.resolve(webpackPath, 'ark/build-mac'))) {
        isMac = true;
      } else {
        if (!fs.existsSync(path.resolve(webpackPath, 'ark/build'))) {
          logger.error(red, 'ETS:ERROR find build fail', reset);
          return;
        }
      }
    }

    compiler.hooks.emit.tap('GenAbcPlugin', (compilation) => {
      Object.keys(compilation.assets).forEach(key => {
        // choice *.js
        if (output && webpackPath && path.extname(key) === '.js') {
          const newContent: string = compilation.assets[key].source();
          const keyPath: string = key.replace(/\.js$/, firstFileEXT);
          writeFileSync(newContent, path.resolve(output, keyPath), key);
        }
      });
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
    js2abcFirst(output);
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

function js2abcFirst(inputPath: string): void {
  let param: string = '-r';
  if (isDebug) {
    param += ' --debug';
  }

  let js2abc: string = path.join(arkDir, 'build', 'src', 'index.js');
  if (isWin) {
    js2abc = path.join(arkDir, 'build-win', 'src', 'index.js');
  } else if (isMac) {
    js2abc = path.join(arkDir, 'build-mac', 'src', 'index.js');
  }

  const cmd: string = `node --expose-gc "${js2abc}" "${inputPath}" ${param}`;

  try {
    process.execSync(cmd);
  } catch (e) {
    logger.error(red, `ETS:ERROR Failed to convert file ${inputPath} to abc `, reset);
    return;
  }

  if (fs.existsSync(inputPath)) {
    fs.unlinkSync(inputPath);
  }

  const abcFile: string = inputPath.replace(/\.js$/, '.abc');
  if (fs.existsSync(abcFile)) {
    const abcFileNew: string = abcFile.replace(/_.abc$/, '.abc');
    fs.renameSync(abcFile, abcFileNew);
  } else {
    logger.error(red, `ETS:ERROR ${abcFile} is lost`, reset);
  }
}
