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
import { Link } from "@ohos.arkui.stateManagement";

// Expected: The 'regular' property 'this.generateText()' cannot be assigned to the '@Link' parameter 'label'.
// Actual: The return value of a function is a temporary value, creating a violation for @Link.

@Component
struct LabelLink {
  @Link label: string;

  build() {
    Row() {
    }
  }
}

@Entry
@Component
struct MethodReturnCheck {
  
  generateText(): string {
    return "Generated Text";
  }

  build() {
    Row() {
      LabelLink({ label: this.generateText() });
    }
  }
}