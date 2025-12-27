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
import { dumpGetterSetter, GetSetDumper } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const STATE_DIR_PATH: string = 'decorators/local';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'local-complex-type.ets'),
];

const pluginTester = new PluginTester('test complex type @Local decorated variables transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { ComponentV2 as ComponentV2 } from "@ohos.arkui.component";

import { Local as Local } from "@ohos.arkui.stateManagement";

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
    this.__backing_localVar1 = STATE_MGMT_FACTORY.makeLocal<Per>(this, "localVar1", new Per(6));
    this.__backing_localVar2 = STATE_MGMT_FACTORY.makeLocal<Array<number>>(this, "localVar2", new Array<number>(3, 6, 8));
    this.__backing_localVar3 = STATE_MGMT_FACTORY.makeLocal<StateType>(this, "localVar3", StateType.TYPE3);
    this.__backing_localVar4 = STATE_MGMT_FACTORY.makeLocal<Set<string>>(this, "localVar4", new Set<string>(new Array<string>("aa", "bb")));
    this.__backing_localVar5 = STATE_MGMT_FACTORY.makeLocal<Array<boolean>>(this, "localVar5", [true, false]);
    this.__backing_localVar6 = STATE_MGMT_FACTORY.makeLocal<Array<Per>>(this, "localVar6", new Array<Per>(new Per(7), new Per(11)));
    this.__backing_localVar7 = STATE_MGMT_FACTORY.makeLocal<Array<Per>>(this, "localVar7", [new Per(7), new Per(11)]);
    this.__backing_localVar9 = STATE_MGMT_FACTORY.makeLocal<Date>(this, "localVar9", new Date("2025-4-23"));
    this.__backing_localVar10 = STATE_MGMT_FACTORY.makeLocal<Map<number, Per>>(this, "localVar10", new Map<number, Per>([[0, new Per(7)], [1, new Per(10)]]));
    this.__backing_localVar11 = STATE_MGMT_FACTORY.makeLocal<(string | number)>(this, "localVar11", 0.0);
    this.__backing_localVar12 = STATE_MGMT_FACTORY.makeLocal<(Set<string> | Per)>(this, "localVar12", new Per(6));
  }

  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}

  public resetStateVarsOnReuse(initializers: (__Options_Parent | undefined)): void {
    this.__backing_localVar1!.resetOnReuse(new Per(6));
    this.__backing_localVar2!.resetOnReuse(new Array<number>(3, 6, 8));
    this.__backing_localVar3!.resetOnReuse(StateType.TYPE3);
    this.__backing_localVar4!.resetOnReuse(new Set<string>(new Array<string>("aa", "bb")));
    this.__backing_localVar5!.resetOnReuse([true, false]);
    this.__backing_localVar6!.resetOnReuse(new Array<Per>(new Per(7), new Per(11)));
    this.__backing_localVar7!.resetOnReuse([new Per(7), new Per(11)]);
    this.__backing_localVar9!.resetOnReuse(new Date("2025-4-23"));
    this.__backing_localVar10!.resetOnReuse(new Map<number, Per>([[0, new Per(7)], [1, new Per(10)]]));
    this.__backing_localVar11!.resetOnReuse(0.0);
    this.__backing_localVar12!.resetOnReuse(new Per(6));
  }

  private __backing_localVar1?: ILocalDecoratedVariable<Per>;

  public get localVar1(): Per {
    return this.__backing_localVar1!.get();
  }

  public set localVar1(value: Per) {
    this.__backing_localVar1!.set(value);
  }

  private __backing_localVar2?: ILocalDecoratedVariable<Array<number>>;

  public get localVar2(): Array<number> {
    return this.__backing_localVar2!.get();
  }

  public set localVar2(value: Array<number>) {
    this.__backing_localVar2!.set(value);
  }

  private __backing_localVar3?: ILocalDecoratedVariable<StateType>;

  public get localVar3(): StateType {
    return this.__backing_localVar3!.get();
  }

  public set localVar3(value: StateType) {
    this.__backing_localVar3!.set(value);
  }

  private __backing_localVar4?: ILocalDecoratedVariable<Set<string>>;

  public get localVar4(): Set<string> {
    return this.__backing_localVar4!.get();
  }

  public set localVar4(value: Set<string>) {
    this.__backing_localVar4!.set(value);
  }

  private __backing_localVar5?: ILocalDecoratedVariable<Array<boolean>>;

  public get localVar5(): Array<boolean> {
    return this.__backing_localVar5!.get();
  }

  public set localVar5(value: Array<boolean>) {
    this.__backing_localVar5!.set(value);
  }

  private __backing_localVar6?: ILocalDecoratedVariable<Array<Per>>;

  public get localVar6(): Array<Per> {
    return this.__backing_localVar6!.get();
  }

  public set localVar6(value: Array<Per>) {
    this.__backing_localVar6!.set(value);
  }

  private __backing_localVar7?: ILocalDecoratedVariable<Array<Per>>;

  public get localVar7(): Array<Per> {
    return this.__backing_localVar7!.get();
  }

  public set localVar7(value: Array<Per>) {
    this.__backing_localVar7!.set(value);
  }

  private __backing_localVar9?: ILocalDecoratedVariable<Date>;

  public get localVar9(): Date {
    return this.__backing_localVar9!.get();
  }

  public set localVar9(value: Date) {
    this.__backing_localVar9!.set(value);
  }

  private __backing_localVar10?: ILocalDecoratedVariable<Map<number, Per>>;

  public get localVar10(): Map<number, Per> {
    return this.__backing_localVar10!.get();
  }

  public set localVar10(value: Map<number, Per>) {
    this.__backing_localVar10!.set(value);
  }

  private __backing_localVar11?: ILocalDecoratedVariable<(string | number)>;

  public get localVar11(): (string | number) {
    return this.__backing_localVar11!.get();
  }

  public set localVar11(value: (string | number)) {
    this.__backing_localVar11!.set(value);
  }

  private __backing_localVar12?: ILocalDecoratedVariable<(Set<string> | Per)>;

  public get localVar12(): (Set<string> | Per) {
    return this.__backing_localVar12!.get();
  }

  public set localVar12(value: (Set<string> | Per)) {
    this.__backing_localVar12!.set(value);
  }

  @MemoIntrinsic() 
  public static _invoke(style: @Memo() ((instance: Parent)=> void), initializers: ((()=> __Options_Parent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<Parent, __Options_Parent>(style, ((): Parent => {
      return new Parent();
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Parent, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): Parent {
    throw new Error("Declare interface");
  }

  @Memo() 
  public build() {}

  public constructor() {}

}

@ComponentV2() export interface __Options_Parent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'localVar1', '(Per | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_localVar1', '(ILocalDecoratedVariable<Per> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_localVar1', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'localVar2', '(Array<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_localVar2', '(ILocalDecoratedVariable<Array<number>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_localVar2', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'localVar3', '(StateType | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_localVar3', '(ILocalDecoratedVariable<StateType> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_localVar3', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'localVar4', '(Set<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_localVar4', '(ILocalDecoratedVariable<Set<string>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_localVar4', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'localVar5', '(Array<boolean> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_localVar5', '(ILocalDecoratedVariable<Array<boolean>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_localVar5', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'localVar6', '(Array<Per> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_localVar6', '(ILocalDecoratedVariable<Array<Per>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_localVar6', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'localVar7', '(Array<Per> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_localVar7', '(ILocalDecoratedVariable<Array<Per>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_localVar7', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'localVar9', '(Date | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_localVar9', '(ILocalDecoratedVariable<Date> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_localVar9', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'localVar10', '(Map<number, Per> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_localVar10', '(ILocalDecoratedVariable<Map<number, Per>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_localVar10', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'localVar11', '((string | number) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_localVar11', '(ILocalDecoratedVariable<(string | number)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_localVar11', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'localVar12', '((Set<string> | Per) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_localVar12', '(ILocalDecoratedVariable<(Set<string> | Per)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_localVar12', '(boolean | undefined)')}
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test complex type @Local decorated variables transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
