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
import fs from 'fs';
import path from 'path';
import RollUpPluginMock from '../mock/rollup_mock/rollup_plugin_mock';
import {
  utProcessObfConfig
} from '../../../lib/fast_build/ark_compiler/interop/process_obfuscation_config';

mocha.describe('test process_obfuscation_config file api', function () {
  mocha.before(function () {
    this.rollup = new RollUpPluginMock();
  });

  mocha.after(() => {
    delete this.rollup;
  });
  
  mocha.describe('1: test filterStaticObfuscationConfig related apis', function () {
    mocha.beforeEach(function () {
      this.tempDir = path.join(__dirname, 'temp_test_dir');
      if (!fs.existsSync(this.tempDir)) {
        fs.mkdirSync(this.tempDir, { recursive: true });
      }
    });

    mocha.afterEach(function () {
      if (fs.existsSync(this.tempDir)) {
        fs.rmSync(this.tempDir, { recursive: true, force: true });
      }
    });

    mocha.it('1-1: test filterStaticObfuscationConfig with valid config', function () {
      const mockConfigPath = path.join(this.tempDir, 'test_config.txt');
      const mockConfigContent = `
-apply-namecache ./relative-cache.txt
-print-namecache ./relative-print-cache.txt
-keep-class-members class *.Index.*
-print-seeds 
res/result.txt
-enable-export-obfuscation
-keep-global-name
Index
-keep class *.Index.* {*;}
-keep src/main/Test.ets
`;
      fs.writeFileSync(mockConfigPath, mockConfigContent);

      const mockProjectConfig = {
        obfuscationOptions: {
          selfConfig: {
            ruleOptions: {
              enable: true,
              rules: [mockConfigPath]
            }
          },
          obfuscationCacheDir: this.tempDir
        }
      };

      let logCalled = false;
      const mockPrintObfLogger = (errorInfo: string, errorCodeInfo: any, level: string) => {
        logCalled = true;
      };

      utProcessObfConfig.filterStaticObfuscationConfig(mockProjectConfig, mockPrintObfLogger);
      expect(mockProjectConfig.obfuscationOptions.selfConfig.ruleOptions.rules.length).to.equal(1);
      const updatedConfigPath = mockProjectConfig.obfuscationOptions.selfConfig.ruleOptions.rules[0];
      expect(updatedConfigPath.includes(this.tempDir)).to.be.true;

      const processedContent = fs.readFileSync(updatedConfigPath, 'utf-8');
      expect(processedContent.includes('-print-seeds')).to.be.false;
      expect(processedContent.includes('-keep-global-name')).to.be.true;
      expect(processedContent.includes(path.resolve(path.dirname(mockConfigPath), 'relative-cache.txt'))).to.be.true;
    });

    mocha.it('1-2: test filterStaticConfigByPath with existing file', function () {
      const mockConfigPath = path.join(this.tempDir, 'test_config_by_path.txt');
      const mockConfigContent = `
-apply-namecache
./relative-cache.txt
# Comment line
-keep-class-with-members class TestClass
MainPage
-print-seeds ./sss.log
-enable-filename-obfuscation
-enable-export-obfuscation
-keep-global-name Index
-keep-property-name fun
`;
      fs.writeFileSync(mockConfigPath, mockConfigContent);

      let logCalled = false;
      const mockPrintObfLogger = (errorInfo: string, errorCodeInfo: any, level: string) => {
        logCalled = true;
      };

      const resultPath = utProcessObfConfig.filterStaticConfigByPath(mockConfigPath, this.tempDir, mockPrintObfLogger);

      expect(resultPath.includes(this.tempDir)).to.be.true;
      expect(resultPath.includes(path.basename(mockConfigPath))).to.be.true;

      const processedContent = fs.readFileSync(resultPath, 'utf-8');
      expect(processedContent).not.to.be.empty;
      expect(processedContent.includes('-keep-class-with-members')).to.be.false;
      expect(processedContent.includes('-keep-property-name')).to.be.true;
      expect(processedContent.includes(path.resolve(path.dirname(mockConfigPath), 'relative-cache.txt'))).to.be.true;
    });

    mocha.it('1-3: test cleanObfuscationRules functionality', function () {
      const mockConfigPath = path.join(this.tempDir, 'clean_rules_test.txt');
      const mockConfigContent = `# Comment line
-apply-namecache ./relative-cache.txt
-print-namecache
output/relative-print-cache.txt
-keep-class-members class *.Index.*
-print-seeds 
res/result.txt
-enable-export-obfuscation
-keep-global-name
Index
-keep class *.Index.* {*;}
-keep src/main/Test.ets
-keep-dts src/main/ets.d.ts
-print-configuration
./build/default/outputs/print_configuration.log
`;

      fs.writeFileSync(mockConfigPath, mockConfigContent);

      const result = utProcessObfConfig.cleanObfuscationRules(mockConfigContent, mockConfigPath);
      expect(result.includes('-enable-export-obfuscation')).to.be.true;
      expect(result.includes('-keep-global-name')).to.be.true;

      expect(result.includes('-print-seeds')).to.be.false;
      expect(result.includes('-keep-class-members')).to.be.false;
      expect(result.includes('-print-configuration')).to.be.false;
      expect(result.includes('-keep-class-with-members')).to.be.false;
      expect(result.includes(path.resolve(path.dirname(mockConfigPath), 'relative-cache.txt'))).to.be.true;
      fs.unlinkSync(mockConfigPath);
    });

    mocha.it('1-4: test processNameCacheLine function', function () {
      const mockConfigDir = '/tmp/config';
      const applyResult = utProcessObfConfig.processNameCacheLine('-apply-namecache relative-path.txt', mockConfigDir, '-apply-namecache relative-path.txt');
      expect(applyResult).to.equal(`-apply-namecache ${path.resolve(mockConfigDir, 'relative-path.txt')}`);
      const printResult = utProcessObfConfig.processNameCacheLine('-print-namecache another-path.txt', mockConfigDir, '-print-namecache another-path.txt');
      expect(printResult).to.equal(`-print-namecache ${path.resolve(mockConfigDir, 'another-path.txt')}`);
      const nonNameCacheResult = utProcessObfConfig.processNameCacheLine('-some-other-rule value', mockConfigDir, '-some-other-rule value');
      expect(nonNameCacheResult).to.be.null;
    });
  });
});