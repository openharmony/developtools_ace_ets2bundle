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
import { PluginTestContext, PluginTester } from '../../../../utils/plugin-tester';
import { BuildConfig, mockBuildConfig } from '../../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../../utils/path-config';
import { parseDumpSrc } from '../../../../utils/parse-string';
import { structNoRecheck } from '../../../../utils/plugins';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/link';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'link-complex-type.ets'),
];

const pluginTester = new PluginTester('test complex type @Link decorated variables transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'link-complex-type',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { __memo_id_type as __memo_id_type } from "arkui.stateManagement.runtime";
import { __memo_context_type as __memo_context_type } from "arkui.stateManagement.runtime";
import { memo as memo } from "arkui.stateManagement.runtime";
import { DecoratedV1VariableBase as DecoratedV1VariableBase } from "@ohos.arkui.stateManagement";
import { LinkDecoratedVariable as LinkDecoratedVariable } from "@ohos.arkui.stateManagement";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Component as Component } from "@ohos.arkui.component";
import { Link as Link } from "@ohos.arkui.stateManagement";

function main() {}

class Per {
  public num: number;
  public constructor(num: number) {
    this.num = num;
  }
}

final class LinkType extends BaseEnum<int> {
  private readonly #ordinal: int;
  private static <cctor>() {}
  public constructor(ordinal: int, value: int) {
    super(value);
    this.#ordinal = ordinal;
  }
  public static readonly TYPE1: LinkType = new LinkType(0, 0);
  public static readonly TYPE2: LinkType = new LinkType(1, 1);
  public static readonly TYPE3: LinkType = new LinkType(2, 3);
  private static readonly #NamesArray: String[] = ["TYPE1", "TYPE2", "TYPE3"];
  private static readonly #ValuesArray: int[] = [0, 1, 3];
  private static readonly #StringValuesArray: String[] = ["0", "1", "3"];
  private static readonly #ItemsArray: LinkType[] = [LinkType.TYPE1, LinkType.TYPE2, LinkType.TYPE3];
  public getName(): String {
    return LinkType.#NamesArray[this.#ordinal];
  }
  public static getValueOf(name: String): LinkType {
    for (let i = 0;((i) < (LinkType.#NamesArray.length));(++i)) {
      if (((name) == (LinkType.#NamesArray[i]))) {
        return LinkType.#ItemsArray[i];
      }
    }
    throw new Error((("No enum constant LinkType.") + (name)));
  }
  
  public static fromValue(value: int): LinkType {
    for (let i = 0;((i) < (LinkType.#ValuesArray.length));(++i)) {
      if (((value) == (LinkType.#ValuesArray[i]))) {
        return LinkType.#ItemsArray[i];
      }
    }
    throw new Error((("No enum LinkType with value ") + (value)));
  }
  public valueOf(): int {
    return LinkType.#ValuesArray[this.#ordinal];
  }
  public toString(): String {
    return LinkType.#StringValuesArray[this.#ordinal];
  }
  public static values(): LinkType[] {
    return LinkType.#ItemsArray;
  }
  public getOrdinal(): int {
    return this.#ordinal;
  }
  public static $_get(e: LinkType): String {
    return e.getName();
  }
}

@Component({freezeWhenInactive:false}) final class Parent extends CustomComponent<Parent, __Options_Parent> {
  public __initializeStruct(initializers: __Options_Parent | undefined, @memo() content: (()=> void) | undefined): void {
    if (({let gensym___11910109 = initializers;
    (((gensym___11910109) == (null)) ? undefined : gensym___11910109.__backing_linkVar1)})) {
      this.__backing_linkVar1 = new LinkDecoratedVariable<Per>("linkVar1", initializers!.__backing_linkVar1!);
    };
    if (({let gensym___181684045 = initializers;
    (((gensym___181684045) == (null)) ? undefined : gensym___181684045.__backing_linkVar2)})) {
      this.__backing_linkVar2 = new LinkDecoratedVariable<Array<number>>("linkVar2", initializers!.__backing_linkVar2!);
    };
    if (({let gensym___24446313 = initializers;
    (((gensym___24446313) == (null)) ? undefined : gensym___24446313.__backing_linkVar3)})) {
      this.__backing_linkVar3 = new LinkDecoratedVariable<LinkType>("linkVar3", initializers!.__backing_linkVar3!);
    };
    if (({let gensym___167989826 = initializers;
    (((gensym___167989826) == (null)) ? undefined : gensym___167989826.__backing_linkVar4)})) {
      this.__backing_linkVar4 = new LinkDecoratedVariable<Set<string>>("linkVar4", initializers!.__backing_linkVar4!);
    };
    if (({let gensym___157566097 = initializers;
    (((gensym___157566097) == (null)) ? undefined : gensym___157566097.__backing_linkVar5)})) {
      this.__backing_linkVar5 = new LinkDecoratedVariable<Array<boolean>>("linkVar5", initializers!.__backing_linkVar5!);
    };
    if (({let gensym___60105491 = initializers;
    (((gensym___60105491) == (null)) ? undefined : gensym___60105491.__backing_linkVar6)})) {
      this.__backing_linkVar6 = new LinkDecoratedVariable<Array<Per>>("linkVar6", initializers!.__backing_linkVar6!);
    };
    if (({let gensym___3429048 = initializers;
    (((gensym___3429048) == (null)) ? undefined : gensym___3429048.__backing_linkVar7)})) {
      this.__backing_linkVar7 = new LinkDecoratedVariable<Array<Per>>("linkVar7", initializers!.__backing_linkVar7!);
    };
    if (({let gensym___139916435 = initializers;
    (((gensym___139916435) == (null)) ? undefined : gensym___139916435.__backing_linkVar8)})) {
      this.__backing_linkVar8 = new LinkDecoratedVariable<((sr: string)=> void)>("linkVar8", initializers!.__backing_linkVar8!);
    };
    if (({let gensym___145003260 = initializers;
    (((gensym___145003260) == (null)) ? undefined : gensym___145003260.__backing_linkVar9)})) {
      this.__backing_linkVar9 = new LinkDecoratedVariable<Date>("linkVar9", initializers!.__backing_linkVar9!);
    };
    if (({let gensym___122643185 = initializers;
    (((gensym___122643185) == (null)) ? undefined : gensym___122643185.__backing_linkVar10)})) {
      this.__backing_linkVar10 = new LinkDecoratedVariable<Map<number, Per>>("linkVar10", initializers!.__backing_linkVar10!);
    };
    if (({let gensym___222468503 = initializers;
    (((gensym___222468503) == (null)) ? undefined : gensym___222468503.__backing_linkVar11)})) {
      this.__backing_linkVar11 = new LinkDecoratedVariable<string | number>("linkVar11", initializers!.__backing_linkVar11!);
    };
    if (({let gensym___243301539 = initializers;
    (((gensym___243301539) == (null)) ? undefined : gensym___243301539.__backing_linkVar12)})) {
      this.__backing_linkVar12 = new LinkDecoratedVariable<Set<string> | Per>("linkVar12", initializers!.__backing_linkVar12!);
    };
  }
  public __updateStruct(initializers: __Options_Parent | undefined): void {}
  private __backing_linkVar1?: LinkDecoratedVariable<Per>;
  public get linkVar1(): Per {
    return this.__backing_linkVar1!.get();
  }
  public set linkVar1(value: Per) {
    this.__backing_linkVar1!.set(value);
  }
  private __backing_linkVar2?: LinkDecoratedVariable<Array<number>>;
  public get linkVar2(): Array<number> {
    return this.__backing_linkVar2!.get();
  }
  public set linkVar2(value: Array<number>) {
    this.__backing_linkVar2!.set(value);
  }
  private __backing_linkVar3?: LinkDecoratedVariable<LinkType>;
  public get linkVar3(): LinkType {
    return this.__backing_linkVar3!.get();
  }
  public set linkVar3(value: LinkType) {
    this.__backing_linkVar3!.set(value);
  }
  private __backing_linkVar4?: LinkDecoratedVariable<Set<string>>;
  public get linkVar4(): Set<string> {
    return this.__backing_linkVar4!.get();
  }
  public set linkVar4(value: Set<string>) {
    this.__backing_linkVar4!.set(value);
  }
  private __backing_linkVar5?: LinkDecoratedVariable<Array<boolean>>;
  public get linkVar5(): Array<boolean> {
    return this.__backing_linkVar5!.get();
  }
  public set linkVar5(value: Array<boolean>) {
    this.__backing_linkVar5!.set(value);
  }
  private __backing_linkVar6?: LinkDecoratedVariable<Array<Per>>;
  public get linkVar6(): Array<Per> {
    return this.__backing_linkVar6!.get();
  }
  public set linkVar6(value: Array<Per>) {
    this.__backing_linkVar6!.set(value);
  }
  private __backing_linkVar7?: LinkDecoratedVariable<Array<Per>>;
  public get linkVar7(): Array<Per> {
    return this.__backing_linkVar7!.get();
  }
  public set linkVar7(value: Array<Per>) {
    this.__backing_linkVar7!.set(value);
  }
  private __backing_linkVar8?: LinkDecoratedVariable<((sr: string)=> void)>;
  public get linkVar8(): ((sr: string)=> void) {
    return this.__backing_linkVar8!.get();
  }
  public set linkVar8(value: ((sr: string)=> void)) {
    this.__backing_linkVar8!.set(value);
  }
  private __backing_linkVar9?: LinkDecoratedVariable<Date>;
  public get linkVar9(): Date {
    return this.__backing_linkVar9!.get();
  }
  public set linkVar9(value: Date) {
    this.__backing_linkVar9!.set(value);
  }
  private __backing_linkVar10?: LinkDecoratedVariable<Map<number, Per>>;
  public get linkVar10(): Map<number, Per> {
    return this.__backing_linkVar10!.get();
  }
  public set linkVar10(value: Map<number, Per>) {
    this.__backing_linkVar10!.set(value);
  }
  private __backing_linkVar11?: LinkDecoratedVariable<string | number>;
  public get linkVar11(): string | number {
    return this.__backing_linkVar11!.get();
  }
  public set linkVar11(value: string | number) {
    this.__backing_linkVar11!.set(value);
  }
  private __backing_linkVar12?: LinkDecoratedVariable<Set<string> | Per>;
  public get linkVar12(): Set<string> | Per {
    return this.__backing_linkVar12!.get();
  }
  public set linkVar12(value: Set<string> | Per) {
    this.__backing_linkVar12!.set(value);
  }
  @memo() public _build(@memo() style: ((instance: Parent)=> Parent) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_Parent | undefined): void {}
  public constructor() {}
}

interface __Options_Parent {
  set linkVar1(linkVar1: Per | undefined)
  get linkVar1(): Per | undefined
  set __backing_linkVar1(__backing_linkVar1: DecoratedV1VariableBase<Per> | undefined)
  get __backing_linkVar1(): DecoratedV1VariableBase<Per> | undefined
  set linkVar2(linkVar2: Array<number> | undefined)
  get linkVar2(): Array<number> | undefined
  set __backing_linkVar2(__backing_linkVar2: DecoratedV1VariableBase<Array<number>> | undefined)
  get __backing_linkVar2(): DecoratedV1VariableBase<Array<number>> | undefined
  set linkVar3(linkVar3: LinkType | undefined)
  get linkVar3(): LinkType | undefined
  set __backing_linkVar3(__backing_linkVar3: DecoratedV1VariableBase<LinkType> | undefined)
  get __backing_linkVar3(): DecoratedV1VariableBase<LinkType> | undefined
  set linkVar4(linkVar4: Set<string> | undefined)
  get linkVar4(): Set<string> | undefined
  set __backing_linkVar4(__backing_linkVar4: DecoratedV1VariableBase<Set<string>> | undefined)
  get __backing_linkVar4(): DecoratedV1VariableBase<Set<string>> | undefined
  set linkVar5(linkVar5: Array<boolean> | undefined)
  get linkVar5(): Array<boolean> | undefined
  set __backing_linkVar5(__backing_linkVar5: DecoratedV1VariableBase<Array<boolean>> | undefined)
  get __backing_linkVar5(): DecoratedV1VariableBase<Array<boolean>> | undefined
  set linkVar6(linkVar6: Array<Per> | undefined)
  get linkVar6(): Array<Per> | undefined
  set __backing_linkVar6(__backing_linkVar6: DecoratedV1VariableBase<Array<Per>> | undefined)
  get __backing_linkVar6(): DecoratedV1VariableBase<Array<Per>> | undefined
  set linkVar7(linkVar7: Array<Per> | undefined)
  get linkVar7(): Array<Per> | undefined
  set __backing_linkVar7(__backing_linkVar7: DecoratedV1VariableBase<Array<Per>> | undefined)
  get __backing_linkVar7(): DecoratedV1VariableBase<Array<Per>> | undefined
  set linkVar8(linkVar8: ((sr: string)=> void) | undefined)
  get linkVar8(): ((sr: string)=> void) | undefined
  set __backing_linkVar8(__backing_linkVar8: DecoratedV1VariableBase<((sr: string)=> void)> | undefined)
  get __backing_linkVar8(): DecoratedV1VariableBase<((sr: string)=> void)> | undefined
  set linkVar9(linkVar9: Date | undefined)
  get linkVar9(): Date | undefined
  set __backing_linkVar9(__backing_linkVar9: DecoratedV1VariableBase<Date> | undefined)
  get __backing_linkVar9(): DecoratedV1VariableBase<Date> | undefined
  set linkVar10(linkVar10: Map<number, Per> | undefined)
  get linkVar10(): Map<number, Per> | undefined
  set __backing_linkVar10(__backing_linkVar10: DecoratedV1VariableBase<Map<number, Per>> | undefined)
  get __backing_linkVar10(): DecoratedV1VariableBase<Map<number, Per>> | undefined
  set linkVar11(linkVar11: string | number | undefined)
  get linkVar11(): string | number | undefined
  set __backing_linkVar11(__backing_linkVar11: DecoratedV1VariableBase<string | number> | undefined)
  get __backing_linkVar11(): DecoratedV1VariableBase<string | number> | undefined
  set linkVar12(linkVar12: Set<string> | Per | undefined)
  get linkVar12(): Set<string> | Per | undefined
  set __backing_linkVar12(__backing_linkVar12: DecoratedV1VariableBase<Set<string> | Per> | undefined)
  get __backing_linkVar12(): DecoratedV1VariableBase<Set<string> | Per> | undefined
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test complex type @Link decorated variables transformation',
    [parsedTransform, structNoRecheck],
    {
        checked: [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
