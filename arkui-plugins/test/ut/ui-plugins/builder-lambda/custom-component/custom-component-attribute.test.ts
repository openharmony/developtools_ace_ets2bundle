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
import { beforeUINoRecheck, recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, ignoreNewLines, dumpConstructor, dumpAnnotation } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'builder-lambda';
const CUSTOM_COMPONENT_DIR_PATH: string = 'custom-component';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(
        getRootPath(),
        MOCK_ENTRY_DIR_PATH,
        BUILDER_LAMBDA_DIR_PATH,
        CUSTOM_COMPONENT_DIR_PATH,
        'custom-component-attribute.ets'
    ),
];

const pluginTester = new PluginTester('test custom component with common method attributes', buildConfig);

const parsedTransform: Plugins = {
    name: 'custom-component-attribute',
    parsed: uiTransform().parsed,
};

const expectedParsedScript: string = `
import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Entry as Entry, Text as Text, Column as Column, Component as Component, Row as Row } from "@ohos.arkui.component";

import { Link as Link, State as State } from "@ohos.arkui.stateManagement";

const ITEMS_ON_SCREEN = 8
@Entry() @Component() final struct IDataSourcePrefetchingMethods extends CustomComponent<IDataSourcePrefetchingMethods, __Options_IDataSourcePrefetchingMethods> implements PageLifeCycle {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_IDataSourcePrefetchingMethods, storage?: LocalStorage, @Builder() content?: (()=> void)): IDataSourcePrefetchingMethods {
    throw new Error("Declare interface");
  }
  
  @State() public loadedCount: string = "0";
  public build() {
    Column(){
        PictureItemComponent({
            loadedCount: this.loadedCount,
        }).height(\`\${((50) / (ITEMS_ON_SCREEN))}%\`).finishRender();
    }.height("100%").width("100%");
  }
  
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  
}

@Component() final struct PictureItemComponent extends CustomComponent<PictureItemComponent, __Options_PictureItemComponent> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_PictureItemComponent, storage?: LocalStorage, @Builder() content?: (()=> void)): PictureItemComponent {
    throw new Error("Declare interface");
  }
  
  @Link() public loadedCount!: string;
  public finishRender(): void {}
  public build() {
    Row(){
        Text(this.loadedCount).width("60%");
    };
  }
  
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  
}

class __EntryWrapper extends EntryPoint {
  public entry(): void {
    IDataSourcePrefetchingMethods();
  }
  
  public constructor() {}
  
}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../builder-lambda/custom-component/custom-component-attribute",
  pageFullPath: "test/demo/mock/builder-lambda/custom-component/custom-component-attribute",
  integratedHsp: "false",
} as NavInterface))
@Entry() @Component() export interface __Options_IDataSourcePrefetchingMethods {
  ${ignoreNewLines(`
    @State() loadedCount?: string;
    @State() __backing_loadedCount?: string;
    __options_has_loadedCount?: boolean;
`)}
  
}

@Component() export interface __Options_PictureItemComponent {
  ${ignoreNewLines(`
    @Link() loadedCount?: string;
    @Link() __backing_loadedCount?: string;
    __options_has_loadedCount?: boolean;
`)}
  
}`;

function testParedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedParsedScript));
}

const expectedBuilderLambdaScript: string = `
import { LinkSourceType as LinkSourceType } from "arkui.stateManagement.decorator";

import { ILinkDecoratedVariable as ILinkDecoratedVariable } from "arkui.stateManagement.decorator";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { Memo as Memo } from "arkui.incremental.annotation";

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Entry as Entry, Text as Text, Column as Column, Component as Component, Row as Row } from "@ohos.arkui.component";

import { Link as Link, State as State } from "@ohos.arkui.stateManagement";

const ITEMS_ON_SCREEN = 8;
function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../builder-lambda/custom-component/custom-component-attribute",
  pageFullPath: "test/demo/mock/builder-lambda/custom-component/custom-component-attribute",
  integratedHsp: "false",
} as NavInterface));
@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() final struct IDataSourcePrefetchingMethods extends CustomComponent<IDataSourcePrefetchingMethods, __Options_IDataSourcePrefetchingMethods> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_IDataSourcePrefetchingMethods | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_loadedCount = STATE_MGMT_FACTORY.makeState<string>(this, "loadedCount", ((({let gensym___153122796 = initializers;
    (((gensym___153122796) == (null)) ? undefined : gensym___153122796.loadedCount)})) ?? ("0")));
  }
  
  public __updateStruct(initializers: (__Options_IDataSourcePrefetchingMethods | undefined)): void {}
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: IDataSourcePrefetchingMethods)=> void) | undefined), initializers: ((()=> __Options_IDataSourcePrefetchingMethods) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<IDataSourcePrefetchingMethods, __Options_IDataSourcePrefetchingMethods>(style, ((): IDataSourcePrefetchingMethods => {
      return new IDataSourcePrefetchingMethods(false, ({let gensym___149025070 = storage;
      (((gensym___149025070) == (null)) ? undefined : gensym___149025070())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_IDataSourcePrefetchingMethods, storage?: LocalStorage, @Builder() content?: (()=> void)): IDataSourcePrefetchingMethods {
    throw new Error("Declare interface");
  }
  
  private __backing_loadedCount?: IStateDecoratedVariable<string>;
  public get loadedCount(): string {
    return this.__backing_loadedCount!.get();
  }
  
  public set loadedCount(value: string) {
    this.__backing_loadedCount!.set(value);
  }
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
        instance.setColumnOptions(undefined).height("100%").width("100%");
        instance.applyAttributesFinish();
        return;
    }), @Memo() (() => {
        PictureItemComponent._invoke(@Memo() ((instance: PictureItemComponent): void => {
            instance.height(\`\${((50) / (ITEMS_ON_SCREEN))}%\`).finishRender();
            instance.applyAttributesFinish();
            return;
        }), (() => {
            return {
                __backing_loadedCount: this.__backing_loadedCount,
                __options_has_loadedCount: true,
            };
        }), undefined, undefined, undefined);
    }));
  }

  ${dumpConstructor()}
  
  static {
    
  }
}

@Component() final struct PictureItemComponent extends CustomComponent<PictureItemComponent, __Options_PictureItemComponent> {
  public __initializeStruct(initializers: (__Options_PictureItemComponent | undefined), @Memo() content: ((()=> void) | undefined)): void {
    if (({let gensym___257892811 = initializers;
    (((gensym___257892811) == (null)) ? undefined : gensym___257892811.__options_has_loadedCount)})) {
      this.__backing_loadedCount = STATE_MGMT_FACTORY.makeLink<string>(this, "loadedCount", initializers!.__backing_loadedCount!);
    };
  }
  
  public __updateStruct(initializers: (__Options_PictureItemComponent | undefined)): void {}
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: PictureItemComponent)=> void) | undefined), initializers: ((()=> __Options_PictureItemComponent) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<PictureItemComponent, __Options_PictureItemComponent>(style, ((): PictureItemComponent => {
      return new PictureItemComponent(false, ({let gensym___17371929 = storage;
      (((gensym___17371929) == (null)) ? undefined : gensym___17371929())}));
    }), initializers, reuseId, content);
  }
  
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_PictureItemComponent, storage?: LocalStorage, @Builder() content?: (()=> void)): PictureItemComponent {
    throw new Error("Declare interface");
  }
  
  private __backing_loadedCount?: ILinkDecoratedVariable<string>;
  public get loadedCount(): string {
    return this.__backing_loadedCount!.get();
  }
  
  public set loadedCount(value: string) {
    this.__backing_loadedCount!.set(value);
  }
  
  public finishRender(): void {}
  
  @Memo() 
  public build() {
    RowImpl(@Memo() ((instance: RowAttribute): void => {
        instance.setRowOptions(undefined);
        instance.applyAttributesFinish();
        return;
    }), @Memo() (() => {
        TextImpl(@Memo() ((instance: TextAttribute): void => {
            instance.setTextOptions(this.loadedCount, undefined).width("60%");
            instance.applyAttributesFinish();
            return;
        }), undefined);
    }));
  }
  
  ${dumpConstructor()}
  
  static {
    
  }
}

class __EntryWrapper extends EntryPoint {
  @Memo() 
  public entry(): void {
    IDataSourcePrefetchingMethods._invoke(undefined, undefined, undefined, undefined, undefined);
  }
  
  public constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() export interface __Options_IDataSourcePrefetchingMethods {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'loadedCount', '(string | undefined)', [dumpAnnotation('State')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_loadedCount', '(IStateDecoratedVariable<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_loadedCount', '(boolean | undefined)')}
  
}

@Component() export interface __Options_PictureItemComponent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'loadedCount', '(string | undefined)', [dumpAnnotation('Link')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_loadedCount', '(LinkSourceType<string> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_loadedCount', '(boolean | undefined)')}
  
}
`;

function testCustomComponentTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedBuilderLambdaScript));
}

pluginTester.run(
    'test custom component with common method attributes',
    [parsedTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        parsed: [testParedTransformer],
        'checked:ui-no-recheck': [testCustomComponentTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
