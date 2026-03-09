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
 * Test case: @Extend and @AnimatableExtend conflict
 * Purpose: Verify function cannot use both @Extend and @AnimatableExtend
 * Error code: 10905111, 10905117
 * 
 * Background:
 * - A function can only be decorated by one of the decorators
 * - @Extend and @AnimatableExtend are mutually exclusive
 * - This ensures clear styling behavior
 */

// Error: Function with both @Extend and @AnimatableExtend - 10905111, 10905117
@Extend(Text)
@AnimatableExtend(Text)
function extendAndAnimatable(value: number) {
  .fontSize(value)
}

// Error: Another conflicting decorator combination - 10905111, 10905117
@Extend(Button)
@AnimatableExtend(Button)
function buttonExtendAnimatable(width: number) {
  .width(width)
}

@Entry
@Component
struct TestExtendAnimatableConflict {
  @State testTitle: string = 'Extend/AnimatableExtend Conflict Test'
  @State animValue: number = 20

  build() {
    Column() {
      // Title
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
        .textAlign(TextAlign.Center)
      
      // Error explanation
      Column() {
        Text('Cannot use @Extend and @AnimatableExtend together')
          .fontSize(16)
          .fontColor(Color.Red)
          .margin(10)
          .textAlign(TextAlign.Center)
        
        Text('Error codes: 10905111, 10905117')
          .fontSize(14)
          .fontColor(Color.Orange)
          .margin(5)
        
        Text('Use only one decorator per function')
          .fontSize(12)
          .fontColor(Color.Gray)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .borderRadius(8)
      .margin(10)
      
      // Animation value display
      Text(`Animation value: ${this.animValue}`)
        .fontSize(16)
        .margin(10)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .backgroundColor('#F5F5F5')
  }
}

// Correct: Using @Extend only
@Extend(Text)
function textExtendStyle() {
  .fontSize(18)
  .fontWeight(FontWeight.Medium)
  .fontColor(Color.Blue)
  .margin(10)
}

// Correct: Using @AnimatableExtend only
@AnimatableExtend(Text)
function textAnimatableStyle() {
  .fontSize(20)
}

// Documentation component
@Component
struct DecoratorConflictDocumentation {
  @State docTitle: string = 'Decorator Conflict Guidelines'

  build() {
    Column() {
      Text(this.docTitle)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(15)
      
      Text('Mutually exclusive decorators:')
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .margin(10)
      
      Text('@Extend, @AnimatableExtend, @Builder, @Styles')
        .fontSize(14)
        .margin(10)
        .fontColor(Color.Orange)
      
      Text('@Concurrent, @Sendable')
        .fontSize(14)
        .margin(5)
        .fontColor(Color.Orange)
      
      Text('Choose one decorator based on your needs')
        .fontSize(14)
        .margin(10)
        .fontColor(Color.Green)
    }
    .padding(20)
    .backgroundColor('#FFF8E1')
    .borderRadius(8)
    .margin(10)
  }
}
