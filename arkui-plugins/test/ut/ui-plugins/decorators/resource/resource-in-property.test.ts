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
import { dumpGetterSetter, GetSetDumper } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/resource';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'resource-in-property.ets'),
];

const pluginTester = new PluginTester('test resource transform in property', buildConfig);

const parsedTransform: Plugins = {
    name: 'resource-in-property',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.stateManagement.runtime";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ImageAttribute as ImageAttribute } from "arkui.component.image";

import { ImageImpl as ImageImpl } from "arkui.component.image";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { _rawfile as _rawfile } from "arkui.component.resources";

import { memo as memo } from "arkui.stateManagement.runtime";

import { _r as _r } from "arkui.component.resources";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.stateManagement.runtime";

import { Component as Component, $r as $r, $rawfile as $rawfile, Column as Column, Text as Text, Image as Image, Resource as Resource } from "@ohos.arkui.component";

const i: Resource = _r(16777216, 10003, "com.example.mock", "entry");

function main() {}

@Component() final struct ResourceComponent extends CustomComponent<ResourceComponent, __Options_ResourceComponent> {
  public __initializeStruct(initializers: (__Options_ResourceComponent | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_str = ((({let gensym___42103502 = initializers;
    (((gensym___42103502) == (null)) ? undefined : gensym___42103502.str)})) ?? (_r(16777216, 10003, "com.example.mock", "entry")));
    this.__backing_icon = ((({let gensym___38135554 = initializers;
    (((gensym___38135554) == (null)) ? undefined : gensym___38135554.icon)})) ?? (_rawfile(0, 30000, "com.example.mock", "entry", "app.mock.txt")));
  }
  public __updateStruct(initializers: (__Options_ResourceComponent | undefined)): void {}
  private __backing_str?: Resource;
  public get str(): Resource {
    return (this.__backing_str as Resource);
  }
  public set str(value: Resource) {
    this.__backing_str = value;
  }
  private __backing_icon?: Resource;
  public get icon(): Resource {
    return (this.__backing_icon as Resource);
  }
  public set icon(value: Resource) {
    this.__backing_icon = value;
  }

  @MemoIntrinsic() public static _invoke(style: @memo() ((instance: ResourceComponent)=> void), initializers: ((()=> __Options_ResourceComponent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<ResourceComponent, __Options_ResourceComponent>(style, ((): ResourceComponent => {
      return new ResourceComponent(false, ({let gensym___46528967 = storage;
      (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() public static $_invoke(initializers?: __Options_ResourceComponent, storage?: LocalStorage, @Builder() @memo() content?: (()=> void)): ResourceComponent {
    throw new Error("Declare interface");
  }

  @memo() public build() {
    ColumnImpl(@memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @memo() (() => {
      TextImpl(@memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(this.str, undefined).applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(i, undefined).applyAttributesFinish();
        return;
      }), undefined);
      ImageImpl(@memo() ((instance: ImageAttribute): void => {
        instance.setImageOptions(this.icon, undefined).applyAttributesFinish();
        return;
      }), undefined);
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

@Component() export interface __Options_ResourceComponent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'str', '(Resource | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_str', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'icon', '(Resource | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_icon', '(boolean | undefined)')}
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test resource transform in property',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
