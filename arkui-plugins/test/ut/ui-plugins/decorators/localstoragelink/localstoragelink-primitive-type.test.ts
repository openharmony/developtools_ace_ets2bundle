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
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const LOCAL_STORAGELINK_DIR_PATH: string = 'decorators/localstoragelink';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, LOCAL_STORAGELINK_DIR_PATH, 'localstoragelink-primitive-type.ets'),
];

const localStorageLinkTransform: Plugins = {
    name: 'localStorageLink',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test LocalStorageLink primitive type transform', buildConfig);

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.stateManagement.runtime";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { ILocalStorageLinkDecoratedVariable as ILocalStorageLinkDecoratedVariable } from "arkui.stateManagement.decorator";

import { memo as memo } from "arkui.stateManagement.runtime";

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Component as Component, Entry as Entry } from "@ohos.arkui.component";

import { LocalStorageLink as LocalStorageLink } from "@ohos.arkui.stateManagement";

function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/localstoragelink/localstoragelink-primitive-type",
  pageFullPath: "test/demo/mock/decorators/localstoragelink/localstoragelink-primitive-type",
  integratedHsp: "false",
} as NavInterface));

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_numA = STATE_MGMT_FACTORY.makeLocalStorageLink<number>(this, "Prop1", "numA", 33)
    this.__backing_stringA = STATE_MGMT_FACTORY.makeLocalStorageLink<string>(this, "Prop2", "stringA", "AA")
    this.__backing_booleanA = STATE_MGMT_FACTORY.makeLocalStorageLink<boolean>(this, "Prop3", "booleanA", true)
  }

  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}

  private __backing_numA?: ILocalStorageLinkDecoratedVariable<number>;

  public get numA(): number {
    return this.__backing_numA!.get();
  }

  public set numA(value: number) {
    this.__backing_numA!.set(value);
  }

  private __backing_stringA?: ILocalStorageLinkDecoratedVariable<string>;

  public get stringA(): string {
    return this.__backing_stringA!.get();
  }

  public set stringA(value: string) {
    this.__backing_stringA!.set(value);
  }

  private __backing_booleanA?: ILocalStorageLinkDecoratedVariable<boolean>;

  public get booleanA(): boolean {
    return this.__backing_booleanA!.get();
  }

  public set booleanA(value: boolean) {
    this.__backing_booleanA!.set(value);
  }

  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: MyStateSample)=> void), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___203542966 = storage;
      (((gensym___203542966) == (null)) ? undefined : gensym___203542966())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): MyStateSample {
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

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() export interface __Options_MyStateSample {
  set numA(numA: (number | undefined))

  get numA(): (number | undefined)
  set __backing_numA(__backing_numA: (ILocalStorageLinkDecoratedVariable<number> | undefined))

  get __backing_numA(): (ILocalStorageLinkDecoratedVariable<number> | undefined)
  set __options_has_numA(__options_has_numA: (boolean | undefined))
  
  get __options_has_numA(): (boolean | undefined)
  set stringA(stringA: (string | undefined))

  get stringA(): (string | undefined)
  set __backing_stringA(__backing_stringA: (ILocalStorageLinkDecoratedVariable<string> | undefined))

  get __backing_stringA(): (ILocalStorageLinkDecoratedVariable<string> | undefined)
  set __options_has_stringA(__options_has_stringA: (boolean | undefined))
  
  get __options_has_stringA(): (boolean | undefined)
  set booleanA(booleanA: (boolean | undefined))

  get booleanA(): (boolean | undefined)
  set __backing_booleanA(__backing_booleanA: (ILocalStorageLinkDecoratedVariable<boolean> | undefined))

  get __backing_booleanA(): (ILocalStorageLinkDecoratedVariable<boolean> | undefined)
  set __options_has_booleanA(__options_has_booleanA: (boolean | undefined))
  
  get __options_has_booleanA(): (boolean | undefined)
  
}

class __EntryWrapper extends EntryPoint {
  @memo() public entry(): void {
    MyStateSample._invoke(@memo() ((instance: MyStateSample): void => {
      instance.applyAttributesFinish();
      return;
    }), undefined, undefined, undefined, undefined);
  }

  public constructor() {}

}
`;

function testLocalStorageLinkTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test LocalStorageLink primitive type transform',
    [localStorageLinkTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testLocalStorageLinkTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
