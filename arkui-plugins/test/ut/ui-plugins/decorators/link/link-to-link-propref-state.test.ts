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
import { beforeUINoRecheck, recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { GetSetDumper, dumpGetterSetter, dumpAnnotation, dumpConstructor } from '../../../../utils/simplify-dump';
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

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { LinkSourceType as LinkSourceType } from "arkui.stateManagement.decorator";

import { ILinkDecoratedVariable as ILinkDecoratedVariable } from "arkui.stateManagement.decorator";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { TextInputAttribute as TextInputAttribute } from "arkui.component.textInput";

import { TextInputImpl as TextInputImpl } from "arkui.component.textInput";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component, Column as Column, TextInput as TextInput } from "@ohos.arkui.component";

import { Link as Link, State as State, PropRef as PropRef } from "@ohos.arkui.stateManagement";

function main() {}


@Component() final struct Parant extends CustomComponent<Parant, __Options_Parant> {
  public __initializeStruct(initializers: (__Options_Parant | undefined), @Memo() content: ((()=> void) | undefined)): void {
    if (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_text1)})) {
      this.__backing_text1 = STATE_MGMT_FACTORY.makeLink<string>(this, "text1", initializers!.__backing_text1!);
    };
    }
  public __updateStruct(initializers: (__Options_Parant | undefined)): void {}
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: Parant)=> void) | undefined), initializers: ((()=> __Options_Parant) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Parant, __Options_Parant>(style, ((): Parant => {
      return new Parant(false, ({let gensym___<some_random_number> = storage;
      (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>())}));
      }), initializers, reuseId, content);
    }
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Parant, storage?: LocalStorage, @Builder() content?: (()=> void)): Parant {
    throw new Error("Declare interface");
    }
  private __backing_text1?: ILinkDecoratedVariable<string>;
  public get text1(): string {
    return this.__backing_text1!.get();
    }
  public set text1(value: string) {
    this.__backing_text1!.set(value);
    }

  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
      }), @Memo() (() => {
      TextInputImpl(@Memo() ((instance: TextInputAttribute): void => {
        instance.setTextInputOptions({
          text: this.text1,
          });
        instance.applyAttributesFinish();
        return;
        }));
      Child._invoke(undefined, (() => {
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
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
    }
  static {
    }
  }

@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @Memo() content: ((()=> void) | undefined)): void {
    if (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_childText)})) {
      this.__backing_childText = STATE_MGMT_FACTORY.makeLink<string>(this, "childText", initializers!.__backing_childText!);
      };
    this.__backing_childText2 = STATE_MGMT_FACTORY.makeState<string>(this, "childText2", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.childText2)})) ?? ("sss")));
    this.__backing_childText3 = STATE_MGMT_FACTORY.makePropRef<string>(this, "childText3", (initializers!.childText3 as string));
    this.__backing_childText4 = STATE_MGMT_FACTORY.makePropRef<string>(this, "childText4", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.childText4)})) ?? ("cc")));
    }
  public __updateStruct(initializers: (__Options_Child | undefined)): void {
    if (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_childText3)})) {
      this.__backing_childText3!.update((initializers!.childText3 as string));
      }
    if (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_childText4)})) {
      this.__backing_childText4!.update((initializers!.childText4 as string));
      }
    }
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: Child)=> void) | undefined), initializers: ((()=> __Options_Child) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<Child, __Options_Child>(style, ((): Child => {
      return new Child(false, ({let gensym___<some_random_number> = storage;
      (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>())}));
      }), initializers, reuseId, content);
    }
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Child, storage?: LocalStorage, @Builder() content?: (()=> void)): Child {
    throw new Error("Declare interface");
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

  @Memo() 
  public build() {
    TextInputImpl(@Memo() ((instance: TextInputAttribute): void => {
      instance.setTextInputOptions({
        text: this.childText,
        });
      instance.applyAttributesFinish();
      return;
      }));
    }
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
    }
  static {
    }
  }

@Component() export interface __Options_Parant {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'text1', '(string | undefined)', [dumpAnnotation('Link')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_text1', '(LinkSourceType<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_text1', '(boolean | undefined)')}
  }

@Component() export interface __Options_Child {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'childText', '(string | undefined)', [dumpAnnotation('Link')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_childText', '(LinkSourceType<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_childText', '(boolean | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, 'childText2', '(string | undefined)', [dumpAnnotation('State')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_childText2', '(IStateDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_childText2', '(boolean | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, 'childText3', '(string | undefined)', [dumpAnnotation('PropRef')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_childText3', '(IPropRefDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_childText3', '(boolean | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, 'childText4', '(string | undefined)', [dumpAnnotation('PropRef')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_childText4', '(IPropRefDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_childText4', '(boolean | undefined)')}
  }
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @Link decorated variables passing to other variables',
    [parsedTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
