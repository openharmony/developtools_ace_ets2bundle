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
import { recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const STATE_DIR_PATH: string = 'decorators/monitor';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'monitor-in-struct.ets'),
];

const pluginTester = new PluginTester('test @Monitor decorator in struct transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { IMonitorDecoratedVariable as IMonitorDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { memo as memo } from "arkui.stateManagement.runtime";

import { ButtonAttribute as ButtonAttribute } from "arkui.component.button";

import { ButtonImpl as ButtonImpl } from "arkui.component.button";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { ComponentV2 as ComponentV2, Column as Column, Button as Button } from "@ohos.arkui.component";

import { Monitor as Monitor, Local as Local, IMonitor as IMonitor } from "@ohos.arkui.stateManagement";

function main() {}



@ComponentV2() final struct Index extends CustomComponentV2<Index, __Options_Index> {
  public __initializeStruct(initializers: (__Options_Index | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_message = STATE_MGMT_FACTORY.makeLocal<string>(this, "message", "Hello World");
    this.__backing_name = STATE_MGMT_FACTORY.makeLocal<string>(this, "name", "Tom");
    this.__backing_age = STATE_MGMT_FACTORY.makeLocal<number>(this, "age", 24);
    this.__monitor_onStrChange = STATE_MGMT_FACTORY.makeMonitor([{
      path: "message",
      valueCallback: ((): Any => {
        return this.message;
      }),
    }, {
      path: "name",
      valueCallback: ((): Any => {
        return this.name;
      }),
    }], ((_m: IMonitor) => {
      this.onStrChange(_m);
    }));
  }
  
  public __updateStruct(initializers: (__Options_Index | undefined)): void {}
  
  private __backing_message?: ILocalDecoratedVariable<string>;
  
  public get message(): string {
    return this.__backing_message!.get();
  }
  
  public set message(value: string) {
    this.__backing_message!.set(value);
  }
  
  private __backing_name?: ILocalDecoratedVariable<string>;
  
  public get name(): string {
    return this.__backing_name!.get();
  }
  
  public set name(value: string) {
    this.__backing_name!.set(value);
  }
  
  private __backing_age?: ILocalDecoratedVariable<number>;
  
  public get age(): number {
    return this.__backing_age!.get();
  }
  
  public set age(value: number) {
    this.__backing_age!.set(value);
  }
  
  private __monitor_onStrChange: (IMonitorDecoratedVariable | undefined);
  
  @Monitor({value:["message", "name"]}) public onStrChange(monitor: IMonitor) {
    monitor.dirty.forEach(((path: string) => {
      console.info(\`\${path} changed from \${({let gensym%%_43 = monitor.value(path);
      (((gensym%%_43) == (null)) ? undefined : gensym%%_43.before)})} to \${({let gensym%%_44 = monitor.value(path);
      (((gensym%%_44) == (null)) ? undefined : gensym%%_44.now)})}\`);
    }));
  }
  
  @memo() public build() {
    ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @memo() (() => {
      ButtonImpl(@memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("change string", undefined).onClick(((e) => {
          this.message += "!";
          this.name = "Jack";
        })).applyAttributesFinish();
        return;
      }), undefined);
    }));
  }
  
  public constructor() {}
  
}

@ComponentV2() export interface __Options_Index {
  set message(message: (string | undefined))
  
  get message(): (string | undefined)
  set __backing_message(__backing_message: (ILocalDecoratedVariable<string> | undefined))
  
  get __backing_message(): (ILocalDecoratedVariable<string> | undefined)
  set __options_has_message(__options_has_message: (boolean | undefined))
  
  get __options_has_message(): (boolean | undefined)
  set name(name: (string | undefined))
  
  get name(): (string | undefined)
  set __backing_name(__backing_name: (ILocalDecoratedVariable<string> | undefined))
  
  get __backing_name(): (ILocalDecoratedVariable<string> | undefined)
  set __options_has_name(__options_has_name: (boolean | undefined))
  
  get __options_has_name(): (boolean | undefined)
  set age(age: (number | undefined))
  
  get age(): (number | undefined)
  set __backing_age(__backing_age: (ILocalDecoratedVariable<number> | undefined))
  
  get __backing_age(): (ILocalDecoratedVariable<number> | undefined)
  set __options_has_age(__options_has_age: (boolean | undefined))
  
  get __options_has_age(): (boolean | undefined)
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @Monitor decorator in struct transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
