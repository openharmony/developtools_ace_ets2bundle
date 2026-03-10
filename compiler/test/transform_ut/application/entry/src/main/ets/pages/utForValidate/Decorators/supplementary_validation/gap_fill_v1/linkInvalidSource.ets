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
 * Test case: Concurrent with Builder conflict
 * Purpose: Verify @Concurrent cannot combine with @Builder
 * Error code: 10905117
 */

@Concurrent
@Builder
function linkInvalidSource() {
  Text('Test')
}

@Concurrent
@Styles
function concurrentStylesConflict() {
  .fontSize(20)
}

@Concurrent
@Extend(Text)
function concurrentExtendConflict() {
  .fontColor(Color.Red)
}

@Concurrent
function correctConcurrentFunction(): number {
  let sum = 0
  for (let i = 1; i <= 10; i++) {
    sum += i
  }
  return sum
}

@Component
struct ConcurrentExample {
  @State result: number = 0

  build() {
    Column() {
      Text('Correct Concurrent Usage')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(15)
        .fontColor(Color.Green)
      
      Text(`Result: ${this.result}`)
        .fontSize(18)
        .margin(10)
      
      Button('Execute')
        .fontSize(16)
        .width('60%')
        .margin(10)
        .onClick(() => {
          this.result = correctConcurrentFunction()
        })
    }
    .padding(15)
    .backgroundColor('#E8F5E9')
    .borderRadius(8)
    .margin(10)
  }
}

@Entry
@Component
struct TestLinkInvalidSource {
  @State testTitle: string = 'Concurrent Builder Conflict Test'
  @State showDetails: boolean = true

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
        .textAlign(TextAlign.Center)
        .fontColor(Color.Red)
      
      Column() {
        Text('Error: 10905117')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(10)
          .fontColor(Color.Red)
        
        Text('Concurrent Function Decorator Conflict')
          .fontSize(16)
          .margin(8)
          .fontColor(Color.Orange)
        
        Text('@Concurrent cannot be combined with other decorators')
          .fontSize(14)
          .margin(10)
          .textAlign(TextAlign.Center)
        
        Divider()
          .width('80%')
          .height(1)
          .color('#E0E0E0')
          .margin(10)
        
        Text('Conflicting Decorators:')
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .margin(5)
        
        Text('@Builder, @Styles, @Extend')
          .fontSize(12)
          .fontColor(Color.Red)
          .margin(3)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .borderRadius(8)
      .margin(10)
      
      Button(this.showDetails ? 'Hide Details' : 'Show Details')
        .fontSize(14)
        .width('70%')
        .margin(10)
        .backgroundColor('#2196F3')
        .onClick(() => {
          this.showDetails = !this.showDetails
        })
      
      if (this.showDetails) {
        Column() {
          Text('Error Examples:')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .margin(10)
            .fontColor(Color.Red)
          
          Column() {
            Text('1. @Concurrent + @Builder')
              .fontSize(14)
              .margin(5)
              .fontColor(Color.Orange)
            
            Text('2. @Concurrent + @Styles')
              .fontSize(14)
              .margin(5)
              .fontColor(Color.Orange)
            
            Text('3. @Concurrent + @Extend')
              .fontSize(14)
              .margin(5)
              .fontColor(Color.Orange)
          }
          .margin(10)
          .alignItems(HorizontalAlign.Start)
          
          Divider()
            .width('70%')
            .height(1)
            .color('#E0E0E0')
            .margin(10)
          
          Text('Correct Implementation:')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .margin(10)
            .fontColor(Color.Green)
          
          Text('@Concurrent')
            .fontSize(14)
            .fontColor(Color.Blue)
            .margin(3)
          
          Text('function myFunction() { }')
            .fontSize(12)
            .fontColor(Color.Gray)
            .margin(3)
          
          ConcurrentExample()
        }
        .width('90%')
        .padding(15)
        .backgroundColor('#E8F5E9')
        .borderRadius(8)
        .margin(10)
      }
      
      Text('Use @Concurrent alone for concurrent execution')
        .fontSize(12)
        .fontColor(Color.Gray)
        .margin(15)
        .textAlign(TextAlign.Center)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .backgroundColor('#F5F5F5')
  }
}
