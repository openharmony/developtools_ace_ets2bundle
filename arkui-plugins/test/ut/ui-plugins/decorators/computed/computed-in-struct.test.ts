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
import { dumpGetterSetter, GetSetDumper } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/computed';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'computed-in-struct.ets'),
];

const pluginTester = new PluginTester('test @Computed decorator in @ComponentV2 struct', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ButtonAttribute as ButtonAttribute } from "arkui.component.button";

import { ButtonImpl as ButtonImpl } from "arkui.component.button";

import { DividerAttribute as DividerAttribute } from "arkui.component.divider";

import { DividerImpl as DividerImpl } from "arkui.component.divider";

import { Memo as Memo } from "arkui.incremental.annotation";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { ComponentV2 as ComponentV2, Column as Column, Button as Button, Divider as Divider, Text as Text } from "@ohos.arkui.component";

import { Computed as Computed, Local as Local } from "@ohos.arkui.stateManagement";

function main() {}


@ComponentV2() final struct Index extends CustomComponentV2<Index, __Options_Index> {
  public __initializeStruct(initializers: (__Options_Index | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__computed_fullName.setOwner(this);
    this.__backing_firstName = STATE_MGMT_FACTORY.makeLocal<string>(this, "firstName", "Li");
    this.__backing_lastName = STATE_MGMT_FACTORY.makeLocal<string>(this, "lastName", "Hua");
    this.__backing_age = ((({let gensym___216981064 = initializers;
    (((gensym___216981064) == (null)) ? undefined : gensym___216981064.age)})) ?? (20));
  }
  
  public __updateStruct(initializers: (__Options_Index | undefined)): void {}
  
  private __backing_firstName?: ILocalDecoratedVariable<string>;
  
  public get firstName(): string {
    return this.__backing_firstName!.get();
  }
  
  public set firstName(value: string) {
    this.__backing_firstName!.set(value);
  }
  
  private __backing_lastName?: ILocalDecoratedVariable<string>;
  
  public get lastName(): string {
    return this.__backing_lastName!.get();
  }
  
  public set lastName(value: string) {
    this.__backing_lastName!.set(value);
  }
  
  private __backing_age?: number;
  
  public get age(): number {
    return (this.__backing_age as number);
  }
  
  public set age(value: number) {
    this.__backing_age = value;
  }
  
  private __computed_fullName = STATE_MGMT_FACTORY.makeComputed<string>((() => {
    console.info("---------Computed----------");
    return ((((((this.firstName) + (" "))) + (this.lastName))) + (this.age));
  }), "fullName");
  
  @Computed() public get fullName(): string {
    return this.__computed_fullName!.get();
  }
  
  @Memo() public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @Memo() (() => {
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(((((this.lastName) + (" "))) + (this.firstName)), undefined).applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(((((this.lastName) + (" "))) + (this.firstName)), undefined).applyAttributesFinish();
        return;
      }), undefined);
      DividerImpl(@Memo() ((instance: DividerAttribute): void => {
        instance.setDividerOptions().applyAttributesFinish();
        return;
      }));
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(this.fullName, undefined).applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(this.fullName, undefined).applyAttributesFinish();
        return;
      }), undefined);
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("changed lastName", undefined).onClick(((e) => {
          this.lastName += "a";
        })).applyAttributesFinish();
        return;
      }), undefined);
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("changed age", undefined).onClick(((e) => {
          (this.age++);
        })).applyAttributesFinish();
        return;
      }), undefined);
    }));
  }
  
  public constructor() {}
  
}

@ComponentV2() export interface __Options_Index {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'firstName', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_firstName', '(ILocalDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_firstName', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'lastName', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_lastName', '(ILocalDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_lastName', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'age', '(number | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_age', '(boolean | undefined)')}
  
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @Computed decorator in @ComponentV2 struct',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
