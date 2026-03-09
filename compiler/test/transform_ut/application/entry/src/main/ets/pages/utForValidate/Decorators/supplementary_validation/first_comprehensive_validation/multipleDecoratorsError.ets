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
 * Test case: Multiple decorators on function error
 * Purpose: Verify functions cannot have multiple conflicting decorators
 * Error code: 10905117
 * 
 * Background:
 * - A function can only be decorated by one of certain decorators
 * - @Builder, @Extend, @Styles, etc. are mutually exclusive
 * - This ensures clear function behavior and purpose
 */

// Error: Function with both @Builder and @Styles - 10905117
@Builder
@Styles
function builderAndStyles() {
}

// Error: Function with both @Extend and @Builder - 10905117
@Extend(Text)
@Builder
function extendAndBuilder() {
}

// Error: Function with @Styles and @Builder - 10905117
@Styles
@Builder
function stylesAndBuilder() {
}

@Component
struct MultipleDecoratorsError {
  @State message: string = 'Test'

  build() {
    Column() {
      Text(this.message)
        .fontSize(18)
        .margin(10)
      
      Text('Multiple decorators test')
        .fontSize(14)
        .margin(5)
    }
    .padding(15)
    .backgroundColor('#FFEBEE')
    .borderRadius(8)
  }
}

@Entry
@Component
struct TestMultipleDecoratorsError {
  @State testTitle: string = 'Multiple Decorators Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
        .textAlign(TextAlign.Center)
      
      // Error explanation
      Column() {
        Text('Error: 10905117')
          .fontSize(18)
          .fontColor(Color.Red)
          .fontWeight(FontWeight.Bold)
          .margin(10)
        
        Text('Functions cannot have multiple conflicting decorators')
          .fontSize(14)
          .margin(10)
          .textAlign(TextAlign.Center)
        
        Text('Mutually exclusive decorators:')
          .fontSize(12)
          .fontWeight(FontWeight.Medium)
          .margin(8)
        
        Text('@Builder, @Extend, @Styles')
          .fontSize(12)
          .fontColor(Color.Orange)
          .margin(3)
        
        Text('@AnimatableExtend, @Concurrent')
          .fontSize(12)
          .fontColor(Color.Orange)
          .margin(3)
        
        Text('@Sendable')
          .fontSize(12)
          .fontColor(Color.Orange)
          .margin(3)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .borderRadius(8)
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .backgroundColor('#F5F5F5')
  }
}

// Correct examples with single decorators

// Correct: @Builder only
@Builder
function myBuilderFunction() {
  Column() {
    Text('Builder content')
      .fontSize(16)
      .margin(10)
  }
  .padding(15)
}

// Correct: @Styles only
@Styles
function myStylesFunction() {
  .fontSize(18)
  .fontWeight(FontWeight.Medium)
  .margin(10)
}

// Correct: @Extend only
@Extend(Text)
function myExtendFunction() {
  .fontSize(20)
  .fontColor(Color.Blue)
  .margin(15)
}

// Documentation component
@Component
struct MultipleDecoratorsDocumentation {
  @State docTitle: string = 'Decorator Guidelines'

  build() {
    Column() {
      Text(this.docTitle)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(15)
      
      Text('One decorator per function:')
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .margin(10)
      
      Text('@Builder - UI building blocks')
        .fontSize(14)
        .margin(8)
        .fontColor(Color.Blue)
      
      Text('@Extend - Component style extensions')
        .fontSize(14)
        .margin(8)
        .fontColor(Color.Green)
      
      Text('@Styles - Reusable style definitions')
        .fontSize(14)
        .margin(8)
        .fontColor(Color.Purple)
      
      Text('@AnimatableExtend - Animated styles')
        .fontSize(14)
        .margin(8)
        .fontColor(Color.Orange)
      
      Text('@Concurrent - Concurrent functions')
        .fontSize(14)
        .margin(8)
        .fontColor(Color.Red)
      
      Text('@Sendable - Sendable functions')
        .fontSize(14)
        .margin(8)
        .fontColor(Color.Red)
      
      Text('Error code: 10905117')
        .fontSize(12)
        .fontColor(Color.Red)
        .margin(5)
    }
    .padding(20)
    .backgroundColor('#ECEFF1')
    .borderRadius(8)
    .margin(10)
  }
}
