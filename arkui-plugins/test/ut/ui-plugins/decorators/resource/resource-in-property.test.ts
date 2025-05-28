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
import { uiNoRecheck } from '../../../../utils/plugins';
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
import { __memo_id_type as __memo_id_type } from "arkui.stateManagement.runtime";
import { __memo_context_type as __memo_context_type } from "arkui.stateManagement.runtime";
import { memo as memo } from "arkui.stateManagement.runtime";
import { UIImageAttribute as UIImageAttribute } from "@ohos.arkui.component";
import { UITextAttribute as UITextAttribute } from "@ohos.arkui.component";
import { UIColumnAttribute as UIColumnAttribute } from "@ohos.arkui.component";
import { _rawfile as _rawfile } from "@ohos.arkui.component";
import { _r as _r } from "@ohos.arkui.component";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Component as Component, $r as $r, $rawfile as $rawfile, Column as Column, Text as Text, Image as Image, Resource as Resource } from "@ohos.arkui.component";

let i: Resource;
function main() {}
i = _r("", "", "app.string.app_name");

@Component({freezeWhenInactive:false}) final class ResourceComponent extends CustomComponent<ResourceComponent, __Options_ResourceComponent> {
  public __initializeStruct(initializers: __Options_ResourceComponent | undefined, @memo() content: (()=> void) | undefined): void {
    (this).__backing_str = ((({let gensym___42103502 = initializers;
    (((gensym___42103502) == (null)) ? undefined : gensym___42103502.str)})) ?? (_r("", "", "app.string.app_name")));
    (this).__backing_icon = ((({let gensym___38135554 = initializers;
    (((gensym___38135554) == (null)) ? undefined : gensym___38135554.icon)})) ?? (_rawfile("", "", "app.photo.png")));
  }
  public __updateStruct(initializers: __Options_ResourceComponent | undefined): void {}
  private __backing_str?: Resource;
  public get str(): Resource {
    return ((this).__backing_str as Resource);
  }
  public set str(value: Resource) {
    (this).__backing_str = value;
  }
  private __backing_icon?: Resource;
  public get icon(): Resource {
    return ((this).__backing_icon as Resource);
  }
  public set icon(value: Resource) {
    (this).__backing_icon = value;
  }
  @memo() public _build(@memo() style: ((instance: ResourceComponent)=> ResourceComponent) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_ResourceComponent | undefined): void {
    Column(undefined, undefined, (() => {
      Text(undefined, (this).str, undefined, undefined);
      Text(undefined, i, undefined, undefined);
      Image(undefined, (this).icon, undefined, undefined);
    }));
  }
  public constructor() {}
}

interface __Options_ResourceComponent {
  set str(str: Resource | undefined)
  get str(): Resource | undefined
  set icon(icon: Resource | undefined)
  get icon(): Resource | undefined
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test resource transform in property',
    [parsedTransform, uiNoRecheck],
    {
        checked: [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
