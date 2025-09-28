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

const STATE_DIR_PATH: string = 'decorators/state';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'state-complex-type.ets'),
];

const pluginTester = new PluginTester('test complex type @State decorated variables transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'state-complex-type',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Component as Component } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement";

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

@Component() final struct Parent extends CustomComponent<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_stateVar1 = STATE_MGMT_FACTORY.makeState<Per>(this, "stateVar1", ((({let gensym___213853607 = initializers;
    (((gensym___213853607) == (null)) ? undefined : gensym___213853607.stateVar1)})) ?? (new Per(6))));
    this.__backing_stateVar2 = STATE_MGMT_FACTORY.makeState<Array<number>>(this, "stateVar2", ((({let gensym___113574154 = initializers;
    (((gensym___113574154) == (null)) ? undefined : gensym___113574154.stateVar2)})) ?? (new Array<number>(3, 6, 8))));
    this.__backing_stateVar3 = STATE_MGMT_FACTORY.makeState<StateType>(this, "stateVar3", ((({let gensym___166994972 = initializers;
    (((gensym___166994972) == (null)) ? undefined : gensym___166994972.stateVar3)})) ?? (StateType.TYPE3)));
    this.__backing_stateVar4 = STATE_MGMT_FACTORY.makeState<Set<string>>(this, "stateVar4", ((({let gensym___148024261 = initializers;
    (((gensym___148024261) == (null)) ? undefined : gensym___148024261.stateVar4)})) ?? (new Set<string>(new Array<string>("aa", "bb")))));
    this.__backing_stateVar5 = STATE_MGMT_FACTORY.makeState<Array<boolean>>(this, "stateVar5", ((({let gensym___99384342 = initializers;
    (((gensym___99384342) == (null)) ? undefined : gensym___99384342.stateVar5)})) ?? ([true, false])));
    this.__backing_stateVar6 = STATE_MGMT_FACTORY.makeState<Array<Per>>(this, "stateVar6", ((({let gensym___133364871 = initializers;
    (((gensym___133364871) == (null)) ? undefined : gensym___133364871.stateVar6)})) ?? (new Array<Per>(new Per(7), new Per(11)))));
    this.__backing_stateVar7 = STATE_MGMT_FACTORY.makeState<Array<Per>>(this, "stateVar7", ((({let gensym___69403028 = initializers;
    (((gensym___69403028) == (null)) ? undefined : gensym___69403028.stateVar7)})) ?? ([new Per(7), new Per(11)])));
    this.__backing_stateVar8 = STATE_MGMT_FACTORY.makeState<((sr: string)=> void)>(this, "stateVar8", ((({let gensym___219403122 = initializers;
    (((gensym___219403122) == (null)) ? undefined : gensym___219403122.stateVar8)})) ?? (((sr: string) => {}))));
    this.__backing_stateVar9 = STATE_MGMT_FACTORY.makeState<Date>(this, "stateVar9", ((({let gensym___171171899 = initializers;
    (((gensym___171171899) == (null)) ? undefined : gensym___171171899.stateVar9)})) ?? (new Date("2025-4-23"))));
    this.__backing_stateVar10 = STATE_MGMT_FACTORY.makeState<Map<number, Per>>(this, "stateVar10", ((({let gensym___91651348 = initializers;
    (((gensym___91651348) == (null)) ? undefined : gensym___91651348.stateVar10)})) ?? (new Map<number, Per>([[0, new Per(7)], [1, new Per(10)]]))));
    this.__backing_stateVar11 = STATE_MGMT_FACTORY.makeState<(string | number)>(this, "stateVar11", ((({let gensym___56045278 = initializers;
    (((gensym___56045278) == (null)) ? undefined : gensym___56045278.stateVar11)})) ?? (0.0)));
    this.__backing_stateVar12 = STATE_MGMT_FACTORY.makeState<(Set<string> | Per)>(this, "stateVar12", ((({let gensym___164759887 = initializers;
    (((gensym___164759887) == (null)) ? undefined : gensym___164759887.stateVar12)})) ?? (new Per(6))));
  }

  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}

  private __backing_stateVar1?: IStateDecoratedVariable<Per>;

  public get stateVar1(): Per {
    return this.__backing_stateVar1!.get();
  }

  public set stateVar1(value: Per) {
    this.__backing_stateVar1!.set(value);
  }

  private __backing_stateVar2?: IStateDecoratedVariable<Array<number>>;

  public get stateVar2(): Array<number> {
    return this.__backing_stateVar2!.get();
  }

  public set stateVar2(value: Array<number>) {
    this.__backing_stateVar2!.set(value);
  }

  private __backing_stateVar3?: IStateDecoratedVariable<StateType>;

  public get stateVar3(): StateType {
    return this.__backing_stateVar3!.get();
  }

  public set stateVar3(value: StateType) {
    this.__backing_stateVar3!.set(value);
  }

  private __backing_stateVar4?: IStateDecoratedVariable<Set<string>>;

  public get stateVar4(): Set<string> {
    return this.__backing_stateVar4!.get();
  }

  public set stateVar4(value: Set<string>) {
    this.__backing_stateVar4!.set(value);
  }

  private __backing_stateVar5?: IStateDecoratedVariable<Array<boolean>>;

  public get stateVar5(): Array<boolean> {
    return this.__backing_stateVar5!.get();
  }

  public set stateVar5(value: Array<boolean>) {
    this.__backing_stateVar5!.set(value);
  }

  private __backing_stateVar6?: IStateDecoratedVariable<Array<Per>>;

  public get stateVar6(): Array<Per> {
    return this.__backing_stateVar6!.get();
  }

  public set stateVar6(value: Array<Per>) {
    this.__backing_stateVar6!.set(value);
  }

  private __backing_stateVar7?: IStateDecoratedVariable<Array<Per>>;

  public get stateVar7(): Array<Per> {
    return this.__backing_stateVar7!.get();
  }

  public set stateVar7(value: Array<Per>) {
    this.__backing_stateVar7!.set(value);
  }

  private __backing_stateVar8?: IStateDecoratedVariable<((sr: string)=> void)>;

  public get stateVar8(): ((sr: string)=> void) {
    return this.__backing_stateVar8!.get();
  }

  public set stateVar8(value: ((sr: string)=> void)) {
    this.__backing_stateVar8!.set(value);
  }

  private __backing_stateVar9?: IStateDecoratedVariable<Date>;

  public get stateVar9(): Date {
    return this.__backing_stateVar9!.get();
  }

  public set stateVar9(value: Date) {
    this.__backing_stateVar9!.set(value);
  }

  private __backing_stateVar10?: IStateDecoratedVariable<Map<number, Per>>;

  public get stateVar10(): Map<number, Per> {
    return this.__backing_stateVar10!.get();
  }

  public set stateVar10(value: Map<number, Per>) {
    this.__backing_stateVar10!.set(value);
  }

  private __backing_stateVar11?: IStateDecoratedVariable<(string | number)>;

  public get stateVar11(): (string | number) {
    return this.__backing_stateVar11!.get();
  }

  public set stateVar11(value: (string | number)) {
    this.__backing_stateVar11!.set(value);
  }

  private __backing_stateVar12?: IStateDecoratedVariable<(Set<string> | Per)>;

  public get stateVar12(): (Set<string> | Per) {
    return this.__backing_stateVar12!.get();
  }

  public set stateVar12(value: (Set<string> | Per)) {
    this.__backing_stateVar12!.set(value);
  }

  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: Parent)=> void), initializers: ((()=> __Options_Parent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Parent, __Options_Parent>(style, ((): Parent => {
      return new Parent(false, ({let gensym___192738000 = storage;
      (((gensym___192738000) == (null)) ? undefined : gensym___192738000())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Parent, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): Parent {
    throw new Error("Declare interface");
  }

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

@Component() export interface __Options_Parent {
  set stateVar1(stateVar1: (Per | undefined))

  get stateVar1(): (Per | undefined)
  set __backing_stateVar1(__backing_stateVar1: (IStateDecoratedVariable<Per> | undefined))

  get __backing_stateVar1(): (IStateDecoratedVariable<Per> | undefined)
  set __options_has_stateVar1(__options_has_stateVar1: (boolean | undefined))
  
  get __options_has_stateVar1(): (boolean | undefined)
  set stateVar2(stateVar2: (Array<number> | undefined))

  get stateVar2(): (Array<number> | undefined)
  set __backing_stateVar2(__backing_stateVar2: (IStateDecoratedVariable<Array<number>> | undefined))

  get __backing_stateVar2(): (IStateDecoratedVariable<Array<number>> | undefined)
  set __options_has_stateVar2(__options_has_stateVar2: (boolean | undefined))
  
  get __options_has_stateVar2(): (boolean | undefined)
  set stateVar3(stateVar3: (StateType | undefined))

  get stateVar3(): (StateType | undefined)
  set __backing_stateVar3(__backing_stateVar3: (IStateDecoratedVariable<StateType> | undefined))

  get __backing_stateVar3(): (IStateDecoratedVariable<StateType> | undefined)
  set __options_has_stateVar3(__options_has_stateVar3: (boolean | undefined))
  
  get __options_has_stateVar3(): (boolean | undefined)
  set stateVar4(stateVar4: (Set<string> | undefined))

  get stateVar4(): (Set<string> | undefined)
  set __backing_stateVar4(__backing_stateVar4: (IStateDecoratedVariable<Set<string>> | undefined))

  get __backing_stateVar4(): (IStateDecoratedVariable<Set<string>> | undefined)
  set __options_has_stateVar4(__options_has_stateVar4: (boolean | undefined))
  
  get __options_has_stateVar4(): (boolean | undefined)
  set stateVar5(stateVar5: (Array<boolean> | undefined))

  get stateVar5(): (Array<boolean> | undefined)
  set __backing_stateVar5(__backing_stateVar5: (IStateDecoratedVariable<Array<boolean>> | undefined))

  get __backing_stateVar5(): (IStateDecoratedVariable<Array<boolean>> | undefined)
  set __options_has_stateVar5(__options_has_stateVar5: (boolean | undefined))
  
  get __options_has_stateVar5(): (boolean | undefined)
  set stateVar6(stateVar6: (Array<Per> | undefined))

  get stateVar6(): (Array<Per> | undefined)
  set __backing_stateVar6(__backing_stateVar6: (IStateDecoratedVariable<Array<Per>> | undefined))

  get __backing_stateVar6(): (IStateDecoratedVariable<Array<Per>> | undefined)
  set __options_has_stateVar6(__options_has_stateVar6: (boolean | undefined))
  
  get __options_has_stateVar6(): (boolean | undefined)
  set stateVar7(stateVar7: (Array<Per> | undefined))

  get stateVar7(): (Array<Per> | undefined)
  set __backing_stateVar7(__backing_stateVar7: (IStateDecoratedVariable<Array<Per>> | undefined))

  get __backing_stateVar7(): (IStateDecoratedVariable<Array<Per>> | undefined)
  set __options_has_stateVar7(__options_has_stateVar7: (boolean | undefined))
  
  get __options_has_stateVar7(): (boolean | undefined)
  set stateVar8(stateVar8: (((sr: string)=> void) | undefined))

  get stateVar8(): (((sr: string)=> void) | undefined)
  set __backing_stateVar8(__backing_stateVar8: (IStateDecoratedVariable<((sr: string)=> void)> | undefined))

  get __backing_stateVar8(): (IStateDecoratedVariable<((sr: string)=> void)> | undefined)
  set __options_has_stateVar8(__options_has_stateVar8: (boolean | undefined))
  
  get __options_has_stateVar8(): (boolean | undefined)
  set stateVar9(stateVar9: (Date | undefined))

  get stateVar9(): (Date | undefined)
  set __backing_stateVar9(__backing_stateVar9: (IStateDecoratedVariable<Date> | undefined))

  get __backing_stateVar9(): (IStateDecoratedVariable<Date> | undefined)
  set __options_has_stateVar9(__options_has_stateVar9: (boolean | undefined))
  
  get __options_has_stateVar9(): (boolean | undefined)
  set stateVar10(stateVar10: (Map<number, Per> | undefined))

  get stateVar10(): (Map<number, Per> | undefined)
  set __backing_stateVar10(__backing_stateVar10: (IStateDecoratedVariable<Map<number, Per>> | undefined))

  get __backing_stateVar10(): (IStateDecoratedVariable<Map<number, Per>> | undefined)
  set __options_has_stateVar10(__options_has_stateVar10: (boolean | undefined))
  
  get __options_has_stateVar10(): (boolean | undefined)
  set stateVar11(stateVar11: ((string | number) | undefined))

  get stateVar11(): ((string | number) | undefined)
  set __backing_stateVar11(__backing_stateVar11: (IStateDecoratedVariable<(string | number)> | undefined))

  get __backing_stateVar11(): (IStateDecoratedVariable<(string | number)> | undefined)
  set __options_has_stateVar11(__options_has_stateVar11: (boolean | undefined))
  
  get __options_has_stateVar11(): (boolean | undefined)
  set stateVar12(stateVar12: ((Set<string> | Per) | undefined))

  get stateVar12(): ((Set<string> | Per) | undefined)
  set __backing_stateVar12(__backing_stateVar12: (IStateDecoratedVariable<(Set<string> | Per)> | undefined))

  get __backing_stateVar12(): (IStateDecoratedVariable<(Set<string> | Per)> | undefined)
  set __options_has_stateVar12(__options_has_stateVar12: (boolean | undefined))
  
  get __options_has_stateVar12(): (boolean | undefined)
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test complex type @State decorated variables transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
