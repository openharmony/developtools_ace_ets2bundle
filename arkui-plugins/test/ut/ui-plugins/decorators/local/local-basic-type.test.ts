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

const STATE_DIR_PATH: string = 'decorators/local';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'local-basic-type.ets'),
];

const pluginTester = new PluginTester('test basic type @Local decorated variables transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { ComponentV2 as ComponentV2 } from "@ohos.arkui.component";

import { Local as Local } from "@ohos.arkui.stateManagement";

function main() {}

@ComponentV2() final struct Parent extends CustomComponentV2<Parent, __Options_Parent> {
  public __initializeStruct(initializers: (__Options_Parent | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_localVar1 = STATE_MGMT_FACTORY.makeLocal<string>(this, "localVar1", "stateVar1");
    this.__backing_localVar2 = STATE_MGMT_FACTORY.makeLocal<number>(this, "localVar2", 50);
    this.__backing_localVar3 = STATE_MGMT_FACTORY.makeLocal<boolean>(this, "localVar3", true);
    this.__backing_localVar4 = STATE_MGMT_FACTORY.makeLocal<undefined>(this, "localVar4", undefined);
    this.__backing_localVar5 = STATE_MGMT_FACTORY.makeLocal<null>(this, "localVar5", null);
  }

  public __updateStruct(initializers: (__Options_Parent | undefined)): void {}

  public resetStateVarsOnReuse(initializers: (__Options_Parent | undefined)): void {
    this.__backing_localVar1!.resetOnReuse("stateVar1");
    this.__backing_localVar2!.resetOnReuse(50);
    this.__backing_localVar3!.resetOnReuse(true);
    this.__backing_localVar4!.resetOnReuse(undefined);
    this.__backing_localVar5!.resetOnReuse(null);
  }

  private __backing_localVar1?: ILocalDecoratedVariable<string>;

  public get localVar1(): string {
    return this.__backing_localVar1!.get();
  }

  public set localVar1(value: string) {
    this.__backing_localVar1!.set(value);
  }

  private __backing_localVar2?: ILocalDecoratedVariable<number>;

  public get localVar2(): number {
    return this.__backing_localVar2!.get();
  }

  public set localVar2(value: number) {
    this.__backing_localVar2!.set(value);
  }

  private __backing_localVar3?: ILocalDecoratedVariable<boolean>;

  public get localVar3(): boolean {
    return this.__backing_localVar3!.get();
  }

  public set localVar3(value: boolean) {
    this.__backing_localVar3!.set(value);
  }

  private __backing_localVar4?: ILocalDecoratedVariable<undefined>;

  public get localVar4(): undefined {
    return this.__backing_localVar4!.get();
  }

  public set localVar4(value: undefined) {
    this.__backing_localVar4!.set(value);
  }

  private __backing_localVar5?: ILocalDecoratedVariable<null>;

  public get localVar5(): null {
    return this.__backing_localVar5!.get();
  }

  public set localVar5(value: null) {
    this.__backing_localVar5!.set(value);
  }

  @MemoIntrinsic() 
  public static _invoke(style: @Memo() ((instance: Parent)=> void), initializers: ((()=> __Options_Parent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<Parent, __Options_Parent>(style, ((): Parent => {
      return new Parent();
    }), initializers, reuseId, content, { sClass: Class.from<Index>() });
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Parent, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): Parent {
    throw new Error("Declare interface");
  }

  @Memo() 
  public build() {}

  public constructor() {}

}

@ComponentV2() export interface __Options_Parent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'localVar1', '(string | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_localVar1', '(ILocalDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_localVar1', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'localVar2', '(number | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_localVar2', '(ILocalDecoratedVariable<number> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_localVar2', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'localVar3', '(boolean | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_localVar3', '(ILocalDecoratedVariable<boolean> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_localVar3', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'localVar4', '(undefined | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_localVar4', '(ILocalDecoratedVariable<undefined> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_localVar4', '(boolean | undefined)')}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'localVar5', '(null | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_localVar5', '(ILocalDecoratedVariable<null> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_localVar5', '(boolean | undefined)')}
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test basic type @Local decorated variables transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
