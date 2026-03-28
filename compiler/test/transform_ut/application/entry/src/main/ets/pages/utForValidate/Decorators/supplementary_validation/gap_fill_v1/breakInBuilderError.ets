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
 * Test case: Break statement error in builder
 * Purpose: Verify break statement restrictions within build method
 * Error code: 10905209
 * 
 * Background:
 * - Break statements are not allowed in build method
 * - Control flow statements must follow UI component syntax
 * - This ensures consistent component rendering behavior
 */

@Entry
@Component
struct BreakStatementError {
  @State testTitle: string = 'Break Statement Error Test'
  @State showDetails: boolean = true

  build() {
    Column() {
      // Error: Break statement in build - 10905209
      if (true) {
        break
      }
      
      // Title section
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
        .textAlign(TextAlign.Center)
      
      // Error explanation container
      Column() {
        Text('Break statements are not allowed in build() method')
          .fontSize(16)
          .fontColor(Color.Red)
          .margin(10)
          .textAlign(TextAlign.Center)
        
        Text('Error code: 10905209')
          .fontSize(14)
          .fontColor(Color.Orange)
          .margin(5)
        
        Text('Use conditional rendering instead of break')
          .fontSize(12)
          .fontColor(Color.Gray)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .borderRadius(8)
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .backgroundColor('#F5F5F5')
  }
}

// Alternative implementation struct
@Component
struct ProperControlFlowExample {
  @State condition: boolean = true

  build() {
    Column() {
      Text('Proper Control Flow Example')
        .fontSize(18)
        .fontWeight(FontWeight.Medium)
        .margin(15)
      
      // Correct way to handle conditional rendering
      if (this.condition) {
        Text('Condition is true')
          .fontSize(16)
          .fontColor(Color.Green)
          .margin(10)
      } else {
        Text('Condition is false')
          .fontSize(16)
          .fontColor(Color.Red)
          .margin(10)
      }
    }
    .padding(20)
    .backgroundColor('#E8F5E9')
    .borderRadius(8)
    .margin(10)
  }
}

// Documentation component
@Component
struct BreakStatementDocumentation {
  @State docContent: string = 'Documentation'

  build() {
    Column() {
      Text('Break Statement Restriction')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(15)
      
      Text('The break statement cannot be used in build() method')
        .fontSize(14)
        .margin(10)
      
      Text('Use if/else or ForEach for control flow')
        .fontSize(14)
        .margin(10)
        .fontColor(Color.Blue)
    }
    .width('100%')
    .padding(15)
  }
}
