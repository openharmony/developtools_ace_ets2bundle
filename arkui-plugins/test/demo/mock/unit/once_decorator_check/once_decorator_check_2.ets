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
import { Once } from "@ohos.arkui.stateManagement";

// Expected: The '@Once' annotation can only be used on member properties inside a struct. Applying '@Once' inside a 
// normal 'class' is invalid. Also, whenever '@Once' is used, it must be paired with '@Param' — a field
// decorated with '@Once' must always include '@Param' to indicate a one-time parameter.
// Actual: In the class 'TestCase', both fields 'cc' and 'dd' use '@Once' even though they belong to a class, 
// not a struct — this makes the '@Once' usage invalid. In addition, neither 'cc' nor 'dd' includes the required
// '@Param' annotation, violating the rule that '@Once' must always appear together with '@Param'.

class TestCase{
   @Once cc: string = '';
   @Once dd: string = '';
 }
 @Entry
 @ComponentV2
 struct TestComponent9 {

   build() {}

 }
