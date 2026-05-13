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
import { beforeUINoRecheck, recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, ignoreNewLines, dumpConstructor } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'builder-lambda';
const CUSTOM_INNER_COMPONENT_DIR_PATH: string = 'custom-inner-component';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(
        getRootPath(),
        MOCK_ENTRY_DIR_PATH,
        BUILDER_LAMBDA_DIR_PATH,
        CUSTOM_INNER_COMPONENT_DIR_PATH,
        'override-instantiate-call.ets'
    ),
];

const pluginTester = new PluginTester('test override instantiate call transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'override-instantiate-call',
    parsed: uiTransform().parsed,
};

const expectedParsedScript: string = `

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, Column as Column, Component as Component, Entry as Entry, Button as Button, ClickEvent as ClickEvent, ExtendableStack as ExtendableStack, StackOptions as StackOptions, Length as Length, LayoutPolicy as LayoutPolicy, Alignment as Alignment, ConstructorT as ConstructorT, CustomBuilder as CustomBuilder, ComponentBuilder as ComponentBuilder } from "@ohos.arkui.component";

class MyStack extends ExtendableStack {
  @ComponentBuilder() 
  public static $_instantiate<T extends ExtendableStack>(factory: ConstructorT<T>, aNumber: number, options?: StackOptions, content_?: CustomBuilder): T {
    throw new Error("cannot be here");
  }
  
  public setStackOptions(aNumber: number, options: StackOptions): this {
    super.setStackOptions(options);
    return this;
  }
  
  public override width(value: (Length | LayoutPolicy | undefined)): this {
    super.width(value);
    return this;
  }
  
  public height(value: Length): this {
    super.height(value);
    return this;
  }
  
  public newAttribute(value: int): this {
    return this;
  }
  
  public constructor() {}
  
}

@Entry() @Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> implements PageLifeCycle {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() content?: (()=> void)): MyStateSample {
    throw new Error("Declare interface");
  }
  
  public build() {
    MyStack(1, {
      alignContent: Alignment.Bottom,
    }){
      Text("Hello World");
    }.height("50%").width("100%").newAttribute(5);
  }
  
  ${dumpConstructor()}
  
}

class __EntryWrapper extends EntryPoint {
  public entry(): void {
    MyStateSample();
  }
  
  public constructor() {}
  
}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../builder-lambda/custom-inner-component/override-instantiate-call",
  pageFullPath: "test/demo/mock/builder-lambda/custom-inner-component/override-instantiate-call",
  integratedHsp: "false",
} as NavInterface))
@Entry() @Component() interface __Options_MyStateSample {
  
}
`;

function testParedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedParsedScript));
}

const expectedBuilderLambdaScript: string = `

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { Memo as Memo } from "arkui.incremental.annotation";

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, Column as Column, Component as Component, Entry as Entry, Button as Button, ClickEvent as ClickEvent, ExtendableStack as ExtendableStack, StackOptions as StackOptions, Length as Length, LayoutPolicy as LayoutPolicy, Alignment as Alignment, ConstructorT as ConstructorT, CustomBuilder as CustomBuilder, ComponentBuilder as ComponentBuilder } from "@ohos.arkui.component";

function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../builder-lambda/custom-inner-component/override-instantiate-call",
  pageFullPath: "test/demo/mock/builder-lambda/custom-inner-component/override-instantiate-call",
  integratedHsp: "false",
} as NavInterface));
class MyStack extends ExtendableStack {
  @ComponentBuilder() 
  public static $_instantiate<T extends ExtendableStack>(factory: ConstructorT<T>, aNumber: number, options?: StackOptions, content_?: CustomBuilder): T {
    throw new Error("cannot be here");
  }
  
  public setStackOptions(aNumber: number, options: StackOptions): this {
    super.setStackOptions(options);
    return this;
  }
  
  public override width(value: (Length | LayoutPolicy | undefined)): this {
    super.width(value);
    return this;
  }
  
  public height(value: Length): this {
    super.height(value);
    return this;
  }
  
  public newAttribute(value: int): this {
    return this;
  }
  
  public constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: ((()=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: MyStateSample)=> void) | undefined), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___203542966 = storage;
      (((gensym___203542966) == (null)) ? undefined : gensym___203542966())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() content?: (()=> void)): MyStateSample {
    throw new Error("Declare interface");
  }
  
  @Memo() 
  public build() {
    ExtendableStack._instantiateImpl(@Memo() ((instance: MyStack): void => {
      instance.setStackOptions(1, {
        alignContent: Alignment.Bottom,
      }).height("50%").width("100%").newAttribute(5);
      instance.applyAttributesFinish();
      return;
    }), (() => {
      return new MyStack();
    }), @Memo() (() => {
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions("Hello World", undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
    }));
  }
  
  ${dumpConstructor()}
  
  static {
    
  }
}

class __EntryWrapper extends EntryPoint {
  @Memo() 
  public entry(): void {
    MyStateSample._invoke(undefined, undefined, undefined, undefined, undefined);
  }
  
  public constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() interface __Options_MyStateSample {
  
}
`;

function testCustomComponentTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedBuilderLambdaScript));
}

pluginTester.run(
    'test override instantiate call transformation',
    [parsedTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        parsed: [testParedTransformer],
        'checked:ui-no-recheck': [testCustomComponentTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
