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
 * Test case: Struct validation errors
 * Purpose: Verify that struct must have @Component, @ComponentV2, or @CustomDialog decorator
 * Error codes: 10905233
 * 
 * Background:
 * - In ArkTS, struct declarations must be decorated with @Component, @ComponentV2, or @CustomDialog
 * - Without these decorators, the struct is not recognized as a UI component
 * - This validation ensures proper component definition
 */

// ============================================
// Test Case 1: Struct without component decorator
// Expected Error: 10905233
// ============================================

// Error: Missing @Component decorator - 10905233
struct StructWithoutComponentDecorator {
  @State message: string = 'Hello';
  @State count: number = 0;

  build() {
    Column() {
      Text(this.message)
        .fontSize(20)
      Text(`Count: ${this.count}`)
        .fontSize(16)
    }
    .width('100%')
    .padding(20)
  }
}

// ============================================
// Test Case 2: Another struct without decorator
// Demonstrates the error is consistent
// ============================================

struct AnotherStructWithoutDecorator {
  title: string = 'Title';
  description: string = 'Description';
  
  build() {
    Column() {
      Text(this.title)
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
      Text(this.description)
        .fontSize(14)
        .fontColor(Color.Gray)
    }
  }
}

// ============================================
// Test Case 3: Valid struct with @Component
// This should work without errors
// ============================================

@Component
struct ValidComponentStruct {
  @State validMessage: string = 'I am valid';
  
  build() {
    Column() {
      Text(this.validMessage)
        .fontSize(20)
        .fontColor(Color.Green)
    }
  }
}

// ============================================
// Test Case 4: Another valid struct with @ComponentV2
// Demonstrates V2 component is also valid
// ============================================

@ComponentV2
struct ValidComponentV2Struct {
  @Local v2Message: string = 'V2 Component';
  
  build() {
    Column() {
      Text(this.v2Message)
        .fontSize(18)
    }
  }
}

// ============================================
// Entry point for the test page
// ============================================

@Entry
@Component
struct StructValidationTestEntry {
  @State testStatus: string = 'Testing...';
  
  build() {
    Column() {
      // Header section
      Column() {
        Text('Struct Validation Test')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .margin(20)
        
        Text('Error Code: 10905233')
          .fontSize(14)
          .fontColor(Color.Gray)
        
        Text('Testing: Struct missing component decorator')
          .fontSize(12)
          .fontColor(Color.Gray)
          .margin(5)
      }
      
      // Status indicator
      Row() {
        Text('Status: ')
          .fontSize(16)
        Text(this.testStatus)
          .fontSize(16)
          .fontColor(Color.Blue)
      }
      .margin(10)
      
      // Test description
      Column() {
        Text('Test Description:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .margin(5)
        
        Text('This test verifies that structs must be decorated')
          .fontSize(12)
          .fontColor(Color.Gray)
        
        Text('with @Component, @ComponentV2, or @CustomDialog')
          .fontSize(12)
          .fontColor(Color.Gray)
      }
      .width('90%')
      .backgroundColor('#F5F5F5')
      .padding(15)
      .margin(10)
      
      // Placeholder content
      Stack() {
        Text('Test Content')
          .fontSize(16)
          .fontColor(Color.Gray)
      }
      .width('100%')
      .height(150)
      .backgroundColor('#EEEEEE')
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
