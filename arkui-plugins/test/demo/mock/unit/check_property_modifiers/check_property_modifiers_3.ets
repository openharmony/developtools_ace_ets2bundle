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

// Expected: In this modifier validation case, member attributes of a struct must not be declared as 'protected'.
// Actual: The property 'protectedProp' is explicitly marked as 'protected', which is forbidden in ArkTS structs.

@Entry
@Component
struct InvalidProtectedMember {
  protected protectedProp: string = 'test';

  build() {
    Column() {
      Text(this.protectedProp)
    }
  }
}
