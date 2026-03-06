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
 * Test case: Concurrent decorator error
 * Purpose: Verify @Concurrent cannot be used on certain function declarations
 * Error code: 10905122
 */

// ============================================
// Test Case 1: @Concurrent on generator function
// Expected Error: 10905122
// ============================================

@Component
struct ConcurrentGeneratorError {
  // Error: @Concurrent cannot be used on generator function
  @Concurrent
  *generatorFunc() {
    yield 1
    yield 2
  }

  build() {
    Column() {
      Text('Generator Test')
    }
  }
}

// ============================================
// Test Case 2: @Concurrent on async generator
// Expected Error: 10905122
// ============================================

@Component
struct ConcurrentAsyncGenError {
  // Error: @Concurrent cannot be used on async generator
  @Concurrent
  async *asyncGenerator() {
    yield await Promise.resolve(1)
  }

  build() {
    Column() {
      Text('Async Generator Test')
    }
  }
}

// ============================================
// Test Case 3: Correct @Concurrent usage
// ============================================

@Component
struct CorrectConcurrentUsage {
  // Correct: Regular async function
  @Concurrent
  async processData(data: number[]): Promise<number> {
    return data.reduce((a, b) => a + b, 0)
  }

  // Correct: Regular function
  @Concurrent
  calculate(x: number, y: number): number {
    return x + y
  }

  build() {
    Column() {
      Text('Concurrent Test')
    }
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct TestConcurrentError {
  @State testTitle: string = '@Concurrent Error Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing: 10905122')
          .fontSize(18)
          .fontColor(Color.Red)

        Text('@Concurrent cannot be used on certain functions')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('Invalid Function Types:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('Generator functions')
          .fontSize(12)
          .fontColor(Color.Red)
          .margin(2)

        Text('Async generator functions')
          .fontSize(12)
          .fontColor(Color.Red)
          .margin(2)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .margin(10)

      Column() {
        Text('Correct Usage:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)

        Text('@Concurrent\nasync function process() { ... }')
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
