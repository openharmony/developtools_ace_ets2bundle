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
import { mockBuildConfig, mockProjectConfig } from '../../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../../utils/path-config';
import { parseDumpSrc } from '../../../../utils/parse-string';
import { beforeUINoRecheck, recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, dumpAnnotation } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins, ProjectConfig } from '../../../../../common/plugin-context';

const STATE_DIR_PATH: string = 'decorators/monitor';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'monitor-no-params.ets'),
];

const projectConfig: ProjectConfig = mockProjectConfig();
projectConfig.compatibleSdkVersion = 24;

const pluginTester = new PluginTester('test @Monitor decorator with compatibleSdkVersion >= 24 and no parameters', buildConfig, projectConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { IMonitor as IMonitor } from "arkui.stateManagement.decorator";

import { IMonitorDecoratedVariable as IMonitorDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ButtonAttribute as ButtonAttribute } from "arkui.component.button";

import { ButtonImpl as ButtonImpl } from "arkui.component.button";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { ComponentV2 as ComponentV2, Column as Column, Button as Button } from "@ohos.arkui.component";

import { Monitor as Monitor, Local as Local, IMonitor as IMonitor } from "@ohos.arkui.stateManagement";

function main() {}

@ComponentV2() final struct Index extends CustomComponentV2<Index, __Options_Index> {
  public __initializeStruct(initializers: (__Options_Index | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_message = STATE_MGMT_FACTORY.makeLocal<string>(this, "message", "Hello World");
    this.__backing_name = STATE_MGMT_FACTORY.makeLocal<string>(this, "name", "Tom");
    this.__monitor_onStrChange = STATE_MGMT_FACTORY.makeMonitor([({
      path: "message",
      valueCallback: ((): Any => {
        return this.message;
      }),
    } as IMonitorPathInfo), ({
      path: "name",
      valueCallback: ((): Any => {
        return this.name;
      }),
    } as IMonitorPathInfo)], ((_m: IMonitor) => {
      this.onStrChange();
    }), ({
      owner: this,
      functionName: "onStrChange",
    } as MakeMonitorOptions));
    this.__monitor_onMsgChange = STATE_MGMT_FACTORY.makeMonitor([({
      path: "message",
      valueCallback: ((): Any => {
        return this.message;
      }),
    } as IMonitorPathInfo)], ((_m: IMonitor) => {
      this.onMsgChange();
    }), ({
      owner: this,
      functionName: "onMsgChange",
    } as MakeMonitorOptions));
  }

  public __updateStruct(initializers: (__Options_Index | undefined)): void {}

  public resetStateVarsOnReuse(initializers: (__Options_Index | undefined)): void {
    this.__backing_message!.resetOnReuse("Hello World");
    this.__backing_name!.resetOnReuse("Tom");
    this.__monitor_onStrChange!.resetOnReuse();
    this.__monitor_onMsgChange!.resetOnReuse();
  }

  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: Index)=> void) | undefined), initializers: ((()=> __Options_Index) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<Index, __Options_Index>(style, ((): Index => {
      return new Index();
    }), initializers, reuseId, content, {
      sClass: Class.from<Index>(),
    });
  }

  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Index, storage?: LocalStorage, @Builder() content?: (()=> void)): Index {
    throw new Error("Declare interface");
  }

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

  private __monitor_onStrChange: (IMonitorDecoratedVariable | undefined);

  @Monitor({value:["message", "name"]}) 
  public onStrChange() {
    console.info("some string changed");
  }

  private __monitor_onMsgChange: (IMonitorDecoratedVariable | undefined);

  @Monitor({value:["message"]}) 
  public onMsgChange() {
    console.info("message changed");
  }

  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("change string", undefined).onClick(((e) => {
          this.message += "!";
          this.name = "Jack";
        }));
        instance.applyAttributesFinish();
        return;
      }), undefined);
    }));
  }

  public constructor() {}
  static {
  }
}

@ComponentV2() export interface __Options_Index {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'message', '(string | undefined)', [dumpAnnotation('Local')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_message', '(ILocalDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_message', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'name', '(string | undefined)', [dumpAnnotation('Local')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_name', '(ILocalDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_name', '(boolean | undefined)')}

}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @Monitor decorator with no parameters',
    [parsedTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
