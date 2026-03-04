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
 * Test case: UI build errors
 * Purpose: Verify Button component with label cannot have children
 * Error codes: 10905202
 * 
 * Background:
 * - Button component can be used with or without label parameter
 * - When label parameter is provided, Button cannot have child components
 * - This ensures consistent Button usage patterns
 */

// ============================================
// Test Case 1: Button with label and children
// Expected Error: 10905202
// ============================================

@Entry
@Component
struct ButtonWithLabelAndChildren {
  @State buttonLabel: string = 'Click me';
  @State isEnabled: boolean = true;

  build() {
    Column() {
      // Header section
      Text('UI Build Error Test')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
      
      // Error demonstration
      // Error: Button with label cannot have children - 10905202
      Button('Click me') {
        // This child component causes the error
        Text('Child text')
          .fontSize(14)
          .fontColor(Color.White)
      }
      .width(200)
      .height(50)
      
      // Explanation section
      Column() {
        Text('Error: 10905202')
          .fontSize(18)
          .fontColor(Color.Red)
          .fontWeight(FontWeight.Bold)
        
        Text('Button with label cannot have children')
          .fontSize(14)
          .margin(5)
        
        Text('Correct usage:')
          .fontSize(12)
          .fontColor(Color.Green)
        
        Text('Button(\"Label\")  // without children')
          .fontSize(12)
          .fontColor(Color.Green)
        
        Text('// OR')
          .fontSize(12)
          .fontColor(Color.Gray)
        
        Text('Button() { Text(\"Content\") }  // without label')
          .fontSize(12)
          .fontColor(Color.Green)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)
      
      // Status display
      Row() {
        Text('Button State: ')
          .fontSize(14)
        Text(this.isEnabled ? 'Enabled' : 'Disabled')
          .fontSize(14)
          .fontColor(this.isEnabled ? Color.Green : Color.Gray)
      }
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
