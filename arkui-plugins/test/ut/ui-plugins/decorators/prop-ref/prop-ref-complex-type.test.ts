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

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/prop-ref';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'prop-ref-complex-type.ets'),
];

const pluginTester = new PluginTester('test complex type @PropRef decorated variables transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsed-trans',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { memo as memo } from "arkui.stateManagement.runtime";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IPropRefDecoratedVariable as IPropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component } from "@ohos.arkui.component";

import { PropRef as PropRef } from "@ohos.arkui.stateManagement";

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

@Component() final struct Parent extends CustomComponent<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_propVar1 = STATE_MGMT_FACTORY.makePropRef<Per>(this, "propVar1", ((({let gensym___95172135 = initializers;
    (((gensym___95172135) == (null)) ? undefined : gensym___95172135.propVar1)})) ?? (new Per(6))));
    this.__backing_propVar2 = STATE_MGMT_FACTORY.makePropRef<Array<number>>(this, "propVar2", ((({let gensym___222490386 = initializers;
    (((gensym___222490386) == (null)) ? undefined : gensym___222490386.propVar2)})) ?? (new Array<number>(3, 6, 8))));
    this.__backing_propVar3 = STATE_MGMT_FACTORY.makePropRef<PropType>(this, "propVar3", ((({let gensym___201781257 = initializers;
    (((gensym___201781257) == (null)) ? undefined : gensym___201781257.propVar3)})) ?? (PropType.TYPE3)));
    this.__backing_propVar4 = STATE_MGMT_FACTORY.makePropRef<Set<string>>(this, "propVar4", ((({let gensym___22028950 = initializers;
    (((gensym___22028950) == (null)) ? undefined : gensym___22028950.propVar4)})) ?? (new Set<string>(new Array<string>("aa", "bb")))));
    this.__backing_propVar5 = STATE_MGMT_FACTORY.makePropRef<Array<boolean>>(this, "propVar5", ((({let gensym___54872258 = initializers;
    (((gensym___54872258) == (null)) ? undefined : gensym___54872258.propVar5)})) ?? ([true, false])));
    this.__backing_propVar6 = STATE_MGMT_FACTORY.makePropRef<Array<Per>>(this, "propVar6", ((({let gensym___128760941 = initializers;
    (((gensym___128760941) == (null)) ? undefined : gensym___128760941.propVar6)})) ?? (new Array<Per>(new Per(7), new Per(11)))));
    this.__backing_propVar7 = STATE_MGMT_FACTORY.makePropRef<Array<Per>>(this, "propVar7", ((({let gensym___30534085 = initializers;
    (((gensym___30534085) == (null)) ? undefined : gensym___30534085.propVar7)})) ?? ([new Per(7), new Per(11)])));
    this.__backing_propVar8 = STATE_MGMT_FACTORY.makePropRef<((sr: string)=> void)>(this, "propVar8", ((({let gensym___12471776 = initializers;
    (((gensym___12471776) == (null)) ? undefined : gensym___12471776.propVar8)})) ?? (((sr: string) => {}))));
    this.__backing_propVar9 = STATE_MGMT_FACTORY.makePropRef<Date>(this, "propVar9", ((({let gensym___123472108 = initializers;
    (((gensym___123472108) == (null)) ? undefined : gensym___123472108.propVar9)})) ?? (new Date("2025-4-23"))));
    this.__backing_propVar10 = STATE_MGMT_FACTORY.makePropRef<Map<number, Per>>(this, "propVar10", ((({let gensym___147847012 = initializers;
    (((gensym___147847012) == (null)) ? undefined : gensym___147847012.propVar10)})) ?? (new Map<number, Per>([[0, new Per(7)], [1, new Per(10)]]))));
    this.__backing_propVar11 = STATE_MGMT_FACTORY.makePropRef<(string | number)>(this, "propVar11", ((({let gensym___117026760 = initializers;
    (((gensym___117026760) == (null)) ? undefined : gensym___117026760.propVar11)})) ?? (0.0)));
    this.__backing_propVar12 = STATE_MGMT_FACTORY.makePropRef<(Set<string> | Per)>(this, "propVar12", ((({let gensym___220245132 = initializers;
    (((gensym___220245132) == (null)) ? undefined : gensym___220245132.propVar12)})) ?? (new Per(6))));
  }

  public __updateStruct(initializers: (__Options_Parent | undefined)): void {
    if (({let gensym___222986222 = initializers;
    (((gensym___222986222) == (null)) ? undefined : gensym___222986222.__options_has_propVar1)})) {
      this.__backing_propVar1!.update((initializers!.propVar1 as Per));
    }
    if (({let gensym___178023537 = initializers;
    (((gensym___178023537) == (null)) ? undefined : gensym___178023537.__options_has_propVar2)})) {
      this.__backing_propVar2!.update((initializers!.propVar2 as Array<number>));
    }
    if (({let gensym___221361445 = initializers;
    (((gensym___221361445) == (null)) ? undefined : gensym___221361445.__options_has_propVar3)})) {
      this.__backing_propVar3!.update((initializers!.propVar3 as PropType));
    }
    if (({let gensym___22732558 = initializers;
    (((gensym___22732558) == (null)) ? undefined : gensym___22732558.__options_has_propVar4)})) {
      this.__backing_propVar4!.update((initializers!.propVar4 as Set<string>));
    }
    if (({let gensym___143875977 = initializers;
    (((gensym___143875977) == (null)) ? undefined : gensym___143875977.__options_has_propVar5)})) {
      this.__backing_propVar5!.update((initializers!.propVar5 as Array<boolean>));
    }
    if (({let gensym___21159249 = initializers;
    (((gensym___21159249) == (null)) ? undefined : gensym___21159249.__options_has_propVar6)})) {
      this.__backing_propVar6!.update((initializers!.propVar6 as Array<Per>));
    }
    if (({let gensym___198355044 = initializers;
    (((gensym___198355044) == (null)) ? undefined : gensym___198355044.__options_has_propVar7)})) {
      this.__backing_propVar7!.update((initializers!.propVar7 as Array<Per>));
    }
    if (({let gensym___52710109 = initializers;
    (((gensym___52710109) == (null)) ? undefined : gensym___52710109.__options_has_propVar8)})) {
      this.__backing_propVar8!.update((initializers!.propVar8 as ((sr: string)=> void)));
    }
    if (({let gensym___202931084 = initializers;
    (((gensym___202931084) == (null)) ? undefined : gensym___202931084.__options_has_propVar9)})) {
      this.__backing_propVar9!.update((initializers!.propVar9 as Date));
    }
    if (({let gensym___211158796 = initializers;
    (((gensym___211158796) == (null)) ? undefined : gensym___211158796.__options_has_propVar10)})) {
      this.__backing_propVar10!.update((initializers!.propVar10 as Map<number, Per>));
    }
    if (({let gensym___109526633 = initializers;
    (((gensym___109526633) == (null)) ? undefined : gensym___109526633.__options_has_propVar11)})) {
      this.__backing_propVar11!.update((initializers!.propVar11 as (string | number)));
    }
    if (({let gensym___33495086 = initializers;
    (((gensym___33495086) == (null)) ? undefined : gensym___33495086.__options_has_propVar12)})) {
      this.__backing_propVar12!.update((initializers!.propVar12 as (Set<string> | Per)));
    }
  }

  private __backing_propVar1?: IPropRefDecoratedVariable<Per>;

  public get propVar1(): Per {
    return this.__backing_propVar1!.get();
  }

  public set propVar1(value: Per) {
    this.__backing_propVar1!.set(value);
  }

  private __backing_propVar2?: IPropRefDecoratedVariable<Array<number>>;

  public get propVar2(): Array<number> {
    return this.__backing_propVar2!.get();
  }

  public set propVar2(value: Array<number>) {
    this.__backing_propVar2!.set(value);
  }

  private __backing_propVar3?: IPropRefDecoratedVariable<PropType>;

  public get propVar3(): PropType {
    return this.__backing_propVar3!.get();
  }

  public set propVar3(value: PropType) {
    this.__backing_propVar3!.set(value);
  }

  private __backing_propVar4?: IPropRefDecoratedVariable<Set<string>>;

  public get propVar4(): Set<string> {
    return this.__backing_propVar4!.get();
  }

  public set propVar4(value: Set<string>) {
    this.__backing_propVar4!.set(value);
  }

  private __backing_propVar5?: IPropRefDecoratedVariable<Array<boolean>>;

  public get propVar5(): Array<boolean> {
    return this.__backing_propVar5!.get();
  }

  public set propVar5(value: Array<boolean>) {
    this.__backing_propVar5!.set(value);
  }

  private __backing_propVar6?: IPropRefDecoratedVariable<Array<Per>>;

  public get propVar6(): Array<Per> {
    return this.__backing_propVar6!.get();
  }

  public set propVar6(value: Array<Per>) {
    this.__backing_propVar6!.set(value);
  }

  private __backing_propVar7?: IPropRefDecoratedVariable<Array<Per>>;

  public get propVar7(): Array<Per> {
    return this.__backing_propVar7!.get();
  }

  public set propVar7(value: Array<Per>) {
    this.__backing_propVar7!.set(value);
  }

  private __backing_propVar8?: IPropRefDecoratedVariable<((sr: string)=> void)>;

  public get propVar8(): ((sr: string)=> void) {
    return this.__backing_propVar8!.get();
  }

  public set propVar8(value: ((sr: string)=> void)) {
    this.__backing_propVar8!.set(value);
  }

  private __backing_propVar9?: IPropRefDecoratedVariable<Date>;

  public get propVar9(): Date {
    return this.__backing_propVar9!.get();
  }

  public set propVar9(value: Date) {
    this.__backing_propVar9!.set(value);
  }

  private __backing_propVar10?: IPropRefDecoratedVariable<Map<number, Per>>;

  public get propVar10(): Map<number, Per> {
    return this.__backing_propVar10!.get();
  }

  public set propVar10(value: Map<number, Per>) {
    this.__backing_propVar10!.set(value);
  }

  private __backing_propVar11?: IPropRefDecoratedVariable<(string | number)>;

  public get propVar11(): (string | number) {
    return this.__backing_propVar11!.get();
  }

  public set propVar11(value: (string | number)) {
    this.__backing_propVar11!.set(value);
  }

  private __backing_propVar12?: IPropRefDecoratedVariable<(Set<string> | Per)>;

  public get propVar12(): (Set<string> | Per) {
    return this.__backing_propVar12!.get();
  }

  public set propVar12(value: (Set<string> | Per)) {
    this.__backing_propVar12!.set(value);
  }

  @memo() public build() {}

  public constructor() {}

}

@Component() export interface __Options_Parent {
  set propVar1(propVar1: (Per | undefined))

  get propVar1(): (Per | undefined)
  set __backing_propVar1(__backing_propVar1: (IPropRefDecoratedVariable<Per> | undefined))

  get __backing_propVar1(): (IPropRefDecoratedVariable<Per> | undefined)
  set __options_has_propVar1(__options_has_propVar1: (boolean | undefined))
  
  get __options_has_propVar1(): (boolean | undefined)
  set propVar2(propVar2: (Array<number> | undefined))

  get propVar2(): (Array<number> | undefined)
  set __backing_propVar2(__backing_propVar2: (IPropRefDecoratedVariable<Array<number>> | undefined))

  get __backing_propVar2(): (IPropRefDecoratedVariable<Array<number>> | undefined)
  set __options_has_propVar2(__options_has_propVar2: (boolean | undefined))
  
  get __options_has_propVar2(): (boolean | undefined)
  set propVar3(propVar3: (PropType | undefined))

  get propVar3(): (PropType | undefined)
  set __backing_propVar3(__backing_propVar3: (IPropRefDecoratedVariable<PropType> | undefined))

  get __backing_propVar3(): (IPropRefDecoratedVariable<PropType> | undefined)
  set __options_has_propVar3(__options_has_propVar3: (boolean | undefined))
  
  get __options_has_propVar3(): (boolean | undefined)
  set propVar4(propVar4: (Set<string> | undefined))

  get propVar4(): (Set<string> | undefined)
  set __backing_propVar4(__backing_propVar4: (IPropRefDecoratedVariable<Set<string>> | undefined))

  get __backing_propVar4(): (IPropRefDecoratedVariable<Set<string>> | undefined)
  set __options_has_propVar4(__options_has_propVar4: (boolean | undefined))
  
  get __options_has_propVar4(): (boolean | undefined)
  set propVar5(propVar5: (Array<boolean> | undefined))

  get propVar5(): (Array<boolean> | undefined)
  set __backing_propVar5(__backing_propVar5: (IPropRefDecoratedVariable<Array<boolean>> | undefined))

  get __backing_propVar5(): (IPropRefDecoratedVariable<Array<boolean>> | undefined)
  set __options_has_propVar5(__options_has_propVar5: (boolean | undefined))
  
  get __options_has_propVar5(): (boolean | undefined)
  set propVar6(propVar6: (Array<Per> | undefined))

  get propVar6(): (Array<Per> | undefined)
  set __backing_propVar6(__backing_propVar6: (IPropRefDecoratedVariable<Array<Per>> | undefined))

  get __backing_propVar6(): (IPropRefDecoratedVariable<Array<Per>> | undefined)
  set __options_has_propVar6(__options_has_propVar6: (boolean | undefined))
  
  get __options_has_propVar6(): (boolean | undefined)
  set propVar7(propVar7: (Array<Per> | undefined))

  get propVar7(): (Array<Per> | undefined)
  set __backing_propVar7(__backing_propVar7: (IPropRefDecoratedVariable<Array<Per>> | undefined))

  get __backing_propVar7(): (IPropRefDecoratedVariable<Array<Per>> | undefined)
  set __options_has_propVar7(__options_has_propVar7: (boolean | undefined))
  
  get __options_has_propVar7(): (boolean | undefined)
  set propVar8(propVar8: (((sr: string)=> void) | undefined))

  get propVar8(): (((sr: string)=> void) | undefined)
  set __backing_propVar8(__backing_propVar8: (IPropRefDecoratedVariable<((sr: string)=> void)> | undefined))

  get __backing_propVar8(): (IPropRefDecoratedVariable<((sr: string)=> void)> | undefined)
  set __options_has_propVar8(__options_has_propVar8: (boolean | undefined))
  
  get __options_has_propVar8(): (boolean | undefined)
  set propVar9(propVar9: (Date | undefined))

  get propVar9(): (Date | undefined)
  set __backing_propVar9(__backing_propVar9: (IPropRefDecoratedVariable<Date> | undefined))

  get __backing_propVar9(): (IPropRefDecoratedVariable<Date> | undefined)
  set __options_has_propVar9(__options_has_propVar9: (boolean | undefined))
  
  get __options_has_propVar9(): (boolean | undefined)
  set propVar10(propVar10: (Map<number, Per> | undefined))

  get propVar10(): (Map<number, Per> | undefined)
  set __backing_propVar10(__backing_propVar10: (IPropRefDecoratedVariable<Map<number, Per>> | undefined))

  get __backing_propVar10(): (IPropRefDecoratedVariable<Map<number, Per>> | undefined)
  set __options_has_propVar10(__options_has_propVar10: (boolean | undefined))
  
  get __options_has_propVar10(): (boolean | undefined)
  set propVar11(propVar11: ((string | number) | undefined))

  get propVar11(): ((string | number) | undefined)
  set __backing_propVar11(__backing_propVar11: (IPropRefDecoratedVariable<(string | number)> | undefined))

  get __backing_propVar11(): (IPropRefDecoratedVariable<(string | number)> | undefined)
  set __options_has_propVar11(__options_has_propVar11: (boolean | undefined))
  
  get __options_has_propVar11(): (boolean | undefined)
  set propVar12(propVar12: ((Set<string> | Per) | undefined))

  get propVar12(): ((Set<string> | Per) | undefined)
  set __backing_propVar12(__backing_propVar12: (IPropRefDecoratedVariable<(Set<string> | Per)> | undefined))

  get __backing_propVar12(): (IPropRefDecoratedVariable<(Set<string> | Per)> | undefined)
  set __options_has_propVar12(__options_has_propVar12: (boolean | undefined))
  
  get __options_has_propVar12(): (boolean | undefined)
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test complex type @PropRef decorated variables transformation',
    [parsedTransform, structNoRecheck, recheck],
    {
        'checked:struct-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
