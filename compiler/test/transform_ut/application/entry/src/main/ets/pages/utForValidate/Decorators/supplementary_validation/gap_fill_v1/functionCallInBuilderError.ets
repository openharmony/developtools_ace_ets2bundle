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
 * Test case: Function call error in builder
 * Purpose: Verify function call restrictions within build method
 * Error code: 10905204
 * 
 * Background:
 * - Direct function calls are not allowed in build method
 * - All expressions must conform to UI component syntax
 * - Use component methods and event handlers instead
 */

@Entry
@Component
struct FunctionCallError {
  @State testTitle: string = 'Function Call Error Test'
  @State message: string = 'Test Message'

  // Method that should not be called directly in build
  myFunction() {
    console.log('This function should not be called in build')
  }

  build() {
    Column() {
      // Error: Function call in build - 10905204
      this.myFunction()
      
      // Title section
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
        .textAlign(TextAlign.Center)
      
      // Error explanation
      Column() {
        Text('Function calls are not allowed directly in build()')
          .fontSize(16)
          .fontColor(Color.Red)
          .margin(10)
          .textAlign(TextAlign.Center)
        
        Text('Error code: 10905204')
          .fontSize(14)
          .fontColor(Color.Orange)
          .margin(5)
        
        Text('Use event handlers like onClick instead')
          .fontSize(12)
          .fontColor(Color.Gray)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#E8EAF6')
      .borderRadius(8)
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .backgroundColor('#F5F5F5')
  }
}

// Example showing proper event handling
@Component
struct ProperEventHandling {
  @State clickCount: number = 0

  handleButtonClick() {
    this.clickCount++
  }

  build() {
    Column() {
      Text('Proper Event Handling Example')
        .fontSize(18)
        .fontWeight(FontWeight.Medium)
        .margin(15)
      
      Text(`Click count: ${this.clickCount}`)
        .fontSize(16)
        .margin(10)
      
      // Correct: Function called in event handler, not in build
      Button('Click Me')
        .fontSize(16)
        .width('70%')
        .margin(10)
        .onClick(() => {
          this.handleButtonClick()
        })
    }
    .padding(20)
    .backgroundColor('#E0F2F1')
    .borderRadius(8)
    .margin(10)
  }
}

// Documentation component
@Component
struct FunctionCallDocumentation {
  @State docTitle: string = 'Function Call Guidelines'

  build() {
    Column() {
      Text(this.docTitle)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(15)
      
      Text('Direct function calls are prohibited in build()')
        .fontSize(14)
        .margin(10)
        .fontColor(Color.Red)
      
      Text('Use onClick, onChange, and other event handlers')
        .fontSize(14)
        .margin(10)
        .fontColor(Color.Green)
    }
    .padding(15)
    .backgroundColor('#FFF3E0')
    .borderRadius(8)
    .margin(10)
  }
}
