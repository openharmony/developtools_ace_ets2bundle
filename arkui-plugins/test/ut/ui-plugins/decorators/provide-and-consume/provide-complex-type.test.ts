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
import { structNoRecheck, recheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
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

import { memo as memo } from "arkui.stateManagement.runtime";

import { IProvideDecoratedVariable as IProvideDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

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
  
  public constructor(ordinal: int, value: int) {
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
    for (let i = 0;((i) < (PropType.#NamesArray.length));(++i)) {
      if (((name) == (PropType.#NamesArray[i]))) {
        return PropType.#ItemsArray[i];
      }
    }
    throw new Error((("No enum constant PropType.") + (name)));
  }
  
  public static fromValue(value: int): PropType {
    for (let i = 0;((i) < (PropType.#ValuesArray.length));(++i)) {
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

@Component({freezeWhenInactive:false}) final struct Parent extends CustomComponent<Parent, __Options_Parent> {
  public __initializeStruct(initializers: __Options_Parent | undefined, @memo() content: (()=> void) | undefined): void {
    this.__backing_provideVar1 = STATE_MGMT_FACTORY.makeProvide<Per>(this, "provideVar1", "provideVar1", ((({let gensym___181030638 = initializers;
    (((gensym___181030638) == (null)) ? undefined : gensym___181030638.provideVar1)})) ?? (new Per(6))), false);
    this.__backing_provideVar2 = STATE_MGMT_FACTORY.makeProvide<Array<number>>(this, "provideVar2", "provideVar2", ((({let gensym___143944235 = initializers;
    (((gensym___143944235) == (null)) ? undefined : gensym___143944235.provideVar2)})) ?? (new Array<number>(3, 6, 8))), false);
    this.__backing_provideVar3 = STATE_MGMT_FACTORY.makeProvide<PropType>(this, "provideVar3", "provideVar3", ((({let gensym___262195977 = initializers;
    (((gensym___262195977) == (null)) ? undefined : gensym___262195977.provideVar3)})) ?? (PropType.TYPE3)), false);
    this.__backing_provideVar4 = STATE_MGMT_FACTORY.makeProvide<Set<string>>(this, "provideVar4", "provideVar4", ((({let gensym___85711435 = initializers;
    (((gensym___85711435) == (null)) ? undefined : gensym___85711435.provideVar4)})) ?? (new Set<string>(new Array<string>("aa", "bb")))), false);
    this.__backing_provideVar5 = STATE_MGMT_FACTORY.makeProvide<Array<boolean>>(this, "provideVar5", "provideVar5", ((({let gensym___139253630 = initializers;
    (((gensym___139253630) == (null)) ? undefined : gensym___139253630.provideVar5)})) ?? ([true, false])), false);
    this.__backing_provideVar6 = STATE_MGMT_FACTORY.makeProvide<Array<Per>>(this, "provideVar6", "provideVar6", ((({let gensym___146872112 = initializers;
    (((gensym___146872112) == (null)) ? undefined : gensym___146872112.provideVar6)})) ?? (new Array<Per>(new Per(7), new Per(11)))), false);
    this.__backing_provideVar7 = STATE_MGMT_FACTORY.makeProvide<Array<Per>>(this, "provideVar7", "provideVar7", ((({let gensym___174412117 = initializers;
    (((gensym___174412117) == (null)) ? undefined : gensym___174412117.provideVar7)})) ?? ([new Per(7), new Per(11)])), false);
    this.__backing_provideVar8 = STATE_MGMT_FACTORY.makeProvide<((sr: string)=> void)>(this, "provideVar8", "provideVar8", ((({let gensym___253467853 = initializers;
    (((gensym___253467853) == (null)) ? undefined : gensym___253467853.provideVar8)})) ?? (((sr: string) => {}))), false);
    this.__backing_provideVar9 = STATE_MGMT_FACTORY.makeProvide<Date>(this, "provideVar9", "provideVar9", ((({let gensym___179115605 = initializers;
    (((gensym___179115605) == (null)) ? undefined : gensym___179115605.provideVar9)})) ?? (new Date("2025-4-23"))), false);
    this.__backing_provideVar10 = STATE_MGMT_FACTORY.makeProvide<Map<number, Per>>(this, "provideVar10", "provideVar10", ((({let gensym___209671248 = initializers;
    (((gensym___209671248) == (null)) ? undefined : gensym___209671248.provideVar10)})) ?? (new Map<number, Per>([[0, new Per(7)], [1, new Per(10)]]))), false);
    this.__backing_provideVar11 = STATE_MGMT_FACTORY.makeProvide<string | number>(this, "provideVar11", "provideVar11", ((({let gensym___150211849 = initializers;
    (((gensym___150211849) == (null)) ? undefined : gensym___150211849.provideVar11)})) ?? (0.0)), false);
    this.__backing_provideVar12 = STATE_MGMT_FACTORY.makeProvide<Set<string> | Per>(this, "provideVar12", "provideVar12", ((({let gensym___256025818 = initializers;
    (((gensym___256025818) == (null)) ? undefined : gensym___256025818.provideVar12)})) ?? (new Per(6))), false);
  }
  
  public __updateStruct(initializers: __Options_Parent | undefined): void {}
  
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
  
  private __backing_provideVar11?: IProvideDecoratedVariable<string | number>;
  
  public get provideVar11(): string | number {
    return this.__backing_provideVar11!.get();
  }
  
  public set provideVar11(value: string | number) {
    this.__backing_provideVar11!.set(value);
  }
  
  private __backing_provideVar12?: IProvideDecoratedVariable<Set<string> | Per>;
  
  public get provideVar12(): Set<string> | Per {
    return this.__backing_provideVar12!.get();
  }
  
  public set provideVar12(value: Set<string> | Per) {
    this.__backing_provideVar12!.set(value);
  }
  
  @memo() public _build(@memo() style: ((instance: Parent)=> Parent) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_Parent | undefined): void {}
  
  private constructor() {}
  
}

@Component({freezeWhenInactive:false}) export interface __Options_Parent {
  set provideVar1(provideVar1: Per | undefined)
  
  get provideVar1(): Per | undefined
  set __backing_provideVar1(__backing_provideVar1: IProvideDecoratedVariable<Per> | undefined)
  
  get __backing_provideVar1(): IProvideDecoratedVariable<Per> | undefined
  set provideVar2(provideVar2: Array<number> | undefined)
  
  get provideVar2(): Array<number> | undefined
  set __backing_provideVar2(__backing_provideVar2: IProvideDecoratedVariable<Array<number>> | undefined)
  
  get __backing_provideVar2(): IProvideDecoratedVariable<Array<number>> | undefined
  set provideVar3(provideVar3: PropType | undefined)
  
  get provideVar3(): PropType | undefined
  set __backing_provideVar3(__backing_provideVar3: IProvideDecoratedVariable<PropType> | undefined)
  
  get __backing_provideVar3(): IProvideDecoratedVariable<PropType> | undefined
  set provideVar4(provideVar4: Set<string> | undefined)
  
  get provideVar4(): Set<string> | undefined
  set __backing_provideVar4(__backing_provideVar4: IProvideDecoratedVariable<Set<string>> | undefined)
  
  get __backing_provideVar4(): IProvideDecoratedVariable<Set<string>> | undefined
  set provideVar5(provideVar5: Array<boolean> | undefined)
  
  get provideVar5(): Array<boolean> | undefined
  set __backing_provideVar5(__backing_provideVar5: IProvideDecoratedVariable<Array<boolean>> | undefined)
  
  get __backing_provideVar5(): IProvideDecoratedVariable<Array<boolean>> | undefined
  set provideVar6(provideVar6: Array<Per> | undefined)
  
  get provideVar6(): Array<Per> | undefined
  set __backing_provideVar6(__backing_provideVar6: IProvideDecoratedVariable<Array<Per>> | undefined)
  
  get __backing_provideVar6(): IProvideDecoratedVariable<Array<Per>> | undefined
  set provideVar7(provideVar7: Array<Per> | undefined)
  
  get provideVar7(): Array<Per> | undefined
  set __backing_provideVar7(__backing_provideVar7: IProvideDecoratedVariable<Array<Per>> | undefined)
  
  get __backing_provideVar7(): IProvideDecoratedVariable<Array<Per>> | undefined
  set provideVar8(provideVar8: ((sr: string)=> void) | undefined)
  
  get provideVar8(): ((sr: string)=> void) | undefined
  set __backing_provideVar8(__backing_provideVar8: IProvideDecoratedVariable<((sr: string)=> void)> | undefined)
  
  get __backing_provideVar8(): IProvideDecoratedVariable<((sr: string)=> void)> | undefined
  set provideVar9(provideVar9: Date | undefined)
  
  get provideVar9(): Date | undefined
  set __backing_provideVar9(__backing_provideVar9: IProvideDecoratedVariable<Date> | undefined)
  
  get __backing_provideVar9(): IProvideDecoratedVariable<Date> | undefined
  set provideVar10(provideVar10: Map<number, Per> | undefined)
  
  get provideVar10(): Map<number, Per> | undefined
  set __backing_provideVar10(__backing_provideVar10: IProvideDecoratedVariable<Map<number, Per>> | undefined)
  
  get __backing_provideVar10(): IProvideDecoratedVariable<Map<number, Per>> | undefined
  set provideVar11(provideVar11: string | number | undefined)
  
  get provideVar11(): string | number | undefined
  set __backing_provideVar11(__backing_provideVar11: IProvideDecoratedVariable<string | number> | undefined)
  
  get __backing_provideVar11(): IProvideDecoratedVariable<string | number> | undefined
  set provideVar12(provideVar12: Set<string> | Per | undefined)
  
  get provideVar12(): Set<string> | Per | undefined
  set __backing_provideVar12(__backing_provideVar12: IProvideDecoratedVariable<Set<string> | Per> | undefined)
  
  get __backing_provideVar12(): IProvideDecoratedVariable<Set<string> | Per> | undefined
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test complex type @Provide decorated variables transformation',
    [parsedTransform, structNoRecheck, recheck],
    {
        'checked:struct-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
