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
import { __memo_id_type as __memo_id_type } from "@ohos.arkui.stateManagement";
import { __memo_context_type as __memo_context_type } from "@ohos.arkui.stateManagement";
import { memo as memo } from "@ohos.arkui.stateManagement";
import { PropDecoratedVariable as PropDecoratedVariable } from "@ohos.arkui.stateManagement";
import { StateDecoratedVariable as StateDecoratedVariable } from "@ohos.arkui.stateManagement";
import { DecoratedV1VariableBase as DecoratedV1VariableBase } from "@ohos.arkui.stateManagement";
import { LinkDecoratedVariable as LinkDecoratedVariable } from "@ohos.arkui.stateManagement";
import { TextInputAttribute as TextInputAttribute } from "@ohos.arkui.component";
import { ColumnAttribute as ColumnAttribute } from "@ohos.arkui.component";
import { CustomComponent as CustomComponent } from "@ohos.arkui.component";
import { Component as Component, Column as Column, TextInput as TextInput } from "@ohos.arkui.component";
import { Link as Link, State as State, Prop as Prop } from "@ohos.arkui.stateManagement";

function main() {}

@Component({freezeWhenInactive:false}) final class Parant extends CustomComponent<Parant, __Options_Parant> {
  public __initializeStruct(initializers: __Options_Parant | undefined, @memo() content: (()=> void) | undefined): void {
    if (({let gensym___10127521 = initializers;
    (((gensym___10127521) == (null)) ? undefined : gensym___10127521.__backing_text1)})) {
      (this).__backing_text1 = new LinkDecoratedVariable<string>("text1", initializers!.__backing_text1!);
    };
  }
  public __updateStruct(initializers: __Options_Parant | undefined): void {}
  private __backing_text1?: LinkDecoratedVariable<string>;
  public get text1(): string {
    return (this).__backing_text1!.get();
  }
  public set text1(value: string) {
    (this).__backing_text1!.set(value);
  }
  @memo() public _build(@memo() style: ((instance: Parant)=> Parant) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_Parant | undefined): void {
    Column(undefined, undefined, (() => {
      TextInput(undefined, {
        text: (this).text1,
      }, undefined);
      Child._instantiateImpl(undefined, (() => {
        return new Child();
      }), ({
        __backing_childText: (this).__backing_text1,
        childText2: (this).text1,
        childText3: (this).text1,
        childText4: (this).text1,
      } as __Options_Child), undefined, undefined);
    }));
  }
  public constructor() {}
}

@Component({freezeWhenInactive:false}) final class Child extends CustomComponent<Child, __Options_Child> {
  public __initializeStruct(initializers: __Options_Child | undefined, @memo() content: (()=> void) | undefined): void {
    if (({let gensym___161337494 = initializers;
    (((gensym___161337494) == (null)) ? undefined : gensym___161337494.__backing_childText)})) {
      (this).__backing_childText = new LinkDecoratedVariable<string>("childText", initializers!.__backing_childText!);
    };
    (this).__backing_childText2 = new StateDecoratedVariable<string>("childText2", ((({let gensym___95513066 = initializers;
    (((gensym___95513066) == (null)) ? undefined : gensym___95513066.childText2)})) ?? ("sss")));
    (this).__backing_childText3 = new PropDecoratedVariable<string>("childText3", (initializers!.childText3 as string));
    (this).__backing_childText4 = new PropDecoratedVariable<string>("childText4", ((({let gensym___162028107 = initializers;
    (((gensym___162028107) == (null)) ? undefined : gensym___162028107.childText4)})) ?? ("cc")));
  }
  public __updateStruct(initializers: __Options_Child | undefined): void {
    if (((({let gensym___77632518 = initializers;
    (((gensym___77632518) == (null)) ? undefined : gensym___77632518.childText3)})) !== (undefined))) {
      (this).__backing_childText3!.update((initializers!.childText3 as string));
    }
    if (((({let gensym___250510741 = initializers;
    (((gensym___250510741) == (null)) ? undefined : gensym___250510741.childText4)})) !== (undefined))) {
      (this).__backing_childText4!.update((initializers!.childText4 as string));
    }
  }
  private __backing_childText?: LinkDecoratedVariable<string>;
  public get childText(): string {
    return (this).__backing_childText!.get();
  }
  public set childText(value: string) {
    (this).__backing_childText!.set(value);
  }
  private __backing_childText2?: StateDecoratedVariable<string>;
  public get childText2(): string {
    return (this).__backing_childText2!.get();
  }
  public set childText2(value: string) {
    (this).__backing_childText2!.set(value);
  }
  private __backing_childText3?: PropDecoratedVariable<string>;
  public get childText3(): string {
    return (this).__backing_childText3!.get();
  }
  public set childText3(value: string) {
    (this).__backing_childText3!.set(value);
  }
  private __backing_childText4?: PropDecoratedVariable<string>;
  public get childText4(): string {
    return (this).__backing_childText4!.get();
  }
  public set childText4(value: string) {
    (this).__backing_childText4!.set(value);
  }
  @memo() public _build(@memo() style: ((instance: Child)=> Child) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_Child | undefined): void {
    TextInput(undefined, {
      text: (this).childText,
    }, undefined);
  }
  public constructor() {}
}

interface __Options_Parant {
  abstract set text1(text1: string | undefined)
  abstract get text1(): string | undefined
  abstract set __backing_text1(__backing_text1: DecoratedV1VariableBase<string> | undefined)
  abstract get __backing_text1(): DecoratedV1VariableBase<string> | undefined
}

interface __Options_Child {
  abstract set childText(childText: string | undefined)
  abstract get childText(): string | undefined
  abstract set __backing_childText(__backing_childText: DecoratedV1VariableBase<string> | undefined)
  abstract get __backing_childText(): DecoratedV1VariableBase<string> | undefined
  abstract set childText2(childText2: string | undefined)
  abstract get childText2(): string | undefined
  abstract set __backing_childText2(__backing_childText2: StateDecoratedVariable<string> | undefined)
  abstract get __backing_childText2(): StateDecoratedVariable<string> | undefined
  abstract set childText3(childText3: string | undefined)
  abstract get childText3(): string | undefined
  abstract set __backing_childText3(__backing_childText3: PropDecoratedVariable<string> | undefined)
  abstract get __backing_childText3(): PropDecoratedVariable<string> | undefined
  abstract set childText4(childText4: string | undefined)
  abstract get childText4(): string | undefined
  abstract set __backing_childText4(__backing_childText4: PropDecoratedVariable<string> | undefined)
  abstract get __backing_childText4(): PropDecoratedVariable<string> | undefined
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @Link decorated variables passing to other variables',
    [parsedTransform, uiNoRecheck],
    {
        checked: [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
