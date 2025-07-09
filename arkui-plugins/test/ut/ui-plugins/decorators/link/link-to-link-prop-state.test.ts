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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'link-to-link-prop-state.ets'),
];

const pluginTester = new PluginTester('test @Link decorated variables passing to other variables', buildConfig);

const parsedTransform: Plugins = {
    name: 'link-to-link-prop-state',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { IPropDecoratedVariable as IPropDecoratedVariable } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { LinkSourceType as LinkSourceType } from "arkui.stateManagement.decorator";

import { ILinkDecoratedVariable as ILinkDecoratedVariable } from "arkui.stateManagement.decorator";

import { memo as memo } from "arkui.stateManagement.runtime";

import { LayoutCallback as LayoutCallback } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, Column as Column, TextInput as TextInput } from "@ohos.arkui.component";

import { Link as Link, State as State, Prop as Prop } from "@ohos.arkui.stateManagement";

function main() {}

@Component() final struct Parant extends CustomComponent<Parant, __Options_Parant> {
  public __initializeStruct(initializers: (__Options_Parant | undefined), @memo() content: ((()=> void) | undefined)): void {
    if (({let gensym___10127521 = initializers;
    (((gensym___10127521) == (null)) ? undefined : gensym___10127521.__backing_text1)})) {
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
  
  @memo() public build() {
    Column(undefined, undefined, @memo() (() => {
      TextInput(undefined, {
        text: this.text1,
      }, undefined);
      Child._instantiateImpl(undefined, (() => {
        return new Child();
      }), {
        __backing_childText: this.__backing_text1,
        childText2: this.text1,
        childText3: this.text1,
        childText4: this.text1,
      }, undefined, undefined);
    }));
  }
  
  private constructor() {}
  
}

@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: (__Options_Child | undefined), @memo() content: ((()=> void) | undefined)): void {
    if (({let gensym___161337494 = initializers;
    (((gensym___161337494) == (null)) ? undefined : gensym___161337494.__backing_childText)})) {
      this.__backing_childText = STATE_MGMT_FACTORY.makeLink<string>(this, "childText", initializers!.__backing_childText!);
    };
    this.__backing_childText2 = STATE_MGMT_FACTORY.makeState<string>(this, "childText2", ((({let gensym___95513066 = initializers;
    (((gensym___95513066) == (null)) ? undefined : gensym___95513066.childText2)})) ?? ("sss")));
    this.__backing_childText3 = STATE_MGMT_FACTORY.makeProp<string>(this, "childText3", (initializers!.childText3 as string));
    this.__backing_childText4 = STATE_MGMT_FACTORY.makeProp<string>(this, "childText4", ((({let gensym___162028107 = initializers;
    (((gensym___162028107) == (null)) ? undefined : gensym___162028107.childText4)})) ?? ("cc")));
  }
  
  public __updateStruct(initializers: (__Options_Child | undefined)): void {
    if (((({let gensym___77632518 = initializers;
    (((gensym___77632518) == (null)) ? undefined : gensym___77632518.childText3)})) !== (undefined))) {
      this.__backing_childText3!.update((initializers!.childText3 as string));
    }
    if (((({let gensym___250510741 = initializers;
    (((gensym___250510741) == (null)) ? undefined : gensym___250510741.childText4)})) !== (undefined))) {
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
  
  private __backing_childText3?: IPropDecoratedVariable<string>;
  
  public get childText3(): string {
    return this.__backing_childText3!.get();
  }
  
  public set childText3(value: string) {
    this.__backing_childText3!.set(value);
  }
  
  private __backing_childText4?: IPropDecoratedVariable<string>;
  
  public get childText4(): string {
    return this.__backing_childText4!.get();
  }
  
  public set childText4(value: string) {
    this.__backing_childText4!.set(value);
  }
  
  @memo() public build() {
    TextInput(undefined, {
      text: this.childText,
    }, undefined);
  }
  
  private constructor() {}
  
}

@Retention({policy:"SOURCE"}) @interface __Link_intrinsic {}

@Component() export interface __Options_Parant {
  @__Link_intrinsic() set text1(text1: (string | undefined))
  
  @__Link_intrinsic() get text1(): (string | undefined)
  set __backing_text1(__backing_text1: (LinkSourceType<string> | undefined))
  
  get __backing_text1(): (LinkSourceType<string> | undefined)
  
}

@Component() export interface __Options_Child {
  @__Link_intrinsic() set childText(childText: (string | undefined))
  
  @__Link_intrinsic() get childText(): (string | undefined)
  set __backing_childText(__backing_childText: (LinkSourceType<string> | undefined))
  
  get __backing_childText(): (LinkSourceType<string> | undefined)
  set childText2(childText2: (string | undefined))
  
  get childText2(): (string | undefined)
  set __backing_childText2(__backing_childText2: (IStateDecoratedVariable<string> | undefined))
  
  get __backing_childText2(): (IStateDecoratedVariable<string> | undefined)
  set childText3(childText3: (string | undefined))
  
  get childText3(): (string | undefined)
  set __backing_childText3(__backing_childText3: (IPropDecoratedVariable<string> | undefined))
  
  get __backing_childText3(): (IPropDecoratedVariable<string> | undefined)
  set childText4(childText4: (string | undefined))
  
  get childText4(): (string | undefined)
  set __backing_childText4(__backing_childText4: (IPropDecoratedVariable<string> | undefined))
  
  get __backing_childText4(): (IPropDecoratedVariable<string> | undefined)
  
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
