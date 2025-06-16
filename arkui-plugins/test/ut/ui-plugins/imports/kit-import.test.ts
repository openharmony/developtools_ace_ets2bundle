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

const IMPORT_DIR_PATH: string = 'imports';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, IMPORT_DIR_PATH, 'kit-import.ets'),
];

const importParsed: Plugins = {
    name: 'import-parsed',
    parsed: uiTransform().parsed,
};

const pluginTester = new PluginTester('test import transform', buildConfig);

const expectedParsedScript: string = `

import { EntryPoint as EntryPoint } from "arkui.UserView";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Prop as Prop, Column as Column, Entry as Entry } from "@kit.ArkUI";

import { Text as Text, Component as Component, ClickEvent as ClickEvent } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement";

import { Button as Button } from "arkui.component.button";

import hilog from "@ohos.hilog";

@Entry() @Component() final struct A extends CustomComponent<A, __Options_A> {
  @State() public a: string = "str";
  
  @Prop() public b!: string;
  
  public build() {
    Column(){
      Button("button").onClick(((e: ClickEvent) => {}));
      Text("text").fontSize(20);
    };
  }
  
  public constructor() {}
  
}

@Entry() @Component() export interface __Options_A {
  a?: string;
  @State() __backing_a?: string;
  b?: string;
  @Prop() __backing_b?: string;
  
}

class __EntryWrapper extends EntryPoint {
  public entry(): void {
    A();
  }
  
  public constructor() {}
  
}
`;

const expectedCheckedScript: string = `

import { memo as memo } from "arkui.stateManagement.runtime";

import { IPropDecoratedVariable as IPropDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { ButtonAttribute as ButtonAttribute } from "arkui.component.button";

import { EntryPoint as EntryPoint } from "arkui.UserView";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Prop as Prop, Column as Column, Entry as Entry } from "@kit.ArkUI";

import { Text as Text, Component as Component, ClickEvent as ClickEvent } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement";

import { Button as Button } from "arkui.component.button";

import hilog from "@ohos.hilog";

function main() {}



@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component({freezeWhenInactive:false}) final struct A extends CustomComponent<A, __Options_A> {
  public __initializeStruct(initializers: __Options_A | undefined, @memo() content: (()=> void) | undefined): void {
    this.__backing_a = STATE_MGMT_FACTORY.makeState<string>(this, "a", ((({let gensym___94024326 = initializers;
    (((gensym___94024326) == (null)) ? undefined : gensym___94024326.a)})) ?? ("str")));
    this.__backing_b = STATE_MGMT_FACTORY.makeProp<string>(this, "b", (initializers!.b as string));
  }
  
  public __updateStruct(initializers: __Options_A | undefined): void {
    if (((({let gensym___81454501 = initializers;
    (((gensym___81454501) == (null)) ? undefined : gensym___81454501.b)})) !== (undefined))) {
      this.__backing_b!.update((initializers!.b as string));
    }
  }
  
  private __backing_a?: IStateDecoratedVariable<string>;
  
  public get a(): string {
    return this.__backing_a!.get();
  }
  
  public set a(value: string) {
    this.__backing_a!.set(value);
  }
  
  private __backing_b?: IPropDecoratedVariable<string>;
  
  public get b(): string {
    return this.__backing_b!.get();
  }
  
  public set b(value: string) {
    this.__backing_b!.set(value);
  }
  
  @memo() public _build(@memo() style: ((instance: A)=> A) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_A | undefined): void {
    Column(undefined, (() => {
      Button(((instance: ButtonAttribute): void => {
        instance.onClick(((e: ClickEvent) => {}));
        return;
      }), "button");
      Text(((instance: TextAttribute): void => {
        instance.fontSize(20);
        return;
      }), "text");
    }));
  }
  
  private constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component({freezeWhenInactive:false}) export interface __Options_A {
  set a(a: string | undefined)
  
  get a(): string | undefined
  set __backing_a(__backing_a: IStateDecoratedVariable<string> | undefined)
  
  get __backing_a(): IStateDecoratedVariable<string> | undefined
  set b(b: string | undefined)
  
  get b(): string | undefined
  set __backing_b(__backing_b: IPropDecoratedVariable<string> | undefined)
  
  get __backing_b(): IPropDecoratedVariable<string> | undefined
  
}

class __EntryWrapper extends EntryPoint {
  @memo() public entry(): void {
    A._instantiateImpl(undefined, (() => {
      return new A();
    }));
  }
  
  public constructor() {}
  
}
`;

function testImportParsed(this: PluginTestContext): void {
    expect(parseDumpSrc(this?.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedParsedScript));
}

function testImportChecked(this: PluginTestContext): void {
    expect(parseDumpSrc(this?.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test imports from different sources',
    [importParsed, uiNoRecheck, recheck],
    {
        parsed: [testImportParsed],
        'checked:ui-no-recheck': [testImportChecked],
    },
    {
        stopAfter: 'checked',
    }
);
