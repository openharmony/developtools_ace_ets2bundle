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
import { expect } from 'chai';

import RollUpPluginMock from './mock/rollup_mock/rollup_plugin_mock';
import { addLocalPackageSet, localPackageSet } from '../../lib/ets_checker';
import { projectConfig } from '../../main';

mocha.describe('test ets_checker file api', function () {
    mocha.before(function () {
        this.rollup = new RollUpPluginMock();
    });

    mocha.after(() => {
        delete this.rollup;
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

});