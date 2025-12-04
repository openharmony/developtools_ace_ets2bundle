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
import { collectNoRecheck, memoNoRecheck, recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'builder-lambda/condition-scope';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'with-builder.ets'),
];

const pluginTester = new PluginTester('test conditionScope within @Builder or @BuilderParam', buildConfig);

const parsedTransform: Plugins = {
    name: 'with-builder',
    parsed: uiTransform().parsed,
};

const expectedUIScript: string = `
import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";
import { ColumnImpl as ColumnImpl } from "arkui.component.column";
import { MemoSkip as MemoSkip } from "arkui.incremental.annotation";
import { ConditionScope as ConditionScope } from \"arkui.component.builder\";
import { ConditionBranch as ConditionBranch } from \"arkui.component.builder\";
import { Memo as Memo } from \"arkui.incremental.annotation\";
import { TextAttribute as TextAttribute } from "arkui.component.text";
import { TextImpl as TextImpl } from "arkui.component.text";
import { CustomComponent as CustomComponent } from \"arkui.component.customComponent\";
import { Text as Text, Column as Column, Component as Component, Builder as Builder, BuilderParam as BuilderParam, WrappedBuilder as WrappedBuilder, wrapBuilder as wrapBuilder } from \"@ohos.arkui.component\";
const wBuilder = wrapBuilder(ParamBuilder);
function main() {}
@Builder() 
@Memo() 
function MyBuilder(): void {
    ConditionScope(@Memo() (() => {
        if (true) {
            ConditionBranch(@Memo() (() => {
                TextImpl(@Memo() ((instance: TextAttribute): void => {
                    instance.setTextOptions("within Builder function", undefined).applyAttributesFinish();
                    return;
                }), undefined);
            }));
        }
    }));
}
@Builder() 
@Memo() 
function ParamBuilder(@Builder() @Memo() @MemoSkip() gensym%%_<some_random_number>?: (()=> void)): void {
    let param: (()=> void) = (((gensym%%_<some_random_number>) !== (undefined)) ? gensym%%_<some_random_number> : (() => {
        ConditionScope(@Memo() (() => {
            if (true) {
                ConditionBranch(@Memo() (() => {
                    TextImpl(@Memo() ((instance: TextAttribute): void => {
                        instance.setTextOptions("within Builder parameter", undefined).applyAttributesFinish();
                        return;
                    }), undefined);
                }));
            }
        }));
    }));
    param();
}
@Component() final struct MyStruct extends CustomComponent<MyStruct, __Options_MyStruct> {
    public __initializeStruct(initializers: (__Options_MyStruct | undefined), @Memo() content: ((()=> void) | undefined)): void {}
    public __updateStruct(initializers: (__Options_MyStruct | undefined)): void {}
    @Memo() 
    public myBuilderMethod() {
        ConditionScope(@Memo() (() => {
            if (true) {
                ConditionBranch(@Memo() (() => {
                    TextImpl(@Memo() ((instance: TextAttribute): void => {
                        instance.setTextOptions("within Builder method", undefined).applyAttributesFinish();
                        return;
                    }), undefined);
                }));
            }
        }));
    }
    @Memo() 
  public build() {
        ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
            instance.setColumnOptions(undefined).applyAttributesFinish();
            return;
        }), @Memo() (() => {
            wBuilder.builder(@Builder() (() => {
                ConditionScope(@Memo() (() => {
                    if (true) {
                        ConditionBranch(@Memo() (() => {
                            TextImpl(@Memo() ((instance: TextAttribute): void => {
                                instance.setTextOptions("with Builder lambda", undefined).applyAttributesFinish();
                                return;
                            }), undefined);
                        }));
                    }
                }));
            }));
            Child._instantiateImpl(undefined, (() => {
                return new Child();
            }), {
                myBuilderParam: @Memo() (() => {
                    ConditionScope(@Memo() (() => {
                        if (true) {
                            ConditionBranch(@Memo() (() => {
                                TextImpl(@Memo() ((instance: TextAttribute): void => {
                                    instance.setTextOptions("within Builder property", undefined).applyAttributesFinish();
                                    return;
                                }), undefined);
                            }));
                        }
                    }));
                    this.myBuilderMethod();
                }),
                __options_has_myBuilderParam: true,
            }, undefined, undefined);
        }));
    }
    public constructor() {}

    static {

    }
}
@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
    public __initializeStruct(initializers: (__Options_Child | undefined), @Memo() content: ((()=> void) | undefined)): void {
        this.__backing_myBuilderParam = ((((({let gensym___<some_random_number> = initializers;
            (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.myBuilderParam)})) ?? (content))) ?? (@Memo() (() => {
                ConditionScope(@Memo() (() => {
                    if (true) {
                    ConditionBranch(@Memo() (() => {
                        TextImpl(@Memo() ((instance: TextAttribute): void => {
                            instance.setTextOptions("within BuilderParam property", undefined).applyAttributesFinish();
                            return;
                        }), undefined);
                    }));
                }
            }));
        })));
    }
    public __updateStruct(initializers: (__Options_Child | undefined)): void {}
    private __backing_myBuilderParam?: @Memo() (()=> void);
    public get myBuilderParam(): @Memo() (()=> void) {
        return this.__backing_myBuilderParam!;
    }
    public set myBuilderParam(value: @Memo() (()=> void)) {
        this.__backing_myBuilderParam = value;
    }
    @Memo() 
  public build() {
        ConditionScope(@Memo() (() => {
            if (true) {
                ConditionBranch(@Memo() (() => {
                    TextImpl(@Memo() ((instance: TextAttribute): void => {
                        instance.setTextOptions("within struct build", undefined).applyAttributesFinish();
                        return;
                    }), undefined);
                }));
            }
        }));
    }
    public constructor() {}

    static {

    }
}
@Component() export interface __Options_MyStruct {
}
@Component() export interface __Options_Child {
    ${dumpGetterSetter(GetSetDumper.BOTH, 'myBuilderParam', '(@Memo() (()=> void) | undefined)')}
    ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_myBuilderParam', '(boolean | undefined)')}
}
`;

function testUITransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedUIScript));
}

const expectedMemoScript: string = `
import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from \"arkui.incremental.runtime.state\";
import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";
import { ColumnImpl as ColumnImpl } from "arkui.component.column";
import { MemoSkip as MemoSkip } from "arkui.incremental.annotation";
import { ConditionScope as ConditionScope } from \"arkui.component.builder\";
import { ConditionBranch as ConditionBranch } from \"arkui.component.builder\";
import { Memo as Memo } from \"arkui.incremental.annotation\";
import { TextAttribute as TextAttribute } from "arkui.component.text";
import { TextImpl as TextImpl } from "arkui.component.text";
import { CustomComponent as CustomComponent } from \"arkui.component.customComponent\";
import { Text as Text, Column as Column, Component as Component, Builder as Builder, BuilderParam as BuilderParam, WrappedBuilder as WrappedBuilder, wrapBuilder as wrapBuilder } from \"@ohos.arkui.component\";
const wBuilder = wrapBuilder(ParamBuilder);
function main() {}
@Builder() 
@Memo() 
function MyBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    ConditionScope(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        if (true) {
            ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                if (__memo_scope.unchanged) {
                    __memo_scope.cached;
                    return;
                }
                TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                    const __memo_parameter_instance = __memo_scope.param(0, instance);
                    if (__memo_scope.unchanged) {
                        __memo_scope.cached;
                        return;
                    }
                    __memo_parameter_instance.value.setTextOptions("within Builder function", undefined).applyAttributesFinish();
                    {
                        __memo_scope.recache();
                        return;
                    }
                }), undefined);
                {
                    __memo_scope.recache();
                    return;
                }
            }));
        }
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
@Builder() 
@Memo() 
function ParamBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @Builder() @Memo() @MemoSkip() gensym%%_<some_random_number>?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): void {
    let param: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) = (((gensym%%_<some_random_number>) !== (undefined)) ? gensym%%_<some_random_number> : ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        ConditionScope(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
            if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
            }
            if (true) {
                ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                    if (__memo_scope.unchanged) {
                        __memo_scope.cached;
                        return;
                    }
                    TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                        const __memo_parameter_instance = __memo_scope.param(0, instance);
                        if (__memo_scope.unchanged) {
                            __memo_scope.cached;
                            return;
                        }
                        __memo_parameter_instance.value.setTextOptions("within Builder parameter", undefined).applyAttributesFinish();
                        {
                            __memo_scope.recache();
                            return;
                        }
                    }), undefined);
                    {
                        __memo_scope.recache();
                        return;
                    }
                }));
            }
            {
                __memo_scope.recache();
                return;
            }
        }));
        {
            __memo_scope.recache();
            return;
        }
}));
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
    if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
    }
    param(__memo_context, ((__memo_id) + (<some_random_number>)));
    {
        __memo_scope.recache();
        return;
    }
}
@Component() final struct MyStruct extends CustomComponent<MyStruct, __Options_MyStruct> {
    public __initializeStruct(initializers: (__Options_MyStruct | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {}
    public __updateStruct(initializers: (__Options_MyStruct | undefined)): void {}
    @Memo() 
    public myBuilderMethod(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        ConditionScope(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
            if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
            }
            if (true) {
                ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                    if (__memo_scope.unchanged) {
                        __memo_scope.cached;
                        return;
                    }
                    TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                        const __memo_parameter_instance = __memo_scope.param(0, instance);
                        if (__memo_scope.unchanged) {
                            __memo_scope.cached;
                            return;
                        }
                        __memo_parameter_instance.value.setTextOptions("within Builder method", undefined).applyAttributesFinish();
                        {
                            __memo_scope.recache();
                            return;
                        }
                    }), undefined);
                    {
                        __memo_scope.recache();
                        return;
                    }
                }));
            }
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
    @Memo() 
    public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        ColumnImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ColumnAttribute): void => {
            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
            const __memo_parameter_instance = __memo_scope.param(0, instance);
            if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
            }
            __memo_parameter_instance.value.setColumnOptions(undefined).applyAttributesFinish();
            {
                __memo_scope.recache();
                return;
            }
        }), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
            if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
            }
            wBuilder.builder(__memo_context, ((__memo_id) + (<some_random_number>)), @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                if (__memo_scope.unchanged) {
                    __memo_scope.cached;
                    return;
                }
                ConditionScope(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                    if (__memo_scope.unchanged) {
                        __memo_scope.cached;
                        return;
                    }
                    if (true) {
                        ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                            if (__memo_scope.unchanged) {
                                __memo_scope.cached;
                                return;
                            }
                            TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                                const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                                const __memo_parameter_instance = __memo_scope.param(0, instance);
                                if (__memo_scope.unchanged) {
                                    __memo_scope.cached;
                                    return;
                                }
                                __memo_parameter_instance.value.setTextOptions("with Builder lambda", undefined).applyAttributesFinish();
                                {
                                    __memo_scope.recache();
                                    return;
                                }
                            }), undefined);
                            {
                                __memo_scope.recache();
                                return;
                            }
                        }));
                    }
                    {
                        __memo_scope.recache();
                        return;
                    }
                }));
                {
                    __memo_scope.recache();
                    return;
                }
            }));
            Child._instantiateImpl(__memo_context, ((__memo_id) + (<some_random_number>)), undefined, (() => {
                return new Child();
            }), {
                myBuilderParam: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                    if (__memo_scope.unchanged) {
                        __memo_scope.cached;
                        return;
                    }
                    ConditionScope(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                        if (__memo_scope.unchanged) {
                            __memo_scope.cached;
                            return;
                        }
                        if (true) {
                            ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                                const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                                if (__memo_scope.unchanged) {
                                    __memo_scope.cached;
                                    return;
                                }
                                TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                                    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                                    const __memo_parameter_instance = __memo_scope.param(0, instance);
                                    if (__memo_scope.unchanged) {
                                        __memo_scope.cached;
                                        return;
                                    }
                                    __memo_parameter_instance.value.setTextOptions("within Builder property", undefined).applyAttributesFinish();
                                    {
                                        __memo_scope.recache();
                                        return;
                                    }
                                }), undefined);
                                {
                                    __memo_scope.recache();
                                    return;
                                }
                            }));
                        }
                        {
                            __memo_scope.recache();
                            return;
                        }
                    }));
                    this.myBuilderMethod(__memo_context, ((__memo_id) + (<some_random_number>)));
                    {
                        __memo_scope.recache();
                        return;
                    }
                }),
                __options_has_myBuilderParam: true,
            }, undefined, undefined);
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
@Component() final struct Child extends CustomComponent<Child, __Options_Child> {
    public __initializeStruct(initializers: (__Options_Child | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void {
        this.__backing_myBuilderParam = ((((({let gensym___<some_random_number> = initializers;
            (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>.myBuilderParam)})) ?? (content))) ?? (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                if (__memo_scope.unchanged) {
                    __memo_scope.cached;
                    return;
                }
                ConditionScope(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                    if (__memo_scope.unchanged) {
                        __memo_scope.cached;
                        return;
                    }
                    if (true) {
                        ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                            if (__memo_scope.unchanged) {
                                __memo_scope.cached;
                                return;
                            }
                            TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                                const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                                const __memo_parameter_instance = __memo_scope.param(0, instance);
                                if (__memo_scope.unchanged) {
                                    __memo_scope.cached;
                                    return;
                                }
                                __memo_parameter_instance.value.setTextOptions("within BuilderParam property", undefined).applyAttributesFinish();
                                {
                                    __memo_scope.recache();
                                    return;
                                }
                            }), undefined);
                            {
                                __memo_scope.recache();
                                return;
                            }
                        }));
                    }
                    {
                        __memo_scope.recache();
                        return;
                    }
                }));
                {
                    __memo_scope.recache();
                    return;
                }
            })));
    }
    public __updateStruct(initializers: (__Options_Child | undefined)): void {}
    private __backing_myBuilderParam?: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
    public get myBuilderParam(): @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) {
        return this.__backing_myBuilderParam!;
    }
    public set myBuilderParam(value: @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)) {
        this.__backing_myBuilderParam = value;
    }
    @Memo() 
    public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
        if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
        }
        ConditionScope(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
            const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
            if (__memo_scope.unchanged) {
                __memo_scope.cached;
                return;
            }
            if (true) {
                ConditionBranch(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
                    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 0);
                    if (__memo_scope.unchanged) {
                        __memo_scope.cached;
                        return;
                    }
                    TextImpl(__memo_context, ((__memo_id) + (<some_random_number>)), @Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: TextAttribute): void => {
                        const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (<some_random_number>)), 1);
                        const __memo_parameter_instance = __memo_scope.param(0, instance);
                        if (__memo_scope.unchanged) {
                            __memo_scope.cached;
                            return;
                        }
                        __memo_parameter_instance.value.setTextOptions("within struct build", undefined).applyAttributesFinish();
                        {
                            __memo_scope.recache();
                            return;
                        }
                    }), undefined);
                    {
                        __memo_scope.recache();
                        return;
                    }
                }));
            }
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
@Component() export interface __Options_MyStruct {
}
@Component() export interface __Options_Child {
    ${dumpGetterSetter(GetSetDumper.BOTH, 'myBuilderParam', '(@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)')}
    ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_myBuilderParam', '(boolean | undefined)')}
}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedMemoScript));
}

pluginTester.run(
    'test conditionScope within @Builder or @BuilderParam',
    [parsedTransform, collectNoRecheck, uiNoRecheck, memoNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testUITransformer],
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
