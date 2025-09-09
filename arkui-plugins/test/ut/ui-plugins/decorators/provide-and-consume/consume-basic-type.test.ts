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
import { dumpGetterSetter, GetSetDumper, ignoreNewLines } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const STATE_DIR_PATH: string = 'decorators/provide-and-consume';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'consume-basic-type.ets'),
];

const pluginTester = new PluginTester('test basic type @Consume decorated variables transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedParsedScript: string = `
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Component as Component } from "@ohos.arkui.component";

import { Consume as Consume } from "@ohos.arkui.stateManagement";

@Component() final struct PropParent extends CustomComponent<PropParent, __Options_PropParent> {
  @ComponentBuilder() public static $_invoke(initializers?: __Options_PropParent, storage?: LocalStorage, @Builder() content?: (()=> void)): PropParent {
    throw new Error("Declare interface");
  }
  
  @Consume() public conVar1!: string;

  @Consume() public conVar2!: number;

  @Consume() public conVar3!: boolean;

  @Consume() public conVar4?: undefined;

  @Consume() public conVar5?: null;

  public build() {}

  public constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }

}

@Component() export interface __Options_PropParent {
  ${ignoreNewLines(`
  conVar1?: string;
  @Consume() __backing_conVar1?: string;
  __options_has_conVar1?: boolean;
  conVar2?: number;
  @Consume() __backing_conVar2?: number;
  __options_has_conVar2?: boolean;
  conVar3?: boolean;
  @Consume() __backing_conVar3?: boolean;
  __options_has_conVar3?: boolean;
  conVar4?: undefined;
  @Consume() __backing_conVar4?: undefined;
  __options_has_conVar4?: boolean;
  conVar5?: null;
  @Consume() __backing_conVar5?: null;
  __options_has_conVar5?: boolean;
  `)}
  
}
`;

const expectedCheckedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.stateManagement.runtime";

import { IConsumeDecoratedVariable as IConsumeDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Component as Component } from "@ohos.arkui.component";

import { Consume as Consume } from "@ohos.arkui.stateManagement";

function main() {}

@Component() final struct PropParent extends CustomComponent<PropParent, __Options_PropParent> {
  public __initializeStruct(initializers: (__Options_PropParent | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_conVar1 = STATE_MGMT_FACTORY.makeConsume<string>(this, "conVar1", "conVar1");
    this.__backing_conVar2 = STATE_MGMT_FACTORY.makeConsume<number>(this, "conVar2", "conVar2");
    this.__backing_conVar3 = STATE_MGMT_FACTORY.makeConsume<boolean>(this, "conVar3", "conVar3");
    this.__backing_conVar4 = STATE_MGMT_FACTORY.makeConsume<undefined>(this, "conVar4", "conVar4");
    this.__backing_conVar5 = STATE_MGMT_FACTORY.makeConsume<null>(this, "conVar5", "conVar5");
  }

  public __updateStruct(initializers: (__Options_PropParent | undefined)): void {}

  private __backing_conVar1?: IConsumeDecoratedVariable<string>;

  public get conVar1(): string {
    return this.__backing_conVar1!.get();
  }

  public set conVar1(value: string) {
    this.__backing_conVar1!.set(value);
  }

  private __backing_conVar2?: IConsumeDecoratedVariable<number>;

  public get conVar2(): number {
    return this.__backing_conVar2!.get();
  }

  public set conVar2(value: number) {
    this.__backing_conVar2!.set(value);
  }

  private __backing_conVar3?: IConsumeDecoratedVariable<boolean>;

  public get conVar3(): boolean {
    return this.__backing_conVar3!.get();
  }

  public set conVar3(value: boolean) {
    this.__backing_conVar3!.set(value);
  }

  private __backing_conVar4?: IConsumeDecoratedVariable<undefined>;

  public get conVar4(): undefined {
    return this.__backing_conVar4!.get();
  }

  public set conVar4(value: undefined) {
    this.__backing_conVar4!.set(value);
  }

  private __backing_conVar5?: IConsumeDecoratedVariable<null>;

  public get conVar5(): null {
    return this.__backing_conVar5!.get();
  }

  public set conVar5(value: null) {
    this.__backing_conVar5!.set(value);
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

@Component() export interface __Options_PropParent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar1', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar1', '(IConsumeDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar1', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar2', '(number | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar2', '(IConsumeDecoratedVariable<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar2', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar3', '(boolean | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar3', '(IConsumeDecoratedVariable<boolean> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar3', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar4', '(undefined | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar4', '(IConsumeDecoratedVariable<undefined> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar4', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar5', '(null | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar5', '(IConsumeDecoratedVariable<null> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar5', '(boolean | undefined)')}
  
}
`;

function testParsedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedParsedScript));
}

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test basic type @Consume decorated variables transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'parsed': [testParsedTransformer],
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
