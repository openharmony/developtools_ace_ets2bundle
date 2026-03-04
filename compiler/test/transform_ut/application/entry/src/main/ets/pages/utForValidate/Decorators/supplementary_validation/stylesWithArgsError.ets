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
 * Test case: @Styles function arguments error
 * Purpose: Verify @Styles decorated functions cannot have arguments
 * Error codes: 10905110
 */

// ============================================
// Test Case 1: @Styles function with arguments
// Expected Error: 10905110
// ============================================

@Entry
@Component
struct StylesWithArgsError {
  // Error: @Styles function with parameter - 10905110
  @Styles
  myStyle(size: number) {
    .width(size)
    .height(size)
  }
  
  @State message: string = 'Test';

  build() {
    Column() {
      Text(this.message)
        .fontSize(20)
        .myStyle(100)  // Trying to use style with argument
    }
  }
}

// ============================================
// Test Case 2: Another @Styles with multiple arguments
// ============================================

@Component
struct AnotherStylesError {
  // Error: @Styles function with multiple parameters - 10905110
  @Styles
  complexStyle(width: number, height: number, color: Color) {
    .width(width)
    .height(height)
    .backgroundColor(color)
  }
  
  build() {
    Column() {
      Text('Styles Error')
        .fontSize(16)
    }
  }
}

// ============================================
// Test Case 3: Correct @Styles usage
// ============================================

@Styles
function correctStyle() {
  .width(100)
  .height(50)
  .backgroundColor(Color.Blue)
}

@Component
struct CorrectStylesUsage {
  build() {
    Column() {
      Text('Correct Style')
        .correctStyle()
        .fontColor(Color.White)
    }
  }
}

// ============================================
// Entry point
// ============================================

@Component
struct StylesArgsTestEntry {
  @State testTitle: string = '@Styles Args Test';

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
      
      // Error info
      Column() {
        Text('Testing: 10905110')
          .fontSize(18)
          .fontColor(Color.Red)
        
        Text('@Styles functions cannot have arguments')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .margin(10)
      
      // Correct example
      Column() {
        Text('Correct:')
          .fontSize(14)
          .fontWeight(FontWeight.Bold)
        
        Text('@Styles functionName() { ... }')
          .fontSize(12)
          .fontColor(Color.Green)
      }
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
