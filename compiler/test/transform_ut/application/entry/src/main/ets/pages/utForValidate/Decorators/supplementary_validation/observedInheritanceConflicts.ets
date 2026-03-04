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
 * Test case: Observed inheritance conflicts
 * Purpose: Verify that classes cannot be decorated with both @Observed and @ObservedV2
 * Error codes: 10905226
 * 
 * Background:
 * - @Observed is used for V1 state management (interoperability with @ObjectLink)
 * - @ObservedV2 is used for V2 state management (deep observation)
 * - These two decorators are mutually exclusive
 */

// ============================================
// Test Case 1: Class with both @Observed and @ObservedV2
// Expected Error: 10905226
// ============================================

// Error: Class cannot be decorated by @Observed and @ObservedV2 - 10905226
@Observed
@ObservedV2
class ObservedBothDecorators {
  name: string = 'test';
  age: number = 25;
  
  constructor() {
    this.name = 'default';
    this.age = 0;
  }
}

// ============================================
// Test Case 2: Using the conflicted class in V2 component
// This struct uses the class that has conflicting decorators
// ============================================

@ComponentV2
struct TestObservedInheritance {
  @Local both: ObservedBothDecorators = new ObservedBothDecorators();
  @Local count: number = 0;

  build() {
    Column() {
      Text('Test Observed Inheritance')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
      
      Text(`Name: ${this.both.name}`)
        .fontSize(16)
      
      Text(`Age: ${this.both.age}`)
        .fontSize(16)
      
      Button('Update')
        .onClick(() => {
          this.count++;
        })
    }
    .width('100%')
    .padding(20)
  }
}

// ============================================
// Test Case 3: Another struct using the conflicted class
// Demonstrates the issue is consistent across multiple usages
// ============================================

@ComponentV2
struct AnotherTestStruct {
  @Local data: ObservedBothDecorators = new ObservedBothDecorators();
  
  build() {
    Row() {
      Text('Another Test')
        .fontSize(18)
      
      Column() {
        Text(this.data.name)
      }
    }
  }
}

// ============================================
// Test Case 4: Regular class without decorators for comparison
// This class should work fine without any decorator conflicts
// ============================================

class RegularClass {
  value: string = 'normal';
  
  getValue(): string {
    return this.value;
  }
}

// ============================================
// Entry point for the test page
// This struct serves as the test container
// ============================================

@Entry
@Component
struct ObservedInheritanceTestEntry {
  build() {
    Column() {
      Text('Observed Inheritance Test Page')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
      
      // Display test information
      Column() {
        Text('Testing: 10905226')
          .fontSize(14)
          .fontColor(Color.Gray)
        
        Text('Error: Class cannot use both @Observed and @ObservedV2')
          .fontSize(12)
          .fontColor(Color.Gray)
      }
      .margin(10)
      
      // Placeholder for test content
      Stack() {
        Text('Test Content Area')
          .fontSize(16)
          .fontColor(Color.Gray)
      }
      .width('100%')
      .height(200)
      .backgroundColor('#F5F5F5')
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
