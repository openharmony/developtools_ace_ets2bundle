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
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const STATE_DIR_PATH: string = 'decorators/local';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'static-local.ets'),
];

const pluginTester = new PluginTester('test static @Local decorated variables transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { ComponentV2 as ComponentV2 } from "@ohos.arkui.component";

import { Local as Local } from "@ohos.arkui.stateManagement";

function main() {}

class ABB {
  public constructor() {}

}

@ComponentV2() final struct Parent extends CustomComponentV2<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @memo() content: ((()=> void) | undefined)): void {}

  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}

  public static __backing_localVar1: ILocalDecoratedVariable<string> = STATE_MGMT_FACTORY.makeStaticLocal<string>("localVar1", "stateVar1");

  public static get localVar1(): string {
    return Parent.__backing_localVar1.get();
  }

  public static set localVar1(value: string) {
    Parent.__backing_localVar1.set(value);
  }

  public static __backing_localVar2: ILocalDecoratedVariable<number> = STATE_MGMT_FACTORY.makeStaticLocal<number>("localVar2", 50);

  public static get localVar2(): number {
    return Parent.__backing_localVar2.get();
  }

  public static set localVar2(value: number) {
    Parent.__backing_localVar2.set(value);
  }

  public static __backing_localVar3: ILocalDecoratedVariable<ABB> = STATE_MGMT_FACTORY.makeStaticLocal<ABB>("localVar3", new ABB());

  public static get localVar3(): ABB {
    return Parent.__backing_localVar3.get();
  }

  public static set localVar3(value: ABB) {
    Parent.__backing_localVar3.set(value);
  }

  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: Parent)=> void), initializers: ((()=> __Options_Parent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<Parent, __Options_Parent>(style, ((): Parent => {
      return new Parent();
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Parent, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): Parent {
    throw new Error("Declare interface");
  }

  @memo() public build() {}

  public constructor() {}

  static {

  }
}

@ComponentV2() export interface __Options_Parent {
  set localVar1(localVar1: (string | undefined))

  get localVar1(): (string | undefined)
  set __backing_localVar1(__backing_localVar1: (ILocalDecoratedVariable<string> | undefined))

  get __backing_localVar1(): (ILocalDecoratedVariable<string> | undefined)
  set __options_has_localVar1(__options_has_localVar1: (boolean | undefined))
  
  get __options_has_localVar1(): (boolean | undefined)
  set localVar2(localVar2: (number | undefined))

  get localVar2(): (number | undefined)
  set __backing_localVar2(__backing_localVar2: (ILocalDecoratedVariable<number> | undefined))

  get __backing_localVar2(): (ILocalDecoratedVariable<number> | undefined)
  set __options_has_localVar2(__options_has_localVar2: (boolean | undefined))
  
  get __options_has_localVar2(): (boolean | undefined)
  set localVar3(localVar3: (ABB | undefined))

  get localVar3(): (ABB | undefined)
  set __backing_localVar3(__backing_localVar3: (ILocalDecoratedVariable<ABB> | undefined))

  get __backing_localVar3(): (ILocalDecoratedVariable<ABB> | undefined)
  set __options_has_localVar3(__options_has_localVar3: (boolean | undefined))
  
  get __options_has_localVar3(): (boolean | undefined)
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test static @Local decorated variables transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
