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

const STATE_DIR_PATH: string = 'decorators/param';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'param-basic-type.ets'),
];

const pluginTester = new PluginTester('test basic type @Param decorated variables transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedCheckedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.stateManagement.runtime";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IParamDecoratedVariable as IParamDecoratedVariable } from "arkui.stateManagement.decorator";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { ComponentV2 as ComponentV2 } from "@ohos.arkui.component";

import { Param as Param } from "@ohos.arkui.stateManagement";

function main() {}

@ComponentV2() final struct Parent extends CustomComponentV2<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_paramVar1 = STATE_MGMT_FACTORY.makeParam<string>(this, "paramVar1", ((({let gensym___264789668 = initializers;
    (((gensym___264789668) == (null)) ? undefined : gensym___264789668.paramVar1)})) ?? ("stateVar1")));
    this.__backing_paramVar2 = STATE_MGMT_FACTORY.makeParam<number>(this, "paramVar2", ((({let gensym___171906071 = initializers;
    (((gensym___171906071) == (null)) ? undefined : gensym___171906071.paramVar2)})) ?? (50)));
    this.__backing_paramVar3 = STATE_MGMT_FACTORY.makeParam<boolean>(this, "paramVar3", ((({let gensym___241535547 = initializers;
    (((gensym___241535547) == (null)) ? undefined : gensym___241535547.paramVar3)})) ?? (true)));
    this.__backing_paramVar4 = STATE_MGMT_FACTORY.makeParam<undefined>(this, "paramVar4", ((({let gensym___49490075 = initializers;
    (((gensym___49490075) == (null)) ? undefined : gensym___49490075.paramVar4)})) ?? (undefined)));
    this.__backing_paramVar5 = STATE_MGMT_FACTORY.makeParam<null>(this, "paramVar5", ((({let gensym___17164613 = initializers;
    (((gensym___17164613) == (null)) ? undefined : gensym___17164613.paramVar5)})) ?? (null)));
  }

  public __updateStruct(initializers: (__Options_Parent | undefined)): void {
    if (({let gensym___160055409 = initializers;
    (((gensym___160055409) == (null)) ? undefined : gensym___160055409.__options_has_paramVar1)})) {
      this.__backing_paramVar1!.update((initializers!.paramVar1 as string));
    }
    if (({let gensym___2437677 = initializers;
    (((gensym___2437677) == (null)) ? undefined : gensym___2437677.__options_has_paramVar2)})) {
      this.__backing_paramVar2!.update((initializers!.paramVar2 as number));
    }
    if (({let gensym___113817398 = initializers;
    (((gensym___113817398) == (null)) ? undefined : gensym___113817398.__options_has_paramVar3)})) {
      this.__backing_paramVar3!.update((initializers!.paramVar3 as boolean));
    }
    if (({let gensym___69812855 = initializers;
    (((gensym___69812855) == (null)) ? undefined : gensym___69812855.__options_has_paramVar4)})) {
      this.__backing_paramVar4!.update((initializers!.paramVar4 as undefined));
    }
    if (({let gensym___184913887 = initializers;
    (((gensym___184913887) == (null)) ? undefined : gensym___184913887.__options_has_paramVar5)})) {
      this.__backing_paramVar5!.update((initializers!.paramVar5 as null));
    }
  }

  private __backing_paramVar1?: IParamDecoratedVariable<string>;

  public get paramVar1(): string {
    return this.__backing_paramVar1!.get();
  }

  private __backing_paramVar2?: IParamDecoratedVariable<number>;

  public get paramVar2(): number {
    return this.__backing_paramVar2!.get();
  }

  private __backing_paramVar3?: IParamDecoratedVariable<boolean>;

  public get paramVar3(): boolean {
    return this.__backing_paramVar3!.get();
  }

  private __backing_paramVar4?: IParamDecoratedVariable<undefined>;

  public get paramVar4(): undefined {
    return this.__backing_paramVar4!.get();
  }

  private __backing_paramVar5?: IParamDecoratedVariable<null>;

  public get paramVar5(): null {
    return this.__backing_paramVar5!.get();
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

}

@ComponentV2() export interface __Options_Parent {
  set paramVar1(paramVar1: (string | undefined))

  get paramVar1(): (string | undefined)
  set __backing_paramVar1(__backing_paramVar1: (IParamDecoratedVariable<string> | undefined))

  get __backing_paramVar1(): (IParamDecoratedVariable<string> | undefined)
  set __options_has_paramVar1(__options_has_paramVar1: (boolean | undefined))
  
  get __options_has_paramVar1(): (boolean | undefined)
  set paramVar2(paramVar2: (number | undefined))

  get paramVar2(): (number | undefined)
  set __backing_paramVar2(__backing_paramVar2: (IParamDecoratedVariable<number> | undefined))

  get __backing_paramVar2(): (IParamDecoratedVariable<number> | undefined)
  set __options_has_paramVar2(__options_has_paramVar2: (boolean | undefined))
  
  get __options_has_paramVar2(): (boolean | undefined)
  set paramVar3(paramVar3: (boolean | undefined))

  get paramVar3(): (boolean | undefined)
  set __backing_paramVar3(__backing_paramVar3: (IParamDecoratedVariable<boolean> | undefined))

  get __backing_paramVar3(): (IParamDecoratedVariable<boolean> | undefined)
  set __options_has_paramVar3(__options_has_paramVar3: (boolean | undefined))
  
  get __options_has_paramVar3(): (boolean | undefined)
  set paramVar4(paramVar4: (undefined | undefined))

  get paramVar4(): (undefined | undefined)
  set __backing_paramVar4(__backing_paramVar4: (IParamDecoratedVariable<undefined> | undefined))

  get __backing_paramVar4(): (IParamDecoratedVariable<undefined> | undefined)
  set __options_has_paramVar4(__options_has_paramVar4: (boolean | undefined))
  
  get __options_has_paramVar4(): (boolean | undefined)
  set paramVar5(paramVar5: (null | undefined))

  get paramVar5(): (null | undefined)
  set __backing_paramVar5(__backing_paramVar5: (IParamDecoratedVariable<null> | undefined))

  get __backing_paramVar5(): (IParamDecoratedVariable<null> | undefined)
  set __options_has_paramVar5(__options_has_paramVar5: (boolean | undefined))
  
  get __options_has_paramVar5(): (boolean | undefined)
  
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test basic type @Param decorated variables transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
