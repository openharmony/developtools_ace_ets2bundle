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
 * Test case: Extend and AnimatableExtend conflict
 * Purpose: Verify a function cannot be decorated with both @Extend and @AnimatableExtend
 * Error code: 10905111
 */

// ============================================
// Test Case 1: Function with both @Extend and @AnimatableExtend
// Expected Error: 10905111
// ============================================

// Error: Cannot use both @Extend and @AnimatableExtend on same function
@Extend(Row)
@AnimatableExtend(Row)
function conflictingDecorators() {
  .width('100%')
  .height(50)
}

// ============================================
// Test Case 2: Correct @Extend usage
// ============================================

@Extend(Button)
function correctExtendUsage() {
  .fontSize(16)
  .fontColor(Color.White)
  .backgroundColor(Color.Blue)
}

// ============================================
// Test Case 3: Correct @AnimatableExtend usage
// ============================================

@AnimatableExtend(Text)
function correctAnimatableExtend() {
  .fontSize(20)
  .fontWeight(FontWeight.Bold)
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct TestExtendConflict {
  @State testTitle: string = '@Extend & @AnimatableExtend Conflict Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      // Error information
      Column() {
        Text('Testing: 10905111')
          .fontSize(18)
          .fontColor(Color.Red)

        Text('Function cannot use both @Extend and @AnimatableExtend')
          .fontSize(14)
          .margin(5)
          .textAlign(TextAlign.Center)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      // Rule explanation
      Column() {
        Text('Rule Explanation:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('@Extend: Static style extension')
          .fontSize(12)
          .margin(2)

        Text('@AnimatableExtend: Animated style extension')
          .fontSize(12)
          .margin(2)

        Text('They are mutually exclusive!')
          .fontSize(14)
          .fontWeight(FontWeight.Bold)
          .fontColor(Color.Red)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .margin(10)

      // Example of correct usage
      Column() {
        Text('Correct Usage:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)

        Text('Use only one decorator per function')
          .fontSize(12)
          .fontColor(Color.Green)
          .margin(5)
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
