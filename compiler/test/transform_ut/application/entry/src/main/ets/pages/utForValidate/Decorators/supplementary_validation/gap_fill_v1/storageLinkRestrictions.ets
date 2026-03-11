/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with License.
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

// Test Case: Function decorator conflicts - @StorageLink combinations
// Issue: Function decorators cannot be combined
// Error Code: 10905117
// Expected: Compilation errors when decorators are combined

// Error Case 1: @AnimatableExtend + @Builder
@AnimatableExtend(Text)
@Builder
function storageAnimatableBuilderError() {
}

// Error Case 2: @AnimatableExtend + @Styles
@AnimatableExtend(Button)
@Styles
function storageAnimatableStylesError() {
}

// Error Case 3: @Extend + @Builder
@Extend(Column)
@Builder
function storageExtendBuilderError() {
}

// Correct Usage 1: @Extend alone
@Extend(Text)
function storageCorrectExtend() {
  .fontSize(16)
  .margin(10)
}

// Correct Usage 2: @AnimatableExtend alone
@AnimatableExtend(Text)
function storageCorrectAnimatable() {
  .fontSize(18)
  .animation({ duration: 800 })
}

@Component
struct StorageExample {
  @State message: string = 'Storage Component'

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
struct StorageLinkRestrictions {
  @State testTitle: string = '@StorageLink Decorator Conflicts'

  build() {
    Column() {
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
      
      StorageExample().margin(20)
      
      Text('Use styling decorators exclusively')
        .fontSize(12)
        .fontColor(Color.Gray)
        .margin(15)
      
      Divider().width('90%').height(1).margin(15)
      
      Text('Valid Styling Patterns:')
        .fontSize(14)
        .fontWeight(FontWeight.Medium)
        .fontColor(Color.Green)
        .margin(8)
      
      Text('@Extend for component extension')
        .fontSize(12)
        .fontColor(Color.Gray)
        .margin(5)
      
      Text('@AnimatableExtend for animations')
        .fontSize(12)
        .fontColor(Color.Gray)
        .margin(5)
      
      Divider().width('80%').height(1).margin(10)
      
      Text('Builder Decorators:')
        .fontSize(14)
        .fontWeight(FontWeight.Medium)
        .fontColor(Color.Black)
        .margin(8)
      
      Text('@Builder for UI building')
        .fontSize(12)
        .fontColor(Color.Gray)
        .margin(5)
      
      Text('@Extend for component extension')
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
