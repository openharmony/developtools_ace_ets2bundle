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
import { uiNoRecheck, recheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/computed';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'computed-in-observedv2-class.ets'),
];

const pluginTester = new PluginTester('test @Computed decorator in @ObservedV2 class', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { UIUtils as UIUtils } from "arkui.stateManagement.utils";

import { IMutableStateMeta as IMutableStateMeta } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { Computed as Computed, ObservedV2 as ObservedV2, Trace as Trace } from "@ohos.arkui.stateManagement";

function main() {}

@ObservedV2() class Name implements IObservedObject, ISubscribedWatches {
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

  public setV1RenderId(renderId: RenderIdType): void {}

  protected conditionalAddRef(meta: IMutableStateMeta): void {
    meta.addRef();
  }

  @JSONRename({newName:"firstName"}) private __backing_firstName: string = "Hua";

  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_firstName: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();

  @JSONRename({newName:"lastName"}) private __backing_lastName: string = "Li";

  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_lastName: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();

  private __computed_fullName = STATE_MGMT_FACTORY.makeComputed<string>((() => {
    console.info("---------Computed----------");
    return ((((this.firstName) + (" "))) + (this.lastName));
  }), "fullName");

  @Computed() public get fullName(): string {
    return this.__computed_fullName!.get();
  }

  public get firstName(): string {
    this.conditionalAddRef(this.__meta_firstName);
    return UIUtils.makeObserved(this.__backing_firstName);
  }

  public set firstName(newValue: string) {
    if (((this.__backing_firstName) !== (newValue))) {
      this.__backing_firstName = newValue;
      this.__meta_firstName.fireChange();
      this.executeOnSubscribingWatches("firstName");
    }
  }

  public get lastName(): string {
    this.conditionalAddRef(this.__meta_lastName);
    return UIUtils.makeObserved(this.__backing_lastName);
  }

  public set lastName(newValue: string) {
    if (((this.__backing_lastName) !== (newValue))) {
      this.__backing_lastName = newValue;
      this.__meta_lastName.fireChange();
      this.executeOnSubscribingWatches("lastName");
    }
  }

  public constructor() {}

}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @Computed decorator in @ObservedV2 class',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
