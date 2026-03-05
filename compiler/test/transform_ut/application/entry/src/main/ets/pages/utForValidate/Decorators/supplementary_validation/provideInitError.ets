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
 * Test case: Provide initialization error
 * Purpose: Verify @Provide property initialization method
 * Error code: 10905306
 */

// ============================================
// Test Case 1: @Provide with incorrect initialization
// Expected Error: 10905306
// ============================================

@Component
struct ProvideInitError {
  // Error: Incorrect initialization for @Provide
  @Provide({ allowOverride: 'invalid' }) providedValue: string = 'test'

  build() {
    Column() {
      Text(this.providedValue)
    }
  }
}

// ============================================
// Test Case 2: @Provide with wrong parameter type
// Expected Error: 10905306
// ============================================

@Component
struct ProvideWrongParam {
  @Provide(123) wrongParam: number = 0

  build() {
    Column() {
      Text('Value: ' + this.wrongParam)
    }
  }
}

// ============================================
// Test Case 3: Correct @Provide usage
// ============================================

@Component
struct CorrectProvideUsage {
  @Provide('sharedKey') sharedData: string = 'shared'

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
struct TestProvideInitError {
  @State testTitle: string = '@Provide Init Error Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing: 10905306')
          .fontSize(18)
          .fontColor(Color.Red)

        Text('@Provide initialization error')
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

        Text('@Provide("key") value: string = "default"')
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
