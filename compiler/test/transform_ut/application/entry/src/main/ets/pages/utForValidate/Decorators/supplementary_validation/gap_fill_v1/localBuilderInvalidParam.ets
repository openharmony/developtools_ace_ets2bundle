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
 * Purpose: Verify @Extend cannot combine with @Styles
 * Error code: 10905117
 */

@Extend(Text)
@Styles
function extendStylesConflict() {
  .fontSize(20)
}

@Extend(Button)
@Builder
function extendBuilderConflict() {
  .fontColor(Color.Red)
}

@Extend(Column)
@Concurrent
function extendConcurrentConflict2() {
  .padding(20)
}

@Extend(Text)
function correctExtendOnly() {
  .fontSize(18)
  .fontColor(Color.Blue)
  .fontWeight(FontWeight.Medium)
  .margin(10)
}

@Styles
function correctStylesOnly() {
  .width('80%')
  .height(45)
}

@Component
struct ExtendStylesExample {
  build() {
    Column() {
      Text('Correct Usage Examples')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(15)
        .fontColor(Color.Green)
      
      Text('Using @Extend correctly')
        .correctExtendOnly()
      
      Button('Using @Styles correctly')
        .correctStylesOnly()
        .fontSize(16)
        .margin(10)
    }
    .padding(15)
    .backgroundColor('#E8F5E9')
    .borderRadius(8)
    .margin(10)
  }
}

@Entry
@Component
struct TestLocalBuilderInvalidParam {
  @State testTitle: string = '@Extend + @Styles Conflict Test'
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
        
        Text('Extend + Styles Conflict')
          .fontSize(16)
          .margin(8)
          .fontColor(Color.Orange)
        
        Text('@Extend cannot be combined with @Styles')
          .fontSize(14)
          .margin(10)
          .textAlign(TextAlign.Center)
        
        Divider()
          .width('80%')
          .height(1)
          .color('#E0E0E0')
          .margin(10)
        
        Text('Conflicting Pairs:')
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .margin(5)
        
        Text('@Extend + @Styles')
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
            Text('1. @Extend(Text) + @Styles')
              .fontSize(14)
              .margin(5)
              .fontColor(Color.Orange)
            
            Text('2. @Extend(Button) + @Builder')
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
          
          Text('@Extend(Text) alone')
            .fontSize(14)
            .fontColor(Color.Blue)
            .margin(3)
          
          Text('@Styles alone')
            .fontSize(14)
            .fontColor(Color.Blue)
            .margin(3)
          
          ExtendStylesExample()
        }
        .width('90%')
        .padding(15)
        .backgroundColor('#E8F5E9')
        .borderRadius(8)
        .margin(10)
      }
      
      Text('Do not combine @Extend with @Styles or other decorators')
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
