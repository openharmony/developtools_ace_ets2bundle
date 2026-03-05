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
 * Test case: Consume initialization error
 * Purpose: Verify @Consume must be initialized using @Consume decorator with parameter
 * Error code: 10905307
 */

// ============================================
// Test Case 1: @Consume without decorator parameter
// Expected Error: 10905307
// ============================================

@Component
struct ConsumeWithoutParam {
  @Consume consumedValue: string

  build() {
    Column() {
      Text(this.consumedValue)
    }
  }
}

// ============================================
// Test Case 2: @Consume with wrong initialization
// Expected Error: 10905307
// ============================================

@Component
struct ConsumeWrongInit {
  @Consume('wrongInit') wrongValue: number = 0

  build() {
    Column() {
      Text('Value: ' + this.wrongValue)
    }
  }
}

// ============================================
// Test Case 3: Correct @Consume usage
// ============================================

@Component
struct CorrectConsumeUsage {
  @Consume('sharedKey') sharedData: string

  build() {
    Column() {
      Text(this.sharedData)
    }
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct TestConsumeInitError {
  @State testTitle: string = '@Consume Init Error Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing: 10905307')
          .fontSize(18)
          .fontColor(Color.Red)

        Text('@Consume must use decorator with parameter')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('Correct Usage:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)

        Text('@Consume("key") value: string')
          .fontSize(12)
          .fontColor(Color.Green)
      }
      .width('90%')
      .padding(10)
      .backgroundColor('#E8F5E9')
      .margin(5)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
