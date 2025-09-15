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

@Observed() class B implements IObservedObject, ISubscribedWatches {
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
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_objectlinkvar = STATE_MGMT_FACTORY.makeObjectLink<A>(this, "objectlinkvar", (({let gensym___248819442 = initializers;
    (((gensym___248819442) == (null)) ? undefined : gensym___248819442.objectlinkvar)}) as A))
  }

  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {
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

  public constructor() {}

}

@Component() final struct MyStateSample2 extends CustomComponent<MyStateSample2, __Options_MyStateSample2> {
  public __initializeStruct(initializers: (__Options_MyStateSample2 | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_objectlinkvar1 = STATE_MGMT_FACTORY.makeObjectLink<(A | undefined)>(this, "objectlinkvar1", (({let gensym___219806589 = initializers;
    (((gensym___219806589) == (null)) ? undefined : gensym___219806589.objectlinkvar1)}) as (A | undefined)))
    this.__backing_objectlinkvar2 = STATE_MGMT_FACTORY.makeObjectLink<(A | B)>(this, "objectlinkvar2", (({let gensym___217261862 = initializers;
    (((gensym___217261862) == (null)) ? undefined : gensym___217261862.objectlinkvar2)}) as (A | B)))
    this.__backing_objectlinkvar3 = STATE_MGMT_FACTORY.makeObjectLink<(A | B | null)>(this, "objectlinkvar3", (({let gensym___199257778 = initializers;
    (((gensym___199257778) == (null)) ? undefined : gensym___199257778.objectlinkvar3)}) as (A | B | null)))
  }

  public __updateStruct(initializers: (__Options_MyStateSample2 | undefined)): void {
    if (((({let gensym___82770935 = initializers;
    (((gensym___82770935) == (null)) ? undefined : gensym___82770935.objectlinkvar1)})) !== (undefined))) {
      this.__backing_objectlinkvar1!.update(initializers!.objectlinkvar1!);
    }
    if (((({let gensym___225818999 = initializers;
    (((gensym___225818999) == (null)) ? undefined : gensym___225818999.objectlinkvar2)})) !== (undefined))) {
      this.__backing_objectlinkvar2!.update(initializers!.objectlinkvar2!);
    }
    if (((({let gensym___3063329 = initializers;
    (((gensym___3063329) == (null)) ? undefined : gensym___3063329.objectlinkvar3)})) !== (undefined))) {
      this.__backing_objectlinkvar3!.update(initializers!.objectlinkvar3!);
    }
  }

  private __backing_objectlinkvar1?: IObjectLinkDecoratedVariable<(A | undefined)>;

  public get objectlinkvar1(): (A | undefined) {
    return this.__backing_objectlinkvar1!.get();
  }

  private __backing_objectlinkvar2?: IObjectLinkDecoratedVariable<(A | B)>;

  public get objectlinkvar2(): (A | B) {
    return this.__backing_objectlinkvar2!.get();
  }

  private __backing_objectlinkvar3?: IObjectLinkDecoratedVariable<(A | B | null)>;

  public get objectlinkvar3(): (A | B | null) {
    return this.__backing_objectlinkvar3!.get();
  }

  @memo() public build() {}

  public constructor() {}

}

@Component() export interface __Options_MyStateSample {
  set objectlinkvar(objectlinkvar: (A | undefined))

  get objectlinkvar(): (A | undefined)
  set __backing_objectlinkvar(__backing_objectlinkvar: (IObjectLinkDecoratedVariable<A> | undefined))

  get __backing_objectlinkvar(): (IObjectLinkDecoratedVariable<A> | undefined)

}

@Component() export interface __Options_MyStateSample2 {
  set objectlinkvar1(objectlinkvar1: ((A | undefined) | undefined))

  get objectlinkvar1(): ((A | undefined) | undefined)
  set __backing_objectlinkvar1(__backing_objectlinkvar1: (IObjectLinkDecoratedVariable<(A | undefined)> | undefined))

  get __backing_objectlinkvar1(): (IObjectLinkDecoratedVariable<(A | undefined)> | undefined)
  set objectlinkvar2(objectlinkvar2: ((A | B) | undefined))

  get objectlinkvar2(): ((A | B) | undefined)
  set __backing_objectlinkvar2(__backing_objectlinkvar2: (IObjectLinkDecoratedVariable<(A | B)> | undefined))

  get __backing_objectlinkvar2(): (IObjectLinkDecoratedVariable<(A | B)> | undefined)
  set objectlinkvar3(objectlinkvar3: ((A | B | null) | undefined))

  get objectlinkvar3(): ((A | B | null) | undefined)
  set __backing_objectlinkvar3(__backing_objectlinkvar3: (IObjectLinkDecoratedVariable<(A | B | null)> | undefined))

  get __backing_objectlinkvar3(): (IObjectLinkDecoratedVariable<(A | B | null)> | undefined)

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
