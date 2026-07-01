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
import { beforeUINoRecheck, recheck, uiNoRecheck, collectNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const STATE_DIR_PATH: string = 'decorators/custom-env';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'custom-env-support-watch.ets'),
];

const pluginTester = new PluginTester('test @CustomEnv with @Watch decorated variables transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedParsedScript: string = `

import { ComponentBuilder } from "arkui.component.builder";

import { LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { Builder } from "arkui.component.builder";

import { CustomComponent } from "arkui.component.customComponent";

import { ReusePoolOwnership } from "arkui.component.customComponent";

import { EntryPoint } from "arkui.component.customComponent";

import { PageLifeCycle } from "arkui.component.customComponent";

import { NavInterface } from "arkui.component.customComponent";

import { Component, Entry } from "@ohos.arkui.component";

import { CustomEnv, CustomEnvKey, Watch } from "@ohos.arkui.stateManagement";

const myKey = CustomEnvKey.create<string>()
@Entry() @Component() final struct Index extends CustomComponent<Index, __Options_Index> implements PageLifeCycle {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Index, storage?: LocalStorage, @Builder() content?: (()=> void)): Index {
    throw new Error("Declare interface");
  }
  
  @CustomEnv({value:"myKey"}) @Watch({value:"onChange"}) public readonly str: string = "watch test";
  public onChange(object: string) {
    console.log((("onChange: ") + (object)));
  }
  
  public build() {}
  
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  
  public static __resolveDecoratorSymbols(): void {
    const __customEnv_str: CustomEnvKey<string> = myKey;
  }
  
}

class __EntryWrapper extends EntryPoint {
  public entry(): void {
    Index();
  }
  
  public static RegisterNamedRouter(routerName: string, instance: EntryPoint, param: NavInterface): void {
    EntryPoint.RegisterNamedRouter(routerName, instance, param);
  }
  
  public constructor() {}
  
}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/custom-env/custom-env-support-watch",
  pageFullPath: "test/demo/mock/decorators/custom-env/custom-env-support-watch",
  integratedHsp: "false",
} as NavInterface))
@Entry() @Component() class __Options_Index {
  @CustomEnv({value:"myKey"}) @Watch({value:"onChange"}) public str?: string;
  @CustomEnv({value:"myKey"}) public __backing_str?: string;
  public __options_has_str?: boolean;
  public constructor() {}
  
}

`;

const expectedCheckedScript: string = `

import { __memo_context_type, __memo_id_type } from "arkui.incremental.runtime.state";

import { STATE_MGMT_FACTORY } from "arkui.component.customComponent";

import { ICustomEnvDecoratedVariable } from "arkui.stateManagement.decorator";

import { Memo } from "arkui.incremental.annotation";

import { MemoIntrinsic } from "arkui.incremental.annotation";

import { Memo } from "arkui.incremental.annotation";

import { ComponentBuilder } from "arkui.component.builder";

import { LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { Builder } from "arkui.component.builder";

import { CustomComponent } from "arkui.component.customComponent";

import { ReusePoolOwnership } from "arkui.component.customComponent";

import { EntryPoint } from "arkui.component.customComponent";

import { PageLifeCycle } from "arkui.component.customComponent";

import { NavInterface } from "arkui.component.customComponent";

import { Component, Entry } from "@ohos.arkui.component";

import { CustomEnv, CustomEnvKey, Watch } from "@ohos.arkui.stateManagement";

const myKey = CustomEnvKey.create<string>();
function main() {}
__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/custom-env/custom-env-support-watch",
  pageFullPath: "test/demo/mock/decorators/custom-env/custom-env-support-watch",
  integratedHsp: "false",
} as NavInterface));
@Entry() @Component() final struct Index extends CustomComponent<Index, __Options_Index> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_Index | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_str = STATE_MGMT_FACTORY.makeCustomEnv<string>(this, myKey, "str", "watch test", {
      watchFunc: ((_: string): void => {
        this.onChange(_);
      }),
    });
  }
  
  public __updateStruct(initializers: (__Options_Index | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_Index | undefined)): void {}
  
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
  
  private __backing_str?: ICustomEnvDecoratedVariable<string>;
  public get str(): string {
    return this.__backing_str!.get();
  }
  
  public onChange(object: string) {
    console.log((("onChange: ") + (object)));
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
  
  public static RegisterNamedRouter(routerName: string, instance: EntryPoint, param: NavInterface): void {
    EntryPoint.RegisterNamedRouter(routerName, instance, param);
  }
  
  public constructor() {}
}

@Entry() @Component() class __Options_Index {
  @CustomEnv({value:"myKey"}) @Watch({value:"onChange"}) public str?: string;
  public __backing_str?: ICustomEnvDecoratedVariable<string>;
  public __options_has_str?: boolean;
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
    'test @CustomEnv with @Watch decorated variables transformation',
    [parsedTransform, collectNoRecheck, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'parsed': [testParsedTransformer],
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);