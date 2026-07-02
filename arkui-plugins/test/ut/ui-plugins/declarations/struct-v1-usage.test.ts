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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, DECL_DIR_PATH, 'struct-v1-usage.ets'),
];

const pluginTester = new PluginTester('test declarations in @Component structs', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsed transform',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { MemoSkip as MemoSkip } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { ReusePoolOwnership as ReusePoolOwnership } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, Column as Column, Component as Component, ComponentV2 as ComponentV2, Entry as Entry, Builder as Builder, BuilderParam as BuilderParam } from "@ohos.arkui.component";

import { State as State, Local as Local, Computed as Computed, Monitor as Monitor } from "@ohos.arkui.stateManagement";

import { ExportStructV1 as ExportStructV1, ExportStructV1WithBody as ExportStructV1WithBody } from "./utils/struct-v1";

function main() {}

@Builder() 
@Memo() 
function aBuilder(@MemoSkip() someState: number): void {
  ExportStructV1._invoke(undefined, (() => {
    return {
      someState: someState,
      __options_has_someState: true,
    };
  }), undefined, undefined, undefined);
}


@Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_aNumber = STATE_MGMT_FACTORY.makeState<number>(this, "aNumber", ((({let gensym___100945899 = initializers;
    (((gensym___100945899) == (null)) ? undefined : gensym___100945899.aNumber)})) ?? (1)));
  }
  
  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_MyStateSample | undefined)): void {
    this.__backing_aNumber!.resetOnReuse(((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.aNumber)})) ?? (1)));
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: MyStateSample)=> void) | undefined), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___149025070 = storage;
      (((gensym___149025070) == (null)) ? undefined : gensym___149025070())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): MyStateSample {
    throw new Error("Declare interface");
  }
  
  private __backing_aNumber?: IStateDecoratedVariable<number>;
  public get aNumber(): number {
    return this.__backing_aNumber!.get();
  }
  
  public set aNumber(value: number) {
    this.__backing_aNumber!.set(value);
  }
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      ExportStructV1._invoke(undefined, undefined, undefined, undefined, undefined);
      ExportStructV1WithBody._invoke(undefined, (() => {
        return {
          __backing_someLink: this.__backing_aNumber,
          __options_has_someLink: true,
        };
      }), undefined, undefined, undefined);
    }));
  }
  
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  
  static {
    
  }
}

@Component() class __Options_MyStateSample {
  @State() public aNumber?: number;
  public __backing_aNumber?: IStateDecoratedVariable<number>;
  public __options_has_aNumber?: boolean;
  public constructor() {}
  
}

`;

const expectDeclarationAfterUIScript: string = `
import { Memo } from "arkui.incremental.annotation";

import { MemoIntrinsic } from "arkui.incremental.annotation";

import { IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { LinkSourceType } from "arkui.stateManagement.decorator";

import { Memo } from "arkui.incremental.annotation";

import { ComponentBuilder } from "arkui.component.builder";

import { LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { Builder } from "arkui.component.builder";

import { CustomComponent } from "arkui.component.customComponent";

import { ReusePoolOwnership } from "arkui.component.customComponent";

import { CustomDialog, Component, ComponentV2, Entry, BuilderParam, Builder, Column, CustomDialogController } from "@ohos.arkui.component";

import { State, Link, Local, Computed, Monitor } from "@ohos.arkui.stateManagement";


@Component() export declare final struct ExportStructV1 extends CustomComponent<ExportStructV1, __Options_ExportStructV1> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ExportStructV1, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): ExportStructV1
  
  @State() public someState: number;
  @BuilderParam() @Memo() public someBuilderParam: (()=> void);
  @Memo() 
  public build(): void
  
  public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: ExportStructV1)=> void) | undefined), initializers: ((()=> __Options_ExportStructV1) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void
  
}

@Component() declare final struct NonExportStructV1 extends CustomComponent<NonExportStructV1, __Options_NonExportStructV1> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_NonExportStructV1, storage?: LocalStorage, @Builder() content?: (()=> void)): NonExportStructV1
  
  @State() public someState: number;
  @BuilderParam() public someBuilderParam: (()=> void);
  @Builder() 
  public build(): void
  
  public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
  
}

@Component() final struct StructV1WithBody extends CustomComponent<StructV1WithBody, __Options_StructV1WithBody> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_StructV1WithBody, storage?: LocalStorage, @Builder() content?: (()=> void)): StructV1WithBody
  
  @State() public someState: number = 1;
  @BuilderParam() public someBuilderParam: (()=> void);
  public build() {
    Column(){};
  }
  
  public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
  
}

@Component() export final struct ExportStructV1WithBody extends CustomComponent<ExportStructV1WithBody, __Options_ExportStructV1WithBody> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ExportStructV1WithBody, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): ExportStructV1WithBody
  
  @State() public someState: number;
  @Link() public someLink: number;
  @BuilderParam() @Memo() public someBuilderParam: (()=> void);
  @Memo() 
  public build(): void {
    Column(){};
  }
  
  public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: ExportStructV1WithBody)=> void) | undefined), initializers: ((()=> __Options_ExportStructV1WithBody) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void
  
}

@Component() export declare class __Options_ExportStructV1 {
  @State() public someState?: number;
  public __backing_someState?: IStateDecoratedVariable<number>;
  public __options_has_someState?: boolean;
  @Memo() public someBuilderParam?: ((()=> void) | undefined);
  public __options_has_someBuilderParam?: boolean;
  public constructor()
  
}

@Component() declare class __Options_NonExportStructV1 {
  @State() public someState?: number;
  public __backing_someState?: IStateDecoratedVariable<number>;
  public __options_has_someState?: boolean;
  public someBuilderParam?: ((()=> void) | undefined);
  public __options_has_someBuilderParam?: boolean;
  public constructor()
  
}

@Component() declare class __Options_StructV1WithBody {
  @State() public someState?: number;
  public __backing_someState?: IStateDecoratedVariable<number>;
  public __options_has_someState?: boolean;
  public someBuilderParam?: ((()=> void) | undefined);
  public __options_has_someBuilderParam?: boolean;
  public constructor()
  
}

@Component() export declare class __Options_ExportStructV1WithBody {
  @State() public someState?: number;
  public __backing_someState?: IStateDecoratedVariable<number>;
  public __options_has_someState?: boolean;
  @Link() public someLink: number;
  public __backing_someLink?: LinkSourceType<number>;
  public __options_has_someLink?: boolean;
  @Memo() public someBuilderParam?: ((()=> void) | undefined);
  public __options_has_someBuilderParam?: boolean;
  public constructor()
  
}

`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
    const declarationScript = this.declContexts?.['mock.demo.mock.declarations.utils.struct-v1']?.scriptSnapshot ?? '';
    expect(parseDumpSrc(declarationScript)).toContain(parseDumpSrc(expectDeclarationAfterUIScript));
}

const expectedMemoScript: string = `

import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.incremental.runtime.state";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { MemoSkip as MemoSkip } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { ReusePoolOwnership as ReusePoolOwnership } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, Column as Column, Component as Component, ComponentV2 as ComponentV2, Entry as Entry, Builder as Builder, BuilderParam as BuilderParam } from "@ohos.arkui.component";

import { State as State, Local as Local, Computed as Computed, Monitor as Monitor } from "@ohos.arkui.stateManagement";

import { ExportStructV1 as ExportStructV1, ExportStructV1WithBody as ExportStructV1WithBody } from "./utils/struct-v1";

function main() {}

@Builder() 
@Memo() 
function aBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @MemoSkip() someState: number): void {
  const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (16129474)), 0);
  if (__memo_scope.unchanged) {
    __memo_scope.cached;
    return;
  }
  ExportStructV1._invoke(__memo_context, ((__memo_id) + (47330804)), undefined, (() => {
    return {
      someState: someState,
      __options_has_someState: true,
    };
  }), undefined, undefined, undefined);
  {
    __memo_scope.recache();
    return;
  }
}


@Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    this.__backing_aNumber = STATE_MGMT_FACTORY.makeState<number>(this, "aNumber", ((({let gensym___100945899 = initializers;
    (((gensym___100945899) == (null)) ? undefined : gensym___100945899.aNumber)})) ?? (1)));
  }
  
  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_MyStateSample | undefined)): void {
    this.__backing_aNumber!.resetOnReuse(((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.aNumber)})) ?? (1)));
  }
  
  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: MyStateSample)=> void) | undefined), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(__memo_context, ((__memo_id) + (241913892)), style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___149025070 = storage;
      (((gensym___149025070) == (null)) ? undefined : gensym___149025070())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): MyStateSample {
    throw new Error("Declare interface");
  }
  
  private __backing_aNumber?: IStateDecoratedVariable<number>;
  public get aNumber(): number {
    return this.__backing_aNumber!.get();
  }
  
  public set aNumber(value: number) {
    this.__backing_aNumber!.set(value);
  }
  
  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (141017619)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    ColumnImpl(__memo_context, ((__memo_id) + (76711614)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ColumnAttribute): void => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (137225318)), 1);
      const __memo_parameter_instance = __memo_scope.param(0, instance);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      __memo_parameter_instance.value.setColumnOptions(undefined);
      __memo_parameter_instance.value.applyAttributesFinish();
      {
        __memo_scope.recache();
        return;
      }
    }), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (46726221)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      ExportStructV1._invoke(__memo_context, ((__memo_id) + (211301233)), undefined, undefined, undefined, undefined, undefined);
      ExportStructV1WithBody._invoke(__memo_context, ((__memo_id) + (213104625)), undefined, (() => {
        return {
          __backing_someLink: this.__backing_aNumber,
          __options_has_someLink: true,
        };
      }), undefined, undefined, undefined);
      {
        __memo_scope.recache();
        return;
      }
    }));
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

@Component() class __Options_MyStateSample {
  @State() public aNumber?: number;
  public __backing_aNumber?: IStateDecoratedVariable<number>;
  public __options_has_aNumber?: boolean;
  public constructor() {}
  
}
`;

const expectDeclarationScript: string = `
import { __memo_context_type, __memo_id_type } from "arkui.incremental.runtime.state";

import { Memo } from "arkui.incremental.annotation";

import { MemoIntrinsic } from "arkui.incremental.annotation";

import { IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { LinkSourceType } from "arkui.stateManagement.decorator";

import { Memo } from "arkui.incremental.annotation";

import { ComponentBuilder } from "arkui.component.builder";

import { LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { Builder } from "arkui.component.builder";

import { CustomComponent } from "arkui.component.customComponent";

import { ReusePoolOwnership } from "arkui.component.customComponent";

import { CustomDialog, Component, ComponentV2, Entry, BuilderParam, Builder, Column, CustomDialogController } from "@ohos.arkui.component";

import { State, Link, Local, Computed, Monitor } from "@ohos.arkui.stateManagement";


@Component() export declare final struct ExportStructV1 extends CustomComponent<ExportStructV1, __Options_ExportStructV1> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ExportStructV1, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): ExportStructV1
  
  @State() public someState: number;
  @BuilderParam() @Memo() public someBuilderParam: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void
  
  public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
  
  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ExportStructV1)=> void) | undefined), initializers: ((()=> __Options_ExportStructV1) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
  
}

@Component() declare final struct NonExportStructV1 extends CustomComponent<NonExportStructV1, __Options_NonExportStructV1> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_NonExportStructV1, storage?: LocalStorage, @Builder() content?: (()=> void)): NonExportStructV1
  
  @State() public someState: number;
  @BuilderParam() public someBuilderParam: (()=> void);
  @Builder() 
  public build(): void
  
  public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
  
}

@Component() final struct StructV1WithBody extends CustomComponent<StructV1WithBody, __Options_StructV1WithBody> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_StructV1WithBody, storage?: LocalStorage, @Builder() content?: (()=> void)): StructV1WithBody
  
  @State() public someState: number = 1;
  @BuilderParam() public someBuilderParam: (()=> void);
  public build() {
    Column(){};
  }
  
  public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
  
}

@Component() export final struct ExportStructV1WithBody extends CustomComponent<ExportStructV1WithBody, __Options_ExportStructV1WithBody> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ExportStructV1WithBody, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): ExportStructV1WithBody
  
  @State() public someState: number;
  @Link() public someLink: number;
  @BuilderParam() @Memo() public someBuilderParam: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
    Column(){};
  }
  
  public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
  
  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ExportStructV1WithBody)=> void) | undefined), initializers: ((()=> __Options_ExportStructV1WithBody) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
  
}

@Component() export declare class __Options_ExportStructV1 {
  @State() public someState?: number;
  public __backing_someState?: IStateDecoratedVariable<number>;
  public __options_has_someState?: boolean;
  @Memo() public someBuilderParam?: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined);
  public __options_has_someBuilderParam?: boolean;
  public constructor()
  
}

@Component() declare class __Options_NonExportStructV1 {
  @State() public someState?: number;
  public __backing_someState?: IStateDecoratedVariable<number>;
  public __options_has_someState?: boolean;
  public someBuilderParam?: ((()=> void) | undefined);
  public __options_has_someBuilderParam?: boolean;
  public constructor()
  
}

@Component() declare class __Options_StructV1WithBody {
  @State() public someState?: number;
  public __backing_someState?: IStateDecoratedVariable<number>;
  public __options_has_someState?: boolean;
  public someBuilderParam?: ((()=> void) | undefined);
  public __options_has_someBuilderParam?: boolean;
  public constructor()
  
}

@Component() export declare class __Options_ExportStructV1WithBody {
  @State() public someState?: number;
  public __backing_someState?: IStateDecoratedVariable<number>;
  public __options_has_someState?: boolean;
  @Link() public someLink: number;
  public __backing_someLink?: LinkSourceType<number>;
  public __options_has_someLink?: boolean;
  @Memo() public someBuilderParam?: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined);
  public __options_has_someBuilderParam?: boolean;
  public constructor()
  
}

`

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
    const declarationScript = this.declContexts?.['mock.demo.mock.declarations.utils.struct-v1']?.scriptSnapshot ?? '';
    expect(parseDumpSrc(declarationScript)).toContain(parseDumpSrc(expectDeclarationScript));
}

pluginTester.run(
    'test declarations in @Component structs',
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
        tracing: { externalSourceNames: ['mock.demo.mock.declarations.utils.struct-v1'] }
    }
);
