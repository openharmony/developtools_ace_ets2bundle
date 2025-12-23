/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
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

import { Entry, Component, Row } from '@ohos.arkui.component';
import { State, Link } from "@ohos.arkui.stateManagement";

// Expected: @Link must not have a default value.
// Actual: A default value ('Hello') was assigned to the @Link property 'message'.

@Entry
@Component
 struct ValidatePropertyDefaultValueIndex {
   @State message: string = 'Hi'
   build() {
     Row() {
       ValidatePropertyDefaultValueChild({message: this.message})
     }
   }
}

@Component
struct ValidatePropertyDefaultValueChild {
    @Link message:string = 'Hello'
    build() {
     Row() {}
    }
}
