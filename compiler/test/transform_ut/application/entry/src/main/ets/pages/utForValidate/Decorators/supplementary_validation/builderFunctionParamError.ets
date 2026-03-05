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
 * Test case: @Builder function parameter error
 * Purpose: Verify @Builder function parameter restrictions
 * Error codes: 10905103
 */

// ============================================
// Test Case 1: @Builder function with parameters
// Expected Error: 10905103
// ============================================

// Error: @Builder with parameters - 10905103
@Builder
function builderWithParams(value: string) {
  Column() {
    Text(value);
  }
}

// ============================================
// Test Case 2: @Builder with multiple parameters
// ============================================

@Builder
function anotherBuilderWithParams(name: string, age: number) {
  Column() {
    Text(name + " - " + age);
  }
}

// ============================================
// Test Case 3: Correct @Builder without parameters
// ============================================

@Builder
function correctBuilderNoParams() {
  Column() {
    Text("No Parameters");
  }
}

@Component
struct CorrectBuilderUsage {
  build() {
    Column() {
      correctBuilderNoParams();
    }
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct BuilderParamErrorEntry {
  @State testTitle: string = "@Builder Param Test";

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20);
      
      // Error information
      Column() {
        Text("Testing: 10905103")
          .fontSize(18)
          .fontColor(Color.Red);
        
        Text("@Builder function cannot have parameters")
          .fontSize(14)
          .margin(5);
      }
      .width("90%")
      .padding(15)
      .backgroundColor("#FFF3E0")
      .margin(10);
      
      // Rules
      Column() {
        Text("Rules:")
          .fontSize(16)
          .fontWeight(FontWeight.Bold);
        
        Text("✓ @Builder function myBuilder() { ... }")
          .fontSize(12)
          .fontColor(Color.Green);
        
        Text("✗ @Builder function myBuilder(value: string)")
          .fontSize(12)
          .fontColor(Color.Red);
      }
      .width("90%")
      .padding(10)
      .backgroundColor("#E8F5E9")
      .margin(10);
    }
    .width("100%")
    .height("100%")
    .backgroundColor(Color.White);
  }
}
