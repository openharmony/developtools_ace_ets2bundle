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

const XCOMPONENT_DIR_PATH: string = 'xcomponent';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, XCOMPONENT_DIR_PATH, 'xcomponent-basic.ets'),
];

const xcomponentTransform: Plugins = {
    name: 'xcomponent',
    parsed: uiTransform().parsed,
};

const pluginTester = new PluginTester('test basic XComponent transform', buildConfig);

const expectedScript: string = `
import { memo as memo } from "arkui.stateManagement.runtime";
import { UIFlexAttribute as UIFlexAttribute } from "arkui.component.flex";
import { EntryPoint as EntryPoint } from "arkui.UserView";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Component as Component, Flex as Flex, XComponent as XComponent, FlexDirection as FlexDirection, XComponentType as XComponentType, Entry as Entry, XComponentController as XComponentController, ItemAlign as ItemAlign, FlexAlign as FlexAlign, XComponentParameter as XComponentParameter } from "@ohos.arkui.component";

function main() {}



@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component({freezeWhenInactive:false}) final class Index extends CustomComponent<Index, __Options_Index> {
  public __initializeStruct(initializers: __Options_Index | undefined, @memo() content: (()=> void) | undefined): void {
    this.__backing_myXComponentController = ((({let gensym___221905990 = initializers;
    (((gensym___221905990) == (null)) ? undefined : gensym___221905990.myXComponentController)})) ?? (new XComponentController()));
  }
  
  public __updateStruct(initializers: __Options_Index | undefined): void {}
  
  private __backing_myXComponentController?: XComponentController;
  
  public get myXComponentController(): XComponentController {
    return (this.__backing_myXComponentController as XComponentController);
  }
  
  public set myXComponentController(value: XComponentController) {
    this.__backing_myXComponentController = value;
  }
  
  @memo() public _build(@memo() style: ((instance: Index)=> Index) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_Index | undefined): void {
    Flex(@memo() ((instance: UIFlexAttribute): void => {
      instance.width("100%").height("100%");
      return;
    }), {
      direction: FlexDirection.Column,
      alignItems: ItemAlign.Center,
      justifyContent: FlexAlign.Start,
    }, (() => {
      XComponent(undefined, ({
        id: "xComponentId",
        type: XComponentType.TEXTURE,
        libraryname: "nativerender",
        controller: this.myXComponentController,
      } as XComponentParameter), "");
    }));
  }
  
  private constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component({freezeWhenInactive:false}) export interface __Options_Index {
  set myXComponentController(myXComponentController: XComponentController | undefined)
  
  get myXComponentController(): XComponentController | undefined
  
}

class __EntryWrapper extends EntryPoint {
  @memo() public entry(): void {
    Index._instantiateImpl(undefined, (() => {
      return new Index();
    }));
  }
  
  public constructor() {}
  
}
`;

function testXComponentTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test basic XComponent transform',
    [xcomponentTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testXComponentTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
