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

const OBSERVED_DIR_PATH: string = 'decorators/observedv2-trace';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, OBSERVED_DIR_PATH, 'base-observedv2-trace.ets'),
];

const observedTrackTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test basic @ObservedV2 and @Trace case', buildConfig);

const expectedScript: string = `
import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { UIUtils as UIUtils } from "arkui.stateManagement.utils";

import { IMutableStateMeta as IMutableStateMeta } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { ObservedV2 as ObservedV2, Trace as Trace } from "@ohos.arkui.stateManagement";

function main() {}

@ObservedV2() class CC implements IObservedObject, ISubscribedWatches {
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

  public propB: number = 1;

  @JSONRename({newName:"traceB"}) private __backing_traceB: number = 2;

  @JSONStringifyIgnore() private __meta_traceB: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();

  public get traceB(): number {
    this.conditionalAddRef(this.__meta_traceB);
    return UIUtils.makeObserved(this.__backing_traceB);
  }

  public set traceB(newValue: number) {
    if (((this.__backing_traceB) !== (newValue))) {
      this.__backing_traceB = newValue;
      this.__meta_traceB.fireChange();
      this.executeOnSubscribingWatches("traceB");
    }
  }

  public constructor() {}

}

@ObservedV2() class DD implements IObservedObject, ISubscribedWatches {
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

  public propB: number = 1;

  @JSONRename({newName:"traceE"}) private __backing_traceE: number = 2;

  @JSONStringifyIgnore() private __meta_traceE: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();

  @JSONRename({newName:"tracef"}) private __backing_tracef: number = 2;

  @JSONStringifyIgnore() private __meta_tracef: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();

  public vv: string;

  public get traceE(): number {
    this.conditionalAddRef(this.__meta_traceE);
    return UIUtils.makeObserved(this.__backing_traceE);
  }

  public set traceE(newValue: number) {
    if (((this.__backing_traceE) !== (newValue))) {
      this.__backing_traceE = newValue;
      this.__meta_traceE.fireChange();
      this.executeOnSubscribingWatches("traceE");
    }
  }

  public get tracef(): number {
    this.conditionalAddRef(this.__meta_tracef);
    return UIUtils.makeObserved(this.__backing_tracef);
  }

  public set tracef(newValue: number) {
    if (((this.__backing_tracef) !== (newValue))) {
      this.__backing_tracef = newValue;
      this.__meta_tracef.fireChange();
      this.executeOnSubscribingWatches("tracef");
    }
  }

  public constructor(vv1: string) {
    this.vv = vv1;
  }

}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test basic @ObservedV2 and @Trace case',
    [observedTrackTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
