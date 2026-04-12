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
  utProcessObfConfig,
  mergeNameCache,
  mergeObfuscationRules
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
-keep-dts
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
-keep-dts
-apply-namecache
./relative-cache.txt

-print-namecache
./relative-print-cache.txt

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
      expect(processedContent.includes('-apply-namecache')).to.be.true;
      expect(processedContent.includes('-print-namecache')).to.be.true;
      expect(processedContent.includes(path.resolve(path.dirname(mockConfigPath), 'relative-cache.txt'))).to.be.true;
      expect(processedContent.includes(path.resolve(path.dirname(mockConfigPath), 'relative-print-cache.txt'))).to.be.true;
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
-keep
src/main/TestB.ets
-keep
src/main/TestC.ets
src/main/TestD.ets

-keep src/main/TestE.ets
src/main/TestF.ets
src/main/TestG.ets
-keep src/main/test/*.ets
!src/main/test/TestA.ets
!src/main/test/TestC.ets

-keep-class-with-members class TestClassMainPage {*;}
-keep-dts src/main/ets.d.ts
-print-configuration
./build/default/outputs/print_configuration.log
`;

      fs.writeFileSync(mockConfigPath, mockConfigContent);

      const result = utProcessObfConfig.cleanObfuscationRules(mockConfigContent, mockConfigPath);
      console.log(result);
      expect(result.includes('-enable-export-obfuscation')).to.be.true;
      expect(result.includes('-keep-global-name')).to.be.true;

      expect(result.includes('-print-seeds')).to.be.false;
      expect(result.includes('-keep-class-members')).to.be.false;
      expect(result.includes('-print-configuration')).to.be.false;
      expect(result.includes('-keep-class-with-members')).to.be.false;
      expect(result.includes('-keep ../../../../../../../../src/main/Test.ets')).to.be.true;
      expect(result.includes(`-keep
../../../../../../../../src/main/TestB.ets`)).to.be.true;
      expect(result.includes(`-keep
../../../../../../../../src/main/TestC.ets
../../../../../../../../src/main/TestD.ets`)).to.be.true;
      expect(result.includes(`-keep ../../../../../../../../src/main/TestE.ets
../../../../../../../../src/main/TestF.ets
../../../../../../../../src/main/TestG.ets`)).to.be.true;
      expect(result.includes(`-keep ../../../../../../../../src/main/test/*.ets
!../../../../../../../../src/main/test/TestA.ets
!../../../../../../../../src/main/test/TestC.ets`)).to.be.true;
      expect(result.includes('-keep-class-with-members')).to.be.false;
      expect(result.includes('class TestClassMainPage')).to.be.false;
      expect(result.includes('class *.Index.* {*;}')).to.be.false;
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

    mocha.it('1-5: test not keep-dts line', function () {
      const mockConfigPath = path.join(this.tempDir, 'test_config_by_path.txt');
      const mockConfigContent = `
-apply-namecache
./relative-cache.txt

-print-namecache
./relative-print-cache.txt

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
      expect(resultPath === mockConfigPath);
    });
    
  });

  mocha.describe('2: test mergeNameCache related apis', function () {
    mocha.beforeEach(function () {
      this.tempDir = path.join(__dirname, 'temp_merge_test_dir');
      if (!fs.existsSync(this.tempDir)) {
        fs.mkdirSync(this.tempDir, { recursive: true });
      }
      this.dynamicObfPath = path.join(this.tempDir, 'dynamic');
      this.staticObfPath = path.join(this.tempDir, 'static');
      fs.mkdirSync(this.dynamicObfPath, { recursive: true });
      fs.mkdirSync(this.staticObfPath, { recursive: true });
    });

    mocha.afterEach(function () {
      if (fs.existsSync(this.tempDir)) {
        fs.rmSync(this.tempDir, { recursive: true, force: true });
      }
    });

    mocha.it('2-1: test mergeNameCache with normal case', async function () {
      // Create config files
      const dynamicConfig = {
        obfuscationRules: {
          disableObfuscation: false,
          printNameCache: path.join(this.tempDir, 'merged_name_cache.json')
        },
        defaultNameCachePath: path.join(this.dynamicObfPath, 'name_cache.json')
      };
      const staticConfig = {
        obfuscationRules: {
          disableObfuscation: false
        },
        defaultNameCachePath: path.join(this.staticObfPath, 'name_cache.json')
      };

      fs.writeFileSync(path.join(this.dynamicObfPath, 'config.json'), JSON.stringify(dynamicConfig));
      fs.writeFileSync(path.join(this.staticObfPath, 'config.json'), JSON.stringify(staticConfig));

      // Create name cache files
      const dynamicCache = { 'key1': 'value1', 'key2': 'value2' };
      const staticCache = { 'key2': 'static_value2', 'key3': 'value3' };

      fs.writeFileSync(dynamicConfig.defaultNameCachePath, JSON.stringify(dynamicCache));
      fs.writeFileSync(staticConfig.defaultNameCachePath, JSON.stringify(staticCache));

      // Mock printObfLogger
      let logCalled = false;
      const originalPrintObfLogger = require('../../../lib/fast_build/ark_compiler/common/ob_config_resolver').printObfLogger;
      require('../../../lib/fast_build/ark_compiler/common/ob_config_resolver').printObfLogger = (errorInfo: string, errorCodeInfo: any, level: string) => {
        logCalled = true;
      };

      // Call mergeNameCache
      await mergeNameCache(this.dynamicObfPath, this.staticObfPath);

      // Restore printObfLogger
      require('../../../lib/fast_build/ark_compiler/common/ob_config_resolver').printObfLogger = originalPrintObfLogger;

      // Verify result
      expect(fs.existsSync(dynamicConfig.obfuscationRules.printNameCache)).to.be.true;
      const mergedContent = JSON.parse(fs.readFileSync(dynamicConfig.obfuscationRules.printNameCache, 'utf8'));
      expect(mergedContent.key1).to.equal('value1');
      expect(mergedContent.key2).to.equal('value2'); // Dynamic should override static
      expect(mergedContent.key3).to.equal('value3');
    });

    mocha.it('2-2: test mergeNameCache with config files not exist', async function () {
      // Mock printObfLogger
      let logCalled = false;
      const originalPrintObfLogger = require('../../../lib/fast_build/ark_compiler/common/ob_config_resolver').printObfLogger;
      require('../../../lib/fast_build/ark_compiler/common/ob_config_resolver').printObfLogger = (errorInfo: string, errorCodeInfo: any, level: string) => {
        logCalled = true;
      };

      // Call mergeNameCache with non-existent paths
      await mergeNameCache(this.dynamicObfPath, this.staticObfPath);

      // Restore printObfLogger
      require('../../../lib/fast_build/ark_compiler/common/ob_config_resolver').printObfLogger = originalPrintObfLogger;

      // Verify no error was called
      expect(logCalled).to.be.false;
    });

    mocha.it('2-3: test mergeNameCache with obfuscation disabled', async function () {
      // Create config files with obfuscation disabled
      const dynamicConfig = {
        obfuscationRules: {
          disableObfuscation: true,
          printNameCache: path.join(this.tempDir, 'merged_name_cache.json')
        },
        defaultNameCachePath: path.join(this.dynamicObfPath, 'name_cache.json')
      };
      const staticConfig = {
        obfuscationRules: {
          disableObfuscation: false
        },
        defaultNameCachePath: path.join(this.staticObfPath, 'name_cache.json')
      };

      fs.writeFileSync(path.join(this.dynamicObfPath, 'config.json'), JSON.stringify(dynamicConfig));
      fs.writeFileSync(path.join(this.staticObfPath, 'config.json'), JSON.stringify(staticConfig));

      // Create name cache files
      const dynamicCache = { 'key1': 'value1' };
      const staticCache = { 'key2': 'value2' };

      fs.writeFileSync(dynamicConfig.defaultNameCachePath, JSON.stringify(dynamicCache));
      fs.writeFileSync(staticConfig.defaultNameCachePath, JSON.stringify(staticCache));

      // Call mergeNameCache
      await mergeNameCache(this.dynamicObfPath, this.staticObfPath);

      // Verify no merged file was created
      expect(fs.existsSync(dynamicConfig.obfuscationRules.printNameCache)).to.be.false;
    });

    mocha.it('2-4: test mergeNameCache with empty printNameCache path', async function () {
      // Create config files with empty printNameCache path
      const dynamicConfig = {
        obfuscationRules: {
          disableObfuscation: false,
          printNameCache: ''
        },
        defaultNameCachePath: path.join(this.dynamicObfPath, 'name_cache.json')
      };
      const staticConfig = {
        obfuscationRules: {
          disableObfuscation: false
        },
        defaultNameCachePath: path.join(this.staticObfPath, 'name_cache.json')
      };

      fs.writeFileSync(path.join(this.dynamicObfPath, 'config.json'), JSON.stringify(dynamicConfig));
      fs.writeFileSync(path.join(this.staticObfPath, 'config.json'), JSON.stringify(staticConfig));

      // Create name cache files
      const dynamicCache = { 'key1': 'value1' };
      const staticCache = { 'key2': 'value2' };

      fs.writeFileSync(dynamicConfig.defaultNameCachePath, JSON.stringify(dynamicCache));
      fs.writeFileSync(staticConfig.defaultNameCachePath, JSON.stringify(staticCache));

      // Call mergeNameCache
      await mergeNameCache(this.dynamicObfPath, this.staticObfPath);

      // Verify no merged file was created
      expect(fs.existsSync(dynamicConfig.obfuscationRules.printNameCache)).to.be.false;
    });

    mocha.it('2-5: test mergeNameCache with name cache files not exist', async function () {
      // Create config files
      const dynamicConfig = {
        obfuscationRules: {
          disableObfuscation: false,
          printNameCache: path.join(this.tempDir, 'merged_name_cache.json')
        },
        defaultNameCachePath: path.join(this.dynamicObfPath, 'name_cache.json')
      };
      const staticConfig = {
        obfuscationRules: {
          disableObfuscation: false
        },
        defaultNameCachePath: path.join(this.staticObfPath, 'name_cache.json')
      };

      fs.writeFileSync(path.join(this.dynamicObfPath, 'config.json'), JSON.stringify(dynamicConfig));
      fs.writeFileSync(path.join(this.staticObfPath, 'config.json'), JSON.stringify(staticConfig));

      // Create only dynamic cache file
      const dynamicCache = { 'key1': 'value1' };
      fs.writeFileSync(dynamicConfig.defaultNameCachePath, JSON.stringify(dynamicCache));

      // Call mergeNameCache
      await mergeNameCache(this.dynamicObfPath, this.staticObfPath);

      // Verify no merged file was created
      expect(fs.existsSync(dynamicConfig.obfuscationRules.printNameCache)).to.be.false;
    });

    mocha.it('2-6: test mergeNameCache with error handling', async function () {
      // Create config files
      const dynamicConfig = {
        obfuscationRules: {
          disableObfuscation: false,
          printNameCache: path.join(this.tempDir, 'merged_name_cache.json')
        },
        defaultNameCachePath: path.join(this.dynamicObfPath, 'name_cache.json')
      };
      const staticConfig = {
        obfuscationRules: {
          disableObfuscation: false
        },
        defaultNameCachePath: path.join(this.staticObfPath, 'name_cache.json')
      };

      fs.writeFileSync(path.join(this.dynamicObfPath, 'config.json'), JSON.stringify(dynamicConfig));
      fs.writeFileSync(path.join(this.staticObfPath, 'config.json'), JSON.stringify(staticConfig));

      // Create invalid JSON in static cache file
      fs.writeFileSync(dynamicConfig.defaultNameCachePath, JSON.stringify({ 'key1': 'value1' }));
      fs.writeFileSync(staticConfig.defaultNameCachePath, '{ invalid json }');

      // Mock printObfLogger
      let logCalled = false;
      const originalPrintObfLogger = require('../../../lib/fast_build/ark_compiler/common/ob_config_resolver').printObfLogger;
      require('../../../lib/fast_build/ark_compiler/common/ob_config_resolver').printObfLogger = (errorInfo: string, errorCodeInfo: any, level: string) => {
        logCalled = true;
      };

      // Call mergeNameCache
      await mergeNameCache(this.dynamicObfPath, this.staticObfPath);

      // Restore printObfLogger
      require('../../../lib/fast_build/ark_compiler/common/ob_config_resolver').printObfLogger = originalPrintObfLogger;

      // Verify log was called
      expect(logCalled).to.be.true;
    });

    mocha.it('2-7: test mergeNameCache with Set values', async function () {
      // Create config files
      const dynamicConfig = {
        obfuscationRules: {
          disableObfuscation: false,
          printNameCache: path.join(this.tempDir, 'merged_name_cache.json')
        },
        defaultNameCachePath: path.join(this.dynamicObfPath, 'name_cache.json')
      };
      const staticConfig = {
        obfuscationRules: {
          disableObfuscation: false
        },
        defaultNameCachePath: path.join(this.staticObfPath, 'name_cache.json')
      };

      fs.writeFileSync(path.join(this.dynamicObfPath, 'config.json'), JSON.stringify(dynamicConfig));
      fs.writeFileSync(path.join(this.staticObfPath, 'config.json'), JSON.stringify(staticConfig));

      // Create name cache files with Set values
      const dynamicCache = { 'key1': 'value1' };
      const staticCache = { 'key2': 'value2' };

      fs.writeFileSync(dynamicConfig.defaultNameCachePath, JSON.stringify(dynamicCache));
      fs.writeFileSync(staticConfig.defaultNameCachePath, JSON.stringify(staticCache));

      // Mock printObfLogger
      let logCalled = false;
      const originalPrintObfLogger = require('../../../lib/fast_build/ark_compiler/common/ob_config_resolver').printObfLogger;
      require('../../../lib/fast_build/ark_compiler/common/ob_config_resolver').printObfLogger = (errorInfo: string, errorCodeInfo: any, level: string) => {
        logCalled = true;
      };

      // Call mergeNameCache
      await mergeNameCache(this.dynamicObfPath, this.staticObfPath);

      // Restore printObfLogger
      require('../../../lib/fast_build/ark_compiler/common/ob_config_resolver').printObfLogger = originalPrintObfLogger;

      // Verify result
      expect(fs.existsSync(dynamicConfig.obfuscationRules.printNameCache)).to.be.true;
      const mergedContent = JSON.parse(fs.readFileSync(dynamicConfig.obfuscationRules.printNameCache, 'utf8'));
      expect(mergedContent.key1).to.equal('value1');
      expect(mergedContent.key2).to.equal('value2');
    });
  });

  mocha.describe('3: test mergeObfuscationRules related apis', function () {
    const OBFUSCATION_TXT = 'obfuscation.txt';

    mocha.beforeEach(function () {
      this.tempDir = path.join(__dirname, 'temp_merge_obfuscation_rules_dir');
      if (!fs.existsSync(this.tempDir)) {
        fs.mkdirSync(this.tempDir, { recursive: true });
      }
      this.dynamicDir = path.join(this.tempDir, 'dynamic');
      this.staticDir = path.join(this.tempDir, 'static');
      this.outputDir = path.join(this.tempDir, 'output');
      fs.mkdirSync(this.dynamicDir, { recursive: true });
      fs.mkdirSync(this.staticDir, { recursive: true });
    });

    mocha.afterEach(function () {
      if (fs.existsSync(this.tempDir)) {
        fs.rmSync(this.tempDir, { recursive: true, force: true });
      }
    });

    mocha.it('3-1: test mergeObfuscationRules merges dynamic first then unique static lines', async function () {
      const dynamicTxt = path.join(this.dynamicDir, OBFUSCATION_TXT);
      const staticTxt = path.join(this.staticDir, OBFUSCATION_TXT);
      fs.writeFileSync(dynamicTxt, '-enable-export-obfuscation\n-keep-dynamic-only\n');
      fs.writeFileSync(staticTxt, '-enable-export-obfuscation\n-keep-static-extra\n');

      fs.mkdirSync(this.outputDir, { recursive: true });
      await mergeObfuscationRules(this.dynamicDir, this.staticDir, this.outputDir);

      const outPath = path.join(this.outputDir, OBFUSCATION_TXT);
      expect(fs.existsSync(outPath)).to.be.true;
      const merged = fs.readFileSync(outPath, 'utf-8');
      expect(merged.endsWith('\n')).to.be.true;
      const lines = merged.trimEnd().split(/\r?\n/);
      expect(lines[0]).to.equal('-enable-export-obfuscation');
      expect(lines[1]).to.equal('-keep-dynamic-only');
      expect(lines[2]).to.equal('-keep-static-extra');
    });

    mocha.it('3-2: test mergeObfuscationRules copies only dynamic when static file missing', async function () {
      const dynamicTxt = path.join(this.dynamicDir, OBFUSCATION_TXT);
      fs.writeFileSync(dynamicTxt, '-only-dynamic\n');

      fs.mkdirSync(this.outputDir, { recursive: true });
      await mergeObfuscationRules(this.dynamicDir, this.staticDir, this.outputDir);

      const outPath = path.join(this.outputDir, OBFUSCATION_TXT);
      expect(fs.readFileSync(outPath, 'utf-8')).to.equal('-only-dynamic\n');
    });

    mocha.it('3-3: test mergeObfuscationRules copies only static when dynamic file missing', async function () {
      const staticTxt = path.join(this.staticDir, OBFUSCATION_TXT);
      fs.writeFileSync(staticTxt, '-only-static\n');

      fs.mkdirSync(this.outputDir, { recursive: true });
      await mergeObfuscationRules(this.dynamicDir, this.staticDir, this.outputDir);

      const outPath = path.join(this.outputDir, OBFUSCATION_TXT);
      expect(fs.readFileSync(outPath, 'utf-8')).to.equal('-only-static\n');
    });

    mocha.it('3-4: test mergeObfuscationRules no-op when both inputs missing', async function () {
      fs.mkdirSync(this.outputDir, { recursive: true });
      await mergeObfuscationRules(this.dynamicDir, this.staticDir, this.outputDir);

      expect(fs.existsSync(path.join(this.outputDir, OBFUSCATION_TXT))).to.be.false;
    });

    mocha.it('3-5: test mergeObfuscationRules returns early when any directory arg is empty', async function () {
      await mergeObfuscationRules('', this.staticDir, this.outputDir);
      await mergeObfuscationRules(this.dynamicDir, '', this.outputDir);
      await mergeObfuscationRules(this.dynamicDir, this.staticDir, '');
      await mergeObfuscationRules('', '', '');
    });

    mocha.it('3-6: test mergeObfuscationRules creates output directory when absent', async function () {
      const dynamicTxt = path.join(this.dynamicDir, OBFUSCATION_TXT);
      fs.writeFileSync(dynamicTxt, '-rule-a\n');
      const nestedOut = path.join(this.tempDir, 'nested', 'out');
      expect(fs.existsSync(nestedOut)).to.be.false;

      await mergeObfuscationRules(this.dynamicDir, this.staticDir, nestedOut);

      expect(fs.existsSync(path.join(nestedOut, OBFUSCATION_TXT))).to.be.true;
    });

    mocha.it('3-8: test mergeObfuscationRules when args are obfuscation.txt file paths (hvigor)', async function () {
      const dynamicFile = path.join(this.dynamicDir, OBFUSCATION_TXT);
      const staticFile = path.join(this.staticDir, OBFUSCATION_TXT);
      const outputFile = path.join(this.outputDir, OBFUSCATION_TXT);
      fs.writeFileSync(dynamicFile, '-line-dyn\n');
      fs.writeFileSync(staticFile, '-line-stat\n');
      fs.mkdirSync(this.outputDir, { recursive: true });

      await mergeObfuscationRules(dynamicFile, staticFile, outputFile);

      const lines = fs.readFileSync(outputFile, 'utf-8').trimEnd().split(/\r?\n/);
      expect(lines).to.deep.equal(['-line-dyn', '-line-stat']);
    });

    mocha.it('3-7: test mergeObfuscationRules error handling invokes printObfLogger', async function () {
      const dynamicTxt = path.join(this.dynamicDir, OBFUSCATION_TXT);
      fs.writeFileSync(dynamicTxt, '-ok\n');
      const blockerPath = path.join(this.tempDir, 'not_a_dir');
      fs.writeFileSync(blockerPath, 'file');

      let logCalled = false;
      const originalPrintObfLogger = require('../../../lib/fast_build/ark_compiler/common/ob_config_resolver').printObfLogger;
      require('../../../lib/fast_build/ark_compiler/common/ob_config_resolver').printObfLogger =
        (errorInfo: string, errorCodeInfo: any, level: string) => {
          logCalled = true;
        };

      await mergeObfuscationRules(this.dynamicDir, this.staticDir, blockerPath);

      require('../../../lib/fast_build/ark_compiler/common/ob_config_resolver').printObfLogger = originalPrintObfLogger;

      expect(logCalled).to.be.true;
    });
  });
});