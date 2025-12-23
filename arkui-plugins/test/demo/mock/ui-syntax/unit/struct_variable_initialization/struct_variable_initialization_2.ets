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

import { Entry, Component, Text, Builder, Flex } from '@ohos.arkui.component';
import { Prop, State, Link } from "@ohos.arkui.stateManagement";

// Expected: A @Link property must receive a value bound with a stateful reference (e.g.,@State, @Prop).
// Actual: A regular non-reactive property ('value2') was passed to the @Link property 'title'.

@Component
struct TitleComp {
  @Link title: string
  build() {
    Text(this.title)
  }
}
@Entry
@Component
struct LinkComponent{
  // @State value: string = 'hello world'
  value2: string = 'hello world2'
  @Builder
  TitleCompView() {
    //  ERROR: The regular property 'this.value2' cannot be assigned to the @Link property 'title'.
    TitleComp({title: this.value2});
  }
  build() {
    Flex() {
      this.TitleCompView()
    }
  }
}