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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'monitor-before-state-variable.ets'),
];

const pluginTester = new PluginTester('test @Monitor method declared before state variables', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.stateManagement.runtime";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { IMonitorDecoratedVariable as IMonitorDecoratedVariable } from "arkui.stateManagement.decorator";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { ComponentV2 as ComponentV2 } from "@ohos.arkui.component";

import { Monitor as Monitor, Local as Local, IMonitor as IMonitor } from "@ohos.arkui.stateManagement";

function main() {}

@ComponentV2() final struct Index extends CustomComponentV2<Index, __Options_Index> {
  public __initializeStruct(initializers: (__Options_Index | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_message = STATE_MGMT_FACTORY.makeLocal<string>(this, "message", "Hello World");
    this.__backing_name = STATE_MGMT_FACTORY.makeLocal<string>(this, "name", "Tom");
    this.__backing_age = STATE_MGMT_FACTORY.makeLocal<number>(this, "age", 24);
    this.__monitor_onStrChange2 = STATE_MGMT_FACTORY.makeMonitor([{
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
      this.onStrChange2(_m);
    }), this);
    this.__monitor_onStrChange3 = STATE_MGMT_FACTORY.makeMonitor([{
      path: "name",
      valueCallback: ((): Any => {
        return this.name;
      }),
    }], ((_m: IMonitor) => {
      this.onStrChange3(_m);
    }), this);
  }

  public __updateStruct(initializers: (__Options_Index | undefined)): void {}

  private __monitor_onStrChange1: (IMonitorDecoratedVariable | undefined);

  private __monitor_onStrChange2: (IMonitorDecoratedVariable | undefined);

  private __monitor_onStrChange3: (IMonitorDecoratedVariable | undefined);

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

  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: Index)=> void), initializers: ((()=> __Options_Index) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<Index, __Options_Index>(style, ((): Index => {
      return new Index();
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Index, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): Index {
    throw new Error("Declare interface");
  }

  @Monitor({value:["message", "name"]}) public onStrChange1(monitor: IMonitor) {
    monitor.dirty.forEach(((path: string) => {
      console.info(\`\${path} changed from \${({let gensym%%_74 = monitor.value(path);
      (((gensym%%_74) == (null)) ? undefined : gensym%%_74.before)})} to \${({let gensym%%_75 = monitor.value(path);
      (((gensym%%_75) == (null)) ? undefined : gensym%%_75.now)})}\`);
    }));
  }

  @Monitor({value:["message", "name"]}) public onStrChange2(monitor: IMonitor) {
    monitor.dirty.forEach(((path: string) => {
      console.info(\`\${path} changed from \${({let gensym%%_76 = monitor.value(path);
      (((gensym%%_76) == (null)) ? undefined : gensym%%_76.before)})} to \${({let gensym%%_77 = monitor.value(path);
      (((gensym%%_77) == (null)) ? undefined : gensym%%_77.now)})}\`);
    }));
  }

  @Monitor({value:["name"]}) public onStrChange3(monitor: IMonitor) {
    monitor.dirty.forEach(((path: string) => {
      console.info(\`\${path} changed from \${({let gensym%%_78 = monitor.value(path);
      (((gensym%%_78) == (null)) ? undefined : gensym%%_78.before)})} to \${({let gensym%%_79 = monitor.value(path);
      (((gensym%%_79) == (null)) ? undefined : gensym%%_79.now)})}\`);
    }));
  }

  @memo() public build() {}

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
    'test @Monitor method declared before state variables',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
