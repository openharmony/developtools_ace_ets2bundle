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

const OBJECTLINK_DIR_PATH: string = 'decorators/objectlink';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, OBJECTLINK_DIR_PATH, 'objectlink-basic.ets'),
];

const objectlinkTrackTransform: Plugins = {
    name: 'objectlink',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test objectlink basic transform', buildConfig);

const expectedScript: string = `

import { memo as memo } from "arkui.stateManagement.runtime";

import { IObjectLinkDecoratedVariable as IObjectLinkDecoratedVariable } from "arkui.stateManagement.decorator";

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { OBSERVE as OBSERVE } from "arkui.stateManagement.decorator";

import { IMutableStateMeta as IMutableStateMeta } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { LayoutCallback as LayoutCallback } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component } from "@ohos.arkui.component";

import { Observed as Observed, ObjectLink as ObjectLink } from "@ohos.arkui.stateManagement";

function main() {}



@Observed() class A implements IObservedObject, ISubscribedWatches {
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
  
  @JSONStringifyIgnore() private __meta: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  public constructor() {}
  
}

@Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: __Options_MyStateSample | undefined, @memo() content: (()=> void) | undefined): void {
    this.__backing_objectlinkvar = STATE_MGMT_FACTORY.makeObjectLink<A>(this, "objectlinkvar", ({let gensym___248819442 = initializers;
    (((gensym___248819442) == (null)) ? undefined : gensym___248819442.objectlinkvar)})!)
  }
  
  public __updateStruct(initializers: __Options_MyStateSample | undefined): void {
    if (((({let gensym___97362509 = initializers;
    (((gensym___97362509) == (null)) ? undefined : gensym___97362509.objectlinkvar)})) !== (undefined))) {
      this.__backing_objectlinkvar!.update(initializers!.objectlinkvar!);
    }
  }
  
  private __backing_objectlinkvar?: IObjectLinkDecoratedVariable<A>;
  
  public get objectlinkvar(): A {
    return this.__backing_objectlinkvar!.get();
  }
  
  @memo() public build() {}
  
  private constructor() {}
  
}

@Component() export interface __Options_MyStateSample {
  set objectlinkvar(objectlinkvar: A | undefined)
  
  get objectlinkvar(): A | undefined
  set __backing_objectlinkvar(__backing_objectlinkvar: IObjectLinkDecoratedVariable<A> | undefined)
  
  get __backing_objectlinkvar(): IObjectLinkDecoratedVariable<A> | undefined
  
}
`;

function testObjectLinkTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test objectlink basic transform',
    [objectlinkTrackTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testObjectLinkTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
