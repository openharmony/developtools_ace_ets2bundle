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
import { structNoRecheck, recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpAnnotation, dumpGetterSetter, GetSetDumper, ignoreNewLines, dumpConstructor } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const STATE_DIR_PATH: string = 'decorators/require';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'basic-require.ets'),
];

const pluginTester = new PluginTester('test @Require decorator capability', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedParsedScript: string = `
import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Component as Component, ComponentV2 as ComponentV2, BuilderParam as BuilderParam } from "@ohos.arkui.component";

import { State as State, Require as Require, PropRef as PropRef, Provide as Provide, Param as Param } from "@ohos.arkui.stateManagement";

@Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  @ComponentBuilder() public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() content?: (()=> void)): MyStateSample {
    throw new Error("Declare interface");
  }
  public hello: string = "hello";
  
  @State() public state1: boolean = false;
  
  @Require() public select100!: string;
  
  @Require() @State() public select0!: number;
  
  @Require() @State() public select3?: (number | null);
  
  @Require() @State() public select4?: undefined;
  
  @Require() @PropRef() public select1!: string;
  
  @Require() @Provide({alias:"15"}) public select2!: string[];
  
  @Require() @Provide({alias:"t"}) public select6?: (string[] | undefined | string);
  
  @Require() @BuilderParam() public builder!: (()=> void);

  public build() {}

  public constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }

}

@ComponentV2() final struct V2222 extends CustomComponentV2<V2222, __Options_V2222> {
  @ComponentBuilder() public static $_invoke(initializers?: __Options_V2222, storage?: LocalStorage, @Builder() content?: (()=> void)): V2222 {
    throw new Error("Declare interface");
  }

  @Require() @Param() public select1!: string;

  public build() {}

  public constructor() {}

}

@Component() export interface __Options_MyStateSample {
  ${ignoreNewLines(`
  hello?: string;
  __options_has_hello?: boolean;
  state1?: boolean;
  @State() __backing_state1?: boolean;
  __options_has_state1?: boolean;
  select100?: string;
  __options_has_select100?: boolean;
  select0?: number;
  @Require() @State() __backing_select0?: number;
  __options_has_select0?: boolean;
  select3?: (number | null);
  @Require() @State() __backing_select3?: (number | null);
  __options_has_select3?: boolean;
  select4?: undefined;
  @Require() @State() __backing_select4?: undefined;
  __options_has_select4?: boolean;
  select1?: string;
  @Require() @PropRef() __backing_select1?: string;
  __options_has_select1?: boolean;
  select2?: string[];
  @Require() @Provide({alias:"15"}) __backing_select2?: string[];
  __options_has_select2?: boolean;
  select6?: (string[] | undefined | string);
  @Require() @Provide({alias:"t"}) __backing_select6?: (string[] | undefined | string);
  __options_has_select6?: boolean;
  @BuilderParam() builder?: (()=> void);
  __options_has_builder?: boolean;
  `)}
  
}

@ComponentV2() export interface __Options_V2222 {
  ${ignoreNewLines(`
  select1?: string;
  @Require() @Param() __backing_select1?: string;
  __options_has_select1?: boolean;
  `)}
  
}
`;

const expectedCheckedScript: string = `
import { IParamDecoratedVariable as IParamDecoratedVariable } from "arkui.stateManagement.decorator";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { IProvideDecoratedVariable as IProvideDecoratedVariable } from "arkui.stateManagement.decorator";

import { IPropRefDecoratedVariable as IPropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Component as Component, ComponentV2 as ComponentV2, BuilderParam as BuilderParam } from "@ohos.arkui.component";

import { State as State, Require as Require, PropRef as PropRef, Provide as Provide, Param as Param } from "@ohos.arkui.stateManagement";

function main() {}

@Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_hello = ((({let gensym___159351621 = initializers;
    (((gensym___159351621) == (null)) ? undefined : gensym___159351621.hello)})) ?? ("hello"));
    this.__backing_state1 = STATE_MGMT_FACTORY.makeState<boolean>(this, "state1", ((({let gensym___152317197 = initializers;
    (((gensym___152317197) == (null)) ? undefined : gensym___152317197.state1)})) ?? (false)));
    this.__backing_select100 = ((({let gensym___257385749 = initializers;
    (((gensym___257385749) == (null)) ? undefined : gensym___257385749.select100)})) ?? (undefined));
    this.__backing_select0 = STATE_MGMT_FACTORY.makeState<number>(this, "select0", (initializers!.select0 as number));
    this.__backing_select3 = STATE_MGMT_FACTORY.makeState<(number | null)>(this, "select3", (initializers!.select3 as (number | null)));
    this.__backing_select4 = STATE_MGMT_FACTORY.makeState<undefined>(this, "select4", (initializers!.select4 as undefined));
    this.__backing_select1 = STATE_MGMT_FACTORY.makePropRef<string>(this, "select1", (initializers!.select1 as string));
    this.__backing_select2 = STATE_MGMT_FACTORY.makeProvide<Array<string>>(this, "select2", "15", (initializers!.select2 as Array<string>), false);
    this.__backing_select6 = STATE_MGMT_FACTORY.makeProvide<(Array<string> | undefined | string)>(this, "select6", "t", (initializers!.select6 as (Array<string> | undefined | string)), false);
    this.__backing_builder = ((((({let gensym___63603867 = initializers;
    (((gensym___63603867) == (null)) ? undefined : gensym___63603867.builder)})) ?? (content))) ?? (undefined))
  }

  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {
    if (({let gensym___77985515 = initializers;
    (((gensym___77985515) == (null)) ? undefined : gensym___77985515.__options_has_select1)})) {
      this.__backing_select1!.update((initializers!.select1 as string));
    }
  }

  private __backing_hello?: string;

  public get hello(): string {
    return (this.__backing_hello as string);
  }

  public set hello(value: string) {
    this.__backing_hello = value;
  }

  private __backing_state1?: IStateDecoratedVariable<boolean>;

  public get state1(): boolean {
    return this.__backing_state1!.get();
  }

  public set state1(value: boolean) {
    this.__backing_state1!.set(value);
  }

  private __backing_select100?: string;

  public get select100(): string {
    return (this.__backing_select100 as string);
  }

  public set select100(value: string) {
    this.__backing_select100 = value;
  }

  private __backing_select0?: IStateDecoratedVariable<number>;

  public get select0(): number {
    return this.__backing_select0!.get();
  }

  public set select0(value: number) {
    this.__backing_select0!.set(value);
  }

  private __backing_select3?: IStateDecoratedVariable<(number | null)>;

  public get select3(): (number | null) {
    return this.__backing_select3!.get();
  }

  public set select3(value: (number | null)) {
    this.__backing_select3!.set(value);
  }

  private __backing_select4?: IStateDecoratedVariable<undefined>;

  public get select4(): undefined {
    return this.__backing_select4!.get();
  }

  public set select4(value: undefined) {
    this.__backing_select4!.set(value);
  }
  
  private __backing_select1?: IPropRefDecoratedVariable<string>;
  
  public get select1(): string {
    return this.__backing_select1!.get();
  }

  public set select1(value: string) {
    this.__backing_select1!.set(value);
  }

  private __backing_select2?: IProvideDecoratedVariable<Array<string>>;

  public get select2(): Array<string> {
    return this.__backing_select2!.get();
  }

  public set select2(value: Array<string>) {
    this.__backing_select2!.set(value);
  }

  private __backing_select6?: IProvideDecoratedVariable<(Array<string> | undefined | string)>;

  public get select6(): (Array<string> | undefined | string) {
    return this.__backing_select6!.get();
  }

  public set select6(value: (Array<string> | undefined | string)) {
    this.__backing_select6!.set(value);
  }

  private __backing_builder?: @memo() (()=> void);

  public get builder(): @memo() (()=> void) {
    return this.__backing_builder!;
  }

  public set builder(value: @memo() (()=> void)) {
    this.__backing_builder = value;
  }

  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: MyStateSample)=> void), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___56395834 = storage;
      (((gensym___56395834) == (null)) ? undefined : gensym___56395834())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): MyStateSample {
    throw new Error("Declare interface");
  }

  @memo() public build() {}

  ${dumpConstructor()}

}

@ComponentV2() final struct V2222 extends CustomComponentV2<V2222, __Options_V2222> {
  public __initializeStruct(initializers: (__Options_V2222 | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_select1 = STATE_MGMT_FACTORY.makeParam<string>(this, "select1", (initializers!.select1 as string));
  }

  public __updateStruct(initializers: (__Options_V2222 | undefined)): void {
    if (({let gensym___8595130 = initializers;
    (((gensym___8595130) == (null)) ? undefined : gensym___8595130.__options_has_select1)})) {
      this.__backing_select1!.update((initializers!.select1 as string));
    }
  }

  private __backing_select1?: IParamDecoratedVariable<string>;

  public get select1(): string {
    return this.__backing_select1!.get();
  }

  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: V2222)=> void), initializers: ((()=> __Options_V2222) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<V2222, __Options_V2222>(style, ((): V2222 => {
      return new V2222();
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_V2222, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): V2222 {
    throw new Error("Declare interface");
  }

  @memo() public build() {}

  public constructor() {}

}

@Component() export interface __Options_MyStateSample {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'hello', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_hello', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'state1', '(boolean | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_state1', '(IStateDecoratedVariable<boolean> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_state1', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'select100', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_select100', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'select0', '(number | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_select0', '(IStateDecoratedVariable<number> | undefined)', [dumpAnnotation('Require')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_select0', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'select3', '((number | null) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_select3', '(IStateDecoratedVariable<(number | null)> | undefined)', [dumpAnnotation('Require')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_select3', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'select4', '(undefined | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_select4', '(IStateDecoratedVariable<undefined> | undefined)', [dumpAnnotation('Require')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_select4', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'select1', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_select1', '(IPropRefDecoratedVariable<string> | undefined)', [dumpAnnotation('Require')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_select1', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'select2', '(Array<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_select2', '(IProvideDecoratedVariable<Array<string>> | undefined)', [dumpAnnotation('Require')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_select2', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'select6', '((Array<string> | undefined | string) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_select6', '(IProvideDecoratedVariable<(Array<string> | undefined | string)> | undefined)', [dumpAnnotation('Require')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_select6', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'builder', '(@memo() (()=> void) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_builder', '(boolean | undefined)')}
  
}

@ComponentV2() export interface __Options_V2222 {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'select1', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_select1', '(IParamDecoratedVariable<string> | undefined)', [dumpAnnotation('Require')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_select1', '(boolean | undefined)')}
  
}
`;

function testParsedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedParsedScript));
}

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test @Require decorator capability',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'parsed': [testParsedTransformer],
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
