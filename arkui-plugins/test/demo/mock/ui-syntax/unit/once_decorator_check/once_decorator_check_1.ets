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

import { Entry, ComponentV2, Column, Text, Button } from '@ohos.arkui.component';
import { Local, Once, Event } from "@ohos.arkui.stateManagement";

// Expected: The '@Once' annotation may only decorate member properties inside a struct, and any property decorated 
// with '@Once' must also be decorated with '@Param' so that it is explicitly marked as a one-time input parameter.
// Actual: In the struct 'CompAonce', the properties 'Localonce' and 'Eventonce' are both decorated with '@Once' 
// but are missing the required '@Param' annotation, so these fields violate the rule that '@Once' must
// always be used together with '@Param'.

 @ComponentV2
 struct CompAonce {
   @Local @Once Localonce: string = ''; // 错误用法，@Once不能与@Local一起使用
   @Event @Once Eventonce: string = ''; // 错误用法，@Once不能与@Local一起使用

   build() {
     Column() {
       Text(`Localonce: ${this.Localonce}`)
       Text(`Eventonce: ${this.Eventonce}`)
     }
   }
 }
 @Entry
 @ComponentV2
 struct CompBonce {
   @Local message: string = "Hello World";
   build() {
     Column() {
       Text(`Parent message: ${this.message}`)
       Button("change message")
         .onClick(() => {
           this.message = "Hello Tomorrow";
         })
       CompAonce({
         Eventonce:this.message
       })
     }
   }
 }