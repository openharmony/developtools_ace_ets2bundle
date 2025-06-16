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
import { recheck, uiNoRecheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const XCOMPONENT_DIR_PATH: string = 'xcomponent';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, XCOMPONENT_DIR_PATH, 'xcomponent-basic.ets'),
];

const xcomponentTransform: Plugins = {
    name: 'xcomponent',
    parsed: uiTransform().parsed,
};

const pluginTester = new PluginTester('test basic XComponent transform', buildConfig);

const expectedScript: string = `

import { memo as memo } from "arkui.stateManagement.runtime";

import { FlexAttribute as FlexAttribute } from "arkui.component.flex";

import { EntryPoint as EntryPoint } from "arkui.UserView";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, Flex as Flex, XComponent as XComponent, FlexDirection as FlexDirection, XComponentType as XComponentType, Entry as Entry, XComponentController as XComponentController, ItemAlign as ItemAlign, FlexAlign as FlexAlign, XComponentParameter as XComponentParameter } from "@ohos.arkui.component";

function main() {}



@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component({freezeWhenInactive:false}) final struct Index extends CustomComponent<Index, __Options_Index> {
  public __initializeStruct(initializers: __Options_Index | undefined, @memo() content: (()=> void) | undefined): void {
    this.__backing_myXComponentController = ((({let gensym___221905990 = initializers;
    (((gensym___221905990) == (null)) ? undefined : gensym___221905990.myXComponentController)})) ?? (new XComponentController()));
  }
  
  public __updateStruct(initializers: __Options_Index | undefined): void {}
  
  private __backing_myXComponentController?: XComponentController;
  
  public get myXComponentController(): XComponentController {
    return (this.__backing_myXComponentController as XComponentController);
  }
  
  public set myXComponentController(value: XComponentController) {
    this.__backing_myXComponentController = value;
  }
  
  @memo() public _build(@memo() style: ((instance: Index)=> Index) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_Index | undefined): void {
    Flex(((instance: FlexAttribute): void => {
      instance.width("100%").height("100%");
      return;
    }), {
      direction: FlexDirection.Column,
      alignItems: ItemAlign.Center,
      justifyContent: FlexAlign.Start,
    }, (() => {
      XComponent(undefined, ({
        id: "xComponentId",
        type: XComponentType.TEXTURE,
        libraryname: "nativerender",
        controller: this.myXComponentController,
      } as XComponentParameter), "");
    }));
  }
  
  private constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component({freezeWhenInactive:false}) export interface __Options_Index {
  set myXComponentController(myXComponentController: XComponentController | undefined)
  
  get myXComponentController(): XComponentController | undefined
  
}

class __EntryWrapper extends EntryPoint {
  @memo() public entry(): void {
    Index._instantiateImpl(undefined, (() => {
      return new Index();
    }));
  }
  
  public constructor() {}
  
}
`;

const expectedHeader: string = `

import { memo as memo } from "arkui.stateManagement.runtime";

import { ImageAIOptions as ImageAIOptions, ImageAnalyzerConfig as ImageAnalyzerConfig } from "./imageCommon";

import { CommonMethod as CommonMethod, AttributeModifier as AttributeModifier } from "./common";

import { XComponentType as XComponentType } from "./enums";

import { VoidCallback as VoidCallback } from "./units";

import { memo as memo, ComponentBuilder as ComponentBuilder } from "./../stateManagement/runtime";

function main() {}


@memo() export function XComponent(@memo() style?: ((instance: XComponentAttribute)=> void), params: XComponentParameter | XComponentOptions | NativeXComponentParameters, packageInfo: string, @memo() content_?: (()=> void)): void


export declare interface SurfaceRect {
  set offsetX(offsetX: number | undefined)
  
  get offsetX(): number | undefined
  set offsetY(offsetY: number | undefined)
  
  get offsetY(): number | undefined
  set surfaceWidth(surfaceWidth: number)
  
  get surfaceWidth(): number
  set surfaceHeight(surfaceHeight: number)
  
  get surfaceHeight(): number
  
}

export declare interface SurfaceRotationOptions {
  set lock(lock: boolean | undefined)
  
  get lock(): boolean | undefined
  
}

export declare class XComponentController {
  public constructor()
  
  public getXComponentSurfaceId(): string
  
  public getXComponentContext(): Object
  
  public setXComponentSurfaceRect(rect: SurfaceRect): void
  
  public getXComponentSurfaceRect(): SurfaceRect
  
  public setXComponentSurfaceRotation(rotationOptions: SurfaceRotationOptions): void
  
  public getXComponentSurfaceRotation(): Required<SurfaceRotationOptions>
  
  public onSurfaceCreated(surfaceId: string): void
  
  public onSurfaceChanged(surfaceId: string, rect: SurfaceRect): void
  
  public onSurfaceDestroyed(surfaceId: string): void
  
  public startImageAnalyzer(config: ImageAnalyzerConfig): Promise<void>
  
  public stopImageAnalyzer(): void
  
}

export declare interface XComponentOptions {
  set type(type: XComponentType)
  
  get type(): XComponentType
  set controller(controller: XComponentController)
  
  get controller(): XComponentController
  set imageAIOptions(imageAIOptions: ImageAIOptions | undefined)
  
  get imageAIOptions(): ImageAIOptions | undefined
  set screenId(screenId: number | undefined)
  
  get screenId(): number | undefined
  
}

export declare interface NativeXComponentParameters {
  set type(type: XComponentType)
  
  get type(): XComponentType
  set imageAIOptions(imageAIOptions: ImageAIOptions | undefined)
  
  get imageAIOptions(): ImageAIOptions | undefined
  
}

export type OnNativeLoadCallback = ((event?: object)=> void);

export declare interface XComponentAttribute extends CommonMethod {
  onLoad(callback: OnNativeLoadCallback | undefined): this
  onDestroy(event: VoidCallback | undefined): this
  enableAnalyzer(enable: boolean | undefined): this
  enableSecure(isSecure: boolean | undefined): this
  hdrBrightness(brightness: number | undefined): this
  enableTransparentLayer(enabled: boolean | undefined): this
  attributeModifier(modifier: AttributeModifier<XComponentAttribute> | AttributeModifier<CommonMethod> | undefined): this
  
}

export declare interface XComponentParameter {
  set id(id: string)
  
  get id(): string
  set type(type: XComponentType)
  
  get type(): XComponentType
  set libraryname(libraryname: string | undefined)
  
  get libraryname(): string | undefined
  set controller(controller: XComponentController | undefined)
  
  get controller(): XComponentController | undefined
  
}
`

function testXComponentTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
    expect(parseDumpSrc(this.declContexts?.['arkui.component.xcomponent']?.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedHeader));
    
}

pluginTester.run(
    'test basic XComponent transform',
    [xcomponentTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testXComponentTransformer],
    },
    {
        stopAfter: 'checked',
        tracing: {externalSourceNames:['arkui.component.xcomponent']}
    }
);
