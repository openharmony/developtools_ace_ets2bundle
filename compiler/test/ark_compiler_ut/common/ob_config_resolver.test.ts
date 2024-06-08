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
  ObConfigResolver,
  collectResevedFileNameInIDEConfig,
  getRelativeSourcePath
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

  mocha.afterEach(() => {
    if (fs.existsSync(`${OBFUSCATION_RULE_PATH}`)) {
      fs.unlinkSync(`${OBFUSCATION_RULE_PATH}`);
    }
  });

  mocha.after(() => {
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

  mocha.it('1-2: test resolveObfuscationConfigs: -enable-property-obfuscation', function () {
    this.rollup.build(RELEASE);
    const logger: object = this.rollup.share.getLogger(OBFUSCATION_TOOL);
    const optionContent: string = '-enable-property-obfuscation';
    fs.writeFileSync(`${OBFUSCATION_RULE_PATH}`, optionContent);
    this.rollup.share.projectConfig.obfuscationOptions = {
      'selfConfig': {
        'ruleOptions': {
          'enable': true,
          'rules': [OBFUSCATION_RULE_PATH]
        },
        'consumerRules': [],
      },
      'dependencies': {
        'libraries': [],
        'hars': []
      }
    };
    const obConfigResolver: ObConfigResolver =  new ObConfigResolver(this.rollup.share.projectConfig, logger, true);
    const mergedObConfig: MergedConfig = obConfigResolver.resolveObfuscationConfigs();
    const obOptions: ObOptions = mergedObConfig.options;
    for (const [optionName, optionValue] of Object.entries(obOptions)) {
      if (optionName === 'enablePropertyObfuscation') {
        expect(optionValue).to.be.true;
      } else {
        if (typeof optionValue === 'boolean') {
          expect(optionValue).to.be.false;
        } else if (typeof optionValue === 'string') {
          expect(optionValue === '').to.be.true;
        }
      }
    }
  });

  mocha.it('1-3: test resolveObfuscationConfigs: -enable-property-obfuscation -enable-export-obfuscation', function () {
    this.rollup.build(RELEASE);
    const logger: object = this.rollup.share.getLogger(OBFUSCATION_TOOL);
    const optionContent: string = '-enable-property-obfuscation\n-enable-export-obfuscation';
    fs.writeFileSync(`${OBFUSCATION_RULE_PATH}`, optionContent);
    this.rollup.share.projectConfig.obfuscationOptions = {
      'selfConfig': {
        'ruleOptions': {
          'enable': true,
          'rules': [OBFUSCATION_RULE_PATH]
        },
        'consumerRules': [],
      },
      'dependencies': {
        'libraries': [],
        'hars': []
      }
    };
    const obConfigResolver: ObConfigResolver =  new ObConfigResolver(this.rollup.share.projectConfig, logger, true);
    const mergedObConfig: MergedConfig = obConfigResolver.resolveObfuscationConfigs();
    const obOptions: ObOptions = mergedObConfig.options;
    for (const [optionName, optionValue] of Object.entries(obOptions)) {
      if (optionName === 'enablePropertyObfuscation' || optionName === 'enableExportObfuscation') {
        expect(optionValue).to.be.true;
      } else {
        if (typeof optionValue === 'boolean') {
          expect(optionValue).to.be.false;
        } else if (typeof optionValue === 'string') {
          expect(optionValue === '').to.be.true;
        }
      }
    }
  });

  mocha.it('1-3: test resolveObfuscationConfigs: -enable-property-obfuscation -enable-string-property-obfuscation', function () {
    this.rollup.build(RELEASE);
    const logger: object = this.rollup.share.getLogger(OBFUSCATION_TOOL);
    const optionContent: string = '-enable-property-obfuscation\n-enable-string-property-obfuscation';
    fs.writeFileSync(`${OBFUSCATION_RULE_PATH}`, optionContent);
    this.rollup.share.projectConfig.obfuscationOptions = {
      'selfConfig': {
        'ruleOptions': {
          'enable': true,
          'rules': [OBFUSCATION_RULE_PATH]
        },
        'consumerRules': [],
      },
      'dependencies': {
        'libraries': [],
        'hars': []
      }
    };
    const obConfigResolver: ObConfigResolver =  new ObConfigResolver(this.rollup.share.projectConfig, logger, true);
    const mergedObConfig: MergedConfig = obConfigResolver.resolveObfuscationConfigs();
    const obOptions: ObOptions = mergedObConfig.options;
    for (const [optionName, optionValue] of Object.entries(obOptions)) {
      if (optionName === 'enablePropertyObfuscation' || optionName === 'enableStringPropertyObfuscation') {
        expect(optionValue).to.be.true;
      } else {
        if (typeof optionValue === 'boolean') {
          expect(optionValue).to.be.false;
        } else if (typeof optionValue === 'string') {
          expect(optionValue === '').to.be.true;
        }
      }
    }
  });

  mocha.it('1-4: test resolveObfuscationConfigs: -enable-property-obfuscation -enable-toplevel-obfuscation', function () {
    this.rollup.build(RELEASE);
    const logger: object = this.rollup.share.getLogger(OBFUSCATION_TOOL);
    const optionContent: string = '-enable-property-obfuscation\n-enable-toplevel-obfuscation';
    fs.writeFileSync(`${OBFUSCATION_RULE_PATH}`, optionContent);
    this.rollup.share.projectConfig.obfuscationOptions = {
      'selfConfig': {
        'ruleOptions': {
          'enable': true,
          'rules': [OBFUSCATION_RULE_PATH]
        },
        'consumerRules': [],
      },
      'dependencies': {
        'libraries': [],
        'hars': []
      }
    };
    const obConfigResolver: ObConfigResolver =  new ObConfigResolver(this.rollup.share.projectConfig, logger, true);
    const mergedObConfig: MergedConfig = obConfigResolver.resolveObfuscationConfigs();
    const obOptions: ObOptions = mergedObConfig.options;
    for (const [optionName, optionValue] of Object.entries(obOptions)) {
      if (optionName === 'enablePropertyObfuscation' || optionName === 'enableToplevelObfuscation') {
        expect(optionValue).to.be.true;
      } else {
        if (typeof optionValue === 'boolean') {
          expect(optionValue).to.be.false;
        } else if (typeof optionValue === 'string') {
          expect(optionValue === '').to.be.true;
        }
      }
    }
  });

  mocha.it('1-5: test resolveObfuscationConfigs: enable all', function () {
    this.rollup.build(RELEASE);
    const logger: object = this.rollup.share.getLogger(OBFUSCATION_TOOL);
    const optionContent: string = '-enable-property-obfuscation\n-enable-export-obfuscation\n-enable-filename-obfuscation\n'
                                + '-enable-string-property-obfuscation\n-enable-toplevel-obfuscation';
    fs.writeFileSync(`${OBFUSCATION_RULE_PATH}`, optionContent);
    this.rollup.share.projectConfig.obfuscationOptions = {
      'selfConfig': {
        'ruleOptions': {
          'enable': true,
          'rules': [OBFUSCATION_RULE_PATH]
        },
        'consumerRules': [],
      },
      'dependencies': {
        'libraries': [],
        'hars': []
      }
    };
    const obConfigResolver: ObConfigResolver =  new ObConfigResolver(this.rollup.share.projectConfig, logger, true);
    const mergedObConfig: MergedConfig = obConfigResolver.resolveObfuscationConfigs();
    const obOptions: ObOptions = mergedObConfig.options;
    expect(obOptions.disableObfuscation).to.be.false;
    expect(obOptions.enablePropertyObfuscation).to.be.true;
    expect(obOptions.enableStringPropertyObfuscation).to.be.true;
    expect(obOptions.enableToplevelObfuscation).to.be.true;
    expect(obOptions.enableFileNameObfuscation).to.be.true;
    expect(obOptions.enableExportObfuscation).to.be.true;
    expect(obOptions.removeComments).to.be.false;
    expect(obOptions.compact).to.be.false;
    expect(obOptions.removeLog).to.be.false;
  });

  describe('2: test collectResevedFileNameInIDEConfig', function() {
    let aceModuleJsonPath = '';
    let ohPackagePath = '';
    let projectConfig = {};
    let modulePathMap = {};
    let entryObj = {};
    mocha.before('init config', function () {
      aceModuleJsonPath = path.join(OBFUSCATE_TESTDATA_DIR, 'filename_obf/module.json');
      ohPackagePath = path.join(OBFUSCATE_TESTDATA_DIR, 'filename_obf/oh-package.json5');
      projectConfig = {
        aceModuleJsonPath: aceModuleJsonPath,
        projectPath: '/mnt/application/entry/src/main/ets',
        cachePath: '/mnt/application/entry/build/default/cache/default/default@HarCompileArkTs/esmodules/release',
        aceModuleBuild: '/mnt/application/entry/build/default/intermediates/loader_out',
        compileShared: false,
        compileHar: false,
        byteCodeHar: false,
      };
      modulePathMap = {
        'entry': '/mnt/application/entry',
        'harPackageName': '/mnt/application/harPackageName'
      };
      entryObj = {
        'entryability/EntryAbility': 'D:\\enrty\\src\\main\\ets\\entryability\\EntryAbility.ets',
        'pages/Index': 'D:\\entry\\src\\main\\ets\\pages\\Index.ets'
      };
    });

    mocha.it('2-1: test collectResevedFileNameInIDEConfig in hsp module', function () {
      projectConfig.compileShared = true;
      projectConfig.compileHar = false;
      projectConfig.byteCodeHar = false;
      const acutualReservedFileNames: string[] = collectResevedFileNameInIDEConfig(ohPackagePath, projectConfig, modulePathMap, entryObj);
      const expectReservedFileNames = [
        'entryability',
        'EntryAbility',
        'pages',
        'Index',
        '',
        'mnt',
        'application',
        'entry',
        '',
        'mnt',
        'application',
        'harPackageName',
        '.',
        'Index-oh-package.ets',
        '.',
        'Type-oh-package.ets',
        '..',
        '..',
        'Index2.ets',
        '',
        'mnt',
        'application',
        'entry',
        'build',
        'default',
        'intermediates',
        'loader_out',
        'etsFortgz',
        '',
        'mnt',
        'application',
        'entry',
        'src',
        'main',
        'ets',
        '',
        'mnt',
        'application',
        'entry',
        'build',
        'default',
        'cache',
        'default',
        'default@HarCompileArkTs',
        'esmodules',
        'release'
      ];
      expect(acutualReservedFileNames.toString() === expectReservedFileNames.toString()).to.be.true;
    });
  
    mocha.it('2-2: test collectResevedFileNameInIDEConfig in hap module', function () {
      projectConfig.compileShared = false;
      projectConfig.compileHar = false;
      projectConfig.byteCodeHar = false;
      const acutualReservedFileNames: string[] = collectResevedFileNameInIDEConfig(ohPackagePath, projectConfig, modulePathMap, entryObj);
      const expectReservedFileNames = [
        'entryability',
        'EntryAbility',
        'pages',
        'Index',
        '',
        'mnt',
        'application',
        'entry',
        '',
        'mnt',
        'application',
        'harPackageName',
        '.',
        'Index-oh-package.ets',
        '.',
        'Type-oh-package.ets',
        '..',
        '..',
        'Index2.ets',
        '',
        'mnt',
        'application',
        'entry',
        'src',
        'main',
        'ets',
        '',
        'mnt',
        'application',
        'entry',
        'build',
        'default',
        'cache',
        'default',
        'default@HarCompileArkTs',
        'esmodules',
        'release'
      ];
      expect(acutualReservedFileNames.toString() === expectReservedFileNames.toString()).to.be.true;
    });
  
    mocha.it('2-3: test collectResevedFileNameInIDEConfig in source har module', function () {
      projectConfig.compileShared = false;
      projectConfig.compileHar = true;
      projectConfig.byteCodeHar = false;
      const acutualReservedFileNames: string[] = collectResevedFileNameInIDEConfig(ohPackagePath, projectConfig, modulePathMap, entryObj);
      const expectReservedFileNames = [
        'entryability',
        'EntryAbility',
        'pages',
        'Index',
        '',
        'mnt',
        'application',
        'entry',
        '',
        'mnt',
        'application',
        'harPackageName',
        '.',
        'Index-oh-package.ets',
        '.',
        'Type-oh-package.ets',
        '..',
        '..',
        'Index2.ets',
        '',
        'mnt',
        'application',
        'entry',
        'src',
        'main',
        'ets',
        '',
        'mnt',
        'application',
        'entry',
        'build',
        'default',
        'cache',
        'default',
        'default@HarCompileArkTs',
        'esmodules',
        'release'
      ];
      expect(acutualReservedFileNames.toString() === expectReservedFileNames.toString()).to.be.true;
    });
  
    mocha.it('2-4: test collectResevedFileNameInIDEConfig in byte code har module', function () {
      projectConfig.compileShared = false;
      projectConfig.compileHar = true;
      projectConfig.byteCodeHar = true;
      const acutualReservedFileNames: string[] = collectResevedFileNameInIDEConfig(ohPackagePath, projectConfig, modulePathMap, entryObj);
      const expectReservedFileNames = [
        'entryability',
        'EntryAbility',
        'pages',
        'Index',
        '',
        'mnt',
        'application',
        'entry',
        '',
        'mnt',
        'application',
        'harPackageName',
        '.',
        'Index-oh-package.ets',
        '.',
        'Type-oh-package.ets',
        '..',
        '..',
        'Index2.ets',
        '',
        'mnt',
        'application',
        'entry',
        'build',
        'default',
        'intermediates',
        'loader_out',
        'etsFortgz',
        '',
        'mnt',
        'application',
        'entry',
        'src',
        'main',
        'ets',
        '',
        'mnt',
        'application',
        'entry',
        'build',
        'default',
        'cache',
        'default',
        'default@HarCompileArkTs',
        'esmodules',
        'release'
      ];
      expect(acutualReservedFileNames.toString() === expectReservedFileNames.toString()).to.be.true;
    });
  })

  mocha.it('3-1: test resolveKeepConfig', function () {
    this.rollup.build(RELEASE);
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
    const keepConfigs = [
      './bundle',
      './testdata/**/filename_obf',
      '!./testdata/obfuscation/filename_obf',
      './testdata/obfuscation/filename_obf/..',
      './testdata/obfuscation/keep?ts',
      './testdata/obfuscation/*',
      './^',
      '$',
      '!./testdata/expect/*',
    ];
    let configs = {
      keepSourceOfPaths: [],
      keepUniversalPaths: [],
      excludeUniversalPaths: [],
      excludePathSet: new Set<string>()
    };
    const currentFilePath = __filename;
    const configPath = path.dirname(currentFilePath);
    const obResolver = new ObConfigResolver(this.rollup.share.projectConfig, console, true);
    obResolver.resolveKeepConfig(keepConfigs, configs, configPath);
    let excludePathArray = Array.from(configs.excludePathSet);
    expect(configs.keepSourceOfPaths[0].includes('bundle')).to.be.true;
    expect(configs.keepSourceOfPaths[1].includes('obfuscation')).to.be.true;
    expect(configs.keepUniversalPaths[0].toString().includes('filename_obf')).to.be.true;
    expect(configs.keepUniversalPaths[1].toString().includes('keep[^/]ts')).to.be.true;
    expect(configs.keepUniversalPaths[2].toString().includes('[^/]*')).to.be.true;
    expect(configs.excludeUniversalPaths[0].toString().includes('[^/]*')).to.be.true;
    expect(excludePathArray[0].includes('filename_obf')).to.be.true;
  });

  mocha.it('4-1: test getSystemApiCache: -enable-property-obfuscation', function () {
    let obfuscationCacheDir = path.join(OBFUSCATE_TESTDATA_DIR, 'system_api_obfuscation/property');
    let obfuscationOptions = {
      'selfConfig': {
        'ruleOptions': {
          'enable': true,
          'rules': [ 
            path.join(OBFUSCATE_TESTDATA_DIR, 'system_api_obfuscation/property/property.txt')
          ]
        },
        'consumerRules': [],
      },
      'dependencies': {
        'libraries': [],
        'hars': []
      },
      'obfuscationCacheDir': obfuscationCacheDir,
      'sdkApis': [
        path.join(OBFUSCATE_TESTDATA_DIR, 'system_api_obfuscation/system_api.d.ts')
      ]
    };
    let projectConfig = {
      obfuscationOptions,
      compileHar: false
    }
    const obConfig: ObConfigResolver =  new ObConfigResolver(projectConfig, undefined);
    
    const mergedObConfig: MergedConfig = obConfig.resolveObfuscationConfigs();
    expect(mergedObConfig.reservedPropertyNames.length == 8).to.be.true;
    expect(mergedObConfig.reservedPropertyNames.includes('TestClass')).to.be.true;
    expect(mergedObConfig.reservedPropertyNames.includes('para1')).to.be.true;
    expect(mergedObConfig.reservedPropertyNames.includes('para2')).to.be.true;
    expect(mergedObConfig.reservedPropertyNames.includes('foo')).to.be.true;
    expect(mergedObConfig.reservedPropertyNames.includes('TestFunction')).to.be.true;
    expect(mergedObConfig.reservedPropertyNames.includes('funcPara1')).to.be.true;
    expect(mergedObConfig.reservedPropertyNames.includes('funcPara2')).to.be.true;
    expect(mergedObConfig.reservedPropertyNames.includes('ns')).to.be.true;
    expect(mergedObConfig.reservedGlobalNames.length == 0).to.be.true;

    let systemApiPath = obfuscationCacheDir + '/systemApiCache.json';
    const data = fs.readFileSync(systemApiPath, 'utf8');
    const systemApiContent = JSON.parse(data);

    expect(systemApiContent.ReservedPropertyNames.length == 8).to.be.true;
    expect(systemApiContent.ReservedPropertyNames.includes('TestClass')).to.be.true;
    expect(systemApiContent.ReservedPropertyNames.includes('para1')).to.be.true;
    expect(systemApiContent.ReservedPropertyNames.includes('para2')).to.be.true;
    expect(systemApiContent.ReservedPropertyNames.includes('foo')).to.be.true;
    expect(systemApiContent.ReservedPropertyNames.includes('TestFunction')).to.be.true;
    expect(systemApiContent.ReservedPropertyNames.includes('funcPara1')).to.be.true;
    expect(systemApiContent.ReservedPropertyNames.includes('funcPara2')).to.be.true;
    expect(systemApiContent.ReservedPropertyNames.includes('ns')).to.be.true;
    expect(systemApiContent.ReservedGlobalNames == undefined).to.be.true;

    fs.unlinkSync(systemApiPath);
  });

  mocha.it('4-2: test getSystemApiCache: -enable-export-obfuscation', function () {
    let obfuscationCacheDir = path.join(OBFUSCATE_TESTDATA_DIR, 'system_api_obfuscation/export');
    let obfuscationOptions = {
      'selfConfig': {
        'ruleOptions': {
          'enable': true,
          'rules': [ 
            path.join(OBFUSCATE_TESTDATA_DIR, 'system_api_obfuscation/export/export.txt')
          ]
        },
        'consumerRules': [],
      },
      'dependencies': {
        'libraries': [],
        'hars': []
      },
      'obfuscationCacheDir': obfuscationCacheDir,
      'sdkApis': [
        path.join(OBFUSCATE_TESTDATA_DIR, 'system_api_obfuscation/system_api.d.ts')
      ]
    };
    let projectConfig = {
      obfuscationOptions,
      compileHar: false
    }
    const obConfig: ObConfigResolver =  new ObConfigResolver(projectConfig, undefined);
    
    const mergedObConfig: MergedConfig = obConfig.resolveObfuscationConfigs();
    expect(mergedObConfig.reservedNames.length == 0).to.be.true;
    expect(mergedObConfig.reservedGlobalNames.length == 0).to.be.true;
    expect(mergedObConfig.reservedPropertyNames.length == 0).to.be.true;

    let systemApiPath = obfuscationCacheDir + '/systemApiCache.json';
    const noSystemApi = fs.existsSync(systemApiPath);

    expect(noSystemApi).to.be.false;
  });

  mocha.it('4-3: test getSystemApiCache: -enable-export-obfuscation -enable-toplevel-obfuscation', function () {
    let obfuscationCacheDir = path.join(OBFUSCATE_TESTDATA_DIR, 'system_api_obfuscation/export_toplevel');
    let obfuscationOptions = {
      'selfConfig': {
        'ruleOptions': {
          'enable': true,
          'rules': [ 
            path.join(OBFUSCATE_TESTDATA_DIR, 'system_api_obfuscation/export_toplevel/export_toplevel.txt')
          ]
        },
        'consumerRules': [],
      },
      'dependencies': {
        'libraries': [],
        'hars': []
      },
      'obfuscationCacheDir': obfuscationCacheDir,
      'sdkApis': [
        path.join(OBFUSCATE_TESTDATA_DIR, 'system_api_obfuscation/system_api.d.ts')
      ]
    };
    let projectConfig = {
      obfuscationOptions,
      compileHar: false
    }
    const obConfig: ObConfigResolver =  new ObConfigResolver(projectConfig, undefined);

    const mergedObConfig: MergedConfig = obConfig.resolveObfuscationConfigs();
    expect(mergedObConfig.reservedNames.length == 0).to.be.true;
    expect(mergedObConfig.reservedPropertyNames.length == 0).to.be.true;
    expect(mergedObConfig.reservedGlobalNames.length == 3).to.be.true;
    expect(mergedObConfig.reservedGlobalNames.includes('TestClass')).to.be.true;
    expect(mergedObConfig.reservedGlobalNames.includes('TestFunction')).to.be.true;
    expect(mergedObConfig.reservedGlobalNames.includes('ns')).to.be.true;

    let systemApiPath = obfuscationCacheDir + '/systemApiCache.json';
    const data = fs.readFileSync(systemApiPath, 'utf8');
    const systemApiContent = JSON.parse(data);

    expect(systemApiContent.ReservedNames == undefined).to.be.true;
    expect(systemApiContent.ReservedPropertyNames == undefined).to.be.true;
    expect(systemApiContent.ReservedGlobalNames.length == 3).to.be.true;
    expect(systemApiContent.ReservedGlobalNames.includes('TestClass')).to.be.true;
    expect(systemApiContent.ReservedGlobalNames.includes('TestFunction')).to.be.true;
    expect(systemApiContent.ReservedGlobalNames.includes('ns')).to.be.true;

    fs.unlinkSync(systemApiPath);
  });

  mocha.it('5-1: test getRelativeSourcePath: filePath starts with projectRootPath', function () {
    const filePath = 'C:/projects/my-project/src/file.ts';
    const projectRootPath = 'C:/projects/my-project';
    const belongProjectPath = undefined;
    const relativePath = getRelativeSourcePath(filePath, projectRootPath, belongProjectPath);
    expect(relativePath).to.equal('src/file.ts');
  });

  mocha.it('5-2: test getRelativeSourcePath: filePath starts with belongProjectPath', function () {
    const filePath = 'C:/projects/another-project/src/file.ts';
    const projectRootPath = 'C:/projects/my-project';
    const belongProjectPath = 'C:/projects/another-project';
    const relativePath = getRelativeSourcePath(filePath, projectRootPath, belongProjectPath);
    expect(relativePath).to.equal('src/file.ts');
  });

  mocha.it('5-3: test getRelativeSourcePath: undefined projectRootPath', function () {
    const filePath = 'C:/projects/another-project/src/file.ts';
    const projectRootPath = undefined;
    const belongProjectPath = 'C:/projects/another-project';
    const relativePath = getRelativeSourcePath(filePath, projectRootPath, belongProjectPath);
    expect(relativePath).to.equal('src/file.ts');
  });

  mocha.it('5-4: test getRelativeSourcePath: undefined belongProjectPath ', function () {
    const filePath = 'C:/projects/my-project/src/file.ts';
    const projectRootPath = 'C:/projects/my-project';
    const belongProjectPath = undefined;
    const relativePath = getRelativeSourcePath(filePath, projectRootPath, belongProjectPath);
    expect(relativePath).to.equal('src/file.ts');
  });
});