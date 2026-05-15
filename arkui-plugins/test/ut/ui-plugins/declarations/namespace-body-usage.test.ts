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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, DECL_DIR_PATH, 'namespace-body-usage.ets'),
];

const pluginTester = new PluginTester('test declarations in namespace with body', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsed transform',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `

import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { _rawfile as _rawfile } from "arkui.component.resources";

import { MemoSkip as MemoSkip } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { Memo as Memo } from "arkui.incremental.annotation";

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { ReusePoolOwnership as ReusePoolOwnership } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, Column as Column, Component as Component, ComponentV2 as ComponentV2, Entry as Entry, Builder as Builder, BuilderParam as BuilderParam, Resource as Resource, $r as $r, $rawfile as $rawfile, CustomDialogController as CustomDialogController } from "@ohos.arkui.component";

import { Observed as Observed, ObservedV2 as ObservedV2, Track as Track, Trace as Trace, Monitor as Monitor, Computed as Computed, Local as Local, State as State } from "@ohos.arkui.stateManagement";

import aNamespaceWithBody from "./utils/namespace-body";

const SomeObClassVar = new SomeObClass(1);
const SomeObClassImplVar = new SomeObClassImpl(2);
const SomeObClassWithTrackVar = new SomeObClassWithTrack(3);
const SomeTrClassInheritVar = new SomeTrClassInherit();
const ExportObservedWithBodyVar = new aNamespaceWithBody.ExportObservedWithBody();
const ExportObservedImplWithBodyVar = new aNamespaceWithBody.ExportObservedImplWithBody();
const ExportObservedWithTrackWithBodyVar = new aNamespaceWithBody.ExportObservedWithTrackWithBody();
const ExportTrackWithoutObservedWithBodyVar = new aNamespaceWithBody.ExportTrackWithoutObservedWithBody();
const SomeObV2ClassVar = new SomeObV2Class(1);
const SomeObV2ClassImplVar = new SomeObV2ClassImpl(2);
const ExportObservedV2WithBodyVar = new aNamespaceWithBody.ExportObservedV2WithBody(1);
const ExportObservedV2InheritWithBodyVar = new aNamespaceWithBody.ExportObservedV2InheritWithBody(2);
function main() {}

@Builder() 
@Memo() 
function ConstantBuilder(): void {
  TextImpl(@Memo() ((instance: TextAttribute): void => {
    instance.setTextOptions(aNamespaceWithBody.EXPORT_RESOURCE, undefined);
    instance.applyAttributesFinish();
    return;
  }), undefined);
  aNamespaceWithBody.EXPORT_WRAPPED_BUILDER.builder("name", 1);
}

@Builder() 
@Memo() 
function aBuilder(): void {
  aNamespaceWithBody.ExportCustomDialogWithBody._invoke((() => {
    return {
      controller: null,
      __options_has_controller: true,
    };
  }), undefined, undefined, undefined);
  aNamespaceWithBody.ExportEntryStructWithBody._invoke(undefined, undefined, undefined, undefined, undefined);
  aNamespaceWithBody.ExportStructV1._invoke(undefined, undefined, undefined, undefined, undefined);
}

@Builder() 
@Memo() 
function aBuilder1(@MemoSkip() someRequiredParam: number): void {
  aNamespaceWithBody.ExportStructV2WithBody._invoke(undefined, (() => {
    return {
      someRequiredParam: someRequiredParam,
      __options_has_someRequiredParam: true,
    };
  }), undefined, undefined, undefined);
}

function mockFunction(obj: aNamespaceWithBody.IBuilderInArgs): void {
  obj.mockBuilderMethod1((() => {}));
  obj.mockBuilderMethod2((() => {}));
}

aNamespaceWithBody.EXPORT_RAWFILE = _rawfile(0, 30000, "com.example.mock", "entry", "app.mock.txt");
__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../declarations/namespace-body-usage",
  pageFullPath: "test/demo/mock/declarations/namespace-body-usage",
  integratedHsp: "false",
} as NavInterface));
class SomeObClass extends aNamespaceWithBody.ExportObserved implements aNamespaceWithBody.IO {
  public someMethod(): void {
    console.log(this.t1);
  }
  
  public constructor(t1: number) {
    super();
    this.t1 = t1;
  }
  
  public get t1(): number
  public set t1(t1: number)
  
}

class SomeObClassImpl extends aNamespaceWithBody.ExportObservedImpl {
  public someMethod(): void {
    console.log(this.t1);
  }
  
  public constructor(t1: number) {
    super();
    this.t1 = t1;
  }
  
}

class SomeObClassWithTrack extends aNamespaceWithBody.ExportObservedWithTrack {
  public t1: number = 1;
  public constructor(t2: number) {
    super();
    this.t2 = t2;
  }
  
}

class SomeTrClassInherit extends aNamespaceWithBody.ExportTrackWithoutObserved {
  public constructor() {}
  
}

class SomeObV2Class extends aNamespaceWithBody.ExportObservedV2 implements aNamespaceWithBody.IO {
  public someMethod(): void {
    console.log(this.t1);
  }
  
  public constructor(t1: number) {
    super();
    this.t1 = t1;
  }
  
  public get t1(): number
  public set t1(t1: number)
  
}

class SomeObV2ClassImpl extends aNamespaceWithBody.ExportObservedV2Inherit {
  public someMethod(): void {
    console.log(this.t1);
  }
  
  public constructor(t1: number) {
    super();
    this.t1 = t1;
  }
  
}

@Component() final struct ConstantStruct extends CustomComponent<ConstantStruct, __Options_ConstantStruct> {
  public __initializeStruct(initializers: (__Options_ConstantStruct | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_stateVar = STATE_MGMT_FACTORY.makeState<Resource>(this, "stateVar", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_stateVar)}) ? (initializers!.stateVar as Resource) : (aNamespaceWithBody.EXPORT_RESOURCE as Resource)));
  }
  
  public __updateStruct(initializers: (__Options_ConstantStruct | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_ConstantStruct | undefined)): void {
    this.__backing_stateVar!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.stateVar)})) ?? (aNamespaceWithBody.EXPORT_RESOURCE)) as Resource));
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: ConstantStruct)=> void) | undefined), initializers: ((()=> __Options_ConstantStruct) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<ConstantStruct, __Options_ConstantStruct>(style, ((): ConstantStruct => {
      return new ConstantStruct(false, ({let gensym___46528967 = storage;
      (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ConstantStruct, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): ConstantStruct {
    throw new Error("Declare interface");
  }
  
  private __backing_stateVar?: IStateDecoratedVariable<Resource>;
  public get stateVar(): Resource {
    return this.__backing_stateVar!.get();
  }
  
  public set stateVar(value: Resource) {
    this.__backing_stateVar!.set(value);
  }
  
  @Memo() 
  public build() {}
  
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  
  static {
    
  }
}

@Component() final struct DialogStruct extends CustomComponent<DialogStruct, __Options_DialogStruct> {
  public __initializeStruct(initializers: (__Options_DialogStruct | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_aNumber = STATE_MGMT_FACTORY.makeState<number>(this, "aNumber", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_aNumber)}) ? (initializers!.aNumber as number) : (1 as number)));
    this.__backing_controller = (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_controller)}) ? (initializers!.controller as (CustomDialogController | null)) : (({let gensym___<some_random_number>: Any;
    gensym___192738000 = new CustomDialogController({
      builder: @Memo() (() => {
        aNamespaceWithBody.ExportCustomDialog._invoke((() => {
          return {
            __backing_someLink: (this.__backing_aNumber as IStateDecoratedVariable<number>),
            __options_has_someLink: true,
          };
        }), undefined, (gensym___192738000 as CustomDialogController), undefined);
      }),
      baseComponent: this,
    })
    (gensym___<some_random_number> as CustomDialogController)}) as (CustomDialogController | null)));
  }
  
  public __updateStruct(initializers: (__Options_DialogStruct | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_DialogStruct | undefined)): void {
    this.__backing_aNumber!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.aNumber)})) ?? (1)) as number));
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: DialogStruct)=> void) | undefined), initializers: ((()=> __Options_DialogStruct) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<DialogStruct, __Options_DialogStruct>(style, ((): DialogStruct => {
      return new DialogStruct(false, ({let gensym___92334354 = storage;
      (((gensym___92334354) == (null)) ? undefined : gensym___92334354())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_DialogStruct, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): DialogStruct {
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
      aNamespaceWithBody.ExportCustomDialog._invoke((() => {
        return {
          __backing_someLink: (this.__backing_aNumber as IStateDecoratedVariable<number>),
          __options_has_someLink: true,
        };
      }), undefined, undefined, undefined);
      aNamespaceWithBody.ExportCustomDialogWithBody._invoke((() => {
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

@Entry() @Component() final struct EntryStructWithBody extends CustomComponent<EntryStructWithBody, __Options_EntryStructWithBody> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_EntryStructWithBody | undefined), @Memo() content: ((()=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_EntryStructWithBody | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_EntryStructWithBody | undefined)): void {}
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: EntryStructWithBody)=> void) | undefined), initializers: ((()=> __Options_EntryStructWithBody) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<EntryStructWithBody, __Options_EntryStructWithBody>(style, ((): EntryStructWithBody => {
      return new EntryStructWithBody(false, ({let gensym___29142858 = storage;
      (((gensym___29142858) == (null)) ? undefined : gensym___29142858())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_EntryStructWithBody, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): EntryStructWithBody {
    throw new Error("Declare interface");
  }
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      aNamespaceWithBody.ExportEntryStructWithBody._invoke(undefined, undefined, undefined, undefined, undefined);
    }));
  }
  
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  
  static {
    
  }
}

@Component() final struct V1Struct extends CustomComponent<V1Struct, __Options_V1Struct> {
  public __initializeStruct(initializers: (__Options_V1Struct | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_aNumber = STATE_MGMT_FACTORY.makeState<number>(this, "aNumber", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_aNumber)}) ? (initializers!.aNumber as number) : (1 as number)));
  }
  
  public __updateStruct(initializers: (__Options_V1Struct | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_V1Struct | undefined)): void {
    this.__backing_aNumber!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.aNumber)})) ?? (1)) as number));
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: V1Struct)=> void) | undefined), initializers: ((()=> __Options_V1Struct) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<V1Struct, __Options_V1Struct>(style, ((): V1Struct => {
      return new V1Struct(false, ({let gensym___56395834 = storage;
      (((gensym___56395834) == (null)) ? undefined : gensym___56395834())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_V1Struct, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): V1Struct {
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
      aNamespaceWithBody.ExportStructV1._invoke(undefined, undefined, undefined, undefined, undefined);
      aNamespaceWithBody.ExportStructV1WithBody._invoke(undefined, (() => {
        return {
          __backing_someLink: (this.__backing_aNumber as IStateDecoratedVariable<number>),
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

@ComponentV2() final struct V2Struct extends CustomComponentV2<V2Struct, __Options_V2Struct> {
  public __initializeStruct(initializers: (__Options_V2Struct | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_aNumber = STATE_MGMT_FACTORY.makeLocal<number>(this, "aNumber", 1);
  }
  
  public __updateStruct(initializers: (__Options_V2Struct | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_V2Struct | undefined)): void {
    this.__backing_aNumber!.resetOnReuse(1);
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: V2Struct)=> void) | undefined), initializers: ((()=> __Options_V2Struct) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<V2Struct, __Options_V2Struct>(style, ((): V2Struct => {
      return new V2Struct();
    }), initializers, reuseId, content, {
      sClass: Class.from<V2Struct>(),
    });
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_V2Struct, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): V2Struct {
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
      aNamespaceWithBody.ExportStructV2._invoke(undefined, undefined, undefined, undefined, undefined);
      aNamespaceWithBody.ExportStructV2WithBody._invoke(undefined, (() => {
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

class __EntryWrapper extends EntryPoint {
  @Memo() 
  public entry(): void {
    EntryStructWithBody._invoke(undefined, undefined, undefined, undefined, undefined);
  }
  
  public static RegisterNamedRouter(routerName: string, instance: EntryPoint, param: NavInterface): void {
    EntryPoint.RegisterNamedRouter(routerName, instance, param);
  }
  
  public constructor() {}
  
}

@Component() class __Options_ConstantStruct {
  @State() public stateVar?: Resource;
  public __backing_stateVar?: IStateDecoratedVariable<Resource>;
  public __options_has_stateVar?: boolean;
  public constructor() {}
  
}

@Component() class __Options_DialogStruct {
  @State() public aNumber?: number;
  public __backing_aNumber?: IStateDecoratedVariable<number>;
  public __options_has_aNumber?: boolean;
  public controller?: (CustomDialogController | null);
  public __options_has_controller?: boolean;
  public constructor() {}
  
}

@Entry() @Component() class __Options_EntryStructWithBody {
  public constructor() {}
  
}

@Component() class __Options_V1Struct {
  @State() public aNumber?: number;
  public __backing_aNumber?: IStateDecoratedVariable<number>;
  public __options_has_aNumber?: boolean;
  public constructor() {}
  
}

@ComponentV2() class __Options_V2Struct {
  @Local() public aNumber?: number;
  public __backing_aNumber?: ILocalDecoratedVariable<number>;
  public __options_has_aNumber?: boolean;
  public constructor() {}
  
}


`;

const expectDeclarationAfterUIScript: string = `
import { WatchIdType } from "arkui.stateManagement.decorator";

import { RenderIdType } from "arkui.stateManagement.decorator";

import { IObservedObject } from "arkui.stateManagement.decorator";

import { ISubscribedWatches } from "arkui.stateManagement.decorator";

import { Memo } from "arkui.incremental.annotation";

import { MemoIntrinsic } from "arkui.incremental.annotation";

import { LinkSourceType } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { IParamDecoratedVariable } from "arkui.stateManagement.decorator";

import { Memo } from "arkui.incremental.annotation";

import { ComponentBuilder } from "arkui.component.builder";

import { LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { Builder } from "arkui.component.builder";

import { CustomComponent } from "arkui.component.customComponent";

import { ReusePoolOwnership } from "arkui.component.customComponent";

import { CustomComponentV2 } from "arkui.component.customComponent";

import { BaseCustomDialog } from "arkui.component.customComponent";

import { PageLifeCycle } from "arkui.component.customComponent";

import { CustomDialog, Component, ComponentV2, Entry, BuilderParam, Column, CustomDialogController, Resource, WrappedBuilder, Builder, $r, $rawfile, Resource, AnimatableExtend, TextAttribute, wrapBuilder } from "@ohos.arkui.component";

import { Observed, ObservedV2, Track, Trace, Monitor, Computed, State, Link, Local, Param, Require } from "@ohos.arkui.stateManagement";


export default declare namespace aNamespaceWithBody {
  public static EXPORT_RESOURCE: Resource;
  public static EXPORT_RAWFILE: Resource;
  public static EXPORT_WRAPPED_BUILDER: WrappedBuilder<@Builder() ((value: string, size: number)=> void)>;
  public static EXPORT_RESOURCE_WITH_BODY: Resource = $r("app.string.app_icon");
  public static EXPORT_RAWFILE_WITH_BODY: Resource = $rawfile("app.mock.txt");
  @Builder() 
  @Memo() 
  function wrappedBuilder(value: string, size: number): void
  
  public static EXPORT_WRAPPED_BUILDER_WITH_BODY: WrappedBuilder<@Builder() ((value: string, size: number)=> void)> = wrapBuilder(wrappedBuilder);
  interface IO {
    get t1(): number
    set t1(t1: number)
    
  }
  
  @Observed() class ExportObserved implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public get t1(): number
    
    public set t1(newValue: number)
    
    public constructor()
    
  }
  
  @Observed() class ExportObservedImpl implements IO, IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public constructor()
    
    public get t1(): number
    public set t1(t1: number)
    
  }
  
  @Observed() class ExportObservedWithTrack implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    public t1: number;
    @JSONRename({newName:"t2"}) public __backing_t2?: number;
    public get t2(): number
    
    public set t2(newValue: number)
    
    public constructor()
    
  }
  
  class ExportTrackWithoutObserved implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public get t1(): number
    
    public set t1(newValue: number)
    
    public constructor()
    
  }
  
  @Observed() class NonExportObserved implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public get t1(): number
    
    public set t1(newValue: number)
    
    public constructor()
    
  }
  
  @Observed() class NonExportObservedImpl implements IO, IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public constructor()
    
    public get t1(): number
    public set t1(t1: number)
    
  }
  
  @Observed() class NonExportObservedWithTrack implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    public t1: number;
    @JSONRename({newName:"t2"}) public __backing_t2?: number;
    public get t2(): number
    
    public set t2(newValue: number)
    
    public constructor()
    
  }
  
  class NonExportTrackWithoutObserved implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public get t1(): number
    
    public set t1(newValue: number)
    
    public constructor()
    
  }
  
  @Observed() class ObservedWithBody implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public get t1(): number
    
    public set t1(newValue: number)
    
    public constructor() {}
    
  }
  
  @Observed() class ObservedImplWithBody implements IO, IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public constructor() {}
    
    public get t1(): number {
      return this.t1;
    }
    public set t1(t1: number) {
      this.t1 = t1;
      return;
    }
    
  }
  
  @Observed() class ObservedWithTrackWithBody implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    public t1: number = 1;
    @JSONRename({newName:"t2"}) public __backing_t2: number = 2;
    public get t2(): number
    
    public set t2(newValue: number)
    
    public constructor() {}
    
  }
  
  class TrackWithoutObservedWithBody implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public get t1(): number
    
    public set t1(newValue: number)
    
    public constructor() {}
    
  }
  
  @Observed() class ExportObservedWithBody implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public get t1(): number
    
    public set t1(newValue: number)
    
    public constructor() {}
    
  }
  
  @Observed() class ExportObservedImplWithBody implements IO, IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public constructor() {}
    
    public get t1(): number {
      return this.t1;
    }
    public set t1(t1: number) {
      this.t1 = t1;
      return;
    }
    
  }
  
  @Observed() class ExportObservedWithTrackWithBody implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    public t1: number = 1;
    @JSONRename({newName:"t2"}) public __backing_t2: number = 2;
    public get t2(): number
    
    public set t2(newValue: number)
    
    public constructor() {}
    
  }
  
  class ExportTrackWithoutObservedWithBody implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public get t1(): number
    
    public set t1(newValue: number)
    
    public constructor() {}
    
  }
  
  @ObservedV2() class ExportObservedV2 implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public get t1(): number
    
    public set t1(newValue: number)
    
    @Computed() 
    public get computed(): number
    
    @Monitor({value:["t1"]}) 
    public onT1Changed(): void
    
    public constructor()
    
  }
  
  @ObservedV2() class ExportObservedV2Inherit implements IO, IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public constructor()
    
    public get t1(): number
    public set t1(t1: number)
    
  }
  
  @ObservedV2() class NonExportObservedV2 implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public get t1(): number
    
    public set t1(newValue: number)
    
    @Computed() 
    public get computed(): number
    
    @Monitor({value:["t1"]}) 
    public onT1Changed(): void
    
    public constructor()
    
  }
  
  @ObservedV2() class NonExportObservedV2Inherit implements IO, IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public constructor()
    
    public get t1(): number
    public set t1(t1: number)
    
  }
  
  @ObservedV2() class ObservedV2WithBody implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public get t1(): number
    
    public set t1(newValue: number)
    
    @Computed() 
    public get computed(): number {
      return this.t1;
    }
    
    @Monitor({value:["t1"]}) 
    public onT1Changed(): void {}
    
    public constructor(t1: number) {
      this.t1 = t1;
    }
    
  }
  
  @ObservedV2() class ObservedV2InheritWithBody implements IO, IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public t2: number = 2;
    public constructor(t2: number) {
      this.t2 = t2;
    }
    
    public get t1(): number {
      return this.t1;
    }
    public set t1(t1: number) {
      this.t1 = t1;
      return;
    }
    
  }
  
  @ObservedV2() class ExportObservedV2InheritWithBody implements IO, IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public t2: number = 2;
    public constructor(t2: number) {
      this.t2 = t2;
    }
    
    public get t1(): number {
      return this.t1;
    }
    public set t1(t1: number) {
      this.t1 = t1;
      return;
    }
    
  }
  
  @ObservedV2() class ExportObservedV2WithBody implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public get t1(): number
    
    public set t1(newValue: number)
    
    @Computed() 
    public get computed(): number {
      return this.t1;
    }
    
    @Monitor({value:["t1"]}) 
    public onT1Changed(): void {}
    
    public constructor(t1: number) {
      this.t1 = t1;
    }
    
  }
  
  @CustomDialog() final struct ExportCustomDialog extends BaseCustomDialog<ExportCustomDialog, __Options_ExportCustomDialog> {
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
  
  @CustomDialog() final struct NonExportCustomDialog extends BaseCustomDialog<NonExportCustomDialog, __Options_NonExportCustomDialog> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_NonExportCustomDialog, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): NonExportCustomDialog
    
    @Link() public someLink: number;
    public controller?: (CustomDialogController | undefined);
    @Memo() 
    public build(): void
    
    public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
    
    @MemoIntrinsic() 
    public static _invoke(initializers: ((()=> __Options_NonExportCustomDialog) | undefined), storage: ((()=> LocalStorage) | undefined), controller: (CustomDialogController | undefined), @Memo() content: ((()=> void) | undefined)): void
    
  }
  
  @CustomDialog() final struct CustomDialogWithBody extends BaseCustomDialog<CustomDialogWithBody, __Options_CustomDialogWithBody> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_CustomDialogWithBody, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): CustomDialogWithBody
    
    @State() public someState: number;
    public controller: (CustomDialogController | null);
    @Memo() 
    public build(): void {
      Column(){};
    }
    
    public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
    
    @MemoIntrinsic() 
    public static _invoke(initializers: ((()=> __Options_CustomDialogWithBody) | undefined), storage: ((()=> LocalStorage) | undefined), controller: (CustomDialogController | undefined), @Memo() content: ((()=> void) | undefined)): void
    
  }
  
  @CustomDialog() final struct ExportCustomDialogWithBody extends BaseCustomDialog<ExportCustomDialogWithBody, __Options_ExportCustomDialogWithBody> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_ExportCustomDialogWithBody, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): ExportCustomDialogWithBody
    
    @State() public someState: number;
    public controller: (CustomDialogController | null);
    @Memo() 
    public build(): void {
      Column(){};
    }
    
    public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
    
    @MemoIntrinsic() 
    public static _invoke(initializers: ((()=> __Options_ExportCustomDialogWithBody) | undefined), storage: ((()=> LocalStorage) | undefined), controller: (CustomDialogController | undefined), @Memo() content: ((()=> void) | undefined)): void
    
  }
  
  @Entry() @Component() final struct ExportEntryStructWithBody extends CustomComponent<ExportEntryStructWithBody, __Options_ExportEntryStructWithBody> implements PageLifeCycle {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_ExportEntryStructWithBody, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): ExportEntryStructWithBody
    
    @Memo() 
    public build(): void {
      Column(){};
    }
    
    public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
    
    @MemoIntrinsic() 
    public static _invoke(style: (@Memo() ((instance: ExportEntryStructWithBody)=> void) | undefined), initializers: ((()=> __Options_ExportEntryStructWithBody) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void
    
  }
  
  @Component() final struct ExportStructV1 extends CustomComponent<ExportStructV1, __Options_ExportStructV1> {
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
  
  @Component() final struct NonExportStructV1 extends CustomComponent<NonExportStructV1, __Options_NonExportStructV1> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_NonExportStructV1, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): NonExportStructV1
    
    @State() public someState: number;
    @BuilderParam() @Memo() public someBuilderParam: (()=> void);
    @Memo() 
    public build(): void
    
    public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
    
    @MemoIntrinsic() 
    public static _invoke(style: (@Memo() ((instance: NonExportStructV1)=> void) | undefined), initializers: ((()=> __Options_NonExportStructV1) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void
    
  }
  
  @Component() final struct StructV1WithBody extends CustomComponent<StructV1WithBody, __Options_StructV1WithBody> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_StructV1WithBody, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): StructV1WithBody
    
    @State() public someState: number;
    @BuilderParam() @Memo() public someBuilderParam: (()=> void);
    @Memo() 
    public build(): void {
      Column(){};
    }
    
    public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
    
    @MemoIntrinsic() 
    public static _invoke(style: (@Memo() ((instance: StructV1WithBody)=> void) | undefined), initializers: ((()=> __Options_StructV1WithBody) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void
    
  }
  
  @Component() final struct ExportStructV1WithBody extends CustomComponent<ExportStructV1WithBody, __Options_ExportStructV1WithBody> {
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
  
  @ComponentV2() final struct ExportStructV2 extends CustomComponentV2<ExportStructV2, __Options_ExportStructV2> {
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
  
  @ComponentV2() final struct NonExportStructV2 extends CustomComponentV2<NonExportStructV2, __Options_NonExportStructV2> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_NonExportStructV2, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): NonExportStructV2
    
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
    public static _invoke(style: (@Memo() ((instance: NonExportStructV2)=> void) | undefined), initializers: ((()=> __Options_NonExportStructV2) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void
    
  }
  
  @ComponentV2() final struct StructV2WithBody extends CustomComponentV2<StructV2WithBody, __Options_StructV2WithBody> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_StructV2WithBody, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): StructV2WithBody
    
    @Local() public someLocal: number;
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
    public static _invoke(style: (@Memo() ((instance: StructV2WithBody)=> void) | undefined), initializers: ((()=> __Options_StructV2WithBody) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void
    
  }
  
  @ComponentV2() final struct ExportStructV2WithBody extends CustomComponentV2<ExportStructV2WithBody, __Options_ExportStructV2WithBody> {
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
  
  @Builder() type exportBuilderType = (()=> void);
  
  type exportBuilderType2 = @Builder() (()=> void);
  
  interface IBuilderInArgs {
    mockBuilderMethod1(builderType: exportBuilderType): void
    mockBuilderMethod2(builderType: exportBuilderType2): void
    
  }
  
  @CustomDialog() class __Options_ExportCustomDialog {
    @Link() public someLink: number;
    public __backing_someLink?: LinkSourceType<number>;
    public __options_has_someLink?: boolean;
    public controller?: (CustomDialogController | undefined);
    public __options_has_controller?: boolean;
    public constructor()
    
  }
  
  @CustomDialog() class __Options_NonExportCustomDialog {
    @Link() public someLink: number;
    public __backing_someLink?: LinkSourceType<number>;
    public __options_has_someLink?: boolean;
    public controller?: (CustomDialogController | undefined);
    public __options_has_controller?: boolean;
    public constructor()
    
  }
  
  @CustomDialog() class __Options_CustomDialogWithBody {
    @State() public someState?: number;
    public __backing_someState?: IStateDecoratedVariable<number>;
    public __options_has_someState?: boolean;
    public controller?: (CustomDialogController | null);
    public __options_has_controller?: boolean;
    public constructor()
    
  }
  
  @CustomDialog() class __Options_ExportCustomDialogWithBody {
    @State() public someState?: number;
    public __backing_someState?: IStateDecoratedVariable<number>;
    public __options_has_someState?: boolean;
    public controller?: (CustomDialogController | null);
    public __options_has_controller?: boolean;
    public constructor()
    
  }
  
  @Entry() @Component() class __Options_ExportEntryStructWithBody {
    public constructor()
    
  }
  
  @Component() class __Options_ExportStructV1 {
    @State() public someState?: number;
    public __backing_someState?: IStateDecoratedVariable<number>;
    public __options_has_someState?: boolean;
    @Memo() public someBuilderParam?: ((()=> void) | undefined);
    public __options_has_someBuilderParam?: boolean;
    public constructor()
    
  }
  
  @Component() class __Options_NonExportStructV1 {
    @State() public someState?: number;
    public __backing_someState?: IStateDecoratedVariable<number>;
    public __options_has_someState?: boolean;
    @Memo() public someBuilderParam?: ((()=> void) | undefined);
    public __options_has_someBuilderParam?: boolean;
    public constructor()
    
  }
  
  @Component() class __Options_StructV1WithBody {
    @State() public someState?: number;
    public __backing_someState?: IStateDecoratedVariable<number>;
    public __options_has_someState?: boolean;
    @Memo() public someBuilderParam?: ((()=> void) | undefined);
    public __options_has_someBuilderParam?: boolean;
    public constructor()
    
  }
  
  @Component() class __Options_ExportStructV1WithBody {
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
  
  @ComponentV2() class __Options_ExportStructV2 {
    @Local() public someLocal?: number;
    public __backing_someLocal?: ILocalDecoratedVariable<number>;
    public __options_has_someLocal?: boolean;
    @Memo() public someBuilderParam?: ((()=> void) | undefined);
    public __options_has_someBuilderParam?: boolean;
    public constructor()
    
  }
  
  @ComponentV2() class __Options_NonExportStructV2 {
    @Local() public someLocal?: number;
    public __backing_someLocal?: ILocalDecoratedVariable<number>;
    public __options_has_someLocal?: boolean;
    @Memo() public someBuilderParam?: ((()=> void) | undefined);
    public __options_has_someBuilderParam?: boolean;
    public constructor()
    
  }
  
  @ComponentV2() class __Options_StructV2WithBody {
    @Local() public someLocal?: number;
    public __backing_someLocal?: ILocalDecoratedVariable<number>;
    public __options_has_someLocal?: boolean;
    @Memo() public someBuilderParam?: ((()=> void) | undefined);
    public __options_has_someBuilderParam?: boolean;
    public constructor()
    
  }
  
  @ComponentV2() class __Options_ExportStructV2WithBody {
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
  
}

`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
    const declarationScript = this.declContexts?.['mock.demo.mock.declarations.utils.namespace-body']?.scriptSnapshot ?? '';
    expect(parseDumpSrc(declarationScript)).toContain(parseDumpSrc(expectDeclarationAfterUIScript));
}

const expectedMemoScript: string = `

import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.incremental.runtime.state";

import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { _rawfile as _rawfile } from "arkui.component.resources";

import { MemoSkip as MemoSkip } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { Memo as Memo } from "arkui.incremental.annotation";

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { ReusePoolOwnership as ReusePoolOwnership } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Text as Text, Column as Column, Component as Component, ComponentV2 as ComponentV2, Entry as Entry, Builder as Builder, BuilderParam as BuilderParam, Resource as Resource, $r as $r, $rawfile as $rawfile, CustomDialogController as CustomDialogController } from "@ohos.arkui.component";

import { Observed as Observed, ObservedV2 as ObservedV2, Track as Track, Trace as Trace, Monitor as Monitor, Computed as Computed, Local as Local, State as State } from "@ohos.arkui.stateManagement";

import aNamespaceWithBody from "./utils/namespace-body";

const SomeObClassVar = new SomeObClass(1);
const SomeObClassImplVar = new SomeObClassImpl(2);
const SomeObClassWithTrackVar = new SomeObClassWithTrack(3);
const SomeTrClassInheritVar = new SomeTrClassInherit();
const ExportObservedWithBodyVar = new aNamespaceWithBody.ExportObservedWithBody();
const ExportObservedImplWithBodyVar = new aNamespaceWithBody.ExportObservedImplWithBody();
const ExportObservedWithTrackWithBodyVar = new aNamespaceWithBody.ExportObservedWithTrackWithBody();
const ExportTrackWithoutObservedWithBodyVar = new aNamespaceWithBody.ExportTrackWithoutObservedWithBody();
const SomeObV2ClassVar = new SomeObV2Class(1);
const SomeObV2ClassImplVar = new SomeObV2ClassImpl(2);
const ExportObservedV2WithBodyVar = new aNamespaceWithBody.ExportObservedV2WithBody(1);
const ExportObservedV2InheritWithBodyVar = new aNamespaceWithBody.ExportObservedV2InheritWithBody(2);
function main() {}

@Builder() 
@Memo() 
function ConstantBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
  const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (245837840)), 0);
  if (__memo_scope.unchanged) {
    __memo_scope.cached;
    return;
  }
  TextImpl(__memo_context, ((__memo_id) + (175145513)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (47330804)), 1);
    const __memo_parameter_instance = __memo_scope.param(0, instance);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    __memo_parameter_instance.value.setTextOptions(aNamespaceWithBody.EXPORT_RESOURCE, undefined);
    __memo_parameter_instance.value.applyAttributesFinish();
    {
      __memo_scope.recache();
      return;
    }
  }), undefined);
  aNamespaceWithBody.EXPORT_WRAPPED_BUILDER.builder(__memo_context, ((__memo_id) + (241913892)), "name", 1);
  {
    __memo_scope.recache();
    return;
  }
}

@Builder() 
@Memo() 
function aBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
  const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (242889503)), 0);
  if (__memo_scope.unchanged) {
    __memo_scope.cached;
    return;
  }
  aNamespaceWithBody.ExportCustomDialogWithBody._invoke(__memo_context, ((__memo_id) + (211301233)), (() => {
    return {
      controller: null,
      __options_has_controller: true,
    };
  }), undefined, undefined, undefined);
  aNamespaceWithBody.ExportEntryStructWithBody._invoke(__memo_context, ((__memo_id) + (213104625)), undefined, undefined, undefined, undefined, undefined);
  aNamespaceWithBody.ExportStructV1._invoke(__memo_context, ((__memo_id) + (46726221)), undefined, undefined, undefined, undefined, undefined);
  {
    __memo_scope.recache();
    return;
  }
}

@Builder() 
@Memo() 
function aBuilder1(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @MemoSkip() someRequiredParam: number): void {
  const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (193472194)), 0);
  if (__memo_scope.unchanged) {
    __memo_scope.cached;
    return;
  }
  aNamespaceWithBody.ExportStructV2WithBody._invoke(__memo_context, ((__memo_id) + (218979098)), undefined, (() => {
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

function mockFunction(obj: aNamespaceWithBody.IBuilderInArgs): void {
  obj.mockBuilderMethod1(((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (192802443)), 0);
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
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (213687742)), 0);
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

aNamespaceWithBody.EXPORT_RAWFILE = _rawfile(0, 30000, "com.example.mock", "entry", "app.mock.txt");
__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../declarations/namespace-body-usage",
  pageFullPath: "test/demo/mock/declarations/namespace-body-usage",
  integratedHsp: "false",
} as NavInterface));
class SomeObClass extends aNamespaceWithBody.ExportObserved implements aNamespaceWithBody.IO {
  public someMethod(): void {
    console.log(this.t1);
  }
  
  public constructor(t1: number) {
    super();
    this.t1 = t1;
  }
  
  public get t1(): number
  public set t1(t1: number)
  
}

class SomeObClassImpl extends aNamespaceWithBody.ExportObservedImpl {
  public someMethod(): void {
    console.log(this.t1);
  }
  
  public constructor(t1: number) {
    super();
    this.t1 = t1;
  }
  
}

class SomeObClassWithTrack extends aNamespaceWithBody.ExportObservedWithTrack {
  public t1: number = 1;
  public constructor(t2: number) {
    super();
    this.t2 = t2;
  }
  
}

class SomeTrClassInherit extends aNamespaceWithBody.ExportTrackWithoutObserved {
  public constructor() {}
  
}

class SomeObV2Class extends aNamespaceWithBody.ExportObservedV2 implements aNamespaceWithBody.IO {
  public someMethod(): void {
    console.log(this.t1);
  }
  
  public constructor(t1: number) {
    super();
    this.t1 = t1;
  }
  
  public get t1(): number
  public set t1(t1: number)
  
}

class SomeObV2ClassImpl extends aNamespaceWithBody.ExportObservedV2Inherit {
  public someMethod(): void {
    console.log(this.t1);
  }
  
  public constructor(t1: number) {
    super();
    this.t1 = t1;
  }
  
}

@Component() final struct ConstantStruct extends CustomComponent<ConstantStruct, __Options_ConstantStruct> {
  public __initializeStruct(initializers: (__Options_ConstantStruct | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    this.__backing_stateVar = STATE_MGMT_FACTORY.makeState<Resource>(this, "stateVar", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_stateVar)}) ? (initializers!.stateVar as Resource) : (aNamespaceWithBody.EXPORT_RESOURCE as Resource)));
  }
  
  public __updateStruct(initializers: (__Options_ConstantStruct | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_ConstantStruct | undefined)): void {
    this.__backing_stateVar!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.stateVar)})) ?? (aNamespaceWithBody.EXPORT_RESOURCE)) as Resource));
  }
  
  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ConstantStruct)=> void) | undefined), initializers: ((()=> __Options_ConstantStruct) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponent._invokeImpl<ConstantStruct, __Options_ConstantStruct>(__memo_context, ((__memo_id) + (54078781)), style, ((): ConstantStruct => {
      return new ConstantStruct(false, ({let gensym___46528967 = storage;
      (((gensym___46528967) == (null)) ? undefined : gensym___46528967())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ConstantStruct, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): ConstantStruct {
    throw new Error("Declare interface");
  }
  
  private __backing_stateVar?: IStateDecoratedVariable<Resource>;
  public get stateVar(): Resource {
    return this.__backing_stateVar!.get();
  }
  
  public set stateVar(value: Resource) {
    this.__backing_stateVar!.set(value);
  }
  
  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (142886843)), 0);
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

@Component() final struct DialogStruct extends CustomComponent<DialogStruct, __Options_DialogStruct> {
  public __initializeStruct(initializers: (__Options_DialogStruct | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    this.__backing_aNumber = STATE_MGMT_FACTORY.makeState<number>(this, "aNumber", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_aNumber)}) ? (initializers!.aNumber as number) : (1 as number)));
    this.__backing_controller = (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_controller)}) ? (initializers!.controller as (CustomDialogController | null)) : (({let gensym___<some_random_number>: Any;
    gensym___192738000 = new CustomDialogController({
      builder: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (262314519)), 0);
        if (__memo_scope.unchanged) {
          __memo_scope.cached;
          return;
        }
        aNamespaceWithBody.ExportCustomDialog._invoke(__memo_context, ((__memo_id) + (78055758)), (() => {
          return {
            __backing_someLink: (this.__backing_aNumber as IStateDecoratedVariable<number>),
            __options_has_someLink: true,
          };
        }), undefined, (gensym___192738000 as CustomDialogController), undefined);
        {
          __memo_scope.recache();
          return;
        }
      }),
      baseComponent: this,
    })
    (gensym___<some_random_number> as CustomDialogController)}) as (CustomDialogController | null)));
  }
  
  public __updateStruct(initializers: (__Options_DialogStruct | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_DialogStruct | undefined)): void {
    this.__backing_aNumber!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.aNumber)})) ?? (1)) as number));
  }
  
  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: DialogStruct)=> void) | undefined), initializers: ((()=> __Options_DialogStruct) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponent._invokeImpl<DialogStruct, __Options_DialogStruct>(__memo_context, ((__memo_id) + (173773669)), style, ((): DialogStruct => {
      return new DialogStruct(false, ({let gensym___92334354 = storage;
      (((gensym___92334354) == (null)) ? undefined : gensym___92334354())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_DialogStruct, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): DialogStruct {
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
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (161516492)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    ColumnImpl(__memo_context, ((__memo_id) + (75321118)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ColumnAttribute): void => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (155886964)), 1);
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
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (234157464)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      aNamespaceWithBody.ExportCustomDialog._invoke(__memo_context, ((__memo_id) + (151409217)), (() => {
        return {
          __backing_someLink: (this.__backing_aNumber as IStateDecoratedVariable<number>),
          __options_has_someLink: true,
        };
      }), undefined, undefined, undefined);
      aNamespaceWithBody.ExportCustomDialogWithBody._invoke(__memo_context, ((__memo_id) + (238360624)), (() => {
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

@Entry() @Component() final struct EntryStructWithBody extends CustomComponent<EntryStructWithBody, __Options_EntryStructWithBody> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_EntryStructWithBody | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {}
  
  public __updateStruct(initializers: (__Options_EntryStructWithBody | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_EntryStructWithBody | undefined)): void {}
  
  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: EntryStructWithBody)=> void) | undefined), initializers: ((()=> __Options_EntryStructWithBody) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponent._invokeImpl<EntryStructWithBody, __Options_EntryStructWithBody>(__memo_context, ((__memo_id) + (204012763)), style, ((): EntryStructWithBody => {
      return new EntryStructWithBody(false, ({let gensym___29142858 = storage;
      (((gensym___29142858) == (null)) ? undefined : gensym___29142858())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_EntryStructWithBody, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): EntryStructWithBody {
    throw new Error("Declare interface");
  }
  
  @Memo() 
  public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (152832684)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    ColumnImpl(__memo_context, ((__memo_id) + (257873411)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ColumnAttribute): void => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (72614054)), 1);
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
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (5605714)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      aNamespaceWithBody.ExportEntryStructWithBody._invoke(__memo_context, ((__memo_id) + (172290133)), undefined, undefined, undefined, undefined, undefined);
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

@Component() final struct V1Struct extends CustomComponent<V1Struct, __Options_V1Struct> {
  public __initializeStruct(initializers: (__Options_V1Struct | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    this.__backing_aNumber = STATE_MGMT_FACTORY.makeState<number>(this, "aNumber", (({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.__options_has_aNumber)}) ? (initializers!.aNumber as number) : (1 as number)));
  }
  
  public __updateStruct(initializers: (__Options_V1Struct | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_V1Struct | undefined)): void {
    this.__backing_aNumber!.resetOnReuse((((({let gensym___<some_random_number> = initializers;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.aNumber)})) ?? (1)) as number));
  }
  
  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: V1Struct)=> void) | undefined), initializers: ((()=> __Options_V1Struct) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponent._invokeImpl<V1Struct, __Options_V1Struct>(__memo_context, ((__memo_id) + (27183850)), style, ((): V1Struct => {
      return new V1Struct(false, ({let gensym___56395834 = storage;
      (((gensym___56395834) == (null)) ? undefined : gensym___56395834())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_V1Struct, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): V1Struct {
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
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (40944559)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    ColumnImpl(__memo_context, ((__memo_id) + (215219604)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ColumnAttribute): void => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (157355641)), 1);
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
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (203810821)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      aNamespaceWithBody.ExportStructV1._invoke(__memo_context, ((__memo_id) + (225484108)), undefined, undefined, undefined, undefined, undefined);
      aNamespaceWithBody.ExportStructV1WithBody._invoke(__memo_context, ((__memo_id) + (136286509)), undefined, (() => {
        return {
          __backing_someLink: (this.__backing_aNumber as IStateDecoratedVariable<number>),
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

@ComponentV2() final struct V2Struct extends CustomComponentV2<V2Struct, __Options_V2Struct> {
  public __initializeStruct(initializers: (__Options_V2Struct | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    this.__backing_aNumber = STATE_MGMT_FACTORY.makeLocal<number>(this, "aNumber", 1);
  }
  
  public __updateStruct(initializers: (__Options_V2Struct | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_V2Struct | undefined)): void {
    this.__backing_aNumber!.resetOnReuse(1);
  }
  
  @MemoIntrinsic() 
  public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: V2Struct)=> void) | undefined), initializers: ((()=> __Options_V2Struct) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<V2Struct, __Options_V2Struct>(__memo_context, ((__memo_id) + (120719913)), style, ((): V2Struct => {
      return new V2Struct();
    }), initializers, reuseId, content, {
      sClass: Class.from<V2Struct>(),
    });
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_V2Struct, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): V2Struct {
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
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (77640164)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    ColumnImpl(__memo_context, ((__memo_id) + (34887364)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ColumnAttribute): void => {
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (55686085)), 1);
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
      const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (226403822)), 0);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      aNamespaceWithBody.ExportStructV2._invoke(__memo_context, ((__memo_id) + (53444768)), undefined, undefined, undefined, undefined, undefined);
      aNamespaceWithBody.ExportStructV2WithBody._invoke(__memo_context, ((__memo_id) + (219763513)), undefined, (() => {
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

class __EntryWrapper extends EntryPoint {
  @Memo() 
  public entry(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (189018948)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    EntryStructWithBody._invoke(__memo_context, ((__memo_id) + (125892063)), undefined, undefined, undefined, undefined, undefined);
    {
      __memo_scope.recache();
      return;
    }
  }
  
  public static RegisterNamedRouter(routerName: string, instance: EntryPoint, param: NavInterface): void {
    EntryPoint.RegisterNamedRouter(routerName, instance, param);
  }
  
  public constructor() {}
  
}

@Component() class __Options_ConstantStruct {
  @State() public stateVar?: Resource;
  public __backing_stateVar?: IStateDecoratedVariable<Resource>;
  public __options_has_stateVar?: boolean;
  public constructor() {}
  
}

@Component() class __Options_DialogStruct {
  @State() public aNumber?: number;
  public __backing_aNumber?: IStateDecoratedVariable<number>;
  public __options_has_aNumber?: boolean;
  public controller?: (CustomDialogController | null);
  public __options_has_controller?: boolean;
  public constructor() {}
  
}

@Entry() @Component() class __Options_EntryStructWithBody {
  public constructor() {}
  
}

@Component() class __Options_V1Struct {
  @State() public aNumber?: number;
  public __backing_aNumber?: IStateDecoratedVariable<number>;
  public __options_has_aNumber?: boolean;
  public constructor() {}
  
}

@ComponentV2() class __Options_V2Struct {
  @Local() public aNumber?: number;
  public __backing_aNumber?: ILocalDecoratedVariable<number>;
  public __options_has_aNumber?: boolean;
  public constructor() {}
  
}


`;

const expectDeclarationScript: string = `
import { __memo_context_type, __memo_id_type } from "arkui.incremental.runtime.state";

import { WatchIdType } from "arkui.stateManagement.decorator";

import { RenderIdType } from "arkui.stateManagement.decorator";

import { IObservedObject } from "arkui.stateManagement.decorator";

import { ISubscribedWatches } from "arkui.stateManagement.decorator";

import { Memo } from "arkui.incremental.annotation";

import { MemoIntrinsic } from "arkui.incremental.annotation";

import { LinkSourceType } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { IParamDecoratedVariable } from "arkui.stateManagement.decorator";

import { Memo } from "arkui.incremental.annotation";

import { ComponentBuilder } from "arkui.component.builder";

import { LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { Builder } from "arkui.component.builder";

import { CustomComponent } from "arkui.component.customComponent";

import { ReusePoolOwnership } from "arkui.component.customComponent";

import { CustomComponentV2 } from "arkui.component.customComponent";

import { BaseCustomDialog } from "arkui.component.customComponent";

import { PageLifeCycle } from "arkui.component.customComponent";

import { CustomDialog, Component, ComponentV2, Entry, BuilderParam, Column, CustomDialogController, Resource, WrappedBuilder, Builder, $r, $rawfile, Resource, AnimatableExtend, TextAttribute, wrapBuilder } from "@ohos.arkui.component";

import { Observed, ObservedV2, Track, Trace, Monitor, Computed, State, Link, Local, Param, Require } from "@ohos.arkui.stateManagement";


export default declare namespace aNamespaceWithBody {
  public static EXPORT_RESOURCE: Resource;
  public static EXPORT_RAWFILE: Resource;
  public static EXPORT_WRAPPED_BUILDER: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public static EXPORT_RESOURCE_WITH_BODY: Resource = $r("app.string.app_icon");
  public static EXPORT_RAWFILE_WITH_BODY: Resource = $rawfile("app.mock.txt");
  @Builder() 
  @Memo() 
  function wrappedBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number): void
  
  public static EXPORT_WRAPPED_BUILDER_WITH_BODY: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)> = wrapBuilder(wrappedBuilder);
  interface IO {
    get t1(): number
    set t1(t1: number)
    
  }
  
  @Observed() class ExportObserved implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public get t1(): number
    
    public set t1(newValue: number)
    
    public constructor()
    
  }
  
  @Observed() class ExportObservedImpl implements IO, IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public constructor()
    
    public get t1(): number
    public set t1(t1: number)
    
  }
  
  @Observed() class ExportObservedWithTrack implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    public t1: number;
    @JSONRename({newName:"t2"}) public __backing_t2?: number;
    public get t2(): number
    
    public set t2(newValue: number)
    
    public constructor()
    
  }
  
  class ExportTrackWithoutObserved implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public get t1(): number
    
    public set t1(newValue: number)
    
    public constructor()
    
  }
  
  @Observed() class NonExportObserved implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public get t1(): number
    
    public set t1(newValue: number)
    
    public constructor()
    
  }
  
  @Observed() class NonExportObservedImpl implements IO, IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public constructor()
    
    public get t1(): number
    public set t1(t1: number)
    
  }
  
  @Observed() class NonExportObservedWithTrack implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    public t1: number;
    @JSONRename({newName:"t2"}) public __backing_t2?: number;
    public get t2(): number
    
    public set t2(newValue: number)
    
    public constructor()
    
  }
  
  class NonExportTrackWithoutObserved implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public get t1(): number
    
    public set t1(newValue: number)
    
    public constructor()
    
  }
  
  @Observed() class ObservedWithBody implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public get t1(): number
    
    public set t1(newValue: number)
    
    public constructor() {}
    
  }
  
  @Observed() class ObservedImplWithBody implements IO, IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public constructor() {}
    
    public get t1(): number {
      return this.t1;
    }
    public set t1(t1: number) {
      this.t1 = t1;
      return;
    }
    
  }
  
  @Observed() class ObservedWithTrackWithBody implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    public t1: number = 1;
    @JSONRename({newName:"t2"}) public __backing_t2: number = 2;
    public get t2(): number
    
    public set t2(newValue: number)
    
    public constructor() {}
    
  }
  
  class TrackWithoutObservedWithBody implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public get t1(): number
    
    public set t1(newValue: number)
    
    public constructor() {}
    
  }
  
  @Observed() class ExportObservedWithBody implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public get t1(): number
    
    public set t1(newValue: number)
    
    public constructor() {}
    
  }
  
  @Observed() class ExportObservedImplWithBody implements IO, IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public constructor() {}
    
    public get t1(): number {
      return this.t1;
    }
    public set t1(t1: number) {
      this.t1 = t1;
      return;
    }
    
  }
  
  @Observed() class ExportObservedWithTrackWithBody implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    public t1: number = 1;
    @JSONRename({newName:"t2"}) public __backing_t2: number = 2;
    public get t2(): number
    
    public set t2(newValue: number)
    
    public constructor() {}
    
  }
  
  class ExportTrackWithoutObservedWithBody implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public get t1(): number
    
    public set t1(newValue: number)
    
    public constructor() {}
    
  }
  
  @ObservedV2() class ExportObservedV2 implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public get t1(): number
    
    public set t1(newValue: number)
    
    @Computed() 
    public get computed(): number
    
    @Monitor({value:["t1"]}) 
    public onT1Changed(): void
    
    public constructor()
    
  }
  
  @ObservedV2() class ExportObservedV2Inherit implements IO, IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public constructor()
    
    public get t1(): number
    public set t1(t1: number)
    
  }
  
  @ObservedV2() class NonExportObservedV2 implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public get t1(): number
    
    public set t1(newValue: number)
    
    @Computed() 
    public get computed(): number
    
    @Monitor({value:["t1"]}) 
    public onT1Changed(): void
    
    public constructor()
    
  }
  
  @ObservedV2() class NonExportObservedV2Inherit implements IO, IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public constructor()
    
    public get t1(): number
    public set t1(t1: number)
    
  }
  
  @ObservedV2() class ObservedV2WithBody implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public get t1(): number
    
    public set t1(newValue: number)
    
    @Computed() 
    public get computed(): number {
      return this.t1;
    }
    
    @Monitor({value:["t1"]}) 
    public onT1Changed(): void {}
    
    public constructor(t1: number) {
      this.t1 = t1;
    }
    
  }
  
  @ObservedV2() class ObservedV2InheritWithBody implements IO, IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public t2: number = 2;
    public constructor(t2: number) {
      this.t2 = t2;
    }
    
    public get t1(): number {
      return this.t1;
    }
    public set t1(t1: number) {
      this.t1 = t1;
      return;
    }
    
  }
  
  @ObservedV2() class ExportObservedV2InheritWithBody implements IO, IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public t2: number = 2;
    public constructor(t2: number) {
      this.t2 = t2;
    }
    
    public get t1(): number {
      return this.t1;
    }
    public set t1(t1: number) {
      this.t1 = t1;
      return;
    }
    
  }
  
  @ObservedV2() class ExportObservedV2WithBody implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public get t1(): number
    
    public set t1(newValue: number)
    
    @Computed() 
    public get computed(): number {
      return this.t1;
    }
    
    @Monitor({value:["t1"]}) 
    public onT1Changed(): void {}
    
    public constructor(t1: number) {
      this.t1 = t1;
    }
    
  }
  
  @CustomDialog() final struct ExportCustomDialog extends BaseCustomDialog<ExportCustomDialog, __Options_ExportCustomDialog> {
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
  
  @CustomDialog() final struct NonExportCustomDialog extends BaseCustomDialog<NonExportCustomDialog, __Options_NonExportCustomDialog> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_NonExportCustomDialog, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): NonExportCustomDialog
    
    @Link() public someLink: number;
    public controller?: (CustomDialogController | undefined);
    @Memo() 
    public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void
    
    public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
    
    @MemoIntrinsic() 
    public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, initializers: ((()=> __Options_NonExportCustomDialog) | undefined), storage: ((()=> LocalStorage) | undefined), controller: (CustomDialogController | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
    
  }
  
  @CustomDialog() final struct CustomDialogWithBody extends BaseCustomDialog<CustomDialogWithBody, __Options_CustomDialogWithBody> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_CustomDialogWithBody, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): CustomDialogWithBody
    
    @State() public someState: number;
    public controller: (CustomDialogController | null);
    @Memo() 
    public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
      Column(){};
    }
    
    public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
    
    @MemoIntrinsic() 
    public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, initializers: ((()=> __Options_CustomDialogWithBody) | undefined), storage: ((()=> LocalStorage) | undefined), controller: (CustomDialogController | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
    
  }
  
  @CustomDialog() final struct ExportCustomDialogWithBody extends BaseCustomDialog<ExportCustomDialogWithBody, __Options_ExportCustomDialogWithBody> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_ExportCustomDialogWithBody, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): ExportCustomDialogWithBody
    
    @State() public someState: number;
    public controller: (CustomDialogController | null);
    @Memo() 
    public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
      Column(){};
    }
    
    public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
    
    @MemoIntrinsic() 
    public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, initializers: ((()=> __Options_ExportCustomDialogWithBody) | undefined), storage: ((()=> LocalStorage) | undefined), controller: (CustomDialogController | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
    
  }
  
  @Entry() @Component() final struct ExportEntryStructWithBody extends CustomComponent<ExportEntryStructWithBody, __Options_ExportEntryStructWithBody> implements PageLifeCycle {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_ExportEntryStructWithBody, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): ExportEntryStructWithBody
    
    @Memo() 
    public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
      Column(){};
    }
    
    public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
    
    @MemoIntrinsic() 
    public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ExportEntryStructWithBody)=> void) | undefined), initializers: ((()=> __Options_ExportEntryStructWithBody) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
    
  }
  
  @Component() final struct ExportStructV1 extends CustomComponent<ExportStructV1, __Options_ExportStructV1> {
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
  
  @Component() final struct NonExportStructV1 extends CustomComponent<NonExportStructV1, __Options_NonExportStructV1> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_NonExportStructV1, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): NonExportStructV1
    
    @State() public someState: number;
    @BuilderParam() @Memo() public someBuilderParam: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
    @Memo() 
    public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void
    
    public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
    
    @MemoIntrinsic() 
    public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: NonExportStructV1)=> void) | undefined), initializers: ((()=> __Options_NonExportStructV1) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
    
  }
  
  @Component() final struct StructV1WithBody extends CustomComponent<StructV1WithBody, __Options_StructV1WithBody> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_StructV1WithBody, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): StructV1WithBody
    
    @State() public someState: number;
    @BuilderParam() @Memo() public someBuilderParam: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
    @Memo() 
    public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
      Column(){};
    }
    
    public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
    
    @MemoIntrinsic() 
    public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: StructV1WithBody)=> void) | undefined), initializers: ((()=> __Options_StructV1WithBody) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
    
  }
  
  @Component() final struct ExportStructV1WithBody extends CustomComponent<ExportStructV1WithBody, __Options_ExportStructV1WithBody> {
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
  
  @ComponentV2() final struct ExportStructV2 extends CustomComponentV2<ExportStructV2, __Options_ExportStructV2> {
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
  
  @ComponentV2() final struct NonExportStructV2 extends CustomComponentV2<NonExportStructV2, __Options_NonExportStructV2> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_NonExportStructV2, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): NonExportStructV2
    
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
    public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: NonExportStructV2)=> void) | undefined), initializers: ((()=> __Options_NonExportStructV2) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
    
  }
  
  @ComponentV2() final struct StructV2WithBody extends CustomComponentV2<StructV2WithBody, __Options_StructV2WithBody> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_StructV2WithBody, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): StructV2WithBody
    
    @Local() public someLocal: number;
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
    public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: StructV2WithBody)=> void) | undefined), initializers: ((()=> __Options_StructV2WithBody) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
    
  }
  
  @ComponentV2() final struct ExportStructV2WithBody extends CustomComponentV2<ExportStructV2WithBody, __Options_ExportStructV2WithBody> {
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
  
  @Builder() type exportBuilderType = ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
  
  type exportBuilderType2 = @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
  
  interface IBuilderInArgs {
    mockBuilderMethod1(builderType: exportBuilderType): void
    mockBuilderMethod2(builderType: exportBuilderType2): void
    
  }
  
  @CustomDialog() class __Options_ExportCustomDialog {
    @Link() public someLink: number;
    public __backing_someLink?: LinkSourceType<number>;
    public __options_has_someLink?: boolean;
    public controller?: (CustomDialogController | undefined);
    public __options_has_controller?: boolean;
    public constructor()
    
  }
  
  @CustomDialog() class __Options_NonExportCustomDialog {
    @Link() public someLink: number;
    public __backing_someLink?: LinkSourceType<number>;
    public __options_has_someLink?: boolean;
    public controller?: (CustomDialogController | undefined);
    public __options_has_controller?: boolean;
    public constructor()
    
  }
  
  @CustomDialog() class __Options_CustomDialogWithBody {
    @State() public someState?: number;
    public __backing_someState?: IStateDecoratedVariable<number>;
    public __options_has_someState?: boolean;
    public controller?: (CustomDialogController | null);
    public __options_has_controller?: boolean;
    public constructor()
    
  }
  
  @CustomDialog() class __Options_ExportCustomDialogWithBody {
    @State() public someState?: number;
    public __backing_someState?: IStateDecoratedVariable<number>;
    public __options_has_someState?: boolean;
    public controller?: (CustomDialogController | null);
    public __options_has_controller?: boolean;
    public constructor()
    
  }
  
  @Entry() @Component() class __Options_ExportEntryStructWithBody {
    public constructor()
    
  }
  
  @Component() class __Options_ExportStructV1 {
    @State() public someState?: number;
    public __backing_someState?: IStateDecoratedVariable<number>;
    public __options_has_someState?: boolean;
    @Memo() public someBuilderParam?: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined);
    public __options_has_someBuilderParam?: boolean;
    public constructor()
    
  }
  
  @Component() class __Options_NonExportStructV1 {
    @State() public someState?: number;
    public __backing_someState?: IStateDecoratedVariable<number>;
    public __options_has_someState?: boolean;
    @Memo() public someBuilderParam?: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined);
    public __options_has_someBuilderParam?: boolean;
    public constructor()
    
  }
  
  @Component() class __Options_StructV1WithBody {
    @State() public someState?: number;
    public __backing_someState?: IStateDecoratedVariable<number>;
    public __options_has_someState?: boolean;
    @Memo() public someBuilderParam?: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined);
    public __options_has_someBuilderParam?: boolean;
    public constructor()
    
  }
  
  @Component() class __Options_ExportStructV1WithBody {
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
  
  @ComponentV2() class __Options_ExportStructV2 {
    @Local() public someLocal?: number;
    public __backing_someLocal?: ILocalDecoratedVariable<number>;
    public __options_has_someLocal?: boolean;
    @Memo() public someBuilderParam?: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined);
    public __options_has_someBuilderParam?: boolean;
    public constructor()
    
  }
  
  @ComponentV2() class __Options_NonExportStructV2 {
    @Local() public someLocal?: number;
    public __backing_someLocal?: ILocalDecoratedVariable<number>;
    public __options_has_someLocal?: boolean;
    @Memo() public someBuilderParam?: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined);
    public __options_has_someBuilderParam?: boolean;
    public constructor()
    
  }
  
  @ComponentV2() class __Options_StructV2WithBody {
    @Local() public someLocal?: number;
    public __backing_someLocal?: ILocalDecoratedVariable<number>;
    public __options_has_someLocal?: boolean;
    @Memo() public someBuilderParam?: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined);
    public __options_has_someBuilderParam?: boolean;
    public constructor()
    
  }
  
  @ComponentV2() class __Options_ExportStructV2WithBody {
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
  
}

`

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
    const declarationScript = this.declContexts?.['mock.demo.mock.declarations.utils.namespace-body']?.scriptSnapshot ?? '';
    expect(parseDumpSrc(declarationScript)).toContain(parseDumpSrc(expectDeclarationScript));
}

pluginTester.run(
    'test declarations in namespace with body',
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
        tracing: { externalSourceNames: ['mock.demo.mock.declarations.utils.namespace-body'] }
    }
);
