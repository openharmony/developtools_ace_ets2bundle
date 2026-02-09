/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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
import { recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const STATE_DIR_PATH: string = 'decorators/env';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'env-basic-type.ets'),
];

const pluginTester = new PluginTester('test basic type @Env decorated variables transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const expectedParsedScript: string = `
import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Entry as Entry, Text as Text, Column as Column, ComponentV2 as ComponentV2 } from "@ohos.arkui.component";

import { Env as Env } from "@ohos.arkui.stateManagement";

import uiObserver from "@ohos.arkui.observer";

import { SystemProperties as SystemProperties } from "@kit.ArkUI";

import window from "@ohos.window";

@Entry() @ComponentV2() final struct Index extends CustomComponentV2<Index, __Options_Index> implements PageLifeCycle {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Index, storage?: LocalStorage, @Builder() content?: (()=> void)): Index {
    throw new Error("Declare interface");
  }
  
  @Env({value:SystemProperties.BREAK_POINT}) public readonly breakpoint!: uiObserver.WindowSizeLayoutBreakpointInfo;
  @Env({value:SystemProperties.WINDOW_SIZE}) public readonly sizeInVP!: window.SizeInVP;
  @Env({value:SystemProperties.WINDOW_SIZE_PX}) public readonly sizeInPX!: window.Size;
  @Env({value:SystemProperties.WINDOW_AVOID_AREA}) public readonly windowAvoidAreaVP!: window.UIEnvWindowAvoidAreaInfoVP;
  @Env({value:SystemProperties.WINDOW_AVOID_AREA_PX}) public readonly windowAvoidAreaPX!: window.UIEnvWindowAvoidAreaInfoPX;
  public build() {
    Column(){
      Text(\`Index breakpoint width: \${this.breakpoint.widthBreakpoint}\`);
      Text(\`Index breakpoint height: \${this.breakpoint.heightBreakpoint}\`);
      Text(\`Index SizeInVP width: \${this.sizeInVP.width}\`);
      Text(\`Index SizeInVP height: \${this.sizeInVP.height}\`);
      Text(\`Index SizeInPX width: \${this.sizeInPX.width}\`);
      Text(\`Index SizeInPX height: \${this.sizeInPX.height}\`);
      Text(\`Index windowAvoidAreaVP statusBar visible: \${this.windowAvoidAreaVP.statusBar.visible}\`);
      Text(\`Index windowAvoidAreaVP statusBar leftRect left: \${this.windowAvoidAreaVP.statusBar.leftRect.left}\`);
      Text(\`Index windowAvoidAreaVP statusBar leftRect width: \${this.windowAvoidAreaVP.statusBar.leftRect.width}\`);
      Text(\`Index windowAvoidAreaVP statusBar topRect left: \${this.windowAvoidAreaVP.statusBar.topRect.left}\`);
      Text(\`Index windowAvoidAreaVP statusBar topRect width: \${this.windowAvoidAreaVP.statusBar.topRect.width}\`);
      Text(\`Index windowAvoidAreaVP statusBar rightRect left: \${this.windowAvoidAreaVP.statusBar.rightRect.left}\`);
      Text(\`Index windowAvoidAreaVP statusBar rightRect width: \${this.windowAvoidAreaVP.statusBar.rightRect.width}\`);
      Text(\`Index windowAvoidAreaVP statusBar bottomRect left: \${this.windowAvoidAreaVP.statusBar.bottomRect.left}\`);
      Text(\`Index windowAvoidAreaVP statusBar bottomRect width: \${this.windowAvoidAreaVP.statusBar.bottomRect.width}\`);
      Text(\`Index windowAvoidAreaPX statusBar visible: \${this.windowAvoidAreaPX.statusBar.visible}\`);
      Text(\`Index windowAvoidAreaPX statusBar leftRect left: \${this.windowAvoidAreaPX.statusBar.leftRect.left}\`);
      Text(\`Index windowAvoidAreaPX statusBar leftRect width: \${this.windowAvoidAreaPX.statusBar.leftRect.width}\`);
      Text(\`Index windowAvoidAreaPX statusBar topRect left: \${this.windowAvoidAreaPX.statusBar.topRect.left}\`);
      Text(\`Index windowAvoidAreaPX statusBar topRect width: \${this.windowAvoidAreaPX.statusBar.topRect.width}\`);
      Text(\`Index windowAvoidAreaPX statusBar rightRect left: \${this.windowAvoidAreaPX.statusBar.rightRect.left}\`);
      Text(\`Index windowAvoidAreaPX statusBar rightRect width: \${this.windowAvoidAreaPX.statusBar.rightRect.width}\`);
      Text(\`Index windowAvoidAreaPX statusBar bottomRect left: \${this.windowAvoidAreaPX.statusBar.bottomRect.left}\`);
      Text(\`Index windowAvoidAreaPX statusBar bottomRect width: \${this.windowAvoidAreaPX.statusBar.bottomRect.width}\`);
    };
  }
  
  public constructor() {}
  
}

class __EntryWrapper extends EntryPoint {
  public entry(): void {
    Index();
  }
  
  public constructor() {}
  
}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/env/env-basic-type",
  pageFullPath: "test/demo/mock/decorators/env/env-basic-type",
  integratedHsp: "false",
} as NavInterface))
@Entry() @ComponentV2() export interface __Options_Index {
  breakpoint?: uiObserver.WindowSizeLayoutBreakpointInfo;@Env({value:SystemProperties.BREAK_POINT}) __backing_breakpoint?: uiObserver.WindowSizeLayoutBreakpointInfo;__options_has_breakpoint?: boolean;sizeInVP?: window.SizeInVP;@Env({value:SystemProperties.WINDOW_SIZE}) __backing_sizeInVP?: window.SizeInVP;__options_has_sizeInVP?: boolean;sizeInPX?: window.Size;@Env({value:SystemProperties.WINDOW_SIZE_PX}) __backing_sizeInPX?: window.Size;__options_has_sizeInPX?: boolean;windowAvoidAreaVP?: window.UIEnvWindowAvoidAreaInfoVP;@Env({value:SystemProperties.WINDOW_AVOID_AREA}) __backing_windowAvoidAreaVP?: window.UIEnvWindowAvoidAreaInfoVP;__options_has_windowAvoidAreaVP?: boolean;windowAvoidAreaPX?: window.UIEnvWindowAvoidAreaInfoPX;@Env({value:SystemProperties.WINDOW_AVOID_AREA_PX}) __backing_windowAvoidAreaPX?: window.UIEnvWindowAvoidAreaInfoPX;__options_has_windowAvoidAreaPX?: boolean;
}
`;

const expectedCheckedScript: string = `

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { IEnvDecoratedVariable as IEnvDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { TextAttribute as TextAttribute } from "arkui.component.text";

import { TextImpl as TextImpl } from "arkui.component.text";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { Memo as Memo } from "arkui.incremental.annotation";
import { NavInterface as NavInterface } from "arkui.component.customComponent";
import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";
import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Entry as Entry, Text as Text, Column as Column, ComponentV2 as ComponentV2 } from "@ohos.arkui.component";

import { Env as Env } from "@ohos.arkui.stateManagement";

import uiObserver from "@ohos.arkui.observer";

import { SystemProperties as SystemProperties } from "@kit.ArkUI";

import window from "@ohos.window";

function main() {}
__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/env/env-basic-type",
  pageFullPath: "test/demo/mock/decorators/env/env-basic-type",
  integratedHsp: "false",
} as NavInterface));
@Entry({useSharedStorage:false,storage:"",routeName:""}) @ComponentV2() final struct Index extends CustomComponentV2<Index, __Options_Index> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_Index | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_breakpoint = STATE_MGMT_FACTORY.makeEnv<uiObserver.WindowSizeLayoutBreakpointInfo>(this, SystemProperties.BREAK_POINT, "breakpoint");
    this.__backing_sizeInVP = STATE_MGMT_FACTORY.makeEnv<window.SizeInVP>(this, SystemProperties.WINDOW_SIZE, "sizeInVP");
    this.__backing_sizeInPX = STATE_MGMT_FACTORY.makeEnv<window.Size>(this, SystemProperties.WINDOW_SIZE_PX, "sizeInPX");
    this.__backing_windowAvoidAreaVP = STATE_MGMT_FACTORY.makeEnv<window.UIEnvWindowAvoidAreaInfoVP>(this, SystemProperties.WINDOW_AVOID_AREA, "windowAvoidAreaVP");
    this.__backing_windowAvoidAreaPX = STATE_MGMT_FACTORY.makeEnv<window.UIEnvWindowAvoidAreaInfoPX>(this, SystemProperties.WINDOW_AVOID_AREA_PX, "windowAvoidAreaPX");
  }
  
  public __updateStruct(initializers: (__Options_Index | undefined)): void {}
  
  public resetStateVarsOnReuse(initializers: (__Options_Index | undefined)): void {}
  
  private __backing_breakpoint?: IEnvDecoratedVariable<uiObserver.WindowSizeLayoutBreakpointInfo>;
  public get breakpoint(): uiObserver.WindowSizeLayoutBreakpointInfo {
    return this.__backing_breakpoint!.get();
  }
  
  private __backing_sizeInVP?: IEnvDecoratedVariable<window.SizeInVP>;
  public get sizeInVP(): window.SizeInVP {
    return this.__backing_sizeInVP!.get();
  }
  
  private __backing_sizeInPX?: IEnvDecoratedVariable<window.Size>;
  public get sizeInPX(): window.Size {
    return this.__backing_sizeInPX!.get();
  }
  
  private __backing_windowAvoidAreaVP?: IEnvDecoratedVariable<window.UIEnvWindowAvoidAreaInfoVP>;
  public get windowAvoidAreaVP(): window.UIEnvWindowAvoidAreaInfoVP {
    return this.__backing_windowAvoidAreaVP!.get();
  }
  
  private __backing_windowAvoidAreaPX?: IEnvDecoratedVariable<window.UIEnvWindowAvoidAreaInfoPX>;
  public get windowAvoidAreaPX(): window.UIEnvWindowAvoidAreaInfoPX {
    return this.__backing_windowAvoidAreaPX!.get();
  }
  
  @MemoIntrinsic() 
  public static _invoke(style: @Memo() ((instance: Index)=> void), initializers: ((()=> __Options_Index) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponentV2._invokeImpl<Index, __Options_Index>(style, ((): Index => {
      return new Index();
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_Index, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): Index {
    throw new Error("Declare interface");
  }
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined);
      instance.applyAttributesFinish();
      return;
    }), @Memo() (() => {
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Index breakpoint width: \${this.breakpoint.widthBreakpoint}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Index breakpoint height: \${this.breakpoint.heightBreakpoint}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Index SizeInVP width: \${this.sizeInVP.width}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Index SizeInVP height: \${this.sizeInVP.height}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Index SizeInPX width: \${this.sizeInPX.width}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Index SizeInPX height: \${this.sizeInPX.height}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Index windowAvoidAreaVP statusBar visible: \${this.windowAvoidAreaVP.statusBar.visible}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Index windowAvoidAreaVP statusBar leftRect left: \${this.windowAvoidAreaVP.statusBar.leftRect.left}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Index windowAvoidAreaVP statusBar leftRect width: \${this.windowAvoidAreaVP.statusBar.leftRect.width}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Index windowAvoidAreaVP statusBar topRect left: \${this.windowAvoidAreaVP.statusBar.topRect.left}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Index windowAvoidAreaVP statusBar topRect width: \${this.windowAvoidAreaVP.statusBar.topRect.width}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Index windowAvoidAreaVP statusBar rightRect left: \${this.windowAvoidAreaVP.statusBar.rightRect.left}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Index windowAvoidAreaVP statusBar rightRect width: \${this.windowAvoidAreaVP.statusBar.rightRect.width}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Index windowAvoidAreaVP statusBar bottomRect left: \${this.windowAvoidAreaVP.statusBar.bottomRect.left}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Index windowAvoidAreaVP statusBar bottomRect width: \${this.windowAvoidAreaVP.statusBar.bottomRect.width}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Index windowAvoidAreaPX statusBar visible: \${this.windowAvoidAreaPX.statusBar.visible}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Index windowAvoidAreaPX statusBar leftRect left: \${this.windowAvoidAreaPX.statusBar.leftRect.left}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Index windowAvoidAreaPX statusBar leftRect width: \${this.windowAvoidAreaPX.statusBar.leftRect.width}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Index windowAvoidAreaPX statusBar topRect left: \${this.windowAvoidAreaPX.statusBar.topRect.left}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Index windowAvoidAreaPX statusBar topRect width: \${this.windowAvoidAreaPX.statusBar.topRect.width}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Index windowAvoidAreaPX statusBar rightRect left: \${this.windowAvoidAreaPX.statusBar.rightRect.left}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Index windowAvoidAreaPX statusBar rightRect width: \${this.windowAvoidAreaPX.statusBar.rightRect.width}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Index windowAvoidAreaPX statusBar bottomRect left: \${this.windowAvoidAreaPX.statusBar.bottomRect.left}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
      TextImpl(@Memo() ((instance: TextAttribute): void => {
        instance.setTextOptions(\`Index windowAvoidAreaPX statusBar bottomRect width: \${this.windowAvoidAreaPX.statusBar.bottomRect.width}\`, undefined);
        instance.applyAttributesFinish();
        return;
      }), undefined);
    }));
  }
  
  public constructor() {}
  
}

class __EntryWrapper extends EntryPoint {
  @Memo() 
  public entry(): void {
    Index._invoke(@Memo() ((instance: Index): void => {
      instance.applyAttributesFinish();
      return;
    }), undefined, undefined, undefined, undefined);
  }
  
  public constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @ComponentV2() export interface __Options_Index {
  get breakpoint(): (uiObserver.WindowSizeLayoutBreakpointInfo | undefined) {
    return undefined;
  }
  set breakpoint(breakpoint: (uiObserver.WindowSizeLayoutBreakpointInfo | undefined)) {
    throw new InvalidStoreAccessError();
  }
  @Env({value:SystemProperties.BREAK_POINT}) 
  get __backing_breakpoint(): (uiObserver.WindowSizeLayoutBreakpointInfo | undefined) {
    return undefined;
  }
  @Env({value:SystemProperties.BREAK_POINT}) 
  set __backing_breakpoint(__backing_breakpoint: (uiObserver.WindowSizeLayoutBreakpointInfo | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __options_has_breakpoint(): (boolean | undefined) {
    return undefined;
  }
  set __options_has_breakpoint(__options_has_breakpoint: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get sizeInVP(): (window.SizeInVP | undefined) {
    return undefined;
  }
  set sizeInVP(sizeInVP: (window.SizeInVP | undefined)) {
    throw new InvalidStoreAccessError();
  }
  @Env({value:SystemProperties.WINDOW_SIZE}) 
  get __backing_sizeInVP(): (window.SizeInVP | undefined) {
    return undefined;
  }
  @Env({value:SystemProperties.WINDOW_SIZE}) 
  set __backing_sizeInVP(__backing_sizeInVP: (window.SizeInVP | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __options_has_sizeInVP(): (boolean | undefined) {
    return undefined;
  }
  set __options_has_sizeInVP(__options_has_sizeInVP: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get sizeInPX(): (window.Size | undefined) {
    return undefined;
  }
  set sizeInPX(sizeInPX: (window.Size | undefined)) {
    throw new InvalidStoreAccessError();
  }
  @Env({value:SystemProperties.WINDOW_SIZE_PX}) 
  get __backing_sizeInPX(): (window.Size | undefined) {
    return undefined;
  }
  @Env({value:SystemProperties.WINDOW_SIZE_PX}) 
  set __backing_sizeInPX(__backing_sizeInPX: (window.Size | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __options_has_sizeInPX(): (boolean | undefined) {
    return undefined;
  }
  set __options_has_sizeInPX(__options_has_sizeInPX: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get windowAvoidAreaVP(): (window.UIEnvWindowAvoidAreaInfoVP | undefined) {
    return undefined;
  }
  set windowAvoidAreaVP(windowAvoidAreaVP: (window.UIEnvWindowAvoidAreaInfoVP | undefined)) {
    throw new InvalidStoreAccessError();
  }
  @Env({value:SystemProperties.WINDOW_AVOID_AREA}) 
  get __backing_windowAvoidAreaVP(): (window.UIEnvWindowAvoidAreaInfoVP | undefined) {
    return undefined;
  }
  @Env({value:SystemProperties.WINDOW_AVOID_AREA}) 
  set __backing_windowAvoidAreaVP(__backing_windowAvoidAreaVP: (window.UIEnvWindowAvoidAreaInfoVP | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __options_has_windowAvoidAreaVP(): (boolean | undefined) {
    return undefined;
  }
  set __options_has_windowAvoidAreaVP(__options_has_windowAvoidAreaVP: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get windowAvoidAreaPX(): (window.UIEnvWindowAvoidAreaInfoPX | undefined) {
    return undefined;
  }
  set windowAvoidAreaPX(windowAvoidAreaPX: (window.UIEnvWindowAvoidAreaInfoPX | undefined)) {
    throw new InvalidStoreAccessError();
  }
  @Env({value:SystemProperties.WINDOW_AVOID_AREA_PX}) 
  get __backing_windowAvoidAreaPX(): (window.UIEnvWindowAvoidAreaInfoPX | undefined) {
    return undefined;
  }
  @Env({value:SystemProperties.WINDOW_AVOID_AREA_PX}) 
  set __backing_windowAvoidAreaPX(__backing_windowAvoidAreaPX: (window.UIEnvWindowAvoidAreaInfoPX | undefined)) {
    throw new InvalidStoreAccessError();
  }
  get __options_has_windowAvoidAreaPX(): (boolean | undefined) {
    return undefined;
  }
  set __options_has_windowAvoidAreaPX(__options_has_windowAvoidAreaPX: (boolean | undefined)) {
    throw new InvalidStoreAccessError();
  }
  
}
`;

function testParsedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedParsedScript));
}

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test basic type @Env decorated variables transformation',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'parsed': [testParsedTransformer],
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);