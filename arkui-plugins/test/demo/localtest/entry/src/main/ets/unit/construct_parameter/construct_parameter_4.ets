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

import { Entry, Component, Column, Row } from '@ohos.arkui.component';
import { Link } from "@ohos.arkui.stateManagement";

// Expected: In this construct parameter validation, a regular property cannot be assigned to a '@Link' property.
// Actual: The regular property 'message' is assigned to 'message' (@Link), which requires a state variable reference.

@Entry
@Component
struct ValidateIllegalInitFromParentParent {
  private message: string ='Hello';

  build() {
    Column() {
      ValidateIllegalInitFromParentChild({message: this.message});
    }
  }
}

@Component
struct ValidateIllegalInitFromParentChild {
  @Link message: string;
  build() {
    Row() {}
  }
}