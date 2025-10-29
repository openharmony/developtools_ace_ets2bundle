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
import { recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const OBSERVED_DIR_PATH: string = 'decorators/once';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, OBSERVED_DIR_PATH, 'once-only.ets'),
];

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test only @Once decorated variables transformation', buildConfig);

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IParamOnceDecoratedVariable as IParamOnceDecoratedVariable } from "arkui.stateManagement.decorator";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { ComponentV2 as ComponentV2 } from "@ohos.arkui.component";

import { Once as Once } from "@ohos.arkui.stateManagement";

function main() {}

@ComponentV2() final struct Child extends CustomComponentV2<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_onceParamNum = STATE_MGMT_FACTORY.makeParamOnce<number>(this, "onceParamNum", ((({let gensym___118919021 = initializers;
    (((gensym___118919021) == (null)) ? undefined : gensym___118919021.onceParamNum)})) ?? (0)));
    this.__backing_onceVar4 = STATE_MGMT_FACTORY.makeParamOnce<Set<string>>(this, "onceVar4", ((({let gensym___71001521 = initializers;
    (((gensym___71001521) == (null)) ? undefined : gensym___71001521.onceVar4)})) ?? (new Set<string>(new Array<string>("aa", "bb")))));
  }

  public __updateStruct(initializers: (__Options_Child | undefined)): void {}

  private __backing_onceParamNum?: IParamOnceDecoratedVariable<number>;

  public get onceParamNum(): number {
    return this.__backing_onceParamNum!.get();
  }

  public set onceParamNum(value: number) {
    this.__backing_onceParamNum!.set(value);
  }

  private __backing_onceVar4?: IParamOnceDecoratedVariable<Set<string>>;

  public get onceVar4(): Set<string> {
    return this.__backing_onceVar4!.get();
  }

  public set onceVar4(value: Set<string>) {
    this.__backing_onceVar4!.set(value);
  }

  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: Child)=> void), initializers: ((()=> __Options_Child) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<Child, __Options_Child>(style, ((): Child => {
      return new Child();
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Child, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): Child {
    throw new Error("Declare interface");
  }

  @memo() public build() {}

  public constructor() {}

}

@ComponentV2() export interface __Options_Child {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'onceParamNum', '(number | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_onceParamNum', '(IParamOnceDecoratedVariable<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_onceParamNum', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'onceVar4', '(Set<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_onceVar4', '(IParamOnceDecoratedVariable<Set<string>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_onceVar4', '(boolean | undefined)')}
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test only @Once decorated variables transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
