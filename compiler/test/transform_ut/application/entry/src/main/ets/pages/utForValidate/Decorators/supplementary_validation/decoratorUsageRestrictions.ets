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
 * Test case: Decorator usage restrictions
 * Purpose: Verify that properties cannot have multiple state management decorators
 * Error codes: 10905302
 * 
 * Background:
 * - Each property can only have one state management decorator
 * - @State and @Prop cannot be used together
 * - Multiple decorators cause conflicts in state management
 */

// ============================================
// Test Case 1: Multiple decorators on single property
// Expected Error: 10905302
// ============================================

@Component
struct MultiDecoratorConflict {
  // Error: Using @State and @Prop together - 10905302
  @State
  @Prop
  message: string = 'Hello';
  
  @State
  @Link
  anotherMessage: string = 'World';

  build() {
    Column() {
      Text('Decorator Conflict Test')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
      
      // Display conflict information
      Column() {
        Text('Error: Multiple Decorators')
          .fontSize(18)
          .fontColor(Color.Red)
        
        Text('Property: message')
          .fontSize(14)
          .margin(5)
        
        Text('Conflicting: @State + @Prop')
          .fontSize(14)
          .fontColor(Color.Orange)
      }
      .width('90%')
      .padding(20)
      .backgroundColor('#FFEBEE')
      .margin(10)
      
      // Correct usage example
      Column() {
        Text('Correct Usage:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
        
        Text('@State message: string')
          .fontSize(12)
          .fontColor(Color.Green)
        
        Text('// OR')
          .fontSize(12)
          .fontColor(Color.Gray)
        
        Text('@Prop message: string')
          .fontSize(12)
          .fontColor(Color.Green)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#E8F5E9')
      .margin(10)
      
      Text(this.message)
        .fontSize(16)
        .margin(10)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct TestDecoratorRestrictions {
  build() {
    Column() {
      Text('Decorator Restrictions Test')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(20)
      
      Text('Error Code: 10905302')
        .fontSize(14)
        .fontColor(Color.Gray)
        .margin(5)
    }
    .width('100%')
    .height('100%')
  }
}
