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

import { Entry, Component, Text, Flex } from '@ohos.arkui.component';
import { Provide, Consume, Builder } from "@ohos.arkui.stateManagement";

@Component
struct TitleComp {
   title: string=''
  build() {
    Text(this.title)
  }
}
@Component
struct TitleComp1 {
  title1: string=''
  build() {
    Text(this.title1)
  }
}
@Entry
@Component
struct LinkComponent{
  @Provide value: string = 'hello world';
  @Consume value2: string;
  @Builder
  TitleCompView() {
    // Expected: A '@Consume' decorated property cannot be assigned to a regular property in this parameter validation.
    // Actual: 'value2' (@Consume) is assigned to 'title' (regular), which is a forbidden initialization.

    TitleComp({title: this.value2});
    
    // Expected: A '@Provide' decorated property cannot be assigned to a regular property in this parameter validation.
    // Actual: 'value' (@Provide) is assigned to 'title1' (regular), which is a forbidden initialization.
    
    TitleComp1({title1: this.value});
  }
  build() {
    Flex() {
      this.TitleCompView()
    }
  }
}