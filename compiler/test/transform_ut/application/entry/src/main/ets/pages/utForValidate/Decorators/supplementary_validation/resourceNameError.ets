/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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

/**
 * Test case: Resource name error
 * Purpose: Verify resource name validation
 * Error code: 10903329
 */

@Component
struct ResourceNameError {
  build() {
    Column() {
      // Error: Unknown resource name
      Text($r('app.string.nonExistentResource'))
    }
  }
}

@Entry
@Component
struct TestResourceNameError {
  @State testTitle: string = 'Resource Name Error Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .margin(20)
    }
  }
}
