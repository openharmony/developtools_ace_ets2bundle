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
import { Param, Once } from "@ohos.arkui.stateManagement";

// Expected: The '@Once' annotation can only be applied to member properties inside a struct. Using '@Once' inside a 
// normal 'class' is invalid. Furthermore, every '@Once' usage must be paired with '@Param' to indicate that the value 
// is a one-time parameter.
// Actual: In the class 'v2DecoratorInClass', both 'param_once_value' and 'once_value' use '@Once', but the containing 
// type is a class not a struct  so the decorator is used in an invalid context. In addition, 'once_value' does not 
// include the required '@Param' decorator, violating the rule that '@Once' must always appear together with '@Param'.

@Entry
@ComponentV2
struct Test {
    build() {}
}

class v2DecoratorInClass {
    @Once @Param param_once_value: string = "hello";
    @Once once_value: string = "hello";
}