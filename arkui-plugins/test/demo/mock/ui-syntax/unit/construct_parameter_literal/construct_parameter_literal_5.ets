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

import { Entry, Component, Column } from '@ohos.arkui.component';
import { Link, State } from "@ohos.arkui.stateManagement";

// Expected: The 'regular' property 'this.count + 5' cannot be assigned to the '@Link' parameter 'val'.
// Actual: An expression evaluates to a value, not a reference, so it cannot be linked.

@Component
struct NumberLink {
  @Link val: number;

  build() {
    Column() {
    }
  }
}

@Entry
@Component
struct ExpressionCheck {
  @State count: number = 10;

  build() {
    Column() {
      NumberLink({ val: this.count + 5 });
    }
  }
}