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

const OBSERVED_DIR_PATH: string = 'decorators/once';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, OBSERVED_DIR_PATH, 'once-with-require.ets'),
];

const observedTrackTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test @Once Decorator with @Require', buildConfig);

const expectedParsedScript: string = `
import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { ComponentV2 as ComponentV2, Column as Column, Text as Text, Button as Button } from "@ohos.arkui.component";

import { Param as Param, Once as Once, ObservedV2 as ObservedV2, Trace as Trace, Require as Require, Local as Local } from "@ohos.arkui.stateManagement";

@ObservedV2() class Info {
  @Trace() public name: string = "info";

  public constructor() {}

}

@ComponentV2() final struct Child extends CustomComponentV2<Child, __Options_Child> {
  @Param() @Once() public onceParamNum: number = 0;

  @Param() @Once() @Require() public onceParamInfo!: Info;

  public build() {
    Column(){
      Text(\`Child onceParamNum: \${this.onceParamNum}\`);
      Text(\`Child onceParamInfo: \${this.onceParamInfo.name}\`);
      Button("changeOnceParamNum").onClick(((e) => {
        (this.onceParamNum++);
      }));
    };
  }

  public constructor() {}

}

@ComponentV2() final struct Index extends CustomComponentV2<Index, __Options_Index> {
  @Local() public localNum: number = 10;

  @Local() public localInfo: Info = new Info();

  public build() {
    Column(){
      Text(\`Parent localNum: \${this.localNum}\`);
      Text(\`Parent localInfo: \${this.localInfo.name}\`);
      Child({
        onceParamNum: this.localNum,
        onceParamInfo: this.localInfo,
      });
    };
  }

  public constructor() {}

}

@ComponentV2() export interface __Options_Child {
  onceParamNum?: number;
  @Param() @Once() __backing_onceParamNum?: number;
  onceParamInfo?: Info;
  @Param() @Once() @Require() __backing_onceParamInfo?: Info;

}

@ComponentV2() export interface __Options_Index {
  localNum?: number;
  @Local() __backing_localNum?: number;
  localInfo?: Info;
  @Local() __backing_localInfo?: Info;

}
`;

const expectedCheckedScript: string = `
import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { IParamOnceDecoratedVariable as IParamOnceDecoratedVariable } from "arkui.stateManagement.decorator";

import { memo as memo } from "arkui.stateManagement.runtime";

import { ButtonAttribute as ButtonAttribute } from "arkui.component.button";

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { UIUtils as UIUtils } from "arkui.stateManagement.utils";

import { IMutableStateMeta as IMutableStateMeta } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { ComponentV2 as ComponentV2, Column as Column, Text as Text, Button as Button } from "@ohos.arkui.component";

import { Param as Param, Once as Once, ObservedV2 as ObservedV2, Trace as Trace, Require as Require, Local as Local } from "@ohos.arkui.stateManagement";

function main() {}



@ObservedV2() class Info implements IObservedObject, ISubscribedWatches {
  @JSONStringifyIgnore() private subscribedWatches: ISubscribedWatches = STATE_MGMT_FACTORY.makeSubscribedWatches();

  public addWatchSubscriber(watchId: WatchIdType): void {
    this.subscribedWatches.addWatchSubscriber(watchId);
  }

  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    return this.subscribedWatches.removeWatchSubscriber(watchId);
  }

  public executeOnSubscribingWatches(propertyName: string): void {
    this.subscribedWatches.executeOnSubscribingWatches(propertyName);
  }

  public setV1RenderId(renderId: RenderIdType): void {}

  protected conditionalAddRef(meta: IMutableStateMeta): void {
    meta.addRef();
  }

  @JSONRename({newName:"name"}) private __backing_name: string = "info";

  @JSONStringifyIgnore() private __meta_name: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();

  public get name(): string {
    this.conditionalAddRef(this.__meta_name);
    return UIUtils.makeObserved(this.__backing_name);
  }

  public set name(newValue: string) {
    if (((this.__backing_name) !== (newValue))) {
      this.__backing_name = newValue;
      this.__meta_name.fireChange();
      this.executeOnSubscribingWatches("name");
    }
  }

  public constructor() {}

}

@ComponentV2() final struct Child extends CustomComponentV2<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_onceParamNum = STATE_MGMT_FACTORY.makeParamOnce<number>(this, "onceParamNum", ((({let gensym___118919021 = initializers;
    (((gensym___118919021) == (null)) ? undefined : gensym___118919021.onceParamNum)})) ?? (0)));
    this.__backing_onceParamInfo = STATE_MGMT_FACTORY.makeParamOnce<Info>(this, "onceParamInfo", (initializers!.onceParamInfo as Info));
  }

  public __updateStruct(initializers: (__Options_Child | undefined)): void {}

  private __backing_onceParamNum?: IParamOnceDecoratedVariable<number>;

  public get onceParamNum(): number {
    return this.__backing_onceParamNum!.get();
  }

  public set onceParamNum(value: number) {
    this.__backing_onceParamNum!.set(value);
  }

  private __backing_onceParamInfo?: IParamOnceDecoratedVariable<Info>;

  public get onceParamInfo(): Info {
    return this.__backing_onceParamInfo!.get();
  }

  public set onceParamInfo(value: Info) {
    this.__backing_onceParamInfo!.set(value);
  }

  @memo() public build() {
    Column(undefined, undefined, @memo() (() => {
      Text(undefined, \`Child onceParamNum: \${this.onceParamNum}\`, undefined, undefined);
      Text(undefined, \`Child onceParamInfo: \${this.onceParamInfo.name}\`, undefined, undefined);
      Button(@memo() ((instance: ButtonAttribute): void => {
        instance.onClick(((e) => {
          (this.onceParamNum++);
        }));
        return;
      }), "changeOnceParamNum", undefined, undefined);
    }));
  }

  public constructor() {}

}

@ComponentV2() final struct Index extends CustomComponentV2<Index, __Options_Index> {
  public __initializeStruct(initializers: (__Options_Index | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_localNum = STATE_MGMT_FACTORY.makeLocal<number>(this, "localNum", 10);
    this.__backing_localInfo = STATE_MGMT_FACTORY.makeLocal<Info>(this, "localInfo", new Info());
  }

  public __updateStruct(initializers: (__Options_Index | undefined)): void {}

  private __backing_localNum?: ILocalDecoratedVariable<number>;

  public get localNum(): number {
    return this.__backing_localNum!.get();
  }

  public set localNum(value: number) {
    this.__backing_localNum!.set(value);
  }

  private __backing_localInfo?: ILocalDecoratedVariable<Info>;

  public get localInfo(): Info {
    return this.__backing_localInfo!.get();
  }

  public set localInfo(value: Info) {
    this.__backing_localInfo!.set(value);
  }

  @memo() public build() {
    Column(undefined, undefined, @memo() (() => {
      Text(undefined, \`Parent localNum: \${this.localNum}\`, undefined, undefined);
      Text(undefined, \`Parent localInfo: \${this.localInfo.name}\`, undefined, undefined);
      Child._instantiateImpl(undefined, (() => {
        return new Child();
      }), {
        onceParamNum: this.localNum,
        onceParamInfo: this.localInfo,
      }, undefined, undefined);
    }));
  }

  public constructor() {}

}

@ComponentV2() export interface __Options_Child {
  set onceParamNum(onceParamNum: (number | undefined))

  get onceParamNum(): (number | undefined)
  @Param() set __backing_onceParamNum(__backing_onceParamNum: (IParamOnceDecoratedVariable<number> | undefined))

  @Param() get __backing_onceParamNum(): (IParamOnceDecoratedVariable<number> | undefined)
  set onceParamInfo(onceParamInfo: (Info | undefined))

  get onceParamInfo(): (Info | undefined)
  @Param() @Require() set __backing_onceParamInfo(__backing_onceParamInfo: (IParamOnceDecoratedVariable<Info> | undefined))

  @Param() @Require() get __backing_onceParamInfo(): (IParamOnceDecoratedVariable<Info> | undefined)

}

@ComponentV2() export interface __Options_Index {
  set localNum(localNum: (number | undefined))

  get localNum(): (number | undefined)
  set __backing_localNum(__backing_localNum: (ILocalDecoratedVariable<number> | undefined))

  get __backing_localNum(): (ILocalDecoratedVariable<number> | undefined)
  set localInfo(localInfo: (Info | undefined))

  get localInfo(): (Info | undefined)
  set __backing_localInfo(__backing_localInfo: (ILocalDecoratedVariable<Info> | undefined))

  get __backing_localInfo(): (ILocalDecoratedVariable<Info> | undefined)

}
`;

function testParsedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedParsedScript));
}

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test @Once Decorator with @Require',
    [observedTrackTransform, uiNoRecheck, recheck],
    {
        'parsed': [testParsedTransformer],
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
