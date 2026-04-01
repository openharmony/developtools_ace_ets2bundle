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

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

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

  private constructor(ordinal: int, value: int, name: String) {
    super(value, name);
    this.#ordinal = ordinal;
  }

  public static readonly TYPE1: StateType = new StateType(0, 0, "TYPE1");

  public static readonly TYPE2: StateType = new StateType(1, 1, "TYPE2");

  public static readonly TYPE3: StateType = new StateType(2, 3, "TYPE3");

  private static readonly #ItemsArray: StateType[] = [StateType.TYPE1, StateType.TYPE2, StateType.TYPE3];

  public static getValueOf(name: String): StateType {
    for (let i = ((StateType.#ItemsArray.length) - (1));((i) >= (0));(--i)) {
      if (((name) == (StateType.#ItemsArray[i].getName()))) {
        return StateType.#ItemsArray[i];
      }
    }
    throw new Error((("No enum constant StateType.") + (name)));
  }

  public static fromValue(value: int): StateType {
    for (let i = ((StateType.#ItemsArray.length) - (1));((i) >= (0));(--i)) {
      if (((StateType.#ItemsArray[i].valueOf()) == (value))) {
        return StateType.#ItemsArray[i];
      }
    }
    throw new Error((("No enum StateType with value ") + (value)));
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
  public __initializeStruct(initializers: (__Options_Parent | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_stateVar1 = STATE_MGMT_FACTORY.makeState<Per>(this, "stateVar1", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.stateVar1)})) ?? (new Per(6))));
    this.__backing_stateVar2 = STATE_MGMT_FACTORY.makeState<Array<number>>(this, "stateVar2", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.stateVar2)})) ?? (new Array<number>(3, 6, 8))));
    this.__backing_stateVar3 = STATE_MGMT_FACTORY.makeState<StateType>(this, "stateVar3", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.stateVar3)})) ?? (StateType.TYPE3)));
    this.__backing_stateVar4 = STATE_MGMT_FACTORY.makeState<Set<string>>(this, "stateVar4", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.stateVar4)})) ?? (new Set<string>(new Array<string>("aa", "bb")))));
    this.__backing_stateVar5 = STATE_MGMT_FACTORY.makeState<Array<boolean>>(this, "stateVar5", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.stateVar5)})) ?? ([true, false])));
    this.__backing_stateVar6 = STATE_MGMT_FACTORY.makeState<Array<Per>>(this, "stateVar6", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.stateVar6)})) ?? (new Array<Per>(new Per(7), new Per(11)))));
    this.__backing_stateVar7 = STATE_MGMT_FACTORY.makeState<Array<Per>>(this, "stateVar7", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.stateVar7)})) ?? ([new Per(7), new Per(11)])));
    this.__backing_stateVar8 = STATE_MGMT_FACTORY.makeState<((sr: string)=> void)>(this, "stateVar8", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.stateVar8)})) ?? (((sr: string) => {}))));
    this.__backing_stateVar9 = STATE_MGMT_FACTORY.makeState<Date>(this, "stateVar9", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.stateVar9)})) ?? (new Date("2025-4-23"))));
    this.__backing_stateVar10 = STATE_MGMT_FACTORY.makeState<Map<number, Per>>(this, "stateVar10", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.stateVar10)})) ?? (new Map<number, Per>([[0, new Per(7)], [1, new Per(10)]]))));
    this.__backing_stateVar11 = STATE_MGMT_FACTORY.makeState<(string | number)>(this, "stateVar11", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.stateVar11)})) ?? (0.0)));
    this.__backing_stateVar12 = STATE_MGMT_FACTORY.makeState<(Set<string> | Per)>(this, "stateVar12", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.stateVar12)})) ?? (new Per(6))));
  }

  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}

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

  @Memo() 
  public build() {}

  ${dumpConstructor()}

  static {
  }
}

@Component() export interface __Options_Parent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'stateVar1', '(Per | undefined)', [dumpAnnotation('State')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_stateVar1', '(IStateDecoratedVariable<Per> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_stateVar1', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'stateVar2', '(Array<number> | undefined)', [dumpAnnotation('State')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_stateVar2', '(IStateDecoratedVariable<Array<number>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_stateVar2', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'stateVar3', '(StateType | undefined)', [dumpAnnotation('State')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_stateVar3', '(IStateDecoratedVariable<StateType> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_stateVar3', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'stateVar4', '(Set<string> | undefined)', [dumpAnnotation('State')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_stateVar4', '(IStateDecoratedVariable<Set<string>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_stateVar4', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'stateVar5', '(Array<boolean> | undefined)', [dumpAnnotation('State')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_stateVar5', '(IStateDecoratedVariable<Array<boolean>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_stateVar5', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'stateVar6', '(Array<Per> | undefined)', [dumpAnnotation('State')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_stateVar6', '(IStateDecoratedVariable<Array<Per>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_stateVar6', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'stateVar7', '(Array<Per> | undefined)', [dumpAnnotation('State')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_stateVar7', '(IStateDecoratedVariable<Array<Per>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_stateVar7', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'stateVar8', '(((sr: string)=> void) | undefined)', [dumpAnnotation('State')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_stateVar8', '(IStateDecoratedVariable<((sr: string)=> void)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_stateVar8', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'stateVar9', '(Date | undefined)', [dumpAnnotation('State')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_stateVar9', '(IStateDecoratedVariable<Date> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_stateVar9', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'stateVar10', '(Map<number, Per> | undefined)', [dumpAnnotation('State')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_stateVar10', '(IStateDecoratedVariable<Map<number, Per>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_stateVar10', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'stateVar11', '((string | number) | undefined)', [dumpAnnotation('State')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_stateVar11', '(IStateDecoratedVariable<(string | number)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_stateVar11', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'stateVar12', '((Set<string> | Per) | undefined)', [dumpAnnotation('State')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_stateVar12', '(IStateDecoratedVariable<(Set<string> | Per)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_stateVar12', '(boolean | undefined)')}
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test complex type @State decorated variables transformation',
    [parsedTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
