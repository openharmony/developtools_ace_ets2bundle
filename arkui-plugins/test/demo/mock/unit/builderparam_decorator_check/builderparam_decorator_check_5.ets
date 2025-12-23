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

import { Entry, Component, Row, Column, BuilderParam } from '@ohos.arkui.component';

// Expected: Even though 'ComplexLayout' has 2 @BuilderParam properties, the trailing lambda syntax is NOT used here.
// Actual: The validation rule should IGNORE this case (no report) because initialization is done via parameters.

@Component
struct ComplexLayout {
  @BuilderParam leftContent: () => void;
  @BuilderParam rightContent: () => void;

  build() {
    Row() {
      this.leftContent()
      this.rightContent()
    }
  }
}

@Entry
@Component
struct ExplicitAssignmentTest {
  @Builder
  MyLeft() {
    Column()
  }

  @Builder
  MyRight() {
    Column()
  }

  build() {
    Column() {
      ComplexLayout({ leftContent: this.MyLeft, rightContent: this.MyRight })
    }
  }
}