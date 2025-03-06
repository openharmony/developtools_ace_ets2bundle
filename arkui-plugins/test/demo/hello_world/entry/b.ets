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

import { Text } from "@koalaui.arkui.Text"
import { Column } from "@koalaui.arkui.Column"
import { Button } from "@koalaui.arkui.Button"
import { Component, State, Entry } from "@koalaui.arkui.Common"

import { memo } from "@ohos.arkui.StateManagement.runtime"

@Entry
@Component
struct MyStateSample {
    build() {
        Column() {
            Text("Hello World!")
            Button('change')
        }

    }
}

export class ArkUIEntry {
    static run()  {
        console.log("About to invoke the struct")
        // The proper call fails because of a compiler frontend bug.
        // MyStateSample({} as __Options_MyStateSample)
        MyStateSample.instantiateImpl(
            undefined,
            (): MyStateSample => new MyStateSample(),
            {} as __Options_MyStateSample,
            undefined
        )
    }
}
