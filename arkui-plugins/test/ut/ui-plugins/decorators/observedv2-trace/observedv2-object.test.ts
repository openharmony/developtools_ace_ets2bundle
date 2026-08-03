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

const OBSERVED_DIR_PATH: string = 'decorators/observedv2-trace';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, OBSERVED_DIR_PATH, 'observedv2-object.ets'),
];

const observedTransform: Plugins = {
    name: 'observed',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test observedV2 class transform with Non-null objects', buildConfig);

const expectedScript: string = `


import { IMutableStateMeta } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { UIUtils } from "arkui.stateManagement.utils";

import { ISubscribedWatches } from "arkui.stateManagement.decorator";

import { WatchIdType } from "arkui.stateManagement.decorator";

import { RenderIdType } from "arkui.stateManagement.decorator";

import { IObservedObject } from "arkui.stateManagement.decorator";

import { ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { ButtonImpl } from "arkui.component.button";

import { ButtonAttribute } from "arkui.component.button";

import { Memo } from "arkui.incremental.annotation";

import { ColumnImpl } from "arkui.component.column";

import { ColumnAttribute } from "arkui.component.column";

import { MemoIntrinsic } from "arkui.incremental.annotation";

import { IParamDecoratedVariable } from "arkui.stateManagement.decorator";

import { Memo } from "arkui.incremental.annotation";

import { ComponentBuilder } from "arkui.component.builder";

import { LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { Builder } from "arkui.component.builder";

import { CustomComponentV2 } from "arkui.component.customComponent";

import { ReusePoolOwnership } from "arkui.component.customComponent";

import { PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint } from "arkui.component.customComponent";

import { NavInterface } from "arkui.component.customComponent";

import { Text, Column, ComponentV2, Entry, Button, ClickEvent } from "@ohos.arkui.component";

import { Local, Param, ObservedV2, Trace, Require } from "@ohos.arkui.stateManagement";

import hilog from "@ohos.hilog";

let a = 1;
function main() {}

a = 1;
__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/observedv2-trace/observedv2-object",
  pageFullPath: "test/demo/mock/decorators/observedv2-trace/observedv2-object",
  integratedHsp: "false",
} as NavInterface));
interface I {
  get a(): string
  set a(a: string)
  get b(): string
  set b(b: string)
  
}

@ObservedV2() class CI implements I, IObservedObject, ISubscribedWatches {
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
  
  @JSONRename({newName:"a"}) public __backing_a?: string;
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_a: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_a");
  @JSONRename({newName:"b"}) public __backing_b?: string;
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_b: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_b");
  public constructor(a: string, b: string) {
    this.a = a;
    this.b = b;
  }
  
  public get a(): string {
    this.conditionalAddRef(this.__meta_a);
    return UIUtils.makeObserved(this.__backing_a!);
  }
  public set a(newValue: string) {
    if (((this.__backing_a) !== (newValue))) {
      this.__backing_a = newValue;
      this.__meta_a.fireChange();
      this.executeOnSubscribingWatches("a");
    }
  }
  
  public get b(): string {
    this.conditionalAddRef(this.__meta_b);
    return UIUtils.makeObserved(this.__backing_b!);
  }
  public set b(newValue: string) {
    if (((this.__backing_b) !== (newValue))) {
      this.__backing_b = newValue;
      this.__meta_b.fireChange();
      this.executeOnSubscribingWatches("b");
    }
  }
  
  static {
    
  }
}

@ObservedV2() class CIRaw implements IObservedObject, ISubscribedWatches {
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
  
  @JSONRename({newName:"a"}) public __backing_a?: string;
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_a: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_a");
  public get a(): string {
    this.conditionalAddRef(this.__meta_a);
    return UIUtils.makeObserved((this.__backing_a as string));
  }
  
  public set a(newValue: string) {
    if (((this.__backing_a) !== (newValue))) {
      this.__backing_a = newValue;
      this.__meta_a.fireChange();
      this.executeOnSubscribingWatches("a");
    }
  }
  
  @JSONRename({newName:"b"}) public __backing_b?: string;
  @JSONStringifyIgnore() @JSONParseIgnore() private __meta_b: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta(this, "__metaV2_b");
  public get b(): string {
    this.conditionalAddRef(this.__meta_b);
    return UIUtils.makeObserved((this.__backing_b as string));
  }
  
  public set b(newValue: string) {
    if (((this.__backing_b) !== (newValue))) {
      this.__backing_b = newValue;
      this.__meta_b.fireChange();
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

@Entry() @ComponentV2() final struct MyStateSample extends CustomComponentV2<MyStateSample, __Options_MyStateSample> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_i = STATE_MGMT_FACTORY.makeLocal<I>(this, "i", ({
      a: "aaa",
      b: "b",
    } as I));
    this.__backing_ci = STATE_MGMT_FACTORY.makeLocal<CI>(this, "ci", new CI("a", "b"));
    this.__backing_ciRaw = STATE_MGMT_FACTORY.makeLocal<CIRaw>(this, "ciRaw", new CIRaw("a", "b"));
  }
  
  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_MyStateSample | undefined)): void {
    this.__backing_i!.resetOnReuse(({
      a: "aaa",
      b: "b",
    } as I));
    this.__backing_ci!.resetOnReuse(new CI("a", "b"));
    this.__backing_ciRaw!.resetOnReuse(new CIRaw("a", "b"));
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: MyStateSample)=> void) | undefined), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<MyStateSample, __Options_MyStateSample>(style, ((): MyStateSample => {
      return new MyStateSample();
    }), initializers, reuseId, content, {
      sClass: Class.from<MyStateSample>(),
    });
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() content?: (()=> void)): MyStateSample {
    throw new Error("Declare interface");
  }
  
  private __backing_i?: ILocalDecoratedVariable<I>;
  public get i(): I {
    return this.__backing_i!.get();
  }
  
  public set i(value: I) {
    this.__backing_i!.set(value);
  }
  
  private __backing_ci?: ILocalDecoratedVariable<CI>;
  public get ci(): CI {
    return this.__backing_ci!.get();
  }
  
  public set ci(value: CI) {
    this.__backing_ci!.set(value);
  }
  
  private __backing_ciRaw?: ILocalDecoratedVariable<CIRaw>;
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
        instance.setButtonOptions(\`@Local i.a: \${this.i.a}\`, undefined).onClick(((e: ClickEvent) => {
          this.i.a += "a";
        }));
        instance.applyAttributesFinish();
        return;
      }), undefined);
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions(\`@Local ci.a: \${this.ci.a}\`, undefined).onClick(((e: ClickEvent) => {
          this.ci.a += "a";
        }));
        instance.applyAttributesFinish();
        return;
      }), undefined);
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions(\`@Local ciRaw.a: \${this.ciRaw.a}\`, undefined).onClick(((e: ClickEvent) => {
          this.ciRaw.a += "a";
        }));
        instance.applyAttributesFinish();
        return;
      }), undefined);
      ParamChild._invoke(undefined, (() => {
        return {
          i: this.i,
          __options_has_i: true,
          ci: this.ci,
          __options_has_ci: true,
          ciRaw: this.ciRaw,
          __options_has_ciRaw: true,
        };
      }), undefined, undefined, undefined);
    }));
  }
  
  public constructor() {}
  
  static {
    
  }
}

@ComponentV2() final struct ParamChild extends CustomComponentV2<ParamChild, __Options_ParamChild> {
  public __initializeStruct(initializers: (__Options_ParamChild | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_i = STATE_MGMT_FACTORY.makeParam<I>(this, "i", (initializers!.i as I));
    this.__backing_ci = STATE_MGMT_FACTORY.makeParam<CI>(this, "ci", (initializers!.ci as CI));
    this.__backing_ciRaw = STATE_MGMT_FACTORY.makeParam<CIRaw>(this, "ciRaw", (initializers!.ciRaw as CIRaw));
  }
  
  public __updateStruct(initializers: (__Options_ParamChild | undefined)): void {
    if (({let gensym___84580138 = initializers;
    (((gensym___84580138) == (null)) ? undefined : gensym___84580138.__options_has_i)})) {
      this.__backing_i!.update((initializers!.i as I));
    }
    if (({let gensym___92128806 = initializers;
    (((gensym___92128806) == (null)) ? undefined : gensym___92128806.__options_has_ci)})) {
      this.__backing_ci!.update((initializers!.ci as CI));
    }
    if (({let gensym___36697840 = initializers;
    (((gensym___36697840) == (null)) ? undefined : gensym___36697840.__options_has_ciRaw)})) {
      this.__backing_ciRaw!.update((initializers!.ciRaw as CIRaw));
    }
  }
  
  public resetStateVarsOnReuse(initializers: (__Options_ParamChild | undefined)): void {
    this.__backing_i!.resetOnReuse((initializers!.i as I));
    this.__backing_ci!.resetOnReuse((initializers!.ci as CI));
    this.__backing_ciRaw!.resetOnReuse((initializers!.ciRaw as CIRaw));
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: ParamChild)=> void) | undefined), initializers: ((()=> __Options_ParamChild) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<ParamChild, __Options_ParamChild>(style, ((): ParamChild => {
      return new ParamChild();
    }), initializers, reuseId, content, {
      sClass: Class.from<ParamChild>(),
    });
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ParamChild, storage?: LocalStorage, @Builder() content?: (()=> void)): ParamChild {
    throw new Error("Declare interface");
  }
  
  private __backing_i?: IParamDecoratedVariable<I>;
  public get i(): I {
    return this.__backing_i!.get();
  }
  
  private __backing_ci?: IParamDecoratedVariable<CI>;
  public get ci(): CI {
    return this.__backing_ci!.get();
  }
  
  private __backing_ciRaw?: IParamDecoratedVariable<CIRaw>;
  public get ciRaw(): CIRaw {
    return this.__backing_ciRaw!.get();
  }
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).margin(10);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions(\`@Param i.a: \${this.i.a}\`, undefined).onClick(((e: ClickEvent) => {
          this.i.a += "a";
        }));
        instance.applyAttributesFinish();
        return;
      }), undefined);
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions(\`@Param ci.a: \${this.ci.a}\`, undefined).onClick(((e: ClickEvent) => {
          this.ci.a += "a";
        }));
        instance.applyAttributesFinish();
        return;
      }), undefined);
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions(\`@Param ciRaw.a: \${this.ciRaw.a}\`, undefined).onClick(((e: ClickEvent) => {
          this.ciRaw.a += "a";
        }));
        instance.applyAttributesFinish();
        return;
      }), undefined);
    }));
  }
  
  public constructor() {}
  
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

@Entry() @ComponentV2() class __Options_MyStateSample {
  @Local() public i?: I;
  public __backing_i?: ILocalDecoratedVariable<I>;
  public __options_has_i?: boolean;
  @Local() public ci?: CI;
  public __backing_ci?: ILocalDecoratedVariable<CI>;
  public __options_has_ci?: boolean;
  @Local() public ciRaw?: CIRaw;
  public __backing_ciRaw?: ILocalDecoratedVariable<CIRaw>;
  public __options_has_ciRaw?: boolean;
  public constructor() {}
  
}

@ComponentV2() class __Options_ParamChild {
  @Require() @Param() public i: I;
  public __backing_i?: IParamDecoratedVariable<I>;
  public __options_has_i?: boolean;
  @Require() @Param() public ci: CI;
  public __backing_ci?: IParamDecoratedVariable<CI>;
  public __options_has_ci?: boolean;
  @Require() @Param() public ciRaw: CIRaw;
  public __backing_ciRaw?: IParamDecoratedVariable<CIRaw>;
  public __options_has_ciRaw?: boolean;
  public constructor() {}
  
}
`;

function testObservedJsonStringifyIgnoreTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test observedV2 transform with Non-null objects',
    [observedTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testObservedJsonStringifyIgnoreTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
