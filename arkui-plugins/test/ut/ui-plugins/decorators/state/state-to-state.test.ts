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
import { PluginTestContext, PluginTester } from '../../../../utils/plugin-tester';
import { BuildConfig, mockBuildConfig } from '../../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../../utils/path-config';
import { parseDumpSrc } from '../../../../utils/parse-string';
import { uiNoRecheck } from '../../../../utils/plugins';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/state';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'state-to-state.ets'),
];

const pluginTester = new PluginTester('test @State decorated variables passing', buildConfig);

const parsedTransform: Plugins = {
    name: 'state-to-state',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { __memo_id_type as __memo_id_type } from "arkui.stateManagement.runtime";
import { __memo_context_type as __memo_context_type } from "arkui.stateManagement.runtime";
import { memo as memo } from "arkui.stateManagement.runtime";
import { StateDecoratedVariable as StateDecoratedVariable } from "@ohos.arkui.stateManagement";
import { UITextAttribute as UITextAttribute } from "@ohos.arkui.component";
import { UIColumnAttribute as UIColumnAttribute } from "@ohos.arkui.component";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Component as Component, Column as Column, Text as Text } from "@ohos.arkui.component";
import { State as State } from "@ohos.arkui.stateManagement";

function main() {}

class Per {
  public str: string;
  public constructor(str: string) {
    (this).str = str;
  }
}

@Component({freezeWhenInactive:false}) final class Parent extends CustomComponent<Parent, __Options_Parent> {
  public __initializeStruct(initializers: __Options_Parent | undefined, @memo() content: (()=> void) | undefined): void {
    (this).__backing_parentVar1 = new StateDecoratedVariable<Per>("parentVar1", ((({let gensym___247315634 = initializers;
    (((gensym___247315634) == (null)) ? undefined : gensym___247315634.parentVar1)})) ?? (new Per("hello"))));
  }
  public __updateStruct(initializers: __Options_Parent | undefined): void {}
  private __backing_parentVar1?: StateDecoratedVariable<Per>;
  public get parentVar1(): Per {
    return (this).__backing_parentVar1!.get();
  }
  public set parentVar1(value: Per) {
    (this).__backing_parentVar1!.set(value);
  }
  @memo() public _build(@memo() style: ((instance: Parent)=> Parent) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_Parent | undefined): void {
    Column(undefined, undefined, (() => {
      Child._instantiateImpl(undefined, (() => {
        return new Child();
      }), ({
        childVar1: (this).parentVar1,
      } as __Options_Child), undefined, undefined);
    }));
  }
  public constructor() {}
}

@Component({freezeWhenInactive:false}) final class Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: __Options_Child | undefined, @memo() content: (()=> void) | undefined): void {
    (this).__backing_childVar1 = new StateDecoratedVariable<Per>("childVar1", ((({let gensym___218939886 = initializers;
    (((gensym___218939886) == (null)) ? undefined : gensym___218939886.childVar1)})) ?? (new Per("ccc"))));
  }
  public __updateStruct(initializers: __Options_Child | undefined): void {}
  private __backing_childVar1?: StateDecoratedVariable<Per>;
  public get childVar1(): Per {
    return (this).__backing_childVar1!.get();
  }
  public set childVar1(value: Per) {
    (this).__backing_childVar1!.set(value);
  }
  @memo() public _build(@memo() style: ((instance: Child)=> Child) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_Child | undefined): void {
    Text(undefined, (this).childVar1.str, undefined, undefined);
  }
  public constructor() {}
  
}

interface __Options_Parent {
  set parentVar1(parentVar1: Per | undefined)
  get parentVar1(): Per | undefined
  set __backing_parentVar1(__backing_parentVar1: StateDecoratedVariable<Per> | undefined)
  get __backing_parentVar1(): StateDecoratedVariable<Per> | undefined
}

interface __Options_Child {
  set childVar1(childVar1: Per | undefined)
  get childVar1(): Per | undefined
  set __backing_childVar1(__backing_childVar1: StateDecoratedVariable<Per> | undefined)
  get __backing_childVar1(): StateDecoratedVariable<Per> | undefined
}    
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @State decorated variables passing',
    [parsedTransform, uiNoRecheck],
    {
        checked: [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
