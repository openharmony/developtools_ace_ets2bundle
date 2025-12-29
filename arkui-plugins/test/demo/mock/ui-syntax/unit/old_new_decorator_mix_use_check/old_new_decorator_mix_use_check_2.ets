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
import { Local, Param, Once } from "@ohos.arkui.stateManagement";

// Expected: New v2 decorators such as '@Local' and '@Param' must only decorate fields inside custom component structs
// that are annotated with '@ComponentV2'. They are not allowed on plain classes that are not UI components.
// Actual: The normal class 'v2DecoratorInClass' uses '@Local' and '@Param' on its member variables, even though 
// it is not a '@ComponentV2' struct, so these v2 decorators are applied in an invalid context.

@Entry
@ComponentV2
struct Test {
  build() {}
}
class v2DecoratorInClass {
  @Local local_value: string = "hello";
  @Param param_value: string = "hello";
  @Param @Once param_once_value: string = "hello";
}