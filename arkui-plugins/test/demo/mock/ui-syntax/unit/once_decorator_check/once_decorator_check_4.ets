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
import { Once, Local } from "@ohos.arkui.stateManagement";

// Expected: The '@Once' annotation may only decorate member properties inside a struct, and every property decorated 
// with '@Once' must also be decorated with '@Param' so that it is clearly marked as a one-time input parameter.
// Actual: In the struct 'TestParam', both 'param_value2' and 'value1' are decorated with '@Once' but neither property 
// has the required '@Param' annotation, so these fields violate the rule that '@Once' must always be used together 
// with '@Param'.

@Entry
@ComponentV2
struct TestParam {
  @Once @Local param_value2: string = "hello";
  @Once value1: string = "hello";
  build() {
    Column() {}
  }
}
