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
import { PropRef } from "@ohos.arkui.stateManagement";

// Expected: '@PropRef' may only decorate fields of type string, number, boolean, enum, or object. It cannot be applied 
// to unsupported types such as 'bigint', 'Any', 'unknown', or union types containing these.
// Actual: In 'SomeComponent', the '@PropRef' property 'myState' is declared with the type 'bigint', which is not an 
// allowed type for '@PropRef', so this decorator usage is invalid.

@Component
struct SomeComponent {
  @PropRef myState: bigint;
  build() { }
}

@Entry
@Component
struct MyComponent {
  build() { }
}