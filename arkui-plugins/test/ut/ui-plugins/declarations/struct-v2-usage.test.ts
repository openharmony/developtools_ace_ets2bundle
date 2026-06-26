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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, DECL_DIR_PATH, 'struct-v2-usage.ets'),
];

const pluginTester = new PluginTester('test declarations in @ComponentV2 structs', buildConfig);

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

import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { MemoSkip as MemoSkip } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { ReusePoolOwnership as ReusePoolOwnership } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, Column as Column, Component as Component, ComponentV2 as ComponentV2, Entry as Entry, Builder as Builder, BuilderParam as BuilderParam } from "@ohos.arkui.component";

import { State as State, Local as Local, Computed as Computed, Monitor as Monitor } from "@ohos.arkui.stateManagement";

import { ExportStructV2 as ExportStructV2, ExportStructV2WithBody as ExportStructV2WithBody } from "./utils/struct-v2";

function main() {}

@Builder() 
@Memo() 
function aBuilder(@MemoSkip() someRequiredParam: number): void {
  ExportStructV2WithBody._invoke(undefined, (() => {
    return {
      someRequiredParam: someRequiredParam,
      __options_has_someRequiredParam: true,
    };
  }), undefined, undefined, undefined);
}


@ComponentV2() final struct MyStateSample extends CustomComponentV2<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_aNumber = STATE_MGMT_FACTORY.makeLocal<number>(this, "aNumber", 1);
  }
  
  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_MyStateSample | undefined)): void {
    this.__backing_aNumber!.resetOnReuse(1);
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: MyStateSample)=> void) | undefined), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<MyStateSample, __Options_MyStateSample>(style, ((): MyStateSample => {
      return new MyStateSample();
    }), initializers, reuseId, content, {
      sClass: Class.from<MyStateSample>(),
    });
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): MyStateSample {
    throw new Error("Declare interface");
  }
  
  private __backing_aNumber?: ILocalDecoratedVariable<number>;
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
      ExportStructV2._invoke(undefined, undefined, undefined, undefined, undefined);
      ExportStructV2WithBody._invoke(undefined, (() => {
        return {
          someParam: this.aNumber,
          __options_has_someParam: true,
          someRequiredParam: this.aNumber,
          __options_has_someRequiredParam: true,
        };
      }), undefined, undefined, undefined);
    }));
  }
  
  public constructor() {}
  
  static {
    
  }
}

@ComponentV2() class __Options_MyStateSample {
  @Local() public aNumber?: number;
  public __backing_aNumber?: ILocalDecoratedVariable<number>;
  public __options_has_aNumber?: boolean;
  public constructor() {}
  
}


`;

const expectDeclarationAfterUIScript: string = `
import { Memo } from "arkui.incremental.annotation";

import { MemoIntrinsic } from "arkui.incremental.annotation";

import { ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { IParamDecoratedVariable } from "arkui.stateManagement.decorator";

import { Memo } from "arkui.incremental.annotation";

import { ComponentBuilder } from "arkui.component.builder";

import { LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { Builder } from "arkui.component.builder";

import { CustomComponentV2 } from "arkui.component.customComponent";

import { ReusePoolOwnership } from "arkui.component.customComponent";

import { CustomDialog, Component, ComponentV2, Entry, BuilderParam, Builder, Column, CustomDialogController } from "@ohos.arkui.component";

import { State, Link, Local, Param, Require, Computed, Monitor } from "@ohos.arkui.stateManagement";


@ComponentV2() export declare final struct ExportStructV2 extends CustomComponentV2<ExportStructV2, __Options_ExportStructV2> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ExportStructV2, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): ExportStructV2
  
  @Local() public someLocal: number;
  @BuilderParam() @Memo() public someBuilderParam: (()=> void);
  @Computed() 
  public get someComputed(): number
  
  @Monitor({value:["someLocal"]}) 
  public onSomeLocalChanged(): void
  
  @Memo() 
  public build(): void
  
  public constructor()
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: ExportStructV2)=> void) | undefined), initializers: ((()=> __Options_ExportStructV2) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void
  
}

@ComponentV2() declare final struct NonExportStructV2 extends CustomComponentV2<NonExportStructV2, __Options_NonExportStructV2> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_NonExportStructV2, storage?: LocalStorage, @Builder() content?: (()=> void)): NonExportStructV2
  
  @Local() public someLocal: number;
  @BuilderParam() public someBuilderParam: (()=> void);
  @Computed() 
  public get someComputed(): number
  
  @Monitor({value:["someLocal"]}) 
  public onSomeLocalChanged(): void
  
  @Builder() 
  public build(): void
  
  public constructor()
  
}

@ComponentV2() final struct StructV2WithBody extends CustomComponentV2<StructV2WithBody, __Options_StructV2WithBody> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_StructV2WithBody, storage?: LocalStorage, @Builder() content?: (()=> void)): StructV2WithBody
  
  @Local() public someLocal: number = 1;
  @BuilderParam() public someBuilderParam: (()=> void);
  @Computed() 
  public get someComputed(): number {
    return this.someLocal;
  }
  
  @Monitor({value:["someLocal"]}) 
  public onSomeLocalChanged(): void {}
  
  public build() {
    Column(){};
  }
  
  public constructor() {}
  
}

@ComponentV2() export final struct ExportStructV2WithBody extends CustomComponentV2<ExportStructV2WithBody, __Options_ExportStructV2WithBody> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ExportStructV2WithBody, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): ExportStructV2WithBody
  
  @Local() public someLocal: number;
  @Param() public someParam: number;
  @Require() @Param() public someRequiredParam: number;
  @BuilderParam() @Memo() public someBuilderParam: (()=> void);
  @Computed() 
  public get someComputed(): number {
    return this.someLocal;
  }
  
  @Monitor({value:["someLocal"]}) 
  public onSomeLocalChanged(): void {}
  
  @Memo() 
  public build(): void {
    Column(){};
  }
  
  public constructor() {}
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: ExportStructV2WithBody)=> void) | undefined), initializers: ((()=> __Options_ExportStructV2WithBody) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void
  
}

@ComponentV2() export declare class __Options_ExportStructV2 {
  @Local() public someLocal?: number;
  public __backing_someLocal?: ILocalDecoratedVariable<number>;
  public __options_has_someLocal?: boolean;
  @Memo() public someBuilderParam?: ((()=> void) | undefined);
  public __options_has_someBuilderParam?: boolean;
  public constructor()
  
}

@ComponentV2() declare class __Options_NonExportStructV2 {
  @Local() public someLocal?: number;
  public __backing_someLocal?: ILocalDecoratedVariable<number>;
  public __options_has_someLocal?: boolean;
  public someBuilderParam?: ((()=> void) | undefined);
  public __options_has_someBuilderParam?: boolean;
  public constructor()
  
}

@ComponentV2() declare class __Options_StructV2WithBody {
  @Local() public someLocal?: number;
  public __backing_someLocal?: ILocalDecoratedVariable<number>;
  public __options_has_someLocal?: boolean;
  public someBuilderParam?: ((()=> void) | undefined);
  public __options_has_someBuilderParam?: boolean;
  public constructor()
  
}

@ComponentV2() export declare class __Options_ExportStructV2WithBody {
  @Local() public someLocal?: number;
  public __backing_someLocal?: ILocalDecoratedVariable<number>;
  public __options_has_someLocal?: boolean;
  @Param() public someParam?: number;
  public __backing_someParam?: IParamDecoratedVariable<number>;
  public __options_has_someParam?: boolean;
  @Require() @Param() public someRequiredParam: number;
  public __backing_someRequiredParam?: IParamDecoratedVariable<number>;
  public __options_has_someRequiredParam?: boolean;
  @Memo() public someBuilderParam?: ((()=> void) | undefined);
  public __options_has_someBuilderParam?: boolean;
  public constructor()
  
}

`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
    const declarationScript = this.declContexts?.['mock.demo.mock.declarations.utils.struct-v2']?.scriptSnapshot ?? '';
    expect(parseDumpSrc(declarationScript)).toContain(parseDumpSrc(expectDeclarationAfterUIScript));
}

const expectedMemoScript: string = `

import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.incremental.runtime.state";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { MemoSkip as MemoSkip } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { ReusePoolOwnership as ReusePoolOwnership } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, Column as Column, Component as Component, ComponentV2 as ComponentV2, Entry as Entry, Builder as Builder, BuilderParam as BuilderParam } from "@ohos.arkui.component";

import { State as State, Local as Local, Computed as Computed, Monitor as Monitor } from "@ohos.arkui.stateManagement";

import { ExportStructV2 as ExportStructV2, ExportStructV2WithBody as ExportStructV2WithBody } from "./utils/struct-v2";

function main() {}

@Builder() 
@Memo() 
function aBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @MemoSkip() someRequiredParam: number): void {
  const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (16129474)), 0);
  if (__memo_scope.unchanged) {
    __memo_scope.cached;
    return;
  }
  ExportStructV2WithBody._invoke(__memo_context, ((__memo_id) + (47330804)), undefined, (() => {
    return {
      someRequiredParam: someRequiredParam,
      __options_has_someRequiredParam: true,
    };
  }), undefined, undefined, undefined);
  {
    __memo_scope.recache();
    return;
  }
}


@ComponentV2() final struct MyStateSample extends CustomComponentV2<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    this.__backing_aNumber = STATE_MGMT_FACTORY.makeLocal<number>(this, "aNumber", 1);
  }
  
  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_MyStateSample | undefined)): void {
    this.__backing_aNumber!.resetOnReuse(1);
  }
  
  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: MyStateSample)=> void) | undefined), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<MyStateSample, __Options_MyStateSample>(__memo_context, ((__memo_id) + (241913892)), style, ((): MyStateSample => {
      return new MyStateSample();
    }), initializers, reuseId, content, {
      sClass: Class.from<MyStateSample>(),
    });
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): MyStateSample {
    throw new Error("Declare interface");
  }
  
  private __backing_aNumber?: ILocalDecoratedVariable<number>;
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
      ExportStructV2._invoke(__memo_context, ((__memo_id) + (211301233)), undefined, undefined, undefined, undefined, undefined);
      ExportStructV2WithBody._invoke(__memo_context, ((__memo_id) + (213104625)), undefined, (() => {
        return {
          someParam: this.aNumber,
          __options_has_someParam: true,
          someRequiredParam: this.aNumber,
          __options_has_someRequiredParam: true,
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
  
  public constructor() {}
  
  static {
    
  }
}

@ComponentV2() class __Options_MyStateSample {
  @Local() public aNumber?: number;
  public __backing_aNumber?: ILocalDecoratedVariable<number>;
  public __options_has_aNumber?: boolean;
  public constructor() {}
  
}


`;

const expectDeclarationScript: string = `
import { __memo_context_type, __memo_id_type } from "arkui.incremental.runtime.state";

import { Memo } from "arkui.incremental.annotation";

import { MemoIntrinsic } from "arkui.incremental.annotation";

import { ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { IParamDecoratedVariable } from "arkui.stateManagement.decorator";

import { Memo } from "arkui.incremental.annotation";

import { ComponentBuilder } from "arkui.component.builder";

import { LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { Builder } from "arkui.component.builder";

import { CustomComponentV2 } from "arkui.component.customComponent";

import { ReusePoolOwnership } from "arkui.component.customComponent";

import { CustomDialog, Component, ComponentV2, Entry, BuilderParam, Builder, Column, CustomDialogController } from "@ohos.arkui.component";

import { State, Link, Local, Param, Require, Computed, Monitor } from "@ohos.arkui.stateManagement";


@ComponentV2() export declare final struct ExportStructV2 extends CustomComponentV2<ExportStructV2, __Options_ExportStructV2> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ExportStructV2, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): ExportStructV2
  
  @Local() public someLocal: number;
  @BuilderParam() @Memo() public someBuilderParam: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
  @Computed() 
  public get someComputed(): number
  
  @Monitor({value:["someLocal"]}) 
  public onSomeLocalChanged(): void
  
  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void
  
  public constructor()
  
  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ExportStructV2)=> void) | undefined), initializers: ((()=> __Options_ExportStructV2) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
  
}

@ComponentV2() declare final struct NonExportStructV2 extends CustomComponentV2<NonExportStructV2, __Options_NonExportStructV2> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_NonExportStructV2, storage?: LocalStorage, @Builder() content?: (()=> void)): NonExportStructV2
  
  @Local() public someLocal: number;
  @BuilderParam() public someBuilderParam: (()=> void);
  @Computed() 
  public get someComputed(): number
  
  @Monitor({value:["someLocal"]}) 
  public onSomeLocalChanged(): void
  
  @Builder() 
  public build(): void
  
  public constructor()
  
}

@ComponentV2() final struct StructV2WithBody extends CustomComponentV2<StructV2WithBody, __Options_StructV2WithBody> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_StructV2WithBody, storage?: LocalStorage, @Builder() content?: (()=> void)): StructV2WithBody
  
  @Local() public someLocal: number = 1;
  @BuilderParam() public someBuilderParam: (()=> void);
  @Computed() 
  public get someComputed(): number {
    return this.someLocal;
  }
  
  @Monitor({value:["someLocal"]}) 
  public onSomeLocalChanged(): void {}
  
  public build() {
    Column(){};
  }
  
  public constructor() {}
  
}

@ComponentV2() export final struct ExportStructV2WithBody extends CustomComponentV2<ExportStructV2WithBody, __Options_ExportStructV2WithBody> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ExportStructV2WithBody, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): ExportStructV2WithBody
  
  @Local() public someLocal: number;
  @Param() public someParam: number;
  @Require() @Param() public someRequiredParam: number;
  @BuilderParam() @Memo() public someBuilderParam: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
  @Computed() 
  public get someComputed(): number {
    return this.someLocal;
  }
  
  @Monitor({value:["someLocal"]}) 
  public onSomeLocalChanged(): void {}
  
  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
    Column(){};
  }
  
  public constructor() {}
  
  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ExportStructV2WithBody)=> void) | undefined), initializers: ((()=> __Options_ExportStructV2WithBody) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
  
}

@ComponentV2() export declare class __Options_ExportStructV2 {
  @Local() public someLocal?: number;
  public __backing_someLocal?: ILocalDecoratedVariable<number>;
  public __options_has_someLocal?: boolean;
  @Memo() public someBuilderParam?: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined);
  public __options_has_someBuilderParam?: boolean;
  public constructor()
  
}

@ComponentV2() declare class __Options_NonExportStructV2 {
  @Local() public someLocal?: number;
  public __backing_someLocal?: ILocalDecoratedVariable<number>;
  public __options_has_someLocal?: boolean;
  public someBuilderParam?: ((()=> void) | undefined);
  public __options_has_someBuilderParam?: boolean;
  public constructor()
  
}

@ComponentV2() declare class __Options_StructV2WithBody {
  @Local() public someLocal?: number;
  public __backing_someLocal?: ILocalDecoratedVariable<number>;
  public __options_has_someLocal?: boolean;
  public someBuilderParam?: ((()=> void) | undefined);
  public __options_has_someBuilderParam?: boolean;
  public constructor()
  
}

@ComponentV2() export declare class __Options_ExportStructV2WithBody {
  @Local() public someLocal?: number;
  public __backing_someLocal?: ILocalDecoratedVariable<number>;
  public __options_has_someLocal?: boolean;
  @Param() public someParam?: number;
  public __backing_someParam?: IParamDecoratedVariable<number>;
  public __options_has_someParam?: boolean;
  @Require() @Param() public someRequiredParam: number;
  public __backing_someRequiredParam?: IParamDecoratedVariable<number>;
  public __options_has_someRequiredParam?: boolean;
  @Memo() public someBuilderParam?: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined);
  public __options_has_someBuilderParam?: boolean;
  public constructor()
  
}

`

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
    const declarationScript = this.declContexts?.['mock.demo.mock.declarations.utils.struct-v2']?.scriptSnapshot ?? '';
    expect(parseDumpSrc(declarationScript)).toContain(parseDumpSrc(expectDeclarationScript));
}

pluginTester.run(
    'test declarations in @ComponentV2 structs',
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
        tracing: { externalSourceNames: ['mock.demo.mock.declarations.utils.struct-v2'] }
    }
);
