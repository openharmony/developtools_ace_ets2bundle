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

import { Text } from "@ohos.arkui.component"
import { Column } from "@ohos.arkui.component"
import { Component } from "@ohos.arkui.component"

import { UserView, UserViewBuilder } from "@koalaui.arkts-arkui.UserView"
import { __memo_context_type, __memo_id_type } from "@ohos.arkui.StateManagement.runtime";
import { memo, __memo_context_type, __memo_id_type } from "@ohos.arkui.stateManagement.runtime"

@Component
struct MyStateSample {
    build() {
        Column() {
            Text("Hello World!")
        }
    }
}

export class ComExampleTrivialApplication extends UserView {
    getBuilder(): UserViewBuilder {
        let wrapper = (__memo_context: __memo_context_type, __memo_id: __memo_id_type) => { 
            MyStateSample.instantiateImpl(
                undefined,
                (): MyStateSample => new MyStateSample(),
                {} as __Options_MyStateSample,
                undefined
            )
        }
        return wrapper
    }
}