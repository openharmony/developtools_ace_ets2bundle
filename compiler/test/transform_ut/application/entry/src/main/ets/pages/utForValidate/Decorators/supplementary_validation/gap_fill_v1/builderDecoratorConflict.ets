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

// Test Case: Function decorator conflicts - @Builder combinations
// Issue: @Builder cannot be combined with other function decorators
// Error Code: 10905117
// Expected: Compilation errors when @Builder is combined with other decorators

// Error Case 1: @AnimatableExtend + @Builder
@AnimatableExtend(Text)
@Builder
function builderAnimatableBuilderError() {
}

// Error Case 2: @AnimatableExtend + @Styles
@AnimatableExtend(Button)
@Styles
function builderAnimatableStylesError() {
}

// Error Case 3: @Extend + @Builder
@Extend(Column)
@Builder
function builderExtendBuilderError() {
}

// Correct Usage 1: @Builder alone
@Builder
function builderCorrectBuilder() {
  Text('Builder Content')
    .fontSize(16)
    .fontColor(Color.Blue)
}

// Correct Usage 2: @Extend alone
@Extend(Column)
function builderCorrectExtend() {
  .fontSize(14)
  .fontWeight(FontWeight.Medium)
}

@Component
struct BuilderExample {
  @State message: string = 'Builder Component'

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
struct BuilderDecoratorConflict {
  @State testTitle: string = '@Builder Decorator Conflicts'

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
        
        Text('@Builder conflicts with other decorators')
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
      
      BuilderExample().margin(20)
      
      Text('Use @Builder alone for UI building')
        .fontSize(12)
        .fontColor(Color.Gray)
        .margin(15)
      
      Divider().width('90%').height(1).margin(15)
      
      Text('Valid Decorators for @Builder:')
        .fontSize(14)
        .fontWeight(FontWeight.Medium)
        .fontColor(Color.Green)
        .margin(8)
      
      Text('@Builder alone works correctly')
        .fontSize(12)
        .fontColor(Color.Gray)
        .margin(5)
      
      Text('@Extend alone for component extension')
        .fontSize(12)
        .fontColor(Color.Gray)
        .margin(5)
      
      Divider().width('80%').height(1).margin(10)
      
      Text('Additional Information:')
        .fontSize(14)
        .fontWeight(FontWeight.Medium)
        .fontColor(Color.Black)
        .margin(8)
      
      Text('@Builder is for custom UI components')
        .fontSize(12)
        .fontColor(Color.Gray)
        .margin(5)
      
      Text('Cannot mix with styling decorators')
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
