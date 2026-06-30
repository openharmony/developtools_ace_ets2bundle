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
import { PluginTester } from '../../../utils/plugin-tester';
import { mockBuildConfig } from '../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../utils/path-config';
import { parseDumpSrc } from '../../../utils/parse-string';
import { uiNoRecheck, recheck, beforeUINoRecheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { dumpAnnotation, dumpGetterSetter, GetSetDumper, dumpConstructor } from '../../../utils/simplify-dump';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const DIR_PATH: string = 'decorators';
const UTILS_PATH: string = 'utils';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, DIR_PATH, 'cast-type-with-enum.ets'),
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, DIR_PATH, UTILS_PATH, 'enums.ets'),
];

const parseTransform: Plugins = {
    name: 'decorator-with-enums',
    parsed: uiTransform().parsed,
};

const pluginTester = new PluginTester('test basic decorators with enums transform', buildConfig);

const expectedScript: string = `

import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { IParamDecoratedVariable as IParamDecoratedVariable } from "arkui.stateManagement.decorator";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { IConsumeDecoratedVariable as IConsumeDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component, ComponentV2 as ComponentV2 } from "@ohos.arkui.component";

import { State as State, PropRef as PropRef, Link as Link, Provide as Provide, Consume as Consume, StorageLink as StorageLink, StoragePropRef as StoragePropRef, LocalStorageLink as LocalStorageLink, LocalStoragePropRef as LocalStoragePropRef } from "@ohos.arkui.stateManagement";

import { Local as Local, Param as Param, Provider as Provider, Once as Once, Consumer as Consumer, Require as Require } from "@ohos.arkui.stateManagement";

import { AEnumStr as AEnumStr, AEnumNum as AEnumNum } from "./utils/enums";

function main() {}


@Component() final struct ComponentV1Struct extends CustomComponent<ComponentV1Struct, __Options_ComponentV1Struct> {
  public __initializeStruct(initializers: (__Options_ComponentV1Struct | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_stateVar1 = STATE_MGMT_FACTORY.makeState<AEnumStr>(this, "stateVar1", (({let gensym___213853607 = initializers;
    (((gensym___213853607) == (null)) ? undefined : gensym___213853607.__options_has_stateVar1)}) ? (initializers!.stateVar1 as AEnumStr) : AEnumStr.A));
    this.__backing_stateVar2 = STATE_MGMT_FACTORY.makeState<string>(this, "stateVar2", (({let gensym___113574154 = initializers;
    (((gensym___113574154) == (null)) ? undefined : gensym___113574154.__options_has_stateVar2)}) ? (initializers!.stateVar2 as string) : AEnumStr.B));
    this.__backing_stateVar3 = STATE_MGMT_FACTORY.makeState<AEnumNum>(this, "stateVar3", (({let gensym___166994972 = initializers;
    (((gensym___166994972) == (null)) ? undefined : gensym___166994972.__options_has_stateVar3)}) ? (initializers!.stateVar3 as AEnumNum) : AEnumNum.C));
    this.__backing_stateVar4 = STATE_MGMT_FACTORY.makeState<number>(this, "stateVar4", (({let gensym___148024261 = initializers;
    (((gensym___148024261) == (null)) ? undefined : gensym___148024261.__options_has_stateVar4)}) ? (initializers!.stateVar4 as number) : AEnumNum.D));
    this.__backing_consumeVar1 = STATE_MGMT_FACTORY.makeConsume<AEnumStr>(this, "consumeVar1", "consumeVar1", undefined, {
      defaultValue: AEnumStr.A,
    });
    this.__backing_consumeVar2 = STATE_MGMT_FACTORY.makeConsume<string>(this, "consumeVar2", "consumeVar2", undefined, {
      defaultValue: AEnumStr.B,
    });
    this.__backing_consumeVar3 = STATE_MGMT_FACTORY.makeConsume<AEnumNum>(this, "consumeVar3", "consumeVar3", undefined, {
      defaultValue: AEnumNum.C,
    });
    this.__backing_consumeVar4 = STATE_MGMT_FACTORY.makeConsume<number>(this, "consumeVar4", "consumeVar4", undefined, {
      defaultValue: AEnumNum.D,
    });
    this.__backing_regularVar1 = (({let gensym___265618287 = initializers;
    (((gensym___265618287) == (null)) ? undefined : gensym___265618287.__options_has_regularVar1)}) ? (initializers!.regularVar1 as AEnumStr) : AEnumStr.A);
    this.__backing_regularVar2 = (({let gensym___6501538 = initializers;
    (((gensym___6501538) == (null)) ? undefined : gensym___6501538.__options_has_regularVar2)}) ? (initializers!.regularVar2 as string) : AEnumStr.B);
    this.__backing_regularVar3 = (({let gensym___10910334 = initializers;
    (((gensym___10910334) == (null)) ? undefined : gensym___10910334.__options_has_regularVar3)}) ? (initializers!.regularVar3 as AEnumNum) : AEnumNum.C);
    this.__backing_regularVar4 = (({let gensym___112547168 = initializers;
    (((gensym___112547168) == (null)) ? undefined : gensym___112547168.__options_has_regularVar4)}) ? (initializers!.regularVar4 as number) : AEnumNum.D);
    this.__backing_requireVar1 = (initializers!.requireVar1 as AEnumStr);
    this.__backing_requireVar2 = (initializers!.requireVar2 as string);
    this.__backing_requireVar3 = (initializers!.requireVar3 as AEnumNum);
    this.__backing_requireVar4 = (initializers!.requireVar4 as number);
  }
  
  public __updateStruct(initializers: (__Options_ComponentV1Struct | undefined)): void {}

  public resetStateVarsOnReuse(initializers: (__Options_ComponentV1Struct | undefined)): void {
    this.__backing_stateVar1!.resetOnReuse(AEnumStr.A);
    this.__backing_stateVar2!.resetOnReuse(AEnumStr.B);
    this.__backing_stateVar3!.resetOnReuse(AEnumNum.C);
    this.__backing_stateVar4!.resetOnReuse(AEnumNum.D);
    this.__backing_consumeVar1!.resetOnReuse("consumeVar1", undefined, {
      defaultValue: AEnumStr.A,
    });
    this.__backing_consumeVar2!.resetOnReuse("consumeVar2", undefined, {
      defaultValue: AEnumStr.B,
    });
    this.__backing_consumeVar3!.resetOnReuse("consumeVar3", undefined, {
      defaultValue: AEnumNum.C,
    });
    this.__backing_consumeVar4!.resetOnReuse("consumeVar4", undefined, {
      defaultValue: AEnumNum.D,
    });
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: ComponentV1Struct)=> void) | undefined), initializers: ((()=> __Options_ComponentV1Struct) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<ComponentV1Struct, __Options_ComponentV1Struct>(style, ((): ComponentV1Struct => {
      return new ComponentV1Struct(false, ({let gensym___115465836 = storage;
      (((gensym___115465836) == (null)) ? undefined : gensym___115465836())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ComponentV1Struct, storage?: LocalStorage, @Builder() content?: (()=> void)): ComponentV1Struct {
    throw new Error("Declare interface");
  }
  
  private __backing_stateVar1?: IStateDecoratedVariable<AEnumStr>;
  public get stateVar1(): AEnumStr {
    return this.__backing_stateVar1!.get();
  }
  
  public set stateVar1(value: AEnumStr) {
    this.__backing_stateVar1!.set(value);
  }
  
  private __backing_stateVar2?: IStateDecoratedVariable<string>;
  public get stateVar2(): string {
    return this.__backing_stateVar2!.get();
  }
  
  public set stateVar2(value: string) {
    this.__backing_stateVar2!.set(value);
  }
  
  private __backing_stateVar3?: IStateDecoratedVariable<AEnumNum>;
  public get stateVar3(): AEnumNum {
    return this.__backing_stateVar3!.get();
  }
  
  public set stateVar3(value: AEnumNum) {
    this.__backing_stateVar3!.set(value);
  }
  
  private __backing_stateVar4?: IStateDecoratedVariable<number>;
  public get stateVar4(): number {
    return this.__backing_stateVar4!.get();
  }
  
  public set stateVar4(value: number) {
    this.__backing_stateVar4!.set(value);
  }
  
  private __backing_consumeVar1?: IConsumeDecoratedVariable<AEnumStr>;
  public get consumeVar1(): AEnumStr {
    return this.__backing_consumeVar1!.get();
  }
  
  public set consumeVar1(value: AEnumStr) {
    this.__backing_consumeVar1!.set(value);
  }
  
  private __backing_consumeVar2?: IConsumeDecoratedVariable<string>;
  public get consumeVar2(): string {
    return this.__backing_consumeVar2!.get();
  }
  
  public set consumeVar2(value: string) {
    this.__backing_consumeVar2!.set(value);
  }
  
  private __backing_consumeVar3?: IConsumeDecoratedVariable<AEnumNum>;
  public get consumeVar3(): AEnumNum {
    return this.__backing_consumeVar3!.get();
  }
  
  public set consumeVar3(value: AEnumNum) {
    this.__backing_consumeVar3!.set(value);
  }
  
  private __backing_consumeVar4?: IConsumeDecoratedVariable<number>;
  public get consumeVar4(): number {
    return this.__backing_consumeVar4!.get();
  }
  
  public set consumeVar4(value: number) {
    this.__backing_consumeVar4!.set(value);
  }
  
  private __backing_regularVar1?: AEnumStr;
  public get regularVar1(): AEnumStr {
    return (this.__backing_regularVar1 as AEnumStr);
  }
  
  public set regularVar1(value: AEnumStr) {
    this.__backing_regularVar1 = value;
  }
  
  private __backing_regularVar2?: string;
  public get regularVar2(): string {
    return (this.__backing_regularVar2 as string);
  }
  
  public set regularVar2(value: string) {
    this.__backing_regularVar2 = value;
  }
  
  private __backing_regularVar3?: AEnumNum;
  public get regularVar3(): AEnumNum {
    return (this.__backing_regularVar3 as AEnumNum);
  }
  
  public set regularVar3(value: AEnumNum) {
    this.__backing_regularVar3 = value;
  }
  
  private __backing_regularVar4?: number;
  public get regularVar4(): number {
    return (this.__backing_regularVar4 as number);
  }
  
  public set regularVar4(value: number) {
    this.__backing_regularVar4 = value;
  }
  
  private __backing_requireVar1?: AEnumStr;
  public get requireVar1(): AEnumStr {
    return (this.__backing_requireVar1! as AEnumStr);
  }
  
  public set requireVar1(value: AEnumStr) {
    this.__backing_requireVar1 = value;
  }
  
  private __backing_requireVar2?: string;
  public get requireVar2(): string {
    return (this.__backing_requireVar2! as string);
  }
  
  public set requireVar2(value: string) {
    this.__backing_requireVar2 = value;
  }
  
  private __backing_requireVar3?: AEnumNum;
  public get requireVar3(): AEnumNum {
    return (this.__backing_requireVar3! as AEnumNum);
  }
  
  public set requireVar3(value: AEnumNum) {
    this.__backing_requireVar3 = value;
  }
  
  private __backing_requireVar4?: number;
  public get requireVar4(): number {
    return (this.__backing_requireVar4! as number);
  }
  
  public set requireVar4(value: number) {
    this.__backing_requireVar4 = value;
  }
  
  @Memo() 
  public build(): void {}
  
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  
  static {
    
  }
}

@ComponentV2() final struct ComponentV2Struct extends CustomComponentV2<ComponentV2Struct, __Options_ComponentV2Struct> {
  public __initializeStruct(initializers: (__Options_ComponentV2Struct | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_requireVar1 = STATE_MGMT_FACTORY.makeParam<AEnumStr>(this, "requireVar1", (initializers!.requireVar1 as AEnumStr));
    this.__backing_requireVar2 = STATE_MGMT_FACTORY.makeParam<string>(this, "requireVar2", (initializers!.requireVar2 as string));
    this.__backing_requireVar3 = STATE_MGMT_FACTORY.makeParam<AEnumNum>(this, "requireVar3", (initializers!.requireVar3 as AEnumNum));
    this.__backing_requireVar4 = STATE_MGMT_FACTORY.makeParam<number>(this, "requireVar4", (initializers!.requireVar4 as number));
    this.__backing_paramVar1 = STATE_MGMT_FACTORY.makeParam<AEnumStr>(this, "paramVar1", (({let gensym___96843881 = initializers;
    (((gensym___96843881) == (null)) ? undefined : gensym___96843881.__options_has_paramVar1)}) ? (initializers!.paramVar1 as AEnumStr) : AEnumStr.A));
    this.__backing_paramVar2 = STATE_MGMT_FACTORY.makeParam<string>(this, "paramVar2", (({let gensym___105439686 = initializers;
    (((gensym___105439686) == (null)) ? undefined : gensym___105439686.__options_has_paramVar2)}) ? (initializers!.paramVar2 as string) : AEnumStr.B));
    this.__backing_paramVar3 = STATE_MGMT_FACTORY.makeParam<AEnumNum>(this, "paramVar3", (({let gensym___143701851 = initializers;
    (((gensym___143701851) == (null)) ? undefined : gensym___143701851.__options_has_paramVar3)}) ? (initializers!.paramVar3 as AEnumNum) : AEnumNum.C));
    this.__backing_paramVar4 = STATE_MGMT_FACTORY.makeParam<number>(this, "paramVar4", (({let gensym___236923781 = initializers;
    (((gensym___236923781) == (null)) ? undefined : gensym___236923781.__options_has_paramVar4)}) ? (initializers!.paramVar4 as number) : AEnumNum.D));
    this.__backing_localVar1 = STATE_MGMT_FACTORY.makeLocal<AEnumStr>(this, "localVar1", AEnumStr.A);
    this.__backing_localVar2 = STATE_MGMT_FACTORY.makeLocal<string>(this, "localVar2", AEnumStr.B);
    this.__backing_localVar3 = STATE_MGMT_FACTORY.makeLocal<AEnumNum>(this, "localVar3", AEnumNum.C);
    this.__backing_localVar4 = STATE_MGMT_FACTORY.makeLocal<number>(this, "localVar4", AEnumNum.D);
  }
  
  public __updateStruct(initializers: (__Options_ComponentV2Struct | undefined)): void {
    if (({let gensym___112266433 = initializers;
    (((gensym___112266433) == (null)) ? undefined : gensym___112266433.__options_has_requireVar1)})) {
      this.__backing_requireVar1!.update((initializers!.requireVar1 as AEnumStr));
    }
    if (({let gensym___40900268 = initializers;
    (((gensym___40900268) == (null)) ? undefined : gensym___40900268.__options_has_requireVar2)})) {
      this.__backing_requireVar2!.update((initializers!.requireVar2 as string));
    }
    if (({let gensym___4374666 = initializers;
    (((gensym___4374666) == (null)) ? undefined : gensym___4374666.__options_has_requireVar3)})) {
      this.__backing_requireVar3!.update((initializers!.requireVar3 as AEnumNum));
    }
    if (({let gensym___104743435 = initializers;
    (((gensym___104743435) == (null)) ? undefined : gensym___104743435.__options_has_requireVar4)})) {
      this.__backing_requireVar4!.update((initializers!.requireVar4 as number));
    }
    if (({let gensym___144514587 = initializers;
    (((gensym___144514587) == (null)) ? undefined : gensym___144514587.__options_has_paramVar1)})) {
      this.__backing_paramVar1!.update((initializers!.paramVar1 as AEnumStr));
    }
    if (({let gensym___11423321 = initializers;
    (((gensym___11423321) == (null)) ? undefined : gensym___11423321.__options_has_paramVar2)})) {
      this.__backing_paramVar2!.update((initializers!.paramVar2 as string));
    }
    if (({let gensym___256572616 = initializers;
    (((gensym___256572616) == (null)) ? undefined : gensym___256572616.__options_has_paramVar3)})) {
      this.__backing_paramVar3!.update((initializers!.paramVar3 as AEnumNum));
    }
    if (({let gensym___247661821 = initializers;
    (((gensym___247661821) == (null)) ? undefined : gensym___247661821.__options_has_paramVar4)})) {
      this.__backing_paramVar4!.update((initializers!.paramVar4 as number));
    }
  }
  
  public resetStateVarsOnReuse(initializers: (__Options_ComponentV2Struct | undefined)): void {
    this.__backing_requireVar1!.resetOnReuse((initializers!.requireVar1 as AEnumStr));
    this.__backing_requireVar2!.resetOnReuse((initializers!.requireVar2 as string));
    this.__backing_requireVar3!.resetOnReuse((initializers!.requireVar3 as AEnumNum));
    this.__backing_requireVar4!.resetOnReuse((initializers!.requireVar4 as number));
    this.__backing_paramVar1!.resetOnReuse((({let gensym___113302488 = initializers;
    (((gensym___113302488) == (null)) ? undefined : gensym___113302488.__options_has_paramVar1)}) ? (initializers!.paramVar1 as AEnumStr) : AEnumStr.A));
    this.__backing_paramVar2!.resetOnReuse((({let gensym___237297865 = initializers;
    (((gensym___237297865) == (null)) ? undefined : gensym___237297865.__options_has_paramVar2)}) ? (initializers!.paramVar2 as string) : AEnumStr.B));
    this.__backing_paramVar3!.resetOnReuse((({let gensym___245636081 = initializers;
    (((gensym___245636081) == (null)) ? undefined : gensym___245636081.__options_has_paramVar3)}) ? (initializers!.paramVar3 as AEnumNum) : AEnumNum.C));
    this.__backing_paramVar4!.resetOnReuse((({let gensym___105907561 = initializers;
    (((gensym___105907561) == (null)) ? undefined : gensym___105907561.__options_has_paramVar4)}) ? (initializers!.paramVar4 as number) : AEnumNum.D));
    this.__backing_localVar1!.resetOnReuse(AEnumStr.A);
    this.__backing_localVar2!.resetOnReuse(AEnumStr.B);
    this.__backing_localVar3!.resetOnReuse(AEnumNum.C);
    this.__backing_localVar4!.resetOnReuse(AEnumNum.D);
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: ComponentV2Struct)=> void) | undefined), initializers: ((()=> __Options_ComponentV2Struct) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<ComponentV2Struct, __Options_ComponentV2Struct>(style, ((): ComponentV2Struct => {
      return new ComponentV2Struct();
    }), initializers, reuseId, content, {
      sClass: Class.from<ComponentV2Struct>(),
    });
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_ComponentV2Struct, storage?: LocalStorage, @Builder() content?: (()=> void)): ComponentV2Struct {
    throw new Error("Declare interface");
  }
  
  private __backing_requireVar1?: IParamDecoratedVariable<AEnumStr>;
  public get requireVar1(): AEnumStr {
    return this.__backing_requireVar1!.get();
  }
  
  private __backing_requireVar2?: IParamDecoratedVariable<string>;
  public get requireVar2(): string {
    return this.__backing_requireVar2!.get();
  }
  
  private __backing_requireVar3?: IParamDecoratedVariable<AEnumNum>;
  public get requireVar3(): AEnumNum {
    return this.__backing_requireVar3!.get();
  }
  
  private __backing_requireVar4?: IParamDecoratedVariable<number>;
  public get requireVar4(): number {
    return this.__backing_requireVar4!.get();
  }
  
  private __backing_paramVar1?: IParamDecoratedVariable<AEnumStr>;
  public get paramVar1(): AEnumStr {
    return this.__backing_paramVar1!.get();
  }
  
  private __backing_paramVar2?: IParamDecoratedVariable<string>;
  public get paramVar2(): string {
    return this.__backing_paramVar2!.get();
  }
  
  private __backing_paramVar3?: IParamDecoratedVariable<AEnumNum>;
  public get paramVar3(): AEnumNum {
    return this.__backing_paramVar3!.get();
  }
  
  private __backing_paramVar4?: IParamDecoratedVariable<number>;
  public get paramVar4(): number {
    return this.__backing_paramVar4!.get();
  }
  
  private __backing_localVar1?: ILocalDecoratedVariable<AEnumStr>;
  public get localVar1(): AEnumStr {
    return this.__backing_localVar1!.get();
  }
  
  public set localVar1(value: AEnumStr) {
    this.__backing_localVar1!.set(value);
  }
  
  private __backing_localVar2?: ILocalDecoratedVariable<string>;
  public get localVar2(): string {
    return this.__backing_localVar2!.get();
  }
  
  public set localVar2(value: string) {
    this.__backing_localVar2!.set(value);
  }
  
  private __backing_localVar3?: ILocalDecoratedVariable<AEnumNum>;
  public get localVar3(): AEnumNum {
    return this.__backing_localVar3!.get();
  }
  
  public set localVar3(value: AEnumNum) {
    this.__backing_localVar3!.set(value);
  }
  
  private __backing_localVar4?: ILocalDecoratedVariable<number>;
  public get localVar4(): number {
    return this.__backing_localVar4!.get();
  }
  
  public set localVar4(value: number) {
    this.__backing_localVar4!.set(value);
  }
  
  @Memo() 
  public build(): void {}
  
  public constructor() {}
  
  static {
    
  }
}

@Component() class __Options_ComponentV1Struct {
  @State() public stateVar1?: AEnumStr;
  public __backing_stateVar1?: IStateDecoratedVariable<AEnumStr>;
  public __options_has_stateVar1?: boolean;
  @State() public stateVar2?: string;
  public __backing_stateVar2?: IStateDecoratedVariable<string>;
  public __options_has_stateVar2?: boolean;
  @State() public stateVar3?: AEnumNum;
  public __backing_stateVar3?: IStateDecoratedVariable<AEnumNum>;
  public __options_has_stateVar3?: boolean;
  @State() public stateVar4?: number;
  public __backing_stateVar4?: IStateDecoratedVariable<number>;
  public __options_has_stateVar4?: boolean;
  @Consume() public consumeVar1?: AEnumStr;
  public __backing_consumeVar1?: IConsumeDecoratedVariable<AEnumStr>;
  public __options_has_consumeVar1?: boolean;
  @Consume() public consumeVar2?: string;
  public __backing_consumeVar2?: IConsumeDecoratedVariable<string>;
  public __options_has_consumeVar2?: boolean;
  @Consume() public consumeVar3?: AEnumNum;
  public __backing_consumeVar3?: IConsumeDecoratedVariable<AEnumNum>;
  public __options_has_consumeVar3?: boolean;
  @Consume() public consumeVar4?: number;
  public __backing_consumeVar4?: IConsumeDecoratedVariable<number>;
  public __options_has_consumeVar4?: boolean;
  public regularVar1?: AEnumStr;
  public __options_has_regularVar1?: boolean;
  public regularVar2?: string;
  public __options_has_regularVar2?: boolean;
  public regularVar3?: AEnumNum;
  public __options_has_regularVar3?: boolean;
  public regularVar4?: number;
  public __options_has_regularVar4?: boolean;
  @Require() public requireVar1: AEnumStr;
  public __options_has_requireVar1?: boolean;
  @Require() public requireVar2: string;
  public __options_has_requireVar2?: boolean;
  @Require() public requireVar3: AEnumNum;
  public __options_has_requireVar3?: boolean;
  @Require() public requireVar4: number;
  public __options_has_requireVar4?: boolean;
  public constructor() {}
  
}

@ComponentV2() class __Options_ComponentV2Struct {
  @Require() @Param() public requireVar1: AEnumStr;
  public __backing_requireVar1?: IParamDecoratedVariable<AEnumStr>;
  public __options_has_requireVar1?: boolean;
  @Require() @Param() public requireVar2: string;
  public __backing_requireVar2?: IParamDecoratedVariable<string>;
  public __options_has_requireVar2?: boolean;
  @Require() @Param() public requireVar3: AEnumNum;
  public __backing_requireVar3?: IParamDecoratedVariable<AEnumNum>;
  public __options_has_requireVar3?: boolean;
  @Require() @Param() public requireVar4: number;
  public __backing_requireVar4?: IParamDecoratedVariable<number>;
  public __options_has_requireVar4?: boolean;
  @Param() public paramVar1?: AEnumStr;
  public __backing_paramVar1?: IParamDecoratedVariable<AEnumStr>;
  public __options_has_paramVar1?: boolean;
  @Param() public paramVar2?: string;
  public __backing_paramVar2?: IParamDecoratedVariable<string>;
  public __options_has_paramVar2?: boolean;
  @Param() public paramVar3?: AEnumNum;
  public __backing_paramVar3?: IParamDecoratedVariable<AEnumNum>;
  public __options_has_paramVar3?: boolean;
  @Param() public paramVar4?: number;
  public __backing_paramVar4?: IParamDecoratedVariable<number>;
  public __options_has_paramVar4?: boolean;
  @Local() public localVar1?: AEnumStr;
  public __backing_localVar1?: ILocalDecoratedVariable<AEnumStr>;
  public __options_has_localVar1?: boolean;
  @Local() public localVar2?: string;
  public __backing_localVar2?: ILocalDecoratedVariable<string>;
  public __options_has_localVar2?: boolean;
  @Local() public localVar3?: AEnumNum;
  public __backing_localVar3?: ILocalDecoratedVariable<AEnumNum>;
  public __options_has_localVar3?: boolean;
  @Local() public localVar4?: number;
  public __backing_localVar4?: ILocalDecoratedVariable<number>;
  public __options_has_localVar4?: boolean;
  public constructor() {}
  
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test basic decorators with enums transform',
    [parseTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
