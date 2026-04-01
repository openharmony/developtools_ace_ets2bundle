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
import { beforeUINoRecheck, recheck, uiNoRecheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, ignoreNewLines, dumpAnnotation } from '../../../utils/simplify-dump';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const COMPONENT_DIR_PATH: string = 'component';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, COMPONENT_DIR_PATH, 'declare-component.ets'),
];

const pluginTester = new PluginTester('test declare component transformation', buildConfig);

const parsedTransform: Plugins = {
    name: 'declare-component',
    parsed: uiTransform().parsed
};

const expectedParsedcript: string = `
import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component, ResourceStr as ResourceStr, Builder as Builder, ComponentV2 as ComponentV2, BuilderParam as BuilderParam, Entry as Entry } from "@ohos.arkui.component";

import { PropRef as PropRef, State as State, Local as Local, Monitor as Monitor, Computed as Computed, ComponentInit as ComponentInit, ComponentAppear as ComponentAppear } from "@ohos.arkui.stateManagement";

@Component() export declare final struct SwipeRefresher extends CustomComponent<SwipeRefresher, __Options_SwipeRefresher> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_SwipeRefresher, storage?: LocalStorage, @Builder() content?: (()=> void)): SwipeRefresher
  
  @PropRef() public content?: (ResourceStr | undefined);
  @PropRef() public isLoading: boolean;
  @Builder() 
  public build(): void
  
  public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
  
  public static _buildCompatibleNode(options: __Options_SwipeRefresher): void
  
}

@Entry() @ComponentV2() export declare final struct DeclaredComponentV2 extends CustomComponentV2<DeclaredComponentV2, __Options_DeclaredComponentV2> implements PageLifeCycle {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_DeclaredComponentV2, storage?: LocalStorage, @Builder() content?: (()=> void)): DeclaredComponentV2
  
  @Local() public content: number;
  @BuilderParam() public builderParamContent: (()=> void);
  @Monitor({value:["content"]}) 
  public onContentChange(): void
  
  @Computed() 
  public get text(): string
  
  @ComponentInit() 
  public onComponentInit(): void
  
  @ComponentAppear() 
  public onComponentAppear(): void
  
  @Builder() 
  public build(): void
  
  public constructor()
  
  public static _buildCompatibleNode(options: __Options_DeclaredComponentV2): void
  
}

class __EntryWrapper extends EntryPoint {
  public entry(): void {
    DeclaredComponentV2();
  }
  
  public constructor() {}
  
}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../component/declare-component",
  pageFullPath: "test/demo/mock/component/declare-component",
  integratedHsp: "false",
} as NavInterface))
@Component() export declare interface __Options_SwipeRefresher {
  ${ignoreNewLines(`
    @PropRef() content?: (ResourceStr | undefined);
    @PropRef() __backing_content?: (ResourceStr | undefined);
    __options_has_content?: boolean;
    @PropRef() isLoading?: boolean;
    @PropRef() __backing_isLoading?: boolean;
    __options_has_isLoading?: boolean;
`)}
  
}

@Entry() @ComponentV2() export declare interface __Options_DeclaredComponentV2 {
  ${ignoreNewLines(`
    @Local() content?: number;
    @Local() __backing_content?: number;
    __options_has_content?: boolean;
    @BuilderParam() builderParamContent?: (()=> void);
    __options_has_builderParamContent?: boolean;
`)}
  
}
`;

function testParsedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedParsedcript));
}

const expectedCheckedScript: string = `
import { ILocalDecoratedVariable as ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { IPropRefDecoratedVariable as IPropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { Memo as Memo } from "arkui.incremental.annotation";

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

import { CustomComponentV2 as CustomComponentV2 } from "arkui.component.customComponent";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component, ResourceStr as ResourceStr, Builder as Builder, ComponentV2 as ComponentV2, BuilderParam as BuilderParam, Entry as Entry } from "@ohos.arkui.component";

import { PropRef as PropRef, State as State, Local as Local, Monitor as Monitor, Computed as Computed, ComponentInit as ComponentInit, ComponentAppear as ComponentAppear } from "@ohos.arkui.stateManagement";

function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../component/declare-component",
  pageFullPath: "test/demo/mock/component/declare-component",
  integratedHsp: "false",
} as NavInterface));
@Component() export declare final struct SwipeRefresher extends CustomComponent<SwipeRefresher, __Options_SwipeRefresher> {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_SwipeRefresher, storage?: LocalStorage, @Builder() content?: (()=> void)): SwipeRefresher
  
  @PropRef() public content?: (ResourceStr | undefined);
  @PropRef() public isLoading: boolean;
  @Memo() 
  public build(): void
  
  public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
  
  public static _buildCompatibleNode(options: __Options_SwipeRefresher): void
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: SwipeRefresher)=> void) | undefined), initializers: ((()=> __Options_SwipeRefresher) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @ComponentV2() export declare final struct DeclaredComponentV2 extends CustomComponentV2<DeclaredComponentV2, __Options_DeclaredComponentV2> implements PageLifeCycle {
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_DeclaredComponentV2, storage?: LocalStorage, @Builder() content?: (()=> void)): DeclaredComponentV2
  
  @Local() public content: number;
  @BuilderParam() public builderParamContent: @Memo() (()=> void);
  @Monitor({value:["content"]}) 
  public onContentChange(): void
  
  @Computed() 
  public get text(): string
  
  @ComponentInit() 
  public onComponentInit(): void
  
  @ComponentAppear() 
  public onComponentAppear(): void
  
  @Memo() 
  public build(): void
  
  public constructor()
  
  public static _buildCompatibleNode(options: __Options_DeclaredComponentV2): void
  
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: DeclaredComponentV2)=> void) | undefined), initializers: ((()=> __Options_DeclaredComponentV2) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: ((()=> void) | undefined)): void
  
}

class __EntryWrapper extends EntryPoint {
  @Memo() 
  public entry(): void {
    DeclaredComponentV2._invoke(undefined, undefined, undefined, undefined, undefined);
  }
  
  public constructor() {}
  
}

@Component() export declare interface __Options_SwipeRefresher {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'content', '((ResourceStr | undefined) | undefined)', [dumpAnnotation('PropRef')], [], false)}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_content', '(IPropRefDecoratedVariable<(ResourceStr | undefined)> | undefined)', [], [], false)}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_content', '(boolean | undefined)', [], [], false)}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'isLoading', '(boolean | undefined)', [dumpAnnotation('PropRef')], [], false)}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_isLoading', '(IPropRefDecoratedVariable<boolean> | undefined)', [], [], false)}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_isLoading', '(boolean | undefined)', [], [], false)}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @ComponentV2() export declare interface __Options_DeclaredComponentV2 {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'content', '(number | undefined)', [dumpAnnotation('Local')], [], false)}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_content', '(ILocalDecoratedVariable<number> | undefined)', [], [], false)}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_content', '(boolean | undefined)', [], [], false)}

  ${dumpGetterSetter(GetSetDumper.BOTH, 'builderParamContent', '(@Memo() (()=> void) | undefined)', [], [], false)}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_builderParamContent', '(boolean | undefined)', [], [], false)}

}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedCheckedScript));
}

pluginTester.run(
    'test declare component transformation',
    [parsedTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'parsed': [testParsedTransformer],
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
