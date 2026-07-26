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
import { structNoRecheck, recheck, beforeUINoRecheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, dumpConstructor, dumpAnnotation } from '../../../../utils/simplify-dump';
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

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement";

function main() {}

@Component() final struct Parent extends CustomComponent<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_stateVar1 = STATE_MGMT_FACTORY.makeState<string>(this, "stateVar1", (({let gensym___<some_random_number> = initializers;
      (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_stateVar1)}) ? (initializers!.stateVar1 as string) : ("stateVar1" as string)));
    this.__backing_stateVar2 = STATE_MGMT_FACTORY.makeState<number>(this, "stateVar2", (({let gensym___<some_random_number> = initializers;
      (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_stateVar2)}) ? (initializers!.stateVar2 as number) : (50 as number)));
    this.__backing_stateVar3 = STATE_MGMT_FACTORY.makeState<boolean>(this, "stateVar3", (({let gensym___<some_random_number> = initializers;
      (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_stateVar3)}) ? (initializers!.stateVar3 as boolean) : (true as boolean)));
    this.__backing_stateVar4 = STATE_MGMT_FACTORY.makeState<undefined>(this, "stateVar4", (({let gensym___<some_random_number> = initializers;
      (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_stateVar4)}) ? (initializers!.stateVar4 as undefined) : undefined));
    this.__backing_stateVar5 = STATE_MGMT_FACTORY.makeState<null>(this, "stateVar5", (({let gensym___<some_random_number> = initializers;
      (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_stateVar5)}) ? (initializers!.stateVar5 as null) : null));
  }

  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}

  public resetStateVarsOnReuse(initializers: (__Options_Parent | undefined)): void {
    this.__backing_stateVar1!.resetOnReuse("stateVar1");
    this.__backing_stateVar2!.resetOnReuse(50);
    this.__backing_stateVar3!.resetOnReuse(true);
    this.__backing_stateVar4!.resetOnReuse(undefined);
    this.__backing_stateVar5!.resetOnReuse(null);
  }
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: Parent)=> void) | undefined), initializers: ((()=> __Options_Parent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Parent, __Options_Parent>(style, ((): Parent => {
      return new Parent(false, ({let gensym___<some_random_number> = storage;
      (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>())}));
    }), initializers, reuseId, content);
  }
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Parent, storage?: LocalStorage, @Builder() content?: (()=> void)): Parent {
    throw new Error("Declare interface");
  }

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

  @Memo() 
  public build() {}

  ${dumpConstructor()}

  static {
  }
}

@Component() class __Options_Parent {
  @State() public stateVar1?: string;
  public __backing_stateVar1?: IStateDecoratedVariable<string>;
  public __options_has_stateVar1?: boolean;
  @State() public stateVar2?: number;
  public __backing_stateVar2?: IStateDecoratedVariable<number>;
  public __options_has_stateVar2?: boolean;
  @State() public stateVar3?: boolean;
  public __backing_stateVar3?: IStateDecoratedVariable<boolean>;
  public __options_has_stateVar3?: boolean;
  @State() public stateVar4?: undefined;
  public __backing_stateVar4?: IStateDecoratedVariable<undefined>;
  public __options_has_stateVar4?: boolean;
  @State() public stateVar5?: null;
  public __backing_stateVar5?: IStateDecoratedVariable<null>;
  public __options_has_stateVar5?: boolean;
  public constructor() {}
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test basic type @State decorated variables transformation',
    [parsedTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
