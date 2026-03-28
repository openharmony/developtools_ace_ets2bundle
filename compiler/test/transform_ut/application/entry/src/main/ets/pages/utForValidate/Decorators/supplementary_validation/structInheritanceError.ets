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
 * Test case: Struct inheritance error
 * Purpose: Verify struct cannot inherit from classes
 * Error code: 10905212
 */

class BaseClass {
  name: string = 'base'
}

@Component
struct StructInheritanceError extends BaseClass {
  build() {
    Column() {
      Text('Struct inheritance test')
    }
  }
}

@Entry
@Component
struct TestStructInheritanceError {
  @State testTitle: string = 'Struct Inheritance Error Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .margin(20)
    }
  }
}
