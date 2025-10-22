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
import mocha from 'mocha';
import path from 'path';

import { DeclfileProductor, run } from '../../../lib/fast_build/ark_compiler/interop/run_declgen_standalone';
import { toUnixPath } from '../../../lib/utils';
import { FileManager } from '../../../lib/fast_build/ark_compiler/interop/interop_manager';

export interface ArkTSEvolutionModule {
    language: string;
    packageName: string;
    moduleName: string;
    modulePath: string;
    declgenV1OutPath?: string;
    declgenV2OutPath?: string;
    declgenBridgeCodePath?: string;
    declFilesPath?: string;
    dynamicFiles: string[];
    staticFiles: string[];
    cachePath: string;
    byteCodeHarInfo?: Object;
    packageVersion: string;
}


mocha.describe('DeclfileProductor', () => {
    let declFileProductor: DeclfileProductor;
    mocha.before(() => {
        FileManager.cleanFileManagerObject();
        const dependentModuleMap: Map<string, ArkTSEvolutionModule> = new Map();
        dependentModuleMap.set('entry', {
            language: '1.1',
            packageName: 'entry',
            moduleName: 'entry',
            modulePath: '/path/to/project/entry',
            declgenV1OutPath: '/path/to/project/entry/build/default/intermediates/declgen/default/declgenV1',
            declgenV2OutPath: '/path/to/project/entry/build/default/intermediates/declgen/default/declgenV2',
            declgenBridgeCodePath: '/path/to/project/entry/build/default/intermediates/declgen/default/declgenBridgeCode',
            dynamicFiles: ['/path/to/project/entry/src/ets/dynamic1.ets'],
            staticFiles: ['/path/to/project/entry/src/ets/index.ets'],
            cachePath: '/path/to/project/entry/build/default/cache',
            byteCodeHarInfo: [],
            packageVersion: '1.0.0'
        });
        dependentModuleMap.set('har1', {
            language: '1.1',
            packageName: 'har1',
            moduleName: 'har1',
            modulePath: '/path/to/project/har1',
            declgenV1OutPath: '/path/to/project/har1/build/default/intermediates/declgen/default/declgenV1',
            declgenV2OutPath: '/path/to/project/har1/build/default/intermediates/declgen/default/declgenV2',
            declgenBridgeCodePath: '/path/to/project/har1/build/default/intermediates/declgen/default/declgenBridgeCode',
            dynamicFiles: ['/path/to/project/har1/src/ets/dynamic2.js'],
            staticFiles: ['/path/to/project/har1/src/ets/index.ets'],
            cachePath: '/path/to/project/har1/build/default/cache',
            byteCodeHarInfo: [],
            packageVersion: '1.0.0'
        });
        FileManager.initForTest(
            dependentModuleMap,
            undefined,
            '',
            '',
            ''
        );
    });
    mocha.beforeEach(() => {
        const params = {
            projectConfig: {
                projectRootPath: '/path/to/project',
                bundleName: 'com.project'
            }
        } as any;
        DeclfileProductor.init(params);
        declFileProductor = DeclfileProductor.getInstance();
    });

    mocha.it('1-1: add ets decl files', () => {
        const moduleInfo: ArkTSEvolutionModule = {
            language: '1.1',
            packageName: 'entry',
            moduleName: 'entry',
            modulePath: '/path/to/project/entry',
            declgenV1OutPath: '/path/to/project/entry/build/default/intermediates/declgen/default/declgenV1',
            declgenV2OutPath: '/path/to/project/entry/build/default/intermediates/declgen/default/declgenV2',
            declgenBridgeCodePath: '/path/to/project/entry/build/default/intermediates/declgen/default/declgenBridgeCode',
            dynamicFiles: ['/path/to/project/entry/src/ets/dynamic1.ets'],
            staticFiles: ['/path/to/project/entry/src/ets/index.ets'],
            cachePath: '/path/to/project/entry/build/default/cache',
            byteCodeHarInfo: [],
            packageVersion: '1.0.0'
        }
        const filePath = '/path/to/project/entry/src/main/ets/dynamic1.ets';
        const mainModuleName = 'entry';
        const bundleName = 'com.entry';

        declFileProductor.addDeclFilesConfig(filePath, mainModuleName, bundleName, moduleInfo);

        const expectedProjectFilePath = 'src/main/ets/dynamic1';
        const expectedDeclPath = toUnixPath(path.join(moduleInfo.declgenV2OutPath, expectedProjectFilePath + '.d.ets'));
        const expectedOhmUrl = `@normalized:N&${mainModuleName}&${bundleName}&${moduleInfo.packageName}/src/main/ets/dynamic1&1.0.0`;

        const config = declFileProductor['pkgDeclFilesConfig'][moduleInfo.packageName];
        expect(config.files[expectedProjectFilePath].ohmUrl === expectedOhmUrl).to.be.true;
        expect(config.files[expectedProjectFilePath].declPath === expectedDeclPath).to.be.true;
    });

    mocha.it('1-2: add js decl files', () => {
        const moduleInfo: ArkTSEvolutionModule = {
            language: '1.1',
            packageName: 'har1',
            moduleName: 'har1',
            modulePath: '/path/to/project/har1',
            declgenV1OutPath: '/path/to/project/har1/build/default/intermediates/declgen/default/declgenV1',
            declgenV2OutPath: '/path/to/project/har1/build/default/intermediates/declgen/default/declgenV2',
            declgenBridgeCodePath: '/path/to/project/har1/build/default/intermediates/declgen/default/declgenBridgeCode',
            dynamicFiles: ['/path/to/project/har1/src/ets/dynamic2.js'],
            staticFiles: ['/path/to/project/har1/src/ets/index.ets'],
            cachePath: '/path/to/project/har1/build/default/cache',
            byteCodeHarInfo: [],
            packageVersion: '1.0.0'
        }
        const filePath = '/path/to/project/har1/src/main/ets/dynamic2.js';
        const mainModuleName = 'har1';
        const bundleName = 'com.har1';

        declFileProductor.addDeclFilesConfig(filePath, mainModuleName, bundleName, moduleInfo);

        const expectedProjectFilePath = 'src/main/ets/dynamic2';
        const expectedDeclPath = toUnixPath(path.join(moduleInfo.declgenV2OutPath, expectedProjectFilePath + '.d.ets'));
        const expectedOhmUrl = `@normalized:N&${mainModuleName}&${bundleName}&${moduleInfo.packageName}/src/main/ets/dynamic2&1.0.0`;

        const config = declFileProductor['pkgDeclFilesConfig'][moduleInfo.packageName];
        expect(config.files[expectedProjectFilePath].ohmUrl === expectedOhmUrl).to.be.true;
        expect(config.files[expectedProjectFilePath].declPath === expectedDeclPath).to.be.true;
    });
    mocha.after(() => {
        FileManager.cleanFileManagerObject();
    });
});
