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

import { Component, Row, Builder, Text } from "@ohos.arkui.component"

@Builder
function showTextBuilder() {
  Text('Hello World')
}

class Tmp {
  paramA1: string = '';
}

@Builder function overBuilder(params: Tmp) {
  Row() {
    Text('UseStateVarByReference: ' + params.paramA1)
  }
}

@Component
struct BuilderDemo {
  build() {
    Row() {
      showTextBuilder()
      overBuilder({ paramA1: 'Hello' })
    }
  }
}