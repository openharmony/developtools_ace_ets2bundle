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
 * Test case: Duplicate decorators for method
 * Purpose: Verify duplicate decorators are not allowed for methods
 * Error code: 10905119
 */

// ============================================
// Test Case 1: Method with duplicate decorators
// Expected Error: 10905119
// ============================================

@Component
struct DuplicateMethodDecorators {
  @State message: string = 'Test'

  // Error: Duplicate @Watch decorators
  @Watch('onMessageChange')
  @Watch('onMessageChange2')
  @State watchedValue: string = 'watched'

  onMessageChange() {
    console.info('Message changed')
  }

  onMessageChange2() {
    console.info('Message changed 2')
  }

  // Error: Method with duplicate decorators (if applicable)
  build() {
    Column() {
      Text(this.message)
        .fontSize(16)
    }
  }
}

// ============================================
// Test Case 2: Property with duplicate decorators
// Expected Error: 10905119
// ============================================

@Component
struct DuplicatePropertyDecorators {
  // Error: Same decorator used multiple times
  @State
  @State
  duplicateDecorated: number = 0

  build() {
    Column() {
      Text('Value: ' + this.duplicateDecorated)
        .fontSize(16)
    }
  }
}

// ============================================
// Test Case 3: Correct single decorator usage
// ============================================

@Component
struct CorrectSingleDecorators {
  @State counter: number = 0
  @Prop message: string
  @Link linkedValue: number

  @Watch('onCounterChange')
  @State watchedCounter: number = 0

  onCounterChange() {
    console.info('Counter changed to: ' + this.watchedCounter)
  }

  build() {
    Column() {
      Text('Counter: ' + this.counter)
        .fontSize(16)
      Text(this.message)
        .fontSize(16)
      Text('Watched: ' + this.watchedCounter)
        .fontSize(16)
    }
  }
}

// ============================================
// Test Case 4: V2 component with duplicate decorators
// ============================================

@ComponentV2
struct V2DuplicateDecorators {
  // Error: Duplicate @Local decorators
  @Local
  @Local
  duplicateLocal: string = 'duplicate'

  build() {
    Column() {
      Text(this.duplicateLocal)
        .fontSize(16)
    }
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct TestDuplicateDecorators {
  @State testTitle: string = 'Duplicate Decorators Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      // Error information
      Column() {
        Text('Testing: 10905119')
          .fontSize(18)
          .fontColor(Color.Red)

        Text('Duplicate decorators are not allowed')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      // Rules
      Column() {
        Text('Rules:',)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('1. Cannot use same decorator twice')
          .fontSize(12)
          .fontColor(Color.Red)
          .margin(2)

        Text('2. Cannot duplicate @Watch on same property')
          .fontSize(12)
          .fontColor(Color.Red)
          .margin(2)

        Text('3. Each property needs unique decorator set')
          .fontSize(12)
          .margin(2)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .margin(10)

      // Examples
      Column() {
        Text('Correct Usage:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)

        Text('@State value: number')
          .fontSize(12)
          .fontColor(Color.Green)
          .margin(2)

        Text('@Watch("callback") @State watched: string')
          .fontSize(12)
          .fontColor(Color.Green)
          .margin(2)

        Text('@Local v2Value: string',)
          .fontSize(12)
          .fontColor(Color.Green)
          .margin(2)
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
