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

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/provide-and-consume';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'provide-annotation-usage.ets'),
];

const pluginTester = new PluginTester('test different @Provide annotation usage transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'provide-annotation-usage',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { IProvideDecoratedVariable as IProvideDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component } from "@ohos.arkui.component";

import { Provide as Provide } from "@ohos.arkui.stateManagement";

function main() {}

@Component() final struct Ancestors extends CustomComponent<Ancestors, __Options_Ancestors> {
  public __initializeStruct(initializers: (__Options_Ancestors | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_count = STATE_MGMT_FACTORY.makeProvide<(string | undefined)>(this, "count", "count", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_count)}) ? (initializers!.count as (string | undefined)) : ("Child0" as (string | undefined))), false);
    this.__backing_count1 = STATE_MGMT_FACTORY.makeProvide<(string | undefined)>(this, "count1", "prov1", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_count1)}) ? (initializers!.count1 as (string | undefined)) : ("Child1" as (string | undefined))), false);
    this.__backing_count2 = STATE_MGMT_FACTORY.makeProvide<(string | undefined)>(this, "count2", "prov2", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_count2)}) ? (initializers!.count2 as (string | undefined)) : ("Child2" as (string | undefined))), false);
    this.__backing_count3 = STATE_MGMT_FACTORY.makeProvide<(string | undefined)>(this, "count3", "prov3", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_count3)}) ? (initializers!.count3 as (string | undefined)) : ("Child3" as (string | undefined))), true);
    this.__backing_count4 = STATE_MGMT_FACTORY.makeProvide<(string | undefined)>(this, "count4", "count4", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_count4)}) ? (initializers!.count4 as (string | undefined)) : ("Child4" as (string | undefined))), false);
    this.__backing_count5 = STATE_MGMT_FACTORY.makeProvide<(string | undefined)>(this, "count5", "count5", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_count5)}) ? (initializers!.count5 as (string | undefined)) : ("Child5" as (string | undefined))), true);
    this.__backing_count6 = STATE_MGMT_FACTORY.makeProvide<(string | undefined)>(this, "count6", "", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_count6)}) ? (initializers!.count6 as (string | undefined)) : ("Child6" as (string | undefined))), true);
    this.__backing_count7 = STATE_MGMT_FACTORY.makeProvide<(string | undefined)>(this, "count7", "", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_count7)}) ? (initializers!.count7 as (string | undefined)) : ("Child7" as (string | undefined))), false);
  }

  public __updateStruct(initializers: (__Options_Ancestors | undefined)): void {}

  public resetStateVarsOnReuse(initializers: (__Options_Ancestors | undefined)): void {
    this.__backing_count!.resetOnReuse("Child0");
    this.__backing_count1!.resetOnReuse("Child1");
    this.__backing_count2!.resetOnReuse("Child2");
    this.__backing_count3!.resetOnReuse("Child3");
    this.__backing_count4!.resetOnReuse("Child4");
    this.__backing_count5!.resetOnReuse("Child5");
    this.__backing_count6!.resetOnReuse("Child6");
    this.__backing_count7!.resetOnReuse("Child7");
  }

  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: Ancestors)=> void) | undefined), initializers: ((()=> __Options_Ancestors) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Ancestors, __Options_Ancestors>(style, ((): Ancestors => {
      return new Ancestors(false, ({let gensym___203542966 = storage;
      (((gensym___203542966) == (null)) ? undefined : gensym___203542966())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Ancestors, storage?: LocalStorage, @Builder() content?: (()=> void)): Ancestors {
    throw new Error("Declare interface");
    }

  private __backing_count?: IProvideDecoratedVariable<(string | undefined)>;

  public get count(): (string | undefined) {
    return this.__backing_count!.get();
  }

  public set count(value: (string | undefined)) {
    this.__backing_count!.set(value);
  }

  private __backing_count1?: IProvideDecoratedVariable<(string | undefined)>;

  public get count1(): (string | undefined) {
    return this.__backing_count1!.get();
  }

  public set count1(value: (string | undefined)) {
    this.__backing_count1!.set(value);
  }

  private __backing_count2?: IProvideDecoratedVariable<(string | undefined)>;

  public get count2(): (string | undefined) {
    return this.__backing_count2!.get();
  }

  public set count2(value: (string | undefined)) {
    this.__backing_count2!.set(value);
  }

  private __backing_count3?: IProvideDecoratedVariable<(string | undefined)>;

  public get count3(): (string | undefined) {
    return this.__backing_count3!.get();
  }

  public set count3(value: (string | undefined)) {
    this.__backing_count3!.set(value);
  }

  private __backing_count4?: IProvideDecoratedVariable<(string | undefined)>;

  public get count4(): (string | undefined) {
    return this.__backing_count4!.get();
  }

  public set count4(value: (string | undefined)) {
    this.__backing_count4!.set(value);
  }

  private __backing_count5?: IProvideDecoratedVariable<(string | undefined)>;

  public get count5(): (string | undefined) {
    return this.__backing_count5!.get();
  }

  public set count5(value: (string | undefined)) {
    this.__backing_count5!.set(value);
  }

  private __backing_count6?: IProvideDecoratedVariable<(string | undefined)>;

  public get count6(): (string | undefined) {
    return this.__backing_count6!.get();
  }

  public set count6(value: (string | undefined)) {
    this.__backing_count6!.set(value);
  }

  private __backing_count7?: IProvideDecoratedVariable<(string | undefined)>;

  public get count7(): (string | undefined) {
    return this.__backing_count7!.get();
  }

  public set count7(value: (string | undefined)) {
    this.__backing_count7!.set(value);
  }

  @Memo() 
  public build() {}

  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  static {
  }
}

@Component() class __Options_Ancestors {
  @Provide() public count?: (string | undefined);
  public __backing_count?: IProvideDecoratedVariable<(string | undefined)>;
  public __options_has_count?: boolean;
  @Provide({alias:"prov1"}) public count1?: (string | undefined);
  public __backing_count1?: IProvideDecoratedVariable<(string | undefined)>;
  public __options_has_count1?: boolean;
  @Provide({alias:"prov2",allowOverride:false}) public count2?: (string | undefined);
  public __backing_count2?: IProvideDecoratedVariable<(string | undefined)>;
  public __options_has_count2?: boolean;
  @Provide({alias:"prov3",allowOverride:true}) public count3?: (string | undefined);
  public __backing_count3?: IProvideDecoratedVariable<(string | undefined)>;
  public __options_has_count3?: boolean;
  @Provide({allowOverride:false}) public count4?: (string | undefined);
  public __backing_count4?: IProvideDecoratedVariable<(string | undefined)>;
  public __options_has_count4?: boolean;
  @Provide({allowOverride:true}) public count5?: (string | undefined);
  public __backing_count5?: IProvideDecoratedVariable<(string | undefined)>;
  public __options_has_count5?: boolean;
  @Provide({alias:"",allowOverride:true}) public count6?: (string | undefined);
  public __backing_count6?: IProvideDecoratedVariable<(string | undefined)>;
  public __options_has_count6?: boolean;
  @Provide({alias:""}) public count7?: (string | undefined);
  public __backing_count7?: IProvideDecoratedVariable<(string | undefined)>;
  public __options_has_count7?: boolean;
  public constructor() {}
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test different @Provide annotation usage transformation',
    [parsedTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
