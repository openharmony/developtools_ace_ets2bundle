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
import { dumpAnnotation, dumpGetterSetter, GetSetDumper } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const OBSERVED_DIR_PATH: string = 'decorators/once';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, OBSERVED_DIR_PATH, 'once-complex-type.ets'),
];

const observedTrackTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test complex type @Once decorated variables transformation', buildConfig);

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IParamOnceDecoratedVariable as IParamOnceDecoratedVariable } from "arkui.stateManagement.decorator";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { ComponentV2 as ComponentV2 } from "@ohos.arkui.component";

import { Param as Param, Once as Once } from "@ohos.arkui.stateManagement";

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

  private constructor(ordinal: int, value: int) {
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
    for (let i = ((StateType.#NamesArray.length) - (1));((i) >= (0));(--i)) {
      if (((name) == (StateType.#NamesArray[i]))) {
        return StateType.#ItemsArray[i];
      }
    }
    throw new Error((("No enum constant StateType.") + (name)));
  }

  public static fromValue(value: int): StateType {
    for (let i = ((StateType.#ValuesArray.length) - (1));((i) >= (0));(--i)) {
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

@ComponentV2() final struct Parent extends CustomComponentV2<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_onceVar1 = STATE_MGMT_FACTORY.makeParamOnce<Per>(this, "onceVar1", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onceVar1)}) ? (initializers!.onceVar1 as Per) : (new Per(6) as Per)));
    this.__backing_onceVar2 = STATE_MGMT_FACTORY.makeParamOnce<Array<number>>(this, "onceVar2", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onceVar2)}) ? (initializers!.onceVar2 as Array<number>) : (new Array<number>(3, 6, 8) as Array<number>)));
    this.__backing_onceVar3 = STATE_MGMT_FACTORY.makeParamOnce<StateType>(this, "onceVar3", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onceVar3)}) ? (initializers!.onceVar3 as StateType) : StateType.TYPE3));
    this.__backing_onceVar4 = STATE_MGMT_FACTORY.makeParamOnce<Set<string>>(this, "onceVar4", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onceVar4)}) ? (initializers!.onceVar4 as Set<string>) : (new Set<string>(new Array<string>("aa", "bb")) as Set<string>)));
    this.__backing_onceVar5 = STATE_MGMT_FACTORY.makeParamOnce<Array<boolean>>(this, "onceVar5", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onceVar5)}) ? (initializers!.onceVar5 as Array<boolean>) : ([true, false] as Array<boolean>)));
    this.__backing_onceVar6 = STATE_MGMT_FACTORY.makeParamOnce<Array<Per>>(this, "onceVar6", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onceVar6)}) ? (initializers!.onceVar6 as Array<Per>) : (new Array<Per>(new Per(7), new Per(11)) as Array<Per>)));
    this.__backing_onceVar7 = STATE_MGMT_FACTORY.makeParamOnce<Array<Per>>(this, "onceVar7", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onceVar7)}) ? (initializers!.onceVar7 as Array<Per>) : ([new Per(7), new Per(11)] as Array<Per>)));
    this.__backing_onceVar8 = STATE_MGMT_FACTORY.makeParamOnce<((sr: string)=> void)>(this, "onceVar8", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onceVar8)}) ? (initializers!.onceVar8 as ((sr: string)=> void)) : (((sr: string) => {}) as ((sr: string)=> void))));
    this.__backing_onceVar9 = STATE_MGMT_FACTORY.makeParamOnce<Date>(this, "onceVar9", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onceVar9)}) ? (initializers!.onceVar9 as Date) : (new Date("2025-4-23") as Date)));
    this.__backing_onceVar10 = STATE_MGMT_FACTORY.makeParamOnce<Map<number, Per>>(this, "onceVar10", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onceVar10)}) ? (initializers!.onceVar10 as Map<number, Per>) : (new Map<number, Per>([[0, new Per(7)], [1, new Per(10)]]) as Map<number, Per>)));
    this.__backing_onceVar11 = STATE_MGMT_FACTORY.makeParamOnce<(string | number)>(this, "onceVar11", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onceVar11)}) ? (initializers!.onceVar11 as (string | number)) : (0.0 as (string | number))));
    this.__backing_onceVar12 = STATE_MGMT_FACTORY.makeParamOnce<(Set<string> | Per)>(this, "onceVar12", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onceVar12)}) ? (initializers!.onceVar12 as (Set<string> | Per)) : (new Per(6) as (Set<string> | Per))));
  }

  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}

  public resetStateVarsOnReuse(initializers: (__Options_Parent | undefined)): void {
    this.__backing_onceVar1!.resetOnReuse((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onceVar1)}) ? (initializers!.onceVar1 as Per) : (new Per(6) as Per)));
    this.__backing_onceVar2!.resetOnReuse((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onceVar2)}) ? (initializers!.onceVar2 as Array<number>) : (new Array<number>(3, 6, 8) as Array<number>)));
    this.__backing_onceVar3!.resetOnReuse((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onceVar3)}) ? (initializers!.onceVar3 as StateType) : StateType.TYPE3));
    this.__backing_onceVar4!.resetOnReuse((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onceVar4)}) ? (initializers!.onceVar4 as Set<string>) : (new Set<string>(new Array<string>("aa", "bb")) as Set<string>)));
    this.__backing_onceVar5!.resetOnReuse((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onceVar5)}) ? (initializers!.onceVar5 as Array<boolean>) : ([true, false] as Array<boolean>)));
    this.__backing_onceVar6!.resetOnReuse((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onceVar6)}) ? (initializers!.onceVar6 as Array<Per>) : (new Array<Per>(new Per(7), new Per(11)) as Array<Per>)));
    this.__backing_onceVar7!.resetOnReuse((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onceVar7)}) ? (initializers!.onceVar7 as Array<Per>) : ([new Per(7), new Per(11)] as Array<Per>)));
    this.__backing_onceVar8!.resetOnReuse((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onceVar8)}) ? (initializers!.onceVar8 as ((sr: string)=> void)) : (((sr: string) => {}) as ((sr: string)=> void))));
    this.__backing_onceVar9!.resetOnReuse((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onceVar9)}) ? (initializers!.onceVar9 as Date) : (new Date("2025-4-23") as Date)));
    this.__backing_onceVar10!.resetOnReuse((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onceVar10)}) ? (initializers!.onceVar10 as Map<number, Per>) : (new Map<number, Per>([[0, new Per(7)], [1, new Per(10)]]) as Map<number, Per>)));
    this.__backing_onceVar11!.resetOnReuse((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onceVar11)}) ? (initializers!.onceVar11 as (string | number)) : (0.0 as (string | number))));
    this.__backing_onceVar12!.resetOnReuse((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_onceVar12)}) ? (initializers!.onceVar12 as (Set<string> | Per)) : (new Per(6) as (Set<string> | Per))));
  }

  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: Parent)=> void) | undefined), initializers: ((()=> __Options_Parent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<Parent, __Options_Parent>(style, ((): Parent => {
      return new Parent();
    }), initializers, reuseId, content, {
      sClass: Class.from<Parent>(),
    });
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Parent, storage?: LocalStorage, @Builder() content?: (()=> void)): Parent {
    throw new Error("Declare interface");
  }

  private __backing_onceVar1?: IParamOnceDecoratedVariable<Per>;

  public get onceVar1(): Per {
    return this.__backing_onceVar1!.get();
  }

  public set onceVar1(value: Per) {
    this.__backing_onceVar1!.set(value);
  }

  private __backing_onceVar2?: IParamOnceDecoratedVariable<Array<number>>;

  public get onceVar2(): Array<number> {
    return this.__backing_onceVar2!.get();
  }

  public set onceVar2(value: Array<number>) {
    this.__backing_onceVar2!.set(value);
  }

  private __backing_onceVar3?: IParamOnceDecoratedVariable<StateType>;

  public get onceVar3(): StateType {
    return this.__backing_onceVar3!.get();
  }

  public set onceVar3(value: StateType) {
    this.__backing_onceVar3!.set(value);
  }

  private __backing_onceVar4?: IParamOnceDecoratedVariable<Set<string>>;

  public get onceVar4(): Set<string> {
    return this.__backing_onceVar4!.get();
  }

  public set onceVar4(value: Set<string>) {
    this.__backing_onceVar4!.set(value);
  }

  private __backing_onceVar5?: IParamOnceDecoratedVariable<Array<boolean>>;

  public get onceVar5(): Array<boolean> {
    return this.__backing_onceVar5!.get();
  }

  public set onceVar5(value: Array<boolean>) {
    this.__backing_onceVar5!.set(value);
  }

  private __backing_onceVar6?: IParamOnceDecoratedVariable<Array<Per>>;

  public get onceVar6(): Array<Per> {
    return this.__backing_onceVar6!.get();
  }

  public set onceVar6(value: Array<Per>) {
    this.__backing_onceVar6!.set(value);
  }

  private __backing_onceVar7?: IParamOnceDecoratedVariable<Array<Per>>;

  public get onceVar7(): Array<Per> {
    return this.__backing_onceVar7!.get();
  }

  public set onceVar7(value: Array<Per>) {
    this.__backing_onceVar7!.set(value);
  }

  private __backing_onceVar8?: IParamOnceDecoratedVariable<((sr: string)=> void)>;

  public get onceVar8(): ((sr: string)=> void) {
    return this.__backing_onceVar8!.get();
  }

  public set onceVar8(value: ((sr: string)=> void)) {
    this.__backing_onceVar8!.set(value);
  }

  private __backing_onceVar9?: IParamOnceDecoratedVariable<Date>;

  public get onceVar9(): Date {
    return this.__backing_onceVar9!.get();
  }

  public set onceVar9(value: Date) {
    this.__backing_onceVar9!.set(value);
  }

  private __backing_onceVar10?: IParamOnceDecoratedVariable<Map<number, Per>>;

  public get onceVar10(): Map<number, Per> {
    return this.__backing_onceVar10!.get();
  }

  public set onceVar10(value: Map<number, Per>) {
    this.__backing_onceVar10!.set(value);
  }

  private __backing_onceVar11?: IParamOnceDecoratedVariable<(string | number)>;

  public get onceVar11(): (string | number) {
    return this.__backing_onceVar11!.get();
  }

  public set onceVar11(value: (string | number)) {
    this.__backing_onceVar11!.set(value);
  }

  private __backing_onceVar12?: IParamOnceDecoratedVariable<(Set<string> | Per)>;

  public get onceVar12(): (Set<string> | Per) {
    return this.__backing_onceVar12!.get();
  }

  public set onceVar12(value: (Set<string> | Per)) {
    this.__backing_onceVar12!.set(value);
  }

  @Memo() 
  public build() {}

  public constructor() {}
  static {
  }
}

@ComponentV2() class __Options_Parent {
  @Once() @Param() public onceVar1?: Per;
  @Param() public __backing_onceVar1?: IParamOnceDecoratedVariable<Per>;
  public __options_has_onceVar1?: boolean;
  @Once() @Param() public onceVar2?: Array<number>;
  @Param() public __backing_onceVar2?: IParamOnceDecoratedVariable<Array<number>>;
  public __options_has_onceVar2?: boolean;
  @Once() @Param() public onceVar3?: StateType;
  @Param() public __backing_onceVar3?: IParamOnceDecoratedVariable<StateType>;
  public __options_has_onceVar3?: boolean;
  @Once() @Param() public onceVar4?: Set<string>;
  @Param() public __backing_onceVar4?: IParamOnceDecoratedVariable<Set<string>>;
  public __options_has_onceVar4?: boolean;
  @Once() @Param() public onceVar5?: Array<boolean>;
  @Param() public __backing_onceVar5?: IParamOnceDecoratedVariable<Array<boolean>>;
  public __options_has_onceVar5?: boolean;
  @Once() @Param() public onceVar6?: Array<Per>;
  @Param() public __backing_onceVar6?: IParamOnceDecoratedVariable<Array<Per>>;
  public __options_has_onceVar6?: boolean;
  @Once() @Param() public onceVar7?: Array<Per>;
  @Param() public __backing_onceVar7?: IParamOnceDecoratedVariable<Array<Per>>;
  public __options_has_onceVar7?: boolean;
  @Once() @Param() public onceVar8?: (((sr: string)=> void) | undefined);
  @Param() public __backing_onceVar8?: IParamOnceDecoratedVariable<(((sr: string)=> void) | undefined)>;
  public __options_has_onceVar8?: boolean;
  @Once() @Param() public onceVar9?: Date;
  @Param() public __backing_onceVar9?: IParamOnceDecoratedVariable<Date>;
  public __options_has_onceVar9?: boolean;
  @Once() @Param() public onceVar10?: Map<number, Per>;
  @Param() public __backing_onceVar10?: IParamOnceDecoratedVariable<Map<number, Per>>;
  public __options_has_onceVar10?: boolean;
  @Once() @Param() public onceVar11?: (string | number);
  @Param() public __backing_onceVar11?: IParamOnceDecoratedVariable<(string | number)>;
  public __options_has_onceVar11?: boolean;
  @Once() @Param() public onceVar12?: (Set<string> | Per);
  @Param() public __backing_onceVar12?: IParamOnceDecoratedVariable<(Set<string> | Per)>;
  public __options_has_onceVar12?: boolean;
  public constructor() {}
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test complex type @Once decorated variables transformation',
    [observedTrackTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
