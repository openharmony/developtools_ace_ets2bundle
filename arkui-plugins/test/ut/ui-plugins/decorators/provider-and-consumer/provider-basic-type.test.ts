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
import { dumpAnnotation, dumpGetterSetter, GetSetDumper } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const STATE_DIR_PATH: string = 'decorators/provider-and-consumer';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'provider-basic-type.ets'),
];

const pluginTester = new PluginTester('test basic type @Provider decorated variables transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedCheckedScript: string = `
import { Memo as Memo } from "arkui.incremental.annotation";

import { IProviderDecoratedVariable as IProviderDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { ComponentV2 as ComponentV2 } from "@ohos.arkui.component";

import { Provider as Provider } from "@ohos.arkui.stateManagement";

function main() {}



@ComponentV2() final struct Parent extends CustomComponentV2<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_providerVar1 = STATE_MGMT_FACTORY.makeProvider<string>(this, "providerVar1", "providerVar1", "propVar1");
    this.__backing_providerVar2 = STATE_MGMT_FACTORY.makeProvider<number>(this, "providerVar2", "providerVar2", 50);
    this.__backing_providerVar3 = STATE_MGMT_FACTORY.makeProvider<boolean>(this, "providerVar3", "providerVar3", true);
    this.__backing_providerVar4 = STATE_MGMT_FACTORY.makeProvider<undefined>(this, "providerVar4", "providerVar4", undefined);
    this.__backing_providerVar5 = STATE_MGMT_FACTORY.makeProvider<null>(this, "providerVar5", "providerVar5", null);
  }
  
  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}
  
  private __backing_providerVar1?: IProviderDecoratedVariable<string>;
  
  public get providerVar1(): string {
    return this.__backing_providerVar1!.get();
  }
  
  public set providerVar1(value: string) {
    this.__backing_providerVar1!.set(value);
  }
  
  private __backing_providerVar2?: IProviderDecoratedVariable<number>;
  
  public get providerVar2(): number {
    return this.__backing_providerVar2!.get();
  }
  
  public set providerVar2(value: number) {
    this.__backing_providerVar2!.set(value);
  }
  
  private __backing_providerVar3?: IProviderDecoratedVariable<boolean>;
  
  public get providerVar3(): boolean {
    return this.__backing_providerVar3!.get();
  }
  
  public set providerVar3(value: boolean) {
    this.__backing_providerVar3!.set(value);
  }
  
  private __backing_providerVar4?: IProviderDecoratedVariable<undefined>;
  
  public get providerVar4(): undefined {
    return this.__backing_providerVar4!.get();
  }
  
  public set providerVar4(value: undefined) {
    this.__backing_providerVar4!.set(value);
  }
  
  private __backing_providerVar5?: IProviderDecoratedVariable<null>;
  
  public get providerVar5(): null {
    return this.__backing_providerVar5!.get();
  }
  
  public set providerVar5(value: null) {
    this.__backing_providerVar5!.set(value);
  }
  
  @Memo() public build() {}
  
  public constructor() {}

  static {
  
  }
}

@ComponentV2() export interface __Options_Parent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'providerVar1', '(string | undefined)', [dumpAnnotation('Provider', { alias: "" })])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_providerVar1', '(IProviderDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_providerVar1', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'providerVar2', '(number | undefined)', [dumpAnnotation('Provider', { alias: "" })])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_providerVar2', '(IProviderDecoratedVariable<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_providerVar2', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'providerVar3', '(boolean | undefined)', [dumpAnnotation('Provider', { alias: "" })])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_providerVar3', '(IProviderDecoratedVariable<boolean> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_providerVar3', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'providerVar4', '(undefined | undefined)', [dumpAnnotation('Provider', { alias: "" })])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_providerVar4', '(IProviderDecoratedVariable<undefined> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_providerVar4', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'providerVar5', '(null | undefined)', [dumpAnnotation('Provider', { alias: "" })])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_providerVar5', '(IProviderDecoratedVariable<null> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_providerVar5', '(boolean | undefined)')}
  
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test basic type @Provider decorated variables transformation',
    [parsedTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
