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

import { getOhmUrlByFilepath, getOhmUrlBySystemApiOrLibRequest, getOhmUrlByHarName } from '../../../../lib/ark_utils';
import projectConfig from '../../utils/processProjectConfig';
import { projectConfig as mainProjectConfig } from '../../../../main';

mocha.describe('generate ohmUrl', function() {
    mocha.it('nested src main ets|js in filePath', function() {
        const filePath = `${projectConfig.projectRootPath}/entry/src/main/ets/feature/src/main/js/`
            + `subfeature/src/main/ets/pages/test.ts`;
        const moduleName = 'entry';
        const namespace = 'library';
        let ohmUrl_1 = getOhmUrlByFilepath(filePath, projectConfig, undefined, moduleName);
        let ohmUrl_2 = getOhmUrlByFilepath(filePath, projectConfig, undefined, namespace);
        let expected_1 = 'UtTestApplication/entry/ets/feature/src/main/js/subfeature/src/main/ets/pages/test';
        let expected_2 = 'UtTestApplication/entry@library/ets/feature/src/main/js/subfeature/src/main/ets/pages/test';
        expect(ohmUrl_1 == expected_1).to.be.true;
        expect(ohmUrl_2 == expected_2).to.be.true;
    });

    mocha.it('system builtins & app builtins', function() {
        mainProjectConfig.bundleName = 'UtTestApplication';
        mainProjectConfig.moduleName = 'entry';
        const systemModuleRequest: string = '@system.app';
        const ohosModuleRequest: string = '@ohos.hilog';
        const appSoModuleRequest: string = 'libapplication.so';
        const systemOhmUrl: string = getOhmUrlBySystemApiOrLibRequest(systemModuleRequest);
        const ohosOhmUrl: string = getOhmUrlBySystemApiOrLibRequest(ohosModuleRequest);
        const appOhmUrl: string = getOhmUrlBySystemApiOrLibRequest(appSoModuleRequest);
        const expectedSystemOhmUrl: string = '@native:system.app';
        const expectedOhosOhmUrl: string = '@ohos:hilog';
        const expectedappOhmUrl: string = '@app:UtTestApplication/entry/application';
        expect(systemOhmUrl == expectedSystemOhmUrl).to.be.true;
        expect(ohosOhmUrl == expectedOhosOhmUrl).to.be.true;
        expect(appOhmUrl == expectedappOhmUrl).to.be.true;
    });

    mocha.it('shared library', function() {
        const sharedLibraryPackageName: string = "@ohos/sharedLibrary";
        const sharedLibraryPage: string = "@ohos/sharedLibrary/src/main/ets/pages/page1";
        const errorSharedLibrary: string = "@ohos/staticLibrary";
        const sharedLibraryPackageNameOhmUrl: string = getOhmUrlByHarName(sharedLibraryPackageName, projectConfig);
        const sharedLibraryPageOhmUrl: string = getOhmUrlByHarName(sharedLibraryPage, projectConfig);
        const errorSharedLibraryOhmUrl = getOhmUrlByHarName(errorSharedLibrary, projectConfig);
        const expectedSharedLibraryOhmUrl: string = "@bundle:UtTestApplication/sharedLibrary/ets/index";
        const expectedSharedLibraryPageOhmUrl: string = "@bundle:UtTestApplication/sharedLibrary/ets/pages/page1";
        const expectedErrorSharedLibraryOhmUrl = undefined;
        expect(sharedLibraryPackageNameOhmUrl == expectedSharedLibraryOhmUrl).to.be.true;
        expect(sharedLibraryPageOhmUrl == expectedSharedLibraryPageOhmUrl).to.be.true;
        expect(errorSharedLibraryOhmUrl == expectedErrorSharedLibraryOhmUrl).to.be.true;
    })
});