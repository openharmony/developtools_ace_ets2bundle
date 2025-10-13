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
        'multi-component-builder.ets'
    ),
];

const utilExternalSourceName = [
    buildConfig.packageName,
    MOCK_ENTRY_DIR_PATH.replaceAll('/', '.'),
    BUILDER_LAMBDA_DIR_PATH,
    INNER_COMPONENT_DIR_PATH,
    UTIL_DIR_PATH,
    'fake-multi-component'
].join('.');

const pluginTester = new PluginTester('test multiple different @ComponentBuilder', buildConfig);

const parsedTransform: Plugins = {
    name: 'multi-component-builder',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `
import { FakeComponentCAttribute as FakeComponentCAttribute } from \"${utilExternalSourceName}\";
import { FakeComponentCImpl as FakeComponentCImpl } from \"${utilExternalSourceName}\";
import { FakeComponentBAttribute as FakeComponentBAttribute } from \"${utilExternalSourceName}\";
import { FakeComponentBImpl as FakeComponentBImpl } from \"${utilExternalSourceName}\";
import { memo as memo } from \"arkui.stateManagement.runtime\";
import { FakeComponentAAttribute as FakeComponentAAttribute } from \"${utilExternalSourceName}\";
import { FakeComponentAImpl as FakeComponentAImpl } from \"${utilExternalSourceName}\";
import { NavInterface as NavInterface } from \"arkui.component.customComponent\";
import { PageLifeCycle as PageLifeCycle } from \"arkui.component.customComponent\";
import { EntryPoint as EntryPoint } from \"arkui.component.customComponent\";
import { CustomComponent as CustomComponent } from \"arkui.component.customComponent\";
import { Entry as Entry, Component as Component } from \"arkui.component.customComponent\";
import { FakeComponentA as FakeComponentA, FakeComponentB as FakeComponentB, FakeComponentC as FakeComponentC } from \"./utils/fake-multi-component\";

function main() {}
    __EntryWrapper.RegisterNamedRouter(\"\", new __EntryWrapper(), ({
    bundleName: \"com.example.mock\",
    moduleName: \"entry\",
    pagePath: \"../../../builder-lambda/inner-component/multi-component-builder\",
    pageFullPath: \"test/demo/mock/builder-lambda/inner-component/multi-component-builder\",
    integratedHsp: \"false\",
} as NavInterface));

@Entry({useSharedStorage:false,storage:\"\",routeName:\"\"}) @Component() final struct A extends CustomComponent<A, __Options_A> implements PageLifeCycle {
    public __initializeStruct(initializers: (__Options_A | undefined), @memo() content: ((()=> void) | undefined)): void {}
    public __updateStruct(initializers: (__Options_A | undefined)): void {}
    @memo() public build() {
        FakeComponentAImpl(@memo() ((instance: FakeComponentAAttribute): void => {
            instance.setFakeComponentAOptions(\"fake-component\");
            return;
        }), undefined);
        FakeComponentBImpl(@memo() ((instance: FakeComponentBAttribute): void => {
            instance.setFakeComponentBOptions({});
            return;
        }), undefined);
        FakeComponentCImpl(@memo() ((instance: FakeComponentCAttribute): void => {
            instance.setFakeComponentCOptions();
            return;
        }), @memo() (() => {}));
    }
    public constructor() {}
}

@Entry({useSharedStorage:false,storage:\"\",routeName:\"\"}) @Component() export interface __Options_A {
}

class __EntryWrapper extends EntryPoint {
    @memo() public entry(): void {
        A._instantiateImpl(undefined, (() => {
            return new A();
        }), undefined, undefined, undefined);
    }
    public constructor() {}
}
`;

const expectedUIHeaderScript: string = `
import { memo as memo } from \"arkui.stateManagement.runtime\";
import { memo as memo, ComponentBuilder as ComponentBuilder } from \"arkui.stateManagement.runtime\";

function main() {}

@memo() export function FakeComponentA(style: (@memo() ((instance: FakeComponentAAttribute)=> void) | undefined), str: string, @memo() content_?: (()=> void)): void
@memo() export function FakeComponentB(style: (@memo() ((instance: FakeComponentBAttribute)=> void) | undefined), options?: FakeOptions, @memo() content_?: (()=> void)): void
@memo() export function FakeComponentC(style: (@memo() ((instance: FakeComponentCAttribute)=> void) | undefined), @memo() content_?: (()=> void)): void

@memo() export function FakeComponentAImpl(style: (@memo() ((instance: FakeComponentAAttribute)=> void) | undefined), content?: @memo() (()=> void)): void
@memo() export function FakeComponentBImpl(style: (@memo() ((instance: FakeComponentBAttribute)=> void) | undefined), content?: @memo() (()=> void)): void
@memo() export function FakeComponentCImpl(style: (@memo() ((instance: FakeComponentCAttribute)=> void) | undefined), content?: @memo() (()=> void)): void

interface FakeOptions {
    get str(): (string | undefined) {
        return undefined;
    }
    set str(str: (string | undefined)) {
        throw new InvalidStoreAccessError();
    }
}

interface FakeComponentAAttribute {
    setFakeComponentAOptions(str: string): this
}

interface FakeComponentBAttribute {
    setFakeComponentBOptions(options?: FakeOptions): this
}

interface FakeComponentCAttribute {
    setFakeComponentCOptions(): this
}
`;

function testCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.declContexts?.[utilExternalSourceName]?.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIHeaderScript));
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

pluginTester.run(
    'test multiple different @ComponentBuilder',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
        tracing: { externalSourceNames: [utilExternalSourceName] },
    }
);
