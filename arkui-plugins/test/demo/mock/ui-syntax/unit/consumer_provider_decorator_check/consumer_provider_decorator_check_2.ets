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

import { ComponentV2, Column, Text, Row, Button, Entry } from '@ohos.arkui.component';
import { Provider, Consumer } from "@ohos.arkui.stateManagement";

// Expected: The property 'keyword' cannot be decorated with multiple built-in decorators (@Provider and @Consumer).
// Actual: The rule reports an error stating the member variable cannot be decorated by multiple built-in annotations.

@ComponentV2
struct ChildMultiDecorators {
  @Provider @Consumer keyword: string = "Hello";

  build() {
    Column() {
      Text(keyword);
      Row() {
        Button("Action");
      }
    }
  }
}

@Entry
@Component
struct Index {
  build() {
  }
}
