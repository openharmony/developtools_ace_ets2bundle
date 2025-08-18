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
import { memo as memo } from "arkui.stateManagement.runtime";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { ILocalStoragePropRefDecoratedVariable as ILocalStoragePropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

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
  
  @memo() public build() {}
  
  public constructor() {}
  
}

@Component() export interface __Options_MyStateSample {
  set numB(numB: (number | undefined))
  
  get numB(): (number | undefined)
  set __backing_numB(__backing_numB: (ILocalStoragePropRefDecoratedVariable<number> | undefined))
  
  get __backing_numB(): (ILocalStoragePropRefDecoratedVariable<number> | undefined)
  set stringB(stringB: (string | undefined))
  
  get stringB(): (string | undefined)
  set __backing_stringB(__backing_stringB: (ILocalStoragePropRefDecoratedVariable<string> | undefined))
  
  get __backing_stringB(): (ILocalStoragePropRefDecoratedVariable<string> | undefined)
  set booleanB(booleanB: (boolean | undefined))
  
  get booleanB(): (boolean | undefined)
  set __backing_booleanB(__backing_booleanB: (ILocalStoragePropRefDecoratedVariable<boolean> | undefined))
  
  get __backing_booleanB(): (ILocalStoragePropRefDecoratedVariable<boolean> | undefined)
  set undefinedB(undefinedB: (undefined | undefined))
  
  get undefinedB(): (undefined | undefined)
  set __backing_undefinedB(__backing_undefinedB: (ILocalStoragePropRefDecoratedVariable<undefined> | undefined))
  
  get __backing_undefinedB(): (ILocalStoragePropRefDecoratedVariable<undefined> | undefined)
  set nullB(nullB: (null | undefined))
  
  get nullB(): (null | undefined)
  set __backing_nullB(__backing_nullB: (ILocalStoragePropRefDecoratedVariable<null> | undefined))
  
  get __backing_nullB(): (ILocalStoragePropRefDecoratedVariable<null> | undefined)
  
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
