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

// Test Case: Function decorator conflicts - @Entry related combinations
// Issue: Function decorators cannot be combined
// Error Code: 10905117
// Expected: Compilation errors when decorators are combined

// Error Case 1: @AnimatableExtend + @Builder
@AnimatableExtend(Text)
@Builder
function entryAnimatableBuilderError() {
}

// Error Case 2: @AnimatableExtend + @Styles
@AnimatableExtend(Button)
@Styles
function entryAnimatableStylesError() {
}

// Error Case 3: @Extend + @Builder
@Extend(Column)
@Builder
function entryExtendBuilderError() {
}

// Correct Usage 1: @Extend alone
@Extend(Text)
function entryCorrectExtendText() {
  .fontSize(20)
  .fontColor(Color.Blue)
}

// Correct Usage 2: @Extend for Button
@Extend(Button)
function entryCorrectExtendButton() {
  .backgroundColor('#4CAF50')
  .fontSize(16)
}

@Component
struct EntryExample {
  @State message: string = 'Entry Component'

  build() {
    Column() {
      Text(this.message)
        .fontSize(18)
        .margin(10)
    }
    .padding(15)
    .backgroundColor('#E8F5E9')
  }
}

@Entry
@Component
struct EntryDecoratorRestrictions {
  @State testTitle: string = '@Entry Decorator Conflicts'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
        .fontColor(Color.Red)
      
      Column() {
        Text('Error: 10905117')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor(Color.Red)
        
        Text('Function Decorator Conflicts')
          .fontSize(16)
          .fontColor(Color.Orange)
          .margin(8)
        
        Text('Function decorators cannot be combined')
          .fontSize(14)
          .fontColor(Color.Gray)
          .margin(5)
        
        Divider().width('80%').height(1).margin(10)
        
        Text('Conflicting Combinations:')
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .margin(5)
        
        Text('@AnimatableExtend + @Builder')
          .fontSize(12)
          .fontColor(Color.Red)
          .margin(3)
        
        Text('@AnimatableExtend + @Styles')
          .fontSize(12)
          .fontColor(Color.Red)
          .margin(3)
        
        Text('@Extend + @Builder')
          .fontSize(12)
          .fontColor(Color.Red)
          .margin(3)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .borderRadius(8)
      .margin(10)
      
      EntryExample().margin(20)
      
      Text('Use decorators alone for styling')
        .fontSize(12)
        .fontColor(Color.Gray)
        .margin(15)
      
      Divider().width('90%').height(1).margin(15)
      
      Text('Valid Decorator Usage:')
        .fontSize(14)
        .fontWeight(FontWeight.Medium)
        .fontColor(Color.Green)
        .margin(8)
      
      Text('@Extend(Text) for text styling')
        .fontSize(12)
        .fontColor(Color.Gray)
        .margin(5)
      
      Text('@Extend(Button) for button styling')
        .fontSize(12)
        .fontColor(Color.Gray)
        .margin(5)
      
      Divider().width('80%').height(1).margin(10)
      
      Text('Styling Components:')
        .fontSize(14)
        .fontWeight(FontWeight.Medium)
        .fontColor(Color.Black)
        .margin(8)
      
      Text('@Extend allows component customization')
        .fontSize(12)
        .fontColor(Color.Gray)
        .margin(5)
      
      Text('Cannot combine with other decorators')
        .fontSize(12)
        .fontColor(Color.Gray)
        .margin(5)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .backgroundColor('#F5F5F5')
  }
}
