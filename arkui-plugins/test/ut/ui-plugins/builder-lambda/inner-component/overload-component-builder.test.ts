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
import { recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';
import { dumpConstructor } from '../../../../utils/simplify-dump';

const BUILDER_LAMBDA_DIR_PATH: string = 'builder-lambda';
const INNER_COMPONENT_DIR_PATH: string = 'inner-component';
const UTIL_DIR_PATH: string = 'utils';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(
        getRootPath(),
        MOCK_ENTRY_DIR_PATH,
        BUILDER_LAMBDA_DIR_PATH,
        INNER_COMPONENT_DIR_PATH,
        'overload-component-builder.ets'
    ),
];

const utilExternalSourceName = [
    buildConfig.packageName,
    MOCK_ENTRY_DIR_PATH.replaceAll('/', '.'),
    BUILDER_LAMBDA_DIR_PATH,
    INNER_COMPONENT_DIR_PATH,
    UTIL_DIR_PATH,
    'fake-overload-component'
].join('.');

const pluginTester = new PluginTester('test multiple overload @ComponentBuilder', buildConfig);

const parsedTransform: Plugins = {
    name: 'overload-component-builder',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from \"arkui.incremental.annotation\";
import { FakeComponentAttribute as FakeComponentAttribute } from \"${utilExternalSourceName}\";
import { FakeComponentImpl as FakeComponentImpl } from \"${utilExternalSourceName}\";
import { Memo as Memo } from \"arkui.incremental.annotation\";
import { NavInterface as NavInterface } from \"arkui.component.customComponent\";
import { PageLifeCycle as PageLifeCycle } from \"arkui.component.customComponent\";
import { EntryPoint as EntryPoint } from \"arkui.component.customComponent\";
import { CustomComponent as CustomComponent } from \"arkui.component.customComponent\";
import { Builder as Builder } from \"arkui.component.builder";
import { LocalStorage as LocalStorage } from \"arkui.stateManagement.storage.localStorage\";
import { ComponentBuilder as ComponentBuilder } from \"arkui.component.builder\";
import { Entry as Entry, Component as Component } from \"arkui.component.customComponent\";
import { FakeComponent as FakeComponent } from \"./utils/fake-overload-component\";

function main() {}

__EntryWrapper.RegisterNamedRouter(\"\", new __EntryWrapper(), ({
    bundleName: \"com.example.mock\",
    moduleName: \"entry\",
    pagePath: \"../../../builder-lambda/inner-component/overload-component-builder\",
    pageFullPath: \"test/demo/mock/builder-lambda/inner-component/overload-component-builder\",
    integratedHsp: \"false\",
} as NavInterface));

@Entry({useSharedStorage:false,storage:\"\",routeName:\"\"}) @Component() final struct A extends CustomComponent<A, __Options_A> implements PageLifeCycle {
    public __initializeStruct(initializers: (__Options_A | undefined), @Memo() content: ((()=> void) | undefined)): void {}
    public __updateStruct(initializers: (__Options_A | undefined)): void {}
     @MemoIntrinsic() public static _invoke(style: @Memo() ((instance: A)=> void), initializers: ((()=> __Options_A) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
        CustomComponent._invokeImpl<A, __Options_A>(style, ((): A => {
            return new A(false, ({let gensym___<some_random_number> = storage;
                (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>())}));
        }), initializers, reuseId, content);
    }
    @ComponentBuilder() public static $_invoke(initializers?: __Options_A, storage?: LocalStorage, @Builder() @Memo() content?: (()=> void)): A {
        throw new Error("Declare interface");
    }
    @Memo() public build() {
        FakeComponentImpl(@Memo() ((instance: FakeComponentAttribute): void => {
            instance.setFakeComponentOptions(\"fake-component\");
            return;
        }), undefined);
        FakeComponentImpl(@Memo() ((instance: FakeComponentAttribute): void => {
            instance.setFakeComponentOptions({});
            return;
        }), undefined);
        FakeComponentImpl(@Memo() ((instance: FakeComponentAttribute): void => {
            instance.setFakeComponentOptions(undefined);
            return;
        }), @Memo() (() => {}));
    }
    ${dumpConstructor()}
}

class __EntryWrapper extends EntryPoint {
    @Memo() public entry(): void {
        A._invoke(@Memo() ((instance: A): void => {
            instance.applyAttributesFinish();
            return;
        }), undefined, undefined, undefined, undefined);
    }
    public constructor() {}
}

@Entry({useSharedStorage:false,storage:\"\",routeName:\"\"}) @Component() export interface __Options_A {
}
`;

const expectedUIHeaderScript: string = `
import { Memo as Memo } from "arkui.incremental.annotation";
import { memo as memo } from "arkui.stateManagement.runtime";
import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

function main() {}

@memo() export function FakeComponent(style: @Memo() ((instance: FakeComponentAttribute)=> void), str: string, @memo() content_?: (()=> void)): void
@memo() export function FakeComponent(style: @Memo() ((instance: FakeComponentAttribute)=> void), options?: FakeOptions, @memo() content_?: (()=> void)): void
@memo() export function FakeComponent(style: @Memo() ((instance: FakeComponentAttribute)=> void), @memo() content_?: (()=> void)): void

@Memo() export function FakeComponentImpl(style: @Memo() ((instance: FakeComponentAttribute)=> void), content?: @Memo() (()=> void)): void

interface FakeOptions {
    get str(): (string | undefined)
    set str(str: (string | undefined))
}

interface FakeComponentAttribute {
  setFakeComponentOptions(str: string): this
  setFakeComponentOptions(options?: FakeOptions): this
  setFakeComponentOptions(): this
  
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.declContexts?.[utilExternalSourceName]?.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIHeaderScript));
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

pluginTester.run(
    'test multiple overload @ComponentBuilder',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
        tracing: { externalSourceNames: [utilExternalSourceName] },
    }
);
