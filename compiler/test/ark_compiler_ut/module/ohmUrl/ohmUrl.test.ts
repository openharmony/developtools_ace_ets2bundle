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

import { getOhmUrlByFilepath } from '../../../../lib/ark_utils';
import projectConfig from '../../utils/processProjectConfig';

mocha.describe('generate ohmUrl by filePath', function() {
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
    })
});