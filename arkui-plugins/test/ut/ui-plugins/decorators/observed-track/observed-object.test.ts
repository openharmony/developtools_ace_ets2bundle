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
import { beforeUINoRecheck, recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const OBSERVED_DIR_PATH: string = 'decorators/observed-track';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, OBSERVED_DIR_PATH, 'observed-object.ets'),
];

const observedTransform: Plugins = {
    name: 'observed',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test observed class transform with Non-null objects', buildConfig);

const expectedScript: string = `

import { STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { ISubscribedWatches } from "arkui.stateManagement.decorator";

import { WatchIdType } from "arkui.stateManagement.decorator";

import { RenderIdType } from "arkui.stateManagement.decorator";

import { IMutableStateMeta } from "arkui.stateManagement.decorator";

import { IObservedObject } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { ButtonImpl } from "arkui.component.button";

import { ButtonAttribute } from "arkui.component.button";

import { Memo } from "arkui.incremental.annotation";

import { ColumnImpl } from "arkui.component.column";

import { ColumnAttribute } from "arkui.component.column";

import { MemoIntrinsic } from "arkui.incremental.annotation";

import { ILinkDecoratedVariable } from "arkui.stateManagement.decorator";

import { LinkSourceType } from "arkui.stateManagement.decorator";

import { Memo } from "arkui.incremental.annotation";

import { ComponentBuilder } from "arkui.component.builder";

import { LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { Builder } from "arkui.component.builder";

import { CustomComponent } from "arkui.component.customComponent";

import { ReusePoolOwnership } from "arkui.component.customComponent";

import { PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint } from "arkui.component.customComponent";

import { NavInterface } from "arkui.component.customComponent";

import { Text, Column, Component, Entry, Button, ClickEvent } from "@ohos.arkui.component";

import { State, Link, PropRef, Observed, Track } from "@ohos.arkui.stateManagement";

import hilog from "@ohos.hilog";

let a = 1;
function main() {}

a = 1;
__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/observed-track/observed-object",
  pageFullPath: "test/demo/mock/decorators/observed-track/observed-object",
  integratedHsp: "false",
} as NavInterface));
interface I {
  get a(): string
  set a(a: string)
  get b(): string
  set b(b: string)
  
}

@Observed() class CI implements I, IObservedObject, ISubscribedWatches {
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
  @JSONRename({newName:"a"}) public __backing_a?: string;
  @JSONRename({newName:"b"}) public __backing_b?: string;
  public constructor(a: string, b: string) {
    this.a = a;
    this.b = b;
  }
  
  public get a(): string {
    this.conditionalAddRef(this.__meta);
    return this.__backing_a!;
  }
  public set a(newValue: string) {
    if (((this.__backing_a) !== (newValue))) {
      this.__backing_a = newValue;
      this.__meta.fireChange();
      this.executeOnSubscribingWatches("a");
    }
  }
  
  public get b(): string {
    this.conditionalAddRef(this.__meta);
    return this.__backing_b!;
  }
  public set b(newValue: string) {
    if (((this.__backing_b) !== (newValue))) {
      this.__backing_b = newValue;
      this.__meta.fireChange();
      this.executeOnSubscribingWatches("b");
    }
  }
  
  static {
    
  }
}

@Observed() class CIRaw implements IObservedObject, ISubscribedWatches {
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
  @JSONRename({newName:"a"}) public __backing_a?: string;
  public get a(): string {
    this.conditionalAddRef(this.__meta);
    return (this.__backing_a as string);
  }
  
  public set a(newValue: string) {
    if (((this.__backing_a) !== (newValue))) {
      this.__backing_a = newValue;
      this.__meta.fireChange();
      this.executeOnSubscribingWatches("a");
    }
  }
  
  @JSONRename({newName:"b"}) public __backing_b?: string;
  public get b(): string {
    this.conditionalAddRef(this.__meta);
    return (this.__backing_b as string);
  }
  
  public set b(newValue: string) {
    if (((this.__backing_b) !== (newValue))) {
      this.__backing_b = newValue;
      this.__meta.fireChange();
      this.executeOnSubscribingWatches("b");
    }
  }
  
  public constructor(a: string, b: string) {
    this.a = a;
    this.b = b;
  }
  
  static {
    
  }
}

@Entry() @Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_i = STATE_MGMT_FACTORY.makeState<I>(this, "i", (({let gensym___74880700 = initializers;
    (((gensym___74880700) == (null)) ? undefined : gensym___74880700.__options_has_i)}) ? (initializers!.i as I) : ({
      a: "aaa",
      b: "b",
    } as I)));
    this.__backing_ci = STATE_MGMT_FACTORY.makeState<CI>(this, "ci", (({let gensym___78501714 = initializers;
    (((gensym___78501714) == (null)) ? undefined : gensym___78501714.__options_has_ci)}) ? (initializers!.ci as CI) : (new CI("a", "b") as CI)));
    this.__backing_ciRaw = STATE_MGMT_FACTORY.makeState<CIRaw>(this, "ciRaw", (({let gensym___73276502 = initializers;
    (((gensym___73276502) == (null)) ? undefined : gensym___73276502.__options_has_ciRaw)}) ? (initializers!.ciRaw as CIRaw) : (new CIRaw("a", "b") as CIRaw)));
  }
  
  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_MyStateSample | undefined)): void {
    this.__backing_i!.resetOnReuse(((({let gensym___90372058 = initializers;
    (((gensym___90372058) == (null)) ? undefined : gensym___90372058.i)})) ?? (({
      a: "aaa",
      b: "b",
    } as I))));
    this.__backing_ci!.resetOnReuse((((({let gensym___260749844 = initializers;
    (((gensym___260749844) == (null)) ? undefined : gensym___260749844.ci)})) ?? (new CI("a", "b"))) as CI));
    this.__backing_ciRaw!.resetOnReuse((((({let gensym___223829024 = initializers;
    (((gensym___223829024) == (null)) ? undefined : gensym___223829024.ciRaw)})) ?? (new CIRaw("a", "b"))) as CIRaw));
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: MyStateSample)=> void) | undefined), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___249621102 = storage;
      (((gensym___249621102) == (null)) ? undefined : gensym___249621102())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() content?: (()=> void)): MyStateSample {
    throw new Error("Declare interface");
  }
  
  private __backing_i?: IStateDecoratedVariable<I>;
  public get i(): I {
    return this.__backing_i!.get();
  }
  
  public set i(value: I) {
    this.__backing_i!.set(value);
  }
  
  private __backing_ci?: IStateDecoratedVariable<CI>;
  public get ci(): CI {
    return this.__backing_ci!.get();
  }
  
  public set ci(value: CI) {
    this.__backing_ci!.set(value);
  }
  
  private __backing_ciRaw?: IStateDecoratedVariable<CIRaw>;
  public get ciRaw(): CIRaw {
    return this.__backing_ciRaw!.get();
  }
  
  public set ciRaw(value: CIRaw) {
    this.__backing_ciRaw!.set(value);
  }
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).margin(10);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions(\`@State i.a: \${this.i.a}\`, undefined).onClick(((e: ClickEvent) => {
          this.i.a += "a";
        }));
        instance.applyAttributesFinish();
        return;
      }), undefined);
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions(\`@State ci.a: \${this.ci.a}\`, undefined).onClick(((e: ClickEvent) => {
          this.ci.a += "a";
        }));
        instance.applyAttributesFinish();
        return;
      }), undefined);
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions(\`@State ciRaw.a: \${this.ciRaw.a}\`, undefined).onClick(((e: ClickEvent) => {
          this.ciRaw.a += "a";
        }));
        instance.applyAttributesFinish();
        return;
      }), undefined);
      LinkChild._invoke(undefined, (() => {
        return {
          __backing_i: (this.__backing_i as IStateDecoratedVariable<I>),
          __options_has_i: true,
          __backing_ci: (this.__backing_ci as IStateDecoratedVariable<CI>),
          __options_has_ci: true,
          __backing_ciRaw: (this.__backing_ciRaw as IStateDecoratedVariable<CIRaw>),
          __options_has_ciRaw: true,
        };
      }), undefined, undefined, undefined);
    }));
  }
  
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  
  static {
    
  }
}

@Component() final struct LinkChild extends CustomComponent<LinkChild, __Options_LinkChild> {
  public __initializeStruct(initializers: (__Options_LinkChild | undefined), @Memo() content: ((()=> void) | undefined)): void {
    if (({let gensym___202136482 = initializers;
    (((gensym___202136482) == (null)) ? undefined : gensym___202136482.__options_has_i)})) {
      this.__backing_i = STATE_MGMT_FACTORY.makeLink<I>(this, "i", initializers!.__backing_i!);
    }
    if (({let gensym___229535727 = initializers;
    (((gensym___229535727) == (null)) ? undefined : gensym___229535727.__options_has_ci)})) {
      this.__backing_ci = STATE_MGMT_FACTORY.makeLink<CI>(this, "ci", initializers!.__backing_ci!);
    }
    if (({let gensym___148795253 = initializers;
    (((gensym___148795253) == (null)) ? undefined : gensym___148795253.__options_has_ciRaw)})) {
      this.__backing_ciRaw = STATE_MGMT_FACTORY.makeLink<CIRaw>(this, "ciRaw", initializers!.__backing_ciRaw!);
    }
  }
  
  public __updateStruct(initializers: (__Options_LinkChild | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_LinkChild | undefined)): void {
    this.__backing_i!.resetOnReuse(initializers!.__backing_i!);
    this.__backing_ci!.resetOnReuse(initializers!.__backing_ci!);
    this.__backing_ciRaw!.resetOnReuse(initializers!.__backing_ciRaw!);
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: LinkChild)=> void) | undefined), initializers: ((()=> __Options_LinkChild) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<LinkChild, __Options_LinkChild>(style, ((): LinkChild => {
      return new LinkChild(false, ({let gensym___9944067 = storage;
      (((gensym___9944067) == (null)) ? undefined : gensym___9944067())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_LinkChild, storage?: LocalStorage, @Builder() content?: (()=> void)): LinkChild {
    throw new Error("Declare interface");
  }
  
  private __backing_i?: ILinkDecoratedVariable<I>;
  public get i(): I {
    return this.__backing_i!.get();
  }
  
  public set i(value: I) {
    this.__backing_i!.set(value);
  }
  
  private __backing_ci?: ILinkDecoratedVariable<CI>;
  public get ci(): CI {
    return this.__backing_ci!.get();
  }
  
  public set ci(value: CI) {
    this.__backing_ci!.set(value);
  }
  
  private __backing_ciRaw?: ILinkDecoratedVariable<CIRaw>;
  public get ciRaw(): CIRaw {
    return this.__backing_ciRaw!.get();
  }
  
  public set ciRaw(value: CIRaw) {
    this.__backing_ciRaw!.set(value);
  }
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).margin(10);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions(\`@Link i.a: \${this.i.a}\`, undefined).onClick(((e: ClickEvent) => {
          this.i.a += "a";
        }));
        instance.applyAttributesFinish();
        return;
      }), undefined);
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions(\`@Link ci.a: \${this.ci.a}\`, undefined).onClick(((e: ClickEvent) => {
          this.ci.a += "a";
        }));
        instance.applyAttributesFinish();
        return;
      }), undefined);
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions(\`@Link ciRaw.a: \${this.ciRaw.a}\`, undefined).onClick(((e: ClickEvent) => {
          this.ciRaw.a += "a";
        }));
        instance.applyAttributesFinish();
        return;
      }), undefined);
    }));
  }
  
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  
  static {
    
  }
}

class __EntryWrapper extends EntryPoint {
  @Memo() 
  public entry(): void {
    MyStateSample._invoke(undefined, undefined, undefined, undefined, undefined);
  }
  
  public static RegisterNamedRouter(routerName: string, instance: EntryPoint, param: NavInterface): void {
    EntryPoint.RegisterNamedRouter(routerName, instance, param);
  }
  
  public constructor() {}
  
}

@Entry() @Component() class __Options_MyStateSample {
  @State() public i?: I;
  public __backing_i?: IStateDecoratedVariable<I>;
  public __options_has_i?: boolean;
  @State() public ci?: CI;
  public __backing_ci?: IStateDecoratedVariable<CI>;
  public __options_has_ci?: boolean;
  @State() public ciRaw?: CIRaw;
  public __backing_ciRaw?: IStateDecoratedVariable<CIRaw>;
  public __options_has_ciRaw?: boolean;
  public constructor() {}
  
}

@Component() class __Options_LinkChild {
  @Link() public i: I;
  public __backing_i?: LinkSourceType<I>;
  public __options_has_i?: boolean;
  @Link() public ci: CI;
  public __backing_ci?: LinkSourceType<CI>;
  public __options_has_ci?: boolean;
  @Link() public ciRaw: CIRaw;
  public __backing_ciRaw?: LinkSourceType<CIRaw>;
  public __options_has_ciRaw?: boolean;
  public constructor() {}
  
}
`;

function testObservedJsonStringifyIgnoreTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test observed transform with Non-null objects',
    [observedTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testObservedJsonStringifyIgnoreTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
