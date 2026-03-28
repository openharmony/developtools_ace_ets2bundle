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

// Test Case: Function decorator conflicts - @Require combinations
// Issue: Function decorators cannot be combined
// Error Code: 10905117
// Expected: Compilation errors when decorators are combined

// Error Case 1: @AnimatableExtend + @Builder
@AnimatableExtend(Text)
@Builder
function requireAnimatableBuilderError() {
}

// Error Case 2: @AnimatableExtend + @Styles
@AnimatableExtend(Button)
@Styles
function requireAnimatableStylesError() {
}

// Error Case 3: @Extend + @Builder
@Extend(Column)
@Builder
function requireExtendBuilderError() {
}

// Correct Usage 1: @AnimatableExtend alone
@AnimatableExtend(Text)
function requireCorrectAnimatableExtend() {
  .fontSize(20)
  .animation({ duration: 500 })
}

// Correct Usage 2: @Builder alone
@Builder
function requireCorrectBuilder() {
  Column() {
    Text('Standard Builder Content')
  }
}

@Component
struct RequireExample {
  @State message: string = 'Require Component'

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
struct RequireDecoratorConflict {
  @State testTitle: string = '@Require Decorator Conflicts'

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
      
      RequireExample().margin(20)
      
      Text('Use single decorator per function')
        .fontSize(12)
        .fontColor(Color.Gray)
        .margin(15)
      
      Divider().width('90%').height(1).margin(15)
      
      Text('Valid Decorator Usage:')
        .fontSize(14)
        .fontWeight(FontWeight.Medium)
        .fontColor(Color.Green)
        .margin(8)
      
      Text('@AnimatableExtend for animations')
        .fontSize(12)
        .fontColor(Color.Gray)
        .margin(5)
      
      Text('@Builder for UI components')
        .fontSize(12)
        .fontColor(Color.Gray)
        .margin(5)
      
      Divider().width('80%').height(1).margin(10)
      
      Text('Additional Information:')
        .fontSize(14)
        .fontWeight(FontWeight.Medium)
        .fontColor(Color.Black)
        .margin(8)
      
      Text('Check decorator compatibility')
        .fontSize(12)
        .fontColor(Color.Gray)
        .margin(5)
      
      Text('Avoid mixing UI decorators')
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
