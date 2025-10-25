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

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/provide-and-consume';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'provide-basic-type.ets'),
];

const pluginTester = new PluginTester('test basic type @Provide decorated variables transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'provide-basic-type',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.stateManagement.runtime";

import { IProvideDecoratedVariable as IProvideDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Component as Component } from "@ohos.arkui.component";

import { Provide as Provide } from "@ohos.arkui.stateManagement";

function main() {}

@Component() final struct PropParent extends CustomComponent<PropParent, __Options_PropParent> {
  public __initializeStruct(initializers: (__Options_PropParent | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_provideVar1 = STATE_MGMT_FACTORY.makeProvide<string>(this, "provideVar1", "provideVar1", ((({let gensym___181030638 = initializers;
    (((gensym___181030638) == (null)) ? undefined : gensym___181030638.provideVar1)})) ?? ("propVar1")), false);
    this.__backing_provideVar2 = STATE_MGMT_FACTORY.makeProvide<number>(this, "provideVar2", "provideVar2", ((({let gensym___143944235 = initializers;
    (((gensym___143944235) == (null)) ? undefined : gensym___143944235.provideVar2)})) ?? (50)), false);
    this.__backing_provideVar3 = STATE_MGMT_FACTORY.makeProvide<boolean>(this, "provideVar3", "provideVar3", ((({let gensym___262195977 = initializers;
    (((gensym___262195977) == (null)) ? undefined : gensym___262195977.provideVar3)})) ?? (true)), false);
    this.__backing_provideVar4 = STATE_MGMT_FACTORY.makeProvide<undefined>(this, "provideVar4", "provideVar4", ((({let gensym___85711435 = initializers;
    (((gensym___85711435) == (null)) ? undefined : gensym___85711435.provideVar4)})) ?? (undefined)), false);
    this.__backing_provideVar5 = STATE_MGMT_FACTORY.makeProvide<null>(this, "provideVar5", "provideVar5", ((({let gensym___139253630 = initializers;
    (((gensym___139253630) == (null)) ? undefined : gensym___139253630.provideVar5)})) ?? (null)), false);
  }

  public __updateStruct(initializers: (__Options_PropParent | undefined)): void {}

  private __backing_provideVar1?: IProvideDecoratedVariable<string>;

  public get provideVar1(): string {
    return this.__backing_provideVar1!.get();
  }

  public set provideVar1(value: string) {
    this.__backing_provideVar1!.set(value);
  }

  private __backing_provideVar2?: IProvideDecoratedVariable<number>;

  public get provideVar2(): number {
    return this.__backing_provideVar2!.get();
  }

  public set provideVar2(value: number) {
    this.__backing_provideVar2!.set(value);
  }

  private __backing_provideVar3?: IProvideDecoratedVariable<boolean>;

  public get provideVar3(): boolean {
    return this.__backing_provideVar3!.get();
  }

  public set provideVar3(value: boolean) {
    this.__backing_provideVar3!.set(value);
  }

  private __backing_provideVar4?: IProvideDecoratedVariable<undefined>;

  public get provideVar4(): undefined {
    return this.__backing_provideVar4!.get();
  }

  public set provideVar4(value: undefined) {
    this.__backing_provideVar4!.set(value);
  }

  private __backing_provideVar5?: IProvideDecoratedVariable<null>;

  public get provideVar5(): null {
    return this.__backing_provideVar5!.get();
  }

  public set provideVar5(value: null) {
    this.__backing_provideVar5!.set(value);
  }

  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: PropParent)=> void), initializers: ((()=> __Options_PropParent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<PropParent, __Options_PropParent>(style, ((): PropParent => {
      return new PropParent(false, ({let gensym___203542966 = storage;
      (((gensym___203542966) == (null)) ? undefined : gensym___203542966())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_PropParent, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): PropParent {
    throw new Error("Declare interface");
  }

  @memo() public build() {}

  ${dumpConstructor()}

}

@Component() export interface __Options_PropParent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'provideVar1', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_provideVar1', '(IProvideDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_provideVar1', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'provideVar2', '(number | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_provideVar2', '(IProvideDecoratedVariable<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_provideVar2', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'provideVar3', '(boolean | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_provideVar3', '(IProvideDecoratedVariable<boolean> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_provideVar3', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'provideVar4', '(undefined | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_provideVar4', '(IProvideDecoratedVariable<undefined> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_provideVar4', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'provideVar5', '(null | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_provideVar5', '(IProvideDecoratedVariable<null> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_provideVar5', '(boolean | undefined)')}
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test basic type @Provide decorated variables transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
