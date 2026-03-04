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
 * Test case: Struct naming errors
 * Purpose: Verify that struct names cannot conflict with built-in component names
 * Error codes: 10905227
 * 
 * Background:
 * - ArkTS has built-in components like Button, Text, Column, etc.
 * - Custom structs cannot use the same names as these built-in components
 * - This prevents naming conflicts and confusion
 */

// ============================================
// Test Case 1: Struct name conflicts with built-in component
// Expected Error: 10905227
// ============================================

@Entry
@Component
struct Button {
  @State message: string = 'Hello';
  @State isPressed: boolean = false;

  build() {
    Column() {
      Text('Struct Naming Error Test')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
      
      // Error information display
      Column() {
        Text('Error: 10905227')
          .fontSize(20)
          .fontColor(Color.Red)
          .fontWeight(FontWeight.Bold)
        
        Text('Struct name conflicts with built-in component')
          .fontSize(14)
          .margin(5)
        
        Text('Conflicting name: Button')
          .fontSize(14)
          .fontColor(Color.Orange)
      }
      .width('90%')
      .padding(20)
      .backgroundColor('#FFEBEE')
      .margin(10)
      
      // Explanation section
      Column() {
        Text('Reserved Component Names:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
        
        Text('Button, Text, Column, Row, Stack, etc.')
          .fontSize(12)
          .fontColor(Color.Gray)
        
        Text('Cannot be used as custom struct names')
          .fontSize(12)
          .fontColor(Color.Gray)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#E3F2FD')
      .margin(10)
      
      // Message display
      Text(this.message)
        .fontSize(18)
        .margin(10)
      
      // Status
      Row() {
        Text('Status: ')
          .fontSize(14)
        Text(this.isPressed ? 'Pressed' : 'Normal')
          .fontSize(14)
          .fontColor(this.isPressed ? Color.Blue : Color.Gray)
      }
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
