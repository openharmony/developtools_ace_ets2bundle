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
 * Test case: Provide type mismatch
 * Purpose: Verify @Provide type matching
 * Error code: 10905311
 */

@Component
struct ParentComponent {
  @Provide('key') stringValue: string = 'test'

  build() {
    Column() {
      ChildConsumeType()
    }
  }
}

@Component
struct ChildConsumeType {
  @Consume('key') numberValue: number

  build() {
    Column() {
      Text('Value: ' + this.numberValue)
    }
  }
}

@Entry
@Component
struct TestProvideTypeMismatch {
  @State testTitle: string = '@Provide Type Mismatch Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .margin(20)
      ParentComponent()
    }
  }
}
