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
import { Local, Monitor, Param, Require } from "@ohos.arkui.stateManagement";

// Expected: The '@Local' decorator acts as a state variable definition and must only decorate member properties. 
// Actual: The 'aa' method is decorated with '@Local', which is invalid for method definitions in ComponentV2.

@Entry
@ComponentV2
struct V2MemberDecorator {

  @Local
  aa() {}

  @Monitor("user") get value(){ return "" }

  build() {
    Column()
  }
}