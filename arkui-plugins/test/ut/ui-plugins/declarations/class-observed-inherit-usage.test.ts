/*
 * Copyright (C) 2026 Huawei Device Co., Ltd.
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
import { PluginTester } from '../../../utils/plugin-tester';
import { mockBuildConfig } from '../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../utils/path-config';
import { parseDumpSrc } from '../../../utils/parse-string';
import { uiNoRecheck, recheck, memoNoRecheck, collectNoRecheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, dumpConstructor, dumpAnnotation } from '../../../utils/simplify-dump';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const DECL_DIR_PATH: string = 'declarations';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, DECL_DIR_PATH, 'class-observed-inherit-usage.ets'),
];

const pluginTester = new PluginTester('test declarations in classes that inherit @Observed classes', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsed transform',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { IMutableStateMeta as IMutableStateMeta } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { Text as Text, Column as Column, Component as Component, ComponentV2 as ComponentV2, Entry as Entry, Builder as Builder, BuilderParam as BuilderParam } from "@ohos.arkui.component";

import { Observed as Observed, ObservedV2 as ObservedV2, Track as Track, Trace as Trace, Monitor as Monitor, Computed as Computed, Local as Local } from "@ohos.arkui.stateManagement";

import { IO as IO, ExportObserved as ExportObserved, ExportObservedImpl as ExportObservedImpl, ExportObservedWithTrack as ExportObservedWithTrack, ExportTrackWithoutObserved as ExportTrackWithoutObserved, ExportObservedWithBody as ExportObservedWithBody, ExportObservedImplWithBody as ExportObservedImplWithBody, ExportObservedWithTrackWithBody as ExportObservedWithTrackWithBody, ExportTrackWithoutObservedWithBody as ExportTrackWithoutObservedWithBody } from "./utils/class-observed-inherit";

function main() {}


@Observed() class SomeObInherit extends ExportObserved implements IObservedObject, ISubscribedWatches {
  @JSONStringifyIgnore() @JSONParseIgnore() private subscribedWatches: (ISubscribedWatches | undefined) = STATE_MGMT_FACTORY.makeSubscribedWatches();
  public addWatchSubscriber(watchId: WatchIdType): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.addWatchSubscriber(watchId);
    }
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    if (((this.subscribedWatches) !== (undefined))) {
      return this.subscribedWatches!.removeWatchSubscriber(watchId);
    }
    return false;
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.executeOnSubscribingWatches(propertyName);
    }
  }
  
  public setV1RenderId(renderId: RenderIdType): void {}
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    meta.addRef();
  }
  
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__meta_");
  @JSONRename({newName:"t3"}) public __backing_t3: number = 1;
  public get t3(): number {
    this.conditionalAddRef(this.__meta);
    return this.__backing_t3;
  }
  
  public set t3(newValue: number) {
    if (((this.__backing_t3) !== (newValue))) {
      this.__backing_t3 = newValue;
      this.__meta.fireChange();
      this.executeOnSubscribingWatches("t3");
    }
  }
  
  public constructor() {}
  
  static {
    
  }
}

class SomeTrInherit extends ExportObserved implements IObservedObject, ISubscribedWatches {
  @JSONStringifyIgnore() @JSONParseIgnore() private subscribedWatches: (ISubscribedWatches | undefined) = STATE_MGMT_FACTORY.makeSubscribedWatches();
  public addWatchSubscriber(watchId: WatchIdType): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.addWatchSubscriber(watchId);
    }
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    if (((this.subscribedWatches) !== (undefined))) {
      return this.subscribedWatches!.removeWatchSubscriber(watchId);
    }
    return false;
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.executeOnSubscribingWatches(propertyName);
    }
  }
  
  public setV1RenderId(renderId: RenderIdType): void {}
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    meta.addRef();
  }
  
  @JSONRename({newName:"t3"}) public __backing_t3: number = 1;
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_t3: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__meta_t3");
  public get t3(): number {
    this.conditionalAddRef(this.__meta_t3);
    return this.__backing_t3;
  }
  
  public set t3(newValue: number) {
    if (((this.__backing_t3) !== (newValue))) {
      this.__backing_t3 = newValue;
      this.__meta_t3.fireChange();
      this.executeOnSubscribingWatches("t3");
    }
  }
  
  public constructor() {}
  
  static {
    
  }
}

@Observed() class SomeObTrInherit extends ExportObservedWithTrack implements IObservedObject, ISubscribedWatches {
  @JSONStringifyIgnore() @JSONParseIgnore() private subscribedWatches: (ISubscribedWatches | undefined) = STATE_MGMT_FACTORY.makeSubscribedWatches();
  public addWatchSubscriber(watchId: WatchIdType): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.addWatchSubscriber(watchId);
    }
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    if (((this.subscribedWatches) !== (undefined))) {
      return this.subscribedWatches!.removeWatchSubscriber(watchId);
    }
    return false;
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.executeOnSubscribingWatches(propertyName);
    }
  }
  
  public setV1RenderId(renderId: RenderIdType): void {}
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    meta.addRef();
  }
  
  public t1: number = 2;
  @JSONRename({newName:"t3"}) public __backing_t3: number = 1;
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_t3: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__meta_t3");
  public get t3(): number {
    this.conditionalAddRef(this.__meta_t3);
    return this.__backing_t3;
  }
  
  public set t3(newValue: number) {
    if (((this.__backing_t3) !== (newValue))) {
      this.__backing_t3 = newValue;
      this.__meta_t3.fireChange();
      this.executeOnSubscribingWatches("t3");
    }
  }
  
  public constructor() {}
  
  static {
    
  }
}

@Observed() class SomeObInheritInTr extends ExportTrackWithoutObserved implements IObservedObject, ISubscribedWatches {
  @JSONStringifyIgnore() @JSONParseIgnore() private subscribedWatches: (ISubscribedWatches | undefined) = STATE_MGMT_FACTORY.makeSubscribedWatches();
  public addWatchSubscriber(watchId: WatchIdType): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.addWatchSubscriber(watchId);
    }
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    if (((this.subscribedWatches) !== (undefined))) {
      return this.subscribedWatches!.removeWatchSubscriber(watchId);
    }
    return false;
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.executeOnSubscribingWatches(propertyName);
    }
  }
  
  public setV1RenderId(renderId: RenderIdType): void {}
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    meta.addRef();
  }
  
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__meta_");
  @JSONRename({newName:"t3"}) public __backing_t3: number = 1;
  public get t3(): number {
    this.conditionalAddRef(this.__meta);
    return this.__backing_t3;
  }
  
  public set t3(newValue: number) {
    if (((this.__backing_t3) !== (newValue))) {
      this.__backing_t3 = newValue;
      this.__meta.fireChange();
      this.executeOnSubscribingWatches("t3");
    }
  }
  
  public constructor() {}
  
  static {
    
  }
}

class SomeTrInheritInTr extends ExportTrackWithoutObserved implements IObservedObject, ISubscribedWatches {
  @JSONStringifyIgnore() @JSONParseIgnore() private subscribedWatches: (ISubscribedWatches | undefined) = STATE_MGMT_FACTORY.makeSubscribedWatches();
  public addWatchSubscriber(watchId: WatchIdType): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.addWatchSubscriber(watchId);
    }
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    if (((this.subscribedWatches) !== (undefined))) {
      return this.subscribedWatches!.removeWatchSubscriber(watchId);
    }
    return false;
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.executeOnSubscribingWatches(propertyName);
    }
  }
  
  public setV1RenderId(renderId: RenderIdType): void {}
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    meta.addRef();
  }
  
  @JSONRename({newName:"t3"}) public __backing_t3: number = 1;
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_t3: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__meta_t3");
  public get t3(): number {
    this.conditionalAddRef(this.__meta_t3);
    return this.__backing_t3;
  }
  
  public set t3(newValue: number) {
    if (((this.__backing_t3) !== (newValue))) {
      this.__backing_t3 = newValue;
      this.__meta_t3.fireChange();
      this.executeOnSubscribingWatches("t3");
    }
  }
  
  public constructor() {}
  
  static {
    
  }
}

`;


function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

const expectedMemoScript: string = `

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { IMutableStateMeta as IMutableStateMeta } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { Text as Text, Column as Column, Component as Component, ComponentV2 as ComponentV2, Entry as Entry, Builder as Builder, BuilderParam as BuilderParam } from "@ohos.arkui.component";

import { Observed as Observed, ObservedV2 as ObservedV2, Track as Track, Trace as Trace, Monitor as Monitor, Computed as Computed, Local as Local } from "@ohos.arkui.stateManagement";

import { IO as IO, ExportObserved as ExportObserved, ExportObservedImpl as ExportObservedImpl, ExportObservedWithTrack as ExportObservedWithTrack, ExportTrackWithoutObserved as ExportTrackWithoutObserved, ExportObservedWithBody as ExportObservedWithBody, ExportObservedImplWithBody as ExportObservedImplWithBody, ExportObservedWithTrackWithBody as ExportObservedWithTrackWithBody, ExportTrackWithoutObservedWithBody as ExportTrackWithoutObservedWithBody } from "./utils/class-observed-inherit";

function main() {}


@Observed() class SomeObInherit extends ExportObserved implements IObservedObject, ISubscribedWatches {
  @JSONStringifyIgnore() @JSONParseIgnore() private subscribedWatches: (ISubscribedWatches | undefined) = STATE_MGMT_FACTORY.makeSubscribedWatches();
  public addWatchSubscriber(watchId: WatchIdType): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.addWatchSubscriber(watchId);
    }
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    if (((this.subscribedWatches) !== (undefined))) {
      return this.subscribedWatches!.removeWatchSubscriber(watchId);
    }
    return false;
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.executeOnSubscribingWatches(propertyName);
    }
  }
  
  public setV1RenderId(renderId: RenderIdType): void {}
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    meta.addRef();
  }
  
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__meta_");
  @JSONRename({newName:"t3"}) public __backing_t3: number = 1;
  public get t3(): number {
    this.conditionalAddRef(this.__meta);
    return this.__backing_t3;
  }
  
  public set t3(newValue: number) {
    if (((this.__backing_t3) !== (newValue))) {
      this.__backing_t3 = newValue;
      this.__meta.fireChange();
      this.executeOnSubscribingWatches("t3");
    }
  }
  
  public constructor() {}
  
  static {
    
  }
}

class SomeTrInherit extends ExportObserved implements IObservedObject, ISubscribedWatches {
  @JSONStringifyIgnore() @JSONParseIgnore() private subscribedWatches: (ISubscribedWatches | undefined) = STATE_MGMT_FACTORY.makeSubscribedWatches();
  public addWatchSubscriber(watchId: WatchIdType): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.addWatchSubscriber(watchId);
    }
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    if (((this.subscribedWatches) !== (undefined))) {
      return this.subscribedWatches!.removeWatchSubscriber(watchId);
    }
    return false;
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.executeOnSubscribingWatches(propertyName);
    }
  }
  
  public setV1RenderId(renderId: RenderIdType): void {}
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    meta.addRef();
  }
  
  @JSONRename({newName:"t3"}) public __backing_t3: number = 1;
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_t3: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__meta_t3");
  public get t3(): number {
    this.conditionalAddRef(this.__meta_t3);
    return this.__backing_t3;
  }
  
  public set t3(newValue: number) {
    if (((this.__backing_t3) !== (newValue))) {
      this.__backing_t3 = newValue;
      this.__meta_t3.fireChange();
      this.executeOnSubscribingWatches("t3");
    }
  }
  
  public constructor() {}
  
  static {
    
  }
}

@Observed() class SomeObTrInherit extends ExportObservedWithTrack implements IObservedObject, ISubscribedWatches {
  @JSONStringifyIgnore() @JSONParseIgnore() private subscribedWatches: (ISubscribedWatches | undefined) = STATE_MGMT_FACTORY.makeSubscribedWatches();
  public addWatchSubscriber(watchId: WatchIdType): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.addWatchSubscriber(watchId);
    }
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    if (((this.subscribedWatches) !== (undefined))) {
      return this.subscribedWatches!.removeWatchSubscriber(watchId);
    }
    return false;
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.executeOnSubscribingWatches(propertyName);
    }
  }
  
  public setV1RenderId(renderId: RenderIdType): void {}
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    meta.addRef();
  }
  
  public t1: number = 2;
  @JSONRename({newName:"t3"}) public __backing_t3: number = 1;
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_t3: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__meta_t3");
  public get t3(): number {
    this.conditionalAddRef(this.__meta_t3);
    return this.__backing_t3;
  }
  
  public set t3(newValue: number) {
    if (((this.__backing_t3) !== (newValue))) {
      this.__backing_t3 = newValue;
      this.__meta_t3.fireChange();
      this.executeOnSubscribingWatches("t3");
    }
  }
  
  public constructor() {}
  
  static {
    
  }
}

@Observed() class SomeObInheritInTr extends ExportTrackWithoutObserved implements IObservedObject, ISubscribedWatches {
  @JSONStringifyIgnore() @JSONParseIgnore() private subscribedWatches: (ISubscribedWatches | undefined) = STATE_MGMT_FACTORY.makeSubscribedWatches();
  public addWatchSubscriber(watchId: WatchIdType): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.addWatchSubscriber(watchId);
    }
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    if (((this.subscribedWatches) !== (undefined))) {
      return this.subscribedWatches!.removeWatchSubscriber(watchId);
    }
    return false;
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.executeOnSubscribingWatches(propertyName);
    }
  }
  
  public setV1RenderId(renderId: RenderIdType): void {}
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    meta.addRef();
  }
  
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__meta_");
  @JSONRename({newName:"t3"}) public __backing_t3: number = 1;
  public get t3(): number {
    this.conditionalAddRef(this.__meta);
    return this.__backing_t3;
  }
  
  public set t3(newValue: number) {
    if (((this.__backing_t3) !== (newValue))) {
      this.__backing_t3 = newValue;
      this.__meta.fireChange();
      this.executeOnSubscribingWatches("t3");
    }
  }
  
  public constructor() {}
  
  static {
    
  }
}

class SomeTrInheritInTr extends ExportTrackWithoutObserved implements IObservedObject, ISubscribedWatches {
  @JSONStringifyIgnore() @JSONParseIgnore() private subscribedWatches: (ISubscribedWatches | undefined) = STATE_MGMT_FACTORY.makeSubscribedWatches();
  public addWatchSubscriber(watchId: WatchIdType): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.addWatchSubscriber(watchId);
    }
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    if (((this.subscribedWatches) !== (undefined))) {
      return this.subscribedWatches!.removeWatchSubscriber(watchId);
    }
    return false;
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    if (((this.subscribedWatches) !== (undefined))) {
      this.subscribedWatches!.executeOnSubscribingWatches(propertyName);
    }
  }
  
  public setV1RenderId(renderId: RenderIdType): void {}
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    meta.addRef();
  }
  
  @JSONRename({newName:"t3"}) public __backing_t3: number = 1;
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_t3: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__meta_t3");
  public get t3(): number {
    this.conditionalAddRef(this.__meta_t3);
    return this.__backing_t3;
  }
  
  public set t3(newValue: number) {
    if (((this.__backing_t3) !== (newValue))) {
      this.__backing_t3 = newValue;
      this.__meta_t3.fireChange();
      this.executeOnSubscribingWatches("t3");
    }
  }
  
  public constructor() {}
  
  static {
    
  }
}

`;


function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
}

pluginTester.run(
    'test declarations in classes that inherit @Observed classes',
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked'
    }
);
