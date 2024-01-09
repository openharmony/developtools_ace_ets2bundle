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

import {
  OBFUSCATION_TOOL,
  ESMODULE,
  RELEASE,
  TS2ABC
} from '../../../lib/fast_build/ark_compiler/common/ark_define';
import {
  NODE,
  BUNDLE_NAME_DEFAULT,
  ENTRY_MODULE_NAME_DEFAULT,
  NODE_JS_PATH,
  LOADER_AOTMODE
} from '../mock/rollup_mock/common';
import {
  ES2ABC_PATH,
  TS2ABC_PATH,
  MERGERABC_PATH,
  JS2ABC_PATH,
  AOTCOMPILER_PATH,
  ARKCONFIG_TS2ABC_PATH
} from '../mock/rollup_mock/path_config';
import RollUpPluginMock from '../mock/rollup_mock/rollup_plugin_mock';
import {
  initArkConfig,
  initArkProjectConfig,
  utProcessArkConfig
} from '../../../lib/fast_build/ark_compiler/common/process_ark_config';
import {
  ObConfigResolver,
  MergedConfig
} from '../../../lib/fast_build/ark_compiler/common/ob_config_resolver';

mocha.describe('test process_ark_config file api', function () {
  mocha.before(function () {
    this.rollup = new RollUpPluginMock();
  });

  mocha.after(() => {
    delete this.rollup;
  });

  mocha.it('1-1: test initArkConfig under build debug', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.arkFrontendDir = this.rollup.share.projectConfig.projectTopDir;
    this.rollup.share.projectConfig.nodeJs = true;
    this.rollup.share.projectConfig.nodePath = NODE_JS_PATH;
    const arkConfig = initArkConfig(this.rollup.share.projectConfig);

    expect(arkConfig.nodePath === NODE_JS_PATH).to.be.true;
    expect(arkConfig.es2abcPath.indexOf(ES2ABC_PATH) > 0).to.be.true;
    expect(arkConfig.ts2abcPath.indexOf(TS2ABC_PATH) > 0).to.be.true;
    expect(arkConfig.mergeAbcPath.indexOf(MERGERABC_PATH) > 0).to.be.true;
    expect(arkConfig.js2abcPath.indexOf(JS2ABC_PATH) > 0).to.be.true;
    expect(arkConfig.aotCompilerPath.indexOf(AOTCOMPILER_PATH) > 0).to.be.true;
    expect(arkConfig.isDebug === true).to.be.true;
    expect(arkConfig.arkRootPath === this.rollup.share.projectConfig.arkFrontendDir).to.be.true;
  });

  mocha.it('1-2: test initArkConfig under build release', function () {
    this.rollup.build(RELEASE);
    this.rollup.share.projectConfig.arkFrontendDir = this.rollup.share.projectConfig.projectTopDir;
    const arkConfig = initArkConfig(this.rollup.share.projectConfig);

    expect(arkConfig.nodePath === NODE).to.be.true;
    expect(arkConfig.es2abcPath.indexOf(ES2ABC_PATH) > 0).to.be.true;
    expect(arkConfig.ts2abcPath.indexOf(TS2ABC_PATH) > 0).to.be.true;
    expect(arkConfig.mergeAbcPath.indexOf(MERGERABC_PATH) > 0).to.be.true;
    expect(arkConfig.js2abcPath.indexOf(JS2ABC_PATH) > 0).to.be.true;
    expect(arkConfig.aotCompilerPath.indexOf(AOTCOMPILER_PATH) > 0).to.be.true;
    expect(arkConfig.isDebug === false).to.be.true;
    expect(arkConfig.arkRootPath === this.rollup.share.projectConfig.arkFrontendDir).to.be.true;
  });

  mocha.it('1-3: test initArkConfig under preview debug', function () {
    this.rollup.preview();
    this.rollup.share.projectConfig.arkFrontendDir = this.rollup.share.projectConfig.projectTopDir;
    const arkConfig = initArkConfig(this.rollup.share.projectConfig);

    expect(arkConfig.nodePath === NODE).to.be.true;
    expect(arkConfig.es2abcPath.indexOf(ES2ABC_PATH) > 0).to.be.true;
    expect(arkConfig.ts2abcPath.indexOf(TS2ABC_PATH) > 0).to.be.true;
    expect(arkConfig.mergeAbcPath.indexOf(MERGERABC_PATH) > 0).to.be.true;
    expect(arkConfig.js2abcPath.indexOf(JS2ABC_PATH) > 0).to.be.true;
    expect(arkConfig.aotCompilerPath.indexOf(AOTCOMPILER_PATH) > 0).to.be.true;
    expect(arkConfig.isDebug === true).to.be.true;
    expect(arkConfig.arkRootPath === this.rollup.share.projectConfig.arkFrontendDir).to.be.true;
  });

  mocha.it('1-4: test initArkConfig under hot reload debug', function () {
    this.rollup.hotReload();
    this.rollup.share.projectConfig.arkFrontendDir = this.rollup.share.projectConfig.projectTopDir;
    const arkConfig = initArkConfig(this.rollup.share.projectConfig);

    expect(arkConfig.nodePath === NODE).to.be.true;
    expect(arkConfig.es2abcPath.indexOf(ES2ABC_PATH) > 0).to.be.true;
    expect(arkConfig.ts2abcPath.indexOf(TS2ABC_PATH) > 0).to.be.true;
    expect(arkConfig.mergeAbcPath.indexOf(MERGERABC_PATH) > 0).to.be.true;
    expect(arkConfig.js2abcPath.indexOf(JS2ABC_PATH) > 0).to.be.true;
    expect(arkConfig.aotCompilerPath.indexOf(AOTCOMPILER_PATH) > 0).to.be.true;
    expect(arkConfig.isDebug === true).to.be.true;
    expect(arkConfig.arkRootPath === this.rollup.share.projectConfig.arkFrontendDir).to.be.true;
  });

  mocha.it('2-1-1: test initArkProjectConfig under build debug: moduleJsonInfo exists', function () {
    this.rollup.build();
    const arkConfig = initArkProjectConfig(this.rollup.share);
    const buildJsonInfo =
      JSON.parse(fs.readFileSync(this.rollup.share.projectConfig.aceBuildJson).toString());
    const moduleJsonInfo =
      JSON.parse(fs.readFileSync(this.rollup.share.projectConfig.aceModuleJsonPath).toString());

    expect(arkConfig.nodeModulesPath === buildJsonInfo.nodeModulesPath).to.be.true;
    expect(arkConfig.minPlatformVersion === moduleJsonInfo.app.minAPIVersion).to.be.true;
    expect(arkConfig.processTs === false).to.be.true;
    expect(arkConfig.moduleName === ENTRY_MODULE_NAME_DEFAULT).to.be.true;
    expect(arkConfig.bundleName === BUNDLE_NAME_DEFAULT).to.be.true;
    expect(arkConfig.compileMode === ESMODULE).to.be.true;
  });

  mocha.it('2-1-2: test initArkProjectConfig under build debug: buildJsonInfo.patchConfig is true', function () {
    this.rollup.build();
    this.rollup.share.projectConfig.aceBuildJson =
      `${this.rollup.share.projectConfig.aceModuleBuild}/${LOADER_AOTMODE}`;
    const arkConfig = initArkProjectConfig(this.rollup.share);
    const buildJsonInfo =
      JSON.parse(fs.readFileSync(this.rollup.share.projectConfig.aceBuildJson).toString());

    expect(arkConfig.oldMapFilePath === buildJsonInfo.patchConfig.oldMapFilePath).to.be.true;
    expect(arkConfig.pandaMode === TS2ABC).to.be.true;
    expect(arkConfig.processTs === true).to.be.true;
    expect(arkConfig.anBuildOutPut === buildJsonInfo.anBuildOutPut).to.be.true;
    expect(arkConfig.anBuildMode === buildJsonInfo.anBuildMode).to.be.true;
    expect(arkConfig.apPath === buildJsonInfo.apPath).to.be.true;
    expect(arkConfig.moduleName === ENTRY_MODULE_NAME_DEFAULT).to.be.true;
    expect(arkConfig.bundleName === BUNDLE_NAME_DEFAULT).to.be.true;
    expect(arkConfig.compileMode === ESMODULE).to.be.true;
  });

  mocha.it('2-2: test initArkProjectConfig under build release', function () {
    this.rollup.build(RELEASE);
    const arkConfig = initArkProjectConfig(this.rollup.share);
    const buildJsonInfo =
      JSON.parse(fs.readFileSync(this.rollup.share.projectConfig.aceBuildJson).toString());
    const moduleJsonInfo =
      JSON.parse(fs.readFileSync(this.rollup.share.projectConfig.aceModuleJsonPath).toString());

    expect(arkConfig.nodeModulesPath === buildJsonInfo.nodeModulesPath).to.be.true;
    expect(arkConfig.minPlatformVersion === moduleJsonInfo.app.minAPIVersion).to.be.true;
    expect(arkConfig.processTs === false).to.be.true;
    expect(arkConfig.moduleName === ENTRY_MODULE_NAME_DEFAULT).to.be.true;
    expect(arkConfig.bundleName === BUNDLE_NAME_DEFAULT).to.be.true;
    expect(arkConfig.compileMode === ESMODULE).to.be.true;
  });

  mocha.it('2-3: test initArkProjectConfig under preview debug', function () {
    this.rollup.preview();
    const arkConfig = initArkProjectConfig(this.rollup.share);
    const buildJsonInfo =
      JSON.parse(fs.readFileSync(this.rollup.share.projectConfig.aceBuildJson).toString());
    const moduleJsonInfo =
      JSON.parse(fs.readFileSync(this.rollup.share.projectConfig.aceModuleJsonPath).toString());

    expect(arkConfig.nodeModulesPath === buildJsonInfo.nodeModulesPath).to.be.true;
    expect(arkConfig.minPlatformVersion === moduleJsonInfo.app.minAPIVersion).to.be.true;
    expect(arkConfig.processTs === false).to.be.true;
    expect(arkConfig.moduleName === ENTRY_MODULE_NAME_DEFAULT).to.be.true;
    expect(arkConfig.bundleName === BUNDLE_NAME_DEFAULT).to.be.true;
    expect(arkConfig.compileMode === ESMODULE).to.be.true;
  });

  mocha.it('2-4: test initArkProjectConfig under hot reload debug', function () {
    this.rollup.hotReload();
    const arkConfig = initArkProjectConfig(this.rollup.share);
    const buildJsonInfo =
      JSON.parse(fs.readFileSync(this.rollup.share.projectConfig.aceBuildJson).toString());
    const moduleJsonInfo =
      JSON.parse(fs.readFileSync(this.rollup.share.projectConfig.aceModuleJsonPath).toString());

    expect(arkConfig.nodeModulesPath === buildJsonInfo.nodeModulesPath).to.be.true;
    expect(arkConfig.minPlatformVersion === moduleJsonInfo.app.minAPIVersion).to.be.true;
    expect(arkConfig.processTs === false).to.be.true;
    expect(arkConfig.moduleName === ENTRY_MODULE_NAME_DEFAULT).to.be.true;
    expect(arkConfig.bundleName === BUNDLE_NAME_DEFAULT).to.be.true;
    expect(arkConfig.compileMode === ESMODULE).to.be.true;
  });

  mocha.it('3-1: test initTerserConfig under build debug', function () {
    this.rollup.build();
    const logger: object = this.rollup.share.getLogger(OBFUSCATION_TOOL);
    const obConfig: ObConfigResolver = new ObConfigResolver(this.rollup.share.projectConfig, logger, true);
    const mergedObConfig: MergedConfig = obConfig.resolveObfuscationConfigs();
    const isHarCompiled: boolean = this.rollup.share.projectConfig.compileHar;
    const minifyOptions =
      utProcessArkConfig.initTerserConfig(this.rollup.share.projectConfig, logger, mergedObConfig, isHarCompiled);

    expect(minifyOptions.format.beautify === true).to.be.true;
    expect(minifyOptions.format.indent_level === 2).to.be.true;
    expect(minifyOptions.compress.join_vars === false).to.be.true;
    expect(minifyOptions.compress.sequences === 0).to.be.true;
    expect(minifyOptions.compress.directives === false).to.be.true;
    expect(minifyOptions.compress.drop_console === false).to.be.true;
    expect(minifyOptions.mangle.toplevel === false).to.be.true;
  });

  mocha.it('3-2: test initTerserConfig under build release', function () {
    this.rollup.build(RELEASE);
    const logger: object = this.rollup.share.getLogger(OBFUSCATION_TOOL);
    const obConfig: ObConfigResolver = new ObConfigResolver(this.rollup.share.projectConfig, logger, true);
    const mergedObConfig: MergedConfig = obConfig.resolveObfuscationConfigs();
    const isHarCompiled: boolean = this.rollup.share.projectConfig.compileHar;
    const minifyOptions =
      utProcessArkConfig.initTerserConfig(this.rollup.share.projectConfig, logger, mergedObConfig, isHarCompiled);

    expect(minifyOptions.format.beautify === true).to.be.true;
    expect(minifyOptions.format.indent_level === 2).to.be.true;
    expect(minifyOptions.compress.join_vars === false).to.be.true;
    expect(minifyOptions.compress.sequences === 0).to.be.true;
    expect(minifyOptions.compress.directives === false).to.be.true;
    expect(minifyOptions.compress.drop_console === false).to.be.true;
    expect(minifyOptions.mangle.toplevel === false).to.be.true;
  });

  mocha.it('3-3: test initTerserConfig under preview debug', function () {
    this.rollup.preview();
    const logger: object = this.rollup.share.getLogger(OBFUSCATION_TOOL);
    const obConfig: ObConfigResolver = new ObConfigResolver(this.rollup.share.projectConfig, logger, true);
    const mergedObConfig: MergedConfig = obConfig.resolveObfuscationConfigs();
    const isHarCompiled: boolean = this.rollup.share.projectConfig.compileHar;
    const minifyOptions =
      utProcessArkConfig.initTerserConfig(this.rollup.share.projectConfig, logger, mergedObConfig, isHarCompiled);

    expect(minifyOptions.format.beautify === true).to.be.true;
    expect(minifyOptions.format.indent_level === 2).to.be.true;
    expect(minifyOptions.compress.join_vars === false).to.be.true;
    expect(minifyOptions.compress.sequences === 0).to.be.true;
    expect(minifyOptions.compress.directives === false).to.be.true;
    expect(minifyOptions.compress.drop_console === false).to.be.true;
    expect(minifyOptions.mangle.toplevel === false).to.be.true;
  });

  mocha.it('3-4: test initTerserConfig under hot reload debug', function () {
    this.rollup.hotReload();
    const logger: object = this.rollup.share.getLogger(OBFUSCATION_TOOL);
    const obConfig: ObConfigResolver = new ObConfigResolver(this.rollup.share.projectConfig, logger, true);
    const mergedObConfig: MergedConfig = obConfig.resolveObfuscationConfigs();
    const isHarCompiled: boolean = this.rollup.share.projectConfig.compileHar;
    const minifyOptions =
      utProcessArkConfig.initTerserConfig(this.rollup.share.projectConfig, logger, mergedObConfig, isHarCompiled);

    expect(minifyOptions.format.beautify === true).to.be.true;
    expect(minifyOptions.format.indent_level === 2).to.be.true;
    expect(minifyOptions.compress.join_vars === false).to.be.true;
    expect(minifyOptions.compress.sequences === 0).to.be.true;
    expect(minifyOptions.compress.directives === false).to.be.true;
    expect(minifyOptions.compress.drop_console === false).to.be.true;
    expect(minifyOptions.mangle.toplevel === false).to.be.true;
  });

  mocha.it('4-1: test processCompatibleVersion under build debug', function () {
    this.rollup.build();
    const arkConfig = initArkConfig(this.rollup.share.projectConfig);
    utProcessArkConfig.processCompatibleVersion(this.rollup.share.projectConfig, arkConfig);
    expect(this.rollup.share.projectConfig.pandaMode === undefined).to.be.true;
    expect(arkConfig.ts2abcPath.indexOf(TS2ABC_PATH) > 0).to.be.true;

    this.rollup.share.projectConfig.minPlatformVersion = 8;
    utProcessArkConfig.processCompatibleVersion(this.rollup.share.projectConfig, arkConfig);
    expect(this.rollup.share.projectConfig.pandaMode === TS2ABC).to.be.true;
    expect(arkConfig.ts2abcPath.indexOf(ARKCONFIG_TS2ABC_PATH) > 0).to.be.true;
  });

  mocha.it('4-2: test processCompatibleVersion under build release', function () {
    this.rollup.build(RELEASE);
    const arkConfig = initArkConfig(this.rollup.share.projectConfig);
    utProcessArkConfig.processCompatibleVersion(this.rollup.share.projectConfig, arkConfig);
    expect(this.rollup.share.projectConfig.pandaMode === undefined).to.be.true;
    expect(arkConfig.ts2abcPath.indexOf(TS2ABC_PATH) > 0).to.be.true;

    this.rollup.share.projectConfig.minPlatformVersion = 8;
    utProcessArkConfig.processCompatibleVersion(this.rollup.share.projectConfig, arkConfig);
    expect(this.rollup.share.projectConfig.pandaMode === TS2ABC).to.be.true;
    expect(arkConfig.ts2abcPath.indexOf(ARKCONFIG_TS2ABC_PATH) > 0).to.be.true;
  });

  mocha.it('4-3: test processCompatibleVersion under preview debug', function () {
    this.rollup.preview();
    const arkConfig = initArkConfig(this.rollup.share.projectConfig);
    utProcessArkConfig.processCompatibleVersion(this.rollup.share.projectConfig, arkConfig);
    expect(this.rollup.share.projectConfig.pandaMode === undefined).to.be.true;
    expect(arkConfig.ts2abcPath.indexOf(TS2ABC_PATH) > 0).to.be.true;

    this.rollup.share.projectConfig.minPlatformVersion = 8;
    utProcessArkConfig.processCompatibleVersion(this.rollup.share.projectConfig, arkConfig);
    expect(this.rollup.share.projectConfig.pandaMode === TS2ABC).to.be.true;
    expect(arkConfig.ts2abcPath.indexOf(ARKCONFIG_TS2ABC_PATH) > 0).to.be.true;
  });

  mocha.it('4-4: test processCompatibleVersion under hot reload debug', function () {
    this.rollup.hotReload();
    const arkConfig = initArkConfig(this.rollup.share.projectConfig);
    utProcessArkConfig.processCompatibleVersion(this.rollup.share.projectConfig, arkConfig);
    expect(this.rollup.share.projectConfig.pandaMode === undefined).to.be.true;
    expect(arkConfig.ts2abcPath.indexOf(TS2ABC_PATH) > 0).to.be.true;

    this.rollup.share.projectConfig.minPlatformVersion = 8;
    utProcessArkConfig.processCompatibleVersion(this.rollup.share.projectConfig, arkConfig);
    expect(this.rollup.share.projectConfig.pandaMode === TS2ABC).to.be.true;
    expect(arkConfig.ts2abcPath.indexOf(ARKCONFIG_TS2ABC_PATH) > 0).to.be.true;
  });
});