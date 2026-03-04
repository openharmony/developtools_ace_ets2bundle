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
 * Test case: @CustomDialog on non-struct
 * Purpose: Verify @CustomDialog can only be used on struct declarations
 * Error codes: 10905245
 * 
 * Background:
 * - @CustomDialog is used to create custom dialog components
 * - It can only be applied to struct declarations
 * - Using it on classes, functions, or other types will trigger errors
 */

// ============================================
// Test Case 1: @CustomDialog on class
// Expected Error: 10905245
// ============================================

// Error: @CustomDialog on class - 10905245
@CustomDialog
class DialogClass {
  title: string = 'Dialog';
  message: string = 'Content';
  
  show() {
    console.log('Show dialog');
  }
}

// ============================================
// Test Case 2: @CustomDialog on function
// ============================================

// Error: @CustomDialog on function - 10905245
@CustomDialog
function dialogFunction() {
  console.log('Dialog function');
  return 'dialog';
}

// ============================================
// Test Case 3: @CustomDialog on interface
// ============================================

// Error: @CustomDialog on interface - 10905245
@CustomDialog
interface DialogInterface {
  title: string;
  show(): void;
}

// ============================================
// Test Case 4: Correct @CustomDialog usage
// ============================================

@CustomDialog
struct CorrectCustomDialog {
  controller: CustomDialogController;
  title: string = 'Correct Dialog';
  message: string = 'This is a correct dialog';

  build() {
    Column() {
      Text(this.title)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(10)
      
      Text(this.message)
        .fontSize(14)
        .fontColor(Color.Gray)
        .margin(5)
    }
    .padding(20)
    .backgroundColor(Color.White)
    .borderRadius(10)
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct CustomDialogUsageTestEntry {
  @State testTitle: string = '@CustomDialog Usage Test';

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
      
      // Error information
      Column() {
        Text('Testing: 10905245')
          .fontSize(18)
          .fontColor(Color.Red)
          .fontWeight(FontWeight.Medium)
        
        Text('@CustomDialog on non-struct')
          .fontSize(14)
          .margin(5)
        
        Text('Error: class, function, interface')
          .fontSize(12)
          .fontColor(Color.Orange)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .margin(10)
      
      // Rules section
      Column() {
        Text('Valid Usage:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .margin(5)
        
        Text('@CustomDialog struct MyDialog { ... }')
          .fontSize(12)
          .fontColor(Color.Green)
        
        Text('Requires CustomDialogController property')
          .fontSize(12)
          .fontColor(Color.Gray)
      }
      .width('90%')
      .padding(10)
      .backgroundColor('#E8F5E9')
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
