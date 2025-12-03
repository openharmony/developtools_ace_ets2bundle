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

import { Entry, Component, Text } from '@ohos.arkui.component';

// Expected: The analyzer should report that structs cannot implement interfaces.
// Actual: Error reported - "Structs are not allowed to inherit from classes or implement interfaces."

interface IExample {
  doSomething(): void
}

struct DemoStruct3 implements IExample {
  build() {
    Text("Struct cannot implement an interface")
  }

  doSomething() {}
}

@Entry
@Component
struct Demo3{
  build() {
  }
}
