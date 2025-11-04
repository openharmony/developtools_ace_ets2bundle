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
import { recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';
import { dumpConstructor } from '../../../../utils/simplify-dump';

const FUNCTION_DIR_PATH: string = 'decorators/builder';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, FUNCTION_DIR_PATH, 'global-builder.ets')];

const pluginTester = new PluginTester('test global builder', buildConfig);

const parsedTransform: Plugins = {
    name: 'global-builder',
    parsed: uiTransform().parsed,
};

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { makeBuilderParameterProxy as makeBuilderParameterProxy } from "arkui.component.builder";

import { MemoSkip as MemoSkip } from "arkui.incremental.annotation";

import { RowAttribute as RowAttribute } from "arkui.component.row";

import { RowImpl as RowImpl } from "arkui.component.row";

import { Memo as Memo } from "arkui.incremental.annotation";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component, Row as Row, Builder as Builder, Text as Text } from "@ohos.arkui.component";

function main() {}


@Memo() function showTextBuilder() {
  TextImpl(@Memo() ((instance: TextAttribute): void => {
    instance.setTextOptions("Hello World", undefined).applyAttributesFinish();
    return;
  }), undefined);
}

@Memo() function overBuilder(@MemoSkip() params: Tmp) {
  RowImpl(@Memo() ((instance: RowAttribute): void => {
    instance.setRowOptions(undefined).applyAttributesFinish();
    return;
  }), @Memo() (() => {
    TextImpl(@Memo() ((instance: TextAttribute): void => {
      instance.setTextOptions((("UseStateVarByReference: ") + (params.paramA1)), undefined).applyAttributesFinish();
      return;
    }), undefined);
  }));
}

@Memo() function globalBuilder(@MemoSkip() param: Person) {
  TextImpl(@Memo() ((instance: TextAttribute): void => {
    instance.setTextOptions("globalBuilder", undefined).applyAttributesFinish();
    return;
  }), undefined);
}

class Tmp {
  public paramA1: string = "";
  public constructor() {}
}

interface Person {
  get age(): (number | undefined)
  set age(age: (number | undefined))
  
}

@Component() final struct BuilderDemo extends CustomComponent<BuilderDemo, __Options_BuilderDemo> {
  public __initializeStruct(initializers: (__Options_BuilderDemo | undefined), @Memo() content: ((()=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_BuilderDemo | undefined)): void {}
  
  @MemoIntrinsic() public static _invoke(style: @Memo() ((instance: BuilderDemo)=> void), initializers: ((()=> __Options_BuilderDemo) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<BuilderDemo, __Options_BuilderDemo>(style, ((): BuilderDemo => {
      return new BuilderDemo(false, ({let gensym___149025070 = storage;
      (((gensym___149025070) == (null)) ? undefined : gensym___149025070())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_BuilderDemo, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): BuilderDemo {
    throw new Error("Declare interface");
  }
  
  @Memo() public build() {
    RowImpl(@Memo() ((instance: RowAttribute): void => {
      instance.setRowOptions(undefined).applyAttributesFinish();
      return;
    }), @Memo() (() => {
      showTextBuilder();
      overBuilder(makeBuilderParameterProxy<Tmp>({}, new Map<string, (()=> Any)>([["paramA1", ((): Any => {
        return "Hello";
      })]]), ((gensym___203542966: Tmp) => {
        gensym___203542966.paramA1 = "Hello";
      })));
      globalBuilder(makeBuilderParameterProxy<Person>({
        age: 18,
      }, new Map<string, (()=> Any)>([["age", ((): Any => {
        return 18;
      })]]), ((gensym___149025070: Person) => {})));
      globalBuilder(makeBuilderParameterProxy<Person>({}, new Map<string, (()=> Any)>(), ((gensym___46528967: Person) => {})));
    }));
  }
  
  ${dumpConstructor()}
  
}

@Component() export interface __Options_BuilderDemo {
  
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'global builder',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
