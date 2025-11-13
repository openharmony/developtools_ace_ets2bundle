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
import { PluginTester } from '../../../../utils/plugin-tester';
import { mockBuildConfig } from '../../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../../utils/path-config';
import { parseDumpSrc } from '../../../../utils/parse-string';
import { beforeUINoRecheck, recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpAnnotation, dumpGetterSetter, GetSetDumper } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const REGULAR_DIR_PATH: string = 'decorators/regular';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, REGULAR_DIR_PATH, 'readonly-regular.ets'),
];

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test readonly regular variables transformation', buildConfig);

const expectedScript: string = `
function main() {}
@ComponentV2() final struct Child extends CustomComponentV2<Child, __Options_Child> {
    public __initializeStruct(initializers: (__Options_Child | undefined), @Memo() content: ((()=> void) | undefined)): void {
        this.__backing_readOnlyParam = ((({let gensym___<some_random_number> = initializers;
            (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.readOnlyParam)})) ?? (0));
    }

    public __updateStruct(initializers: (__Options_Child | undefined)): void {}

    private __backing_readOnlyParam?: number;

    public get readOnlyParam(): number {
        return (this.__backing_readOnlyParam as number);
    }
    public set readOnlyParam(value: number) {
        this.__backing_readOnlyParam = value;
    }

    @Memo() public build() {}

    public constructor() {}

    static {

    }
}
@ComponentV2() export interface __Options_Child {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'readOnlyParam', '(number | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_readOnlyParam', '(boolean | undefined)')}
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test readonly regular variables transformation',
    [parsedTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
