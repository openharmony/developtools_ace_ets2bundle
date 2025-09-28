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

const WATCH_DIR_PATH: string = 'decorators/watch';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, WATCH_DIR_PATH, 'watch-basic.ets'),
];

const watchTransform: Plugins = {
    name: 'watch',
    parsed: uiTransform().parsed,
};

const pluginTester = new PluginTester('test basic watch transform', buildConfig);

const expectedScript: string = `
import { IConsumeDecoratedVariable as IConsumeDecoratedVariable } from "arkui.stateManagement.decorator";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { IProvideDecoratedVariable as IProvideDecoratedVariable } from "arkui.stateManagement.decorator";

import { IObjectLinkDecoratedVariable as IObjectLinkDecoratedVariable } from "arkui.stateManagement.decorator";

import { IStoragePropRefDecoratedVariable as IStoragePropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { IStorageLinkDecoratedVariable as IStorageLinkDecoratedVariable } from "arkui.stateManagement.decorator";

import { LinkSourceType as LinkSourceType } from "arkui.stateManagement.decorator";

import { ILinkDecoratedVariable as ILinkDecoratedVariable } from "arkui.stateManagement.decorator";

import { IPropRefDecoratedVariable as IPropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { memo as memo } from "arkui.stateManagement.runtime";

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { OBSERVE as OBSERVE } from "arkui.stateManagement.decorator";

import { IMutableStateMeta as IMutableStateMeta } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Component as Component, Entry as Entry, Column as Column } from "@ohos.arkui.component";

import { State as State, PropRef as PropRef, StorageLink as StorageLink, StoragePropRef as StoragePropRef, Link as Link, Watch as Watch, ObjectLink as ObjectLink, Observed as Observed, Track as Track, Provide as Provide, Consume as Consume } from "@ohos.arkui.stateManagement";

function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/watch/watch-basic",
  pageFullPath: "test/demo/mock/decorators/watch/watch-basic",
  integratedHsp: "false",
  } as NavInterface));

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
  
  public propA: string = "hello";
  
  @JSONRename({newName:"trackA"}) private __backing_trackA: string = "world";
  
  @JSONStringifyIgnore() private __meta_trackA: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  public constructor() {}
  
  public get trackA(): string {
    this.conditionalAddRef(this.__meta_trackA);
    return this.__backing_trackA;
  }
  
  public set trackA(newValue: string) {
    if (((this.__backing_trackA) !== (newValue))) {
      this.__backing_trackA = newValue;
      this.__meta_trackA.fireChange();
      this.executeOnSubscribingWatches("trackA");
    }
  }
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_statevar = STATE_MGMT_FACTORY.makeState<string>(this, "statevar", ((({let gensym___76198660 = initializers;
    (((gensym___76198660) == (null)) ? undefined : gensym___76198660.statevar)})) ?? ("Hello World")), ((_: string): void => {
      this.stateOnChange(_);
    }));
    this.__backing_propvar = STATE_MGMT_FACTORY.makePropRef<string>(this, "propvar", ((({let gensym___241486692 = initializers;
    (((gensym___241486692) == (null)) ? undefined : gensym___241486692.propvar)})) ?? ("Hello World")), ((_: string): void => {
      this.propOnChange(_);
    }));
    if (({let gensym___165820150 = initializers;
    (((gensym___165820150) == (null)) ? undefined : gensym___165820150.__options_has_linkvar)})) {
      this.__backing_linkvar = STATE_MGMT_FACTORY.makeLink<string>(this, "linkvar", initializers!.__backing_linkvar!, ((_: string): void => {
        this.linkOnChange(_);
      }));
    };
    this.__backing_storagelinkvar = STATE_MGMT_FACTORY.makeStorageLink<string>(this, "prop1", "storagelinkvar", "Hello World", ((_: string): void => {
      this.storageLinkOnChange(_);
    }))
    this.__backing_storagepropvar = STATE_MGMT_FACTORY.makeStoragePropRef<string>(this, "prop2", "storagepropvar", "Hello World", ((_: string): void => {
      this.storagePropOnChange(_);
    }))
    this.__backing_objectlinkvar = STATE_MGMT_FACTORY.makeObjectLink<A>(this, "objectlinkvar", (({let gensym___172556967 = initializers;
    (((gensym___172556967) == (null)) ? undefined : gensym___172556967.objectlinkvar)}) as A), ((_: string): void => {
      this.objectLinkOnChange(_);
    }))
    this.__backing_providevar = STATE_MGMT_FACTORY.makeProvide<string>(this, "providevar", "providevar", ((({let gensym___244584558 = initializers;
    (((gensym___244584558) == (null)) ? undefined : gensym___244584558.providevar)})) ?? ("Hello World")), false, ((_: string): void => {
      this.ProvideOnChange(_);
    }));
  }
  
  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {
    if (({let gensym___122439192 = initializers;
    (((gensym___122439192) == (null)) ? undefined : gensym___122439192.__options_has_propvar)})) {
      this.__backing_propvar!.update((initializers!.propvar as string));
    }
    if (({let gensym___94896492 = initializers;
    (((gensym___94896492) == (null)) ? undefined : gensym___94896492.__options_has_objectlinkvar)})) {
      this.__backing_objectlinkvar!.update((initializers!.objectlinkvar as A));
    }
  }
  
  private __backing_statevar?: IStateDecoratedVariable<string>;
  
  public get statevar(): string {
    return this.__backing_statevar!.get();
  }
  
  public set statevar(value: string) {
    this.__backing_statevar!.set(value);
  }
  
  private __backing_propvar?: IPropRefDecoratedVariable<string>;
  
  public get propvar(): string {
    return this.__backing_propvar!.get();
  }
  
  public set propvar(value: string) {
    this.__backing_propvar!.set(value);
  }
  
  private __backing_linkvar?: ILinkDecoratedVariable<string>;

  public get linkvar(): string {
    return this.__backing_linkvar!.get();
  }

  public set linkvar(value: string) {
    this.__backing_linkvar!.set(value);
  }

  private __backing_storagelinkvar?: IStorageLinkDecoratedVariable<string>;
  
  public get storagelinkvar(): string {
    return this.__backing_storagelinkvar!.get();
  }
  
  public set storagelinkvar(value: string) {
    this.__backing_storagelinkvar!.set(value);
  }
  
  private __backing_storagepropvar?: IStoragePropRefDecoratedVariable<string>;
  
  public get storagepropvar(): string {
    return this.__backing_storagepropvar!.get();
  }
  
  public set storagepropvar(value: string) {
    this.__backing_storagepropvar!.set(value);
  }
  
  private __backing_objectlinkvar?: IObjectLinkDecoratedVariable<A>;

  public get objectlinkvar(): A {
    return this.__backing_objectlinkvar!.get();
  }

  private __backing_providevar?: IProvideDecoratedVariable<string>;
  
  public get providevar(): string {
    return this.__backing_providevar!.get();
  }
  
  public set providevar(value: string) {
    this.__backing_providevar!.set(value);
  }

  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: MyStateSample)=> void), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___92334354 = storage;
      (((gensym___92334354) == (null)) ? undefined : gensym___92334354())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): MyStateSample {
    throw new Error("Declare interface");
  }

  public stateOnChange(propName: string) {}
  
  public propOnChange(propName: string) {}
  
  public linkOnChange(propName: string) {}

  public storageLinkOnChange(propName: string) {}
  
  public storagePropOnChange(propName: string) {}
  
  public objectLinkOnChange(propName: string) {}

  public ProvideOnChange(propName: string) {}
  
  @memo() public build() {
    ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @memo() (() => {
      Child._invoke(@memo() ((instance: Child): void => {
        instance.applyAttributesFinish();
        return;
      }), undefined, undefined, undefined, undefined);
    }));
  }
  
  constructor(useSharedStorage: (boolean | undefined)) {
    this(useSharedStorage, undefined);
  }
  
  constructor() {
    this(undefined, undefined);
  }
  
  public constructor(useSharedStorage: (boolean | undefined), storage: (LocalStorage | undefined)) {
    super(useSharedStorage, storage);
  }
  
}

@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_providevar = STATE_MGMT_FACTORY.makeConsume<string>(this, "providevar", "providevar", ((_: string): void => {
      this.ConsumeOnChange(_);
    }));
  }

  public __updateStruct(initializers: (__Options_Child | undefined)): void {}

  private __backing_providevar?: IConsumeDecoratedVariable<string>;

  public get providevar(): string {
    return this.__backing_providevar!.get();
  }

  public set providevar(value: string) {
    this.__backing_providevar!.set(value);
  }
  
  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: Child)=> void), initializers: ((()=> __Options_Child) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Child, __Options_Child>(style, ((): Child => {
      return new Child(false, ({let gensym___29142858 = storage;
      (((gensym___29142858) == (null)) ? undefined : gensym___29142858())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Child, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): Child {
    throw new Error("Declare interface");
  }
  
  public ConsumeOnChange(propName: string) {}
  
  @memo() public build() {}
  
  constructor(useSharedStorage: (boolean | undefined)) {
    this(useSharedStorage, undefined);
  }
  
  constructor() {
    this(undefined, undefined);
  }
  
  public constructor(useSharedStorage: (boolean | undefined), storage: (LocalStorage | undefined)) {
    super(useSharedStorage, storage);
  }
  
}

@Retention({policy:"SOURCE"}) @interface __Link_intrinsic {}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() export interface __Options_MyStateSample {
  set statevar(statevar: (string | undefined))

  get statevar(): (string | undefined)
  @Watch({value:"stateOnChange"}) set __backing_statevar(__backing_statevar: (IStateDecoratedVariable<string> | undefined))

  @Watch({value:"stateOnChange"}) get __backing_statevar(): (IStateDecoratedVariable<string> | undefined)
  set __options_has_statevar(__options_has_statevar: (boolean | undefined))
  
  get __options_has_statevar(): (boolean | undefined)
  set propvar(propvar: (string | undefined))
  
  get propvar(): (string | undefined)
  @Watch({value:"propOnChange"}) set __backing_propvar(__backing_propvar: (IPropRefDecoratedVariable<string> | undefined))
  
  @Watch({value:"propOnChange"}) get __backing_propvar(): (IPropRefDecoratedVariable<string> | undefined)
  set __options_has_propvar(__options_has_propvar: (boolean | undefined))
  
  get __options_has_propvar(): (boolean | undefined)
  @__Link_intrinsic() set linkvar(linkvar: (string | undefined))
  
  @__Link_intrinsic() get linkvar(): (string | undefined)
  @Watch({value:"linkOnChange"}) set __backing_linkvar(__backing_linkvar: (LinkSourceType<string> | undefined))
  
  @Watch({value:"linkOnChange"}) get __backing_linkvar(): (LinkSourceType<string> | undefined)
  set __options_has_linkvar(__options_has_linkvar: (boolean | undefined))
  
  get __options_has_linkvar(): (boolean | undefined)
  set storagelinkvar(storagelinkvar: (string | undefined))
  
  get storagelinkvar(): (string | undefined)
  @Watch({value:"storageLinkOnChange"}) set __backing_storagelinkvar(__backing_storagelinkvar: (IStorageLinkDecoratedVariable<string> | undefined))
  
  @Watch({value:"storageLinkOnChange"}) get __backing_storagelinkvar(): (IStorageLinkDecoratedVariable<string> | undefined)
  set __options_has_storagelinkvar(__options_has_storagelinkvar: (boolean | undefined))
  
  get __options_has_storagelinkvar(): (boolean | undefined)
  set storagepropvar(storagepropvar: (string | undefined))
  
  get storagepropvar(): (string | undefined)
  @Watch({value:"storagePropOnChange"}) set __backing_storagepropvar(__backing_storagepropvar: (IStoragePropRefDecoratedVariable<string> | undefined))
  
  @Watch({value:"storagePropOnChange"}) get __backing_storagepropvar(): (IStoragePropRefDecoratedVariable<string> | undefined)
  set __options_has_storagepropvar(__options_has_storagepropvar: (boolean | undefined))
  
  get __options_has_storagepropvar(): (boolean | undefined)
  set objectlinkvar(objectlinkvar: (A | undefined))
  
  get objectlinkvar(): (A | undefined)
  @Watch({value:"objectLinkOnChange"}) set __backing_objectlinkvar(__backing_objectlinkvar: (IObjectLinkDecoratedVariable<A> | undefined))
  
  @Watch({value:"objectLinkOnChange"}) get __backing_objectlinkvar(): (IObjectLinkDecoratedVariable<A> | undefined)
  set __options_has_objectlinkvar(__options_has_objectlinkvar: (boolean | undefined))
  
  get __options_has_objectlinkvar(): (boolean | undefined)
  set providevar(providevar: (string | undefined))

  get providevar(): (string | undefined)
  @Watch({value:"ProvideOnChange"}) set __backing_providevar(__backing_providevar: (IProvideDecoratedVariable<string> | undefined))

  @Watch({value:"ProvideOnChange"}) get __backing_providevar(): (IProvideDecoratedVariable<string> | undefined)
  set __options_has_providevar(__options_has_providevar: (boolean | undefined))
  
  get __options_has_providevar(): (boolean | undefined)
  
}

@Component() export interface __Options_Child {
  set providevar(providevar: (string | undefined))

  get providevar(): (string | undefined)
  @Watch({value:"ConsumeOnChange"}) set __backing_providevar(__backing_providevar: (IConsumeDecoratedVariable<string> | undefined))

  @Watch({value:"ConsumeOnChange"}) get __backing_providevar(): (IConsumeDecoratedVariable<string> | undefined)
  set __options_has_providevar(__options_has_providevar: (boolean | undefined))
  
  get __options_has_providevar(): (boolean | undefined)
  
}

class __EntryWrapper extends EntryPoint {
  @memo() public entry(): void {
    MyStateSample._invoke(@memo() ((instance: MyStateSample): void => {
      instance.applyAttributesFinish();
      return;
    }), undefined, undefined, undefined, undefined);
  }
  
  public constructor() {}
  
}
`;

function testWatchTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test basic watch transform',
    [watchTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testWatchTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
