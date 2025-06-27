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
import { uiNoRecheck, recheck, beforeUINoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpAnnotation, dumpGetterSetter, GetSetDumper } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/computed';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'static-computed.ets'),
];

const pluginTester = new PluginTester('test @Computed decorated static getter method', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { Memo as Memo } from "arkui.incremental.annotation";

import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { UIUtils as UIUtils } from "arkui.stateManagement.utils";

import { IMutableStateMeta as IMutableStateMeta } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { ComponentV2 as ComponentV2 } from "@ohos.arkui.component";

import { Computed as Computed, ObservedV2 as ObservedV2, Trace as Trace, Local as Local } from "@ohos.arkui.stateManagement";

function main() {}


@ObservedV2() class Name implements IObservedObject, ISubscribedWatches {
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
  
  @JSONRename({newName:"firstName"}) public static __backing_firstName: string = "Hua";
  
  @JSONStringifyIgnore() @JSONParseIgnore() public static __meta_firstName: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  public static get firstName(): string {
    Name.__meta_firstName.addRef();
    return UIUtils.makeObserved(Name.__backing_firstName);
  }
  
  public static set firstName(newValue: string) {
    if (((Name.__backing_firstName) !== (newValue))) {
      Name.__backing_firstName = newValue;
      Name.__meta_firstName.fireChange();
    }
  }

  @JSONRename({newName:"lastName"}) public static __backing_lastName: string = "Li";
  
  @JSONStringifyIgnore() @JSONParseIgnore() public static __meta_lastName: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  public static get lastName(): string {
    Name.__meta_lastName.addRef();
    return UIUtils.makeObserved(Name.__backing_lastName);
  }
  
  public static set lastName(newValue: string) {
    if (((Name.__backing_lastName) !== (newValue))) {
      Name.__backing_lastName = newValue;
      Name.__meta_lastName.fireChange();
    }
  }

  public static __computed_fullName = STATE_MGMT_FACTORY.makeComputed<string>((() => {
    return ((((Name.firstName) + (" "))) + (Name.lastName));
  }), "fullName");
  
  @Computed() public static get fullName(): string {
    return Name.__computed_fullName.get();
  }
  
  public constructor() {}

  static {
    
  }
}

@ComponentV2() final struct Parent extends CustomComponentV2<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @Memo() content: ((()=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}
  
  public static __backing_localVar1: ILocalDecoratedVariable<string> = STATE_MGMT_FACTORY.makeStaticLocal<string>("localVar1", "stateVar1");
  
  public static get localVar1(): string {
    return Parent.__backing_localVar1.get();
  }
  
  public static set localVar1(value: string) {
    Parent.__backing_localVar1.set(value);
  }
  
  public static __backing_localVar2: ILocalDecoratedVariable<number> = STATE_MGMT_FACTORY.makeStaticLocal<number>("localVar2", 50);
  
  public static get localVar2(): number {
    return Parent.__backing_localVar2.get();
  }
  
  public static set localVar2(value: number) {
    Parent.__backing_localVar2.set(value);
  }
  
  public static __computed_fullName = STATE_MGMT_FACTORY.makeComputed<string>((() => {
    return Parent.localVar1;
  }), "fullName");
  
  @Computed() public static get fullName(): string {
    return Parent.__computed_fullName.get();
  }
  
  @Memo() public build() {}

  public constructor() {}

  static {
    
  }
}

@ComponentV2() final struct Parent2 extends CustomComponentV2<Parent2, __Options_Parent2> {
  public __initializeStruct(initializers: (__Options_Parent2 | undefined), @Memo() content: ((()=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_Parent2 | undefined)): void {}
  
  public static __computed_fullName = STATE_MGMT_FACTORY.makeComputed<string>((() => {
    return ((((Name.firstName) + (" "))) + (Name.lastName));
  }), "fullName");
  
  @Computed() public static get fullName(): string {
    return Parent2.__computed_fullName.get();
  }
  
  public static __computed_fullName2 = STATE_MGMT_FACTORY.makeComputed<string>((() => {
    return Parent.localVar1;
  }), "fullName2");
  
  @Computed() public static get fullName2(): string {
    return Parent2.__computed_fullName2.get();
  }
  
  @Memo() public build() {}

  public constructor() {}

  static {
    
  }
}

@ObservedV2() class Name2 implements IObservedObject, ISubscribedWatches {
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
  
  public static __computed_fullName = STATE_MGMT_FACTORY.makeComputed<string>((() => {
    return ((((Name.firstName) + (" "))) + (Name.lastName));
  }), "fullName");
  
  @Computed() public static get fullName(): string {
    return Name2.__computed_fullName.get();
  }

  public constructor() {}

  static {
    
  }
}

@ComponentV2() export interface __Options_Parent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'localVar1', '(string | undefined)', [dumpAnnotation('Local')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_localVar1', '(ILocalDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_localVar1', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'localVar2', '(number | undefined)', [dumpAnnotation('Local')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_localVar2', '(ILocalDecoratedVariable<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_localVar2', '(boolean | undefined)')}
  
}

@ComponentV2() export interface __Options_Parent2 {
  
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @Computed decorated static getter method',
    [parsedTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
