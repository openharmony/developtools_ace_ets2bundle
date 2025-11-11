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
import { dumpGetterSetter, GetSetDumper, dumpConstructor } from '../../../../utils/simplify-dump';
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
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { IObjectLinkDecoratedVariable as IObjectLinkDecoratedVariable } from "arkui.stateManagement.decorator";

import { Memo as Memo } from "arkui.incremental.annotation";

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { OBSERVE as OBSERVE } from "arkui.stateManagement.decorator";

import { IMutableStateMeta as IMutableStateMeta } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component } from "@ohos.arkui.component";

import { Observed as Observed, ObjectLink as ObjectLink } from "@ohos.arkui.stateManagement";

function main() {}

@Observed() class A implements IObservedObject, ISubscribedWatches {
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

  @JSONStringifyIgnore() @JSONParseIgnore() private __meta: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();

  public constructor() {}

}

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

  @JSONStringifyIgnore() @JSONParseIgnore() private __meta: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();

  public constructor() {}

}

@Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_objectlinkvar = STATE_MGMT_FACTORY.makeObjectLink<A>(this, "objectlinkvar", (({let gensym___248819442 = initializers;
    (((gensym___248819442) == (null)) ? undefined : gensym___248819442.objectlinkvar)}) as A))
  }

  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {
    if (({let gensym___71090848 = initializers;
    (((gensym___71090848) == (null)) ? undefined : gensym___71090848.__options_has_objectlinkvar)})) {
      this.__backing_objectlinkvar!.update((initializers!.objectlinkvar as A));
    }
  }

  private __backing_objectlinkvar?: IObjectLinkDecoratedVariable<A>;

  public get objectlinkvar(): A {
    return this.__backing_objectlinkvar!.get();
  }

  @MemoIntrinsic() public static _invoke(style: @Memo() ((instance: MyStateSample)=> void), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___46528967 = storage;
      (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): MyStateSample {
    throw new Error("Declare interface");
  }
  
  @Memo() public build() {}
  
  ${dumpConstructor()}

}

@Component() final struct MyStateSample2 extends CustomComponent<MyStateSample2, __Options_MyStateSample2> {
  public __initializeStruct(initializers: (__Options_MyStateSample2 | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_objectlinkvar1 = STATE_MGMT_FACTORY.makeObjectLink<(A | undefined)>(this, "objectlinkvar1", (({let gensym___219806589 = initializers;
    (((gensym___219806589) == (null)) ? undefined : gensym___219806589.objectlinkvar1)}) as (A | undefined)))
    this.__backing_objectlinkvar2 = STATE_MGMT_FACTORY.makeObjectLink<(A | B)>(this, "objectlinkvar2", (({let gensym___217261862 = initializers;
    (((gensym___217261862) == (null)) ? undefined : gensym___217261862.objectlinkvar2)}) as (A | B)))
    this.__backing_objectlinkvar3 = STATE_MGMT_FACTORY.makeObjectLink<(A | B | null)>(this, "objectlinkvar3", (({let gensym___199257778 = initializers;
    (((gensym___199257778) == (null)) ? undefined : gensym___199257778.objectlinkvar3)}) as (A | B | null)))
  }

  public __updateStruct(initializers: (__Options_MyStateSample2 | undefined)): void {
    if (({let gensym___180637479 = initializers;
    (((gensym___180637479) == (null)) ? undefined : gensym___180637479.__options_has_objectlinkvar1)})) {
      this.__backing_objectlinkvar1!.update((initializers!.objectlinkvar1 as (A | undefined)));
    }
    if (({let gensym___76030692 = initializers;
    (((gensym___76030692) == (null)) ? undefined : gensym___76030692.__options_has_objectlinkvar2)})) {
      this.__backing_objectlinkvar2!.update((initializers!.objectlinkvar2 as (A | B)));
    }
    if (({let gensym___49815838 = initializers;
    (((gensym___49815838) == (null)) ? undefined : gensym___49815838.__options_has_objectlinkvar3)})) {
      this.__backing_objectlinkvar3!.update((initializers!.objectlinkvar3 as (A | B | null)));
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

  @MemoIntrinsic() public static _invoke(style: @Memo() ((instance: MyStateSample2)=> void), initializers: ((()=> __Options_MyStateSample2) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample2, __Options_MyStateSample2>(style, ((): MyStateSample2 => {
      return new MyStateSample2(false, ({let gensym___64599093 = storage;
      (((gensym___64599093) == (null)) ? undefined : gensym___64599093())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_MyStateSample2, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): MyStateSample2 {
    throw new Error("Declare interface");
  }
  
  @Memo() public build() {}
  
  ${dumpConstructor()}

}

@Component() export interface __Options_MyStateSample {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'objectlinkvar', '(A | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_objectlinkvar', '(IObjectLinkDecoratedVariable<A> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_objectlinkvar', '(boolean | undefined)')}
  
}

@Component() export interface __Options_MyStateSample2 {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'objectlinkvar1', '((A | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_objectlinkvar1', '(IObjectLinkDecoratedVariable<(A | undefined)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_objectlinkvar1', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'objectlinkvar2', '((A | B) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_objectlinkvar2', '(IObjectLinkDecoratedVariable<(A | B)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_objectlinkvar2', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'objectlinkvar3', '((A | B | null) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_objectlinkvar3', '(IObjectLinkDecoratedVariable<(A | B | null)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_objectlinkvar3', '(boolean | undefined)')}
  
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
