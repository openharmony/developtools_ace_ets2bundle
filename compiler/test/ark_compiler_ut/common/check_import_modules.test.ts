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
import fs from "fs";

import RollUpPluginMock from '../mock/rollup_mock/rollup_plugin_mock';
import { checkIfJsImportingArkts } from '../../../lib/fast_build/ark_compiler/check_import_module';
import { ModuleSourceFile } from '../../../lib/fast_build/ark_compiler/module/module_source_file';
import {
  RELEASE,
  GEN_ABC_PLUGIN_NAME,
  EXTNAME_JS,
  EXTNAME_ETS
} from '../../../lib/fast_build/ark_compiler/common/ark_define';
import { ENTRYABILITY_JS_PATH_DEFAULT } from '../mock/rollup_mock/common'

mocha.describe('test check_import_module file api', function () {
  mocha.before(function () {
    this.rollup = new RollUpPluginMock();
  });

  mocha.after(() => {
    delete this.rollup;
  });

  mocha.it('1-1: test checkIfJsImportingArkts under build debug', function () {
    this.rollup.build();
    let path_ets: string;
    const mockFileList: object = this.rollup.getModuleIds();
    this.rollup.moduleInfos.forEach((moduleInfo) => {
      if (moduleInfo.id.endsWith(EXTNAME_ETS)) {
        path_ets = moduleInfo.id
      }
    })
    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_JS)) {
        const moduleInfo: object = this.rollup.getModuleInfo(moduleId);
        moduleInfo.setImportedIdMaps(path_ets);
        const code: string = fs.readFileSync(moduleId, 'utf-8');
        ModuleSourceFile.newSourceFile(moduleId, code);
        checkIfJsImportingArkts(this.rollup);
        const msg = this.rollup.share.getLogger(GEN_ABC_PLUGIN_NAME).messsage;
        expect(msg.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0).to.be.true;
      }
    }
  });

  mocha.it('1-2: test checkIfJsImportingArkts under build release', function () {
    this.rollup.build(RELEASE);
    let path_ets: string;
    const mockFileList: object = this.rollup.getModuleIds();
    this.rollup.moduleInfos.forEach((moduleInfo) => {
      if (moduleInfo.id.endsWith(EXTNAME_ETS)) {
        path_ets = moduleInfo.id;
      }
    })
    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_JS)) {
        const moduleInfo: object = this.rollup.getModuleInfo(moduleId);
        moduleInfo.setImportedIdMaps(path_ets);
        const code: string = fs.readFileSync(moduleId, 'utf-8');
        ModuleSourceFile.newSourceFile(moduleId, code);
        checkIfJsImportingArkts(this.rollup);
        const msg = this.rollup.share.getLogger(GEN_ABC_PLUGIN_NAME).messsage;
        expect(msg.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0).to.be.true;
      }
    }
  });

  mocha.it('1-3: test checkIfJsImportingArkts under preview debug', function () {
    this.rollup.preview();
    let path_ets: string;
    const mockFileList: object = this.rollup.getModuleIds();
    this.rollup.moduleInfos.forEach((moduleInfo) => {
      if (moduleInfo.id.endsWith(EXTNAME_ETS)) {
        path_ets = moduleInfo.id;
      }
    })
    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_JS)) {
        const moduleInfo: object = this.rollup.getModuleInfo(moduleId);
        moduleInfo.setImportedIdMaps(path_ets);
        const code: string = fs.readFileSync(moduleId, 'utf-8');
        ModuleSourceFile.newSourceFile(moduleId, code);
        checkIfJsImportingArkts(this.rollup);
        const msg = this.rollup.share.getLogger(GEN_ABC_PLUGIN_NAME).messsage;
        expect(msg.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0).to.be.true;
      }
    }
  });

  mocha.it('1-4: test checkIfJsImportingArkts under hot reload debug', function () {
    this.rollup.hotReload();
    let path_ets: string;
    const mockFileList: object = this.rollup.getModuleIds();
    this.rollup.moduleInfos.forEach((moduleInfo) => {
      if (moduleInfo.id.endsWith(EXTNAME_ETS)) {
        path_ets = moduleInfo.id;
      }
    })
    for (const moduleId of mockFileList) {
      if (moduleId.endsWith(EXTNAME_JS)) {
        const moduleInfo: object = this.rollup.getModuleInfo(moduleId);
        moduleInfo.setImportedIdMaps(path_ets);
        const code: string = fs.readFileSync(moduleId, 'utf-8');
        ModuleSourceFile.newSourceFile(moduleId, code);
        checkIfJsImportingArkts(this.rollup);
        const msg = this.rollup.share.getLogger(GEN_ABC_PLUGIN_NAME).messsage;
        expect(msg.indexOf(ENTRYABILITY_JS_PATH_DEFAULT) > 0).to.be.true;
      }
    }
  });
});