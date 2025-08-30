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

import { Component, Column, TextInput } from "@ohos.arkui.component"
import { Link, State, Prop } from "@ohos.arkui.stateManagement"

@Component
struct Parant {
  @Link text1: string;

  build() {
    Column() {
      TextInput({ text: this.text1 })
      Child({ childText: this.text1, childText2: this.text1, childText3: this.text1, childText4: this.text1 })
    }
  }
}

@Component
struct Child {
  @Link childText: string;
  @State childText2: string = 'sss';
  @Prop childText3: string;
  @Prop childText4: string = 'cc';

  build() {
    TextInput({ text: this.childText })
  }
}