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
import { structNoRecheck, recheck, beforeUINoRecheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, dumpConstructor, dumpAnnotation } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/prop-ref';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'prop-ref-basic-type.ets'),
];

const pluginTester = new PluginTester('test basic type @PropRef decorated variables transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'prop-ref-basic-type',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IPropRefDecoratedVariable as IPropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component } from "@ohos.arkui.component";

import { PropRef as PropRef } from "@ohos.arkui.stateManagement";

function main() {}

@Component() final struct PropParent extends CustomComponent<PropParent, __Options_PropParent> {
  public __initializeStruct(initializers: (__Options_PropParent | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_propVar1 = STATE_MGMT_FACTORY.makePropRef<string>(this, "propVar1", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.propVar1)})) ?? ("propVar1")));
    this.__backing_propVar2 = STATE_MGMT_FACTORY.makePropRef<number>(this, "propVar2", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.propVar2)})) ?? (50)));
    this.__backing_propVar3 = STATE_MGMT_FACTORY.makePropRef<boolean>(this, "propVar3", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.propVar3)})) ?? (true)));
    this.__backing_propVar4 = STATE_MGMT_FACTORY.makePropRef<undefined>(this, "propVar4", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.propVar4)})) ?? (undefined)));
    this.__backing_propVar5 = STATE_MGMT_FACTORY.makePropRef<null>(this, "propVar5", ((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.propVar5)})) ?? (null)));
  }

  public __updateStruct(initializers: (__Options_PropParent | undefined)): void {
    if (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_propVar1)})) {
      this.__backing_propVar1!.update((initializers!.propVar1 as string));
    }
    if (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_propVar2)})) {
      this.__backing_propVar2!.update((initializers!.propVar2 as number));
    }
    if (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_propVar3)})) {
      this.__backing_propVar3!.update((initializers!.propVar3 as boolean));
    }
    if (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_propVar4)})) {
      this.__backing_propVar4!.update((initializers!.propVar4 as undefined));
    }
    if (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_propVar5)})) {
      this.__backing_propVar5!.update((initializers!.propVar5 as null));
    }
  }
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: PropParent)=> void) | undefined), initializers: ((()=> __Options_PropParent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<PropParent, __Options_PropParent>(style, ((): PropParent => {
      return new PropParent(false, ({let gensym___<some_random_number> = storage;
      (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>())}));
    }), initializers, reuseId, content);
  }

  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_PropParent, storage?: LocalStorage, @Builder() content?: (()=> void)): PropParent {
    throw new Error("Declare interface");
  }

  private __backing_propVar1?: IPropRefDecoratedVariable<string>;

  public get propVar1(): string {
    return this.__backing_propVar1!.get();
  }

  public set propVar1(value: string) {
    this.__backing_propVar1!.set(value);
  }

  private __backing_propVar2?: IPropRefDecoratedVariable<number>;

  public get propVar2(): number {
    return this.__backing_propVar2!.get();
  }

  public set propVar2(value: number) {
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
  @Memo() 
  public build() {}

  ${dumpConstructor()}
  static {
  }

}

@Component() export interface __Options_PropParent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'propVar1', '(string | undefined)', [dumpAnnotation('PropRef')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_propVar1', '(IPropRefDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_propVar1', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'propVar2', '(number | undefined)', [dumpAnnotation('PropRef')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_propVar2', '(IPropRefDecoratedVariable<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_propVar2', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'propVar3', '(boolean | undefined)', [dumpAnnotation('PropRef')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_propVar3', '(IPropRefDecoratedVariable<boolean> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_propVar3', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'propVar4', '(undefined | undefined)', [dumpAnnotation('PropRef')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_propVar4', '(IPropRefDecoratedVariable<undefined> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_propVar4', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'propVar5', '(null | undefined)', [dumpAnnotation('PropRef')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_propVar5', '(IPropRefDecoratedVariable<null> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_propVar5', '(boolean | undefined)')}

}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test basic type @PropRef decorated variables transformation',
    [parsedTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
