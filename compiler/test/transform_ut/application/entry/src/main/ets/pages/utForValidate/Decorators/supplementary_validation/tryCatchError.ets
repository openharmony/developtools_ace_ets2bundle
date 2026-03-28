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
 * Test case: Try-catch error
 * Purpose: Verify try-catch restrictions
 * Error code: 10905206
 */

@Component
struct TryCatchError {
  build() {
    Column() {
      try {
        Text('Try block')
      } catch (e) {
        Text('Catch block')
      }
    }
  }
}

@Entry
@Component
struct TestTryCatch {
  @State testTitle: string = 'Try-Catch Error Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .margin(20)
    }
  }
}
