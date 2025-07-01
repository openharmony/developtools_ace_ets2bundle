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

import mocha from 'mocha';
import path from 'path';
import fs from 'fs';
import {
  expect
} from 'chai';
import {
  COMPILE_CONTEXT_INFO_JSON,
  FILESINFO_TXT,
  MODULES_CACHE,
  NPMENTRIES_TXT,
  RELEASE,
  SOURCEMAPS,
} from '../../lib/fast_build/ark_compiler/common/ark_define';
import {
  mergeCacheData,
  mergeCompileContextInfo,
  mergeSourceMap,
} from '../../lib/fast_build/ark_compiler/interop/run_es2abc_standalone';
import RollUpPluginMock from './mock/rollup_mock/rollup_plugin_mock';

let MERGE_CACHE_PATH;
let targetCachePath;

mocha.describe('test run_es2abc_standalone file api', function () {
  mocha.before(function () {
    this.rollup = new RollUpPluginMock();
    this.rollup.build();
    MERGE_CACHE_PATH=path.join(this.rollup.share.projectConfig.projectRootPath, '/mergeCacheData')
    targetCachePath=path.join(MERGE_CACHE_PATH,'/targetCacheDir')
    if (!fs.existsSync(targetCachePath)) {
      fs.mkdirSync(targetCachePath, { recursive: true });
    }
  });

  mocha.after(function () {
    if (fs.existsSync(targetCachePath)) {
      fs.rmSync(targetCachePath, { recursive: true, force: true });
    }
  })

  mocha.it('1-1: test mergeCacheData', function () {

    const cachePathList = [
      path.resolve(MERGE_CACHE_PATH, './originCacheDir1'),
      path.resolve(MERGE_CACHE_PATH, './originCacheDir2'),
    ];
    const fileNameList = [
      FILESINFO_TXT,
      NPMENTRIES_TXT
    ]
    fileNameList.forEach(fileName => {
      mergeCacheData(cachePathList, targetCachePath, fileName);
    })

    fileNameList.forEach(fileName => {

      const targetFilePath = path.resolve(targetCachePath, fileName);
      const targetLineCount = countLines(targetFilePath);
  
      let sumOriginLineCount = 0;
      cachePathList.forEach(cacheDir => {
        const originFilePath = path.resolve(cacheDir, fileName);
        if (fs.existsSync(originFilePath)) {
          sumOriginLineCount += countLines(originFilePath);
        }
      });
      expect(targetLineCount).to.equal(sumOriginLineCount);
    });
  });

  mocha.it('1-2: test mergeSourceMap', function () {
    const cachePathList = [
      path.resolve(MERGE_CACHE_PATH, './originCacheDir1'),
      path.resolve(MERGE_CACHE_PATH, './originCacheDir2'),
    ];

    mergeSourceMap(cachePathList, targetCachePath)
    
    const mergedSourceMap = JSON.parse(fs.readFileSync(path.resolve(targetCachePath, SOURCEMAPS), 'utf-8'));
    const expectSourceMap = JSON.parse(fs.readFileSync(path.join(MERGE_CACHE_PATH, './expect', SOURCEMAPS), 'utf-8'));
  
    expect(mergedSourceMap).to.deep.equal(expectSourceMap);
  });

  mocha.it('1-3: test mergeCompileContextInfo', function () {
    const cachePathList = [
      path.resolve(MERGE_CACHE_PATH, './originCacheDir1'),
      path.resolve(MERGE_CACHE_PATH, './originCacheDir2'),
    ];
    
    mergeCompileContextInfo(cachePathList, targetCachePath);
  
    const mergedCompileContext = JSON.parse(
      fs.readFileSync(path.resolve(targetCachePath, COMPILE_CONTEXT_INFO_JSON), 'utf-8')
    );
  
    const expectCompileContext = JSON.parse(
      fs.readFileSync(path.join(MERGE_CACHE_PATH, './expect',COMPILE_CONTEXT_INFO_JSON), 'utf-8')
    );
  
    expect(mergedCompileContext).to.deep.equal(expectCompileContext);
  });
});

function countLines(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split(/\r?\n/).filter(line => line !== '').length;
}