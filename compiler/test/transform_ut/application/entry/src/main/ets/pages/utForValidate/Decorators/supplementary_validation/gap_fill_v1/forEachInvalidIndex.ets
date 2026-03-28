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
 * Test case: Builder with Extend conflict
 * Purpose: Verify @Builder cannot combine with @Extend
 * Error code: 10905117
 * 
 * Background:
 * - @Builder is used to define builder functions for UI construction
 * - @Extend is used to extend component styles
 * - These decorators are mutually exclusive and cannot be combined
 * - This ensures clear separation of concerns in component design
 */

// ============================================
// Error Test Case: @Extend + @Builder conflict
// ============================================

@Extend(Text)
@Builder
function forEachInvalidIndex() {
  .fontSize(20)
  .fontColor(Color.Red)
  .margin(10)
}

// ============================================
// Correct Usage Example 1: @Extend alone
// ============================================

@Extend(Text)
function correctTextExtend() {
  .fontSize(18)
  .fontColor(Color.Blue)
  .fontWeight(FontWeight.Medium)
  .margin(10)
}

// ============================================
// Correct Usage Example 2: @Builder alone
// ============================================

@Builder
function correctBuilderFunction() {
  Column() {
    Text('Correct Builder')
      .fontSize(18)
      .margin(10)
    
    Text('No decorator conflicts')
      .fontSize(14)
      .margin(5)
  }
  .padding(15)
  .backgroundColor('#E8F5E9')
}

// ============================================
// Component demonstrating correct usage
// ============================================

@Component
struct BuilderExample {
  build() {
    Column() {
      Text('Correct Builder Usage')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(15)
        .fontColor(Color.Green)
      
      correctBuilderFunction()
    }
    .padding(15)
    .backgroundColor('#E8F5E9')
    .borderRadius(8)
    .margin(10)
  }
}

// ============================================
// Test Entry Component with detailed UI
// ============================================

@Entry
@Component
struct TestForEachInvalidIndex {
  @State testTitle: string = 'Builder Extend Conflict Test'
  @State showDetails: boolean = true

  build() {
    Column() {
      // Title Section
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
        .textAlign(TextAlign.Center)
        .fontColor(Color.Red)
      
      // Error Information Card
      Column() {
        Text('Error: 10905117')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(10)
          .fontColor(Color.Red)
        
        Text('Builder Decorator Conflict')
          .fontSize(16)
          .margin(8)
          .fontColor(Color.Orange)
        
        Text('@Builder cannot be combined with @Extend')
          .fontSize(14)
          .margin(10)
          .textAlign(TextAlign.Center)
          .fontColor(Color.Gray)
        
        Divider()
          .width('80%')
          .height(1)
          .color('#E0E0E0')
          .margin(10)
        
        Text('Conflicting Decorators:')
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .margin(5)
        
        Text('@Extend, @Styles, @Concurrent')
          .fontSize(12)
          .fontColor(Color.Red)
          .margin(3)
        
        Text('@AnimatableExtend, @Sendable')
          .fontSize(12)
          .fontColor(Color.Red)
          .margin(3)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .borderRadius(8)
      .margin(10)
      
      // Toggle Button
      Button(this.showDetails ? 'Hide Details' : 'Show Details')
        .fontSize(14)
        .width('70%')
        .margin(10)
        .backgroundColor('#2196F3')
        .onClick(() => {
          this.showDetails = !this.showDetails
        })
      
      // Details Section
      if (this.showDetails) {
        Column() {
          Text('Error Example:')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .margin(10)
            .fontColor(Color.Red)
          
          Text('@Extend(Text)')
            .fontSize(14)
            .margin(5)
            .fontColor(Color.Orange)
          
          Text('@Builder')
            .fontSize(14)
            .margin(5)
            .fontColor(Color.Orange)
          
          Text('function myFunction() { }')
            .fontSize(12)
            .margin(5)
            .fontColor(Color.Gray)
          
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
          
          Text('@Builder')
            .fontSize(14)
            .fontColor(Color.Blue)
            .margin(3)
          
          Text('function myBuilder() { }')
            .fontSize(12)
            .fontColor(Color.Gray)
            .margin(3)
          
          BuilderExample()
        }
        .width('90%')
        .padding(15)
        .backgroundColor('#E8F5E9')
        .borderRadius(8)
        .margin(10)
      }
      
      // Footer
      Text('Use @Builder alone for builder functions')
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
