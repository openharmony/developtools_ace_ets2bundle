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

import { Entry, Component } from '@ohos.arkui.component';
import { Watch } from "@ohos.arkui.stateManagement";

// Expected: '@Watch' can only be applied to reactive properties such as '@State' variables.
// Actual: 'state' is regular variable, so it cannot use the '@Watch' decorator.

@Entry
@Component
struct WatchDecoratorDemo {
    build() {
    }
}

@Component
struct Demo1 {
  @Watch({ value: "someMethod" })
  state: string = "initial"

  someMethod() {
    console.log("Do something");
  }
}