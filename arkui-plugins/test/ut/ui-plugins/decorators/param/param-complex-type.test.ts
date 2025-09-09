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
import { dumpGetterSetter, GetSetDumper } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const STATE_DIR_PATH: string = 'decorators/param';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'param-complex-type.ets'),
];

const pluginTester = new PluginTester('test complex type @Param decorated variables transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedCheckedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.stateManagement.runtime";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IParamDecoratedVariable as IParamDecoratedVariable } from "arkui.stateManagement.decorator";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { ComponentV2 as ComponentV2 } from "@ohos.arkui.component";

import { Param as Param } from "@ohos.arkui.stateManagement";

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
  public __initializeStruct(initializers: (__Options_Parent | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_paramVar1 = STATE_MGMT_FACTORY.makeParam<Per>(this, "paramVar1", ((({let gensym___264789668 = initializers;
    (((gensym___264789668) == (null)) ? undefined : gensym___264789668.paramVar1)})) ?? (new Per(6))));
    this.__backing_paramVar2 = STATE_MGMT_FACTORY.makeParam<Array<number>>(this, "paramVar2", ((({let gensym___171906071 = initializers;
    (((gensym___171906071) == (null)) ? undefined : gensym___171906071.paramVar2)})) ?? (new Array<number>(3, 6, 8))));
    this.__backing_paramVar3 = STATE_MGMT_FACTORY.makeParam<StateType>(this, "paramVar3", ((({let gensym___241535547 = initializers;
    (((gensym___241535547) == (null)) ? undefined : gensym___241535547.paramVar3)})) ?? (StateType.TYPE3)));
    this.__backing_paramVar4 = STATE_MGMT_FACTORY.makeParam<Set<string>>(this, "paramVar4", ((({let gensym___49490075 = initializers;
    (((gensym___49490075) == (null)) ? undefined : gensym___49490075.paramVar4)})) ?? (new Set<string>(new Array<string>("aa", "bb")))));
    this.__backing_paramVar5 = STATE_MGMT_FACTORY.makeParam<Array<boolean>>(this, "paramVar5", ((({let gensym___17164613 = initializers;
    (((gensym___17164613) == (null)) ? undefined : gensym___17164613.paramVar5)})) ?? ([true, false])));
    this.__backing_paramVar6 = STATE_MGMT_FACTORY.makeParam<Array<Per>>(this, "paramVar6", ((({let gensym___84871771 = initializers;
    (((gensym___84871771) == (null)) ? undefined : gensym___84871771.paramVar6)})) ?? (new Array<Per>(new Per(7), new Per(11)))));
    this.__backing_paramVar7 = STATE_MGMT_FACTORY.makeParam<Array<Per>>(this, "paramVar7", ((({let gensym___263986833 = initializers;
    (((gensym___263986833) == (null)) ? undefined : gensym___263986833.paramVar7)})) ?? ([new Per(7), new Per(11)])));
    this.__backing_paramVar8 = STATE_MGMT_FACTORY.makeParam<((sr: string)=> void)>(this, "paramVar8", ((({let gensym___6968121 = initializers;
    (((gensym___6968121) == (null)) ? undefined : gensym___6968121.paramVar8)})) ?? (((sr: string) => {}))));
    this.__backing_paramVar9 = STATE_MGMT_FACTORY.makeParam<Date>(this, "paramVar9", ((({let gensym___63984493 = initializers;
    (((gensym___63984493) == (null)) ? undefined : gensym___63984493.paramVar9)})) ?? (new Date("2025-4-23"))));
    this.__backing_paramVar10 = STATE_MGMT_FACTORY.makeParam<Map<number, Per>>(this, "paramVar10", ((({let gensym___260234648 = initializers;
    (((gensym___260234648) == (null)) ? undefined : gensym___260234648.paramVar10)})) ?? (new Map<number, Per>([[0, new Per(7)], [1, new Per(10)]]))));
    this.__backing_paramVar11 = STATE_MGMT_FACTORY.makeParam<(string | number)>(this, "paramVar11", ((({let gensym___144998584 = initializers;
    (((gensym___144998584) == (null)) ? undefined : gensym___144998584.paramVar11)})) ?? (0.0)));
    this.__backing_paramVar12 = STATE_MGMT_FACTORY.makeParam<(Set<string> | Per)>(this, "paramVar12", ((({let gensym___237878674 = initializers;
    (((gensym___237878674) == (null)) ? undefined : gensym___237878674.paramVar12)})) ?? (new Per(6))));
  }

  public __updateStruct(initializers: (__Options_Parent | undefined)): void {
    if (({let gensym___160055409 = initializers;
    (((gensym___160055409) == (null)) ? undefined : gensym___160055409.__options_has_paramVar1)})) {
      this.__backing_paramVar1!.update((initializers!.paramVar1 as Per));
    }
    if (({let gensym___2437677 = initializers;
    (((gensym___2437677) == (null)) ? undefined : gensym___2437677.__options_has_paramVar2)})) {
      this.__backing_paramVar2!.update((initializers!.paramVar2 as Array<number>));
    }
    if (({let gensym___113817398 = initializers;
    (((gensym___113817398) == (null)) ? undefined : gensym___113817398.__options_has_paramVar3)})) {
      this.__backing_paramVar3!.update((initializers!.paramVar3 as StateType));
    }
    if (({let gensym___69812855 = initializers;
    (((gensym___69812855) == (null)) ? undefined : gensym___69812855.__options_has_paramVar4)})) {
      this.__backing_paramVar4!.update((initializers!.paramVar4 as Set<string>));
    }
    if (({let gensym___184913887 = initializers;
    (((gensym___184913887) == (null)) ? undefined : gensym___184913887.__options_has_paramVar5)})) {
      this.__backing_paramVar5!.update((initializers!.paramVar5 as Array<boolean>));
    }
    if (({let gensym___22345724 = initializers;
    (((gensym___22345724) == (null)) ? undefined : gensym___22345724.__options_has_paramVar6)})) {
      this.__backing_paramVar6!.update((initializers!.paramVar6 as Array<Per>));
    }
    if (({let gensym___35909170 = initializers;
    (((gensym___35909170) == (null)) ? undefined : gensym___35909170.__options_has_paramVar7)})) {
      this.__backing_paramVar7!.update((initializers!.paramVar7 as Array<Per>));
    }
    if (({let gensym___221406315 = initializers;
    (((gensym___221406315) == (null)) ? undefined : gensym___221406315.__options_has_paramVar8)})) {
      this.__backing_paramVar8!.update((initializers!.paramVar8 as ((sr: string)=> void)));
    }
    if (({let gensym___76379892 = initializers;
    (((gensym___76379892) == (null)) ? undefined : gensym___76379892.__options_has_paramVar9)})) {
      this.__backing_paramVar9!.update((initializers!.paramVar9 as Date));
    }
    if (({let gensym___223285288 = initializers;
    (((gensym___223285288) == (null)) ? undefined : gensym___223285288.__options_has_paramVar10)})) {
      this.__backing_paramVar10!.update((initializers!.paramVar10 as Map<number, Per>));
    }
    if (({let gensym___34579549 = initializers;
    (((gensym___34579549) == (null)) ? undefined : gensym___34579549.__options_has_paramVar11)})) {
      this.__backing_paramVar11!.update((initializers!.paramVar11 as (string | number)));
    }
    if (({let gensym___181593007 = initializers;
    (((gensym___181593007) == (null)) ? undefined : gensym___181593007.__options_has_paramVar12)})) {
      this.__backing_paramVar12!.update((initializers!.paramVar12 as (Set<string> | Per)));
    }
  }

  private __backing_paramVar1?: IParamDecoratedVariable<Per>;

  public get paramVar1(): Per {
    return this.__backing_paramVar1!.get();
  }

  private __backing_paramVar2?: IParamDecoratedVariable<Array<number>>;

  public get paramVar2(): Array<number> {
    return this.__backing_paramVar2!.get();
  }

  private __backing_paramVar3?: IParamDecoratedVariable<StateType>;

  public get paramVar3(): StateType {
    return this.__backing_paramVar3!.get();
  }

  private __backing_paramVar4?: IParamDecoratedVariable<Set<string>>;

  public get paramVar4(): Set<string> {
    return this.__backing_paramVar4!.get();
  }

  private __backing_paramVar5?: IParamDecoratedVariable<Array<boolean>>;

  public get paramVar5(): Array<boolean> {
    return this.__backing_paramVar5!.get();
  }

  private __backing_paramVar6?: IParamDecoratedVariable<Array<Per>>;

  public get paramVar6(): Array<Per> {
    return this.__backing_paramVar6!.get();
  }

  private __backing_paramVar7?: IParamDecoratedVariable<Array<Per>>;

  public get paramVar7(): Array<Per> {
    return this.__backing_paramVar7!.get();
  }

  private __backing_paramVar8?: IParamDecoratedVariable<((sr: string)=> void)>;

  public get paramVar8(): ((sr: string)=> void) {
    return this.__backing_paramVar8!.get();
  }

  private __backing_paramVar9?: IParamDecoratedVariable<Date>;

  public get paramVar9(): Date {
    return this.__backing_paramVar9!.get();
  }

  private __backing_paramVar10?: IParamDecoratedVariable<Map<number, Per>>;

  public get paramVar10(): Map<number, Per> {
    return this.__backing_paramVar10!.get();
  }

  private __backing_paramVar11?: IParamDecoratedVariable<(string | number)>;

  public get paramVar11(): (string | number) {
    return this.__backing_paramVar11!.get();
  }

  private __backing_paramVar12?: IParamDecoratedVariable<(Set<string> | Per)>;

  public get paramVar12(): (Set<string> | Per) {
    return this.__backing_paramVar12!.get();
  }

  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: Parent)=> void), initializers: ((()=> __Options_Parent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<Parent, __Options_Parent>(style, ((): Parent => {
      return new Parent();
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Parent, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): Parent {
    throw new Error("Declare interface");
  }

  @memo() public build() {}

  public constructor() {}

}

@ComponentV2() export interface __Options_Parent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'paramVar1', '(Per | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_paramVar1', '(IParamDecoratedVariable<Per> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_paramVar1', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'paramVar2', '(Array<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_paramVar2', '(IParamDecoratedVariable<Array<number>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_paramVar2', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'paramVar3', '(StateType | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_paramVar3', '(IParamDecoratedVariable<StateType> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_paramVar3', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'paramVar4', '(Set<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_paramVar4', '(IParamDecoratedVariable<Set<string>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_paramVar4', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'paramVar5', '(Array<boolean> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_paramVar5', '(IParamDecoratedVariable<Array<boolean>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_paramVar5', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'paramVar6', '(Array<Per> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_paramVar6', '(IParamDecoratedVariable<Array<Per>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_paramVar6', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'paramVar7', '(Array<Per> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_paramVar7', '(IParamDecoratedVariable<Array<Per>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_paramVar7', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'paramVar8', '(((sr: string)=> void) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_paramVar8', '(IParamDecoratedVariable<((sr: string)=> void)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_paramVar8', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'paramVar9', '(Date | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_paramVar9', '(IParamDecoratedVariable<Date> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_paramVar9', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'paramVar10', '(Map<number, Per> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_paramVar10', '(IParamDecoratedVariable<Map<number, Per>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_paramVar10', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'paramVar11', '((string | number) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_paramVar11', '(IParamDecoratedVariable<(string | number)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_paramVar11', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'paramVar12', '((Set<string> | Per) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_paramVar12', '(IParamDecoratedVariable<(Set<string> | Per)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_paramVar12', '(boolean | undefined)')}
  
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test complex type @Param decorated variables transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
