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
 * Test case: Continue statement error in builder
 * Purpose: Verify continue statement restrictions within build method
 * Error code: 10905209
 * 
 * Background:
 * - Continue statements are not allowed in build method
 * - Loop control statements must follow UI component syntax
 * - ForEach should be used for iterative rendering
 */

@Entry
@Component
struct ContinueStatementError {
  @State testTitle: string = 'Continue Statement Error Test'
  @State loopIndex: number = 0

  build() {
    Column() {
      // Error: Continue statement in build - 10905209
      if (true) {
        continue
      }
      
      // Title display
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
        .textAlign(TextAlign.Center)
      
      // Error information card
      Column() {
        Text('Continue statements are not allowed in build() method')
          .fontSize(16)
          .fontColor(Color.Red)
          .margin(10)
          .textAlign(TextAlign.Center)
        
        Text('Error code: 10905209')
          .fontSize(14)
          .fontColor(Color.Orange)
          .margin(5)
        
        Text('Use ForEach for iterative rendering')
          .fontSize(12)
          .fontColor(Color.Gray)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF8E1')
      .borderRadius(8)
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .backgroundColor('#F5F5F5')
  }
}

// Example struct showing proper ForEach usage
@Component
struct ProperLoopExample {
  @State items: string[] = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']

  build() {
    Column() {
      Text('Proper Loop Example with ForEach')
        .fontSize(18)
        .fontWeight(FontWeight.Medium)
        .margin(15)
      
      // Correct way to iterate in build method
      ForEach(this.items, (item: string, index: number) => {
        Row() {
          Text(`${index + 1}. ${item}`)
            .fontSize(16)
            .margin(5)
        }
        .width('100%')
        .padding(10)
        .backgroundColor(index % 2 === 0 ? '#E3F2FD' : '#F3E5F5')
        .margin(2)
      }, (item: string) => item)
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
struct ContinueDocumentation {
  @State title: string = 'Continue Statement Guidelines'

  build() {
    Column() {
      Text(this.title)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(15)
      
      Text('Continue cannot be used in build() method')
        .fontSize(14)
        .margin(10)
        .fontColor(Color.Red)
      
      Text('ForEach provides proper iteration control')
        .fontSize(14)
        .margin(10)
        .fontColor(Color.Green)
      
      Text('Use ForEach instead of continue statements')
        .fontSize(12)
        .margin(5)
        .fontColor(Color.Gray)
    }
    .padding(20)
    .backgroundColor('#FCE4EC')
    .borderRadius(8)
    .margin(10)
  }
}
