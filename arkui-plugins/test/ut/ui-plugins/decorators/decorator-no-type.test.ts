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
import { PluginTester } from '../../../utils/plugin-tester';
import { mockBuildConfig } from '../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../utils/path-config';
import { parseDumpSrc } from '../../../utils/parse-string';
import { structNoRecheck, recheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'decorator-no-type.ets'),
];

const pluginTester = new PluginTester('test no typeAnnotation variables', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { IConsumerDecoratedVariable as IConsumerDecoratedVariable } from "arkui.stateManagement.decorator";

import { IProviderDecoratedVariable as IProviderDecoratedVariable } from "arkui.stateManagement.decorator";

import { IParamDecoratedVariable as IParamDecoratedVariable } from "arkui.stateManagement.decorator";

import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { IParamOnceDecoratedVariable as IParamOnceDecoratedVariable } from "arkui.stateManagement.decorator";

import { memo as memo } from "arkui.stateManagement.runtime";

import { IProvideDecoratedVariable as IProvideDecoratedVariable } from "arkui.stateManagement.decorator";

import { IPropRefDecoratedVariable as IPropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { OBSERVE as OBSERVE } from "arkui.stateManagement.decorator";

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { UIUtils as UIUtils } from "arkui.stateManagement.utils";

import { IMutableStateMeta as IMutableStateMeta } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { BaseCustomDialog as BaseCustomDialog } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, ComponentV2 as ComponentV2, CustomDialog as CustomDialog } from "@ohos.arkui.component";

import { State as State, PropRef as PropRef, Provide as Provide, Event as Event, Local as Local, Param as Param } from "@ohos.arkui.stateManagement";

import { Provider as Provider, Consumer as Consumer, Once as Once, Observed as Observed, ObservedV2 as ObservedV2, Trace as Trace, Track as Track } from "@ohos.arkui.stateManagement";

function main() {}


class Per {
  public num: number;

  public constructor(num: number) {
    this.num = num;
  }

}

final class StateType extends BaseEnum<int> {
  private readonly #ordinal: int;

  private static <cctor>() {}

  public constructor(ordinal: int, value: int) {
    super(value);
    this.#ordinal = ordinal;
  }

  public static readonly TYPE1: StateType = new StateType(0, 0);

  public static readonly TYPE2: StateType = new StateType(1, 1);

  public static readonly TYPE3: StateType = new StateType(2, 3);

  private static readonly #NamesArray: String[] = ["TYPE1", "TYPE2", "TYPE3"];

  private static readonly #ValuesArray: int[] = [0, 1, 3];

  private static readonly #StringValuesArray: String[] = ["0", "1", "3"];

  private static readonly #ItemsArray: StateType[] = [StateType.TYPE1, StateType.TYPE2, StateType.TYPE3];

  public getName(): String {
    return StateType.#NamesArray[this.#ordinal];
  }

  public static getValueOf(name: String): StateType {
    for (let i = 0;((i) < (StateType.#NamesArray.length));(++i)) {
      if (((name) == (StateType.#NamesArray[i]))) {
        return StateType.#ItemsArray[i];
      }
    }
    throw new Error((("No enum constant StateType.") + (name)));
  }

  public static fromValue(value: int): StateType {
    for (let i = 0;((i) < (StateType.#ValuesArray.length));(++i)) {
      if (((value) == (StateType.#ValuesArray[i]))) {
        return StateType.#ItemsArray[i];
      }
    }
    throw new Error((("No enum StateType with value ") + (value)));
  }

  public valueOf(): int {
    return StateType.#ValuesArray[this.#ordinal];
  }

  public toString(): String {
    return StateType.#StringValuesArray[this.#ordinal];
  }

  public static values(): StateType[] {
    return StateType.#ItemsArray;
  }

  public getOrdinal(): int {
    return this.#ordinal;
  }

  public static $_get(e: StateType): String {
    return e.getName();
  }

}

@ObservedV2() class OO implements IObservedObject, ISubscribedWatches {
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

  public setV1RenderId(renderId: RenderIdType): void {}

  protected conditionalAddRef(meta: IMutableStateMeta): void {
    meta.addRef();
  }

  @JSONRename({newName:"hi"}) private __backing_hi: "150" = "150";

  @JSONStringifyIgnore() private __meta_hi: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();

  public get hi(): "150" {
    this.conditionalAddRef(this.__meta_hi);
    return UIUtils.makeObserved(this.__backing_hi);
  }

  public set hi(newValue: "150") {
    if (((this.__backing_hi) !== (newValue))) {
      this.__backing_hi = newValue;
      this.__meta_hi.fireChange();
      this.executeOnSubscribingWatches("hi");
    }
  }

  public constructor() {}

}

@Observed() class RR implements IObservedObject, ISubscribedWatches {
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

  @JSONRename({newName:"hi"}) private __backing_hi: "150" = "150";

  @JSONStringifyIgnore() private __meta_hi: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();

  public constructor() {}

  public get hi(): "150" {
    this.conditionalAddRef(this.__meta_hi);
    return this.__backing_hi;
  }

  public set hi(newValue: "150") {
    if (((this.__backing_hi) !== (newValue))) {
      this.__backing_hi = newValue;
      this.__meta_hi.fireChange();
      this.executeOnSubscribingWatches("hi");
    }
  }

}

@Component() final struct Parent extends CustomComponent<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_stateVar1 = STATE_MGMT_FACTORY.makeState<Per>(this, "stateVar1", (((({let gensym___213853607 = initializers;
    (((gensym___213853607) == (null)) ? undefined : gensym___213853607.stateVar1)})) ?? (new Per(6))) as Per));
    this.__backing_stateVar2 = STATE_MGMT_FACTORY.makePropRef<Array<Double>>(this, "stateVar2", (((({let gensym___113574154 = initializers;
    (((gensym___113574154) == (null)) ? undefined : gensym___113574154.stateVar2)})) ?? (new Array<number>(3, 6, 8))) as Array<Double>));
    this.__backing_stateVar3 = STATE_MGMT_FACTORY.makeProvide<StateType>(this, "stateVar3", "stateVar3", (((({let gensym___120612294 = initializers;
    (((gensym___120612294) == (null)) ? undefined : gensym___120612294.stateVar3)})) ?? (StateType.TYPE3)) as StateType), false);
    this.__backing_stateVar8 = ((({let gensym___188075012 = initializers;
    (((gensym___188075012) == (null)) ? undefined : gensym___188075012.stateVar8)})) ?? (((sr: string) => {})));
    this.__backing_stateVar9 = ((({let gensym___53672736 = initializers;
    (((gensym___53672736) == (null)) ? undefined : gensym___53672736.stateVar9)})) ?? (new Date("2025-4-23")));
    this.__backing_stateVar11113 = STATE_MGMT_FACTORY.makeProvide<Boolean>(this, "stateVar11113", "me0", (((({let gensym___105441066 = initializers;
    (((gensym___105441066) == (null)) ? undefined : gensym___105441066.stateVar11113)})) ?? (true)) as Boolean), false);
    this.__backing_stateVar11114 = STATE_MGMT_FACTORY.makeProvide<undefined>(this, "stateVar11114", "stateVar11114", (((({let gensym___141950305 = initializers;
    (((gensym___141950305) == (null)) ? undefined : gensym___141950305.stateVar11114)})) ?? (undefined)) as undefined), false);
    this.__backing_stateVar11115 = STATE_MGMT_FACTORY.makeState<null>(this, "stateVar11115", (((({let gensym___159362057 = initializers;
    (((gensym___159362057) == (null)) ? undefined : gensym___159362057.stateVar11115)})) ?? (null)) as null));
  }

  public __updateStruct(initializers: (__Options_Parent | undefined)): void {
    if (({let gensym___103591793 = initializers;
    (((gensym___103591793) == (null)) ? undefined : gensym___103591793.__options_has_stateVar2)})) {
      this.__backing_stateVar2!.update((initializers!.stateVar2 as Array<Double>));
    }
  }

  private __backing_stateVar1?: IStateDecoratedVariable<Per>;

  public get stateVar1(): Per {
    return this.__backing_stateVar1!.get();
  }

  public set stateVar1(value: Per) {
    this.__backing_stateVar1!.set(value);
  }
  
  private __backing_stateVar2?: IPropRefDecoratedVariable<Array<Double>>;
  
  public get stateVar2(): Array<Double> {
    return this.__backing_stateVar2!.get();
  }

  public set stateVar2(value: Array<Double>) {
    this.__backing_stateVar2!.set(value);
  }

  private __backing_stateVar3?: IProvideDecoratedVariable<StateType>;

  public get stateVar3(): StateType {
    return this.__backing_stateVar3!.get();
  }

  public set stateVar3(value: StateType) {
    this.__backing_stateVar3!.set(value);
  }

  private __backing_stateVar8?: Any;

  public get stateVar8(): (sr: String) => void {
    return (this.__backing_stateVar8 as (sr: String) => void);
  }

  public set stateVar8(value: (sr: String) => void) {
    this.__backing_stateVar8 = value;
  }

  private __backing_stateVar9?: Any;

  public get stateVar9(): Date {
    return (this.__backing_stateVar9 as Date);
  }

  public set stateVar9(value: Date) {
    this.__backing_stateVar9 = value;
  }

  private __backing_stateVar11113?: IProvideDecoratedVariable<Boolean>;

  public get stateVar11113(): Boolean {
    return this.__backing_stateVar11113!.get();
  }

  public set stateVar11113(value: Boolean) {
    this.__backing_stateVar11113!.set(value);
  }

  private __backing_stateVar11114?: IProvideDecoratedVariable<undefined>;

  public get stateVar11114(): undefined {
    return this.__backing_stateVar11114!.get();
  }

  public set stateVar11114(value: undefined) {
    this.__backing_stateVar11114!.set(value);
  }

  private __backing_stateVar11115?: IStateDecoratedVariable<null>;

  public get stateVar11115(): null {
    return this.__backing_stateVar11115!.get();
  }

  public set stateVar11115(value: null) {
    this.__backing_stateVar11115!.set(value);
  }

  @memo() public build() {}

  public constructor() {}

}

@ComponentV2() final struct V2Parent extends CustomComponentV2<V2Parent, __Options_V2Parent> {
  public __initializeStruct(initializers: (__Options_V2Parent | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_stateVar4 = STATE_MGMT_FACTORY.makeParamOnce<Set<String>>(this, "stateVar4", (((({let gensym___73118717 = initializers;
    (((gensym___73118717) == (null)) ? undefined : gensym___73118717.stateVar4)})) ?? (new Set<string>(new Array<string>("aa", "bb")))) as Set<String>));
    this.__backing_stateVar5 = STATE_MGMT_FACTORY.makeLocal<Array<Boolean>>(this, "stateVar5", [true, false]);
    this.__backing_stateVar6 = STATE_MGMT_FACTORY.makeLocal<Array<Per>>(this, "stateVar6", new Array<Per>(new Per(7), new Per(11)));
    this.__backing_stateVar7 = ((({let gensym___57869708 = initializers;
    (((gensym___57869708) == (null)) ? undefined : gensym___57869708.stateVar7)})) ?? ([new Per(7), new Per(11)]));
    this.__backing_stateVar8 = ((({let gensym___248714217 = initializers;
    (((gensym___248714217) == (null)) ? undefined : gensym___248714217.stateVar8)})) ?? (((sr: string) => {})));
    this.__backing_stateVar9 = STATE_MGMT_FACTORY.makeParam<Date>(this, "stateVar9", (((({let gensym___78493121 = initializers;
    (((gensym___78493121) == (null)) ? undefined : gensym___78493121.stateVar9)})) ?? (new Date("2025-4-23"))) as Date));
    this.__backing_stateVar10 = STATE_MGMT_FACTORY.makeParam<Map<Double,Per>>(this, "stateVar10", (((({let gensym___142105696 = initializers;
    (((gensym___142105696) == (null)) ? undefined : gensym___142105696.stateVar10)})) ?? (new Map<number, Per>([[0, new Per(7)], [1, new Per(10)]]))) as Map<Double,Per>));
    this.__backing_stateVar11 = STATE_MGMT_FACTORY.makeParamOnce<Double>(this, "stateVar11", (((({let gensym___198110537 = initializers;
    (((gensym___198110537) == (null)) ? undefined : gensym___198110537.stateVar11)})) ?? (0.0)) as Double));
    this.__backing_stateVar12 = STATE_MGMT_FACTORY.makeProvider<Per>(this, "stateVar12", "stateVar12", new Per(6));
    this.__backing_stateVar11111 = STATE_MGMT_FACTORY.makeConsumer<"stateVar1">(this, "stateVar11111", "stateVar11111", "stateVar1");
    this.__backing_stateVar11188 = STATE_MGMT_FACTORY.makeProvider<"">(this, "stateVar11188", "var", "");
    this.__backing_stateVar11112 = STATE_MGMT_FACTORY.makeConsumer<Int>(this, "stateVar11112", "nihao", 50);
  }

  public __updateStruct(initializers: (__Options_V2Parent | undefined)): void {
    if (({let gensym___220782256 = initializers;
    (((gensym___220782256) == (null)) ? undefined : gensym___220782256.__options_has_stateVar9)})) {
      this.__backing_stateVar9!.update((initializers!.stateVar9 as Date));
    }
    if (({let gensym___252301725 = initializers;
    (((gensym___252301725) == (null)) ? undefined : gensym___252301725.__options_has_stateVar10)})) {
      this.__backing_stateVar10!.update((initializers!.stateVar10 as Map<Double,Per>));
    }
  }

  private __backing_stateVar4?: IParamOnceDecoratedVariable<Set<String>>;

  public get stateVar4(): Set<String> {
    return this.__backing_stateVar4!.get();
  }

  public set stateVar4(value: Set<String>) {
    this.__backing_stateVar4!.set(value);
  }

  private __backing_stateVar5?: ILocalDecoratedVariable<Array<Boolean>>;

  public get stateVar5(): Array<Boolean> {
    return this.__backing_stateVar5!.get();
  }

  public set stateVar5(value: Array<Boolean>) {
    this.__backing_stateVar5!.set(value);
  }

  private __backing_stateVar6?: ILocalDecoratedVariable<Array<Per>>;

  public get stateVar6(): Array<Per> {
    return this.__backing_stateVar6!.get();
  }

  public set stateVar6(value: Array<Per>) {
    this.__backing_stateVar6!.set(value);
  }

  private __backing_stateVar7?: Any;

  public get stateVar7(): Array<Per> {
    return (this.__backing_stateVar7 as Array<Per>);
  }

  public set stateVar7(value: Array<Per>) {
    this.__backing_stateVar7 = value;
  }

  private __backing_stateVar8?: Any;

  public get stateVar8(): (sr: String) => void {
    return (this.__backing_stateVar8 as (sr: String) => void);
  }

  public set stateVar8(value: (sr: String) => void) {
    this.__backing_stateVar8 = value;
  }

  private __backing_stateVar9?: IParamDecoratedVariable<Date>;

  public get stateVar9(): Date {
    return this.__backing_stateVar9!.get();
  }

  private __backing_stateVar10?: IParamDecoratedVariable<Map<Double,Per>>;

  public get stateVar10(): Map<Double,Per> {
    return this.__backing_stateVar10!.get();
  }

  private __backing_stateVar11?: IParamOnceDecoratedVariable<Double>;

  public get stateVar11(): Double {
    return this.__backing_stateVar11!.get();
  }

  public set stateVar11(value: Double) {
    this.__backing_stateVar11!.set(value);
  }

  private __backing_stateVar12?: IProviderDecoratedVariable<Per>;

  public get stateVar12(): Per {
    return this.__backing_stateVar12!.get();
  }

  public set stateVar12(value: Per) {
    this.__backing_stateVar12!.set(value);
  }

  private __backing_stateVar11111?: IConsumerDecoratedVariable<"stateVar1">;

  public get stateVar11111(): "stateVar1" {
    return this.__backing_stateVar11111!.get();
  }

  public set stateVar11111(value: "stateVar1") {
    this.__backing_stateVar11111!.set(value);
  }

  private __backing_stateVar11188?: IProviderDecoratedVariable<"">;

  public get stateVar11188(): "" {
    return this.__backing_stateVar11188!.get();
  }

  public set stateVar11188(value: "") {
    this.__backing_stateVar11188!.set(value);
  }

  private __backing_stateVar11112?: IConsumerDecoratedVariable<Int>;

  public get stateVar11112(): Int {
    return this.__backing_stateVar11112!.get();
  }

  public set stateVar11112(value: Int) {
    this.__backing_stateVar11112!.set(value);
  }

  @memo() public build() {}

  public constructor() {}

}

@CustomDialog() final struct CC extends BaseCustomDialog<CC, __Options_CC> {
  public __initializeStruct(initializers: (__Options_CC | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_stateVar4 = STATE_MGMT_FACTORY.makeParamOnce<Set<String>>(this, "stateVar4", (((({let gensym___177598336 = initializers;
    (((gensym___177598336) == (null)) ? undefined : gensym___177598336.stateVar4)})) ?? (new Set<string>(new Array<string>("aa", "bb")))) as Set<String>));
    this.__backing_stateVar5 = STATE_MGMT_FACTORY.makeLocal<Array<Boolean>>(this, "stateVar5", [true, false]);
    this.__backing_stateVar6 = STATE_MGMT_FACTORY.makeLocal<Array<Per>>(this, "stateVar6", new Array<Per>(new Per(7), new Per(11)));
    this.__backing_stateVar7 = ((({let gensym___136470640 = initializers;
    (((gensym___136470640) == (null)) ? undefined : gensym___136470640.stateVar7)})) ?? ([new Per(7), new Per(11)]));
    this.__backing_stateVar8 = ((({let gensym___59026893 = initializers;
    (((gensym___59026893) == (null)) ? undefined : gensym___59026893.stateVar8)})) ?? (((sr: string) => {})));
    this.__backing_stateVar9 = STATE_MGMT_FACTORY.makeParam<Date>(this, "stateVar9", (((({let gensym___121624319 = initializers;
    (((gensym___121624319) == (null)) ? undefined : gensym___121624319.stateVar9)})) ?? (new Date("2025-4-23"))) as Date));
    this.__backing_stateVar10 = STATE_MGMT_FACTORY.makeParam<Map<Double,Per>>(this, "stateVar10", (((({let gensym___40863473 = initializers;
    (((gensym___40863473) == (null)) ? undefined : gensym___40863473.stateVar10)})) ?? (new Map<number, Per>([[0, new Per(7)], [1, new Per(10)]]))) as Map<Double,Per>));
    this.__backing_stateVar11 = STATE_MGMT_FACTORY.makeParamOnce<Double>(this, "stateVar11", (((({let gensym___101188994 = initializers;
    (((gensym___101188994) == (null)) ? undefined : gensym___101188994.stateVar11)})) ?? (0.0)) as Double));
    this.__backing_stateVar12 = STATE_MGMT_FACTORY.makeProvider<Per>(this, "stateVar12", "stateVar12", new Per(6));
    this.__backing_stateVar11111 = STATE_MGMT_FACTORY.makeConsumer<"stateVar1">(this, "stateVar11111", "stateVar11111", "stateVar1");
    this.__backing_stateVar11188 = STATE_MGMT_FACTORY.makeProvider<"">(this, "stateVar11188", "var", "");
    this.__backing_stateVar11112 = STATE_MGMT_FACTORY.makeConsumer<Int>(this, "stateVar11112", "nihao", 50);
  }

  public __updateStruct(initializers: (__Options_CC | undefined)): void {
    if (({let gensym___245065060 = initializers;
    (((gensym___245065060) == (null)) ? undefined : gensym___245065060.__options_has_stateVar9)})) {
      this.__backing_stateVar9!.update((initializers!.stateVar9 as Date));
    }
    if (({let gensym___158661357 = initializers;
    (((gensym___158661357) == (null)) ? undefined : gensym___158661357.__options_has_stateVar10)})) {
      this.__backing_stateVar10!.update((initializers!.stateVar10 as Map<Double,Per>));
    }
  }

  private __backing_stateVar4?: IParamOnceDecoratedVariable<Set<String>>;

  public get stateVar4(): Set<String> {
    return this.__backing_stateVar4!.get();
  }

  public set stateVar4(value: Set<String>) {
    this.__backing_stateVar4!.set(value);
  }

  private __backing_stateVar5?: ILocalDecoratedVariable<Array<Boolean>>;

  public get stateVar5(): Array<Boolean> {
    return this.__backing_stateVar5!.get();
  }

  public set stateVar5(value: Array<Boolean>) {
    this.__backing_stateVar5!.set(value);
  }

  private __backing_stateVar6?: ILocalDecoratedVariable<Array<Per>>;

  public get stateVar6(): Array<Per> {
    return this.__backing_stateVar6!.get();
  }

  public set stateVar6(value: Array<Per>) {
    this.__backing_stateVar6!.set(value);
  }

  private __backing_stateVar7?: Any;

  public get stateVar7(): Array<Per> {
    return (this.__backing_stateVar7 as Array<Per>);
  }

  public set stateVar7(value: Array<Per>) {
    this.__backing_stateVar7 = value;
  }

  private __backing_stateVar8?: Any;

  public get stateVar8(): (sr: String) => void {
    return (this.__backing_stateVar8 as (sr: String) => void);
  }

  public set stateVar8(value: (sr: String) => void) {
    this.__backing_stateVar8 = value;
  }

  private __backing_stateVar9?: IParamDecoratedVariable<Date>;

  public get stateVar9(): Date {
    return this.__backing_stateVar9!.get();
  }

  private __backing_stateVar10?: IParamDecoratedVariable<Map<Double,Per>>;

  public get stateVar10(): Map<Double,Per> {
    return this.__backing_stateVar10!.get();
  }

  private __backing_stateVar11?: IParamOnceDecoratedVariable<Double>;

  public get stateVar11(): Double {
    return this.__backing_stateVar11!.get();
  }

  public set stateVar11(value: Double) {
    this.__backing_stateVar11!.set(value);
  }

  private __backing_stateVar12?: IProviderDecoratedVariable<Per>;

  public get stateVar12(): Per {
    return this.__backing_stateVar12!.get();
  }

  public set stateVar12(value: Per) {
    this.__backing_stateVar12!.set(value);
  }

  private __backing_stateVar11111?: IConsumerDecoratedVariable<"stateVar1">;

  public get stateVar11111(): "stateVar1" {
    return this.__backing_stateVar11111!.get();
  }

  public set stateVar11111(value: "stateVar1") {
    this.__backing_stateVar11111!.set(value);
  }

  private __backing_stateVar11188?: IProviderDecoratedVariable<"">;

  public get stateVar11188(): "" {
    return this.__backing_stateVar11188!.get();
  }

  public set stateVar11188(value: "") {
    this.__backing_stateVar11188!.set(value);
  }

  private __backing_stateVar11112?: IConsumerDecoratedVariable<Int>;

  public get stateVar11112(): Int {
    return this.__backing_stateVar11112!.get();
  }

  public set stateVar11112(value: Int) {
    this.__backing_stateVar11112!.set(value);
  }

  @memo() public build() {}

  public constructor() {}

}

@Component() export interface __Options_Parent {
  set stateVar1(stateVar1: (Any | undefined))

  get stateVar1(): (Any | undefined)
  set __backing_stateVar1(__backing_stateVar1: (IStateDecoratedVariable<Any> | undefined))

  get __backing_stateVar1(): (IStateDecoratedVariable<Any> | undefined)
  set __options_has_stateVar1(__options_has_stateVar1: (boolean | undefined))
  
  get __options_has_stateVar1(): (boolean | undefined)
  set stateVar2(stateVar2: (Any | undefined))

  get stateVar2(): (Any | undefined)
  set __backing_stateVar2(__backing_stateVar2: (IPropRefDecoratedVariable<Any> | undefined))
  
  get __backing_stateVar2(): (IPropRefDecoratedVariable<Any> | undefined)
  set __options_has_stateVar2(__options_has_stateVar2: (boolean | undefined))
  
  get __options_has_stateVar2(): (boolean | undefined)
  set stateVar3(stateVar3: (Any | undefined))

  get stateVar3(): (Any | undefined)
  set __backing_stateVar3(__backing_stateVar3: (IProvideDecoratedVariable<Any> | undefined))

  get __backing_stateVar3(): (IProvideDecoratedVariable<Any> | undefined)
  set __options_has_stateVar3(__options_has_stateVar3: (boolean | undefined))
  
  get __options_has_stateVar3(): (boolean | undefined)
  set stateVar8(stateVar8: (Any | undefined))

  get stateVar8(): (Any | undefined)
  set __options_has_stateVar8(__options_has_stateVar8: (boolean | undefined))
  
  get __options_has_stateVar8(): (boolean | undefined)
  set stateVar9(stateVar9: (Any | undefined))

  get stateVar9(): (Any | undefined)
  set __options_has_stateVar9(__options_has_stateVar9: (boolean | undefined))
  
  get __options_has_stateVar9(): (boolean | undefined)
  set stateVar11113(stateVar11113: (Any | undefined))

  get stateVar11113(): (Any | undefined)
  set __backing_stateVar11113(__backing_stateVar11113: (IProvideDecoratedVariable<Any> | undefined))

  get __backing_stateVar11113(): (IProvideDecoratedVariable<Any> | undefined)
  set __options_has_stateVar11113(__options_has_stateVar11113: (boolean | undefined))
  
  get __options_has_stateVar11113(): (boolean | undefined)
  set stateVar11114(stateVar11114: (Any | undefined))

  get stateVar11114(): (Any | undefined)
  set __backing_stateVar11114(__backing_stateVar11114: (IProvideDecoratedVariable<Any> | undefined))

  get __backing_stateVar11114(): (IProvideDecoratedVariable<Any> | undefined)
  set __options_has_stateVar11114(__options_has_stateVar11114: (boolean | undefined))
  
  get __options_has_stateVar11114(): (boolean | undefined)
  set stateVar11115(stateVar11115: (Any | undefined))

  get stateVar11115(): (Any | undefined)
  set __backing_stateVar11115(__backing_stateVar11115: (IStateDecoratedVariable<Any> | undefined))

  get __backing_stateVar11115(): (IStateDecoratedVariable<Any> | undefined)
  set __options_has_stateVar11115(__options_has_stateVar11115: (boolean | undefined))
  
  get __options_has_stateVar11115(): (boolean | undefined)
  
}

@ComponentV2() export interface __Options_V2Parent {
  set stateVar4(stateVar4: (Any | undefined))

  get stateVar4(): (Any | undefined)
  @Param() set __backing_stateVar4(__backing_stateVar4: (IParamOnceDecoratedVariable<Any> | undefined))

  @Param() get __backing_stateVar4(): (IParamOnceDecoratedVariable<Any> | undefined)
  set __options_has_stateVar4(__options_has_stateVar4: (boolean | undefined))
  
  get __options_has_stateVar4(): (boolean | undefined)
  set stateVar5(stateVar5: (Any | undefined))

  get stateVar5(): (Any | undefined)
  set __backing_stateVar5(__backing_stateVar5: (ILocalDecoratedVariable<Any> | undefined))

  get __backing_stateVar5(): (ILocalDecoratedVariable<Any> | undefined)
  set __options_has_stateVar5(__options_has_stateVar5: (boolean | undefined))
  
  get __options_has_stateVar5(): (boolean | undefined)
  set stateVar6(stateVar6: (Any | undefined))

  get stateVar6(): (Any | undefined)
  set __backing_stateVar6(__backing_stateVar6: (ILocalDecoratedVariable<Any> | undefined))

  get __backing_stateVar6(): (ILocalDecoratedVariable<Any> | undefined)
  set __options_has_stateVar6(__options_has_stateVar6: (boolean | undefined))
  
  get __options_has_stateVar6(): (boolean | undefined)
  set stateVar7(stateVar7: (Any | undefined))

  get stateVar7(): (Any | undefined)
  set __options_has_stateVar7(__options_has_stateVar7: (boolean | undefined))
  
  get __options_has_stateVar7(): (boolean | undefined)
  set stateVar8(stateVar8: (Any | undefined))

  get stateVar8(): (Any | undefined)
  set __options_has_stateVar8(__options_has_stateVar8: (boolean | undefined))
  
  get __options_has_stateVar8(): (boolean | undefined)
  set stateVar9(stateVar9: (Any | undefined))

  get stateVar9(): (Any | undefined)
  set __backing_stateVar9(__backing_stateVar9: (IParamDecoratedVariable<Any> | undefined))

  get __backing_stateVar9(): (IParamDecoratedVariable<Any> | undefined)
  set __options_has_stateVar9(__options_has_stateVar9: (boolean | undefined))
  
  get __options_has_stateVar9(): (boolean | undefined)
  set stateVar10(stateVar10: (Any | undefined))

  get stateVar10(): (Any | undefined)
  set __backing_stateVar10(__backing_stateVar10: (IParamDecoratedVariable<Any> | undefined))

  get __backing_stateVar10(): (IParamDecoratedVariable<Any> | undefined)
  set __options_has_stateVar10(__options_has_stateVar10: (boolean | undefined))
  
  get __options_has_stateVar10(): (boolean | undefined)
  set stateVar11(stateVar11: (Any | undefined))

  get stateVar11(): (Any | undefined)
  @Param() set __backing_stateVar11(__backing_stateVar11: (IParamOnceDecoratedVariable<Any> | undefined))

  @Param() get __backing_stateVar11(): (IParamOnceDecoratedVariable<Any> | undefined)
  set __options_has_stateVar11(__options_has_stateVar11: (boolean | undefined))
  
  get __options_has_stateVar11(): (boolean | undefined)
  set stateVar12(stateVar12: (Any | undefined))

  get stateVar12(): (Any | undefined)
  set __backing_stateVar12(__backing_stateVar12: (IProviderDecoratedVariable<Any> | undefined))

  get __backing_stateVar12(): (IProviderDecoratedVariable<Any> | undefined)
  set __options_has_stateVar12(__options_has_stateVar12: (boolean | undefined))
  
  get __options_has_stateVar12(): (boolean | undefined)
  set stateVar11111(stateVar11111: (Any | undefined))

  get stateVar11111(): (Any | undefined)
  set __backing_stateVar11111(__backing_stateVar11111: (IConsumerDecoratedVariable<Any> | undefined))

  get __backing_stateVar11111(): (IConsumerDecoratedVariable<Any> | undefined)
  set __options_has_stateVar11111(__options_has_stateVar11111: (boolean | undefined))
  
  get __options_has_stateVar11111(): (boolean | undefined)
  set stateVar11188(stateVar11188: (Any | undefined))

  get stateVar11188(): (Any | undefined)
  set __backing_stateVar11188(__backing_stateVar11188: (IProviderDecoratedVariable<Any> | undefined))

  get __backing_stateVar11188(): (IProviderDecoratedVariable<Any> | undefined)
  set __options_has_stateVar11188(__options_has_stateVar11188: (boolean | undefined))
  
  get __options_has_stateVar11188(): (boolean | undefined)
  set stateVar11112(stateVar11112: (Any | undefined))

  get stateVar11112(): (Any | undefined)
  set __backing_stateVar11112(__backing_stateVar11112: (IConsumerDecoratedVariable<Any> | undefined))

  get __backing_stateVar11112(): (IConsumerDecoratedVariable<Any> | undefined)
  set __options_has_stateVar11112(__options_has_stateVar11112: (boolean | undefined))
  
  get __options_has_stateVar11112(): (boolean | undefined)
  
}

@CustomDialog() export interface __Options_CC {
  set stateVar4(stateVar4: (Any | undefined))

  get stateVar4(): (Any | undefined)
  @Param() set __backing_stateVar4(__backing_stateVar4: (IParamOnceDecoratedVariable<Any> | undefined))

  @Param() get __backing_stateVar4(): (IParamOnceDecoratedVariable<Any> | undefined)
  set __options_has_stateVar4(__options_has_stateVar4: (boolean | undefined))
  
  get __options_has_stateVar4(): (boolean | undefined)
  set stateVar5(stateVar5: (Any | undefined))

  get stateVar5(): (Any | undefined)
  set __backing_stateVar5(__backing_stateVar5: (ILocalDecoratedVariable<Any> | undefined))

  get __backing_stateVar5(): (ILocalDecoratedVariable<Any> | undefined)
  set __options_has_stateVar5(__options_has_stateVar5: (boolean | undefined))
  
  get __options_has_stateVar5(): (boolean | undefined)
  set stateVar6(stateVar6: (Any | undefined))

  get stateVar6(): (Any | undefined)
  set __backing_stateVar6(__backing_stateVar6: (ILocalDecoratedVariable<Any> | undefined))

  get __backing_stateVar6(): (ILocalDecoratedVariable<Any> | undefined)
  set __options_has_stateVar6(__options_has_stateVar6: (boolean | undefined))
  
  get __options_has_stateVar6(): (boolean | undefined)
  set stateVar7(stateVar7: (Any | undefined))

  get stateVar7(): (Any | undefined)
  set __options_has_stateVar7(__options_has_stateVar7: (boolean | undefined))
  
  get __options_has_stateVar7(): (boolean | undefined)
  set stateVar8(stateVar8: (Any | undefined))

  get stateVar8(): (Any | undefined)
  set __options_has_stateVar8(__options_has_stateVar8: (boolean | undefined))
  
  get __options_has_stateVar8(): (boolean | undefined)
  set stateVar9(stateVar9: (Any | undefined))

  get stateVar9(): (Any | undefined)
  set __backing_stateVar9(__backing_stateVar9: (IParamDecoratedVariable<Any> | undefined))

  get __backing_stateVar9(): (IParamDecoratedVariable<Any> | undefined)
  set __options_has_stateVar9(__options_has_stateVar9: (boolean | undefined))
  
  get __options_has_stateVar9(): (boolean | undefined)
  set stateVar10(stateVar10: (Any | undefined))

  get stateVar10(): (Any | undefined)
  set __backing_stateVar10(__backing_stateVar10: (IParamDecoratedVariable<Any> | undefined))

  get __backing_stateVar10(): (IParamDecoratedVariable<Any> | undefined)
  set __options_has_stateVar10(__options_has_stateVar10: (boolean | undefined))
  
  get __options_has_stateVar10(): (boolean | undefined)
  set stateVar11(stateVar11: (Any | undefined))

  get stateVar11(): (Any | undefined)
  @Param() set __backing_stateVar11(__backing_stateVar11: (IParamOnceDecoratedVariable<Any> | undefined))

  @Param() get __backing_stateVar11(): (IParamOnceDecoratedVariable<Any> | undefined)
  set __options_has_stateVar11(__options_has_stateVar11: (boolean | undefined))
  
  get __options_has_stateVar11(): (boolean | undefined)
  set stateVar12(stateVar12: (Any | undefined))

  get stateVar12(): (Any | undefined)
  set __backing_stateVar12(__backing_stateVar12: (IProviderDecoratedVariable<Any> | undefined))

  get __backing_stateVar12(): (IProviderDecoratedVariable<Any> | undefined)
  set __options_has_stateVar12(__options_has_stateVar12: (boolean | undefined))
  
  get __options_has_stateVar12(): (boolean | undefined)
  set stateVar11111(stateVar11111: (Any | undefined))

  get stateVar11111(): (Any | undefined)
  set __backing_stateVar11111(__backing_stateVar11111: (IConsumerDecoratedVariable<Any> | undefined))

  get __backing_stateVar11111(): (IConsumerDecoratedVariable<Any> | undefined)
  set __options_has_stateVar11111(__options_has_stateVar11111: (boolean | undefined))
  
  get __options_has_stateVar11111(): (boolean | undefined)
  set stateVar11188(stateVar11188: (Any | undefined))

  get stateVar11188(): (Any | undefined)
  set __backing_stateVar11188(__backing_stateVar11188: (IProviderDecoratedVariable<Any> | undefined))

  get __backing_stateVar11188(): (IProviderDecoratedVariable<Any> | undefined)
  set __options_has_stateVar11188(__options_has_stateVar11188: (boolean | undefined))
  
  get __options_has_stateVar11188(): (boolean | undefined)
  set stateVar11112(stateVar11112: (Any | undefined))

  get stateVar11112(): (Any | undefined)
  set __backing_stateVar11112(__backing_stateVar11112: (IConsumerDecoratedVariable<Any> | undefined))

  get __backing_stateVar11112(): (IConsumerDecoratedVariable<Any> | undefined)
  set __options_has_stateVar11112(__options_has_stateVar11112: (boolean | undefined))
  
  get __options_has_stateVar11112(): (boolean | undefined)
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test no typeAnnotation variables',
    [parsedTransform, structNoRecheck, recheck],
    {
        'checked:struct-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
