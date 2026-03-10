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
 * Test case: Binary expression error in builder
 * Purpose: Verify binary expression restrictions within build method
 * Error code: 10905204, 10905209
 * 
 * Background:
 * - Binary expressions are not allowed in build method
 * - This ensures proper UI component syntax compliance
 * - All expressions must conform to ArkTS UI syntax rules
 */

@Entry
@Component
struct BinaryExpressionError {
  @State testTitle: string = 'Binary Expression Error Test'
  @State value1: number = 10
  @State value2: number = 20

  build() {
    Column() {
      // Error: Binary expression in build - 10905204
      1 + 1
      
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
        .textAlign(TextAlign.Center)
      
      // Container for error demonstration
      Column() {
        Text('Binary expressions are not allowed in build()')
          .fontSize(16)
          .fontColor(Color.Red)
          .margin(10)
        
        Text('Error code: 10905204')
          .fontSize(14)
          .fontColor(Color.Orange)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .borderRadius(8)
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .backgroundColor('#F5F5F5')
  }
}

// Additional struct for reference
@Component
struct ReferenceBinaryStruct {
  @State refValue: number = 100

  build() {
    Column() {
      Text('Reference Component')
        .fontSize(18)
        .margin(10)
    }
    .padding(10)
    .backgroundColor('#E3F2FD')
    .borderRadius(5)
  }
}

// Documentation struct
@Component
struct BinaryErrorDocumentation {
  @State docTitle: string = 'Binary Expression Documentation'

  build() {
    Column() {
      Text(this.docTitle)
        .fontSize(20)
        .fontWeight(FontWeight.Medium)
        .margin(15)
      
      Text('Binary expressions like a + b are not allowed in build method')
        .fontSize(14)
        .margin(10)
        .fontColor(Color.Gray)
      
      Text('Only UI component syntax is permitted')
        .fontSize(14)
        .margin(10)
        .fontColor(Color.Red)
    }
    .padding(20)
  }
}
