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
import { Monitor } from '@ohos.arkui.stateManagement';

// Expected: The '@Monitor' decorator can only be applied to class members, not to properties inside a 'struct' 
// unless the struct is decorated with '@ComponentV2'.
// Actual: The 'monitorUsed' struct uses '@Monitor' on the 'onUserChange' member, but the struct is decorated with 
// '@Component' instead of '@ComponentV2', so the '@Monitor' usage here is invalid.

@Entry
@Component
struct MonitorUsed {
  @Monitor("user");
  onUserChange() {}

  build() {
    Column() {}
  }
}