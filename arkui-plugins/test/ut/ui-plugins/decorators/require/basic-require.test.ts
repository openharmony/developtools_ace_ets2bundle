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
import { structNoRecheck, recheck, uiNoRecheck, beforeUINoRecheck } from '../../../../utils/plugins';
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

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component, ComponentV2 as ComponentV2, BuilderParam as BuilderParam } from "@ohos.arkui.component";

import { State as State, Require as Require, PropRef as PropRef, Provide as Provide, Param as Param } from "@ohos.arkui.stateManagement";

@Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() content?: (()=> void)): MyStateSample {
    throw new Error("Declare interface");
  }
  public hello: string = "hello";
  
  @State() public state1: boolean = false;
  
  @Require() public select100: string;
  
  @Require() @State() public select0: number;
  
  @Require() @State() public select3: (number | null);
  
  @Require() @State() public select4: undefined;
  
  @Require() @PropRef() public select1: string;
  
  @Require() @Provide({alias:"15"}) public select2: string[];
  
  @Require() @Provide({alias:"t"}) public select6: (string[] | undefined | string);
  
  @Require() @BuilderParam() public builder: (()=> void);

  public build() {}

  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }

}

@ComponentV2() final struct V2222 extends CustomComponentV2<V2222, __Options_V2222> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_V2222, storage?: LocalStorage, @Builder() content?: (()=> void)): V2222 {
    throw new Error("Declare interface");
  }

  @Require() @Param() public select1: string;

  public build() {}

  public constructor() {}

}

@Component() class __Options_MyStateSample {
  public hello?: string;
  public __options_has_hello?: boolean;
  @State() public state1?: boolean;
  @State() public __backing_state1?: boolean;
  public __options_has_state1?: boolean;
  @Require() public select100: string;
  public __options_has_select100?: boolean;
  @Require() @State() public select0: number;
  @State() public __backing_select0?: number;
  public __options_has_select0?: boolean;
  @Require() @State() public select3: (number | null);
  @State() public __backing_select3?: (number | null);
  public __options_has_select3?: boolean;
  @Require() @State() public select4: undefined;
  @State() public __backing_select4?: undefined;
  public __options_has_select4?: boolean;
  @Require() @PropRef() public select1: string;
  @PropRef() public __backing_select1?: string;
  public __options_has_select1?: boolean;
  @Require() @Provide({alias:"15"}) public select2: string[];
  @Provide({alias:"15"}) public __backing_select2?: string[];
  public __options_has_select2?: boolean;
  @Require() @Provide({alias:"t"}) public select6: (string[] | undefined | string);
  @Provide({alias:"t"}) public __backing_select6?: (string[] | undefined | string);
  public __options_has_select6?: boolean;
  @Require() @BuilderParam() public builder: (()=> void);
  public __options_has_builder?: boolean;
  public constructor() {}
  
}

@ComponentV2() class __Options_V2222 {
  @Require() @Param() public select1: string;
  @Param() public __backing_select1?: string;
  public __options_has_select1?: boolean;
  public constructor() {}
  
}
`;

const expectedCheckedScript: string = `
import { IParamDecoratedVariable as IParamDecoratedVariable } from "arkui.stateManagement.decorator";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { IProvideDecoratedVariable as IProvideDecoratedVariable } from "arkui.stateManagement.decorator";

import { IPropRefDecoratedVariable as IPropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component, ComponentV2 as ComponentV2, BuilderParam as BuilderParam } from "@ohos.arkui.component";

import { State as State, Require as Require, PropRef as PropRef, Provide as Provide, Param as Param } from "@ohos.arkui.stateManagement";

function main() {}

@Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_hello = (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_hello)}) ? (initializers!.hello as string) : ("hello" as string));
    this.__backing_state1 = STATE_MGMT_FACTORY.makeState<boolean>(this, "state1", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_state1)}) ? (initializers!.state1 as boolean) : (false as boolean)));
    this.__backing_select100 = (initializers!.select100 as string);
    this.__backing_select0 = STATE_MGMT_FACTORY.makeState<number>(this, "select0", (initializers!.select0 as number));
    this.__backing_select3 = STATE_MGMT_FACTORY.makeState<(number | null)>(this, "select3", (initializers!.select3 as (number | null)));
    this.__backing_select4 = STATE_MGMT_FACTORY.makeState<undefined>(this, "select4", (initializers!.select4 as undefined));
    this.__backing_select1 = STATE_MGMT_FACTORY.makePropRef<string>(this, "select1", (initializers!.select1 as string));
    this.__backing_select2 = STATE_MGMT_FACTORY.makeProvide<Array<string>>(this, "select2", "15", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_select2)}) ? (initializers!.select2 as Array<string>) : undefined), false);
    this.__backing_select6 = STATE_MGMT_FACTORY.makeProvide<(Array<string> | undefined | string)>(this, "select6", "t", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_select6)}) ? (initializers!.select6 as (Array<string> | undefined | string)) : undefined), false);
    this.__backing_builder = ((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>!.builder)})) ?? (content))) ?? (((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>!.builder)})) ?? (undefined))));
  }

  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {
    if (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_select1)})) {
      this.__backing_select1!.update((initializers!.select1 as string));
    }
  }

  public resetStateVarsOnReuse(initializers: (__Options_MyStateSample | undefined)): void {
    this.__backing_state1!.resetOnReuse(false);
    this.__backing_select0!.resetOnReuse(undefined);
    this.__backing_select3!.resetOnReuse(undefined);
    this.__backing_select4!.resetOnReuse(undefined);
    this.__backing_select1!.resetOnReuse((initializers!.select1 as string));
    this.__backing_select2!.resetOnReuse(undefined);
    this.__backing_select6!.resetOnReuse(undefined);
  }

  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: MyStateSample)=> void) | undefined), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___<some_random_number> = storage;
      (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>())}));
    }), initializers, reuseId, content);
  }

  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() content?: (()=> void)): MyStateSample {
    throw new Error("Declare interface");
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
    return (this.__backing_select100! as string);
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

  private __backing_builder?: ((()=> void) | undefined);

  public get builder(): @Memo() (()=> void) {
    return this.__backing_builder!;
  }

  public set builder(value: @Memo() (()=> void)) {
    this.__backing_builder = value;
  }

  @Memo() 
  public build() {}

  ${dumpConstructor()}

  static {
  }

}

@ComponentV2() final struct V2222 extends CustomComponentV2<V2222, __Options_V2222> {
  public __initializeStruct(initializers: (__Options_V2222 | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_select1 = STATE_MGMT_FACTORY.makeParam<string>(this, "select1", (initializers!.select1 as string));
  }

  public __updateStruct(initializers: (__Options_V2222 | undefined)): void {
    if (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_select1)})) {
      this.__backing_select1!.update((initializers!.select1 as string));
    }
  }

  public resetStateVarsOnReuse(initializers: (__Options_V2222 | undefined)): void {
    this.__backing_select1!.resetOnReuse((initializers!.select1 as string));
  }

  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: V2222)=> void) | undefined), initializers: ((()=> __Options_V2222) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<V2222, __Options_V2222>(style, ((): V2222 => {
      return new V2222();
    }), initializers, reuseId, content, {
      sClass: Class.from<V2222>(),
    });
  }

  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_V2222, storage?: LocalStorage, @Builder() content?: (()=> void)): V2222 {
    throw new Error("Declare interface");
  }

  private __backing_select1?: IParamDecoratedVariable<string>;

  public get select1(): string {
    return this.__backing_select1!.get();
  }

  @Memo() 
  public build() {}

  public constructor() {}

  static {
  }

}

@Component() class __Options_MyStateSample {
    public hello?: string;
    public __options_has_hello?: boolean;
    @State() public state1?: boolean;
    public __backing_state1?: IStateDecoratedVariable<boolean>;
    public __options_has_state1?: boolean;
    @Require() public select100: string;
    public __options_has_select100?: boolean;
    @Require() @State() public select0: number;
    public __backing_select0?: IStateDecoratedVariable<number>;
    public __options_has_select0?: boolean;
    @Require() @State() public select3: (number | null);
    public __backing_select3?: IStateDecoratedVariable<(number | null)>;
    public __options_has_select3?: boolean;
    @Require() @State() public select4: undefined;
    public __backing_select4?: IStateDecoratedVariable<undefined>;
    public __options_has_select4?: boolean;
    @Require() @PropRef() public select1: string;
    public __backing_select1?: IPropRefDecoratedVariable<string>;
    public __options_has_select1?: boolean;
    @Require() @Provide({alias:"15"}) public select2: Array<string>;
    public __backing_select2?: IProvideDecoratedVariable<Array<string>>;
    public __options_has_select2?: boolean;
    @Require() @Provide({alias:"t"}) public select6: (Array<string> | undefined | string);
    public __backing_select6?: IProvideDecoratedVariable<(Array<string> | undefined | string)>;
    public __options_has_select6?: boolean;
    @Require() public builder: (()=> void);
    public __options_has_builder?: boolean;
    public constructor() {}
    
}

@ComponentV2() class __Options_V2222 {
    @Require() @Param() public select1: string;
    public __backing_select1?: IParamDecoratedVariable<string>;
    public __options_has_select1?: boolean;
    public constructor() {}
  
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
    [parsedTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'parsed': [testParsedTransformer],
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
