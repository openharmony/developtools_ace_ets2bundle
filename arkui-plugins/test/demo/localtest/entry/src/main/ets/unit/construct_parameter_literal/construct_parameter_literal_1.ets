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
import { Link, Builder } from "@ohos.arkui.stateManagement";

// Expected: The regular property 'value2' cannot be assigned to the '@Link' parameter 'title'.
// Actual: The rule returns early for member expressions like 'this.value2', missing this invalid assignment.

@Component
struct TitleComp {
  @Link title: string;
  build() {
    Text(this.title)
  }
}
@Entry
@Component
struct LinkComponent{
  value2: string = 'hello world2';
  @Builder
  TitleCompView() {
    TitleComp({title: this.value2});
  }
  build() {
    Flex() {
      this.TitleCompView()
    }
  }
}