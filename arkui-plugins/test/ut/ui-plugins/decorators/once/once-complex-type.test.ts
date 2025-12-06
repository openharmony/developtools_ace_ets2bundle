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

@ComponentV2() final struct Parent extends CustomComponentV2<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_onceVar1 = STATE_MGMT_FACTORY.makeParamOnce<Per>(this, "onceVar1", ((({let gensym___126233468 = initializers;
    (((gensym___126233468) == (null)) ? undefined : gensym___126233468.onceVar1)})) ?? (new Per(6))));
    this.__backing_onceVar2 = STATE_MGMT_FACTORY.makeParamOnce<Array<number>>(this, "onceVar2", ((({let gensym___261494487 = initializers;
    (((gensym___261494487) == (null)) ? undefined : gensym___261494487.onceVar2)})) ?? (new Array<number>(3, 6, 8))));
    this.__backing_onceVar3 = STATE_MGMT_FACTORY.makeParamOnce<StateType>(this, "onceVar3", ((({let gensym___200918371 = initializers;
    (((gensym___200918371) == (null)) ? undefined : gensym___200918371.onceVar3)})) ?? (StateType.TYPE3)));
    this.__backing_onceVar4 = STATE_MGMT_FACTORY.makeParamOnce<Set<string>>(this, "onceVar4", ((({let gensym___220514418 = initializers;
    (((gensym___220514418) == (null)) ? undefined : gensym___220514418.onceVar4)})) ?? (new Set<string>(new Array<string>("aa", "bb")))));
    this.__backing_onceVar5 = STATE_MGMT_FACTORY.makeParamOnce<Array<boolean>>(this, "onceVar5", ((({let gensym___107034111 = initializers;
    (((gensym___107034111) == (null)) ? undefined : gensym___107034111.onceVar5)})) ?? ([true, false])));
    this.__backing_onceVar6 = STATE_MGMT_FACTORY.makeParamOnce<Array<Per>>(this, "onceVar6", ((({let gensym___174577499 = initializers;
    (((gensym___174577499) == (null)) ? undefined : gensym___174577499.onceVar6)})) ?? (new Array<Per>(new Per(7), new Per(11)))));
    this.__backing_onceVar7 = STATE_MGMT_FACTORY.makeParamOnce<Array<Per>>(this, "onceVar7", ((({let gensym___222282406 = initializers;
    (((gensym___222282406) == (null)) ? undefined : gensym___222282406.onceVar7)})) ?? ([new Per(7), new Per(11)])));
    this.__backing_onceVar8 = STATE_MGMT_FACTORY.makeParamOnce<((sr: string)=> void)>(this, "onceVar8", ((({let gensym___227003443 = initializers;
    (((gensym___227003443) == (null)) ? undefined : gensym___227003443.onceVar8)})) ?? (((sr: string) => {}))));
    this.__backing_onceVar9 = STATE_MGMT_FACTORY.makeParamOnce<Date>(this, "onceVar9", ((({let gensym___102086008 = initializers;
    (((gensym___102086008) == (null)) ? undefined : gensym___102086008.onceVar9)})) ?? (new Date("2025-4-23"))));
    this.__backing_onceVar10 = STATE_MGMT_FACTORY.makeParamOnce<Map<number, Per>>(this, "onceVar10", ((({let gensym___97859136 = initializers;
    (((gensym___97859136) == (null)) ? undefined : gensym___97859136.onceVar10)})) ?? (new Map<number, Per>([[0, new Per(7)], [1, new Per(10)]]))));
    this.__backing_onceVar11 = STATE_MGMT_FACTORY.makeParamOnce<(string | number)>(this, "onceVar11", ((({let gensym___90350745 = initializers;
    (((gensym___90350745) == (null)) ? undefined : gensym___90350745.onceVar11)})) ?? (0.0)));
    this.__backing_onceVar12 = STATE_MGMT_FACTORY.makeParamOnce<(Set<string> | Per)>(this, "onceVar12", ((({let gensym___96372310 = initializers;
    (((gensym___96372310) == (null)) ? undefined : gensym___96372310.onceVar12)})) ?? (new Per(6))));
  }

  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}

  public resetStateVarsOnReuse(initializers: (__Options_Parent | undefined)): void {
    this.__backing_onceVar1!.resetOnReuse(((({let gensym___18536475 = initializers;
    (((gensym___18536475) == (null)) ? undefined : gensym___18536475.onceVar1)})) ?? (new Per(6))));
    this.__backing_onceVar2!.resetOnReuse(((({let gensym___20853412 = initializers;
    (((gensym___20853412) == (null)) ? undefined : gensym___20853412.onceVar2)})) ?? (new Array<number>(3, 6, 8))));
    this.__backing_onceVar3!.resetOnReuse(((({let gensym___14745221 = initializers;
    (((gensym___14745221) == (null)) ? undefined : gensym___14745221.onceVar3)})) ?? (StateType.TYPE3)));
    this.__backing_onceVar4!.resetOnReuse(((({let gensym___35521402 = initializers;
    (((gensym___35521402) == (null)) ? undefined : gensym___35521402.onceVar4)})) ?? (new Set<string>(new Array<string>("aa", "bb")))));
    this.__backing_onceVar5!.resetOnReuse(((({let gensym___114369541 = initializers;
    (((gensym___114369541) == (null)) ? undefined : gensym___114369541.onceVar5)})) ?? ([true, false])));
    this.__backing_onceVar6!.resetOnReuse(((({let gensym___29511023 = initializers;
    (((gensym___29511023) == (null)) ? undefined : gensym___29511023.onceVar6)})) ?? (new Array<Per>(new Per(7), new Per(11)))));
    this.__backing_onceVar7!.resetOnReuse(((({let gensym___18569471 = initializers;
    (((gensym___18569471) == (null)) ? undefined : gensym___18569471.onceVar7)})) ?? ([new Per(7), new Per(11)])));
    this.__backing_onceVar8!.resetOnReuse(((({let gensym___18221701 = initializers;
    (((gensym___18221701) == (null)) ? undefined : gensym___18221701.onceVar8)})) ?? (((sr: string) => {}))));
    this.__backing_onceVar9!.resetOnReuse(((({let gensym___18025610 = initializers;
    (((gensym___18025610) == (null)) ? undefined : gensym___18025610.onceVar9)})) ?? (new Date("2025-4-23"))));
    this.__backing_onceVar10!.resetOnReuse(((({let gensym___11791339 = initializers;
    (((gensym___11791339) == (null)) ? undefined : gensym___11791339.onceVar10)})) ?? (new Map<number, Per>([[0, new Per(7)], [1, new Per(10)]]))));
    this.__backing_onceVar11!.resetOnReuse(((({let gensym___34218856 = initializers;
    (((gensym___34218856) == (null)) ? undefined : gensym___34218856.onceVar11)})) ?? (0.0)));
    this.__backing_onceVar12!.resetOnReuse(((({let gensym___134562011 = initializers;
    (((gensym___134562011) == (null)) ? undefined : gensym___134562011.onceVar12)})) ?? (new Per(6))));
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

  @MemoIntrinsic() public static _invoke(style: @Memo() ((instance: Parent)=> void), initializers: ((()=> __Options_Parent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<Parent, __Options_Parent>(style, ((): Parent => {
      return new Parent();
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Parent, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): Parent {
    throw new Error("Declare interface");
  }

  @Memo() public build() {}

  public constructor() {}

}

@ComponentV2() export interface __Options_Parent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'onceVar1', '(Per | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_onceVar1', '(IParamOnceDecoratedVariable<Per> | undefined)', [dumpAnnotation('Param')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_onceVar1', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'onceVar2', '(Array<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_onceVar2', '(IParamOnceDecoratedVariable<Array<number>> | undefined)', [dumpAnnotation('Param')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_onceVar2', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'onceVar3', '(StateType | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_onceVar3', '(IParamOnceDecoratedVariable<StateType> | undefined)', [dumpAnnotation('Param')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_onceVar3', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'onceVar4', '(Set<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_onceVar4', '(IParamOnceDecoratedVariable<Set<string>> | undefined)', [dumpAnnotation('Param')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_onceVar4', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'onceVar5', '(Array<boolean> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_onceVar5', '(IParamOnceDecoratedVariable<Array<boolean>> | undefined)', [dumpAnnotation('Param')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_onceVar5', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'onceVar6', '(Array<Per> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_onceVar6', '(IParamOnceDecoratedVariable<Array<Per>> | undefined)', [dumpAnnotation('Param')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_onceVar6', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'onceVar7', '(Array<Per> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_onceVar7', '(IParamOnceDecoratedVariable<Array<Per>> | undefined)', [dumpAnnotation('Param')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_onceVar7', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'onceVar8', '(((sr: string)=> void) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_onceVar8', '(IParamOnceDecoratedVariable<((sr: string)=> void)> | undefined)', [dumpAnnotation('Param')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_onceVar8', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'onceVar9', '(Date | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_onceVar9', '(IParamOnceDecoratedVariable<Date> | undefined)', [dumpAnnotation('Param')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_onceVar9', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'onceVar10', '(Map<number, Per> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_onceVar10', '(IParamOnceDecoratedVariable<Map<number, Per>> | undefined)', [dumpAnnotation('Param')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_onceVar10', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'onceVar11', '((string | number) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_onceVar11', '(IParamOnceDecoratedVariable<(string | number)> | undefined)', [dumpAnnotation('Param')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_onceVar11', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'onceVar12', '((Set<string> | Per) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_onceVar12', '(IParamOnceDecoratedVariable<(Set<string> | Per)> | undefined)', [dumpAnnotation('Param')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_onceVar12', '(boolean | undefined)')}
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test complex type @Once decorated variables transformation',
    [observedTrackTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
