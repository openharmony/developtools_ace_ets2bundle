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
import { memo as memo } from "arkui.stateManagement.runtime";
import { ProvideDecoratedVariable as ProvideDecoratedVariable } from "arkui.stateManagement.decorators.decoratorProvide";
import { StoragePropDecoratedVariable as StoragePropDecoratedVariable } from "arkui.stateManagement.decorators.decoratorStorageProp";
import { StorageLinkDecoratedVariable as StorageLinkDecoratedVariable } from "arkui.stateManagement.decorators.decoratorStorageLink";
import { PropDecoratedVariable as PropDecoratedVariable } from "arkui.stateManagement.decorators.decoratorProp";
import { StateDecoratedVariable as StateDecoratedVariable } from "arkui.stateManagement.decorators.decoratorState";
import { IObservedObject as IObservedObject } from "arkui.stateManagement.base.iObservedObject";
import { MutableStateMeta as MutableStateMeta } from "arkui.stateManagement.base.mutableStateMeta";
import { int32 as int32 } from "@koalaui.runtime.common";
import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorators.decoratorWatch";
import { SubscribedWatches as SubscribedWatches } from "arkui.stateManagement.decorators.decoratorWatch";
import { EntryPoint as EntryPoint } from "arkui.UserView";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Component as Component, Entry as Entry } from "@ohos.arkui.component";
import { State as State, Prop as Prop, StorageLink as StorageLink, StorageProp as StorageProp, Link as Link, Watch as Watch, ObjectLink as ObjectLink, Observed as Observed, Track as Track, Provide as Provide, Consume as Consume } from "@ohos.arkui.stateManagement";

function main() {}



@Observed() class A implements IObservedObject {
  private subscribedWatches: SubscribedWatches = new SubscribedWatches();
  
  public addWatchSubscriber(watchId: WatchIdType): void {
    this.subscribedWatches.addWatchSubscriber(watchId);
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    return this.subscribedWatches.removeWatchSubscriber(watchId);
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    this.subscribedWatches.executeOnSubscribingWatches(propertyName);
  }
  
  public _permissibleAddRefDepth: int32 = 0;
  
  public propA: string = "hello";
  
  private __backing_trackA: string = "world";
  
  private __meta_trackA: MutableStateMeta = new MutableStateMeta("@Track");
  
  public constructor() {}
  
  public get trackA(): string {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta_trackA.addRef();
    }
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

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component({freezeWhenInactive:false}) final class MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: __Options_MyStateSample | undefined, @memo() content: (()=> void) | undefined): void {
    this.__backing_statevar = new StateDecoratedVariable<string>("statevar", ((({let gensym___76198660 = initializers;
    (((gensym___76198660) == (null)) ? undefined : gensym___76198660.statevar)})) ?? ("Hello World")), ((_: string): void => {
      this.stateOnChange(_);
    }));
    this.__backing_propvar = new PropDecoratedVariable<string>("propvar", ((({let gensym___241486692 = initializers;
    (((gensym___241486692) == (null)) ? undefined : gensym___241486692.propvar)})) ?? ("Hello World")), ((_: string): void => {
      this.propOnChange(_);
    }));
    this.__backing_storagelinkvar = new StorageLinkDecoratedVariable<string>("prop1", "storagelinkvar", "Hello World", ((_: string): void => {
      this.storageLinkOnChange(_);
    }))
    this.__backing_storagepropvar = new StoragePropDecoratedVariable<string>("prop2", "storagepropvar", "Hello World", ((_: string): void => {
      this.storagePropOnChange(_);
    }))
    this.__backing_providevar = this.addProvidedVar<string>("providevar", "providevar", ((({let gensym___194235814 = initializers;
    (((gensym___194235814) == (null)) ? undefined : gensym___194235814.providevar)})) ?? ("Hello World")), false, ((_: string): void => {
      this.ProvideOnChange(_);
    }));
  }
  
  public __updateStruct(initializers: __Options_MyStateSample | undefined): void {
    if (((({let gensym___220608839 = initializers;
    (((gensym___220608839) == (null)) ? undefined : gensym___220608839.propvar)})) !== (undefined))) {
      this.__backing_propvar!.update((initializers!.propvar as string));
    }
  }
  
  private __backing_statevar?: StateDecoratedVariable<string>;
  
  public get statevar(): string {
    return this.__backing_statevar!.get();
  }
  
  public set statevar(value: string) {
    this.__backing_statevar!.set(value);
  }
  
  private __backing_propvar?: PropDecoratedVariable<string>;
  
  public get propvar(): string {
    return this.__backing_propvar!.get();
  }
  
  public set propvar(value: string) {
    this.__backing_propvar!.set(value);
  }
  
  private __backing_storagelinkvar?: StorageLinkDecoratedVariable<string>;
  
  public get storagelinkvar(): string {
    return this.__backing_storagelinkvar!.get();
  }
  
  public set storagelinkvar(value: string) {
    this.__backing_storagelinkvar!.set(value);
  }
  
  private __backing_storagepropvar?: StoragePropDecoratedVariable<string>;
  
  public get storagepropvar(): string {
    return this.__backing_storagepropvar!.get();
  }
  
  public set storagepropvar(value: string) {
    this.__backing_storagepropvar!.set(value);
  }
  
  private __backing_providevar?: ProvideDecoratedVariable<string>;
  
  public get providevar(): string {
    return this.__backing_providevar!.get();
  }
  
  public set providevar(value: string) {
    this.__backing_providevar!.set(value);
  }
  
  public stateOnChange(propName: string) {}
  
  public propOnChange(propName: string) {}
  
  public storageLinkOnChange(propName: string) {}
  
  public storagePropOnChange(propName: string) {}
  
  public ProvideOnChange(propName: string) {}
  
  @memo() public _build(@memo() style: ((instance: MyStateSample)=> MyStateSample) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_MyStateSample | undefined): void {
    Child._instantiateImpl(undefined, (() => {
      return new Child();
    }));
  }
  
  private constructor() {}
  
}

@Component({freezeWhenInactive:false}) final class Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: __Options_Child | undefined, @memo() content: (()=> void) | undefined): void {}
  
  public __updateStruct(initializers: __Options_Child | undefined): void {}
  
  @memo() public _build(@memo() style: ((instance: Child)=> Child) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_Child | undefined): void {}
  
  private constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component({freezeWhenInactive:false}) export interface __Options_MyStateSample {
  set statevar(statevar: string | undefined)
  
  get statevar(): string | undefined
  set __backing_statevar(__backing_statevar: StateDecoratedVariable<string> | undefined)
  
  get __backing_statevar(): StateDecoratedVariable<string> | undefined
  set propvar(propvar: string | undefined)
  
  get propvar(): string | undefined
  set __backing_propvar(__backing_propvar: PropDecoratedVariable<string> | undefined)
  
  get __backing_propvar(): PropDecoratedVariable<string> | undefined
  set storagelinkvar(storagelinkvar: string | undefined)
  
  get storagelinkvar(): string | undefined
  set __backing_storagelinkvar(__backing_storagelinkvar: StorageLinkDecoratedVariable<string> | undefined)
  
  get __backing_storagelinkvar(): StorageLinkDecoratedVariable<string> | undefined
  set storagepropvar(storagepropvar: string | undefined)
  
  get storagepropvar(): string | undefined
  set __backing_storagepropvar(__backing_storagepropvar: StoragePropDecoratedVariable<string> | undefined)
  
  get __backing_storagepropvar(): StoragePropDecoratedVariable<string> | undefined
  set providevar(providevar: string | undefined)
  
  get providevar(): string | undefined
  set __backing_providevar(__backing_providevar: ProvideDecoratedVariable<string> | undefined)
  
  get __backing_providevar(): ProvideDecoratedVariable<string> | undefined
  
}

@Component({freezeWhenInactive:false}) export interface __Options_Child {
  
}

class __EntryWrapper extends EntryPoint {
  @memo() public entry(): void {
    MyStateSample._instantiateImpl(undefined, (() => {
      return new MyStateSample();
    }));
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
