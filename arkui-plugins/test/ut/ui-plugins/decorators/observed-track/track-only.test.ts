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

const OBSERVED_DIR_PATH: string = 'decorators/observed-track';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, OBSERVED_DIR_PATH, 'track-only.ets'),
];

const observedTrackTransform: Plugins = {
    name: 'observedTrack',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test track only transform', buildConfig);

const expectedScript: string = `
import { __memo_id_type as __memo_id_type } from "@ohos.arkui.stateManagement";

import { __memo_context_type as __memo_context_type } from "@ohos.arkui.stateManagement";

import { memo as memo } from "@ohos.arkui.stateManagement";

import { SubscribedWatches as SubscribedWatches } from "@ohos.arkui.stateManagement";

import { WatchIdType as WatchIdType } from "@ohos.arkui.stateManagement";

import { int32 as int32 } from "@koalaui.runtime.common";

import { IObservedObject as IObservedObject } from "@ohos.arkui.stateManagement";

import { setObservationDepth as setObservationDepth } from "@ohos.arkui.stateManagement";

import { BackingValue as BackingValue } from "@ohos.arkui.stateManagement";

import { MutableStateMeta as MutableStateMeta } from "@ohos.arkui.stateManagement";

import { CustomComponent as CustomComponent } from "@ohos.arkui.component";

import { Component as Component } from "@ohos.arkui.component";

import { Track as Track } from "@ohos.arkui.stateManagement";

function main() {}



class C implements IObservedObject {
  private subscribedWatches: SubscribedWatches = new SubscribedWatches();
  
  public addWatchSubscriber(watchId: WatchIdType): void {
    (this).subscribedWatches.addWatchSubscriber(watchId);
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    return (this).subscribedWatches.removeWatchSubscriber(watchId);
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    (this).subscribedWatches.executeOnSubscribingWatches(propertyName);
  }
  
  public _permissibleAddRefDepth: int32 = 0;
  
  public propC: number = 1;
  
  private __backing_trackC: number = 2;
  
  private __meta_trackC: MutableStateMeta = new MutableStateMeta("@Track");
  
  public constructor() {}
  
  public get trackC(): number {
    if ((((this)._permissibleAddRefDepth) > (0))) {
      (this).__meta_trackC.addRef();
    }
    return (this).__backing_trackC;
  }
  
  public set trackC(newValue: number) {
    if ((((this).__backing_trackC) !== (newValue))) {
      (this).__backing_trackC = newValue;
    (this).__meta_trackC.fireChange();
    (this).executeOnSubscribingWatches("trackC");
    }
  }
  
}

@Component({freezeWhenInactive:false}) final class MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: __Options_MyStateSample | undefined, @memo() content: (()=> void) | undefined): void {}
  
  public __updateStruct(initializers: __Options_MyStateSample | undefined): void {}
  
  @memo() public _build(@memo() style: ((instance: MyStateSample)=> MyStateSample) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_MyStateSample | undefined): void {}
  
  public constructor() {}
  
}

interface __Options_MyStateSample {
  
}

`;

function testObservedOnlyTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test track only transform',
    [observedTrackTransform, uiNoRecheck],
    {
        checked: [testObservedOnlyTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
