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
 * Test case: While loop error in builder
 * Purpose: Verify while loop restrictions within build method
 * Error code: 10905206, 10905209
 * 
 * Background:
 * - While loops are not allowed in build method
 * - Use ForEach for iterative rendering
 * - This ensures proper UI component syntax compliance
 */

@Entry
@Component
struct WhileLoopError {
  @State testTitle: string = 'While Loop Error Test'
  @State loopCount: number = 0

  build() {
    Column() {
      // Error: While loop in build - 10905206, 10905209
      while (true) {
        Text('Invalid while')
      }
      
      // Title section
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
        .textAlign(TextAlign.Center)
      
      // Error explanation
      Column() {
        Text('While loops are not allowed in build() method')
          .fontSize(16)
          .fontColor(Color.Red)
          .margin(10)
          .textAlign(TextAlign.Center)
        
        Text('Error code: 10905206')
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
      .backgroundColor('#FFEBEE')
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
struct ProperForEachExample {
  @State items: string[] = ['Apple', 'Banana', 'Cherry']

  build() {
    Column() {
      Text('Proper ForEach Usage')
        .fontSize(18)
        .fontWeight(FontWeight.Medium)
        .margin(15)
      
      // First ForEach - String items
      ForEach(this.items, (item: string, index: number) => {
        Row() {
          Text(`${index + 1}. ${item}`)
            .fontSize(16)
            .margin(5)
        }
        .width('100%')
        .padding(10)
        .backgroundColor(index % 2 === 0 ? '#E8F5E9' : '#E3F2FD')
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
struct WhileLoopDocumentation {
  @State docTitle: string = 'Loop Guidelines'

  build() {
    Column() {
      Text(this.docTitle)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(15)
      
      Text('While and do-while loops are prohibited in build()')
        .fontSize(14)
        .margin(10)
        .fontColor(Color.Red)
      
      Text('ForEach is the recommended approach')
        .fontSize(14)
        .margin(10)
        .fontColor(Color.Green)
      
      Text('ForEach provides key-based rendering optimization')
        .fontSize(12)
        .margin(5)
        .fontColor(Color.Gray)
    }
    .padding(20)
    .backgroundColor('#ECEFF1')
    .borderRadius(8)
    .margin(10)
  }
}
