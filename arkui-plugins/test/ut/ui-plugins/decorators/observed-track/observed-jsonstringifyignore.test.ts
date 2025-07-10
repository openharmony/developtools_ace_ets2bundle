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

const OBSERVED_DIR_PATH: string = 'decorators/observed-track';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, OBSERVED_DIR_PATH, 'observed-jsonstringifyignore.ets'),
];

const observedJsonStringifyIgnoreTransform: Plugins = {
    name: 'observedJsonStringifyIgnore',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test observed class transform with JsonStringifyIgnore annotation', buildConfig);

const expectedScript: string = `

import { memo as memo } from "arkui.stateManagement.runtime";

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { OBSERVE as OBSERVE } from "arkui.stateManagement.decorator";

import { IMutableStateMeta as IMutableStateMeta } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component } from "@ohos.arkui.component";

import { Observed as Observed, Track as Track } from "@ohos.arkui.stateManagement";

function main() {}



@Retention({policy:"SOURCE"}) @interface TestDecor {}

@Observed() class testJSONStringifyIgnore implements IObservedObject, ISubscribedWatches {
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
  
  @JSONStringifyIgnore() private ____V1RenderId: RenderIdType = 0;
  
  public setV1RenderId(renderId: RenderIdType): void {
    this.____V1RenderId = renderId;
  }
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    if (OBSERVE.shouldAddRef(this.____V1RenderId)) {
      meta.addRef();
    }
  }
  
  public var1: number = 1;
  
  @JSONRename({newName:"var2"}) private __backing_var2: number = 2;
  
  @JSONStringifyIgnore() private __meta_var2: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  @JSONStringifyIgnore() public var3: number = 3;
  
  @TestDecor() public var4: number = 4;
  
  @JSONStringifyIgnore() private __backing_var5: number = 5;
  
  @JSONStringifyIgnore() private __meta_var5: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  @JSONStringifyIgnore() @TestDecor() public var6: number = 6;
  
  @TestDecor() @JSONRename({newName:"var7"}) private __backing_var7: number = 7;
  
  @JSONStringifyIgnore() private __meta_var7: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  @JSONStringifyIgnore() @TestDecor() private __backing_var8: number = 8;
  
  @JSONStringifyIgnore() private __meta_var8: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  public constructor() {}
  
  public get var2(): number {
    this.conditionalAddRef(this.__meta_var2);
    return this.__backing_var2;
  }
  
  public set var2(newValue: number) {
    if (((this.__backing_var2) !== (newValue))) {
      this.__backing_var2 = newValue;
      this.__meta_var2.fireChange();
      this.executeOnSubscribingWatches("var2");
    }
  }
  
  public get var5(): number {
    this.conditionalAddRef(this.__meta_var5);
    return this.__backing_var5;
  }
  
  public set var5(newValue: number) {
    if (((this.__backing_var5) !== (newValue))) {
      this.__backing_var5 = newValue;
      this.__meta_var5.fireChange();
      this.executeOnSubscribingWatches("var5");
    }
  }
  
  public get var7(): number {
    this.conditionalAddRef(this.__meta_var7);
    return this.__backing_var7;
  }
  
  public set var7(newValue: number) {
    if (((this.__backing_var7) !== (newValue))) {
      this.__backing_var7 = newValue;
      this.__meta_var7.fireChange();
      this.executeOnSubscribingWatches("var7");
    }
  }
  
  public get var8(): number {
    this.conditionalAddRef(this.__meta_var8);
    return this.__backing_var8;
  }
  
  public set var8(newValue: number) {
    if (((this.__backing_var8) !== (newValue))) {
      this.__backing_var8 = newValue;
      this.__meta_var8.fireChange();
      this.executeOnSubscribingWatches("var8");
    }
  }
  
}

@Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @memo() content: ((()=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}
  
  @memo() public build() {}
  
  private constructor() {}
  
}

@Component() export interface __Options_MyStateSample {
  
}
`;

function testObservedJsonStringifyIgnoreTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test observed only transform',
    [observedJsonStringifyIgnoreTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testObservedJsonStringifyIgnoreTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
