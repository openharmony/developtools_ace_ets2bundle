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

// Test Case: Function decorator conflicts - @AnimatableExtend combinations
// Issue: @AnimatableExtend cannot be combined with other function decorators
// Error Code: 10905117
// Expected: Compilation errors when @AnimatableExtend is combined with other decorators

// Error Case 1: @AnimatableExtend + @Builder
@AnimatableExtend(Text)
@Builder
function animatableExtendBuilderError() {
}

// Error Case 2: @AnimatableExtend + @Styles
@AnimatableExtend(Button)
@Styles
function animatableExtendStylesError() {
}

// Error Case 3: @Extend + @Builder
@Extend(Column)
@Builder
function extendBuilderError() {
}

// Correct Usage 1: @AnimatableExtend alone
@AnimatableExtend(Text)
function correctAnimatableExtend() {
  .fontSize(18)
  .animation({ duration: 1000 })
}

// Correct Usage 2: @Builder alone
@Builder
function correctBuilder() {
  Text('Builder Content')
}

@Component
struct AnimatableExtendExample {
  @State fontSize: number = 18

  build() {
    Column() {
      Text('Correct AnimatableExtend')
        .fontSize(this.fontSize)
        .margin(10)
    }
    .padding(15)
    .backgroundColor('#E8F5E9')
  }
}

@Entry
@Component
struct AnimatableExtendConflict {
  @State testTitle: string = '@AnimatableExtend Decorator Conflicts'

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
      
      AnimatableExtendExample().margin(20)
      
      Divider().width('90%').height(1).margin(15)
      
      Text('Error Explanation:')
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
        .fontColor(Color.Black)
        .margin(10)
      
      Text('Decorators modify function behavior')
        .fontSize(14)
        .fontColor(Color.Gray)
        .margin(5)
      
      Text('Multiple decorators create conflicts')
        .fontSize(14)
        .fontColor(Color.Gray)
        .margin(5)
      
      Divider().width('80%').height(1).margin(10)
      
      Text('Keep functions focused and single-purpose')
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
