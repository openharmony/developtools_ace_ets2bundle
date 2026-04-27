/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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
import { recheck, collectNoRecheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/lifecycle';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'active-inactive-multi.ets'),
];

const pluginTester = new PluginTester('test multiple @ComponentActive and @ComponentInactive decorator transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedCheckedScript: string = `

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { UIUtils as UIUtils } from "arkui.stateManagement.utils";

import { Memo as Memo } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Entry as Entry, Component as Component } from "@ohos.arkui.component";

import { ComponentActive as ComponentActive, ComponentInactive as ComponentInactive } from "@kit.ArkUI";

function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/lifecycle/active-inactive-multi",
  pageFullPath: "test/demo/mock/decorators/lifecycle/active-inactive-multi",
  integratedHsp: "false",
} as NavInterface));
@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() final struct Index extends CustomComponent<Index, __Options_Index> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_Index | undefined), @Memo() content: ((()=> void) | undefined)): void {
    const __onActive1__Internal = this.onActive1;
    const __onActive2__Internal = this.onActive2;
    const __onInactive1__Internal = this.onInactive1;
    const __onInactive2__Internal = this.onInactive2;
    UIUtils.getCustomComponentContext(this).registerActiveAndInactiveCallback((() => {
      __onActive1__Internal.unsafeCall();
      __onActive2__Internal.unsafeCall();
    }), (() => {
      __onInactive1__Internal.unsafeCall();
      __onInactive2__Internal.unsafeCall();
    }));
  }
  
  public __updateStruct(initializers: (__Options_Index | undefined)): void {}
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: Index)=> void) | undefined), initializers: ((()=> __Options_Index) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Index, __Options_Index>(style, ((): Index => {
      return new Index(false, ({let gensym___203542966 = storage;
      (((gensym___203542966) == (null)) ? undefined : gensym___203542966())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Index, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): Index {
    throw new Error("Declare interface");
  }
  
  @ComponentActive() 
  public onActive1() {
    console.info("active1");
  }
  
  @ComponentActive() 
  public onActive2() {
    console.info("active2");
  }
  
  @ComponentInactive() 
  public onInactive1() {
    console.info("inactive1");
  }
  
  @ComponentInactive() 
  public onInactive2() {
    console.info("inactive2");
  }
  
  @Memo() 
  public build() {}
  
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  
  static {
    
  }
}

class __EntryWrapper extends EntryPoint {
  @Memo() 
  public entry(): void {
    Index._invoke(undefined, undefined, undefined, undefined, undefined);
  }
  
  public constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() export interface __Options_Index {
  
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test multiple @ComponentActive and @ComponentInactive decorator transformation',
    [parsedTransform, collectNoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);