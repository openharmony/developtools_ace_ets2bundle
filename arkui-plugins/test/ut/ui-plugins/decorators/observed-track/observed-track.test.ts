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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, OBSERVED_DIR_PATH, 'observed-track.ets'),
];

const observedTrackTransform: Plugins = {
    name: 'observedTrack',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test observed with track transform', buildConfig);

const expectedScript: string = `

import { Memo as Memo } from "arkui.incremental.annotation";

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

@Observed() class B implements IObservedObject, ISubscribedWatches {
  @JSONStringifyIgnore() @JSONParseIgnore() private subscribedWatches: ISubscribedWatches = STATE_MGMT_FACTORY.makeSubscribedWatches();
  
  public addWatchSubscriber(watchId: WatchIdType): void {
    this.subscribedWatches.addWatchSubscriber(watchId);
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    return this.subscribedWatches.removeWatchSubscriber(watchId);
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    this.subscribedWatches.executeOnSubscribingWatches(propertyName);
  }
  
  @JSONStringifyIgnore() @JSONParseIgnore() private ____V1RenderId: RenderIdType = 0;
  
  public setV1RenderId(renderId: RenderIdType): void {
    this.____V1RenderId = renderId;
  }
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    if (OBSERVE.shouldAddRef(this.____V1RenderId)) {
      meta.addRef();
    }
  }
  
  public propB: number = 1;
  
  @JSONRename({newName:"trackB"}) private __backing_trackB: number = 2;
  
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_trackB: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  @JSONRename({newName:"newProp"}) private __backing_newProp?: boolean;
  
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_newProp: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  public constructor(newProp: boolean) {
    this.newProp = newProp;
  }
  
  public get trackB(): number {
    this.conditionalAddRef(this.__meta_trackB);
    return this.__backing_trackB;
  }
  
  public set trackB(newValue: number) {
    if (((this.__backing_trackB) !== (newValue))) {
      this.__backing_trackB = newValue;
      this.__meta_trackB.fireChange();
      this.executeOnSubscribingWatches("trackB");
    }
  }
  
  public get newProp(): boolean {
    this.conditionalAddRef(this.__meta_newProp);
    return (this.__backing_newProp as boolean);
  }
  
  public set newProp(newValue: boolean) {
    if (((this.__backing_newProp) !== (newValue))) {
      this.__backing_newProp = newValue;
      this.__meta_newProp.fireChange();
      this.executeOnSubscribingWatches("newProp");
    }
  }
  
}

@Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: ((()=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}
  
  @Memo() public build() {}
  
  public constructor() {}
  
}

@Component() export interface __Options_MyStateSample {
  
}
`;

function testObservedOnlyTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test observed with track transform',
    [observedTrackTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testObservedOnlyTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
