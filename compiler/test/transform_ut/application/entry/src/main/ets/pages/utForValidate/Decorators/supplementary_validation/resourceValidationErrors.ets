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
 * Test case: Resource validation errors
 * Purpose: Verify resource references use valid source, type, and name
 * Error codes: 10903331
 * 
 * Background:
 * - ArkTS supports resource references using $r() syntax
 * - Valid format: $r('app.type.name')
 * - Unknown source, type, or name will trigger validation errors
 * - This test verifies the compiler correctly identifies invalid resource references
 */

// ============================================
// Test Case 1: Unknown resource source
// Expected Error: 10903331
// ============================================

@Entry
@Component
struct ResourceValidationErrors {
  // Unknown resource source - 10903331
  @State invalidSrc: Resource = $r('unknown.color.test');
  @State anotherInvalid: Resource = $r('invalid.media.icon');
  @State thirdInvalid: Resource = $r('wrong.type.name');

  build() {
    Column() {
      Text('Resource Validation Test')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
      
      // Display invalid resource usage
      Column() {
        Text('Testing Invalid Resource:')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
        
        Text('Source: unknown')
          .fontSize(14)
          .fontColor(this.invalidSrc)
        
        Text('Expected Error: 10903331')
          .fontSize(12)
          .fontColor(Color.Gray)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .margin(10)
      
      // Explanation section
      Column() {
        Text('Valid Resource Format:')
          .fontSize(14)
          .fontWeight(FontWeight.Bold)
        
        Text("$r('app.color.primary')")
          .fontSize(12)
          .fontColor(Color.Gray)
        
        Text("$r('app.media.icon')")
          .fontSize(12)
          .fontColor(Color.Gray)
        
        Text("$r('app.string.title')")
          .fontSize(12)
          .fontColor(Color.Gray)
      }
      .margin(10)
      
      // Additional information
      Column() {
        Text('Resource Components:')
          .fontSize(14)
          .fontWeight(FontWeight.Bold)
          .margin(5)
        
        Text('1. Source: app (application resources)')
          .fontSize(12)
          .fontColor(Color.Gray)
        
        Text('2. Type: color, media, string, etc.')
          .fontSize(12)
          .fontColor(Color.Gray)
        
        Text('3. Name: resource identifier')
          .fontSize(12)
          .fontColor(Color.Gray)
      }
      .width('90%')
      .padding(10)
      .backgroundColor('#E3F2FD')
      .margin(10)
      
      // Test status
      Row() {
        Text('Test Status: ')
          .fontSize(14)
        Text('Validating...')
          .fontSize(14)
          .fontColor(Color.Orange)
      }
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
