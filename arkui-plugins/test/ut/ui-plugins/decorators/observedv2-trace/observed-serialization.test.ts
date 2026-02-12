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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, OBSERVED_DIR_PATH, 'observedv2-serialization.ets'),
];

const observedTrackTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test @ObservedV2 class serialization', buildConfig);

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

@Retention({policy:"SOURCE"}) export @interface TestDecor {}

@ObservedV2() class testJSONStringifyIgnore implements IObservedObject, ISubscribedWatches {
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

  public var1: number = 1;

  @JSONRename({newName:"var2"}) public __backing_var2: number = 2;

  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_var2: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_var2");

  @JSONStringifyIgnore() public var3: number = 3;

  @TestDecor() public var4: number = 4;

  @JSONStringifyIgnore() public __backing_var5: number = 5;

  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_var5: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_var5");

  @JSONStringifyIgnore() @TestDecor() public var6: number = 6;

  @TestDecor() @JSONRename({newName:"var7"}) public __backing_var7: number = 7;

  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_var7: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_var7");

  @JSONStringifyIgnore() @TestDecor() public __backing_var8: number = 8;

  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_var8: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_var8");

  public get var2(): number {
    this.conditionalAddRef(this.__meta_var2);
    return UIUtils.makeObserved(this.__backing_var2);
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
    return UIUtils.makeObserved(this.__backing_var5);
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
    return UIUtils.makeObserved(this.__backing_var7);
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
    return UIUtils.makeObserved(this.__backing_var8);
  }

  public set var8(newValue: number) {
    if (((this.__backing_var8) !== (newValue))) {
      this.__backing_var8 = newValue;
      this.__meta_var8.fireChange();
      this.executeOnSubscribingWatches("var8");
    }
  }

  public constructor() {}

}

@ObservedV2() class testJsonRename implements IObservedObject, ISubscribedWatches {
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

  public var1: number = 1;

  @JSONRename({newName:"var2"}) public __backing_var2: number = 2;

  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_var2: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_var2");

  @JSONRename({value:"name3"}) public var3: number = 3;

  @TestDecor() public var4: number = 4;

  @JSONRename({value:"name5"}) public __backing_var5: number = 5;

  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_var5: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_var5");

  @JSONRename({value:"name6"}) @TestDecor() public var6: number = 6;

  @TestDecor() @JSONRename({newName:"var7"}) public __backing_var7: number = 7;

  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_var7: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_var7");

  @JSONRename({value:"name8"}) @TestDecor() public __backing_var8: number = 8;

  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_var8: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_var8");

  public get var2(): number {
    this.conditionalAddRef(this.__meta_var2);
    return UIUtils.makeObserved(this.__backing_var2);
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
    return UIUtils.makeObserved(this.__backing_var5);
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
    return UIUtils.makeObserved(this.__backing_var7);
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
    return UIUtils.makeObserved(this.__backing_var8);
  }

  public set var8(newValue: number) {
    if (((this.__backing_var8) !== (newValue))) {
      this.__backing_var8 = newValue;
      this.__meta_var8.fireChange();
      this.executeOnSubscribingWatches("var8");
    }
  }

  public constructor() {}

}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @ObservedV2 class serialization',
    [observedTrackTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
