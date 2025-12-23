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
import { Local, Param, Require } from "@ohos.arkui.stateManagement";

// Expected: Uninitialized '@Param' needs '@Require', and '@Require' is restricted to '@Param' or '@BuilderParam'.
// Actual: 'param_value' missing '@Require'; 'param_value1' and 'value' misuse '@Require' with '@Local' or alone.

@Entry
@ComponentV2
struct TestParam {
  @Param param_value: string;
  @Require @Local param_value1: string = "hello";
  @Require value: string = "hello";
  build() {
    Column() {}
  }
}