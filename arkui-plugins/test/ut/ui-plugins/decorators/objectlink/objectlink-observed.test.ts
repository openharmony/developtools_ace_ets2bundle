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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, OBJECTLINK_DIR_PATH, 'objectlink-observed.ets'),
];

const objectlinkTrackTransform: Plugins = {
    name: 'objectlink',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test objectlink observed transform', buildConfig);

const expectedScript: string = `

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { memo as memo } from "arkui.stateManagement.runtime";

import { IObjectLinkDecoratedVariable as IObjectLinkDecoratedVariable } from "arkui.stateManagement.decorator";

import { ButtonAttribute as ButtonAttribute } from "arkui.component.button";

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { OBSERVE as OBSERVE } from "arkui.stateManagement.decorator";

import { IMutableStateMeta as IMutableStateMeta } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.UserView";

import { LayoutCallback as LayoutCallback } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, Entry as Entry, Column as Column, Button as Button, ClickEvent as ClickEvent } from "@ohos.arkui.component";

import { State as State, ObjectLink as ObjectLink, Observed as Observed } from "@ohos.arkui.stateManagement";

function main() {}



@Observed() class DateClass extends Date implements IObservedObject, ISubscribedWatches {
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
  
  public constructor(args: number | string) {
    super(args);
  }
  
}

@Observed() class NewDate implements IObservedObject, ISubscribedWatches {
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
  
  @JSONRename({newName:"data"}) private __backing_data: DateClass = new DateClass(11);
  
  public constructor(data: DateClass) {
    this.data = data;
  }
  
  public get data(): DateClass {
    this.conditionalAddRef(this.__meta);
    return this.__backing_data;
  }
  
  public set data(newValue: DateClass) {
    if (((this.__backing_data) !== (newValue))) {
      this.__backing_data = newValue;
      this.__meta.fireChange();
      this.executeOnSubscribingWatches("data");
    }
  }
  
}

@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: __Options_Child | undefined, @memo() content: (()=> void) | undefined): void {
    this.__backing_label = ((({let gensym___171896504 = initializers;
    (((gensym___171896504) == (null)) ? undefined : gensym___171896504.label)})) ?? ("date"));
    this.__backing_data = STATE_MGMT_FACTORY.makeObjectLink<DateClass>(this, "data", ({let gensym___209155591 = initializers;
    (((gensym___209155591) == (null)) ? undefined : gensym___209155591.data)})!)
  }
  
  public __updateStruct(initializers: __Options_Child | undefined): void {
    if (((({let gensym___232946400 = initializers;
    (((gensym___232946400) == (null)) ? undefined : gensym___232946400.data)})) !== (undefined))) {
      this.__backing_data!.update(initializers!.data!);
    }
  }
  
  private __backing_label?: string;
  
  public get label(): string {
    return (this.__backing_label as string);
  }
  
  public set label(value: string) {
    this.__backing_label = value;
  }
  
  private __backing_data?: IObjectLinkDecoratedVariable<DateClass>;
  
  public get data(): DateClass {
    return this.__backing_data!.get();
  }
  
  @memo() public build() {
    Column(undefined, (() => {
      Button(((instance: ButtonAttribute): void => {
        instance.onClick(((e: ClickEvent) => {
          this.data.setDate(((this.data.getDate()) + (1)));
        }));
        return;
      }), "child increase the day by 1");
    }));
  }
  
  private constructor() {}
  
}

@Entry({shared:false,storage:"",routeName:""}) @Component() final struct Parent extends CustomComponent<Parent, __Options_Parent> implements PageLifeCycle {
  public __initializeStruct(initializers: __Options_Parent | undefined, @memo() content: (()=> void) | undefined): void {
    this.__backing_newData = STATE_MGMT_FACTORY.makeState<NewDate>(this, "newData", ((({let gensym___225289068 = initializers;
    (((gensym___225289068) == (null)) ? undefined : gensym___225289068.newData)})) ?? (new NewDate(new DateClass("2023-1-1")))));
  }
  
  public __updateStruct(initializers: __Options_Parent | undefined): void {}
  
  private __backing_newData?: IStateDecoratedVariable<NewDate>;
  
  public get newData(): NewDate {
    return this.__backing_newData!.get();
  }
  
  public set newData(value: NewDate) {
    this.__backing_newData!.set(value);
  }
  
  @memo() public build() {
    Column(undefined, (() => {
      Child._instantiateImpl(undefined, (() => {
        return new Child();
      }), {
        label: "date",
        data: this.newData.data,
      });
      Button(((instance: ButtonAttribute): void => {
        instance.onClick(((e: ClickEvent) => {
          this.newData.data = new DateClass("2023-07-07");
        }));
        return;
      }), "parent update the new date");
      Button(((instance: ButtonAttribute): void => {
        instance.onClick(((e: ClickEvent) => {
          this.newData = new NewDate(new DateClass("2023-08-20"));
        }));
        return;
      }), "ViewB: this.newData = new NewDate(new DateClass('2023-08-20'))");
    }));
  }
  
  private constructor() {}
  
}

@Component() export interface __Options_Child {
  set label(label: string | undefined)
  
  get label(): string | undefined
  set data(data: DateClass | undefined)
  
  get data(): DateClass | undefined
  set __backing_data(__backing_data: IObjectLinkDecoratedVariable<DateClass> | undefined)
  
  get __backing_data(): IObjectLinkDecoratedVariable<DateClass> | undefined
  
}

@Entry({shared:false,storage:"",routeName:""}) @Component() export interface __Options_Parent {
  set newData(newData: NewDate | undefined)
  
  get newData(): NewDate | undefined
  set __backing_newData(__backing_newData: IStateDecoratedVariable<NewDate> | undefined)
  
  get __backing_newData(): IStateDecoratedVariable<NewDate> | undefined
  
}

class __EntryWrapper extends EntryPoint {
  @memo() public entry(): void {
    Parent._instantiateImpl(undefined, (() => {
      return new Parent();
    }));
  }
  
  public constructor() {}
  
}
`;

function testObjectLinkTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test objectlink observed transform',
    [objectlinkTrackTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testObjectLinkTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
