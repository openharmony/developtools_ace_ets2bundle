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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, DECL_DIR_PATH, 'struct-dialog-usage.ets'),
];

const pluginTester = new PluginTester('test declarations in @CustomDialog structs', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsed transform',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { Memo as Memo } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { Memo as Memo } from "arkui.incremental.annotation";

import { ReusePoolOwnership as ReusePoolOwnership } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { CustomDialog as CustomDialog, Component as Component, ComponentV2 as ComponentV2, Entry as Entry, BuilderParam as BuilderParam, Builder as Builder, Column as Column, CustomDialogController as CustomDialogController } from "@ohos.arkui.component";

import { State as State, Local as Local, Computed as Computed, Monitor as Monitor } from "@ohos.arkui.stateManagement";

import { ExportCustomDialog as ExportCustomDialog, ExportCustomDialogWithBody as ExportCustomDialogWithBody } from "./utils/struct-dialog";

function main() {}

@Builder() 
@Memo() 
function aBuilder(): void {
  ExportCustomDialogWithBody._invoke((() => {
    return {
      controller: null,
      __options_has_controller: true,
    };
  }), undefined, undefined, undefined);
}


@Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_aNumber = STATE_MGMT_FACTORY.makeState<number>(this, "aNumber", ((({let gensym___100945899 = initializers;
    (((gensym___100945899) == (null)) ? undefined : gensym___100945899.aNumber)})) ?? (1)));
    this.__backing_controller = ((({let gensym___75841949 = initializers;
    (((gensym___75841949) == (null)) ? undefined : gensym___75841949.controller)})) ?? (({let gensym___149025070: Any;
    gensym___149025070 = new CustomDialogController({
      builder: @Memo() (() => {
        ExportCustomDialog._invoke((() => {
          return {
            __backing_someLink: this.__backing_aNumber,
            __options_has_someLink: true,
          };
        }), undefined, (gensym___149025070 as CustomDialogController), undefined);
      }),
      baseComponent: this,
    })
    (gensym___149025070 as CustomDialogController)})));
  }
  
  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_MyStateSample | undefined)): void {
    this.__backing_aNumber!.resetOnReuse(((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.aNumber)})) ?? (1)));
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: MyStateSample)=> void) | undefined), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___90667230 = storage;
      (((gensym___90667230) == (null)) ? undefined : gensym___90667230())}));
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
  
  private __backing_controller?: (CustomDialogController | null);
  public get controller(): (CustomDialogController | null) {
    return (this.__backing_controller as (CustomDialogController | null));
  }
  
  public set controller(value: (CustomDialogController | null)) {
    this.__backing_controller = value;
  }
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      ExportCustomDialog._invoke((() => {
        return {
          __backing_someLink: this.__backing_aNumber,
          __options_has_someLink: true,
        };
      }), undefined, undefined, undefined);
      ExportCustomDialogWithBody._invoke((() => {
        return {
          controller: this.controller,
          __options_has_controller: true,
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
  public controller?: (CustomDialogController | null);
  public __options_has_controller?: boolean;
  public constructor() {}
  
}


`;

const expectDeclarationAfterUIScript: string = `
import { Memo } from "arkui.incremental.annotation";

import { MemoIntrinsic } from "arkui.incremental.annotation";

import { LinkSourceType } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { Memo } from "arkui.incremental.annotation";

import { ComponentBuilder } from "arkui.component.builder";

import { LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { Builder } from "arkui.component.builder";

import { BaseCustomDialog } from "arkui.component.customComponent";

import { CustomDialog, Component, ComponentV2, Entry, BuilderParam, Builder, Column, CustomDialogController } from "@ohos.arkui.component";

import { State, Link, Local, Computed, Monitor } from "@ohos.arkui.stateManagement";


@CustomDialog() export declare final struct ExportCustomDialog extends BaseCustomDialog<ExportCustomDialog, __Options_ExportCustomDialog> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ExportCustomDialog, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): ExportCustomDialog
  
  @Link() public someLink: number;
  public controller?: (CustomDialogController | undefined);
  @Memo() 
  public build(): void
  
  public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
  
  @MemoIntrinsic() 
  public static _invoke(initializers: ((()=> __Options_ExportCustomDialog) | undefined), storage: ((()=> LocalStorage) | undefined), controller: (CustomDialogController | undefined), @Memo() content: ((()=> void) | undefined)): void
  
}

@CustomDialog() declare final struct NonExportCustomDialog extends BaseCustomDialog<NonExportCustomDialog, __Options_NonExportCustomDialog> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_NonExportCustomDialog, storage?: LocalStorage, @Builder() content?: (()=> void)): NonExportCustomDialog
  
  @Link() public someLink: number;
  public controller?: (CustomDialogController | undefined);
  @Builder() 
  public build(): void
  
  public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
  
}

@CustomDialog() final struct CustomDialogWithBody extends BaseCustomDialog<CustomDialogWithBody, __Options_CustomDialogWithBody> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_CustomDialogWithBody, storage?: LocalStorage, @Builder() content?: (()=> void)): CustomDialogWithBody
  
  @State() public someState: number = 1;
  public controller: (CustomDialogController | null) = new CustomDialogController({
    builder: NonExportCustomDialog({
      someLink: this.someState,
    }),
  });
  public build(): void {
    Column(){};
  }
  
  public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
  
}

@CustomDialog() export final struct ExportCustomDialogWithBody extends BaseCustomDialog<ExportCustomDialogWithBody, __Options_ExportCustomDialogWithBody> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ExportCustomDialogWithBody, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): ExportCustomDialogWithBody
  
  @State() public someState: number;
  public controller: (CustomDialogController | null);
  @Memo() 
  public build(): void {
    Column(){};
  }
  
  public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
  
  public static _buildCompatibleNode(options: __Options_ExportCustomDialogWithBody): void
  
  @MemoIntrinsic() 
  public static _invoke(initializers: ((()=> __Options_ExportCustomDialogWithBody) | undefined), storage: ((()=> LocalStorage) | undefined), controller: (CustomDialogController | undefined), @Memo() content: ((()=> void) | undefined)): void
  
}

@CustomDialog() export declare class __Options_ExportCustomDialog {
  @Link() public someLink: number;
  public __backing_someLink?: LinkSourceType<number>;
  public __options_has_someLink?: boolean;
  public controller?: (CustomDialogController | undefined);
  public __options_has_controller?: boolean;
  public constructor()
  
}

@CustomDialog() declare class __Options_NonExportCustomDialog {
  @Link() public someLink: number;
  public __backing_someLink?: LinkSourceType<number>;
  public __options_has_someLink?: boolean;
  public controller?: (CustomDialogController | undefined);
  public __options_has_controller?: boolean;
  public constructor()
  
}

@CustomDialog() declare class __Options_CustomDialogWithBody {
  @State() public someState?: number;
  public __backing_someState?: IStateDecoratedVariable<number>;
  public __options_has_someState?: boolean;
  public controller?: (CustomDialogController | null);
  public __options_has_controller?: boolean;
  public constructor()
  
}

@CustomDialog() export declare class __Options_ExportCustomDialogWithBody {
  @State() public someState?: number;
  public __backing_someState?: IStateDecoratedVariable<number>;
  public __options_has_someState?: boolean;
  public controller?: (CustomDialogController | null);
  public __options_has_controller?: boolean;
  public constructor()
  
}

`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
    const declarationScript = this.declContexts?.['mock.demo.mock.declarations.utils.struct-dialog']?.scriptSnapshot ?? '';
    expect(parseDumpSrc(declarationScript)).toContain(parseDumpSrc(expectDeclarationAfterUIScript));
}

const expectedMemoScript: string = `

import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.incremental.runtime.state";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { Memo as Memo } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { Memo as Memo } from "arkui.incremental.annotation";

import { ReusePoolOwnership as ReusePoolOwnership } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { CustomDialog as CustomDialog, Component as Component, ComponentV2 as ComponentV2, Entry as Entry, BuilderParam as BuilderParam, Builder as Builder, Column as Column, CustomDialogController as CustomDialogController } from "@ohos.arkui.component";

import { State as State, Local as Local, Computed as Computed, Monitor as Monitor } from "@ohos.arkui.stateManagement";

import { ExportCustomDialog as ExportCustomDialog, ExportCustomDialogWithBody as ExportCustomDialogWithBody } from "./utils/struct-dialog";

function main() {}

@Builder() 
@Memo() 
function aBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
  const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (16129474)), 0);
  if (__memo_scope.unchanged) {
    __memo_scope.cached;
    return;
  }
  ExportCustomDialogWithBody._invoke(__memo_context, ((__memo_id) + (47330804)), (() => {
    return {
      controller: null,
      __options_has_controller: true,
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
    this.__backing_controller = ((({let gensym___75841949 = initializers;
    (((gensym___75841949) == (null)) ? undefined : gensym___75841949.controller)})) ?? (({let gensym___149025070: Any;
    gensym___149025070 = new CustomDialogController({
      builder: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (137225318)), 0);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        ExportCustomDialog._invoke(__memo_context, ((__memo_id) + (241913892)), (() => {
          return {
            __backing_someLink: this.__backing_aNumber,
            __options_has_someLink: true,
          };
        }), undefined, (gensym___149025070 as CustomDialogController), undefined);
        {
          __memo_scope.recache();
          return;
        }
      }),
      baseComponent: this,
    })
    (gensym___149025070 as CustomDialogController)})));
  }
  
  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_MyStateSample | undefined)): void {
    this.__backing_aNumber!.resetOnReuse(((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.aNumber)})) ?? (1)));
  }
  
  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: MyStateSample)=> void) | undefined), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(__memo_context, ((__memo_id) + (211301233)), style, ((): MyStateSample => {
      return new MyStateSample(false, ({let gensym___90667230 = storage;
      (((gensym___90667230) == (null)) ? undefined : gensym___90667230())}));
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
  
  private __backing_controller?: (CustomDialogController | null);
  public get controller(): (CustomDialogController | null) {
    return (this.__backing_controller as (CustomDialogController | null));
  }
  
  public set controller(value: (CustomDialogController | null)) {
    this.__backing_controller = value;
  }
  
  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (6000834)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    ColumnImpl(__memo_context, ((__memo_id) + (223657391)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ColumnAttribute): void => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (213104625)), 1);
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
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (218979098)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      ExportCustomDialog._invoke(__memo_context, ((__memo_id) + (46726221)), (() => {
        return {
          __backing_someLink: this.__backing_aNumber,
          __options_has_someLink: true,
        };
      }), undefined, undefined, undefined);
      ExportCustomDialogWithBody._invoke(__memo_context, ((__memo_id) + (76711614)), (() => {
        return {
          controller: this.controller,
          __options_has_controller: true,
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
  public controller?: (CustomDialogController | null);
  public __options_has_controller?: boolean;
  public constructor() {}
  
}


`;

const expectDeclarationScript: string = `

import { __memo_context_type, __memo_id_type } from "arkui.incremental.runtime.state";

import { Memo } from "arkui.incremental.annotation";

import { MemoIntrinsic } from "arkui.incremental.annotation";

import { LinkSourceType } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { Memo } from "arkui.incremental.annotation";

import { ComponentBuilder } from "arkui.component.builder";

import { LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { Builder } from "arkui.component.builder";

import { BaseCustomDialog } from "arkui.component.customComponent";

import { CustomDialog, Component, ComponentV2, Entry, BuilderParam, Builder, Column, CustomDialogController } from "@ohos.arkui.component";

import { State, Link, Local, Computed, Monitor } from "@ohos.arkui.stateManagement";


@CustomDialog() export declare final struct ExportCustomDialog extends BaseCustomDialog<ExportCustomDialog, __Options_ExportCustomDialog> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ExportCustomDialog, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): ExportCustomDialog
  
  @Link() public someLink: number;
  public controller?: (CustomDialogController | undefined);
  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void
  
  public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
  
  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, initializers: ((()=> __Options_ExportCustomDialog) | undefined), storage: ((()=> LocalStorage) | undefined), controller: (CustomDialogController | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
  
}

@CustomDialog() declare final struct NonExportCustomDialog extends BaseCustomDialog<NonExportCustomDialog, __Options_NonExportCustomDialog> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_NonExportCustomDialog, storage?: LocalStorage, @Builder() content?: (()=> void)): NonExportCustomDialog
  
  @Link() public someLink: number;
  public controller?: (CustomDialogController | undefined);
  @Builder() 
  public build(): void
  
  public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
  
}

@CustomDialog() final struct CustomDialogWithBody extends BaseCustomDialog<CustomDialogWithBody, __Options_CustomDialogWithBody> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_CustomDialogWithBody, storage?: LocalStorage, @Builder() content?: (()=> void)): CustomDialogWithBody
  
  @State() public someState: number = 1;
  public controller: (CustomDialogController | null) = new CustomDialogController({
    builder: NonExportCustomDialog({
      someLink: this.someState,
    }),
  });
  public build(): void {
    Column(){};
  }
  
  public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
  
}

@CustomDialog() export final struct ExportCustomDialogWithBody extends BaseCustomDialog<ExportCustomDialogWithBody, __Options_ExportCustomDialogWithBody> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ExportCustomDialogWithBody, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): ExportCustomDialogWithBody
  
  @State() public someState: number;
  public controller: (CustomDialogController | null);
  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
    Column(){};
  }
  
  public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
  
  public static _buildCompatibleNode(options: __Options_ExportCustomDialogWithBody): void
  
  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, initializers: ((()=> __Options_ExportCustomDialogWithBody) | undefined), storage: ((()=> LocalStorage) | undefined), controller: (CustomDialogController | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
  
}

@CustomDialog() export declare class __Options_ExportCustomDialog {
  @Link() public someLink: number;
  public __backing_someLink?: LinkSourceType<number>;
  public __options_has_someLink?: boolean;
  public controller?: (CustomDialogController | undefined);
  public __options_has_controller?: boolean;
  public constructor()
  
}

@CustomDialog() declare class __Options_NonExportCustomDialog {
  @Link() public someLink: number;
  public __backing_someLink?: LinkSourceType<number>;
  public __options_has_someLink?: boolean;
  public controller?: (CustomDialogController | undefined);
  public __options_has_controller?: boolean;
  public constructor()
  
}

@CustomDialog() declare class __Options_CustomDialogWithBody {
  @State() public someState?: number;
  public __backing_someState?: IStateDecoratedVariable<number>;
  public __options_has_someState?: boolean;
  public controller?: (CustomDialogController | null);
  public __options_has_controller?: boolean;
  public constructor()
  
}

@CustomDialog() export declare class __Options_ExportCustomDialogWithBody {
  @State() public someState?: number;
  public __backing_someState?: IStateDecoratedVariable<number>;
  public __options_has_someState?: boolean;
  public controller?: (CustomDialogController | null);
  public __options_has_controller?: boolean;
  public constructor()
  
}

`

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
    const declarationScript = this.declContexts?.['mock.demo.mock.declarations.utils.struct-dialog']?.scriptSnapshot ?? '';
    expect(parseDumpSrc(declarationScript)).toContain(parseDumpSrc(expectDeclarationScript));
}

pluginTester.run(
    'test declarations in @CustomDialog structs',
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
        tracing: { externalSourceNames: ['mock.demo.mock.declarations.utils.struct-dialog'] }
    }
);
