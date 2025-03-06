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

import { TextImpl, TextAttribute } from "@ohos.arkui.component.text";
import { Column, ColumnOptions, ColumnImpl, ColumnAttribute } from "@ohos.arkui.component.column";
import { Text, TextImpl, TextAttribute } from "@ohos.arkui.component.text";
import { Color } from "@ohos.arkui.component.enums";

import { Component } from "@koalaui.arkts-arkui.Common";
import { UserView, UserViewBuilder } from "@koalaui.arkts-arkui.UserView";
import { __memo_context_type, __memo_id_type } from "@koalaui/runtime";
import { memo } from "@koalaui/runtime"

@Component
struct MyStateSample {
    build() {
        Child(undefined)
    }
}

@Component
struct Child {
    build() {
        Column({} as ColumnOptions) {
            Text("Hello World").backgroundColor(Color.Red)
        }.width(100).height(100)
    }
}

export class ComExampleTrivialApplication extends UserView {
    getBuilder(): UserViewBuilder {
        let wrapper = (__memo_context: __memo_context_type, __memo_id: __memo_id_type) => { 
            MyStateSample._instantiateImpl(
                __memo_context,
                ((__memo_id) + (21211165)),
                undefined,
                (): MyStateSample => new MyStateSample(),
                {} as __Options_MyStateSample,
                undefined
            )
        }
        return wrapper
    }
}