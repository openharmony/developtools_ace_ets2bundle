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
 * Test case: Ternary expression error in builder
 * Purpose: Verify ternary expression restrictions within build method
 * Error code: 10905204
 * 
 * Background:
 * - Direct ternary expressions are not allowed in build method
 * - Use if/else statements for conditional rendering
 * - This ensures proper UI component syntax compliance
 */

@Entry
@Component
struct TernaryExpressionError {
  @State testTitle: string = 'Ternary Expression Error Test'
  @State flag: boolean = true

  build() {
    Column() {
      // Error: Ternary expression in build - 10905204
      this.flag ? Text('True') : Text('False')
      
      // Title section
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
        .textAlign(TextAlign.Center)
      
      // Error explanation container
      Column() {
        Text('Ternary expressions are not allowed in build()')
          .fontSize(16)
          .fontColor(Color.Red)
          .margin(10)
          .textAlign(TextAlign.Center)
        
        Text('Error code: 10905204')
          .fontSize(14)
          .fontColor(Color.Orange)
          .margin(5)
        
        Text('Use if/else statements instead')
          .fontSize(12)
          .fontColor(Color.Gray)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#E0F7FA')
      .borderRadius(8)
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .backgroundColor('#F5F5F5')
  }
}

// Example struct showing proper conditional rendering
@Component
struct ProperConditionalRendering {
  @State isVisible: boolean = true

  build() {
    Column() {
      Text('Proper Conditional Rendering')
        .fontSize(18)
        .fontWeight(FontWeight.Medium)
        .margin(15)
      
      // Multiple conditional branches
      if (this.isVisible) {
        Text('Content is visible')
          .fontSize(16)
          .fontColor(Color.Green)
          .margin(10)
      } else {
        Text('Content is hidden')
          .fontSize(16)
          .fontColor(Color.Red)
          .margin(10)
      }
      
      // Visibility toggle button
      Button(this.isVisible ? 'Hide' : 'Show')
        .fontSize(14)
        .margin(10)
        .onClick(() => {
          this.isVisible = !this.isVisible
        })
    }
    .width('90%')
    .padding(15)
    .backgroundColor('#FFFFFF')
    .borderRadius(8)
    .margin(10)
  }
}

// Documentation component
@Component
struct TernaryDocumentation {
  @State docTitle: string = 'Ternary Expression Guidelines'

  build() {
    Column() {
      Text(this.docTitle)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(15)
      
      Text('Ternary operator ? : is not allowed in build()')
        .fontSize(14)
        .margin(10)
        .fontColor(Color.Red)
      
      Text('Use if/else for conditional rendering')
        .fontSize(14)
        .margin(10)
        .fontColor(Color.Green)
    }
    .padding(20)
    .backgroundColor('#F3E5F5')
    .borderRadius(8)
    .margin(10)
  }
}
