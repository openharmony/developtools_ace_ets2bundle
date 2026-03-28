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
 * Test case: Extend decorator conflict
 * Purpose: Verify @Extend cannot combine with other decorators
 * Error code: 10905117
 */

@Extend(Text)
@Builder
function extendWithBuilder() {
  .fontSize(20)
  .fontColor(Color.Red)
  .margin(10)
}

@Extend(Button)
@Styles
function extendWithStyles() {
  .width('100%')
  .height(50)
  .backgroundColor('#2196F3')
}

@Extend(Column)
@Concurrent
function extendWithConcurrent() {
  .padding(20)
  .backgroundColor('#E3F2FD')
}

@Extend(Text)
function correctTextExtend() {
  .fontSize(18)
  .fontColor(Color.Blue)
  .fontWeight(FontWeight.Medium)
  .margin(10)
}

@Extend(Button)
function correctButtonExtend() {
  .width('80%')
  .height(45)
  .fontSize(16)
  .margin(10)
}

@Component
struct ExtendUsageExample {
  build() {
    Column() {
      Text('Correct Extend Usage')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(15)
        .fontColor(Color.Green)
      
      Text('Extended Text Style')
        .correctTextExtend()
      
      Button('Extended Button')
        .correctButtonExtend()
    }
    .padding(15)
    .backgroundColor('#E8F5E9')
    .borderRadius(8)
    .margin(10)
  }
}

@Entry
@Component
struct TestExtendInvalidComponent {
  @State testTitle: string = '@Extend Invalid Component Test'
  @State showExamples: boolean = true

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
        
        Text('Extend Decorator Conflict')
          .fontSize(16)
          .margin(8)
          .fontColor(Color.Orange)
        
        Text('@Extend cannot be combined with other decorators')
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
        
        Text('@Builder, @Styles, @Concurrent')
          .fontSize(12)
          .fontColor(Color.Red)
          .margin(3)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .borderRadius(8)
      .margin(10)
      
      Button(this.showExamples ? 'Hide Examples' : 'Show Examples')
        .fontSize(14)
        .width('70%')
        .margin(10)
        .backgroundColor('#2196F3')
        .onClick(() => {
          this.showExamples = !this.showExamples
        })
      
      if (this.showExamples) {
        Column() {
          Text('Error Examples:')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .margin(10)
            .fontColor(Color.Red)
          
          Column() {
            Text('1. @Extend(Text) + @Builder')
              .fontSize(14)
              .margin(5)
              .fontColor(Color.Orange)
            
            Text('2. @Extend(Button) + @Styles')
              .fontSize(14)
              .margin(5)
              .fontColor(Color.Orange)
            
            Text('3. @Extend(Column) + @Concurrent')
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
          
          Text('@Extend(Text)')
            .fontSize(14)
            .fontColor(Color.Blue)
            .margin(3)
          
          Text('function myExtend() { }')
            .fontSize(12)
            .fontColor(Color.Gray)
            .margin(3)
          
          ExtendUsageExample()
        }
        .width('90%')
        .padding(15)
        .backgroundColor('#E8F5E9')
        .borderRadius(8)
        .margin(10)
      }
      
      Text('Use @Extend alone for component style extensions')
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
