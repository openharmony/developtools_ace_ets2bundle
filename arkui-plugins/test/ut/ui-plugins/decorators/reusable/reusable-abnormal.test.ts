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
import { uiNoRecheck, recheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, dumpConstructor } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const REUSABLE_DIR_PATH: string = 'decorators/reusable';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, REUSABLE_DIR_PATH, 'reusable-abnormal.ets'),
];

const reusableTransform: Plugins = {
    name: 'reusable',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test abnormal reusable', buildConfig);

const expectedScript: string = `

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { Memo as Memo } from "arkui.incremental.annotation";

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { ReuseOptions as ReuseOptions } from "arkui.component.common";

import { Text as Text, Column as Column, Component as Component, ComponentV2 as ComponentV2, Entry as Entry, Button as Button, ClickEvent as ClickEvent, Reusable as Reusable, ReusableV2 as ReusableV2 } from "@ohos.arkui.component";

function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/reusable/reusable-abnormal",
  pageFullPath: "test/demo/mock/decorators/reusable/reusable-abnormal",
  integratedHsp: "false",
} as NavInterface));
@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() final struct Index extends CustomComponent<Index, __Options_Index> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_Index | undefined), @Memo() content: ((()=> void) | undefined)): void {}
  
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
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      ComA._invoke(undefined, undefined, undefined, undefined, undefined);
      ComB._invoke(@Memo() ((instance: ComB): void => {
        instance.reuseId("ComB");
        instance.applyAttributesFinish();
        return;
      }), undefined, undefined, "ComB", undefined);
      ComC._invoke(@Memo() ((instance: ComC): void => {
        instance.reuse({
          reuseId: (() => {
            return "ComC";
          }),
        });
        instance.applyAttributesFinish();
        return;
      }), undefined, undefined, (() => {
        return "ComC";
      }), undefined);
    }));
  }
  
  ${dumpConstructor()}
  
}

@Component() final struct ComA extends CustomComponent<ComA, __Options_ComA> {
  public __initializeStruct(initializers: (__Options_ComA | undefined), @Memo() content: ((()=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_ComA | undefined)): void {}
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: ComA)=> void) | undefined), initializers: ((()=> __Options_ComA) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<ComA, __Options_ComA>(style, ((): ComA => {
      return new ComA(false, ({let gensym___149025070 = storage;
      (((gensym___149025070) == (null)) ? undefined : gensym___149025070())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ComA, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): ComA {
    throw new Error("Declare interface");
  }
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
  }
  
  ${dumpConstructor()}
  
}

@Reusable() @Component() final struct ComB extends CustomComponent<ComB, __Options_ComB> {
  public __initializeStruct(initializers: (__Options_ComB | undefined), @Memo() content: ((()=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_ComB | undefined)): void {}
  
  public override constructor __toRecord(params: Object): Record<string, Object> {
    const paramsCasted = (params as __Options_ComB);
    return {};
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: ComB)=> void) | undefined), initializers: ((()=> __Options_ComB) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<ComB, __Options_ComB>(style, ((): ComB => {
      return new ComB(false, ({let gensym___46528967 = storage;
      (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ComB, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): ComB {
    throw new Error("Declare interface");
  }
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
  }
  
  ${dumpConstructor()}
  
}

@ReusableV2() @ComponentV2() final struct ComC extends CustomComponentV2<ComC, __Options_ComC> {
  public __initializeStruct(initializers: (__Options_ComC | undefined), @Memo() content: ((()=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_ComC | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_ComC | undefined)): void {}
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: ComC)=> void) | undefined), initializers: ((()=> __Options_ComC) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<ComC, __Options_ComC>(style, ((): ComC => {
      return new ComC();
    }), initializers, reuseId, content, {
      sClass: Class.from<ComC>(),
    });
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ComC, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): ComC {
    throw new Error("Declare interface");
  }
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
  }
  
  public constructor() {}
  
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

@Component() export interface __Options_ComA {
  
}

@Reusable() @Component() export interface __Options_ComB {
  
}

@ReusableV2() @ComponentV2() export interface __Options_ComC {
  
}

`;

function testReusableTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test complex reusable',
    [reusableTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testReusableTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
