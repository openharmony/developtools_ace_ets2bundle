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
import { dumpGetterSetter, GetSetDumper } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const STATE_DIR_PATH: string = 'decorators/provider-and-consumer';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'consumer-basic-type.ets'),
];

const pluginTester = new PluginTester('test basic type @Consumer decorated variables transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedCheckedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { IConsumerDecoratedVariable as IConsumerDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { ComponentV2 as ComponentV2 } from "@ohos.arkui.component";

import { Consumer as Consumer } from "@ohos.arkui.stateManagement";

function main() {}

@ComponentV2() final struct Parent extends CustomComponentV2<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_consumerVar1 = STATE_MGMT_FACTORY.makeConsumer<string>(this, "consumerVar1", "consumerVar1", "propVar1");
    this.__backing_consumerVar2 = STATE_MGMT_FACTORY.makeConsumer<number>(this, "consumerVar2", "consumerVar2", 50);
    this.__backing_consumerVar3 = STATE_MGMT_FACTORY.makeConsumer<boolean>(this, "consumerVar3", "consumerVar3", true);
    this.__backing_consumerVar4 = STATE_MGMT_FACTORY.makeConsumer<undefined>(this, "consumerVar4", "consumerVar4", undefined);
    this.__backing_consumerVar5 = STATE_MGMT_FACTORY.makeConsumer<null>(this, "consumerVar5", "consumerVar5", null);
  }

  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}

  private __backing_consumerVar1?: IConsumerDecoratedVariable<string>;

  public get consumerVar1(): string {
    return this.__backing_consumerVar1!.get();
  }

  public set consumerVar1(value: string) {
    this.__backing_consumerVar1!.set(value);
  }

  private __backing_consumerVar2?: IConsumerDecoratedVariable<number>;

  public get consumerVar2(): number {
    return this.__backing_consumerVar2!.get();
  }

  public set consumerVar2(value: number) {
    this.__backing_consumerVar2!.set(value);
  }

  private __backing_consumerVar3?: IConsumerDecoratedVariable<boolean>;

  public get consumerVar3(): boolean {
    return this.__backing_consumerVar3!.get();
  }

  public set consumerVar3(value: boolean) {
    this.__backing_consumerVar3!.set(value);
  }

  private __backing_consumerVar4?: IConsumerDecoratedVariable<undefined>;

  public get consumerVar4(): undefined {
    return this.__backing_consumerVar4!.get();
  }

  public set consumerVar4(value: undefined) {
    this.__backing_consumerVar4!.set(value);
  }

  private __backing_consumerVar5?: IConsumerDecoratedVariable<null>;

  public get consumerVar5(): null {
    return this.__backing_consumerVar5!.get();
  }

  public set consumerVar5(value: null) {
    this.__backing_consumerVar5!.set(value);
  }

  @MemoIntrinsic() public static _invoke(style: @Memo() ((instance: Parent)=> void), initializers: ((()=> __Options_Parent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<Parent, __Options_Parent>(style, ((): Parent => {
      return new Parent();
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Parent, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): Parent {
    throw new Error("Declare interface");
  }
  
  @Memo() public build() {}

  public constructor() {}

}

@ComponentV2() export interface __Options_Parent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'consumerVar1', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_consumerVar1', '(IConsumerDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_consumerVar1', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'consumerVar2', '(number | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_consumerVar2', '(IConsumerDecoratedVariable<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_consumerVar2', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'consumerVar3', '(boolean | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_consumerVar3', '(IConsumerDecoratedVariable<boolean> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_consumerVar3', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'consumerVar4', '(undefined | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_consumerVar4', '(IConsumerDecoratedVariable<undefined> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_consumerVar4', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'consumerVar5', '(null | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_consumerVar5', '(IConsumerDecoratedVariable<null> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_consumerVar5', '(boolean | undefined)')}
  
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test basic type @Consumer decorated variables transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
