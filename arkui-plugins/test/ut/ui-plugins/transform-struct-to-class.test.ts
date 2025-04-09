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
import * as arkts from '@koalaui/libarkts';
import { PluginTestContext, PluginTester } from '../../utils/plugin-tester';
import { BuildConfig, mockBuildConfig } from '../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../utils/path-config';
import { parseDumpSrc } from '../../utils/parse-string';
import { PluginContext, Plugins } from '../../../common/plugin-context';
import { ComponentTransformer } from '../../../ui-plugins/component-transformer';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, 'struct-to-class.ets')];

const componentTransform: Plugins = {
    name: 'component',
    parsed(this: PluginContext) {
        let program = this.getArkTSProgram();
        if (program) {
            let script: arkts.EtsScript = program.astNode;

            const componentTransformer = new ComponentTransformer({
                arkui: '@koalaui.arkts-arkui.StructBase',
            });
            script = componentTransformer.visitor(script) as arkts.EtsScript;
            arkts.setAllParents(script);
            return script;
        }
    },
};

const pluginTester = new PluginTester('test component transformer', buildConfig);

function testComponentTransformer(this: PluginTestContext): void {
    const script: arkts.EtsScript = this.script as arkts.EtsScript;
    const expectedScript: string = `
import { StructBase } from \"@koalaui.arkts-arkui.StructBase\";

import { Component as Component } from \"@koalaui.arkts-arkui.Common\";

final class MyStateSample extends StructBase<MyStateSample, __Options_MyStateSample> {

  public build() {}

  public constructor() {}

}

interface __Options_MyStateSample {

}

`;
    expect(parseDumpSrc(script.dumpSrc())).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'transform struct to class',
    [componentTransform],
    {
        'parsed:component': [testComponentTransformer],
    },
    {
        stopAfter: 'parsed',
    },
    {
        beforeEach: [
            () => {
                jest.spyOn(console, 'warn').mockImplementation(() => {});
            },
        ],
        afterEach: [
            () => {
                jest.spyOn(console, 'warn').mockRestore();
            },
        ],
    }
);
