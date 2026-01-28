/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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
import sinon from 'sinon';
import fs from 'fs';

import {
  getOhmUrlByFilepath,
  getOhmUrlByExternalPackage,
  getOhmUrlBySystemApiOrLibRequest,
  getNormalizedOhmUrlByFilepath,
  getNormalizedOhmUrlByAliasName,
  getNormalizedOhmUrlByModuleRequest,
  pkgDeclFilesConfig,
  OhmUrlParams
} from '../../../lib/ark_utils';
import { PACKAGES } from '../../../lib/pre_define';
import projectConfig from '../utils/processProjectConfig';
import { projectConfig as mainProjectConfig } from '../../../main';
import RollUpPluginMock from '../mock/rollup_mock/rollup_plugin_mock';
import { GEN_ABC_PLUGIN_NAME } from '../../../lib/fast_build/ark_compiler/common/ark_define';
import { ModuleSourceFile } from '../../../lib/fast_build/ark_compiler/module/module_source_file';
import {
  ArkTSErrorDescription,
  ArkTSInternalErrorDescription,
  ErrorCode
} from '../../../lib/fast_build/ark_compiler/error_code';
import {
  CommonLogger,
  LogData,
  LogDataFactory
} from '../../../lib/fast_build/ark_compiler/logger';
import { PreloadFileModules } from '../../../lib/fast_build/ark_compiler/module/module_preload_file_utils';

mocha.describe('generate ohmUrl', function () {
  mocha.before(function () {
    this.rollup = new RollUpPluginMock();
  });

  mocha.after(() => {
    delete this.rollup;
  });

  mocha.it('NormalizedOHMUrl static bytecode har import', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.useNormalizedOHMUrl = true;
    this.rollup.share.projectConfig.pkgContextInfo = {
      'bytecode_har': {
        'packageName': 'bytecode_har',
        'bundleName': '',
        'moduleName': '',
        'version': '1.0.0',
        'entryPath': 'Index.ets',
        'isSO': false
      },
      'bytecode_alias_oh': {
        'packageName': 'bytecode_alias_oh',
        'bundleName': '',
        'moduleName': '',
        'version': '1.0.0',
        'entryPath': 'Index.ets',
        'isSO': false
      }
    }
    this.rollup.share.projectConfig.dependencyAliasMap = new Map([
      ['bytecode_alias', 'bytecode_har', 'bytecode_alias_oh']
    ]);
    this.rollup.share.projectConfig.staticByteCodeHarInfo = {
      'bytecode_alias': {
        'abcPath':'D:\\projectPath\\bytecode_har\\modules.abc'
      },
      'bytecode_alias_oh': {
        'abcPath':'D:\\projectPath\\bytecode_alias_oh\\modules.abc'
      }
    }
    const filePath: string = 'bytecode_alias/src/main/ets/utils/Calc';
    const indexFilePath: string = 'bytecode_alias';

    const importerFile: string = '/testHap/entry/src/main/ets/pages/index.ets'
    const importByPkgName = 'bytecode_alias';
    const standardImportPath: string = 'bytecode_alias/src/main/ets/utils/Calc';
    const importByPkgNameSlashes = 'bytecode_alias///';
    const importByPkgNameSlashesOh = 'bytecode_alias_oh///';
    const importModuleRequets = 'bytecode_alias_oh///\\\/'
    const moduleSourceFile: string = new ModuleSourceFile();
    ModuleSourceFile.initPluginEnv(this.rollup);
    const importByPkgNameOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, importByPkgName, indexFilePath, importerFile);
    const standardImportPathOhmUrl = moduleSourceFile.getOhmUrl(this.rollup, standardImportPath, filePath,
      importerFile);
    const importByPkgNameOhmUrlSlashes = moduleSourceFile.getOhmUrl(this.rollup, importByPkgNameSlashes, indexFilePath, importerFile);
    const importByPkgNameOhmUrlSlashesOh = moduleSourceFile.getOhmUrl(this.rollup, importByPkgNameSlashesOh, indexFilePath, importerFile);
    const importModuleRequetsOhmUrlSlashesOh = moduleSourceFile.getOhmUrl(this.rollup, importModuleRequets, indexFilePath, importerFile);
    const importByPkgNameNormalizedOhmUrl: string = '@normalized:N&&&bytecode_har/Index&1.0.0';
    const standardImportPathNormalizedOhmUrl: string = '@normalized:N&&&bytecode_har/src/main/ets/utils/Calc&1.0.0';
    const importByPkgNameNormalizedOhmUrlSlashes: string = '@normalized:N&&&bytecode_har/Index&1.0.0';
    const importByPkgNameNormalizedOhmUrlSlashesOh: string = '@normalized:N&&&bytecode_alias_oh/Index&1.0.0';
    const importModuleRequetsNormalizedOhmUrlSlashesOh: string = '@normalized:N&&&bytecode_alias_oh/Index&1.0.0';
    expect(importByPkgNameOhmUrl == importByPkgNameNormalizedOhmUrl).to.be.true;
    expect(standardImportPathOhmUrl == standardImportPathNormalizedOhmUrl).to.be.true;
    expect(importByPkgNameOhmUrlSlashes == importByPkgNameNormalizedOhmUrlSlashes).to.be.true;
    expect(importByPkgNameOhmUrlSlashesOh == importByPkgNameNormalizedOhmUrlSlashesOh).to.be.true;
    expect(importModuleRequetsOhmUrlSlashesOh == importModuleRequetsNormalizedOhmUrlSlashesOh).to.be.true;
  });
});