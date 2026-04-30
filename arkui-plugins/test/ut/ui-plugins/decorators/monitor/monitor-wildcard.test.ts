/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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
import { mockBuildConfig, mockProjectConfig } from '../../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../../utils/path-config';
import { parseDumpSrc } from '../../../../utils/parse-string';
import { beforeUINoRecheck, recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, dumpAnnotation } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins, ProjectConfig } from '../../../../../common/plugin-context';

const STATE_DIR_PATH: string = 'decorators/monitor';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'monitor-wildcard.ets'),
];

const projectConfig: ProjectConfig = mockProjectConfig();
projectConfig.compatibleSdkVersion = 26;

const pluginTester = new PluginTester('test @Monitor decorator wildCard transformation', buildConfig, projectConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedScript: string = `

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { IMonitorDecoratedVariable as IMonitorDecoratedVariable } from "arkui.stateManagement.decorator";

import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { IObservedAnyProp as IObservedAnyProp } from "arkui.stateManagement.decorator";

import { UIUtils as UIUtils } from "arkui.stateManagement.utils";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IMutableStateMeta as IMutableStateMeta } from "arkui.stateManagement.decorator";

import { Memo as Memo } from "arkui.incremental.annotation";

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Entry as Entry, ComponentV2 as ComponentV2, Column as Column, Button as Button } from "@ohos.arkui.component";

import { Monitor as Monitor, IMonitor as IMonitor, ObservedV2 as ObservedV2, Trace as Trace, Local as Local } from "@ohos.arkui.stateManagement";

function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/monitor/monitor-wildcard",
  pageFullPath: "test/demo/mock/decorators/monitor/monitor-wildcard",
  integratedHsp: "false",
} as NavInterface));
@ObservedV2() class Per implements IObservedObject, ISubscribedWatches, IObservedAnyProp {
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
  
  @JSONRename({newName:"ee"}) public __backing_ee: EE = new EE();
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_ee: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_ee");
  public get ee(): EE {
    this.conditionalAddRef(this.__meta_ee);
    return UIUtils.makeObserved(this.__backing_ee);
  }
  
  public set ee(newValue: EE) {
    if (((this.__backing_ee) !== (newValue))) {
      this.__backing_ee = newValue;
      this.__meta_ee.fireChange();
      this.executeOnSubscribingWatches("ee");
    }
  }
  
  @JSONRename({newName:"dd"}) public __backing_dd: DD = new DD();
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_dd: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_dd");
  public get dd(): DD {
    this.conditionalAddRef(this.__meta_dd);
    return UIUtils.makeObserved(this.__backing_dd);
  }
  
  public set dd(newValue: DD) {
    if (((this.__backing_dd) !== (newValue))) {
      this.__backing_dd = newValue;
      this.__meta_dd.fireChange();
      this.executeOnSubscribingWatches("dd");
    }
  }
  
  public constructor() {}
  
  public addRefAnyProp(): void {
    this.__meta_ee.addRef();
    this.__meta_dd.addRef();
  }
  
  static {
    
  }
}

@ObservedV2() class DD implements IObservedObject, ISubscribedWatches, IObservedAnyProp {
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
  
  @JSONRename({newName:"num"}) public __backing_num: number = 1;
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_num: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_num");
  public get num(): number {
    this.conditionalAddRef(this.__meta_num);
    return UIUtils.makeObserved(this.__backing_num);
  }
  
  public set num(newValue: number) {
    if (((this.__backing_num) !== (newValue))) {
      this.__backing_num = newValue;
      this.__meta_num.fireChange();
      this.executeOnSubscribingWatches("num");
    }
  }
  
  public constructor() {}
  
  public addRefAnyProp(): void {
    this.__meta_num.addRef();
  }
  
  static {
    
  }
}

@ObservedV2() class EE implements IObservedObject, ISubscribedWatches, IObservedAnyProp {
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
  
  @JSONRename({newName:"ff"}) public __backing_ff: FF = new FF();
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_ff: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_ff");
  public get ff(): FF {
    this.conditionalAddRef(this.__meta_ff);
    return UIUtils.makeObserved(this.__backing_ff);
  }
  
  public set ff(newValue: FF) {
    if (((this.__backing_ff) !== (newValue))) {
      this.__backing_ff = newValue;
      this.__meta_ff.fireChange();
      this.executeOnSubscribingWatches("ff");
    }
  }
  
  @JSONRename({newName:"gg"}) public __backing_gg: GG = new GG();
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_gg: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_gg");
  public get gg(): GG {
    this.conditionalAddRef(this.__meta_gg);
    return UIUtils.makeObserved(this.__backing_gg);
  }
  
  public set gg(newValue: GG) {
    if (((this.__backing_gg) !== (newValue))) {
      this.__backing_gg = newValue;
      this.__meta_gg.fireChange();
      this.executeOnSubscribingWatches("gg");
    }
  }
  
  public constructor() {}
  
  public addRefAnyProp(): void {
    this.__meta_ff.addRef();
    this.__meta_gg.addRef();
  }
  
  static {
    
  }
}

@ObservedV2() class FF implements IObservedObject, ISubscribedWatches, IObservedAnyProp {
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
  
  @JSONRename({newName:"num"}) public __backing_num: number = 1;
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_num: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_num");
  public get num(): number {
    this.conditionalAddRef(this.__meta_num);
    return UIUtils.makeObserved(this.__backing_num);
  }
  
  public set num(newValue: number) {
    if (((this.__backing_num) !== (newValue))) {
      this.__backing_num = newValue;
      this.__meta_num.fireChange();
      this.executeOnSubscribingWatches("num");
    }
  }
  
  public constructor() {}
  
  public addRefAnyProp(): void {
    this.__meta_num.addRef();
  }
  
  static {
    
  }
}

@ObservedV2() class GG implements IObservedObject, ISubscribedWatches, IObservedAnyProp {
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
  
  @JSONRename({newName:"num"}) public __backing_num: number = 1;
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_num: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_num");
  public get num(): number {
    this.conditionalAddRef(this.__meta_num);
    return UIUtils.makeObserved(this.__backing_num);
  }
  
  public set num(newValue: number) {
    if (((this.__backing_num) !== (newValue))) {
      this.__backing_num = newValue;
      this.__meta_num.fireChange();
      this.executeOnSubscribingWatches("num");
    }
  }
  
  public constructor() {}
  
  public addRefAnyProp(): void {
    this.__meta_num.addRef();
  }
  
  static {
    
  }
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @ComponentV2() final struct Index extends CustomComponentV2<Index, __Options_Index> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_Index | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_per = STATE_MGMT_FACTORY.makeLocal<Per>(this, "per", new Per());
    this.__monitor_onPerChange1 = STATE_MGMT_FACTORY.makeMonitor([({
      path: "per.ee.*",
      enableWildcard: true,
      valueCallback: ((): Any => {
        return ({let gensym___145269047 = this.per;
        (((gensym___145269047) == (null)) ? undefined : gensym___145269047.ee)});
      }),
    } as IMonitorPathInfo), ({
      path: "per.dd",
      valueCallback: ((): Any => {
        return ({let gensym___14173770 = this.per;
        (((gensym___14173770) == (null)) ? undefined : gensym___14173770.dd)});
      }),
    } as IMonitorPathInfo)], ((_m: IMonitor) => {
      this.onPerChange1(_m);
    }), ({
      owner: this,
      functionName: "onPerChange1",
    } as MakeMonitorOptions));
    this.__monitor_onPerChange2 = STATE_MGMT_FACTORY.makeMonitor([({
      path: "per.ee",
      valueCallback: ((): Any => {
        return ({let gensym___162548198 = this.per;
        (((gensym___162548198) == (null)) ? undefined : gensym___162548198.ee)});
      }),
    } as IMonitorPathInfo), ({
      path: "per.dd.*",
      enableWildcard: true,
      valueCallback: ((): Any => {
        return ({let gensym___240028736 = this.per;
        (((gensym___240028736) == (null)) ? undefined : gensym___240028736.dd)});
      }),
    } as IMonitorPathInfo)], ((_m: IMonitor) => {
      this.onPerChange2(_m);
    }), ({
      owner: this,
      functionName: "onPerChange2",
    } as MakeMonitorOptions));
    this.__monitor_onPerChange3 = STATE_MGMT_FACTORY.makeMonitor([({
      path: "per.*",
      enableWildcard: true,
      valueCallback: ((): Any => {
        return this.per;
      }),
    } as IMonitorPathInfo)], ((_m: IMonitor) => {
      this.onPerChange3(_m);
    }), ({
      owner: this,
      functionName: "onPerChange3",
    } as MakeMonitorOptions));
  }
  
  public __updateStruct(initializers: (__Options_Index | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_Index | undefined)): void {
    this.__backing_per!.resetOnReuse(new Per());
    this.__monitor_onPerChange1!.resetOnReuse();
    this.__monitor_onPerChange2!.resetOnReuse();
    this.__monitor_onPerChange3!.resetOnReuse();
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: Index)=> void) | undefined), initializers: ((()=> __Options_Index) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<Index, __Options_Index>(style, ((): Index => {
      return new Index();
    }), initializers, reuseId, content, {
      sClass: Class.from<Index>(),
    });
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Index, storage?: LocalStorage, @Builder() content?: (()=> void)): Index {
    throw new Error("Declare interface");
  }
  
  private __backing_per?: ILocalDecoratedVariable<Per>;
  public get per(): Per {
    return this.__backing_per!.get();
  }
  
  public set per(value: Per) {
    this.__backing_per!.set(value);
  }
  
  private __monitor_onPerChange1: (IMonitorDecoratedVariable | undefined);
  @Monitor({value:["per.ee.*", "per.dd"]}) 
  public onPerChange1(monitor: IMonitor) {}
  
  private __monitor_onPerChange2: (IMonitorDecoratedVariable | undefined);
  @Monitor({value:["per.ee", "per.dd.*"]}) 
  public onPerChange2(monitor: IMonitor) {}
  
  private __monitor_onPerChange3: (IMonitorDecoratedVariable | undefined);
  @Monitor({value:["per.*"]}) 
  public onPerChange3(monitor: IMonitor) {}
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
  }
  
  public constructor() {}
  
  static {
    
  }
}

class __EntryWrapper extends EntryPoint {
  @Memo() 
  public entry(): void {
    Index._invoke(undefined, undefined, undefined, undefined, undefined);
  }
  
  public constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @ComponentV2() export interface __Options_Index {
  @Local() 
  get per(): (Per | undefined) {
    return undefined;
  }
  @Local() 
  set per(per: (Per | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __backing_per(): (ILocalDecoratedVariable<Per> | undefined) {
    return undefined;
  }
  set __backing_per(__backing_per: (ILocalDecoratedVariable<Per> | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __options_has_per(): (boolean | undefined) {
    return undefined;
  }
  set __options_has_per(__options_has_per: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  
}

`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @Monitor decorator wildCard transformation',
    [parsedTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
