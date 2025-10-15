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

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/link';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'link-to-link-propref-state.ets'),
];

const pluginTester = new PluginTester('test @Link decorated variables passing to other variables', buildConfig);

const parsedTransform: Plugins = {
    name: 'link-to-link-prop-state',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { IPropRefDecoratedVariable as IPropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.stateManagement.runtime";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { LinkSourceType as LinkSourceType } from "arkui.stateManagement.decorator";

import { ILinkDecoratedVariable as ILinkDecoratedVariable } from "arkui.stateManagement.decorator";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { TextInputAttribute as TextInputAttribute } from "arkui.component.textInput";

import { TextInputImpl as TextInputImpl } from "arkui.component.textInput";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { memo as memo } from "arkui.stateManagement.runtime";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Component as Component, Column as Column, TextInput as TextInput } from "@ohos.arkui.component";

import { Link as Link, State as State, PropRef as PropRef } from "@ohos.arkui.stateManagement";

function main() {}


@Component() final struct Parant extends CustomComponent<Parant, __Options_Parant> {
  public __initializeStruct(initializers: (__Options_Parant | undefined), @memo() content: ((()=> void) | undefined)): void {
    if (({let gensym___194626867 = initializers;
    (((gensym___194626867) == (null)) ? undefined : gensym___194626867.__options_has_text1)})) {
      this.__backing_text1 = STATE_MGMT_FACTORY.makeLink<string>(this, "text1", initializers!.__backing_text1!);
    };
  }

  public __updateStruct(initializers: (__Options_Parant | undefined)): void {}

  private __backing_text1?: ILinkDecoratedVariable<string>;

  public get text1(): string {
    return this.__backing_text1!.get();
  }

  public set text1(value: string) {
    this.__backing_text1!.set(value);
  }
  
  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: Parant)=> void), initializers: ((()=> __Options_Parant) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Parant, __Options_Parant>(style, ((): Parant => {
      return new Parant(false, ({let gensym___149025070 = storage;
      (((gensym___149025070) == (null)) ? undefined : gensym___149025070())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Parant, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): Parant {
    throw new Error("Declare interface");
  }

  @memo() public build() {
    ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @memo() (() => {
      TextInputImpl(@memo() ((instance: TextInputAttribute): void => {
        instance.setTextInputOptions({
          text: this.text1,
        }).applyAttributesFinish();
        return;
      }), undefined);
      Child._invoke(@memo() ((instance: Child): void => {
        instance.applyAttributesFinish();
        return;
      }), (() => {
        return {
          __backing_childText: this.__backing_text1,
          __options_has_childText: true,
          childText2: this.text1,
          __options_has_childText2: true,
          childText3: this.text1,
          __options_has_childText3: true,
          childText4: this.text1,
          __options_has_childText4: true,
        };
      }), undefined, undefined, undefined);
    }));
  }
  
  constructor(useSharedStorage: (boolean | undefined)) {
    this(useSharedStorage, undefined);
  }
  
  constructor() {
    this(undefined, undefined);
  }
  
  public constructor(useSharedStorage: (boolean | undefined), storage: (LocalStorage | undefined)) {
    super(useSharedStorage, storage);
  }

}

@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @memo() content: ((()=> void) | undefined)): void {
    if (({let gensym___55490166 = initializers;
    (((gensym___55490166) == (null)) ? undefined : gensym___55490166.__options_has_childText)})) {
      this.__backing_childText = STATE_MGMT_FACTORY.makeLink<string>(this, "childText", initializers!.__backing_childText!);
    };
    this.__backing_childText2 = STATE_MGMT_FACTORY.makeState<string>(this, "childText2", ((({let gensym___95513066 = initializers;
    (((gensym___95513066) == (null)) ? undefined : gensym___95513066.childText2)})) ?? ("sss")));
    this.__backing_childText3 = STATE_MGMT_FACTORY.makePropRef<string>(this, "childText3", (initializers!.childText3 as string));
    this.__backing_childText4 = STATE_MGMT_FACTORY.makePropRef<string>(this, "childText4", ((({let gensym___162028107 = initializers;
    (((gensym___162028107) == (null)) ? undefined : gensym___162028107.childText4)})) ?? ("cc")));
  }

  public __updateStruct(initializers: (__Options_Child | undefined)): void {
    if (({let gensym___240121011 = initializers;
    (((gensym___240121011) == (null)) ? undefined : gensym___240121011.__options_has_childText3)})) {
      this.__backing_childText3!.update((initializers!.childText3 as string));
    }
    if (({let gensym___107610221 = initializers;
    (((gensym___107610221) == (null)) ? undefined : gensym___107610221.__options_has_childText4)})) {
      this.__backing_childText4!.update((initializers!.childText4 as string));
    }
  }

  private __backing_childText?: ILinkDecoratedVariable<string>;

  public get childText(): string {
    return this.__backing_childText!.get();
  }

  public set childText(value: string) {
    this.__backing_childText!.set(value);
  }

  private __backing_childText2?: IStateDecoratedVariable<string>;

  public get childText2(): string {
    return this.__backing_childText2!.get();
  }

  public set childText2(value: string) {
    this.__backing_childText2!.set(value);
  }
  
  private __backing_childText3?: IPropRefDecoratedVariable<string>;
  
  public get childText3(): string {
    return this.__backing_childText3!.get();
  }

  public set childText3(value: string) {
    this.__backing_childText3!.set(value);
  }
  
  private __backing_childText4?: IPropRefDecoratedVariable<string>;
  
  public get childText4(): string {
    return this.__backing_childText4!.get();
  }

  public set childText4(value: string) {
    this.__backing_childText4!.set(value);
  }
  
  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: Child)=> void), initializers: ((()=> __Options_Child) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Child, __Options_Child>(style, ((): Child => {
      return new Child(false, ({let gensym___29142858 = storage;
      (((gensym___29142858) == (null)) ? undefined : gensym___29142858())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_Child, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): Child {
    throw new Error("Declare interface");
  }

  @memo() public build() {
    TextInputImpl(@memo() ((instance: TextInputAttribute): void => {
      instance.setTextInputOptions({
        text: this.childText,
      }).applyAttributesFinish();
      return;
    }), undefined);
  }

  constructor(useSharedStorage: (boolean | undefined)) {
    this(useSharedStorage, undefined);
  }

  constructor() {
    this(undefined, undefined);
  }

  public constructor(useSharedStorage: (boolean | undefined), storage: (LocalStorage | undefined)) {
    super(useSharedStorage, storage);
  }

}

@Retention({policy:"SOURCE"}) @interface __Link_intrinsic {}

@Component() export interface __Options_Parant {
  @__Link_intrinsic() set text1(text1: (string | undefined))

  @__Link_intrinsic() get text1(): (string | undefined)
  set __backing_text1(__backing_text1: (LinkSourceType<string> | undefined))

  get __backing_text1(): (LinkSourceType<string> | undefined)
  set __options_has_text1(__options_has_text1: (boolean | undefined))
  
  get __options_has_text1(): (boolean | undefined)
  
}

@Component() export interface __Options_Child {
  @__Link_intrinsic() set childText(childText: (string | undefined))

  @__Link_intrinsic() get childText(): (string | undefined)
  set __backing_childText(__backing_childText: (LinkSourceType<string> | undefined))

  get __backing_childText(): (LinkSourceType<string> | undefined)
  set __options_has_childText(__options_has_childText: (boolean | undefined))
  
  get __options_has_childText(): (boolean | undefined)
  set childText2(childText2: (string | undefined))

  get childText2(): (string | undefined)
  set __backing_childText2(__backing_childText2: (IStateDecoratedVariable<string> | undefined))

  get __backing_childText2(): (IStateDecoratedVariable<string> | undefined)
  set __options_has_childText2(__options_has_childText2: (boolean | undefined))
  
  get __options_has_childText2(): (boolean | undefined)
  set childText3(childText3: (string | undefined))

  get childText3(): (string | undefined)
  set __backing_childText3(__backing_childText3: (IPropRefDecoratedVariable<string> | undefined))
  
  get __backing_childText3(): (IPropRefDecoratedVariable<string> | undefined)
  set __options_has_childText3(__options_has_childText3: (boolean | undefined))
  
  get __options_has_childText3(): (boolean | undefined)
  set childText4(childText4: (string | undefined))

  get childText4(): (string | undefined)
  set __backing_childText4(__backing_childText4: (IPropRefDecoratedVariable<string> | undefined))
  
  get __backing_childText4(): (IPropRefDecoratedVariable<string> | undefined)
  set __options_has_childText4(__options_has_childText4: (boolean | undefined))
  
  get __options_has_childText4(): (boolean | undefined)
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @Link decorated variables passing to other variables',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
