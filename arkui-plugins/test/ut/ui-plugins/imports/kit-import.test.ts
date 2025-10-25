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
import { PluginTester } from '../../../utils/plugin-tester';
import { mockBuildConfig } from '../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../utils/path-config';
import { parseDumpSrc } from '../../../utils/parse-string';
import { recheck, uiNoRecheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, ignoreNewLines, dumpConstructor } from '../../../utils/simplify-dump';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const IMPORT_DIR_PATH: string = 'imports';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, IMPORT_DIR_PATH, 'kit-import.ets'),
];

const importParsed: Plugins = {
    name: 'import-parsed',
    parsed: uiTransform().parsed,
};

const pluginTester = new PluginTester('test import transform', buildConfig);

const expectedParsedScript: string = `

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { PropRef as PropRef, Column as Column, Entry as Entry } from "@kit.ArkUI";

import { Text as Text, Component as Component, ClickEvent as ClickEvent } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement";

import { Button as Button } from "arkui.component.button";

import hilog from "@ohos.hilog";

@Entry() @Component() final struct A extends CustomComponent<A, __Options_A> implements PageLifeCycle {
  @ComponentBuilder() public static $_invoke(initializers?: __Options_A, storage?: LocalStorage, @Builder() content?: (()=> void)): A {
    throw new Error("Declare interface");
  }

  @State() public a: string = "str";
  
  @PropRef() public b!: string;
  
  public build() {
    Column(){
      Button("button").onClick(((e: ClickEvent) => {}));
      Text("text").fontSize(20);
    };
  }

  public constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }

}

@Entry() @Component() export interface __Options_A {
  ${ignoreNewLines(`
  a?: string;
  @State() __backing_a?: string;
  __options_has_a?: boolean;
  b?: string;
  @PropRef() __backing_b?: string;
  __options_has_b?: boolean;
  `)}
  
}

class __EntryWrapper extends EntryPoint {
  public entry(): void {
    A();
  }

  public constructor() {}

}
__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../imports/kit-import",
  pageFullPath: "test/demo/mock/imports/kit-import",
  integratedHsp: "false",
  } as NavInterface))
`;

const expectedCheckedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.stateManagement.runtime";

import { IPropRefDecoratedVariable as IPropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { ButtonAttribute as ButtonAttribute } from "arkui.component.button";

import { ButtonImpl as ButtonImpl } from "arkui.component.button";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { memo as memo } from "arkui.stateManagement.runtime";

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { PropRef as PropRef, Column as Column, Entry as Entry } from "@kit.ArkUI";

import { Text as Text, Component as Component, ClickEvent as ClickEvent } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement";

import { Button as Button } from "arkui.component.button";

import hilog from "@ohos.hilog";

function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../imports/kit-import",
  pageFullPath: "test/demo/mock/imports/kit-import",
  integratedHsp: "false",
  } as NavInterface));

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() final struct A extends CustomComponent<A, __Options_A> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_A | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_a = STATE_MGMT_FACTORY.makeState<string>(this, "a", ((({let gensym___94024326 = initializers;
    (((gensym___94024326) == (null)) ? undefined : gensym___94024326.a)})) ?? ("str")));
    this.__backing_b = STATE_MGMT_FACTORY.makePropRef<string>(this, "b", (initializers!.b as string));
  }

  public __updateStruct(initializers: (__Options_A | undefined)): void {
    if (({let gensym___146630597 = initializers;
    (((gensym___146630597) == (null)) ? undefined : gensym___146630597.__options_has_b)})) {
      this.__backing_b!.update((initializers!.b as string));
    }
  }

  private __backing_a?: IStateDecoratedVariable<string>;

  public get a(): string {
    return this.__backing_a!.get();
  }

  public set a(value: string) {
    this.__backing_a!.set(value);
  }
  
  private __backing_b?: IPropRefDecoratedVariable<string>;
  
  public get b(): string {
    return this.__backing_b!.get();
  }

  public set b(value: string) {
    this.__backing_b!.set(value);
  }

  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: A)=> void), initializers: ((()=> __Options_A) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<A, __Options_A>(style, ((): A => {
      return new A(false, ({let gensym___17371929 = storage;
      (((gensym___17371929) == (null)) ? undefined : gensym___17371929())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_A, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): A {
    throw new Error("Declare interface");
  }
  
  @memo() public build() {
    ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @memo() (() => {
      ButtonImpl(@memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("button", undefined).onClick(((e: ClickEvent) => {})).applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@memo() ((instance: TextAttribute): void => {
        instance.setTextOptions("text", undefined).fontSize(20).applyAttributesFinish();
        return;
      }), undefined);
    }));
  }
  
  ${dumpConstructor()}

}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() export interface __Options_A {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'a', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_a', '(IStateDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_a', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'b', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_b', '(IPropRefDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_b', '(boolean | undefined)')}
  
}

class __EntryWrapper extends EntryPoint {
  @memo() public entry(): void {
    A._invoke(@memo() ((instance: A): void => {
      instance.applyAttributesFinish();
      return;
    }), undefined, undefined, undefined, undefined);
  }

  public constructor() {}

}
`;

function testImportParsed(this: PluginTestContext): void {
    expect(parseDumpSrc(this?.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedParsedScript));
}

function testImportChecked(this: PluginTestContext): void {
    expect(parseDumpSrc(this?.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test imports from different sources',
    [importParsed, uiNoRecheck, recheck],
    {
        parsed: [testImportParsed],
        'checked:ui-no-recheck': [testImportChecked],
    },
    {
        stopAfter: 'checked',
    }
);
