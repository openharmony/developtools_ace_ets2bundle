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
 * Test case: Decorator method with parameters
 * Purpose: Verify decorated methods cannot have input parameters
 * Error code: 10905371
 */

// ============================================
// Test Case 1: @Monitor method with parameters
// Expected Error: 10905371
// ============================================

@ComponentV2
struct MonitorWithParams {
  @Local count: number = 0

  // Error: @Monitor method cannot have parameters
  @Monitor('count')
  onCountChange(val: number) {
    console.log('Count changed:', val)
  }

  build() {
    Column() {
      Text('Count: ' + this.count)
    }
  }
}

// ============================================
// Test Case 2: @Computed with parameters
// Expected Error: 10905371
// ============================================

@ComponentV2
struct ComputedWithParams {
  @Local value: number = 10

  // Error: @Computed getter with parameters
  @Computed
  get doubled(multiplier: number): number {
    return this.value * multiplier
  }

  build() {
    Column() {
      Text('Value: ' + this.value)
    }
  }
}

// ============================================
// Test Case 3: Correct usage without parameters
// ============================================

@ComponentV2
struct CorrectDecoratorUsage {
  @Local count: number = 0

  // Correct: @Monitor without parameters
  @Monitor('count')
  onCountChange() {
    console.log('Count changed')
  }

  // Correct: @Computed without parameters
  @Computed
  get doubled(): number {
    return this.count * 2
  }

  build() {
    Column() {
      Text('Count: ' + this.count)
      Text('Doubled: ' + this.doubled)
    }
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct TestDecoratorMethodParams {
  @State testTitle: string = 'Decorator Method Params Error Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing: 10905371')
          .fontSize(18)
          .fontColor(Color.Red)

        Text('Decorated methods cannot have parameters')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('Rules:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('@Monitor methods: no parameters')
          .fontSize(12)
          .fontColor(Color.Red)
          .margin(2)

        Text('@Computed getters: no parameters')
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

        Text('@Monitor("prop")\nonChange() { ... }')
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
