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

import { Entry, Component } from '@ohos.arkui.component'
import { PropRef } from '@ohos.arkui.stateManagement'

@Component
struct ExampleComponent {

  //@PropRef prop1: Any; // error

  @PropRef prop2: bigint; // error

  @PropRef prop3: Any | undefined; // error

  @PropRef prop4: bigint | undefined; // error

  @PropRef prop5:  null | undefined | Any; // error

  build() {

  }
}

@Entry
@Component
struct MyComponent {
  build() {

  }
}