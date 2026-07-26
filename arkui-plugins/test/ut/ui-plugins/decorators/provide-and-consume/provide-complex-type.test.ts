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
import { structNoRecheck, recheck, beforeUINoRecheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, dumpConstructor, dumpAnnotation } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/provide-and-consume';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'provide-complex-type.ets'),
];

const pluginTester = new PluginTester('test complex type @Provide decorated variables transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'provide-complex-type',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { IProvideDecoratedVariable as IProvideDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component } from "@ohos.arkui.component";

import { Provide as Provide } from "@ohos.arkui.stateManagement";

function main() {}

class Per {
  public num: number;

  public constructor(num: number) {
    this.num = num;
  }

}

final class PropType extends BaseEnum<int> {
  private readonly #ordinal: int;

  private static <cctor>() {}

  private constructor(ordinal: int, value: int) {
    super(value);
    this.#ordinal = ordinal;
  }

  public static readonly TYPE1: PropType = new PropType(0, 0);
  public static readonly TYPE2: PropType = new PropType(1, 1);
  public static readonly TYPE3: PropType = new PropType(2, 3);
  private static readonly #NamesArray: String[] = ["TYPE1", "TYPE2", "TYPE3"];
  private static readonly #ValuesArray: int[] = [0, 1, 3];
  private static readonly #StringValuesArray: String[] = ["0", "1", "3"];
  private static readonly #ItemsArray: PropType[] = [PropType.TYPE1, PropType.TYPE2, PropType.TYPE3];

  public getName(): String {
    return PropType.#NamesArray[this.#ordinal];
  }

  public static getValueOf(name: String): PropType {
    for (let i = ((PropType.#NamesArray.length) - (1));((i) >= (0));(--i)) {
      if (((name) == (PropType.#NamesArray[i]))) {
        return PropType.#ItemsArray[i];
      }
    }
    throw new Error((("No enum constant PropType.") + (name)));
  }

  public static fromValue(value: int): PropType {
    for (let i = ((PropType.#ValuesArray.length) - (1));((i) >= (0));(--i)) {
      if (((value) == (PropType.#ValuesArray[i]))) {
        return PropType.#ItemsArray[i];
      }
    }
    throw new Error((("No enum PropType with value ") + (value)));
  }

  public valueOf(): int {
    return PropType.#ValuesArray[this.#ordinal];
  }

  public toString(): String {
    return PropType.#StringValuesArray[this.#ordinal];
  }

  public static values(): PropType[] {
    return PropType.#ItemsArray;
  }

  public getOrdinal(): int {
    return this.#ordinal;
  }

  public static $_get(e: PropType): String {
    return e.getName();
  }

}

@Component() final struct Parent extends CustomComponent<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_provideVar1 = STATE_MGMT_FACTORY.makeProvide<Per>(this, "provideVar1", "provideVar1", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_provideVar1)}) ? (initializers!.provideVar1 as Per) : (new Per(6) as Per)), false);
    this.__backing_provideVar2 = STATE_MGMT_FACTORY.makeProvide<Array<number>>(this, "provideVar2", "provideVar2", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_provideVar2)}) ? (initializers!.provideVar2 as Array<number>) : (new Array<number>(3, 6, 8) as Array<number>)), false);
    this.__backing_provideVar3 = STATE_MGMT_FACTORY.makeProvide<PropType>(this, "provideVar3", "provideVar3", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_provideVar3)}) ? (initializers!.provideVar3 as PropType) : PropType.TYPE3), false);
    this.__backing_provideVar4 = STATE_MGMT_FACTORY.makeProvide<Set<string>>(this, "provideVar4", "provideVar4", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_provideVar4)}) ? (initializers!.provideVar4 as Set<string>) : (new Set<string>(new Array<string>("aa", "bb")) as Set<string>)), false);
    this.__backing_provideVar5 = STATE_MGMT_FACTORY.makeProvide<Array<boolean>>(this, "provideVar5", "provideVar5", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_provideVar5)}) ? (initializers!.provideVar5 as Array<boolean>) : ([true, false] as Array<boolean>)), false);
    this.__backing_provideVar6 = STATE_MGMT_FACTORY.makeProvide<Array<Per>>(this, "provideVar6", "provideVar6", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_provideVar6)}) ? (initializers!.provideVar6 as Array<Per>) : (new Array<Per>(new Per(7), new Per(11)) as Array<Per>)), false);
    this.__backing_provideVar7 = STATE_MGMT_FACTORY.makeProvide<Array<Per>>(this, "provideVar7", "provideVar7", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_provideVar7)}) ? (initializers!.provideVar7 as Array<Per>) : ([new Per(7), new Per(11)] as Array<Per>)), false);
    this.__backing_provideVar8 = STATE_MGMT_FACTORY.makeProvide<((sr: string)=> void)>(this, "provideVar8", "provideVar8", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_provideVar8)}) ? (initializers!.provideVar8 as ((sr: string)=> void)) : (((sr: string) => {}) as ((sr: string)=> void))), false);
    this.__backing_provideVar9 = STATE_MGMT_FACTORY.makeProvide<Date>(this, "provideVar9", "provideVar9", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_provideVar9)}) ? (initializers!.provideVar9 as Date) : (new Date("2025-4-23") as Date)), false);
    this.__backing_provideVar10 = STATE_MGMT_FACTORY.makeProvide<Map<number, Per>>(this, "provideVar10", "provideVar10", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_provideVar10)}) ? (initializers!.provideVar10 as Map<number, Per>) : (new Map<number, Per>([[0, new Per(7)], [1, new Per(10)]]) as Map<number, Per>)), false);
    this.__backing_provideVar11 = STATE_MGMT_FACTORY.makeProvide<(string | number)>(this, "provideVar11", "provideVar11", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_provideVar11)}) ? (initializers!.provideVar11 as (string | number)) : (0.0 as (string | number))), false);
    this.__backing_provideVar12 = STATE_MGMT_FACTORY.makeProvide<(Set<string> | Per)>(this, "provideVar12", "provideVar12", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_provideVar12)}) ? (initializers!.provideVar12 as (Set<string> | Per)) : (new Per(6) as (Set<string> | Per))), false);
    this.__backing_provideVar13 = STATE_MGMT_FACTORY.makeProvide<(Array<string> | undefined)>(this, "provideVar13", "a", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_provideVar13)}) ? (initializers!.provideVar13 as (Array<string> | undefined)) : (new Array<string>("1", "1", "2") as (Array<string> | undefined))), false);
    this.__backing_provideVar14 = STATE_MGMT_FACTORY.makeProvide<(Set<string> | Per)>(this, "provideVar14", "b", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_provideVar14)}) ? (initializers!.provideVar14 as (Set<string> | Per)) : (new Per(6) as (Set<string> | Per))), false);
    this.__backing_provideVar15 = STATE_MGMT_FACTORY.makeProvide<Date>(this, "provideVar15", "provideVar15", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_provideVar15)}) ? (initializers!.provideVar15 as Date) : (new Date("2026-02-09") as Date)), true);
    this.__backing_provideVar16 = STATE_MGMT_FACTORY.makeProvide<(Set<string> | null)>(this, "provideVar16", "provideVar16", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_provideVar16)}) ? (initializers!.provideVar16 as (Set<string> | null)) : (new Set<string>(new Array<string>("a", "b", "c")) as (Set<string> | null))), true);
    this.__backing_provideVar17 = STATE_MGMT_FACTORY.makeProvide<Array<Per>>(this, "provideVar17", "provideVar17", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_provideVar17)}) ? (initializers!.provideVar17 as Array<Per>) : ([new Per(1), new Per(2)] as Array<Per>)), false);
    this.__backing_provideVar18 = STATE_MGMT_FACTORY.makeProvide<Array<Per>>(this, "provideVar18", "provideVar18", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_provideVar18)}) ? (initializers!.provideVar18 as Array<Per>) : (new Array<Per>(new Per(3), new Per(4)) as Array<Per>)), false);
    this.__backing_provideVar19 = STATE_MGMT_FACTORY.makeProvide<Map<string, Per>>(this, "provideVar19", "c", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_provideVar19)}) ? (initializers!.provideVar19 as Map<string, Per>) : (new Map<string, Per>([["1", new Per(1)], ["2", new Per(2)]]) as Map<string, Per>)), true);
    this.__backing_provideVar20 = STATE_MGMT_FACTORY.makeProvide<Array<boolean>>(this, "provideVar20", "d", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_provideVar20)}) ? (initializers!.provideVar20 as Array<boolean>) : ([true, false, true, true] as Array<boolean>)), false);
  }

  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}

  public resetStateVarsOnReuse(initializers: (__Options_Parent | undefined)): void {
    this.__backing_provideVar1!.resetOnReuse(new Per(6));
    this.__backing_provideVar2!.resetOnReuse(new Array<number>(3, 6, 8));
    this.__backing_provideVar3!.resetOnReuse(PropType.TYPE3);
    this.__backing_provideVar4!.resetOnReuse(new Set<string>(new Array<string>("aa", "bb")));
    this.__backing_provideVar5!.resetOnReuse([true, false]);
    this.__backing_provideVar6!.resetOnReuse(new Array<Per>(new Per(7), new Per(11)));
    this.__backing_provideVar7!.resetOnReuse([new Per(7), new Per(11)]);
    this.__backing_provideVar8!.resetOnReuse(((sr: string) => {}));
    this.__backing_provideVar9!.resetOnReuse(new Date("2025-4-23"));
    this.__backing_provideVar10!.resetOnReuse(new Map<number, Per>([[0, new Per(7)], [1, new Per(10)]]));
    this.__backing_provideVar11!.resetOnReuse(0.0);
    this.__backing_provideVar12!.resetOnReuse(new Per(6));
    this.__backing_provideVar13!.resetOnReuse(new Array<string>("1", "1", "2"));
    this.__backing_provideVar14!.resetOnReuse(new Per(6));
    this.__backing_provideVar15!.resetOnReuse(new Date("2026-02-09"));
    this.__backing_provideVar16!.resetOnReuse(new Set<string>(new Array<string>("a", "b", "c")));
    this.__backing_provideVar17!.resetOnReuse([new Per(1), new Per(2)]);
    this.__backing_provideVar18!.resetOnReuse(new Array<Per>(new Per(3), new Per(4)));
    this.__backing_provideVar19!.resetOnReuse(new Map<string, Per>([["1", new Per(1)], ["2", new Per(2)]]));
    this.__backing_provideVar20!.resetOnReuse([true, false, true, true]);
  }
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: Parent)=> void) | undefined), initializers: ((()=> __Options_Parent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Parent, __Options_Parent>(style, ((): Parent => {
      return new Parent(false, ({let gensym___<some_random_number> = storage;
      (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>())}));
    }), initializers, reuseId, content);
  }
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Parent, storage?: LocalStorage, @Builder() content?: (()=> void)): Parent {
    throw new Error("Declare interface");
  }
  private __backing_provideVar1?: IProvideDecoratedVariable<Per>;

  public get provideVar1(): Per {
    return this.__backing_provideVar1!.get();
  }

  public set provideVar1(value: Per) {
    this.__backing_provideVar1!.set(value);
  }

  private __backing_provideVar2?: IProvideDecoratedVariable<Array<number>>;

  public get provideVar2(): Array<number> {
    return this.__backing_provideVar2!.get();
  }

  public set provideVar2(value: Array<number>) {
    this.__backing_provideVar2!.set(value);
  }

  private __backing_provideVar3?: IProvideDecoratedVariable<PropType>;

  public get provideVar3(): PropType {
    return this.__backing_provideVar3!.get();
  }

  public set provideVar3(value: PropType) {
    this.__backing_provideVar3!.set(value);
  }

  private __backing_provideVar4?: IProvideDecoratedVariable<Set<string>>;

  public get provideVar4(): Set<string> {
    return this.__backing_provideVar4!.get();
  }

  public set provideVar4(value: Set<string>) {
    this.__backing_provideVar4!.set(value);
  }

  private __backing_provideVar5?: IProvideDecoratedVariable<Array<boolean>>;

  public get provideVar5(): Array<boolean> {
    return this.__backing_provideVar5!.get();
  }

  public set provideVar5(value: Array<boolean>) {
    this.__backing_provideVar5!.set(value);
  }

  private __backing_provideVar6?: IProvideDecoratedVariable<Array<Per>>;

  public get provideVar6(): Array<Per> {
    return this.__backing_provideVar6!.get();
  }

  public set provideVar6(value: Array<Per>) {
    this.__backing_provideVar6!.set(value);
  }

  private __backing_provideVar7?: IProvideDecoratedVariable<Array<Per>>;

  public get provideVar7(): Array<Per> {
    return this.__backing_provideVar7!.get();
  }

  public set provideVar7(value: Array<Per>) {
    this.__backing_provideVar7!.set(value);
  }

  private __backing_provideVar8?: IProvideDecoratedVariable<((sr: string)=> void)>;

  public get provideVar8(): ((sr: string)=> void) {
    return this.__backing_provideVar8!.get();
  }

  public set provideVar8(value: ((sr: string)=> void)) {
    this.__backing_provideVar8!.set(value);
  }

  private __backing_provideVar9?: IProvideDecoratedVariable<Date>;

  public get provideVar9(): Date {
    return this.__backing_provideVar9!.get();
  }

  public set provideVar9(value: Date) {
    this.__backing_provideVar9!.set(value);
  }

  private __backing_provideVar10?: IProvideDecoratedVariable<Map<number, Per>>;

  public get provideVar10(): Map<number, Per> {
    return this.__backing_provideVar10!.get();
  }

  public set provideVar10(value: Map<number, Per>) {
    this.__backing_provideVar10!.set(value);
  }

  private __backing_provideVar11?: IProvideDecoratedVariable<(string | number)>;

  public get provideVar11(): (string | number) {
    return this.__backing_provideVar11!.get();
  }

  public set provideVar11(value: (string | number)) {
    this.__backing_provideVar11!.set(value);
  }

  private __backing_provideVar12?: IProvideDecoratedVariable<(Set<string> | Per)>;

  public get provideVar12(): (Set<string> | Per) {
    return this.__backing_provideVar12!.get();
  }

  public set provideVar12(value: (Set<string> | Per)) {
    this.__backing_provideVar12!.set(value);
  }

  private __backing_provideVar13?: IProvideDecoratedVariable<(Array<string> | undefined)>;

  public get provideVar13(): (Array<string> | undefined) {
    return this.__backing_provideVar13!.get();
  }

  public set provideVar13(value: (Array<string> | undefined)) {
    this.__backing_provideVar13!.set(value);
  }

  private __backing_provideVar14?: IProvideDecoratedVariable<(Set<string> | Per)>;

  public get provideVar14(): (Set<string> | Per) {
    return this.__backing_provideVar14!.get();
  }

  public set provideVar14(value: (Set<string> | Per)) {
    this.__backing_provideVar14!.set(value);
  }

  private __backing_provideVar15?: IProvideDecoratedVariable<Date>;

  public get provideVar15(): Date {
    return this.__backing_provideVar15!.get();
  }

  public set provideVar15(value: Date) {
    this.__backing_provideVar15!.set(value);
  }

  private __backing_provideVar16?: IProvideDecoratedVariable<(Set<string> | null)>;

  public get provideVar16(): (Set<string> | null) {
    return this.__backing_provideVar16!.get();
  }

  public set provideVar16(value: (Set<string> | null)) {
    this.__backing_provideVar16!.set(value);
  }

  private __backing_provideVar17?: IProvideDecoratedVariable<Array<Per>>;

  public get provideVar17(): Array<Per> {
    return this.__backing_provideVar17!.get();
  }

  public set provideVar17(value: Array<Per>) {
    this.__backing_provideVar17!.set(value);
  }

  private __backing_provideVar18?: IProvideDecoratedVariable<Array<Per>>;

  public get provideVar18(): Array<Per> {
    return this.__backing_provideVar18!.get();
  }

  public set provideVar18(value: Array<Per>) {
    this.__backing_provideVar18!.set(value);
  }

  private __backing_provideVar19?: IProvideDecoratedVariable<Map<string, Per>>;

  public get provideVar19(): Map<string, Per> {
    return this.__backing_provideVar19!.get();
  }

  public set provideVar19(value: Map<string, Per>) {
    this.__backing_provideVar19!.set(value);
  }

  private __backing_provideVar20?: IProvideDecoratedVariable<Array<boolean>>;

  public get provideVar20(): Array<boolean> {
    return this.__backing_provideVar20!.get();
  }

  public set provideVar20(value: Array<boolean>) {
    this.__backing_provideVar20!.set(value);
    }

  @Memo() 
  public build() {}
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  static {
  }
}

@Component() class __Options_Parent {
  @Provide() public provideVar1?: Per;
  public __backing_provideVar1?: IProvideDecoratedVariable<Per>;
  public __options_has_provideVar1?: boolean;
  @Provide() public provideVar2?: Array<number>;
  public __backing_provideVar2?: IProvideDecoratedVariable<Array<number>>;
  public __options_has_provideVar2?: boolean;
  @Provide() public provideVar3?: PropType;
  public __backing_provideVar3?: IProvideDecoratedVariable<PropType>;
  public __options_has_provideVar3?: boolean;
  @Provide() public provideVar4?: Set<string>;
  public __backing_provideVar4?: IProvideDecoratedVariable<Set<string>>;
  public __options_has_provideVar4?: boolean;
  @Provide() public provideVar5?: Array<boolean>;
  public __backing_provideVar5?: IProvideDecoratedVariable<Array<boolean>>;
  public __options_has_provideVar5?: boolean;
  @Provide() public provideVar6?: Array<Per>;
  public __backing_provideVar6?: IProvideDecoratedVariable<Array<Per>>;
  public __options_has_provideVar6?: boolean;
  @Provide() public provideVar7?: Array<Per>;
  public __backing_provideVar7?: IProvideDecoratedVariable<Array<Per>>;
  public __options_has_provideVar7?: boolean;
  @Provide() public provideVar8?: (((sr: string)=> void) | undefined);
  public __backing_provideVar8?: IProvideDecoratedVariable<(((sr: string)=> void) | undefined)>;
  public __options_has_provideVar8?: boolean;
  @Provide() public provideVar9?: Date;
  public __backing_provideVar9?: IProvideDecoratedVariable<Date>;
  public __options_has_provideVar9?: boolean;
  @Provide() public provideVar10?: Map<number, Per>;
  public __backing_provideVar10?: IProvideDecoratedVariable<Map<number, Per>>;
  public __options_has_provideVar10?: boolean;
  @Provide() public provideVar11?: (string | number);
  public __backing_provideVar11?: IProvideDecoratedVariable<(string | number)>;
  public __options_has_provideVar11?: boolean;
  @Provide() public provideVar12?: (Set<string> | Per);
  public __backing_provideVar12?: IProvideDecoratedVariable<(Set<string> | Per)>;
  public __options_has_provideVar12?: boolean;
  @Provide({alias:"a"}) public provideVar13?: (Array<string> | undefined);
  public __backing_provideVar13?: IProvideDecoratedVariable<(Array<string> | undefined)>;
  public __options_has_provideVar13?: boolean;
  @Provide({alias:"b"}) public provideVar14?: (Set<string> | Per);
  public __backing_provideVar14?: IProvideDecoratedVariable<(Set<string> | Per)>;
  public __options_has_provideVar14?: boolean;
  @Provide({allowOverride:true}) public provideVar15?: Date;
  public __backing_provideVar15?: IProvideDecoratedVariable<Date>;
  public __options_has_provideVar15?: boolean;
  @Provide({allowOverride:true}) public provideVar16?: (Set<string> | null);
  public __backing_provideVar16?: IProvideDecoratedVariable<(Set<string> | null)>;
  public __options_has_provideVar16?: boolean;
  @Provide({allowOverride:false}) public provideVar17?: Array<Per>;
  public __backing_provideVar17?: IProvideDecoratedVariable<Array<Per>>;
  public __options_has_provideVar17?: boolean;
  @Provide({allowOverride:false}) public provideVar18?: Array<Per>;
  public __backing_provideVar18?: IProvideDecoratedVariable<Array<Per>>;
  public __options_has_provideVar18?: boolean;
  @Provide({alias:"c",allowOverride:true}) public provideVar19?: Map<string, Per>;
  public __backing_provideVar19?: IProvideDecoratedVariable<Map<string, Per>>;
  public __options_has_provideVar19?: boolean;
  @Provide({alias:"d",allowOverride:false}) public provideVar20?: Array<boolean>;
  public __backing_provideVar20?: IProvideDecoratedVariable<Array<boolean>>;
  public __options_has_provideVar20?: boolean;
  public constructor() {}
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test complex type @Provide decorated variables transformation',
    [parsedTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
