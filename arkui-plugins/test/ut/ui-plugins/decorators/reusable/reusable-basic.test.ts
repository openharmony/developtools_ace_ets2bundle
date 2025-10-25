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
import { uiNoRecheck, recheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, dumpConstructor } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const REUSABLE_DIR_PATH: string = 'decorators/reusable';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, REUSABLE_DIR_PATH, 'reusable-basic.ets'),
];

const reusableTransform: Plugins = {
    name: 'reusable',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test basic reusable', buildConfig);

const expectedScript: string = `
import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IPropRefDecoratedVariable as IPropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.stateManagement.runtime";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Component as Component, Reusable as Reusable } from "@ohos.arkui.component";

import { State as State, PropRef as PropRef } from "@ohos.arkui.stateManagement";

function main() {}

@Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @memo() content: ((()=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}
  
  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: MyStateSample)=> void), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___203542966 = storage;
      (((gensym___203542966) == (null)) ? undefined : gensym___203542966())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): MyStateSample {
    throw new Error("Declare interface");
  }
  
  @memo() public build() {
    Child._invoke(@memo() ((instance: Child): void => {
      instance.applyAttributesFinish();
      return;
    }), (() => {
      return {
        num1: 5,
        __options_has_num1: true,
      };
    }), undefined, "Child", undefined);
  }
  
  ${dumpConstructor()}
  
}

@Component() @Reusable() final struct Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_num = STATE_MGMT_FACTORY.makePropRef<number>(this, "num", ((({let gensym___83257243 = initializers;
    (((gensym___83257243) == (null)) ? undefined : gensym___83257243.num)})) ?? (1)));
    this.__backing_num1 = STATE_MGMT_FACTORY.makeState<number>(this, "num1", ((({let gensym___24398512 = initializers;
    (((gensym___24398512) == (null)) ? undefined : gensym___24398512.num1)})) ?? (2)));
  }
  
  public __updateStruct(initializers: (__Options_Child | undefined)): void {
    if (({let gensym___111600432 = initializers;
    (((gensym___111600432) == (null)) ? undefined : gensym___111600432.__options_has_num)})) {
      this.__backing_num!.update((initializers!.num as number));
    }
  }
  
  public override constructor __toRecord(params: Object): Record<string, Object> {
    const paramsCasted = (params as __Options_Child);
    return {
      "num": ((paramsCasted.num) ?? (new Object())),
      "num1": ((paramsCasted.num1) ?? (new Object())),
    };
  }
  
  private __backing_num?: IPropRefDecoratedVariable<number>;
  
  public get num(): number {
    return this.__backing_num!.get();
  }
  
  public set num(value: number) {
    this.__backing_num!.set(value);
  }
  
  private __backing_num1?: IStateDecoratedVariable<number>;
  
  public get num1(): number {
    return this.__backing_num1!.get();
  }
  
  public set num1(value: number) {
    this.__backing_num1!.set(value);
  }
  
  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: Child)=> void), initializers: ((()=> __Options_Child) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Child, __Options_Child>(style, ((): Child => {
      return new Child(false, ({let gensym___90667230 = storage;
      (((gensym___90667230) == (null)) ? undefined : gensym___90667230())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Child, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): Child {
    throw new Error("Declare interface");
  }
  
  @memo() public build() {}
  
  ${dumpConstructor()}
  
}

@Component() export interface __Options_MyStateSample {
  
}

@Component() @Reusable() export interface __Options_Child {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'num', '(number | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_num', '(IPropRefDecoratedVariable<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_num', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'num1', '(number | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_num1', '(IStateDecoratedVariable<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_num1', '(boolean | undefined)')}
  
}
`;

function testReusableTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test basic reusable',
    [reusableTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testReusableTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
