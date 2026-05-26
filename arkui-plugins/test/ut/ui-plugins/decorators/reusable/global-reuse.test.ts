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
import { mockBuildConfig } from '../../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../../utils/path-config';
import { parseDumpSrc } from '../../../../utils/parse-string';
import { uiNoRecheck, recheck, collectNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, dumpConstructor } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const REUSABLE_DIR_PATH: string = 'decorators/reusable';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, REUSABLE_DIR_PATH, 'global-reuse.ets'),
];

const reusableTransform: Plugins = {
    name: 'reusable',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test global reuse', buildConfig);

const expectedScript: string = `

import { IConsumeDecoratedVariable as IConsumeDecoratedVariable } from "arkui.stateManagement.decorator";

import { IPropRefDecoratedVariable as IPropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { IProvideDecoratedVariable as IProvideDecoratedVariable } from "arkui.stateManagement.decorator";

import { IObjectLinkDecoratedVariable as IObjectLinkDecoratedVariable } from "arkui.stateManagement.decorator";

import { ILocalStoragePropRefDecoratedVariable as ILocalStoragePropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { IStoragePropRefDecoratedVariable as IStoragePropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { LinkSourceType as LinkSourceType } from "arkui.stateManagement.decorator";

import { ILinkDecoratedVariable as ILinkDecoratedVariable } from "arkui.stateManagement.decorator";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { IGlobalReusePoolVariable as IGlobalReusePoolVariable } from "arkui.stateManagement.decorator";

import { Memo as Memo } from "arkui.incremental.annotation";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { IMutableStateMeta as IMutableStateMeta } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { Memo as Memo } from "arkui.incremental.annotation";

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { ReusePoolOwnership as ReusePoolOwnership } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, Column as Column, Component as Component, ComponentV2 as ComponentV2, Entry as Entry, Reusable as Reusable, ReusableV2 as ReusableV2, ReusePoolOwnership as ReusePoolOwnership } from "@ohos.arkui.component";

import { Observed as Observed, Link as Link, State as State, StoragePropRef as StoragePropRef, LocalStoragePropRef as LocalStoragePropRef, ObjectLink as ObjectLink, Provide as Provide, Consume as Consume, PropRef as PropRef, Watch as Watch } from "@ohos.arkui.stateManagement";

function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/reusable/global-reuse",
  pageFullPath: "test/demo/mock/decorators/reusable/global-reuse",
  integratedHsp: "false",
} as NavInterface));
@Observed() class MyClassB implements IObservedObject, ISubscribedWatches {
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
  public constructor() {}
  
  static {
    
  }
}

@Entry() @Component({reusePool:ReusePoolOwnership.SHARED,poolAccepts:["ComA", "ComB"]}) final struct Index extends CustomComponent<Index, __Options_Index> implements PageLifeCycle {
  private __backing_reusePool?: IGlobalReusePoolVariable;
  public __initializeStruct(initializers: (__Options_Index | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_reusePool = STATE_MGMT_FACTORY.makeGlobalReusePool(ReusePoolOwnership.SHARED, [Class.from<ComA>(), Class.from<ComB>()], this);
  }
  
  public __updateStruct(initializers: (__Options_Index | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_Index | undefined)): void {}
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: Index)=> void) | undefined), initializers: ((()=> __Options_Index) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Index, __Options_Index>(style, ((): Index => {
      return new Index(false, ({let gensym___203542966 = storage;
      (((gensym___203542966) == (null)) ? undefined : gensym___203542966())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Index, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): Index {
    throw new Error("Declare interface");
  }
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
  }
  
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  
  static {
    
  }
}

@Reusable() @Component() final struct ComA extends CustomComponent<ComA, __Options_ComA> {
  public __initializeStruct(initializers: (__Options_ComA | undefined), @Memo() content: ((()=> void) | undefined)): void {
    if (({let gensym___133282677 = initializers;
    (((gensym___133282677) == (null)) ? undefined : gensym___133282677.__options_has_linkVar)})) {
      this.__backing_linkVar = STATE_MGMT_FACTORY.makeLink<number>(this, "linkVar", initializers!.__backing_linkVar!);
    };
    this.__backing_str = STATE_MGMT_FACTORY.makeState<string>(this, "str", ((({let gensym___195569523 = initializers;
    (((gensym___195569523) == (null)) ? undefined : gensym___195569523.str)})) ?? ("aaa")));
    this.__backing_prop1 = STATE_MGMT_FACTORY.makeStoragePropRef<string>(this, "appTheme", "prop1", "bbb")
    this.__backing_prop2 = STATE_MGMT_FACTORY.makeLocalStoragePropRef<string>(this, "localTheme", "prop2", "ccc")
    this.__backing_objLinkVar = STATE_MGMT_FACTORY.makeObjectLink<MyClassB>(this, "objLinkVar", (({let gensym___208007857 = initializers;
    (((gensym___208007857) == (null)) ? undefined : gensym___208007857.objLinkVar)}) as MyClassB))
    this.__backing_provideVar = STATE_MGMT_FACTORY.makeProvide<string>(this, "provideVar", "alias", ((({let gensym___83712361 = initializers;
    (((gensym___83712361) == (null)) ? undefined : gensym___83712361.provideVar)})) ?? ("ddd")), false);
    this.__backing_propVar1 = STATE_MGMT_FACTORY.makePropRef<string>(this, "propVar1", (initializers!.propVar1 as string));
    this.__backing_propVar2 = STATE_MGMT_FACTORY.makePropRef<string>(this, "propVar2", ((({let gensym___118459291 = initializers;
    (((gensym___118459291) == (null)) ? undefined : gensym___118459291.propVar2)})) ?? ("eee")));
    this.__backing_consumeVar1 = STATE_MGMT_FACTORY.makeConsume<string>(this, "consumeVar1", "consumeVar1");
    this.__backing_consumeVar2 = STATE_MGMT_FACTORY.makeConsume<string>(this, "consumeVar2", "alias");
    this.__backing_consumeVar3 = STATE_MGMT_FACTORY.makeConsume<string>(this, "consumeVar3", "alias", ((_: string): void => {
      this.onVarChange(_);
    }), {
      defaultValue: "default",
    });
    this.__backing_consumeVar4 = STATE_MGMT_FACTORY.makeConsume<string>(this, "consumeVar4", "alias", ((_: string): void => {
      this.onVarChange(_);
    }));
    this.__backing_consumeVar5 = STATE_MGMT_FACTORY.makeConsume<string>(this, "consumeVar5", "alias", undefined, {
      defaultValue: "default",
    });
  }
  
  public __updateStruct(initializers: (__Options_ComA | undefined)): void {
    if (({let gensym___110653160 = initializers;
    (((gensym___110653160) == (null)) ? undefined : gensym___110653160.__options_has_objLinkVar)})) {
      this.__backing_objLinkVar!.update((initializers!.objLinkVar as MyClassB));
    }
    if (({let gensym___121648189 = initializers;
    (((gensym___121648189) == (null)) ? undefined : gensym___121648189.__options_has_propVar1)})) {
      this.__backing_propVar1!.update((initializers!.propVar1 as string));
    }
    if (({let gensym___22315878 = initializers;
    (((gensym___22315878) == (null)) ? undefined : gensym___22315878.__options_has_propVar2)})) {
      this.__backing_propVar2!.update((initializers!.propVar2 as string));
    }
  }
  
  public override constructor __toRecord(params: Object): Record<string, Object> {
    const paramsCasted = (params as __Options_ComA);
    return {
      "linkVar": ((paramsCasted.linkVar) ?? (new Object())),
      "str": ((paramsCasted.str) ?? (new Object())),
      "prop1": ((paramsCasted.prop1) ?? (new Object())),
      "prop2": ((paramsCasted.prop2) ?? (new Object())),
      "objLinkVar": ((paramsCasted.objLinkVar) ?? (new Object())),
      "provideVar": ((paramsCasted.provideVar) ?? (new Object())),
      "propVar1": ((paramsCasted.propVar1) ?? (new Object())),
      "propVar2": ((paramsCasted.propVar2) ?? (new Object())),
      "consumeVar1": ((paramsCasted.consumeVar1) ?? (new Object())),
      "consumeVar2": ((paramsCasted.consumeVar2) ?? (new Object())),
      "consumeVar3": ((paramsCasted.consumeVar3) ?? (new Object())),
      "consumeVar4": ((paramsCasted.consumeVar4) ?? (new Object())),
      "consumeVar5": ((paramsCasted.consumeVar5) ?? (new Object())),
    };
  }
  
  public resetStateVarsOnReuse(initializers: (__Options_ComA | undefined)): void {
    this.__backing_linkVar!.resetOnReuse(initializers!.__backing_linkVar!);
    this.__backing_str!.resetOnReuse("aaa");
    this.__backing_prop1!.resetOnReuse();
    this.__backing_prop2!.resetOnReuse();
    this.__backing_objLinkVar!.resetOnReuse((initializers!.objLinkVar as MyClassB));
    this.__backing_provideVar!.resetOnReuse("ddd");
    this.__backing_propVar1!.resetOnReuse((initializers!.propVar1 as string));
    this.__backing_propVar2!.resetOnReuse(((({let gensym___196553660 = initializers;
    (((gensym___196553660) == (null)) ? undefined : gensym___196553660.propVar2)})) ?? ("eee")));
    this.__backing_consumeVar1!.resetOnReuse("consumeVar1");
    this.__backing_consumeVar2!.resetOnReuse("alias");
    this.__backing_consumeVar3!.resetOnReuse("alias", ((_: string): void => {
      this.onVarChange(_);
    }), {
      defaultValue: "default",
    });
    this.__backing_consumeVar4!.resetOnReuse("alias", ((_: string): void => {
      this.onVarChange(_);
    }));
    this.__backing_consumeVar5!.resetOnReuse("alias", undefined, {
      defaultValue: "default",
    });
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: ComA)=> void) | undefined), initializers: ((()=> __Options_ComA) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<ComA, __Options_ComA>(style, ((): ComA => {
      return new ComA(false, ({let gensym___115465836 = storage;
      (((gensym___115465836) == (null)) ? undefined : gensym___115465836())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ComA, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): ComA {
    throw new Error("Declare interface");
  }
  
  private __backing_linkVar?: ILinkDecoratedVariable<number>;
  public get linkVar(): number {
    return this.__backing_linkVar!.get();
  }
  
  public set linkVar(value: number) {
    this.__backing_linkVar!.set(value);
  }
  
  private __backing_str?: IStateDecoratedVariable<string>;
  public get str(): string {
    return this.__backing_str!.get();
  }
  
  public set str(value: string) {
    this.__backing_str!.set(value);
  }
  
  private __backing_prop1?: IStoragePropRefDecoratedVariable<string>;
  public get prop1(): string {
    return this.__backing_prop1!.get();
  }
  
  public set prop1(value: string) {
    this.__backing_prop1!.set(value);
  }
  
  private __backing_prop2?: ILocalStoragePropRefDecoratedVariable<string>;
  public get prop2(): string {
    return this.__backing_prop2!.get();
  }
  
  public set prop2(value: string) {
    this.__backing_prop2!.set(value);
  }
  
  private __backing_objLinkVar?: IObjectLinkDecoratedVariable<MyClassB>;
  public get objLinkVar(): MyClassB {
    return this.__backing_objLinkVar!.get();
  }
  
  private __backing_provideVar?: IProvideDecoratedVariable<string>;
  public get provideVar(): string {
    return this.__backing_provideVar!.get();
  }
  
  public set provideVar(value: string) {
    this.__backing_provideVar!.set(value);
  }
  
  private __backing_propVar1?: IPropRefDecoratedVariable<string>;
  public get propVar1(): string {
    return this.__backing_propVar1!.get();
  }
  
  public set propVar1(value: string) {
    this.__backing_propVar1!.set(value);
  }
  
  private __backing_propVar2?: IPropRefDecoratedVariable<string>;
  public get propVar2(): string {
    return this.__backing_propVar2!.get();
  }
  
  public set propVar2(value: string) {
    this.__backing_propVar2!.set(value);
  }
  
  private __backing_consumeVar1?: IConsumeDecoratedVariable<string>;
  public get consumeVar1(): string {
    return this.__backing_consumeVar1!.get();
  }
  
  public set consumeVar1(value: string) {
    this.__backing_consumeVar1!.set(value);
  }
  
  private __backing_consumeVar2?: IConsumeDecoratedVariable<string>;
  public get consumeVar2(): string {
    return this.__backing_consumeVar2!.get();
  }
  
  public set consumeVar2(value: string) {
    this.__backing_consumeVar2!.set(value);
  }
  
  private __backing_consumeVar3?: IConsumeDecoratedVariable<string>;
  public get consumeVar3(): string {
    return this.__backing_consumeVar3!.get();
  }
  
  public set consumeVar3(value: string) {
    this.__backing_consumeVar3!.set(value);
  }
  
  private __backing_consumeVar4?: IConsumeDecoratedVariable<string>;
  public get consumeVar4(): string {
    return this.__backing_consumeVar4!.get();
  }
  
  public set consumeVar4(value: string) {
    this.__backing_consumeVar4!.set(value);
  }
  
  private __backing_consumeVar5?: IConsumeDecoratedVariable<string>;
  public get consumeVar5(): string {
    return this.__backing_consumeVar5!.get();
  }
  
  public set consumeVar5(value: string) {
    this.__backing_consumeVar5!.set(value);
  }
  
  public onVarChange(var: string) {}
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {}));
  }
  
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  
  static {
    
  }
}

@ReusableV2() @ComponentV2() final struct ComB extends CustomComponentV2<ComB, __Options_ComB> {
  public __initializeStruct(initializers: (__Options_ComB | undefined), @Memo() content: ((()=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_ComB | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_ComB | undefined)): void {}
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: ComB)=> void) | undefined), initializers: ((()=> __Options_ComB) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<ComB, __Options_ComB>(style, ((): ComB => {
      return new ComB();
    }), initializers, reuseId, content, {
      sClass: Class.from<ComB>(),
    });
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ComB, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): ComB {
    throw new Error("Declare interface");
  }
  
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
  
  public static RegisterNamedRouter(routerName: string, instance: EntryPoint, param: NavInterface): void {
    EntryPoint.RegisterNamedRouter(routerName, instance, param);
  }
  
  public constructor() {}
  
}

@Entry() @Component({reusePool:ReusePoolOwnership.SHARED,poolAccepts:["ComA", "ComB"]}) interface __Options_Index {
  
}

@Reusable() @Component() interface __Options_ComA {
  @Link() 
  get linkVar(): (number | undefined) {
    return undefined;
  }
  @Link() 
  set linkVar(linkVar: (number | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __backing_linkVar(): (LinkSourceType<number> | undefined) {
    return undefined;
  }
  set __backing_linkVar(__backing_linkVar: (LinkSourceType<number> | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __options_has_linkVar(): (boolean | undefined) {
    return undefined;
  }
  set __options_has_linkVar(__options_has_linkVar: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  @State() 
  get str(): (string | undefined) {
    return undefined;
  }
  @State() 
  set str(str: (string | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __backing_str(): (IStateDecoratedVariable<string> | undefined) {
    return undefined;
  }
  set __backing_str(__backing_str: (IStateDecoratedVariable<string> | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __options_has_str(): (boolean | undefined) {
    return undefined;
  }
  set __options_has_str(__options_has_str: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  @StoragePropRef({value:"appTheme"}) 
  get prop1(): (string | undefined) {
    return undefined;
  }
  @StoragePropRef({value:"appTheme"}) 
  set prop1(prop1: (string | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __backing_prop1(): (IStoragePropRefDecoratedVariable<string> | undefined) {
    return undefined;
  }
  set __backing_prop1(__backing_prop1: (IStoragePropRefDecoratedVariable<string> | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __options_has_prop1(): (boolean | undefined) {
    return undefined;
  }
  set __options_has_prop1(__options_has_prop1: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  @LocalStoragePropRef({value:"localTheme"}) 
  get prop2(): (string | undefined) {
    return undefined;
  }
  @LocalStoragePropRef({value:"localTheme"}) 
  set prop2(prop2: (string | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __backing_prop2(): (ILocalStoragePropRefDecoratedVariable<string> | undefined) {
    return undefined;
  }
  set __backing_prop2(__backing_prop2: (ILocalStoragePropRefDecoratedVariable<string> | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __options_has_prop2(): (boolean | undefined) {
    return undefined;
  }
  set __options_has_prop2(__options_has_prop2: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  @ObjectLink() 
  get objLinkVar(): MyClassB
  @ObjectLink() 
  set objLinkVar(objLinkVar: MyClassB)
  get __backing_objLinkVar(): (IObjectLinkDecoratedVariable<MyClassB> | undefined) {
    return undefined;
  }
  set __backing_objLinkVar(__backing_objLinkVar: (IObjectLinkDecoratedVariable<MyClassB> | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __options_has_objLinkVar(): (boolean | undefined) {
    return undefined;
  }
  set __options_has_objLinkVar(__options_has_objLinkVar: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  @Provide({alias:"alias"}) 
  get provideVar(): (string | undefined) {
    return undefined;
  }
  @Provide({alias:"alias"}) 
  set provideVar(provideVar: (string | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __backing_provideVar(): (IProvideDecoratedVariable<string> | undefined) {
    return undefined;
  }
  set __backing_provideVar(__backing_provideVar: (IProvideDecoratedVariable<string> | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __options_has_provideVar(): (boolean | undefined) {
    return undefined;
  }
  set __options_has_provideVar(__options_has_provideVar: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  @PropRef() 
  get propVar1(): (string | undefined) {
    return undefined;
  }
  @PropRef() 
  set propVar1(propVar1: (string | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __backing_propVar1(): (IPropRefDecoratedVariable<string> | undefined) {
    return undefined;
  }
  set __backing_propVar1(__backing_propVar1: (IPropRefDecoratedVariable<string> | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __options_has_propVar1(): (boolean | undefined) {
    return undefined;
  }
  set __options_has_propVar1(__options_has_propVar1: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  @PropRef() 
  get propVar2(): (string | undefined) {
    return undefined;
  }
  @PropRef() 
  set propVar2(propVar2: (string | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __backing_propVar2(): (IPropRefDecoratedVariable<string> | undefined) {
    return undefined;
  }
  set __backing_propVar2(__backing_propVar2: (IPropRefDecoratedVariable<string> | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __options_has_propVar2(): (boolean | undefined) {
    return undefined;
  }
  set __options_has_propVar2(__options_has_propVar2: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  @Consume() 
  get consumeVar1(): (string | undefined) {
    return undefined;
  }
  @Consume() 
  set consumeVar1(consumeVar1: (string | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __backing_consumeVar1(): (IConsumeDecoratedVariable<string> | undefined) {
    return undefined;
  }
  set __backing_consumeVar1(__backing_consumeVar1: (IConsumeDecoratedVariable<string> | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __options_has_consumeVar1(): (boolean | undefined) {
    return undefined;
  }
  set __options_has_consumeVar1(__options_has_consumeVar1: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  @Consume({alias:"alias"}) 
  get consumeVar2(): (string | undefined) {
    return undefined;
  }
  @Consume({alias:"alias"}) 
  set consumeVar2(consumeVar2: (string | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __backing_consumeVar2(): (IConsumeDecoratedVariable<string> | undefined) {
    return undefined;
  }
  set __backing_consumeVar2(__backing_consumeVar2: (IConsumeDecoratedVariable<string> | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __options_has_consumeVar2(): (boolean | undefined) {
    return undefined;
  }
  set __options_has_consumeVar2(__options_has_consumeVar2: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  @Consume({alias:"alias"}) 
  @Watch({value:"onVarChange"}) 
  get consumeVar3(): (string | undefined) {
    return undefined;
  }
  @Consume({alias:"alias"}) 
  @Watch({value:"onVarChange"}) 
  set consumeVar3(consumeVar3: (string | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __backing_consumeVar3(): (IConsumeDecoratedVariable<string> | undefined) {
    return undefined;
  }
  set __backing_consumeVar3(__backing_consumeVar3: (IConsumeDecoratedVariable<string> | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __options_has_consumeVar3(): (boolean | undefined) {
    return undefined;
  }
  set __options_has_consumeVar3(__options_has_consumeVar3: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  @Consume({alias:"alias"}) 
  @Watch({value:"onVarChange"}) 
  get consumeVar4(): (string | undefined) {
    return undefined;
  }
  @Consume({alias:"alias"}) 
  @Watch({value:"onVarChange"}) 
  set consumeVar4(consumeVar4: (string | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __backing_consumeVar4(): (IConsumeDecoratedVariable<string> | undefined) {
    return undefined;
  }
  set __backing_consumeVar4(__backing_consumeVar4: (IConsumeDecoratedVariable<string> | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __options_has_consumeVar4(): (boolean | undefined) {
    return undefined;
  }
  set __options_has_consumeVar4(__options_has_consumeVar4: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  @Consume({alias:"alias"}) 
  get consumeVar5(): (string | undefined) {
    return undefined;
  }
  @Consume({alias:"alias"}) 
  set consumeVar5(consumeVar5: (string | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __backing_consumeVar5(): (IConsumeDecoratedVariable<string> | undefined) {
    return undefined;
  }
  set __backing_consumeVar5(__backing_consumeVar5: (IConsumeDecoratedVariable<string> | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __options_has_consumeVar5(): (boolean | undefined) {
    return undefined;
  }
  set __options_has_consumeVar5(__options_has_consumeVar5: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  
}

@ReusableV2() @ComponentV2() interface __Options_ComB {
  
}

`;

function testReusableTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test global reuse',
    [reusableTransform, collectNoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testReusableTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
