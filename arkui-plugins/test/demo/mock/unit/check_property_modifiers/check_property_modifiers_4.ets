/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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
import { State, Prop } from "@ohos.arkui.stateManagement";

// Expected: Decorators like @State or @Prop are not in the generated exclusion lists.
// Actual: Using private with @State or public with @Prop should NOT trigger CheckPropertyModifiersRule errors.

@Entry
@Component
struct UntrackedDecorators {
  @State private myState: number = 0;
  @Prop public myProp: string;

  build() {
    Column() {
      Text(this.myProp)
    }
  }
}