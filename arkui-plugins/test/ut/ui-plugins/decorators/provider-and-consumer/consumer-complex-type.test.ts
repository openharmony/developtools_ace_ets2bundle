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

const STATE_DIR_PATH: string = 'decorators/provider-and-consumer';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'consumer-complex-type.ets'),
];

const pluginTester = new PluginTester('test complex type @Consumer decorated variables transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedCheckedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { IConsumerDecoratedVariable as IConsumerDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { ComponentV2 as ComponentV2 } from "@ohos.arkui.component";

import { Consumer as Consumer } from "@ohos.arkui.stateManagement";

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
    this.__backing_paramVar1 = STATE_MGMT_FACTORY.makeConsumer<Per>(this, "paramVar1", "paramVar1", new Per(6));
    this.__backing_paramVar2 = STATE_MGMT_FACTORY.makeConsumer<Array<number>>(this, "paramVar2", "paramVar2", new Array<number>(3, 6, 8));
    this.__backing_paramVar3 = STATE_MGMT_FACTORY.makeConsumer<StateType>(this, "paramVar3", "paramVar3", StateType.TYPE3);
    this.__backing_paramVar4 = STATE_MGMT_FACTORY.makeConsumer<Set<string>>(this, "paramVar4", "paramVar4", new Set<string>(new Array<string>("aa", "bb")));
    this.__backing_paramVar5 = STATE_MGMT_FACTORY.makeConsumer<Array<boolean>>(this, "paramVar5", "paramVar5", [true, false]);
    this.__backing_paramVar6 = STATE_MGMT_FACTORY.makeConsumer<Array<Per>>(this, "paramVar6", "paramVar6", new Array<Per>(new Per(7), new Per(11)));
    this.__backing_paramVar7 = STATE_MGMT_FACTORY.makeConsumer<Array<Per>>(this, "paramVar7", "paramVar7", [new Per(7), new Per(11)]);
    this.__backing_paramVar9 = STATE_MGMT_FACTORY.makeConsumer<Date>(this, "paramVar9", "paramVar9", new Date("2025-4-23"));
    this.__backing_paramVar10 = STATE_MGMT_FACTORY.makeConsumer<Map<number, Per>>(this, "paramVar10", "paramVar10", new Map<number, Per>([[0, new Per(7)], [1, new Per(10)]]));
    this.__backing_paramVar11 = STATE_MGMT_FACTORY.makeConsumer<(string | number)>(this, "paramVar11", "paramVar11", 0.0);
    this.__backing_paramVar12 = STATE_MGMT_FACTORY.makeConsumer<(Set<string> | Per)>(this, "paramVar12", "paramVar12", new Per(6));
  }

  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}

  public resetStateVarsOnReuse(initializers: (__Options_Parent | undefined)): void {
    this.__backing_paramVar1!.resetOnReuse(new Per(6));
    this.__backing_paramVar2!.resetOnReuse(new Array<number>(3, 6, 8));
    this.__backing_paramVar3!.resetOnReuse(StateType.TYPE3);
    this.__backing_paramVar4!.resetOnReuse(new Set<string>(new Array<string>("aa", "bb")));
    this.__backing_paramVar5!.resetOnReuse([true, false]);
    this.__backing_paramVar6!.resetOnReuse(new Array<Per>(new Per(7), new Per(11)));
    this.__backing_paramVar7!.resetOnReuse([new Per(7), new Per(11)]);
    this.__backing_paramVar9!.resetOnReuse(new Date("2025-4-23"));
    this.__backing_paramVar10!.resetOnReuse(new Map<number, Per>([[0, new Per(7)], [1, new Per(10)]]));
    this.__backing_paramVar11!.resetOnReuse(0.0);
    this.__backing_paramVar12!.resetOnReuse(new Per(6));
  }

  private __backing_paramVar1?: IConsumerDecoratedVariable<Per>;

  public get paramVar1(): Per {
    return this.__backing_paramVar1!.get();
  }

  public set paramVar1(value: Per) {
    this.__backing_paramVar1!.set(value);
  }

  private __backing_paramVar2?: IConsumerDecoratedVariable<Array<number>>;

  public get paramVar2(): Array<number> {
    return this.__backing_paramVar2!.get();
  }

  public set paramVar2(value: Array<number>) {
    this.__backing_paramVar2!.set(value);
  }

  private __backing_paramVar3?: IConsumerDecoratedVariable<StateType>;

  public get paramVar3(): StateType {
    return this.__backing_paramVar3!.get();
  }

  public set paramVar3(value: StateType) {
    this.__backing_paramVar3!.set(value);
  }

  private __backing_paramVar4?: IConsumerDecoratedVariable<Set<string>>;

  public get paramVar4(): Set<string> {
    return this.__backing_paramVar4!.get();
  }

  public set paramVar4(value: Set<string>) {
    this.__backing_paramVar4!.set(value);
  }

  private __backing_paramVar5?: IConsumerDecoratedVariable<Array<boolean>>;

  public get paramVar5(): Array<boolean> {
    return this.__backing_paramVar5!.get();
  }

  public set paramVar5(value: Array<boolean>) {
    this.__backing_paramVar5!.set(value);
  }

  private __backing_paramVar6?: IConsumerDecoratedVariable<Array<Per>>;

  public get paramVar6(): Array<Per> {
    return this.__backing_paramVar6!.get();
  }

  public set paramVar6(value: Array<Per>) {
    this.__backing_paramVar6!.set(value);
  }

  private __backing_paramVar7?: IConsumerDecoratedVariable<Array<Per>>;

  public get paramVar7(): Array<Per> {
    return this.__backing_paramVar7!.get();
  }

  public set paramVar7(value: Array<Per>) {
    this.__backing_paramVar7!.set(value);
  }

  private __backing_paramVar9?: IConsumerDecoratedVariable<Date>;

  public get paramVar9(): Date {
    return this.__backing_paramVar9!.get();
  }

  public set paramVar9(value: Date) {
    this.__backing_paramVar9!.set(value);
  }

  private __backing_paramVar10?: IConsumerDecoratedVariable<Map<number, Per>>;

  public get paramVar10(): Map<number, Per> {
    return this.__backing_paramVar10!.get();
  }

  public set paramVar10(value: Map<number, Per>) {
    this.__backing_paramVar10!.set(value);
  }

  private __backing_paramVar11?: IConsumerDecoratedVariable<(string | number)>;

  public get paramVar11(): (string | number) {
    return this.__backing_paramVar11!.get();
  }

  public set paramVar11(value: (string | number)) {
    this.__backing_paramVar11!.set(value);
  }

  private __backing_paramVar12?: IConsumerDecoratedVariable<(Set<string> | Per)>;

  public get paramVar12(): (Set<string> | Per) {
    return this.__backing_paramVar12!.get();
  }

  public set paramVar12(value: (Set<string> | Per)) {
    this.__backing_paramVar12!.set(value);
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
  ${dumpGetterSetter(GetSetDumper.BOTH, 'paramVar1', '(Per | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_paramVar1', '(IConsumerDecoratedVariable<Per> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_paramVar1', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'paramVar2', '(Array<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_paramVar2', '(IConsumerDecoratedVariable<Array<number>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_paramVar2', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'paramVar3', '(StateType | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_paramVar3', '(IConsumerDecoratedVariable<StateType> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_paramVar3', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'paramVar4', '(Set<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_paramVar4', '(IConsumerDecoratedVariable<Set<string>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_paramVar4', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'paramVar5', '(Array<boolean> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_paramVar5', '(IConsumerDecoratedVariable<Array<boolean>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_paramVar5', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'paramVar6', '(Array<Per> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_paramVar6', '(IConsumerDecoratedVariable<Array<Per>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_paramVar6', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'paramVar7', '(Array<Per> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_paramVar7', '(IConsumerDecoratedVariable<Array<Per>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_paramVar7', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'paramVar9', '(Date | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_paramVar9', '(IConsumerDecoratedVariable<Date> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_paramVar9', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'paramVar10', '(Map<number, Per> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_paramVar10', '(IConsumerDecoratedVariable<Map<number, Per>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_paramVar10', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'paramVar11', '((string | number) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_paramVar11', '(IConsumerDecoratedVariable<(string | number)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_paramVar11', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'paramVar12', '((Set<string> | Per) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_paramVar12', '(IConsumerDecoratedVariable<(Set<string> | Per)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_paramVar12', '(boolean | undefined)')}
  
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test complex type @Consumer decorated variables transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
