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
import { __memo_id_type as __memo_id_type } from "arkui.stateManagement.runtime";
import { __memo_context_type as __memo_context_type } from "arkui.stateManagement.runtime";
import { memo as memo } from "arkui.stateManagement.runtime";
import { ProvideDecoratedVariable as ProvideDecoratedVariable } from "@ohos.arkui.stateManagement";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Component as Component } from "@ohos.arkui.component";
import { Provide as Provide } from "@ohos.arkui.stateManagement";

function main() {}

@Component({freezeWhenInactive:false}) final class Ancestors extends CustomComponent<Ancestors, __Options_Ancestors> {
  public __initializeStruct(initializers: __Options_Ancestors | undefined, @memo() content: (()=> void) | undefined): void {
    this.__backing_count = this.addProvidedVar<string | undefined>("count", "count", ((({let gensym___58710805 = initializers;
    (((gensym___58710805) == (null)) ? undefined : gensym___58710805.count)})) ?? ("Child0")), false);
    this.__backing_count1 = this.addProvidedVar<string | undefined>("count1", "prov1", ((({let gensym___84874570 = initializers;
    (((gensym___84874570) == (null)) ? undefined : gensym___84874570.count1)})) ?? ("Child1")), false);
    this.__backing_count2 = this.addProvidedVar<string | undefined>("count2", "prov2", ((({let gensym___124037738 = initializers;
    (((gensym___124037738) == (null)) ? undefined : gensym___124037738.count2)})) ?? ("Child2")), false);
    this.__backing_count3 = this.addProvidedVar<string | undefined>("count3", "prov3", ((({let gensym___199202238 = initializers;
    (((gensym___199202238) == (null)) ? undefined : gensym___199202238.count3)})) ?? ("Child3")), true);
    this.__backing_count4 = this.addProvidedVar<string | undefined>("count4", "count4", ((({let gensym___4359740 = initializers;
    (((gensym___4359740) == (null)) ? undefined : gensym___4359740.count4)})) ?? ("Child4")), false);
    this.__backing_count5 = this.addProvidedVar<string | undefined>("count5", "count5", ((({let gensym___208755050 = initializers;
    (((gensym___208755050) == (null)) ? undefined : gensym___208755050.count5)})) ?? ("Child5")), true);
    this.__backing_count6 = this.addProvidedVar<string | undefined>("count6", "", ((({let gensym___37571585 = initializers;
    (((gensym___37571585) == (null)) ? undefined : gensym___37571585.count6)})) ?? ("Child6")), true);
    this.__backing_count7 = this.addProvidedVar<string | undefined>("count7", "", ((({let gensym___2162781 = initializers;
    (((gensym___2162781) == (null)) ? undefined : gensym___2162781.count7)})) ?? ("Child7")), false);
  }
  public __updateStruct(initializers: __Options_Ancestors | undefined): void {}
  private __backing_count?: ProvideDecoratedVariable<string | undefined>;
  public get count(): string | undefined {
    return this.__backing_count!.get();
  }
  public set count(value: string | undefined) {
    this.__backing_count!.set(value);
  }
  private __backing_count1?: ProvideDecoratedVariable<string | undefined>;
  public get count1(): string | undefined {
    return this.__backing_count1!.get();
  }
  public set count1(value: string | undefined) {
    this.__backing_count1!.set(value);
  }
  private __backing_count2?: ProvideDecoratedVariable<string | undefined>;
  public get count2(): string | undefined {
    return this.__backing_count2!.get();
  }
  public set count2(value: string | undefined) {
    this.__backing_count2!.set(value);
  }
  private __backing_count3?: ProvideDecoratedVariable<string | undefined>;
  public get count3(): string | undefined {
    return this.__backing_count3!.get();
  }
  public set count3(value: string | undefined) {
    this.__backing_count3!.set(value);
  }
  private __backing_count4?: ProvideDecoratedVariable<string | undefined>;
  public get count4(): string | undefined {
    return this.__backing_count4!.get();
  }
  public set count4(value: string | undefined) {
    this.__backing_count4!.set(value);
  }
  private __backing_count5?: ProvideDecoratedVariable<string | undefined>;
  public get count5(): string | undefined {
    return this.__backing_count5!.get();
  }
  public set count5(value: string | undefined) {
    this.__backing_count5!.set(value);
  }
  private __backing_count6?: ProvideDecoratedVariable<string | undefined>;
  public get count6(): string | undefined {
    return this.__backing_count6!.get();
  }
  public set count6(value: string | undefined) {
    this.__backing_count6!.set(value);
  }
  private __backing_count7?: ProvideDecoratedVariable<string | undefined>;
  public get count7(): string | undefined {
    return this.__backing_count7!.get();
  }
  public set count7(value: string | undefined) {
    this.__backing_count7!.set(value);
  }
  @memo() public _build(@memo() style: ((instance: Ancestors)=> Ancestors) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_Ancestors | undefined): void {}
  public constructor() {}
}

interface __Options_Ancestors {
  set count(count: string | undefined | undefined)
  get count(): string | undefined | undefined
  set __backing_count(__backing_count: ProvideDecoratedVariable<string | undefined> | undefined)
  get __backing_count(): ProvideDecoratedVariable<string | undefined> | undefined
  set count1(count1: string | undefined | undefined)
  get count1(): string | undefined | undefined
  set __backing_count1(__backing_count1: ProvideDecoratedVariable<string | undefined> | undefined)
  get __backing_count1(): ProvideDecoratedVariable<string | undefined> | undefined
  set count2(count2: string | undefined | undefined)
  get count2(): string | undefined | undefined
  set __backing_count2(__backing_count2: ProvideDecoratedVariable<string | undefined> | undefined)
  get __backing_count2(): ProvideDecoratedVariable<string | undefined> | undefined
  set count3(count3: string | undefined | undefined)
  get count3(): string | undefined | undefined
  set __backing_count3(__backing_count3: ProvideDecoratedVariable<string | undefined> | undefined)
  get __backing_count3(): ProvideDecoratedVariable<string | undefined> | undefined
  set count4(count4: string | undefined | undefined)
  get count4(): string | undefined | undefined
  set __backing_count4(__backing_count4: ProvideDecoratedVariable<string | undefined> | undefined)
  get __backing_count4(): ProvideDecoratedVariable<string | undefined> | undefined
  set count5(count5: string | undefined | undefined)
  get count5(): string | undefined | undefined
  set __backing_count5(__backing_count5: ProvideDecoratedVariable<string | undefined> | undefined)
  get __backing_count5(): ProvideDecoratedVariable<string | undefined> | undefined
  set count6(count6: string | undefined | undefined)
  get count6(): string | undefined | undefined
  set __backing_count6(__backing_count6: ProvideDecoratedVariable<string | undefined> | undefined)
  get __backing_count6(): ProvideDecoratedVariable<string | undefined> | undefined
  set count7(count7: string | undefined | undefined)
  get count7(): string | undefined | undefined
  set __backing_count7(__backing_count7: ProvideDecoratedVariable<string | undefined> | undefined)
  get __backing_count7(): ProvideDecoratedVariable<string | undefined> | undefined
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test different @Provide annotation usage transformation',
    [parsedTransform, structNoRecheck],
    {
        checked: [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
