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


import { expect } from 'chai';
import fs from "fs";
import mocha from 'mocha';
import path from "path";

import {
  MergedConfig,
  ObConfigResolver
} from '../../../lib/fast_build/ark_compiler/common/ob_config_resolver';
import {
  OBFUSCATION_RULE_PATH,
  OBFUSCATION_RULE_TEMPLATE_PATH
} from '../mock/rollup_mock/path_config';
import { OBFUSCATION_TOOL } from '../../../lib/fast_build/ark_compiler/common/ark_define';
import { RELEASE } from '../../../lib/fast_build/ark_compiler/common/ark_define';
import RollUpPluginMock from '../mock/rollup_mock/rollup_plugin_mock';

const OBFUSCATE_TESTDATA_DIR = path.resolve(__dirname, '../../../test/ark_compiler_ut/testdata/obfuscation');

mocha.describe('test obfuscate config resolver api', function () {
  mocha.before(function () {
    this.rollup = new RollUpPluginMock();
    let obfuscationContent = undefined;
    try {
      obfuscationContent = fs.readFileSync(OBFUSCATION_RULE_TEMPLATE_PATH, 'utf-8');
      obfuscationContent = obfuscationContent.replace('OBFUSCATE_TESTDATA_DIR', OBFUSCATE_TESTDATA_DIR);
      fs.writeFileSync(`${OBFUSCATION_RULE_PATH}`, obfuscationContent);
    } catch (err) {
      throw err;
    }
  });

  mocha.after(() => {
    fs.unlinkSync(`${OBFUSCATION_RULE_PATH}`);
    delete this.rollup;
  });

  mocha.it('1-1: test resolveDts', function () {
    this.rollup.build(RELEASE);
    const logger: object = this.rollup.share.getLogger(OBFUSCATION_TOOL);
    this.rollup.share.projectConfig.obfuscationOptions = {
      'selfConfig': {
        'ruleOptions': {
          'enable': true,
          'rules': [ OBFUSCATION_RULE_PATH ]
        },
        'consumerRules': [],
      },
      'dependencies': {
        'libraries': [],
        'hars': []
      }
    };
    const obConfig: ObConfigResolver =  new ObConfigResolver(this.rollup.share.projectConfig, logger, true);
    const mergedObConfig: MergedConfig = obConfig.resolveObfuscationConfigs();
    expect(mergedObConfig.options.enableToplevelObfuscation).to.be.true;
    expect(mergedObConfig.options.enablePropertyObfuscation).to.be.false;

    const reservedNames = mergedObConfig.reservedNames;
    expect(reservedNames.length == 4).to.be.true;
    expect(reservedNames.includes('matrix44')).to.be.true;
    expect(reservedNames.includes('TranslateOption2')).to.be.true;
    expect(reservedNames.includes('TestAdd')).to.be.true;
    expect(reservedNames.includes('TestProperty')).to.be.true;

    const reservedPropertyNames = mergedObConfig.reservedPropertyNames;
    expect(reservedPropertyNames.length == 4).to.be.true;
    expect(reservedPropertyNames.includes('matrix44')).to.be.true;
    expect(reservedPropertyNames.includes('TranslateOption2')).to.be.true;
    expect(reservedPropertyNames.includes('TestAdd')).to.be.true;
    expect(reservedPropertyNames.includes('TestProperty')).to.be.true;

    const reservedGlobalNames = mergedObConfig.reservedGlobalNames;
    expect(reservedGlobalNames.length == 4).to.be.true;
    expect(reservedGlobalNames.includes('matrix44')).to.be.true;
    expect(reservedGlobalNames.includes('TranslateOption2')).to.be.true;
    expect(reservedGlobalNames.includes('TestAdd')).to.be.true;
    expect(reservedGlobalNames.includes('TestProperty')).to.be.true;

    this.rollup.clearCache();
  });
});