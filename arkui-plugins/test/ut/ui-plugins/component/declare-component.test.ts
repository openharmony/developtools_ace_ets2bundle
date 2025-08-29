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
import { recheck, uiNoRecheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const COMPONENT_DIR_PATH: string = 'component';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, COMPONENT_DIR_PATH, 'declare-component.ets'),
];

const pluginTester = new PluginTester('test declare component transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'declare-component',
    parsed: uiTransform().parsed
};

const expectedParsedcript: string = `
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, ResourceStr as ResourceStr, Builder as Builder } from "@ohos.arkui.component";

import { PropRef as PropRef, State as State } from "@ohos.arkui.stateManagement";

@Component() export declare final struct SwipeRefresher extends CustomComponent<SwipeRefresher, __Options_SwipeRefresher> {
  @PropRef() public content?: (ResourceStr | undefined);
  
  @PropRef() public isLoading: boolean;
  
  @State() public code: number;
  
  @Builder() public build(): void
  
  public constructor() {}
  
  public static _buildCompatibleNode(options: __Options_SwipeRefresher): void
  
}

@Component() export declare interface __Options_SwipeRefresher {
  content?: (ResourceStr | undefined);
  @PropRef() __backing_content?: (ResourceStr | undefined);
  isLoading?: boolean;
  @PropRef() __backing_isLoading?: boolean;
  code?: number;
  @State() __backing_code?: number;
  
}
`;

function testParsedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedParsedcript));
}

const expectedCheckedScript: string = `
import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { IPropRefDecoratedVariable as IPropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, ResourceStr as ResourceStr, Builder as Builder } from "@ohos.arkui.component";

import { PropRef as PropRef, State as State } from "@ohos.arkui.stateManagement";

function main() {}

@Component() export declare final struct SwipeRefresher extends CustomComponent<SwipeRefresher, __Options_SwipeRefresher> {
  @PropRef() public content?: (ResourceStr | undefined);
  
  @PropRef() public isLoading: boolean;
  
  @State() public code: number;
  
  @Builder() @memo() public build(): void
  
  public constructor() {}
  
  public static _buildCompatibleNode(options: __Options_SwipeRefresher): void
  
}

@Component() export declare interface __Options_SwipeRefresher {
  set content(content: ((ResourceStr | undefined) | undefined))
  
  get content(): ((ResourceStr | undefined) | undefined)
  set __backing_content(__backing_content: (IPropRefDecoratedVariable<(ResourceStr | undefined)> | undefined))
  
  get __backing_content(): (IPropRefDecoratedVariable<(ResourceStr | undefined)> | undefined)
  set isLoading(isLoading: (boolean | undefined))
  
  get isLoading(): (boolean | undefined)
  set __backing_isLoading(__backing_isLoading: (IPropRefDecoratedVariable<boolean> | undefined))
  
  get __backing_isLoading(): (IPropRefDecoratedVariable<boolean> | undefined)
  set code(code: (number | undefined))
  
  get code(): (number | undefined)
  set __backing_code(__backing_code: (IStateDecoratedVariable<number> | undefined))
  
  get __backing_code(): (IStateDecoratedVariable<number> | undefined)
  
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test declare component transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'parsed': [testParsedTransformer],
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
