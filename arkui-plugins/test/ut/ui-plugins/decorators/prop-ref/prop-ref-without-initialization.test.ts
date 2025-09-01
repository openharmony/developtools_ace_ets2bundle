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

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/prop-ref';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'prop-ref-without-initialization.ets'),
];

const pluginTester = new PluginTester('test @PropRef decorated variables transformation without initialization', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsed-trans',
    parsed: uiTransform().parsed
};

const expectedParsedScript: string = `
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component } from "@ohos.arkui.component";

import { PropRef as PropRef } from "@ohos.arkui.stateManagement";

@Component() final struct PropParent extends CustomComponent<PropParent, __Options_PropParent> {
  @PropRef() public propVar1!: string;

  @PropRef() public propVar2?: (number | undefined);

  @PropRef() public propVar3!: boolean;

  @PropRef() public propVar4?: undefined;

  @PropRef() public propVar5?: null;

  @PropRef() public propVar6?: (Array<number> | null);

  @PropRef() public propVar7?: (Map<string, number> | undefined);

  public build() {}

  public constructor() {}

}

@Component() export interface __Options_PropParent {
  propVar1?: string;
  @PropRef() __backing_propVar1?: string;
  __options_has_propVar1?: boolean;
  propVar2?: (number | undefined);
  @PropRef() __backing_propVar2?: (number | undefined);
  __options_has_propVar2?: boolean;
  propVar3?: boolean;
  @PropRef() __backing_propVar3?: boolean;
  __options_has_propVar3?: boolean;
  propVar4?: undefined;
  @PropRef() __backing_propVar4?: undefined;
  __options_has_propVar4?: boolean;
  propVar5?: null;
  @PropRef() __backing_propVar5?: null;
  __options_has_propVar5?: boolean;
  propVar6?: (Array<number> | null);
  @PropRef() __backing_propVar6?: (Array<number> | null);
  __options_has_propVar6?: boolean;
  propVar7?: (Map<string, number> | undefined);
  @PropRef() __backing_propVar7?: (Map<string, number> | undefined);
  __options_has_propVar7?: boolean;
  
}
`;

const expectedCheckedScript: string = `
import { memo as memo } from "arkui.stateManagement.runtime";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IPropRefDecoratedVariable as IPropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component } from "@ohos.arkui.component";

import { PropRef as PropRef } from "@ohos.arkui.stateManagement";

function main() {}

@Component() final struct PropParent extends CustomComponent<PropParent, __Options_PropParent> {
  public __initializeStruct(initializers: (__Options_PropParent | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_propVar1 = STATE_MGMT_FACTORY.makePropRef<string>(this, "propVar1", (initializers!.propVar1 as string));
    this.__backing_propVar2 = STATE_MGMT_FACTORY.makePropRef<(number | undefined)>(this, "propVar2", (initializers!.propVar2 as (number | undefined)));
    this.__backing_propVar3 = STATE_MGMT_FACTORY.makePropRef<boolean>(this, "propVar3", (initializers!.propVar3 as boolean));
    this.__backing_propVar4 = STATE_MGMT_FACTORY.makePropRef<undefined>(this, "propVar4", (initializers!.propVar4 as undefined));
    this.__backing_propVar5 = STATE_MGMT_FACTORY.makePropRef<null>(this, "propVar5", (initializers!.propVar5 as null));
    this.__backing_propVar6 = STATE_MGMT_FACTORY.makePropRef<(Array<number> | null)>(this, "propVar6", (initializers!.propVar6 as (Array<number> | null)));
    this.__backing_propVar7 = STATE_MGMT_FACTORY.makePropRef<(Map<string, number> | undefined)>(this, "propVar7", (initializers!.propVar7 as (Map<string, number> | undefined)));
  }

  public __updateStruct(initializers: (__Options_PropParent | undefined)): void {
    if (({let gensym___222986222 = initializers;
    (((gensym___222986222) == (null)) ? undefined : gensym___222986222.__options_has_propVar1)})) {
      this.__backing_propVar1!.update((initializers!.propVar1 as string));
    }
    if (({let gensym___178023537 = initializers;
    (((gensym___178023537) == (null)) ? undefined : gensym___178023537.__options_has_propVar2)})) {
      this.__backing_propVar2!.update((initializers!.propVar2 as (number | undefined)));
    }
    if (({let gensym___221361445 = initializers;
    (((gensym___221361445) == (null)) ? undefined : gensym___221361445.__options_has_propVar3)})) {
      this.__backing_propVar3!.update((initializers!.propVar3 as boolean));
    }
    if (({let gensym___22732558 = initializers;
    (((gensym___22732558) == (null)) ? undefined : gensym___22732558.__options_has_propVar4)})) {
      this.__backing_propVar4!.update((initializers!.propVar4 as undefined));
    }
    if (({let gensym___143875977 = initializers;
    (((gensym___143875977) == (null)) ? undefined : gensym___143875977.__options_has_propVar5)})) {
      this.__backing_propVar5!.update((initializers!.propVar5 as null));
    }
    if (({let gensym___21159249 = initializers;
    (((gensym___21159249) == (null)) ? undefined : gensym___21159249.__options_has_propVar6)})) {
      this.__backing_propVar6!.update((initializers!.propVar6 as (Array<number> | null)));
    }
    if (({let gensym___198355044 = initializers;
    (((gensym___198355044) == (null)) ? undefined : gensym___198355044.__options_has_propVar7)})) {
      this.__backing_propVar7!.update((initializers!.propVar7 as (Map<string, number> | undefined)));
    }
  }

  private __backing_propVar1?: IPropRefDecoratedVariable<string>;

  public get propVar1(): string {
    return this.__backing_propVar1!.get();
  }

  public set propVar1(value: string) {
    this.__backing_propVar1!.set(value);
  }

  private __backing_propVar2?: IPropRefDecoratedVariable<(number | undefined)>;

  public get propVar2(): (number | undefined) {
    return this.__backing_propVar2!.get();
  }

  public set propVar2(value: (number | undefined)) {
    this.__backing_propVar2!.set(value);
  }

  private __backing_propVar3?: IPropRefDecoratedVariable<boolean>;

  public get propVar3(): boolean {
    return this.__backing_propVar3!.get();
  }

  public set propVar3(value: boolean) {
    this.__backing_propVar3!.set(value);
  }

  private __backing_propVar4?: IPropRefDecoratedVariable<undefined>;

  public get propVar4(): undefined {
    return this.__backing_propVar4!.get();
  }

  public set propVar4(value: undefined) {
    this.__backing_propVar4!.set(value);
  }

  private __backing_propVar5?: IPropRefDecoratedVariable<null>;

  public get propVar5(): null {
    return this.__backing_propVar5!.get();
  }

  public set propVar5(value: null) {
    this.__backing_propVar5!.set(value);
  }

  private __backing_propVar6?: IPropRefDecoratedVariable<(Array<number> | null)>;

  public get propVar6(): (Array<number> | null) {
    return this.__backing_propVar6!.get();
  }

  public set propVar6(value: (Array<number> | null)) {
    this.__backing_propVar6!.set(value);
  }

  private __backing_propVar7?: IPropRefDecoratedVariable<(Map<string, number> | undefined)>;

  public get propVar7(): (Map<string, number> | undefined) {
    return this.__backing_propVar7!.get();
  }

  public set propVar7(value: (Map<string, number> | undefined)) {
    this.__backing_propVar7!.set(value);
  }

  @memo() public build() {}

  public constructor() {}

}

@Component() export interface __Options_PropParent {
  set propVar1(propVar1: (string | undefined))

  get propVar1(): (string | undefined)
  set __backing_propVar1(__backing_propVar1: (IPropRefDecoratedVariable<string> | undefined))

  get __backing_propVar1(): (IPropRefDecoratedVariable<string> | undefined)
  set __options_has_propVar1(__options_has_propVar1: (boolean | undefined))
  
  get __options_has_propVar1(): (boolean | undefined)
  set propVar2(propVar2: ((number | undefined) | undefined))

  get propVar2(): ((number | undefined) | undefined)
  set __backing_propVar2(__backing_propVar2: (IPropRefDecoratedVariable<(number | undefined)> | undefined))

  get __backing_propVar2(): (IPropRefDecoratedVariable<(number | undefined)> | undefined)
  set __options_has_propVar2(__options_has_propVar2: (boolean | undefined))
  
  get __options_has_propVar2(): (boolean | undefined)
  set propVar3(propVar3: (boolean | undefined))

  get propVar3(): (boolean | undefined)
  set __backing_propVar3(__backing_propVar3: (IPropRefDecoratedVariable<boolean> | undefined))

  get __backing_propVar3(): (IPropRefDecoratedVariable<boolean> | undefined)
  set __options_has_propVar3(__options_has_propVar3: (boolean | undefined))
  
  get __options_has_propVar3(): (boolean | undefined)
  set propVar4(propVar4: (undefined | undefined))

  get propVar4(): (undefined | undefined)
  set __backing_propVar4(__backing_propVar4: (IPropRefDecoratedVariable<undefined> | undefined))

  get __backing_propVar4(): (IPropRefDecoratedVariable<undefined> | undefined)
  set __options_has_propVar4(__options_has_propVar4: (boolean | undefined))
  
  get __options_has_propVar4(): (boolean | undefined)
  set propVar5(propVar5: (null | undefined))

  get propVar5(): (null | undefined)
  set __backing_propVar5(__backing_propVar5: (IPropRefDecoratedVariable<null> | undefined))

  get __backing_propVar5(): (IPropRefDecoratedVariable<null> | undefined)
  set __options_has_propVar5(__options_has_propVar5: (boolean | undefined))
  
  get __options_has_propVar5(): (boolean | undefined)
  set propVar6(propVar6: ((Array<number> | null) | undefined))

  get propVar6(): ((Array<number> | null) | undefined)
  set __backing_propVar6(__backing_propVar6: (IPropRefDecoratedVariable<(Array<number> | null)> | undefined))

  get __backing_propVar6(): (IPropRefDecoratedVariable<(Array<number> | null)> | undefined)
  set __options_has_propVar6(__options_has_propVar6: (boolean | undefined))
  
  get __options_has_propVar6(): (boolean | undefined)
  set propVar7(propVar7: ((Map<string, number> | undefined) | undefined))

  get propVar7(): ((Map<string, number> | undefined) | undefined)
  set __backing_propVar7(__backing_propVar7: (IPropRefDecoratedVariable<(Map<string, number> | undefined)> | undefined))

  get __backing_propVar7(): (IPropRefDecoratedVariable<(Map<string, number> | undefined)> | undefined)
  set __options_has_propVar7(__options_has_propVar7: (boolean | undefined))
  
  get __options_has_propVar7(): (boolean | undefined)
  
}
`;

function testParsedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedParsedScript));
}

function testheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test @PropRef decorated variables transformation without initialization',
    [parsedTransform, structNoRecheck, recheck],
    {
        'parsed': [testParsedTransformer],
        'checked:struct-no-recheck': [testheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
