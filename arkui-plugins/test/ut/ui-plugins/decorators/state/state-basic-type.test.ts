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

const STATE_DIR_PATH: string = 'decorators/state';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'state-basic-type.ets'),
];

const pluginTester = new PluginTester('test basic type @State decorated variables transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'state-basic-type',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Component as Component } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement";

function main() {}

@Component() final struct Parent extends CustomComponent<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_stateVar1 = STATE_MGMT_FACTORY.makeState<string>(this, "stateVar1", ((({let gensym___213853607 = initializers;
    (((gensym___213853607) == (null)) ? undefined : gensym___213853607.stateVar1)})) ?? ("stateVar1")));
    this.__backing_stateVar2 = STATE_MGMT_FACTORY.makeState<number>(this, "stateVar2", ((({let gensym___113574154 = initializers;
    (((gensym___113574154) == (null)) ? undefined : gensym___113574154.stateVar2)})) ?? (50)));
    this.__backing_stateVar3 = STATE_MGMT_FACTORY.makeState<boolean>(this, "stateVar3", ((({let gensym___166994972 = initializers;
    (((gensym___166994972) == (null)) ? undefined : gensym___166994972.stateVar3)})) ?? (true)));
    this.__backing_stateVar4 = STATE_MGMT_FACTORY.makeState<undefined>(this, "stateVar4", ((({let gensym___148024261 = initializers;
    (((gensym___148024261) == (null)) ? undefined : gensym___148024261.stateVar4)})) ?? (undefined)));
    this.__backing_stateVar5 = STATE_MGMT_FACTORY.makeState<null>(this, "stateVar5", ((({let gensym___99384342 = initializers;
    (((gensym___99384342) == (null)) ? undefined : gensym___99384342.stateVar5)})) ?? (null)));
  }

  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}

  private __backing_stateVar1?: IStateDecoratedVariable<string>;

  public get stateVar1(): string {
    return this.__backing_stateVar1!.get();
  }

  public set stateVar1(value: string) {
    this.__backing_stateVar1!.set(value);
  }

  private __backing_stateVar2?: IStateDecoratedVariable<number>;

  public get stateVar2(): number {
    return this.__backing_stateVar2!.get();
  }

  public set stateVar2(value: number) {
    this.__backing_stateVar2!.set(value);
  }

  private __backing_stateVar3?: IStateDecoratedVariable<boolean>;

  public get stateVar3(): boolean {
    return this.__backing_stateVar3!.get();
  }

  public set stateVar3(value: boolean) {
    this.__backing_stateVar3!.set(value);
  }

  private __backing_stateVar4?: IStateDecoratedVariable<undefined>;

  public get stateVar4(): undefined {
    return this.__backing_stateVar4!.get();
  }

  public set stateVar4(value: undefined) {
    this.__backing_stateVar4!.set(value);
  }

  private __backing_stateVar5?: IStateDecoratedVariable<null>;

  public get stateVar5(): null {
    return this.__backing_stateVar5!.get();
  }

  public set stateVar5(value: null) {
    this.__backing_stateVar5!.set(value);
  }

  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: Parent)=> void), initializers: ((()=> __Options_Parent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Parent, __Options_Parent>(style, ((): Parent => {
      return new Parent(false, ({let gensym___46528967 = storage;
      (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Parent, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): Parent {
    throw new Error("Declare interface");
  }

  @memo() public build() {}

  constructor(useSharedStorage: (boolean | undefined)) {
    this(useSharedStorage, undefined);
  }

  constructor() {
    this(undefined, undefined);
  }
  
  public constructor(useSharedStorage: (boolean | undefined), storage: (LocalStorage | undefined)) {
    super(useSharedStorage, storage);
  }

}

@Component() export interface __Options_Parent {
  set stateVar1(stateVar1: (string | undefined))

  get stateVar1(): (string | undefined)
  set __backing_stateVar1(__backing_stateVar1: (IStateDecoratedVariable<string> | undefined))

  get __backing_stateVar1(): (IStateDecoratedVariable<string> | undefined)
  set __options_has_stateVar1(__options_has_stateVar1: (boolean | undefined))
  
  get __options_has_stateVar1(): (boolean | undefined)
  set stateVar2(stateVar2: (number | undefined))

  get stateVar2(): (number | undefined)
  set __backing_stateVar2(__backing_stateVar2: (IStateDecoratedVariable<number> | undefined))

  get __backing_stateVar2(): (IStateDecoratedVariable<number> | undefined)
  set __options_has_stateVar2(__options_has_stateVar2: (boolean | undefined))
  
  get __options_has_stateVar2(): (boolean | undefined)
  set stateVar3(stateVar3: (boolean | undefined))

  get stateVar3(): (boolean | undefined)
  set __backing_stateVar3(__backing_stateVar3: (IStateDecoratedVariable<boolean> | undefined))

  get __backing_stateVar3(): (IStateDecoratedVariable<boolean> | undefined)
  set __options_has_stateVar3(__options_has_stateVar3: (boolean | undefined))
  
  get __options_has_stateVar3(): (boolean | undefined)
  set stateVar4(stateVar4: (undefined | undefined))

  get stateVar4(): (undefined | undefined)
  set __backing_stateVar4(__backing_stateVar4: (IStateDecoratedVariable<undefined> | undefined))

  get __backing_stateVar4(): (IStateDecoratedVariable<undefined> | undefined)
  set __options_has_stateVar4(__options_has_stateVar4: (boolean | undefined))
  
  get __options_has_stateVar4(): (boolean | undefined)
  set stateVar5(stateVar5: (null | undefined))

  get stateVar5(): (null | undefined)
  set __backing_stateVar5(__backing_stateVar5: (IStateDecoratedVariable<null> | undefined))

  get __backing_stateVar5(): (IStateDecoratedVariable<null> | undefined)
  set __options_has_stateVar5(__options_has_stateVar5: (boolean | undefined))
  
  get __options_has_stateVar5(): (boolean | undefined)
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test basic type @State decorated variables transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
