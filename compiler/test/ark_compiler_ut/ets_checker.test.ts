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
import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import * as ts from 'typescript';
import sinon from 'sinon';
import proxyquire from 'proxyquire';

import {
  DEFAULT_ENTRY,
  DEFAULT_PROJECT,
  EXPECT_INDEX_ETS,
  PROJECT_ROOT
} from './mock/rollup_mock/path_config';
import RollUpPluginMock from './mock/rollup_mock/rollup_plugin_mock';
import {
  addLocalPackageSet,
  compilerOptions,
  localPackageSet,
  needReCheckForChangedDepUsers,
  resetEtsCheck,
  serviceChecker,
  resolveModuleNames as resolveModuleNamesMain
} from '../../lib/ets_checker';
import { TS_BUILD_INFO_SUFFIX } from '../../lib/pre_define'
import {
  globalProgram,
  projectConfig
} from '../../main';
import { mkdirsSync } from '../../lib/utils';
import {
  arkTSEvolutionModuleMap,
  cleanUpProcessArkTSEvolutionObj
} from '../../lib/process_arkts_evolution';

mocha.describe('test ets_checker file api', function () {
    mocha.before(function () {
        this.rollup = new RollUpPluginMock();
    });

    mocha.after(() => {
        delete this.rollup;
        const cacheFile: string = path.resolve(projectConfig.cachePath, '../.ts_checker_cache');
        if (fs.existsSync(cacheFile)) {
            fs.unlinkSync(cacheFile);
        }
        const tsBuildInfoFilePath: string = path.resolve(projectConfig.cachePath, '..', TS_BUILD_INFO_SUFFIX);
        if (fs.existsSync(tsBuildInfoFilePath)) {
            fs.unlinkSync(tsBuildInfoFilePath);
        }
        const tsBuildInfoLinterFilePath: string = tsBuildInfoFilePath + '.linter';
        if (fs.existsSync(tsBuildInfoLinterFilePath)) {
            fs.unlinkSync(tsBuildInfoLinterFilePath);
        }
    });

    mocha.it('1-1: test addLocalPackageSet for original ohmurl', function () {
        this.rollup.build();
        const rollupObject = this.rollup;
        const rollupFileList = rollupObject.getModuleIds();
        projectConfig.useNormalizedOHMUrl = false;
        for (const moduleId of rollupFileList) {
            if (fs.existsSync(moduleId)) {
                addLocalPackageSet(moduleId, rollupObject);
            }
        }
        expect(localPackageSet.has('entry')).to.be.true;
        localPackageSet.clear();
    });

    mocha.it('1-2: test addLocalPackageSet for normalized ohmurl', function () {
        this.rollup.build();
        const rollupObject = this.rollup;
        const rollupFileList = rollupObject.getModuleIds();
        projectConfig.useNormalizedOHMUrl = true;
        for (const moduleId of rollupFileList) {
            const moduleInfo: Object = rollupObject.getModuleInfo(moduleId);
            if (moduleInfo) {
                const metaInfo: Object = moduleInfo.meta;
                metaInfo.pkgName = 'pkgname';
            }
            if (fs.existsSync(moduleId)) {
                addLocalPackageSet(moduleId, rollupObject);
            }
        }
        expect(localPackageSet.has('pkgname')).to.be.true;
    });

    mocha.it('1-3: test getOrCreateLanguageService when dependency in oh-package.json change', function () {
        this.timeout(10000);
        this.rollup.build();
        let rollupObject = this.rollup;
        expect(needReCheckForChangedDepUsers).to.be.false;

        interface MockCacheStore {
            service: Object | undefined;
            pkgJsonFileHash: string;
            targetESVersion: number;
        }
        const mockServiceCache = {
            service: undefined,
            pkgJsonFileHash: '9f07917d395682c73a90af8f5796a2c6',
            targetESVersion: 8
        }
        let mockCache = new Map<string, MockCacheStore>();
        mockCache.set('service', mockServiceCache);
        rollupObject.share.cache = mockCache;
        rollupObject.share.depInfo = {enableIncre: true};
        rollupObject.share.projectConfig.pkgJsonFileHash = '26bde0f30dda53b0afcbf39428ec9851';
        Object.assign(projectConfig, rollupObject.share.projectConfig);

        // The current hash and the hash in cache of the dependency differs, should recheck
        serviceChecker([EXPECT_INDEX_ETS], null, null, null, rollupObject.share);
        expect(needReCheckForChangedDepUsers).to.be.true;
        expect(globalProgram.program != null).to.be.true;

        resetEtsCheck();
        expect(needReCheckForChangedDepUsers).to.be.false;
        expect(globalProgram.program == null).to.be.true;

        // The current hash and the hash in cache of the dependency are the same, no need to recheck
        serviceChecker([EXPECT_INDEX_ETS], null, null, null, rollupObject.share);
        expect(needReCheckForChangedDepUsers).to.be.false;
        expect(globalProgram.program != null).to.be.true;

        resetEtsCheck();
        expect(needReCheckForChangedDepUsers).to.be.false;
        expect(globalProgram.program == null).to.be.true;
    });

    mocha.it('1-4: test getOrCreateLanguageService when paths in compilerOptions change', function () {
        this.timeout(10000);
        this.rollup.build();
        let rollupObject = this.rollup;
        process.env.compileTool = 'rollup';

        Object.assign(projectConfig, rollupObject.share.projectConfig);
        serviceChecker([EXPECT_INDEX_ETS], null, null, null, rollupObject.share);
        expect(JSON.stringify(compilerOptions.paths) === '{"*":["*","../../../../*","../*"]}').to.be.true;
        expect(needReCheckForChangedDepUsers).to.be.false;
        expect(globalProgram.program != null).to.be.true;
        expect(compilerOptions.skipPathsInKeyForCompilationSettings).to.be.true;

        resetEtsCheck();
        expect(needReCheckForChangedDepUsers).to.be.false;
        expect(globalProgram.program == null).to.be.true;
        expect(compilerOptions.skipPathsInKeyForCompilationSettings).to.be.true;

        interface MockCacheStore {
            service: Object | undefined;
            pkgJsonFileHash: string;
            targetESVersion: number;
        }
        const mockServiceCache = {
            service: undefined,
            pkgJsonFileHash: '9f07917d395682c73a90af8f5796a2c6',
            targetESVersion: 8
        }
        let mockCache = new Map<string, MockCacheStore>();
        mockCache.set('service', mockServiceCache);
        rollupObject.share.cache = mockCache;
        rollupObject.share.depInfo = {enableIncre: true};
        rollupObject.share.projectConfig.pkgJsonFileHash = '26bde0f30dda53b0afcbf39428ec9851';

        // The current hash of the dependency differs, and the paths in compilerOptions will change since resolveModulePaths change
        const resolveModulePaths = ['../testdata/expect'];
        serviceChecker([EXPECT_INDEX_ETS], null, resolveModulePaths, null, rollupObject.share);
        expect(JSON.stringify(compilerOptions.paths) === '{"*":["*","../../../../../../../testdata/expect/*"]}').to.be.true;
        expect(needReCheckForChangedDepUsers).to.be.true;
        expect(globalProgram.program != null).to.be.true;
        expect(compilerOptions.skipPathsInKeyForCompilationSettings).to.be.true;

        resetEtsCheck();
        expect(needReCheckForChangedDepUsers).to.be.false;
        expect(globalProgram.program == null).to.be.true;
        expect(compilerOptions.skipPathsInKeyForCompilationSettings).to.be.true;
    });
    mocha.it('1-5: test GetEmitHost of program', function () {
        const compilerOptions: ts.CompilerOptions = {
            target: ts.ScriptTarget.ES2021
        };
        const fileNames: string[] = ['../testdata/testfiles/testGetEmitHost.ts'];
        let program: ts.Program = ts.createProgram(fileNames, compilerOptions);
        expect(program.getEmitHost()).to.not.be.undefined;
    });

    mocha.it('2-1: test resolveModuleNames parse 1.2 module declaration files', function () {
        const code: string = 'import { a } from "har";\nconsole.log(a);\n';
        const moduleNames: string[] = [
            'har',
            'har/test'
        ];
        arkTSEvolutionModuleMap.set('har', {
            language: '1.2',
            packageName: 'har',
            moduleName: 'har',
            modulePath: `${PROJECT_ROOT}/${DEFAULT_PROJECT}/har`,
            declgenV1OutPath: `${PROJECT_ROOT}/${DEFAULT_PROJECT}/har/build/default/intermediates/declgen/default/declgenV1`,
            declgenBridgeCodePath: `${PROJECT_ROOT}/${DEFAULT_PROJECT}/har/build/default/intermediates/declgen/default/bridgecode`
        })
        const filePath: string = `${PROJECT_ROOT}/${DEFAULT_PROJECT}/${DEFAULT_ENTRY}/src/main/entryability/test.ets`;
        const arktsEvoIndexDeclFilePath: string = `${arkTSEvolutionModuleMap.get('har').declgenV1OutPath}/har/Index.d.ets`;
        const arktsEvoTestDeclFilePath: string = `${arkTSEvolutionModuleMap.get('har').declgenV1OutPath}/har/src/main/ets/test.d.ets`;
        fs.writeFileSync(filePath, code);
        mkdirsSync(path.dirname(arktsEvoIndexDeclFilePath));
        mkdirsSync(path.dirname(arktsEvoTestDeclFilePath));
        fs.writeFileSync(arktsEvoIndexDeclFilePath, '');
        fs.writeFileSync(arktsEvoTestDeclFilePath, '');
        const resolvedModules = resolveModuleNamesMain(moduleNames, filePath);
        expect(resolvedModules[0].resolvedFileName === arktsEvoIndexDeclFilePath).to.be.true;
        expect(resolvedModules[1].resolvedFileName === arktsEvoTestDeclFilePath).to.be.true;
        fs.unlinkSync(filePath);
        fs.unlinkSync(arktsEvoIndexDeclFilePath);
        fs.unlinkSync(arktsEvoTestDeclFilePath);
        cleanUpProcessArkTSEvolutionObj();
    });

    mocha.it('2-2: test resolveModuleNames parse the 1.2 module declaration file that the 1.1 module depends on (packageName)', function () {
        const moduleNames: string[] = ['testhar'];
        arkTSEvolutionModuleMap.set('har', {
            language: '1.2',
            packageName: 'testhar',
            moduleName: 'testhar',
            modulePath: `${PROJECT_ROOT}/${DEFAULT_PROJECT}/testhar`,
            declgenV1OutPath: `${PROJECT_ROOT}/${DEFAULT_PROJECT}/testhar/build/default/intermediates/declgen/default/declgenV1`,
            declgenBridgeCodePath: `${PROJECT_ROOT}/${DEFAULT_PROJECT}/testhar/build/default/intermediates/declgen/default/bridgecode`
        })
        const filePath: string = `${PROJECT_ROOT}/${DEFAULT_PROJECT}/${DEFAULT_ENTRY}/src/main/entryability/test.ets`;
        const arktsEvoIndexFilePath: string = `${PROJECT_ROOT}/${DEFAULT_PROJECT}/testhar/Index.ets`;
        const arktsEvoIndexDeclFilePath: string = `${arkTSEvolutionModuleMap.get('har').declgenV1OutPath}/testhar/Index.d.ets`;
        const resolveModuleNameStub = sinon.stub(ts, 'resolveModuleName').returns({
          resolvedModule: {
              resolvedFileName: arktsEvoIndexFilePath,
              extension: '.ets',
              isExternalLibraryImport: false,
          }
        });
        const mockedTs = {
          ...require('typescript'),
          resolveModuleName: resolveModuleNameStub
        };
        let resolveModuleNames;
        ({ resolveModuleNames } = proxyquire('../../lib/ets_checker', {
          'typescript': mockedTs
        }));
        fs.writeFileSync(filePath, '');
        mkdirsSync(path.dirname(arktsEvoIndexFilePath));
        mkdirsSync(path.dirname(arktsEvoIndexDeclFilePath));
        fs.writeFileSync(arktsEvoIndexFilePath, '');
        fs.writeFileSync(arktsEvoIndexDeclFilePath, '');
        const resolvedModules = resolveModuleNames(moduleNames, filePath);
        expect(resolvedModules[0].resolvedFileName === arktsEvoIndexDeclFilePath);
        fs.unlinkSync(filePath);
        fs.unlinkSync(arktsEvoIndexDeclFilePath);
        resolveModuleNameStub.restore();
    });

    mocha.it('2-3: test resolveModuleNames parse the 1.2 module declaration file that the 1.1 module depends on', function () {
        const moduleNames: string[] = ['testhar/src/main/ets/test'];
        arkTSEvolutionModuleMap.set('har', {
            language: '1.2',
            packageName: 'testhar',
            moduleName: 'testhar',
            modulePath: `${PROJECT_ROOT}/${DEFAULT_PROJECT}/testhar`,
            declgenV1OutPath: `${PROJECT_ROOT}/${DEFAULT_PROJECT}/testhar/build/default/intermediates/declgen/default/declgenV1`,
            declgenBridgeCodePath: `${PROJECT_ROOT}/${DEFAULT_PROJECT}/testhar/build/default/intermediates/declgen/default/bridgecode`
        })
        const filePath: string = `${PROJECT_ROOT}/${DEFAULT_PROJECT}/${DEFAULT_ENTRY}/src/main/entryability/test.ets`;
        const arktsEvoTestFilePath: string = `${PROJECT_ROOT}/${DEFAULT_PROJECT}/testhar/src/main/ets/test.ets`;
        const arktsEvoTestDeclFilePath: string = `${arkTSEvolutionModuleMap.get('har').declgenV1OutPath}/testhar/src/main/ets/test.d.ets`;
        const resolveModuleNameStub = sinon.stub(ts, 'resolveModuleName').returns({
            resolvedModule: {
                resolvedFileName: arktsEvoTestFilePath,
                extension: '.ets',
                isExternalLibraryImport: false,
            }
        });
        const mockedTs = {
            ...require('typescript'),
            resolveModuleName: resolveModuleNameStub
        };
        let resolveModuleNames;
        ({ resolveModuleNames } = proxyquire('../../lib/ets_checker', { 'typescript': mockedTs }));
        
        fs.writeFileSync(filePath, '');
        mkdirsSync(path.dirname(arktsEvoTestFilePath));
        mkdirsSync(path.dirname(arktsEvoTestDeclFilePath));
        fs.writeFileSync(arktsEvoTestFilePath, '');
        fs.writeFileSync(arktsEvoTestDeclFilePath, '');
        const resolvedModules = resolveModuleNames(moduleNames, filePath);
        expect(resolvedModules[0].resolvedFileName === arktsEvoTestDeclFilePath);
        fs.unlinkSync(filePath);
        fs.unlinkSync(arktsEvoTestDeclFilePath);
        resolveModuleNameStub.restore();
    });
});