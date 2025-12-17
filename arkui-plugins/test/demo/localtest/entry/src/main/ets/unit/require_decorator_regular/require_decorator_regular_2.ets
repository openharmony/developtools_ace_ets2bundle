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

import { Entry, Component, Column, Text } from '@ohos.arkui.component';
import { Require } from "@ohos.arkui.stateManagement";

// Expected: Fields marked with '@Require' should not be private, because required properties are intended to be passed
// in from outside the component (via the constructor) and must be accessible from the caller.
// Actual: In 'DemoRequireCase2', both 'username' and 'token' are declared as 'private' and also decorated with 
// '@Require', so each field violates the rule "Property '...' can not be decorated with both Require and private."

@Component
struct DemoRequireCase2 {
  @Require @State private username: string;
  @Require private token: string;
  build() {
    Column() {
      Text("Demo 2")
    }
  }
}

@Entry
@Component
struct DemoRequireCase2Parent {
  build() {
  }
}