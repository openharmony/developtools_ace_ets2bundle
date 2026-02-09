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
import { dumpGetterSetter, GetSetDumper, dumpConstructor } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/provide-and-consume';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'provide-basic-type.ets'),
];

const pluginTester = new PluginTester('test basic type @Provide decorated variables transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'provide-basic-type',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { IProvideDecoratedVariable as IProvideDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component } from "@ohos.arkui.component";

import { Provide as Provide } from "@ohos.arkui.stateManagement";

function main() {}

@Component() final struct PropParent extends CustomComponent<PropParent, __Options_PropParent> {
  public __initializeStruct(initializers: (__Options_PropParent | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_provideVar1 = STATE_MGMT_FACTORY.makeProvide<string>(this, "provideVar1", "provideVar1", ((({let gensym___181030638 = initializers;
    (((gensym___181030638) == (null)) ? undefined : gensym___181030638.provideVar1)})) ?? ("propVar1")), false);
    this.__backing_provideVar2 = STATE_MGMT_FACTORY.makeProvide<number>(this, "provideVar2", "provideVar2", ((({let gensym___143944235 = initializers;
    (((gensym___143944235) == (null)) ? undefined : gensym___143944235.provideVar2)})) ?? (50)), false);
    this.__backing_provideVar3 = STATE_MGMT_FACTORY.makeProvide<boolean>(this, "provideVar3", "provideVar3", ((({let gensym___262195977 = initializers;
    (((gensym___262195977) == (null)) ? undefined : gensym___262195977.provideVar3)})) ?? (true)), false);
    this.__backing_provideVar4 = STATE_MGMT_FACTORY.makeProvide<undefined>(this, "provideVar4", "provideVar4", ((({let gensym___85711435 = initializers;
    (((gensym___85711435) == (null)) ? undefined : gensym___85711435.provideVar4)})) ?? (undefined)), false);
    this.__backing_provideVar5 = STATE_MGMT_FACTORY.makeProvide<null>(this, "provideVar5", "provideVar5", ((({let gensym___139253630 = initializers;
    (((gensym___139253630) == (null)) ? undefined : gensym___139253630.provideVar5)})) ?? (null)), false);
    this.__backing_provideVar6 = STATE_MGMT_FACTORY.makeProvide<(string | undefined)>(this, "provideVar6", "provideVar6", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.provideVar6)})) ?? ("hello")), false);
    this.__backing_provideVar7 = STATE_MGMT_FACTORY.makeProvide<(string | null)>(this, "provideVar7", "provideVar7", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.provideVar7)})) ?? (null)), false);
    this.__backing_provideVar8 = STATE_MGMT_FACTORY.makeProvide<number>(this, "provideVar8", "a", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.provideVar8)})) ?? (10)), false);
    this.__backing_provideVar9 = STATE_MGMT_FACTORY.makeProvide<(string | undefined)>(this, "provideVar9", "b", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.provideVar9)})) ?? ("hello")), false);
    this.__backing_provideVar10 = STATE_MGMT_FACTORY.makeProvide<number>(this, "provideVar10", "provideVar10", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.provideVar10)})) ?? (10)), true);
    this.__backing_provideVar11 = STATE_MGMT_FACTORY.makeProvide<(string | undefined)>(this, "provideVar11", "provideVar11", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.provideVar11)})) ?? (undefined)), true);
    this.__backing_provideVar12 = STATE_MGMT_FACTORY.makeProvide<number>(this, "provideVar12", "provideVar12", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.provideVar12)})) ?? (15)), false);
    this.__backing_provideVar13 = STATE_MGMT_FACTORY.makeProvide<(string | undefined)>(this, "provideVar13", "provideVar13", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.provideVar13)})) ?? ("prop13")), false);
    this.__backing_provideVar14 = STATE_MGMT_FACTORY.makeProvide<(boolean | undefined)>(this, "provideVar14", "c", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.provideVar14)})) ?? (false)), true);
    this.__backing_provideVar15 = STATE_MGMT_FACTORY.makeProvide<(string | undefined)>(this, "provideVar15", "d", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.provideVar15)})) ?? (undefined)), true);
    this.__backing_provideVar16 = STATE_MGMT_FACTORY.makeProvide<(number | undefined)>(this, "provideVar16", "e", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.provideVar16)})) ?? (20)), false);
    this.__backing_provideVar17 = STATE_MGMT_FACTORY.makeProvide<(boolean | undefined)>(this, "provideVar17", "f", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.provideVar17)})) ?? (true)), false);
  }

  public __updateStruct(initializers: (__Options_PropParent | undefined)): void {}

  private __backing_provideVar1?: IProvideDecoratedVariable<string>;

  public get provideVar1(): string {
    return this.__backing_provideVar1!.get();
  }

  public set provideVar1(value: string) {
    this.__backing_provideVar1!.set(value);
  }

  private __backing_provideVar2?: IProvideDecoratedVariable<number>;

  public get provideVar2(): number {
    return this.__backing_provideVar2!.get();
  }

  public set provideVar2(value: number) {
    this.__backing_provideVar2!.set(value);
  }

  private __backing_provideVar3?: IProvideDecoratedVariable<boolean>;

  public get provideVar3(): boolean {
    return this.__backing_provideVar3!.get();
  }

  public set provideVar3(value: boolean) {
    this.__backing_provideVar3!.set(value);
  }

  private __backing_provideVar4?: IProvideDecoratedVariable<undefined>;

  public get provideVar4(): undefined {
    return this.__backing_provideVar4!.get();
  }

  public set provideVar4(value: undefined) {
    this.__backing_provideVar4!.set(value);
  }

  private __backing_provideVar5?: IProvideDecoratedVariable<null>;

  public get provideVar5(): null {
    return this.__backing_provideVar5!.get();
  }

  public set provideVar5(value: null) {
    this.__backing_provideVar5!.set(value);
  }

  private __backing_provideVar6?: IProvideDecoratedVariable<(string | undefined)>;

  public get provideVar6(): (string | undefined) {
    return this.__backing_provideVar6!.get();
  }
  
  public set provideVar6(value: (string | undefined)) {
    this.__backing_provideVar6!.set(value);
  }
  
  private __backing_provideVar7?: IProvideDecoratedVariable<(string | null)>;
  
  public get provideVar7(): (string | null) {
    return this.__backing_provideVar7!.get();
  }
  
  public set provideVar7(value: (string | null)) {
    this.__backing_provideVar7!.set(value);
  }
  
  private __backing_provideVar8?: IProvideDecoratedVariable<number>;
  
  public get provideVar8(): number {
    return this.__backing_provideVar8!.get();
  }
  
  public set provideVar8(value: number) {
    this.__backing_provideVar8!.set(value);
  }
  
  private __backing_provideVar9?: IProvideDecoratedVariable<(string | undefined)>;
  
  public get provideVar9(): (string | undefined) {
    return this.__backing_provideVar9!.get();
  }
  
  public set provideVar9(value: (string | undefined)) {
    this.__backing_provideVar9!.set(value);
  }
  
  private __backing_provideVar10?: IProvideDecoratedVariable<number>;
  
  public get provideVar10(): number {
    return this.__backing_provideVar10!.get();
  }
  
  public set provideVar10(value: number) {
    this.__backing_provideVar10!.set(value);
  }
  
  private __backing_provideVar11?: IProvideDecoratedVariable<(string | undefined)>;
  
  public get provideVar11(): (string | undefined) {
    return this.__backing_provideVar11!.get();
  }
  
  public set provideVar11(value: (string | undefined)) {
    this.__backing_provideVar11!.set(value);
  }
  
  private __backing_provideVar12?: IProvideDecoratedVariable<number>;
  
  public get provideVar12(): number {
    return this.__backing_provideVar12!.get();
  }
  
  public set provideVar12(value: number) {
    this.__backing_provideVar12!.set(value);
  }
  
  private __backing_provideVar13?: IProvideDecoratedVariable<(string | undefined)>;
  
  public get provideVar13(): (string | undefined) {
    return this.__backing_provideVar13!.get();
  }
  
  public set provideVar13(value: (string | undefined)) {
    this.__backing_provideVar13!.set(value);
  }
  
  private __backing_provideVar14?: IProvideDecoratedVariable<(boolean | undefined)>;
  
  public get provideVar14(): (boolean | undefined) {
    return this.__backing_provideVar14!.get();
  }
  
  public set provideVar14(value: (boolean | undefined)) {
    this.__backing_provideVar14!.set(value);
  }
  
  private __backing_provideVar15?: IProvideDecoratedVariable<(string | undefined)>;
  
  public get provideVar15(): (string | undefined) {
    return this.__backing_provideVar15!.get();
  }
  
  public set provideVar15(value: (string | undefined)) {
    this.__backing_provideVar15!.set(value);
  }
  
  private __backing_provideVar16?: IProvideDecoratedVariable<(number | undefined)>;
  
  public get provideVar16(): (number | undefined) {
    return this.__backing_provideVar16!.get();
  }
  
  public set provideVar16(value: (number | undefined)) {
    this.__backing_provideVar16!.set(value);
  }
  
  private __backing_provideVar17?: IProvideDecoratedVariable<(boolean | undefined)>;
  
  public get provideVar17(): (boolean | undefined) {
    return this.__backing_provideVar17!.get();
  }
  
  public set provideVar17(value: (boolean | undefined)) {
    this.__backing_provideVar17!.set(value);
  }

  @MemoIntrinsic() 
  public static _invoke(style: @Memo() ((instance: PropParent)=> void), initializers: ((()=> __Options_PropParent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<PropParent, __Options_PropParent>(style, ((): PropParent => {
      return new PropParent(false, ({let gensym___203542966 = storage;
      (((gensym___203542966) == (null)) ? undefined : gensym___203542966())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_PropParent, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): PropParent {
    throw new Error("Declare interface");
  }

  @Memo() 
  public build() {}

  ${dumpConstructor()}

}

@Component() export interface __Options_PropParent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'provideVar1', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_provideVar1', '(IProvideDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_provideVar1', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'provideVar2', '(number | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_provideVar2', '(IProvideDecoratedVariable<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_provideVar2', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'provideVar3', '(boolean | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_provideVar3', '(IProvideDecoratedVariable<boolean> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_provideVar3', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'provideVar4', '(undefined | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_provideVar4', '(IProvideDecoratedVariable<undefined> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_provideVar4', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'provideVar5', '(null | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_provideVar5', '(IProvideDecoratedVariable<null> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_provideVar5', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'provideVar6', '((string | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_provideVar6', '(IProvideDecoratedVariable<(string | undefined)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_provideVar6', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'provideVar7', '((string | null) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_provideVar7', '(IProvideDecoratedVariable<(string | null)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_provideVar7', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'provideVar8', '(number | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_provideVar8', '(IProvideDecoratedVariable<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_provideVar8', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'provideVar9', '((string | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_provideVar9', '(IProvideDecoratedVariable<(string | undefined)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_provideVar9', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'provideVar10', '(number | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_provideVar10', '(IProvideDecoratedVariable<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_provideVar10', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'provideVar11', '((string | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_provideVar11', '(IProvideDecoratedVariable<(string | undefined)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_provideVar11', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'provideVar12', '(number | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_provideVar12', '(IProvideDecoratedVariable<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_provideVar12', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'provideVar13', '((string | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_provideVar13', '(IProvideDecoratedVariable<(string | undefined)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_provideVar13', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'provideVar14', '((boolean | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_provideVar14', '(IProvideDecoratedVariable<(boolean | undefined)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_provideVar14', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'provideVar15', '((string | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_provideVar15', '(IProvideDecoratedVariable<(string | undefined)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_provideVar15', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'provideVar16', '((number | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_provideVar16', '(IProvideDecoratedVariable<(number | undefined)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_provideVar16', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'provideVar17', '((boolean | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_provideVar17', '(IProvideDecoratedVariable<(boolean | undefined)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_provideVar17', '(boolean | undefined)')}
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test basic type @Provide decorated variables transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
