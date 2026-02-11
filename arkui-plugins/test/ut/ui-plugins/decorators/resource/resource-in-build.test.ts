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

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/resource';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'resource-in-build.ets'),
];

const pluginTester = new PluginTester('test resource transform in build method', buildConfig);

const parsedTransform: Plugins = {
    name: 'resource-in-build',
    parsed: uiTransform().parsed,
};

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { _rawfile as _rawfile } from "arkui.component.resources";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ImageAnimatorAttribute as ImageAnimatorAttribute } from "arkui.component.imageAnimator";

import { ImageAnimatorImpl as ImageAnimatorImpl } from "arkui.component.imageAnimator";

import { SelectAttribute as SelectAttribute } from "arkui.component.select";

import { SelectImpl as SelectImpl } from "arkui.component.select";

import { TextInputAttribute as TextInputAttribute } from "arkui.component.textInput";

import { TextInputImpl as TextInputImpl } from "arkui.component.textInput";

import { ImageAttribute as ImageAttribute } from "arkui.component.image";

import { ImageImpl as ImageImpl } from "arkui.component.image";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { _r as _r } from "arkui.component.resources";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component, $r as $r, $rawfile as $rawfile, Column as Column, Text as Text, Image as Image, TextInput as TextInput, Select as Select, SelectOption as SelectOption, Margin as Margin, ImageAnimator as ImageAnimator, Resource as Resource } from "@ohos.arkui.component";

function main() {}

@Component() final struct ResourceComponent extends CustomComponent<ResourceComponent, __Options_ResourceComponent> {
  public __initializeStruct(initializers: (__Options_ResourceComponent | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_str1 = ((({let gensym___147578113 = initializers;
    (((gensym___147578113) == (null)) ? undefined : gensym___147578113.str1)})) ?? ("app.media.ri"));
    this.__backing_str2 = ((({let gensym___220149772 = initializers;
    (((gensym___220149772) == (null)) ? undefined : gensym___220149772.str2)})) ?? ("app.photo2.png"));
    this.__backing_numbers = ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.numbers)})) ?? (["0", "1", "3", "5", "8"]));
  }

  public __updateStruct(initializers: (__Options_ResourceComponent | undefined)): void {}

  private __backing_str1?: string;

  public get str1(): string {
    return (this.__backing_str1 as string);
  }

  public set str1(value: string) {
    this.__backing_str1 = value;
  }

  private __backing_str2?: string;

  public get str2(): string {
    return (this.__backing_str2 as string);
  }

  public set str2(value: string) {
    this.__backing_str2 = value;
  }
  private __backing_numbers?: Array<string>;

  public get numbers(): Array<string> {
    return (this.__backing_numbers as Array<string>);
  }

  public set numbers(value: Array<string>) {
    this.__backing_numbers = value;
  }

  @MemoIntrinsic() 
  public static _invoke(style: @Memo() ((instance: ResourceComponent)=> void), initializers: ((()=> __Options_ResourceComponent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<ResourceComponent, __Options_ResourceComponent>(style, ((): ResourceComponent => {
      return new ResourceComponent(false, ({let gensym___17371929 = storage;
      (((gensym___17371929) == (null)) ? undefined : gensym___17371929())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ResourceComponent, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): ResourceComponent {
    throw new Error("Declare interface");
  }
  public async test_0(res: Resource) {
    return res;
  }

  public aboutToAppear() {
    let arr: Array<Resource> = new Array<Resource>();
    for (let i = 0;((i) < (5));(i++)) {
      arr.push(_r(16777216, 10003, "com.example.mock", "entry"));
    }
    for (let item of this.numbers) {
      arr.push(_r(16777216, 10003, "com.example.mock", "entry"));
    }
    waitForCompletion((async (): Promise<void> => {
      const a2 = await this.test_0(_r(16777216, 10003, "com.example.mock", "entry"));
    }));
  }
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(_r(16777216, 10003, "com.example.mock", "entry"), undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      ImageImpl(@Memo() ((instance: ImageAttribute): void => {
        instance.setImageOptions(_rawfile(0, 30000, "com.example.mock", "entry", "app.mock.txt"), undefined);
        instance.applyAttributesFinish();
        return;
      }));
      TextInputImpl(@Memo() ((instance: TextInputAttribute): void => {
        instance.setTextInputOptions({
          text: _r(16777220, 10003, "com.example.mock", "entry"),
        });
        instance.applyAttributesFinish();
        return;
      }));
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(_r(-1, -1, "com.example.mock", "entry", this.str1), undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(_r(-1, -1, "com.example.mock", "entry", this.str2), undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      SelectImpl(@Memo() ((instance: SelectAttribute): void => {
        instance.setSelectOptions(new Array<SelectOption>({
          value: "aaa",
          icon: _r(16777223, 20000, "com.example.mock", "entry"),
        }, {
          value: "bbb",
          icon: _r(16777223, 20000, "com.example.mock", "entry"),
        }, {
          value: "ccc",
          icon: _r(16777223, 20000, "com.example.mock", "entry"),
        }, {
          value: "ddd",
          icon: _r(16777223, 20000, "com.example.mock", "entry"),
        }));
        instance.applyAttributesFinish();
        return;
      }), undefined);
      ImageImpl(@Memo() ((instance: ImageAttribute): void => {
        instance.setImageOptions(_r(16777217, 20000, "com.example.mock", "entry"), undefined).margin(({
          top: _r(16777222, 10002, "com.example.mock", "entry"),
          bottom: _r(16777222, 10002, "com.example.mock", "entry"),
        } as Margin));
        instance.applyAttributesFinish();
        return;
      }));
      ImageAnimatorImpl(@Memo() ((instance: ImageAnimatorAttribute): void => {
        instance.setImageAnimatorOptions().images([{
          src: _r(16777217, 20000, "com.example.mock", "entry"),
        }, {
          src: _r(16777225, 20000, "com.example.mock", "entry"),
        }]);
        instance.applyAttributesFinish();
        return;
      }));
    }));
  }

  ${dumpConstructor()}

}

@Component() export interface __Options_ResourceComponent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'str1', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_str1', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'str2', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_str2', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'numbers', '(Array<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_numbers', '(boolean | undefined)')}
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test resource transform in build method',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
