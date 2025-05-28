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
import { structNoRecheck, recheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/prop';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'prop-basic-type.ets'),
];

const pluginTester = new PluginTester('test basic type @Prop decorated variables transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'prop-basic-type',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { memo as memo } from "arkui.stateManagement.runtime";
import { PropDecoratedVariable as PropDecoratedVariable } from "arkui.stateManagement.decorators.decoratorProp";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Component as Component } from "@ohos.arkui.component";
import { Prop as Prop } from "@ohos.arkui.stateManagement";

function main() {}

@Component({freezeWhenInactive:false}) final class PropParent extends CustomComponent<PropParent, __Options_PropParent> {
  public __initializeStruct(initializers: __Options_PropParent | undefined, @memo() content: (()=> void) | undefined): void {
    this.__backing_propVar1 = new PropDecoratedVariable<string>("propVar1", ((({let gensym___95172135 = initializers;
    (((gensym___95172135) == (null)) ? undefined : gensym___95172135.propVar1)})) ?? ("propVar1")));
    this.__backing_propVar2 = new PropDecoratedVariable<number>("propVar2", ((({let gensym___222490386 = initializers;
    (((gensym___222490386) == (null)) ? undefined : gensym___222490386.propVar2)})) ?? (50)));
    this.__backing_propVar3 = new PropDecoratedVariable<boolean>("propVar3", ((({let gensym___201781257 = initializers;
    (((gensym___201781257) == (null)) ? undefined : gensym___201781257.propVar3)})) ?? (true)));
    this.__backing_propVar4 = new PropDecoratedVariable<undefined>("propVar4", ((({let gensym___22028950 = initializers;
    (((gensym___22028950) == (null)) ? undefined : gensym___22028950.propVar4)})) ?? (undefined)));
    this.__backing_propVar5 = new PropDecoratedVariable<null>("propVar5", ((({let gensym___54872258 = initializers;
    (((gensym___54872258) == (null)) ? undefined : gensym___54872258.propVar5)})) ?? (null)));
  }
  public __updateStruct(initializers: __Options_PropParent | undefined): void {
    if (((({let gensym___67969738 = initializers;
    (((gensym___67969738) == (null)) ? undefined : gensym___67969738.propVar1)})) !== (undefined))) {
      this.__backing_propVar1!.update((initializers!.propVar1 as string));
    }
    if (((({let gensym___52350476 = initializers;
    (((gensym___52350476) == (null)) ? undefined : gensym___52350476.propVar2)})) !== (undefined))) {
      this.__backing_propVar2!.update((initializers!.propVar2 as number));
    }
    if (((({let gensym___103864283 = initializers;
    (((gensym___103864283) == (null)) ? undefined : gensym___103864283.propVar3)})) !== (undefined))) {
      this.__backing_propVar3!.update((initializers!.propVar3 as boolean));
    }
    if (((({let gensym___175155715 = initializers;
    (((gensym___175155715) == (null)) ? undefined : gensym___175155715.propVar4)})) !== (undefined))) {
      this.__backing_propVar4!.update((initializers!.propVar4 as undefined));
    }
    if (((({let gensym___134530703 = initializers;
    (((gensym___134530703) == (null)) ? undefined : gensym___134530703.propVar5)})) !== (undefined))) {
      this.__backing_propVar5!.update((initializers!.propVar5 as null));
    }
  }
  private __backing_propVar1?: PropDecoratedVariable<string>;
  public get propVar1(): string {
    return this.__backing_propVar1!.get();
  }
  public set propVar1(value: string) {
    this.__backing_propVar1!.set(value);
  }
  private __backing_propVar2?: PropDecoratedVariable<number>;
  public get propVar2(): number {
    return this.__backing_propVar2!.get();
  }
  public set propVar2(value: number) {
    this.__backing_propVar2!.set(value);
  }
  private __backing_propVar3?: PropDecoratedVariable<boolean>;
  public get propVar3(): boolean {
    return this.__backing_propVar3!.get();
  }
  public set propVar3(value: boolean) {
    this.__backing_propVar3!.set(value);
  }
  private __backing_propVar4?: PropDecoratedVariable<undefined>;
  public get propVar4(): undefined {
    return this.__backing_propVar4!.get();
  }
  public set propVar4(value: undefined) {
    this.__backing_propVar4!.set(value);
  }
  private __backing_propVar5?: PropDecoratedVariable<null>;
  public get propVar5(): null {
    return this.__backing_propVar5!.get();
  }
  public set propVar5(value: null) {
    this.__backing_propVar5!.set(value);
  }
  @memo() public _build(@memo() style: ((instance: PropParent)=> PropParent) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_PropParent | undefined): void {}
  private constructor() {}
}

@Component({freezeWhenInactive:false}) export interface __Options_PropParent {
  set propVar1(propVar1: string | undefined)
  get propVar1(): string | undefined
  set __backing_propVar1(__backing_propVar1: PropDecoratedVariable<string> | undefined)
  get __backing_propVar1(): PropDecoratedVariable<string> | undefined
  set propVar2(propVar2: number | undefined)
  get propVar2(): number | undefined
  set __backing_propVar2(__backing_propVar2: PropDecoratedVariable<number> | undefined)
  get __backing_propVar2(): PropDecoratedVariable<number> | undefined
  set propVar3(propVar3: boolean | undefined)
  get propVar3(): boolean | undefined
  set __backing_propVar3(__backing_propVar3: PropDecoratedVariable<boolean> | undefined)
  get __backing_propVar3(): PropDecoratedVariable<boolean> | undefined
  set propVar4(propVar4: undefined | undefined)
  get propVar4(): undefined | undefined
  set __backing_propVar4(__backing_propVar4: undefined | undefined)
  get __backing_propVar4(): undefined | undefined
  set propVar5(propVar5: null | undefined)
  get propVar5(): null | undefined
  set __backing_propVar5(__backing_propVar5: PropDecoratedVariable<null> | undefined)
  get __backing_propVar5(): PropDecoratedVariable<null> | undefined
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test basic type @Prop decorated variables transformation',
    [parsedTransform, structNoRecheck, recheck],
    {
        'checked:struct-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
