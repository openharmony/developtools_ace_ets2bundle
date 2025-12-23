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
import { Local, Trace } from "@ohos.arkui.stateManagement";

// Expected: The '@Trace' annotation may only decorate member variables inside a class that is explicitly decorated 
// with '@ObservedV2'; any class using '@Trace' must first opt in to '@ObservedV2'.
// Actual: The class 'Observedv2test7User' applies '@Trace' to the 'name' field, but the class itself is not decorated 
// with '@ObservedV2', so the Trace usage violates the requirement that it be used within an '@ObservedV2' class.

class Observedv2test7User {
  id: number = 0;
  @Trace name: string = "Tom"; // 错误用法，编译时报错
}
@Entry
@ComponentV2
struct Comp {
  @Local message: string = "Hello World"; // 错误用法
  build(){

  }
}