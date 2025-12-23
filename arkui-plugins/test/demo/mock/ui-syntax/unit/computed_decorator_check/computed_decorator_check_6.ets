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

import { Entry, ComponentV2, Column } from '@ohos.arkui.component';
import { Observed, Computed } from "@ohos.arkui.stateManagement";

// Expected: The '@Computed' can decorate only member method within a 'class' decorated with ObservedV2.
// Actual: The class is decorated with V1 '@Observed', which is incompatible with '@Computed'.

@Observed
class UserInfo {
  name: string = "Test";

  @Computed
  get upperName() {
    return this.name.toUpperCase();
  }
}

@Entry
@ComponentV2
struct ClassMismatchCheck {
  user: UserInfo = new UserInfo();

  build() {
    Column()
  }
}