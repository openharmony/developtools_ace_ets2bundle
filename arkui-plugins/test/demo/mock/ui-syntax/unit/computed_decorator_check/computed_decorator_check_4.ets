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

import { ComponentV2, Column, TextInput } from '@ohos.arkui.component';
import { Trace, Computed } from "@ohos.arkui.stateManagement";

// Expected: In this binding validation, a '@Computed' property cannot be used with the two-way binding syntax ($$).
// Actual: The 'fullName' property is accessed via '$$(this.fullName)', attempting a forbidden
// two-way bind on a computed value.

@ComponentV2
@Entry
struct BindingError {
  @Trace firstName: string = "John";
  @Trace lastName: string = "Doe";

  @Computed
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  build() {
    Column() {
      TextInput({ text: $$(this.fullName) })
    }
  }
}