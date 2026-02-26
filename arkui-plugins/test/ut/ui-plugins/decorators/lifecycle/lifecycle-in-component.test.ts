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
import { recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, ignoreNewLines } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/lifecycle';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'lifecycle-in-component.ets'),
];

const pluginTester = new PluginTester('test lifecycle decorator transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedParsedScript: string = `

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Entry as Entry, Component as Component } from "@ohos.arkui.component";

import { ComponentInit as ComponentInit, ComponentAppear as ComponentAppear, ComponentBuilt as ComponentBuilt, ComponentReuse as ComponentReuse, ComponentRecycle as ComponentRecycle, ComponentDisappear as ComponentDisappear, ReuseObject as ReuseObject } from "@kit.ArkUI";

@Entry() @Component() final struct Index extends CustomComponent<Index, __Options_Index> implements PageLifeCycle {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Index, storage?: LocalStorage, @Builder() content?: (()=> void)): Index {
    throw new Error("Declare interface");
  }
  
  @ComponentInit() 
  public myInit() {}
  
  @ComponentAppear() 
  public myAppear() {}
  
  @ComponentBuilt() 
  public myBuilt() {}
  
  @ComponentReuse() 
  public myReuse(params: ReuseObject) {}
  
  @ComponentRecycle() 
  public myRecycle() {}
  
  @ComponentDisappear() 
  public myDisappear() {}
  
  public build() {}
  
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  
}

class __EntryWrapper extends EntryPoint {
  public entry(): void {
    Index();
  }
  
  public constructor() {}
  
}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/lifecycle/lifecycle-in-component",
  pageFullPath: "test/demo/mock/decorators/lifecycle/lifecycle-in-component",
  integratedHsp: "false",
} as NavInterface))
@Entry() @Component() export interface __Options_Index {
  
}
`;

const expectedCheckedScript: string = `

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { ReuseObject as ReuseObject } from "arkui.component.customComponent";

import { UIUtils as UIUtils } from "arkui.stateManagement.utils";

import { CustomComponentLifecycleObserver as CustomComponentLifecycleObserver } from "arkui.component.customComponent";

import { Memo as Memo } from "arkui.incremental.annotation";

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Entry as Entry, Component as Component } from "@ohos.arkui.component";

import { ComponentInit as ComponentInit, ComponentAppear as ComponentAppear, ComponentBuilt as ComponentBuilt, ComponentReuse as ComponentReuse, ComponentRecycle as ComponentRecycle, ComponentDisappear as ComponentDisappear, ReuseObject as ReuseObject } from "@kit.ArkUI";

function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/lifecycle/lifecycle-in-component",
  pageFullPath: "test/demo/mock/decorators/lifecycle/lifecycle-in-component",
  integratedHsp: "false",
} as NavInterface));
@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() final struct Index extends CustomComponent<Index, __Options_Index> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_Index | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.myInit();
    const __myAppear__Internal = this.myAppear;
    const __myBuilt__Internal = this.myBuilt;
    const __myReuse__Internal = this.myReuse;
    const __myRecycle__Internal = this.myRecycle;
    const __myDisappear__Internal = this.myDisappear;
    UIUtils.getLifecycle(this).addObserver(({
      aboutToAppear: (() => {
        __myAppear__Internal.unsafeCall();
      }),
      onDidBuild: (() => {
        __myBuilt__Internal.unsafeCall();
      }),
      aboutToDisappear: (() => {
        __myDisappear__Internal.unsafeCall();
      }),
      aboutToReuse: ((params: (ReuseObject | undefined)) => {
        __myReuse__Internal.unsafeCall(params);
      }),
      aboutToRecycle: (() => {
        __myRecycle__Internal.unsafeCall();
      }),
    } as CustomComponentLifecycleObserver));
  }
  
  public __updateStruct(initializers: (__Options_Index | undefined)): void {}
  
  @ComponentInit() 
  public myInit() {}
  
  @ComponentAppear() 
  public myAppear() {}
  
  @ComponentBuilt() 
  public myBuilt() {}
  
  @ComponentReuse() 
  public myReuse(params: ReuseObject) {}
  
  @ComponentRecycle() 
  public myRecycle() {}
  
  @ComponentDisappear() 
  public myDisappear() {}
  
  @MemoIntrinsic() 
  public static _invoke(style: @Memo() ((instance: Index)=> void), initializers: ((()=> __Options_Index) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Index, __Options_Index>(style, ((): Index => {
      return new Index(false, ({let gensym___203542966 = storage;
      (((gensym___203542966) == (null)) ? undefined : gensym___203542966())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Index, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): Index {
    throw new Error("Declare interface");
  }
  
  @ComponentInit() 
  public myInit() {}
  
  @ComponentAppear() 
  public myAppear() {}
  
  @ComponentBuilt() 
  public myBuilt() {}
  
  @ComponentReuse() 
  public myReuse(params: ReuseObject) {}
  
  @ComponentRecycle() 
  public myRecycle() {}
  
  @ComponentDisappear() 
  public myDisappear() {}
  
  @Memo() 
  public build() {}
  
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  
}

class __EntryWrapper extends EntryPoint {
  @Memo() 
  public entry(): void {
    Index._invoke(@Memo() ((instance: Index): void => {
      instance.applyAttributesFinish();
      return;
    }), undefined, undefined, undefined, undefined);
  }
  
  public constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() export interface __Options_Index {
  
}
`;

function testParsedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedParsedScript));
}

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test lifecycle decorator transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'parsed': [testParsedTransformer],
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
