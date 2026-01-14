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
import { dumpConstructor } from '../../../utils/simplify-dump';

const COMPONENT_DIR_PATH: string = 'component';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, COMPONENT_DIR_PATH, 'nav-no-lambda.ets'),
];

const pluginTester = new PluginTester('test basic navigation and navDestination transformation with no trailing lambda', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedCheckedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { NavigationAttribute as NavigationAttribute } from "arkui.component.navigation";

import { NavigationImpl as NavigationImpl } from "arkui.component.navigation";

import { NavDestinationAttribute as NavDestinationAttribute } from "arkui.component.navDestination";

import { NavDestinationImpl as NavDestinationImpl } from "arkui.component.navDestination";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component, Column as Column, NavDestination as NavDestination, Navigation as Navigation, NavPathStack as NavPathStack } from "@ohos.arkui.component";

function main() {}

@Component() final struct NavDestinationStruct extends CustomComponent<NavDestinationStruct, __Options_NavDestinationStruct> {
  public __initializeStruct(initializers: (__Options_NavDestinationStruct | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_pathStack = ((({let gensym___1107384 = initializers;
    (((gensym___1107384) == (null)) ? undefined : gensym___1107384.pathStack)})) ?? (new NavPathStack()));
  }
  
  public __updateStruct(initializers: (__Options_NavDestinationStruct | undefined)): void {}
  
  private __backing_pathStack?: NavPathStack;
  
  public get pathStack(): NavPathStack {
    return (this.__backing_pathStack as NavPathStack);
  }
  
  public set pathStack(value: NavPathStack) {
    this.__backing_pathStack = value;
  }
  @MemoIntrinsic() 
  public static _invoke(style: @Memo() ((instance: NavDestinationStruct)=> void), initializers: ((()=> __Options_NavDestinationStruct) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<NavDestinationStruct, __Options_NavDestinationStruct>(style, ((): NavDestinationStruct => {
      return new NavDestinationStruct(false, ({let gensym___149025070 = storage;
      (((gensym___149025070) == (null)) ? undefined : gensym___149025070())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_NavDestinationStruct, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): NavDestinationStruct {
    throw new Error("Declare interface");
  }
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      NavDestinationImpl(@Memo() ((instance: NavDestinationAttribute): void => {
        instance.setNavDestinationOptions({
          moduleName: "entry",
          pagePath: "mock/component/nav-no-lambda",
        }).width(80);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      NavigationImpl(@Memo() ((instance: NavigationAttribute): void => {
        instance.setNavigationOptions(this.pathStack, {
          moduleName: "entry",
          pagePath: "mock/component/nav-no-lambda",
          isUserCreateStack: true,
        }).width(80);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      NavigationImpl(@Memo() ((instance: NavigationAttribute): void => {
        instance.setNavigationOptions(undefined, {
          moduleName: "entry",
          pagePath: "mock/component/nav-no-lambda",
          isUserCreateStack: false,
        }).width(80);
        instance.applyAttributesFinish();
        return;
      }), undefined);
    }));
  }
  
  ${dumpConstructor()}
  
}

@Component() export interface __Options_NavDestinationStruct {
  get pathStack(): (NavPathStack | undefined) {
  return undefined;
  }
  
  set pathStack(pathStack: (NavPathStack | undefined)) {
  throw new InvalidStoreAccessError();
  }
  get __options_has_pathStack(): (boolean | undefined) {
  return undefined;
  }
  
  set __options_has_pathStack(__options_has_pathStack: (boolean | undefined)) {
  throw new InvalidStoreAccessError();
  }
  
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test basic navigation and navDestination transformation with no trailing lambda',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);