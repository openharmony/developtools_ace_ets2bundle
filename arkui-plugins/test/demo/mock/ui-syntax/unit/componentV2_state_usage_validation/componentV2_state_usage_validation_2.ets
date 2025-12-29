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

import { Entry, ComponentV2 } from '@ohos.arkui.component';
import { Local, Param, Once, Event } from "@ohos.arkui.stateManagement";

// Expected: State decorators (@Local, @Param, @Event, etc.) can only be applied to class properties, not methods.
// Actual: Methods 'aa', 'bb', 'cc', 'dd' are incorrectly decorated with state management decorators.

@Entry
@ComponentV2
struct TestComponent9 {
  @Local
  aa() {}
  @Param
  bb() {}
  @Once
  cc() {}
  @Event
  dd() {}

  build() {}

}