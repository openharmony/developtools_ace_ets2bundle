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
 * Test case: @Preview decorator usage
 * Purpose: Verify @Preview usage restrictions
 * Error codes: 10905248
 * 
 * Background:
 * - @Preview is used to mark components for preview in IDE
 * - It can only be applied to @Component or @ComponentV2 decorated structs
 * - Using it on classes, functions, or other types will trigger errors
 */

// ============================================
// Test Case 1: @Preview on class
// Expected Error: 10905248
// ============================================

// Error: @Preview on class - 10905248
@Preview
class PreviewClass {
  title: string = 'Preview';
  
  build() {
    Column() {
      Text('Preview')
        .fontSize(20)
    }
  }
}

// ============================================
// Test Case 2: @Preview on function
// ============================================

// Error: @Preview on function - 10905248
@Preview
function previewFunction() {
  console.log('Preview function');
  return 'preview';
}

// ============================================
// Test Case 3: @Preview on interface
// ============================================

// Error: @Preview on interface - 10905248
@Preview
interface PreviewInterface {
  title: string;
  render(): void;
}

// ============================================
// Test Case 4: Correct @Preview usage
// ============================================

@Preview
@Component
struct CorrectPreviewComponent {
  @State title: string = 'Preview Component';
  
  build() {
    Column() {
      Text(this.title)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
      
      Text('This component can be previewed')
        .fontSize(14)
        .fontColor(Color.Gray)
    }
    .padding(20)
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct PreviewUsageTestEntry {
  @State testTitle: string = '@Preview Usage Test';

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
      
      // Error information
      Column() {
        Text('Testing: 10905248')
          .fontSize(18)
          .fontColor(Color.Red)
          .fontWeight(FontWeight.Medium)
        
        Text('@Preview on non-struct')
          .fontSize(14)
          .margin(5)
        
        Text('Errors: class, function, interface')
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
        
        Text('@Preview @Component struct MyComponent { ... }')
          .fontSize(12)
          .fontColor(Color.Green)
        
        Text('Must be used with @Component or @ComponentV2')
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
