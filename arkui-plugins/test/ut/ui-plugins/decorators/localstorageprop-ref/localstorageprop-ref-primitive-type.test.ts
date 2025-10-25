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

const STORAGEPROP_DIR_PATH: string = 'decorators/localstorageprop-ref';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STORAGEPROP_DIR_PATH, 'localstorageprop-ref-primitive-type.ets'),
];

const storagePropTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test @LocalStoragePropRef primitive type transform', buildConfig);

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { ILocalStoragePropRefDecoratedVariable as ILocalStoragePropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Component as Component } from "@ohos.arkui.component";

import { LocalStoragePropRef as LocalStoragePropRef } from "@ohos.arkui.stateManagement";

function main() {}

@Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_numB = STATE_MGMT_FACTORY.makeLocalStoragePropRef<number>(this, "Prop1", "numB", 43)
    this.__backing_stringB = STATE_MGMT_FACTORY.makeLocalStoragePropRef<string>(this, "Prop2", "stringB", "BB")
    this.__backing_booleanB = STATE_MGMT_FACTORY.makeLocalStoragePropRef<boolean>(this, "Prop3", "booleanB", false)
    this.__backing_undefinedB = STATE_MGMT_FACTORY.makeLocalStoragePropRef<undefined>(this, "Prop4", "undefinedB", undefined)
    this.__backing_nullB = STATE_MGMT_FACTORY.makeLocalStoragePropRef<null>(this, "Prop5", "nullB", null)
  }

  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}

  private __backing_numB?: ILocalStoragePropRefDecoratedVariable<number>;

  public get numB(): number {
    return this.__backing_numB!.get();
  }

  public set numB(value: number) {
    this.__backing_numB!.set(value);
  }

  private __backing_stringB?: ILocalStoragePropRefDecoratedVariable<string>;

  public get stringB(): string {
    return this.__backing_stringB!.get();
  }

  public set stringB(value: string) {
    this.__backing_stringB!.set(value);
  }

  private __backing_booleanB?: ILocalStoragePropRefDecoratedVariable<boolean>;

  public get booleanB(): boolean {
    return this.__backing_booleanB!.get();
  }

  public set booleanB(value: boolean) {
    this.__backing_booleanB!.set(value);
  }

  private __backing_undefinedB?: ILocalStoragePropRefDecoratedVariable<undefined>;

  public get undefinedB(): undefined {
    return this.__backing_undefinedB!.get();
  }

  public set undefinedB(value: undefined) {
    this.__backing_undefinedB!.set(value);
  }

  private __backing_nullB?: ILocalStoragePropRefDecoratedVariable<null>;

  public get nullB(): null {
    return this.__backing_nullB!.get();
  }

  public set nullB(value: null) {
    this.__backing_nullB!.set(value);
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

  ${dumpConstructor()}
}

@Component() export interface __Options_MyStateSample {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'numB', '(number | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_numB', '(ILocalStoragePropRefDecoratedVariable<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_numB', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'stringB', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_stringB', '(ILocalStoragePropRefDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_stringB', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'booleanB', '(boolean | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_booleanB', '(ILocalStoragePropRefDecoratedVariable<boolean> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_booleanB', '(boolean | undefined)')}
  
  ${dumpGetterSetter(GetSetDumper.BOTH, 'undefinedB', '(undefined | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_undefinedB', '(ILocalStoragePropRefDecoratedVariable<undefined> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_undefinedB', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'nullB', '(null | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_nullB', '(ILocalStoragePropRefDecoratedVariable<null> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_nullB', '(boolean | undefined)')}
  
}
`;

function testStoragePropTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @LocalStoragePropRef primitive type transform',
    [storagePropTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testStoragePropTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
