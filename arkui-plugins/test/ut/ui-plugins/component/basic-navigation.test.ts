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
import { PluginTester } from '../../../utils/plugin-tester';
import { mockBuildConfig } from '../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../utils/path-config';
import { parseDumpSrc } from '../../../utils/parse-string';
import { recheck, uiNoRecheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const COMPONENT_DIR_PATH: string = 'component';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, COMPONENT_DIR_PATH, 'basic-navigation.ets'),
];

const pluginTester = new PluginTester('test basic navigation transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedCheckedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { NavigationAttribute as NavigationAttribute } from "arkui.component.navigation";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ButtonAttribute as ButtonAttribute } from "arkui.component.button";

import { ButtonImpl as ButtonImpl } from "arkui.component.button";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { NavigationImpl as NavigationImpl } from "arkui.component.navigation";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Component as Component, Navigation as Navigation, NavPathStack as NavPathStack, Column as Column, Button as Button } from "@ohos.arkui.component";

function main() {}

@Component() final struct MyStateSample1 extends CustomComponent<MyStateSample1, __Options_MyStateSample1> {
  public __initializeStruct(initializers: (__Options_MyStateSample1 | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_pathStack = ((({let gensym___1107384 = initializers;
    (((gensym___1107384) == (null)) ? undefined : gensym___1107384.pathStack)})) ?? (new NavPathStack()));
  }
  
  public __updateStruct(initializers: (__Options_MyStateSample1 | undefined)): void {}
  
  private __backing_pathStack?: NavPathStack;
  
  public get pathStack(): NavPathStack {
    return (this.__backing_pathStack as NavPathStack);
  }
  
  public set pathStack(value: NavPathStack) {
    this.__backing_pathStack = value;
  }
  
  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: MyStateSample1)=> void), initializers: ((()=> __Options_MyStateSample1) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample1, __Options_MyStateSample1>(style, ((): MyStateSample1 => {
      return new MyStateSample1(false, ({let gensym___149025070 = storage;
      (((gensym___149025070) == (null)) ? undefined : gensym___149025070())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_MyStateSample1, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): MyStateSample1 {
    throw new Error("Declare interface");
  }
  @memo() public build() {
    NavigationImpl(@memo() ((instance: NavigationAttribute): void => {
      instance.setNavigationOptions(this.pathStack, {
        moduleName: "entry",
        pagePath: "mock/component/basic-navigation",
        isUserCreateStack: true,
      }).width(80).applyAttributesFinish();
      return;
    }), @memo() (() => {
      ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
        instance.setColumnOptions(undefined).applyAttributesFinish();
        return;
      }), @memo() (() => {
        ButtonImpl(@memo() ((instance: ButtonAttribute): void => {
          instance.setButtonOptions("abc", undefined).width(100).height(300).applyAttributesFinish();
          return;
        }), undefined);
      }));
    }));
  }
  
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

@Component() final struct MyStateSample2 extends CustomComponent<MyStateSample2, __Options_MyStateSample2> {
  public __initializeStruct(initializers: (__Options_MyStateSample2 | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_pathStack = ((({let gensym___199081302 = initializers;
    (((gensym___199081302) == (null)) ? undefined : gensym___199081302.pathStack)})) ?? (new NavPathStack()));
  }
  
  public __updateStruct(initializers: (__Options_MyStateSample2 | undefined)): void {}
  
  private __backing_pathStack?: NavPathStack;
  
  public get pathStack(): NavPathStack {
    return (this.__backing_pathStack as NavPathStack);
  }
  
  public set pathStack(value: NavPathStack) {
    this.__backing_pathStack = value;
  }

  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: MyStateSample2)=> void), initializers: ((()=> __Options_MyStateSample2) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample2, __Options_MyStateSample2>(style, ((): MyStateSample2 => {
      return new MyStateSample2(false, ({let gensym___17371929 = storage;
      (((gensym___17371929) == (null)) ? undefined : gensym___17371929())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_MyStateSample2, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): MyStateSample2 {
    throw new Error("Declare interface");
  }

  @memo() public build() {
    NavigationImpl(@memo() ((instance: NavigationAttribute): void => {
      instance.setNavigationOptions(undefined, {
        moduleName: "entry",
        pagePath: "mock/component/basic-navigation",
        isUserCreateStack: false,
      }).applyAttributesFinish();
      return;
    }), @memo() (() => {
      ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
        instance.setColumnOptions(undefined).applyAttributesFinish();
        return;
      }), @memo() (() => {
        ButtonImpl(@memo() ((instance: ButtonAttribute): void => {
          instance.setButtonOptions("abc", undefined).applyAttributesFinish();
          return;
        }), undefined);
      }));
    }));
  }
  
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

@Component() export interface __Options_MyStateSample1 {
  set pathStack(pathStack: (NavPathStack | undefined))
  
  get pathStack(): (NavPathStack | undefined)
  set __options_has_pathStack(__options_has_pathStack: (boolean | undefined))
  
  get __options_has_pathStack(): (boolean | undefined)
  
}

@Component() export interface __Options_MyStateSample2 {
  set pathStack(pathStack: (NavPathStack | undefined))
  
  get pathStack(): (NavPathStack | undefined)
  set __options_has_pathStack(__options_has_pathStack: (boolean | undefined))
  
  get __options_has_pathStack(): (boolean | undefined)
  
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test basic navigation transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);