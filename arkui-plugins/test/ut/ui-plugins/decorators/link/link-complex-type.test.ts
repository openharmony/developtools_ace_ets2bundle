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
import { GetSetDumper, dumpGetterSetter, dumpAnnotation } from '../../../../utils/simplify-dump';
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
import { memo as memo } from "arkui.stateManagement.runtime";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { LinkSourceType as LinkSourceType } from "arkui.stateManagement.decorator";

import { ILinkDecoratedVariable as ILinkDecoratedVariable } from "arkui.stateManagement.decorator";

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

@Component() final struct Parent extends CustomComponent<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @memo() content: ((()=> void) | undefined)): void {
    if (({let gensym___184416899 = initializers;
    (((gensym___184416899) == (null)) ? undefined : gensym___184416899.__options_has_linkVar1)})) {
      this.__backing_linkVar1 = STATE_MGMT_FACTORY.makeLink<Per>(this, "linkVar1", initializers!.__backing_linkVar1!);
    };
    if (({let gensym___82966591 = initializers;
    (((gensym___82966591) == (null)) ? undefined : gensym___82966591.__options_has_linkVar2)})) {
      this.__backing_linkVar2 = STATE_MGMT_FACTORY.makeLink<Array<number>>(this, "linkVar2", initializers!.__backing_linkVar2!);
    };
    if (({let gensym___55498955 = initializers;
    (((gensym___55498955) == (null)) ? undefined : gensym___55498955.__options_has_linkVar3)})) {
      this.__backing_linkVar3 = STATE_MGMT_FACTORY.makeLink<LinkType>(this, "linkVar3", initializers!.__backing_linkVar3!);
    };
    if (({let gensym___231322030 = initializers;
    (((gensym___231322030) == (null)) ? undefined : gensym___231322030.__options_has_linkVar4)})) {
      this.__backing_linkVar4 = STATE_MGMT_FACTORY.makeLink<Set<string>>(this, "linkVar4", initializers!.__backing_linkVar4!);
    };
    if (({let gensym___2576517 = initializers;
    (((gensym___2576517) == (null)) ? undefined : gensym___2576517.__options_has_linkVar5)})) {
      this.__backing_linkVar5 = STATE_MGMT_FACTORY.makeLink<Array<boolean>>(this, "linkVar5", initializers!.__backing_linkVar5!);
    };
    if (({let gensym___11281112 = initializers;
    (((gensym___11281112) == (null)) ? undefined : gensym___11281112.__options_has_linkVar6)})) {
      this.__backing_linkVar6 = STATE_MGMT_FACTORY.makeLink<Array<Per>>(this, "linkVar6", initializers!.__backing_linkVar6!);
    };
    if (({let gensym___228477447 = initializers;
    (((gensym___228477447) == (null)) ? undefined : gensym___228477447.__options_has_linkVar7)})) {
      this.__backing_linkVar7 = STATE_MGMT_FACTORY.makeLink<Array<Per>>(this, "linkVar7", initializers!.__backing_linkVar7!);
    };
    if (({let gensym___82513833 = initializers;
    (((gensym___82513833) == (null)) ? undefined : gensym___82513833.__options_has_linkVar8)})) {
      this.__backing_linkVar8 = STATE_MGMT_FACTORY.makeLink<((sr: string)=> void)>(this, "linkVar8", initializers!.__backing_linkVar8!);
    };
    if (({let gensym___218466927 = initializers;
    (((gensym___218466927) == (null)) ? undefined : gensym___218466927.__options_has_linkVar9)})) {
      this.__backing_linkVar9 = STATE_MGMT_FACTORY.makeLink<Date>(this, "linkVar9", initializers!.__backing_linkVar9!);
    };
    if (({let gensym___190376050 = initializers;
    (((gensym___190376050) == (null)) ? undefined : gensym___190376050.__options_has_linkVar10)})) {
      this.__backing_linkVar10 = STATE_MGMT_FACTORY.makeLink<Map<number, Per>>(this, "linkVar10", initializers!.__backing_linkVar10!);
    };
    if (({let gensym___64181673 = initializers;
    (((gensym___64181673) == (null)) ? undefined : gensym___64181673.__options_has_linkVar11)})) {
      this.__backing_linkVar11 = STATE_MGMT_FACTORY.makeLink<(string | number)>(this, "linkVar11", initializers!.__backing_linkVar11!);
    };
    if (({let gensym___134911804 = initializers;
    (((gensym___134911804) == (null)) ? undefined : gensym___134911804.__options_has_linkVar12)})) {
      this.__backing_linkVar12 = STATE_MGMT_FACTORY.makeLink<(Set<string> | Per)>(this, "linkVar12", initializers!.__backing_linkVar12!);
    };
  }
  
  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}
  
  private __backing_linkVar1?: ILinkDecoratedVariable<Per>;
  
  public get linkVar1(): Per {
    return this.__backing_linkVar1!.get();
  }
  
  public set linkVar1(value: Per) {
    this.__backing_linkVar1!.set(value);
  }
  
  private __backing_linkVar2?: ILinkDecoratedVariable<Array<number>>;
  
  public get linkVar2(): Array<number> {
    return this.__backing_linkVar2!.get();
  }
  
  public set linkVar2(value: Array<number>) {
    this.__backing_linkVar2!.set(value);
  }
  
  private __backing_linkVar3?: ILinkDecoratedVariable<LinkType>;
  
  public get linkVar3(): LinkType {
    return this.__backing_linkVar3!.get();
  }
  
  public set linkVar3(value: LinkType) {
    this.__backing_linkVar3!.set(value);
  }
  
  private __backing_linkVar4?: ILinkDecoratedVariable<Set<string>>;
  
  public get linkVar4(): Set<string> {
    return this.__backing_linkVar4!.get();
  }
  
  public set linkVar4(value: Set<string>) {
    this.__backing_linkVar4!.set(value);
  }
  
  private __backing_linkVar5?: ILinkDecoratedVariable<Array<boolean>>;
  
  public get linkVar5(): Array<boolean> {
    return this.__backing_linkVar5!.get();
  }
  
  public set linkVar5(value: Array<boolean>) {
    this.__backing_linkVar5!.set(value);
  }
  
  private __backing_linkVar6?: ILinkDecoratedVariable<Array<Per>>;
  
  public get linkVar6(): Array<Per> {
    return this.__backing_linkVar6!.get();
  }
  
  public set linkVar6(value: Array<Per>) {
    this.__backing_linkVar6!.set(value);
  }
  
  private __backing_linkVar7?: ILinkDecoratedVariable<Array<Per>>;
  
  public get linkVar7(): Array<Per> {
    return this.__backing_linkVar7!.get();
  }
  
  public set linkVar7(value: Array<Per>) {
    this.__backing_linkVar7!.set(value);
  }
  
  private __backing_linkVar8?: ILinkDecoratedVariable<((sr: string)=> void)>;
  
  public get linkVar8(): ((sr: string)=> void) {
    return this.__backing_linkVar8!.get();
  }
  
  public set linkVar8(value: ((sr: string)=> void)) {
    this.__backing_linkVar8!.set(value);
  }
  
  private __backing_linkVar9?: ILinkDecoratedVariable<Date>;
  
  public get linkVar9(): Date {
    return this.__backing_linkVar9!.get();
  }
  
  public set linkVar9(value: Date) {
    this.__backing_linkVar9!.set(value);
  }
  
  private __backing_linkVar10?: ILinkDecoratedVariable<Map<number, Per>>;
  
  public get linkVar10(): Map<number, Per> {
    return this.__backing_linkVar10!.get();
  }
  
  public set linkVar10(value: Map<number, Per>) {
    this.__backing_linkVar10!.set(value);
  }
  
  private __backing_linkVar11?: ILinkDecoratedVariable<(string | number)>;
  
  public get linkVar11(): (string | number) {
    return this.__backing_linkVar11!.get();
  }
  
  public set linkVar11(value: (string | number)) {
    this.__backing_linkVar11!.set(value);
  }
  
  private __backing_linkVar12?: ILinkDecoratedVariable<(Set<string> | Per)>;
  
  public get linkVar12(): (Set<string> | Per) {
    return this.__backing_linkVar12!.get();
  }
  
  public set linkVar12(value: (Set<string> | Per)) {
    this.__backing_linkVar12!.set(value);
  }
  
  @memo() public build() {}
  
  public constructor() {}
  
}

@Retention({policy:"SOURCE"}) @interface __Link_intrinsic {}

@Component() export interface __Options_Parent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'linkVar1', '(Per | undefined)', [dumpAnnotation('__Link_intrinsic')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_linkVar1', '(LinkSourceType<Per> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_linkVar1', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'linkVar2', '(Array<number> | undefined)', [dumpAnnotation('__Link_intrinsic')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_linkVar2', '(LinkSourceType<Array<number>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_linkVar2', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'linkVar3', '(LinkType | undefined)', [dumpAnnotation('__Link_intrinsic')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_linkVar3', '(LinkSourceType<LinkType> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_linkVar3', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'linkVar4', '(Set<string> | undefined)', [dumpAnnotation('__Link_intrinsic')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_linkVar4', '(LinkSourceType<Set<string>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_linkVar4', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'linkVar5', '(Array<boolean> | undefined)', [dumpAnnotation('__Link_intrinsic')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_linkVar5', '(LinkSourceType<Array<boolean>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_linkVar5', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'linkVar6', '(Array<Per> | undefined)', [dumpAnnotation('__Link_intrinsic')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_linkVar6', '(LinkSourceType<Array<Per>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_linkVar6', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'linkVar7', '(Array<Per> | undefined)', [dumpAnnotation('__Link_intrinsic')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_linkVar7', '(LinkSourceType<Array<Per>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_linkVar7', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'linkVar8', '(((sr: string)=> void) | undefined)', [dumpAnnotation('__Link_intrinsic')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_linkVar8', '(LinkSourceType<((sr: string)=> void)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_linkVar8', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'linkVar9', '(Date | undefined)', [dumpAnnotation('__Link_intrinsic')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_linkVar9', '(LinkSourceType<Date> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_linkVar9', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'linkVar10', '(Map<number, Per> | undefined)', [dumpAnnotation('__Link_intrinsic')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_linkVar10', '(LinkSourceType<Map<number, Per>> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_linkVar10', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'linkVar11', '((string | number) | undefined)', [dumpAnnotation('__Link_intrinsic')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_linkVar11', '(LinkSourceType<(string | number)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_linkVar11', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'linkVar12', '((Set<string> | Per) | undefined)', [dumpAnnotation('__Link_intrinsic')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_linkVar12', '(LinkSourceType<(Set<string> | Per)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_linkVar12', '(boolean | undefined)')}
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test complex type @Link decorated variables transformation',
    [parsedTransform, structNoRecheck, recheck],
    {
        'checked:struct-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
