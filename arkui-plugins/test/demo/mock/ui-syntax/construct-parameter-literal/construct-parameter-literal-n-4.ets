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

import { Entry, Component, Column, Text, Builder } from '@ohos.arkui.component'
import { State, Link } from '@ohos.arkui.stateManagement'

class ss {
  paramA1: string

  constructor(s:string) {
    this.paramA1 = s
  }
}

@Entry
@Component
struct Parent {
  @State label: string = 'Hello';

  @Builder ABuilder($$: ss) {
    // The 'regular' property 'paramA1' cannot be assigned to the '@Link' property 'message'.
    Child({ message: $$.paramA1})
  }

  build() {
    Column() {
      this.ABuilder(new ss(this.label))

    }
  }
}

@Component
struct Child {
  @Link message: string

  build() {
    Column() {
      Text(this.message)
    }
  }
}