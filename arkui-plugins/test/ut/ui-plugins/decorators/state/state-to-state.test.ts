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

const STATE_DIR_PATH: string = 'decorators/state';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'state-to-state.ets'),
];

const pluginTester = new PluginTester('test @State decorated variables passing', buildConfig);

const parsedTransform: Plugins = {
    name: 'state-to-state',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { memo as memo } from "arkui.stateManagement.runtime";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, Column as Column, Text as Text } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement";

function main() {}

class Per {
  public str: string;

  public constructor(str: string) {
    this.str = str;
  }

}

@Component() final struct Parent extends CustomComponent<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_parentVar1 = STATE_MGMT_FACTORY.makeState<Per>(this, "parentVar1", ((({let gensym___247315634 = initializers;
    (((gensym___247315634) == (null)) ? undefined : gensym___247315634.parentVar1)})) ?? (new Per("hello"))));
  }

  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}

  private __backing_parentVar1?: IStateDecoratedVariable<Per>;

  public get parentVar1(): Per {
    return this.__backing_parentVar1!.get();
  }

  public set parentVar1(value: Per) {
    this.__backing_parentVar1!.set(value);
  }

  @memo() public build() {
    ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @memo() (() => {
      Child._instantiateImpl(undefined, (() => {
        return new Child();
      }), {
        childVar1: this.parentVar1,
        __options_has_childVar1: true,
      }, undefined, undefined);
    }));
  }

  public constructor() {}

}

@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_childVar1 = STATE_MGMT_FACTORY.makeState<Per>(this, "childVar1", ((({let gensym___218939886 = initializers;
    (((gensym___218939886) == (null)) ? undefined : gensym___218939886.childVar1)})) ?? (new Per("ccc"))));
  }

  public __updateStruct(initializers: (__Options_Child | undefined)): void {}

  private __backing_childVar1?: IStateDecoratedVariable<Per>;

  public get childVar1(): Per {
    return this.__backing_childVar1!.get();
  }

  public set childVar1(value: Per) {
    this.__backing_childVar1!.set(value);
  }

  @memo() public build() {
    TextImpl(@memo() ((instance: TextAttribute): void => {
      instance.setTextOptions(this.childVar1.str, undefined).applyAttributesFinish();
      return;
    }), undefined);
  }

  public constructor() {}
  
}

@Component() export interface __Options_Parent {
  set parentVar1(parentVar1: (Per | undefined))

  get parentVar1(): (Per | undefined)
  set __backing_parentVar1(__backing_parentVar1: (IStateDecoratedVariable<Per> | undefined))

  get __backing_parentVar1(): (IStateDecoratedVariable<Per> | undefined)
  set __options_has_parentVar1(__options_has_parentVar1: (boolean | undefined))
  
  get __options_has_parentVar1(): (boolean | undefined)
  
}

@Component() export interface __Options_Child {
  set childVar1(childVar1: (Per | undefined))

  get childVar1(): (Per | undefined)
  set __backing_childVar1(__backing_childVar1: (IStateDecoratedVariable<Per> | undefined))

  get __backing_childVar1(): (IStateDecoratedVariable<Per> | undefined)
  set __options_has_childVar1(__options_has_childVar1: (boolean | undefined))
  
  get __options_has_childVar1(): (boolean | undefined)
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @State decorated variables passing',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
