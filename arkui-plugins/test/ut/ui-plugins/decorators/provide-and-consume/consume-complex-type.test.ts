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
import { dumpGetterSetter, GetSetDumper, ignoreNewLines, dumpConstructor } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const STATE_DIR_PATH: string = 'decorators/provide-and-consume';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'consume-complex-type.ets'),
];

const pluginTester = new PluginTester('test complex type @Consume decorated variables transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedParsedScript: string = `
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component } from "@ohos.arkui.component";

import { Consume as Consume } from "@ohos.arkui.stateManagement";

class Per {
  public num: number;

  public constructor(num: number) {
    this.num = num;
  }

}

enum PropType {
  TYPE1 = 0,
  TYPE2 = 1,
  TYPE3 = 3
}

@Component() final struct Parent extends CustomComponent<Parent, __Options_Parent> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Parent, storage?: LocalStorage, @Builder() content?: (()=> void)): Parent {
    throw new Error("Declare interface");
  }

  @Consume() public conVar1!: Per;

  @Consume() public conVar2!: Array<number>;

  @Consume() public conVar3!: PropType;

  @Consume() public conVar4!: Set<string>;

  @Consume() public conVar5!: boolean[];

  @Consume() public conVar6!: Array<Per>;

  @Consume() public conVar7!: Per[];

  @Consume() public conVar8!: ((sr: string)=> void);

  @Consume() public conVar9!: Date;

  @Consume() public conVar10!: Map<number, Per>;

  @Consume() public conVar11!: (string | number);

  @Consume() public conVar12!: (Set<string> | Per);

  @Consume() public conVar13?: (Set<string> | null);

  @Consume({value:"a"}) public conVar14?: (Array<number> | undefined) = new Array<number>(1, 2, 3);

  @Consume({value:"b"}) public conVar15!: Set<string> = new Set<string>(new Array<string>("a", "b", "c"));

  @Consume({value:"c"}) public conVar16?: (Per[] | null | undefined) = [new Per(1), new Per(2), new Per(3)];

  @Consume({value:"d"}) public conVar17?: (Date | null) = new Date("2026-02-09");

  @Consume({value:"e"}) public conVar18?: (Map<string, Per> | null | undefined) = new Map<string, Per>([["1", new Per(1)], ["2", new Per(2)]]);

  @Consume({value:"f"}) public conVar19?: (Set<string> | Per | null) = new Per(10);

  @Consume({value:"g"}) public conVar20?: (boolean[] | undefined) = [true, false];

  public build() {}

  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }

}

@Component() export interface __Options_Parent {
  ${ignoreNewLines(`
  conVar1?: Per;
  @Consume() __backing_conVar1?: Per;
  __options_has_conVar1?: boolean;
  conVar2?: Array<number>;
  @Consume() __backing_conVar2?: Array<number>;
  __options_has_conVar2?: boolean;
  conVar3?: PropType;
  @Consume() __backing_conVar3?: PropType;
  __options_has_conVar3?: boolean;
  conVar4?: Set<string>;
  @Consume() __backing_conVar4?: Set<string>;
  __options_has_conVar4?: boolean;
  conVar5?: boolean[];
  @Consume() __backing_conVar5?: boolean[];
  __options_has_conVar5?: boolean;
  conVar6?: Array<Per>;
  @Consume() __backing_conVar6?: Array<Per>;
  __options_has_conVar6?: boolean;
  conVar7?: Per[];
  @Consume() __backing_conVar7?: Per[];
  __options_has_conVar7?: boolean;
  conVar8?: ((sr: string)=> void);
  @Consume() __backing_conVar8?: ((sr: string)=> void);
  __options_has_conVar8?: boolean;
  conVar9?: Date;
  @Consume() __backing_conVar9?: Date;
  __options_has_conVar9?: boolean;
  conVar10?: Map<number, Per>;
  @Consume() __backing_conVar10?: Map<number, Per>;
  __options_has_conVar10?: boolean;
  conVar11?: (string | number);
  @Consume() __backing_conVar11?: (string | number);
  __options_has_conVar11?: boolean;
  conVar12?: (Set<string> | Per);
  @Consume() __backing_conVar12?: (Set<string> | Per);
  __options_has_conVar12?: boolean;
  conVar13?: (Set<string> | null);
  @Consume() __backing_conVar13?: (Set<string> | null);
  __options_has_conVar13?: boolean;
  conVar14?: (Array<number> | undefined);
  @Consume({value:"a"}) __backing_conVar14?: (Array<number> | undefined);
  __options_has_conVar14?: boolean;
  conVar15?: Set<string>;
  @Consume({value:"b"}) __backing_conVar15?: Set<string>;
  __options_has_conVar15?: boolean;
  conVar16?: (Per[] | null | undefined);
  @Consume({value:"c"}) __backing_conVar16?: (Per[] | null | undefined);
  __options_has_conVar16?: boolean;
  conVar17?: (Date | null);
  @Consume({value:"d"}) __backing_conVar17?: (Date | null);
  __options_has_conVar17?: boolean;
  conVar18?: (Map<string, Per> | null | undefined);
  @Consume({value:"e"}) __backing_conVar18?: (Map<string, Per> | null | undefined);
  __options_has_conVar18?: boolean;
  conVar19?: (Set<string> | Per | null);
  @Consume({value:"f"}) __backing_conVar19?: (Set<string> | Per | null);
  __options_has_conVar19?: boolean;
  conVar20?: (boolean[] | undefined);
  @Consume({value:"g"}) __backing_conVar20?: (boolean[] | undefined);
  __options_has_conVar20?: boolean;
  `)}
  
}
`;

const expectedCheckedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { IConsumeDecoratedVariable as IConsumeDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component } from "@ohos.arkui.component";

import { Consume as Consume } from "@ohos.arkui.stateManagement";

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
    this.__backing_conVar1 = STATE_MGMT_FACTORY.makeConsume<Per>(this, "conVar1", "conVar1");
    this.__backing_conVar2 = STATE_MGMT_FACTORY.makeConsume<Array<number>>(this, "conVar2", "conVar2");
    this.__backing_conVar3 = STATE_MGMT_FACTORY.makeConsume<PropType>(this, "conVar3", "conVar3");
    this.__backing_conVar4 = STATE_MGMT_FACTORY.makeConsume<Set<string>>(this, "conVar4", "conVar4");
    this.__backing_conVar5 = STATE_MGMT_FACTORY.makeConsume<Array<boolean>>(this, "conVar5", "conVar5");
    this.__backing_conVar6 = STATE_MGMT_FACTORY.makeConsume<Array<Per>>(this, "conVar6", "conVar6");
    this.__backing_conVar7 = STATE_MGMT_FACTORY.makeConsume<Array<Per>>(this, "conVar7", "conVar7");
    this.__backing_conVar8 = STATE_MGMT_FACTORY.makeConsume<((sr: string)=> void)>(this, "conVar8", "conVar8");
    this.__backing_conVar9 = STATE_MGMT_FACTORY.makeConsume<Date>(this, "conVar9", "conVar9");
    this.__backing_conVar10 = STATE_MGMT_FACTORY.makeConsume<Map<number, Per>>(this, "conVar10", "conVar10");
    this.__backing_conVar11 = STATE_MGMT_FACTORY.makeConsume<(string | number)>(this, "conVar11", "conVar11");
    this.__backing_conVar12 = STATE_MGMT_FACTORY.makeConsume<(Set<string> | Per)>(this, "conVar12", "conVar12");
    this.__backing_conVar13 = STATE_MGMT_FACTORY.makeConsume<(Set<string> | null)>(this, "conVar13", "conVar13");
    this.__backing_conVar14 = STATE_MGMT_FACTORY.makeConsume<(Array<number> | undefined)>(this, "conVar14", "a", undefined, {
      defaultValue: new Array<number>(1, 2, 3),
      });
    this.__backing_conVar15 = STATE_MGMT_FACTORY.makeConsume<Set<string>>(this, "conVar15", "b", undefined, {
      defaultValue: new Set<string>(new Array<string>("a", "b", "c")),
      });
    this.__backing_conVar16 = STATE_MGMT_FACTORY.makeConsume<(Array<Per> | null | undefined)>(this, "conVar16", "c", undefined, {
      defaultValue: [new Per(1), new Per(2), new Per(3)],
      });
    this.__backing_conVar17 = STATE_MGMT_FACTORY.makeConsume<(Date | null)>(this, "conVar17", "d", undefined, {
      defaultValue: new Date("2026-02-09"),
      });
    this.__backing_conVar18 = STATE_MGMT_FACTORY.makeConsume<(Map<string, Per> | null | undefined)>(this, "conVar18", "e", undefined, {
      defaultValue: new Map<string, Per>([["1", new Per(1)], ["2", new Per(2)]]),
      });
    this.__backing_conVar19 = STATE_MGMT_FACTORY.makeConsume<(Set<string> | Per | null)>(this, "conVar19", "f", undefined, {
      defaultValue: new Per(10),
      });
    this.__backing_conVar20 = STATE_MGMT_FACTORY.makeConsume<(Array<boolean> | undefined)>(this, "conVar20", "g", undefined, {
      defaultValue: [true, false],
      });
  }

  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}

  private __backing_conVar1?: IConsumeDecoratedVariable<Per>;

  public get conVar1(): Per {
    return this.__backing_conVar1!.get();
  }

  public set conVar1(value: Per) {
    this.__backing_conVar1!.set(value);
  }

  private __backing_conVar2?: IConsumeDecoratedVariable<Array<number>>;

  public get conVar2(): Array<number> {
    return this.__backing_conVar2!.get();
  }

  public set conVar2(value: Array<number>) {
    this.__backing_conVar2!.set(value);
  }

  private __backing_conVar3?: IConsumeDecoratedVariable<PropType>;

  public get conVar3(): PropType {
    return this.__backing_conVar3!.get();
  }

  public set conVar3(value: PropType) {
    this.__backing_conVar3!.set(value);
  }

  private __backing_conVar4?: IConsumeDecoratedVariable<Set<string>>;

  public get conVar4(): Set<string> {
    return this.__backing_conVar4!.get();
  }

  public set conVar4(value: Set<string>) {
    this.__backing_conVar4!.set(value);
  }

  private __backing_conVar5?: IConsumeDecoratedVariable<Array<boolean>>;

  public get conVar5(): Array<boolean> {
    return this.__backing_conVar5!.get();
  }

  public set conVar5(value: Array<boolean>) {
    this.__backing_conVar5!.set(value);
  }

  private __backing_conVar6?: IConsumeDecoratedVariable<Array<Per>>;

  public get conVar6(): Array<Per> {
    return this.__backing_conVar6!.get();
  }

  public set conVar6(value: Array<Per>) {
    this.__backing_conVar6!.set(value);
  }

  private __backing_conVar7?: IConsumeDecoratedVariable<Array<Per>>;

  public get conVar7(): Array<Per> {
    return this.__backing_conVar7!.get();
  }

  public set conVar7(value: Array<Per>) {
    this.__backing_conVar7!.set(value);
  }

  private __backing_conVar8?: IConsumeDecoratedVariable<((sr: string)=> void)>;

  public get conVar8(): ((sr: string)=> void) {
    return this.__backing_conVar8!.get();
  }

  public set conVar8(value: ((sr: string)=> void)) {
    this.__backing_conVar8!.set(value);
  }

  private __backing_conVar9?: IConsumeDecoratedVariable<Date>;

  public get conVar9(): Date {
    return this.__backing_conVar9!.get();
  }

  public set conVar9(value: Date) {
    this.__backing_conVar9!.set(value);
  }

  private __backing_conVar10?: IConsumeDecoratedVariable<Map<number, Per>>;

  public get conVar10(): Map<number, Per> {
    return this.__backing_conVar10!.get();
  }

  public set conVar10(value: Map<number, Per>) {
    this.__backing_conVar10!.set(value);
  }

  private __backing_conVar11?: IConsumeDecoratedVariable<(string | number)>;

  public get conVar11(): (string | number) {
    return this.__backing_conVar11!.get();
  }

  public set conVar11(value: (string | number)) {
    this.__backing_conVar11!.set(value);
  }

  private __backing_conVar12?: IConsumeDecoratedVariable<(Set<string> | Per)>;

  public get conVar12(): (Set<string> | Per) {
    return this.__backing_conVar12!.get();
  }

  public set conVar12(value: (Set<string> | Per)) {
    this.__backing_conVar12!.set(value);
  }

  private __backing_conVar13?: IConsumeDecoratedVariable<(Set<string> | null)>;

  public get conVar13(): (Set<string> | null) {
    return this.__backing_conVar13!.get();
  }

  public set conVar13(value: (Set<string> | null)) {
    this.__backing_conVar13!.set(value);
  }

  private __backing_conVar14?: IConsumeDecoratedVariable<(Array<number> | undefined)>;
  public get conVar14(): (Array<number> | undefined) {
    return this.__backing_conVar14!.get();
  }
  public set conVar14(value: (Array<number> | undefined)) {
    this.__backing_conVar14!.set(value);
  }
  private __backing_conVar15?: IConsumeDecoratedVariable<Set<string>>;
  public get conVar15(): Set<string> {
    return this.__backing_conVar15!.get();
  }
  public set conVar15(value: Set<string>) {
    this.__backing_conVar15!.set(value);
  }
  private __backing_conVar16?: IConsumeDecoratedVariable<(Array<Per> | null | undefined)>;
  public get conVar16(): (Array<Per> | null | undefined) {
    return this.__backing_conVar16!.get();
  }
  public set conVar16(value: (Array<Per> | null | undefined)) {
    this.__backing_conVar16!.set(value);
  }
  private __backing_conVar17?: IConsumeDecoratedVariable<(Date | null)>;
  public get conVar17(): (Date | null) {
    return this.__backing_conVar17!.get();
  }
  public set conVar17(value: (Date | null)) {
    this.__backing_conVar17!.set(value);
  }
  private __backing_conVar18?: IConsumeDecoratedVariable<(Map<string, Per> | null | undefined)>;
  public get conVar18(): (Map<string, Per> | null | undefined) {
    return this.__backing_conVar18!.get();
  }
  public set conVar18(value: (Map<string, Per> | null | undefined)) {
    this.__backing_conVar18!.set(value);
  }
  private __backing_conVar19?: IConsumeDecoratedVariable<(Set<string> | Per | null)>;
  public get conVar19(): (Set<string> | Per | null) {
    return this.__backing_conVar19!.get();
  }
  public set conVar19(value: (Set<string> | Per | null)) {
    this.__backing_conVar19!.set(value);
  }
  private __backing_conVar20?: IConsumeDecoratedVariable<(Array<boolean> | undefined)>;
  public get conVar20(): (Array<boolean> | undefined) {
    return this.__backing_conVar20!.get();
  }
  public set conVar20(value: (Array<boolean> | undefined)) {
    this.__backing_conVar20!.set(value);
  }

  @MemoIntrinsic() 
  public static _invoke(style: @Memo() ((instance: Parent)=> void), initializers: ((()=> __Options_Parent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Parent, __Options_Parent>(style, ((): Parent => {
      return new Parent(false, ({let gensym___203542966 = storage;
      (((gensym___203542966) == (null)) ? undefined : gensym___203542966())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Parent, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): Parent {
    throw new Error("Declare interface");
  }

  @Memo() 
  public build() {}

  ${dumpConstructor()}

}

@Component() export interface __Options_Parent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar1', '(Per | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar1', '(IConsumeDecoratedVariable<Per> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar1', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar2', '(Array<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar2', '(IConsumeDecoratedVariable<Array<number>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar2', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar3', '(PropType | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar3', '(IConsumeDecoratedVariable<PropType> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar3', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar4', '(Set<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar4', '(IConsumeDecoratedVariable<Set<string>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar4', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar5', '(Array<boolean> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar5', '(IConsumeDecoratedVariable<Array<boolean>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar5', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar6', '(Array<Per> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar6', '(IConsumeDecoratedVariable<Array<Per>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar6', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar7', '(Array<Per> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar7', '(IConsumeDecoratedVariable<Array<Per>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar7', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar8', '(((sr: string)=> void) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar8', '(IConsumeDecoratedVariable<((sr: string)=> void)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar8', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar9', '(Date | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar9', '(IConsumeDecoratedVariable<Date> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar9', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar10', '(Map<number, Per> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar10', '(IConsumeDecoratedVariable<Map<number, Per>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar10', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar11', '((string | number) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar11', '(IConsumeDecoratedVariable<(string | number)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar11', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar12', '((Set<string> | Per) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar12', '(IConsumeDecoratedVariable<(Set<string> | Per)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar12', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar13', '((Set<string> | null) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar13', '(IConsumeDecoratedVariable<(Set<string> | null)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar13', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar14', '((Array<number> | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar14', '(IConsumeDecoratedVariable<(Array<number> | undefined)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar14', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar15', '(Set<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar15', '(IConsumeDecoratedVariable<Set<string>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar15', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar16', '((Array<Per> | null | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar16', '(IConsumeDecoratedVariable<(Array<Per> | null | undefined)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar16', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar17', '((Date | null) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar17', '(IConsumeDecoratedVariable<(Date | null)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar17', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar18', '((Map<string, Per> | null | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar18', '(IConsumeDecoratedVariable<(Map<string, Per> | null | undefined)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar18', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar19', '((Set<string> | Per | null) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar19', '(IConsumeDecoratedVariable<(Set<string> | Per | null)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar19', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'conVar20', '((Array<boolean> | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_conVar20', '(IConsumeDecoratedVariable<(Array<boolean> | undefined)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_conVar20', '(boolean | undefined)')}
  
}
`;

function testParsedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedParsedScript));
}

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test complex type @Consume decorated variables transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'parsed': [testParsedTransformer],
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
