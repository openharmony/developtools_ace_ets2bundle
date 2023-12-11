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


import { expect } from 'chai';
import mocha from 'mocha';
import path from "path";
import fs from "fs";

import {
  ENTRYABILITY_TS_PATH_DEFAULT,
  ENTRYABILITY_JS_PATH_DEFAULT,
  INDEX_ETS_PATH_DEFAULT
} from '../mock/rollup_mock/common';
import RollUpPluginMock from '../mock/rollup_mock/rollup_plugin_mock';
import { ModuleHotreloadMode } from '../../../lib/fast_build/ark_compiler/module/module_hotreload_mode';
import { newSourceMaps } from '../../../lib/fast_build/ark_compiler/transform';
import { toUnixPath } from '../../../lib/utils';
import {
  SOURCEMAPS,
  EXTNAME_TS,
  EXTNAME_ETS
} from '../../../lib/fast_build/ark_compiler/common/ark_define';
import {
  ES2ABC_PATH,
  SYMBOLMAP_MAP,
  DEFAULT_ETS,
  DEBUG_INFO,
  SIMBOL_TABLE
} from '../mock/rollup_mock/path_config';
import {
  ENTRYABILITY_TS_PATH,
  INDEX_ETS_PATH,
  FILE,
  SOURCE
} from '../mock/rollup_mock/common';

mocha.describe('test module_hotreload_mode file api', function () {
  mocha.before(function () {
    this.rollup = new RollUpPluginMock();
  });

  mocha.after(() => {
    delete this.rollup;
  });

  mocha.it('1-1: test updateSourceMapFromFileList under hot reload debug', function () {
    this.rollup.hotReload();
    this.rollup.share.projectConfig.oldMapFilePath = DEFAULT_ETS;
    const moduleMode = new ModuleHotreloadMode(this.rollup);
    const fileList = this.rollup.getModuleIds();
    for (const filePath of fileList) {
      if (filePath.endsWith(EXTNAME_TS) || filePath.endsWith(EXTNAME_ETS)) {
        const sourceMap: Map<string, string[]> = new Map<string, string[]>();
        const relativeSourceFilePath =
          toUnixPath(filePath.replace(this.rollup.share.projectConfig.projectTopDir + path.sep, ''));
        sourceMap[FILE] = path.basename(relativeSourceFilePath);
        sourceMap[SOURCE] = [relativeSourceFilePath];
        newSourceMaps[relativeSourceFilePath] = sourceMap;
      }
    }
    const fileListArray: Array<string> = [ENTRYABILITY_TS_PATH, INDEX_ETS_PATH];
    moduleMode.updateSourceMapFromFileList(fileListArray);
    const sourceMapFilePath: string = path.join(this.rollup.share.projectConfig.patchAbcPath, SOURCEMAPS);
    if (sourceMapFilePath && fs.existsSync(sourceMapFilePath)) {
      const testObject = fs.readFileSync(sourceMapFilePath).toString();
      expect(testObject.indexOf(ENTRYABILITY_TS_PATH_DEFAULT) > 0 ||
        testObject.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0 ||
        testObject.indexOf(INDEX_ETS_PATH_DEFAULT) > 0).to.be.true;
    }

    for (const key of Object.keys(newSourceMaps)) {
      delete newSourceMaps[key];
    }
  });

  mocha.it('2-1: test addHotReloadArgs under hot reload debug', function () {
    this.rollup.hotReload();
    this.rollup.share.projectConfig.oldMapFilePath = DEFAULT_ETS;
    const moduleMode = new ModuleHotreloadMode(this.rollup);
    moduleMode.addHotReloadArgs();
    expect(moduleMode.cmdArgs[0].indexOf(ES2ABC_PATH) > 0).to.be.true;
    expect(moduleMode.cmdArgs[1] === DEBUG_INFO).to.be.true;
    expect(moduleMode.cmdArgs[2] === SIMBOL_TABLE).to.be.true;
    expect(moduleMode.cmdArgs[3].indexOf(SYMBOLMAP_MAP) > 0).to.be.true;
  });
});