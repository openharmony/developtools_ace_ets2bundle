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
import { dumpGetterSetter, GetSetDumper } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const OBSERVED_DIR_PATH: string = 'decorators/observedv2-trace';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, OBSERVED_DIR_PATH, 'observedv2-trace-implements.ets'),
];

const observedTrackTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test @ObservedV2 implements interface', buildConfig);

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

interface PropInterface {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'propF', 'number', [], [], false)}
  
}

interface trackInterface {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'trackF', 'number', [], [], false)}
  
}

@ObservedV2() class F implements PropInterface, trackInterface, IObservedObject, ISubscribedWatches {
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

  @JSONRename({newName:"bb"}) public __backing_bb?: boolean;

  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_bb: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_bb");

  @JSONRename({newName:"propF"}) private __backing_propF: number = 1;

  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_propF: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_propF");

  private _$property$_trackF: number = 2;

  public get propF(): number {
    this.conditionalAddRef(this.__meta_propF);
    return UIUtils.makeObserved(this.__backing_propF);
  }

  public set propF(newValue: number) {
    if (((this.__backing_propF) !== (newValue))) {
      this.__backing_propF = newValue;
      this.__meta_propF.fireChange();
      this.executeOnSubscribingWatches("propF");
    }
  }
  
  public get trackF(): number {
    return this._$property$_trackF;
  }

  public set trackF(_$property$_trackF: number) {
    this._$property$_trackF = _$property$_trackF;
    return;
  }
  
  public get bb(): boolean {
    this.conditionalAddRef(this.__meta_bb);
    return UIUtils.makeObserved((this.__backing_bb as boolean));
  }

  public set bb(newValue: boolean) {
    if (((this.__backing_bb) !== (newValue))) {
      this.__backing_bb = newValue;
      this.__meta_bb.fireChange();
      this.executeOnSubscribingWatches("bb");
    }
  }

  public constructor(bb: boolean) {
    this.bb = bb;
  }

}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @ObservedV2 implements interface',
    [observedTrackTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
