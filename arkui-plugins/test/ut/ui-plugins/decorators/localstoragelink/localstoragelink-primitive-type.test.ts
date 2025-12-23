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
import { dumpGetterSetter, GetSetDumper, dumpConstructor } from '../../../../utils/simplify-dump';
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
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { ILocalStorageLinkDecoratedVariable as ILocalStorageLinkDecoratedVariable } from "arkui.stateManagement.decorator";

import { Memo as Memo } from "arkui.incremental.annotation";

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

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
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: ((()=> void) | undefined)): void {
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

  @MemoIntrinsic() 
  public static _invoke(style: @Memo() ((instance: MyStateSample)=> void), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___203542966 = storage;
      (((gensym___203542966) == (null)) ? undefined : gensym___203542966())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): MyStateSample {
    throw new Error("Declare interface");
  }
  
  @Memo() 
  public build() {}
  
  ${dumpConstructor()}

}

class __EntryWrapper extends EntryPoint {
  @Memo() 
  public entry(): void {
    MyStateSample._invoke(@Memo() ((instance: MyStateSample): void => {
    instance.applyAttributesFinish();
    return;
    }), undefined, undefined, undefined, undefined);
  }
  
  public constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() export interface __Options_MyStateSample {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'numA', '(number | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_numA', '(ILocalStorageLinkDecoratedVariable<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_numA', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'stringA', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_stringA', '(ILocalStorageLinkDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_stringA', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'booleanA', '(boolean | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_booleanA', '(ILocalStorageLinkDecoratedVariable<boolean> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_booleanA', '(boolean | undefined)')}
  
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
