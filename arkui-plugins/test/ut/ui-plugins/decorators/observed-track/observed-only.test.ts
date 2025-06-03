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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, OBSERVED_DIR_PATH, 'observed-only.ets'),
];

const observedTrackTransform: Plugins = {
    name: 'observedTrack',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test observed only transform', buildConfig);

const expectedScript: string = `
import { memo as memo } from "arkui.stateManagement.runtime";
import { IObservedObject as IObservedObject } from "@ohos.arkui.stateManagement";
import { MutableStateMeta as MutableStateMeta } from "@ohos.arkui.stateManagement";
import { int32 as int32 } from "@koalaui.runtime.common";
import { WatchIdType as WatchIdType } from "@ohos.arkui.stateManagement";
import { SubscribedWatches as SubscribedWatches } from "@ohos.arkui.stateManagement";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Component as Component } from "@ohos.arkui.component";
import { Observed as Observed } from "@ohos.arkui.stateManagement";

function main() {}



@Observed() class A implements IObservedObject {
  private subscribedWatches: SubscribedWatches = new SubscribedWatches();
  
  public addWatchSubscriber(watchId: WatchIdType): void {
    this.subscribedWatches.addWatchSubscriber(watchId);
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    return this.subscribedWatches.removeWatchSubscriber(watchId);
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    this.subscribedWatches.executeOnSubscribingWatches(propertyName);
  }
  
  public _permissibleAddRefDepth: int32 = 0;
  
  private __meta: MutableStateMeta = new MutableStateMeta("@Observe properties (no @Track)");
  
  private __backing_propA: number = 1;
  
  private __backing_trackA: number = 2;
  
  public constructor() {}
  
  public get propA(): number {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta.addRef();
    }
    return this.__backing_propA;
  }
  
  public set propA(newValue: number) {
    if (((this.__backing_propA) !== (newValue))) {
      this.__backing_propA = newValue;
    this.__meta.fireChange();
    this.executeOnSubscribingWatches("propA");
    }
  }
  
  public get trackA(): number {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta.addRef();
    }
    return this.__backing_trackA;
  }
  
  public set trackA(newValue: number) {
    if (((this.__backing_trackA) !== (newValue))) {
      this.__backing_trackA = newValue;
    this.__meta.fireChange();
    this.executeOnSubscribingWatches("trackA");
    }
  }
  
}

@Component({freezeWhenInactive:false}) final class MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: __Options_MyStateSample | undefined, @memo() content: (()=> void) | undefined): void {}
  
  public __updateStruct(initializers: __Options_MyStateSample | undefined): void {}
  
  @memo() public _build(@memo() style: ((instance: MyStateSample)=> MyStateSample) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_MyStateSample | undefined): void {}
  
  private constructor() {}
  
}

@Component({freezeWhenInactive:false}) export interface __Options_MyStateSample {
  
}

`;

function testObservedOnlyTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test observed only transform',
    [observedTrackTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testObservedOnlyTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
