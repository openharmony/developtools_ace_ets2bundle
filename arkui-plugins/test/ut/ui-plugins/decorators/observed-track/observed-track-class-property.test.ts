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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, OBSERVED_DIR_PATH, 'observed-track-class-property.ets'),
];

const observedTrackTransform: Plugins = {
    name: 'observedTrack',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test observed track transform with class property', buildConfig);

const expectedScript: string = `
import { __memo_id_type as __memo_id_type } from "arkui.stateManagement.runtime";

import { __memo_context_type as __memo_context_type } from "arkui.stateManagement.runtime";

import { memo as memo } from "arkui.stateManagement.runtime";

import { SubscribedWatches as SubscribedWatches } from "@ohos.arkui.stateManagement";

import { WatchIdType as WatchIdType } from "@ohos.arkui.stateManagement";

import { int32 as int32 } from "@ohos.arkui.stateManagement";

import { IObservedObject as IObservedObject } from "@ohos.arkui.stateManagement";

import { setObservationDepth as setObservationDepth } from "@ohos.arkui.stateManagement";

import { BackingValue as BackingValue } from "@ohos.arkui.stateManagement";

import { MutableStateMeta as MutableStateMeta } from "@ohos.arkui.stateManagement";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component } from "@ohos.arkui.component";

import { Observed as Observed, Track as Track } from "@ohos.arkui.stateManagement";

function main() {}



class Info {
  public constructor() {}
  
}

class E implements IObservedObject {
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
  
  public propE: Info = new Info();
  
  private __backing_trackE: BackingValue<Info> = new BackingValue<Info>(new Info());
  
  private __meta_trackE: MutableStateMeta = new MutableStateMeta("@Track");
  
  public constructor() {}
  
  public get trackE(): Info {
    if ((((this)._permissibleAddRefDepth) > (0))) {
      (this).__meta_trackE.addRef();
    }
    setObservationDepth((this).__backing_trackE.value, (((this)._permissibleAddRefDepth) - (1)));
    return (this).__backing_trackE.value!;
  }
  
  public set trackE(newValue: Info) {
    if ((((this).__backing_trackE.value) !== (newValue))) {
      (this).__backing_trackE.value = newValue;
    (this).__meta_trackE.fireChange();
    (this).executeOnSubscribingWatches("trackE");
    }
  }
  
}

@Observed() class E1 implements IObservedObject {
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
  
  private __meta: MutableStateMeta = new MutableStateMeta("@Observe properties (no @Track)");
  
  private __backing_propE1: BackingValue<Info> = new BackingValue<Info>(new Info());
  
  private __backing_trackE1: BackingValue<Info> = new BackingValue<Info>(new Info());
  
  public constructor() {}
  
  public get propE1(): Info {
    if ((((this)._permissibleAddRefDepth) > (0))) {
      (this).__meta.addRef();
    }
    setObservationDepth((this).__backing_propE1.value, (((this)._permissibleAddRefDepth) - (1)));
    return (this).__backing_propE1.value!;
  }
  
  public set propE1(newValue: Info) {
    if ((((this).__backing_propE1.value) !== (newValue))) {
      (this).__backing_propE1.value = newValue;
    (this).__meta.fireChange();
    (this).executeOnSubscribingWatches("propE1");
    }
  }
  
  public get trackE1(): Info {
    if ((((this)._permissibleAddRefDepth) > (0))) {
      (this).__meta.addRef();
    }
    setObservationDepth((this).__backing_trackE1.value, (((this)._permissibleAddRefDepth) - (1)));
    return (this).__backing_trackE1.value!;
  }
  
  public set trackE1(newValue: Info) {
    if ((((this).__backing_trackE1.value) !== (newValue))) {
      (this).__backing_trackE1.value = newValue;
    (this).__meta.fireChange();
    (this).executeOnSubscribingWatches("trackE1");
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
    'test observed track transform with class property',
    [observedTrackTransform, uiNoRecheck],
    {
        checked: [testObservedOnlyTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
