/*
 * Copyright (C) 2026 Huawei Device Co., Ltd.
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
import { PluginTester } from '../../../utils/plugin-tester';
import { mockBuildConfig } from '../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../utils/path-config';
import { parseDumpSrc } from '../../../utils/parse-string';
import { uiNoRecheck, recheck, memoNoRecheck, collectNoRecheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, dumpConstructor, dumpAnnotation } from '../../../utils/simplify-dump';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const DECL_DIR_PATH: string = 'declarations';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, DECL_DIR_PATH, 'ts-type-usage.ets'),
];

const pluginTester = new PluginTester('test declarations in ts types', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsed transform',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `
import { Memo } from "arkui.incremental.annotation";

import { MemoIntrinsic } from "arkui.incremental.annotation";

import { Memo } from "arkui.incremental.annotation";

import { ComponentBuilder } from "arkui.component.builder";

import { LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { Builder } from "arkui.component.builder";

import { CustomComponent } from "arkui.component.customComponent";

import { ReusePoolOwnership } from "arkui.component.customComponent";

import { Component } from "@ohos.arkui.component";

import { IBuilderInArgs as IBuilderInArgs, exportBuilderType as exportBuilderType, exportBuilderType2 as exportBuilderType2 } from "./test";

function main() {}

function mockFunction(obj: IBuilderInArgs): void {
  obj.mockBuilderMethod1((() => {}));
  obj.mockBuilderMethod2((() => {}));
  obj.mockBuilderMethod3((() => {}));
  obj.mockBuilderMethod4((() => {}));
}

@Component() final struct A extends CustomComponent<A, __Options_A> {
  public __initializeStruct(initializers: (__Options_A | undefined), @Memo() content: ((()=> void) | undefined)): void {}
  public __updateStruct(initializers: (__Options_A | undefined)): void {}
  public resetStateVarsOnReuse(initializers: (__Options_A | undefined)): void {}
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: A)=> void) | undefined), initializers: ((()=> __Options_A) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<A, __Options_A>(style, ((): A => {
      return new A(false, ({let gensym___<some_random_number> = storage;
      (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>())}));
    }), initializers, reuseId, content);
  }
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_A, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): A {
    throw new Error("Declare interface");
  }
  @Memo() 
  public build() {}
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  static {
  }
}
@Component() class __Options_A {
  public constructor() {}
}
`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

const expectedMemoScript: string = `
import { __memo_context_type, __memo_id_type } from "arkui.incremental.runtime.state";

import { Memo } from "arkui.incremental.annotation";

import { MemoIntrinsic } from "arkui.incremental.annotation";

import { Memo } from "arkui.incremental.annotation";

import { ComponentBuilder } from "arkui.component.builder";

import { LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { Builder } from "arkui.component.builder";

import { CustomComponent } from "arkui.component.customComponent";

import { ReusePoolOwnership } from "arkui.component.customComponent";

import { Component } from "@ohos.arkui.component";

import { IBuilderInArgs as IBuilderInArgs, exportBuilderType as exportBuilderType, exportBuilderType2 as exportBuilderType2 } from "./utils/test";

function main() {}

function mockFunction(obj: IBuilderInArgs): void {
  obj.mockBuilderMethod1(((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (47330804)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    {
      __memo_scope.recache();
      return;
    }
  }));
  obj.mockBuilderMethod2(((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (175145513)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    {
      __memo_scope.recache();
      return;
    }
  }));
  obj.mockBuilderMethod3(((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (241913892)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    {
      __memo_scope.recache();
      return;
    }
  }));
  obj.mockBuilderMethod4(((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (137225318)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    {
      __memo_scope.recache();
      return;
    }
  }));
}

@Component() final struct A extends CustomComponent<A, __Options_A> {
  public __initializeStruct(initializers: (__Options_A | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {}
  public __updateStruct(initializers: (__Options_A | undefined)): void {}
  public resetStateVarsOnReuse(initializers: (__Options_A | undefined)): void {}
  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: A)=> void) | undefined), initializers: ((()=> __Options_A) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponent._invokeImpl<A, __Options_A>(__memo_context, ((__memo_id) + (<some_random_number>)), style, ((): A => {
      return new A(false, ({let gensym___<some_random_number> = storage;
      (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>())}));
    }), initializers, reuseId, content);
  }
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_A, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): A {
    throw new Error("Declare interface");
  }
  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    {
      __memo_scope.recache();
      return;
    }
  }
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  static {
  }
}
@Component() class __Options_A {
  public constructor() {}
}
`;

const expectDeclarationScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.incremental.runtime.state";

import { Builder as Builder } from "@ohos.arkui.component";


@Builder() type nonExportBuilderType = ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);

type nonExportBuilderType2 = @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);

@Builder() export type exportBuilderType = ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);

export type exportBuilderType2 = @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);

export interface IBuilderInArgs {
  mockBuilderMethod1(builderType: nonExportBuilderType): void
  mockBuilderMethod2(builderType: nonExportBuilderType2): void
  mockBuilderMethod3(builderType: exportBuilderType): void
  mockBuilderMethod4(builderType: exportBuilderType2): void
  
}
`

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
    const forEachScript = this.declContexts?.['mock.demo.mock.declarations.utils.ts-type']?.scriptSnapshot ?? '';
    expect(parseDumpSrc(forEachScript)).toContain(parseDumpSrc(expectDeclarationScript));
}

pluginTester.run(
    'test declarations in ts types',
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
        tracing: { externalSourceNames: ['mock.demo.mock.declarations.utils.ts-type'] }
    }
);
