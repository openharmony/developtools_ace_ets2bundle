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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'provide-annotation-usage.ets'),
];

const pluginTester = new PluginTester('test different @Provide annotation usage transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'provide-annotation-usage',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.stateManagement.runtime";

import { IProvideDecoratedVariable as IProvideDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Component as Component } from "@ohos.arkui.component";

import { Provide as Provide } from "@ohos.arkui.stateManagement";

function main() {}

@Component() final struct Ancestors extends CustomComponent<Ancestors, __Options_Ancestors> {
  public __initializeStruct(initializers: (__Options_Ancestors | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_count = STATE_MGMT_FACTORY.makeProvide<(string | undefined)>(this, "count", "count", ((({let gensym___58710805 = initializers;
    (((gensym___58710805) == (null)) ? undefined : gensym___58710805.count)})) ?? ("Child0")), false);
    this.__backing_count1 = STATE_MGMT_FACTORY.makeProvide<(string | undefined)>(this, "count1", "prov1", ((({let gensym___84874570 = initializers;
    (((gensym___84874570) == (null)) ? undefined : gensym___84874570.count1)})) ?? ("Child1")), false);
    this.__backing_count2 = STATE_MGMT_FACTORY.makeProvide<(string | undefined)>(this, "count2", "prov2", ((({let gensym___124037738 = initializers;
    (((gensym___124037738) == (null)) ? undefined : gensym___124037738.count2)})) ?? ("Child2")), false);
    this.__backing_count3 = STATE_MGMT_FACTORY.makeProvide<(string | undefined)>(this, "count3", "prov3", ((({let gensym___199202238 = initializers;
    (((gensym___199202238) == (null)) ? undefined : gensym___199202238.count3)})) ?? ("Child3")), true);
    this.__backing_count4 = STATE_MGMT_FACTORY.makeProvide<(string | undefined)>(this, "count4", "count4", ((({let gensym___4359740 = initializers;
    (((gensym___4359740) == (null)) ? undefined : gensym___4359740.count4)})) ?? ("Child4")), false);
    this.__backing_count5 = STATE_MGMT_FACTORY.makeProvide<(string | undefined)>(this, "count5", "count5", ((({let gensym___208755050 = initializers;
    (((gensym___208755050) == (null)) ? undefined : gensym___208755050.count5)})) ?? ("Child5")), true);
    this.__backing_count6 = STATE_MGMT_FACTORY.makeProvide<(string | undefined)>(this, "count6", "", ((({let gensym___37571585 = initializers;
    (((gensym___37571585) == (null)) ? undefined : gensym___37571585.count6)})) ?? ("Child6")), true);
    this.__backing_count7 = STATE_MGMT_FACTORY.makeProvide<(string | undefined)>(this, "count7", "", ((({let gensym___2162781 = initializers;
    (((gensym___2162781) == (null)) ? undefined : gensym___2162781.count7)})) ?? ("Child7")), false);
  }

  public __updateStruct(initializers: (__Options_Ancestors | undefined)): void {}

  private __backing_count?: IProvideDecoratedVariable<(string | undefined)>;

  public get count(): (string | undefined) {
    return this.__backing_count!.get();
  }

  public set count(value: (string | undefined)) {
    this.__backing_count!.set(value);
  }

  private __backing_count1?: IProvideDecoratedVariable<(string | undefined)>;

  public get count1(): (string | undefined) {
    return this.__backing_count1!.get();
  }

  public set count1(value: (string | undefined)) {
    this.__backing_count1!.set(value);
  }

  private __backing_count2?: IProvideDecoratedVariable<(string | undefined)>;

  public get count2(): (string | undefined) {
    return this.__backing_count2!.get();
  }

  public set count2(value: (string | undefined)) {
    this.__backing_count2!.set(value);
  }

  private __backing_count3?: IProvideDecoratedVariable<(string | undefined)>;

  public get count3(): (string | undefined) {
    return this.__backing_count3!.get();
  }

  public set count3(value: (string | undefined)) {
    this.__backing_count3!.set(value);
  }

  private __backing_count4?: IProvideDecoratedVariable<(string | undefined)>;

  public get count4(): (string | undefined) {
    return this.__backing_count4!.get();
  }

  public set count4(value: (string | undefined)) {
    this.__backing_count4!.set(value);
  }

  private __backing_count5?: IProvideDecoratedVariable<(string | undefined)>;

  public get count5(): (string | undefined) {
    return this.__backing_count5!.get();
  }

  public set count5(value: (string | undefined)) {
    this.__backing_count5!.set(value);
  }

  private __backing_count6?: IProvideDecoratedVariable<(string | undefined)>;

  public get count6(): (string | undefined) {
    return this.__backing_count6!.get();
  }

  public set count6(value: (string | undefined)) {
    this.__backing_count6!.set(value);
  }

  private __backing_count7?: IProvideDecoratedVariable<(string | undefined)>;

  public get count7(): (string | undefined) {
    return this.__backing_count7!.get();
  }

  public set count7(value: (string | undefined)) {
    this.__backing_count7!.set(value);
  }

  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: Ancestors)=> void), initializers: ((()=> __Options_Ancestors) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Ancestors, __Options_Ancestors>(style, ((): Ancestors => {
      return new Ancestors(false, ({let gensym___203542966 = storage;
      (((gensym___203542966) == (null)) ? undefined : gensym___203542966())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Ancestors, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): Ancestors {
    throw new Error("Declare interface");
  }

  @memo() public build() {}

  ${dumpConstructor()}

}

@Component() export interface __Options_Ancestors {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'count', '((string | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_count', '(IProvideDecoratedVariable<(string | undefined)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_count', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'count1', '((string | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_count1', '(IProvideDecoratedVariable<(string | undefined)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_count1', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'count2', '((string | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_count2', '(IProvideDecoratedVariable<(string | undefined)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_count2', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'count3', '((string | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_count3', '(IProvideDecoratedVariable<(string | undefined)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_count3', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'count4', '((string | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_count4', '(IProvideDecoratedVariable<(string | undefined)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_count4', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'count5', '((string | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_count5', '(IProvideDecoratedVariable<(string | undefined)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_count5', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'count6', '((string | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_count6', '(IProvideDecoratedVariable<(string | undefined)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_count6', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'count7', '((string | undefined) | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_count7', '(IProvideDecoratedVariable<(string | undefined)> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_count7', '(boolean | undefined)')}
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test different @Provide annotation usage transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
