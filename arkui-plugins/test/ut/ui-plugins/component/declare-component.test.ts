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
import { dumpGetterSetter, GetSetDumper, ignoreNewLines } from '../../../utils/simplify-dump';
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

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Component as Component, ResourceStr as ResourceStr, Builder as Builder } from "@ohos.arkui.component";

import { PropRef as PropRef, State as State } from "@ohos.arkui.stateManagement";

@Component() export declare final struct SwipeRefresher extends CustomComponent<SwipeRefresher, __Options_SwipeRefresher> {
  @ComponentBuilder() public static $_invoke(initializers?: __Options_SwipeRefresher, storage?: LocalStorage, @Builder() content?: (()=> void)): SwipeRefresher
  
  @PropRef() public content?: (ResourceStr | undefined);
  
  @PropRef() public isLoading: boolean;
  
  @State() public code: number;

  @Builder() public build(): void

  public constructor(useSharedStorage?: boolean, storage?: LocalStorage)

  public static _buildCompatibleNode(options: __Options_SwipeRefresher): void

}

@Component() export declare interface __Options_SwipeRefresher {
  ${ignoreNewLines(`
  content?: (ResourceStr | undefined);
  @PropRef() __backing_content?: (ResourceStr | undefined);
  __options_has_content?: boolean;
  isLoading?: boolean;
  @PropRef() __backing_isLoading?: boolean;
  __options_has_isLoading?: boolean;
  code?: number;
  @State() __backing_code?: number;
  __options_has_code?: boolean;
  `)}
  
}
`;

function testParsedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedParsedcript));
}

const expectedCheckedScript: string = `
import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { IPropRefDecoratedVariable as IPropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Component as Component, ResourceStr as ResourceStr, Builder as Builder } from "@ohos.arkui.component";

import { PropRef as PropRef, State as State } from "@ohos.arkui.stateManagement";

function main() {}

@Component() export declare final struct SwipeRefresher extends CustomComponent<SwipeRefresher, __Options_SwipeRefresher> {
  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: SwipeRefresher)=> void), initializers: ((()=> __Options_SwipeRefresher) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_SwipeRefresher, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): SwipeRefresher
  
  @PropRef() public content?: (ResourceStr | undefined);
  
  @PropRef() public isLoading: boolean;
  
  @State() public code: number;
  
  @memo() public build(): void
  
  constructor(useSharedStorage: (boolean | undefined))
  
  constructor()
  
  public constructor(useSharedStorage: (boolean | undefined), storage: (LocalStorage | undefined))
  
  public static _buildCompatibleNode(options: __Options_SwipeRefresher): void

}

@Component() export declare interface __Options_SwipeRefresher {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'content', '((ResourceStr | undefined) | undefined)', [], [], false)}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_content', '(IPropRefDecoratedVariable<(ResourceStr | undefined)> | undefined)', [], [], false)}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_content', '(boolean | undefined)', [], [], false)}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'isLoading', '(boolean | undefined)', [], [], false)}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_isLoading', '(IPropRefDecoratedVariable<boolean> | undefined)', [], [], false)}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_isLoading', '(boolean | undefined)', [], [], false)}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'code', '(number | undefined)', [], [], false)}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_code', '(IStateDecoratedVariable<number> | undefined)', [], [], false)}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_code', '(boolean | undefined)', [], [], false)}
  
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
