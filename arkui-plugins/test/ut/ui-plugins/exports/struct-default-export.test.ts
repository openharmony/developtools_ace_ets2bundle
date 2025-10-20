/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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

import * as path from 'path';
import { PluginTester } from '../../../utils/plugin-tester';
import { mockBuildConfig } from '../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../utils/path-config';
import { parseDumpSrc } from '../../../utils/parse-string';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { ignoreNewLines } from '../../../utils/simplify-dump';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const EXPORT_DIR_PATH: string = 'exports';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, EXPORT_DIR_PATH, 'struct-default-export.ets'),
];

const exportParsed: Plugins = {
    name: 'export-parsed',
    parsed: uiTransform().parsed,
};

const pluginTester = new PluginTester('test default export struct', buildConfig);

const expectedParsedScript: string = `
import { NavInterface as NavInterface } from \"arkui.component.customComponent\";
import { PageLifeCycle as PageLifeCycle } from \"arkui.component.customComponent\";
import { EntryPoint as EntryPoint } from \"arkui.component.customComponent\";
import { CustomComponent as CustomComponent } from \"arkui.component.customComponent\";
import { Component as Component, Entry as Entry } from \"@ohos.arkui.component\";
@Entry() @Component() export default final struct A extends CustomComponent<A, __Options_A> implements PageLifeCycle {
    public build() {}
    public constructor() {}
}

class __EntryWrapper extends EntryPoint {
    public entry(): void {
        A();
    }
    public constructor() {}
}

__EntryWrapper.RegisterNamedRouter(\"\", new __EntryWrapper(), ({
    bundleName: \"com.example.mock\",
    moduleName: \"entry\",
    pagePath: \"../../../exports/struct-default-export\",
    pageFullPath: \"test/demo/mock/exports/struct-default-export\",
    integratedHsp: \"false\",
} as NavInterface))

@Entry() @Component() export interface __Options_A {
}
`;

function testExportParsed(this: PluginTestContext): void {
    expect(parseDumpSrc(this?.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedParsedScript));
}

pluginTester.run(
    'test default export struct',
    [exportParsed],
    {
        parsed: [testExportParsed]
    },
    {
        stopAfter: 'checked',
    }
);
