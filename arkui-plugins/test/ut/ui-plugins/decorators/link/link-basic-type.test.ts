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

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/link';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'link-basic-type.ets'),
];

const pluginTester = new PluginTester('test basic type @Link decorated variables transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'link-basic-type',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { DecoratedV1VariableBase as DecoratedV1VariableBase } from \"@ohos.arkui.stateManagement\";
import { memo as memo } from \"arkui.stateManagement.runtime\";
import { LinkDecoratedVariable as LinkDecoratedVariable } from \"@ohos.arkui.stateManagement\";
import { CustomComponent as CustomComponent } from \"arkui.component.customComponent\";
import { Component as Component } from \"@ohos.arkui.component\";
import { Link as Link } from \"@ohos.arkui.stateManagement\";
function main() {}
@Component({freezeWhenInactive:false}) final class LinkParent extends CustomComponent<LinkParent, __Options_LinkParent> {
  public __initializeStruct(initializers: __Options_LinkParent | undefined, @memo() content: (()=> void) | undefined): void {
    if (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__backing_linkVar1)})) {
      this.__backing_linkVar1 = new LinkDecoratedVariable<string>(\"linkVar1\", initializers!.__backing_linkVar1!);
    };
    if (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__backing_linkVar2)})) {
      this.__backing_linkVar2 = new LinkDecoratedVariable<number>(\"linkVar2\", initializers!.__backing_linkVar2!);
    };
    if (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__backing_linkVar3)})) {
      this.__backing_linkVar3 = new LinkDecoratedVariable<boolean>(\"linkVar3\", initializers!.__backing_linkVar3!);
    };
    if (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__backing_linkVar4)})) {
      this.__backing_linkVar4 = new LinkDecoratedVariable<undefined>(\"linkVar4\", initializers!.__backing_linkVar4!);
    };
    if (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__backing_linkVar5)})) {
      this.__backing_linkVar5 = new LinkDecoratedVariable<null>(\"linkVar5\", initializers!.__backing_linkVar5!);
    };
  }
  public __updateStruct(initializers: __Options_LinkParent | undefined): void {}
  private __backing_linkVar1?: LinkDecoratedVariable<string>;
  public get linkVar1(): string {
    return this.__backing_linkVar1!.get();
  }
  public set linkVar1(value: string) {
    this.__backing_linkVar1!.set(value);
  }
  private __backing_linkVar2?: LinkDecoratedVariable<number>;
  public get linkVar2(): number {
    return this.__backing_linkVar2!.get();
  }
  public set linkVar2(value: number) {
    this.__backing_linkVar2!.set(value);
  }
  private __backing_linkVar3?: LinkDecoratedVariable<boolean>;
  public get linkVar3(): boolean {
    return this.__backing_linkVar3!.get();
  }
  public set linkVar3(value: boolean) {
    this.__backing_linkVar3!.set(value);
  }
  private __backing_linkVar4?: LinkDecoratedVariable<undefined>;
  public get linkVar4(): undefined {
    return this.__backing_linkVar4!.get();
  }
  public set linkVar4(value: undefined) {
    this.__backing_linkVar4!.set(value);
  }
  private __backing_linkVar5?: LinkDecoratedVariable<null>;
  public get linkVar5(): null {
    return this.__backing_linkVar5!.get();
  }
  public set linkVar5(value: null) {
    this.__backing_linkVar5!.set(value);
  }
  @memo() public _build(@memo() style: ((instance: LinkParent)=> LinkParent) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_LinkParent | undefined): void {}
  private constructor() {}
}

@Retention({policy:\"SOURCE\"}) @interface __Link_intrinsic {}

@Component({freezeWhenInactive:false}) export interface __Options_LinkParent {
  @__Link_intrinsic() set linkVar1(linkVar1: string | undefined)
  @__Link_intrinsic() get linkVar1(): string | undefined
  set __backing_linkVar1(__backing_linkVar1: DecoratedV1VariableBase<string> | undefined)
  get __backing_linkVar1(): DecoratedV1VariableBase<string> | undefined
  @__Link_intrinsic() set linkVar2(linkVar2: number | undefined)
  @__Link_intrinsic() get linkVar2(): number | undefined
  set __backing_linkVar2(__backing_linkVar2: DecoratedV1VariableBase<number> | undefined)
  get __backing_linkVar2(): DecoratedV1VariableBase<number> | undefined
  @__Link_intrinsic() set linkVar3(linkVar3: boolean | undefined)
  @__Link_intrinsic() get linkVar3(): boolean | undefined
  set __backing_linkVar3(__backing_linkVar3: DecoratedV1VariableBase<boolean> | undefined)
  get __backing_linkVar3(): DecoratedV1VariableBase<boolean> | undefined
  @__Link_intrinsic() set linkVar4(linkVar4: undefined | undefined)
  @__Link_intrinsic() get linkVar4(): undefined | undefined
  set __backing_linkVar4(__backing_linkVar4: undefined | undefined)
  get __backing_linkVar4(): undefined | undefined
  @__Link_intrinsic() set linkVar5(linkVar5: null | undefined)
  @__Link_intrinsic() get linkVar5(): null | undefined
  set __backing_linkVar5(__backing_linkVar5: DecoratedV1VariableBase<null> | undefined)
  get __backing_linkVar5(): DecoratedV1VariableBase<null> | undefined
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test basic type @Link decorated variables transformation',
    [parsedTransform, structNoRecheck, recheck],
    {
        'checked:struct-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
