/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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
import { PluginTester } from '../../../utils/plugin-tester';
import { mockBuildConfig } from '../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../utils/path-config';
import { parseDumpSrc } from '../../../utils/parse-string';
import { uiNoRecheck, recheck, memoNoRecheck, collectNoRecheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';
import { dumpConstructor } from '../../../utils/simplify-dump';

const WRAP_BUILDER_DIR_PATH: string = 'wrap-builder';
const IMPORT_UTILS_DIR_PATH: string = 'wrap-builder/utils';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, WRAP_BUILDER_DIR_PATH, 'make-builder-param-proxy.ets'),
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, IMPORT_UTILS_DIR_PATH, 'builder-type-decl.ets')
];

const pluginTester = new PluginTester('test makeBuilderParamProxy in @Builder function', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsed transform',
    parsed: uiTransform().parsed
};

const expectedUIScript: string = `

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { makeBuilderParameterProxy as makeBuilderParameterProxy } from "arkui.component.builder";

import { A as A_gensym___211207470 } from "entry/src/main/ets/pages/index";

import { IA as IA_gensym___120153601 } from "entry/src/main/ets/pages/index";

import { MemoSkip as MemoSkip } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Column as Column, Component as Component, Builder as Builder } from "@ohos.arkui.component";

import { A as A, IA as IA } from "./index";

function main() {}

@Builder() 
@Memo() 
function aBuilder(@MemoSkip() obj: IA): void {}


@Component() final struct TestBuilder extends CustomComponent<TestBuilder, __Options_TestBuilder> {
  public __initializeStruct(initializers: (__Options_TestBuilder | undefined), @Memo() content: ((()=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_TestBuilder | undefined)): void {}
  public resetStateVarsOnReuse(initializers: (__Options_TestBuilder | undefined)): void {}
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: TestBuilder)=> void) | undefined), initializers: ((()=> __Options_TestBuilder) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<TestBuilder, __Options_TestBuilder>(style, ((): TestBuilder => {
      return new TestBuilder(false, ({let gensym___17371929 = storage;
      (((gensym___17371929) == (null)) ? undefined : gensym___17371929())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_TestBuilder, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): TestBuilder {
    throw new Error("Declare interface");
  }
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      aBuilder(makeBuilderParameterProxy<IA_gensym___120153601>({
        fixedArray: [({
          aNumber: 1,
        } as A), ({
          aNumber: 2,
        } as A)],
      }, new Map<string, (()=> Any)>([["fixedArray", ((): Any => {
        return ([({
          aNumber: 1,
        } as A), ({
          aNumber: 2,
        } as A)] as [(A_gensym___211207470 | undefined), (A_gensym___211207470 | undefined)]);
      })]]), ((gensym___46528967: IA_gensym___120153601) => {})));
    }));
  }
  
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  
  static {
    
  }
}

@Component() interface __Options_TestBuilder {
  
}
`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

pluginTester.run(
    'test makeBuilderParamProxy in @Builder function',
    [parsedTransform, collectNoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
    },
    {
        stopAfter: 'checked',
    }
);
