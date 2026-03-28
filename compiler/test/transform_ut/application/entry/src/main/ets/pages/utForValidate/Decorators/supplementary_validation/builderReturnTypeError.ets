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
 * Test case: @Builder return type error
 * Purpose: Verify @Builder function must return void
 * Error codes: 10905102
 */

// ============================================
// Test Case 1: @Builder function with return value
// Expected Error: 10905102
// ============================================

// Error: @Builder function returns string - 10905102
@Builder
function builderWithReturn(): string {
  return "invalid return";
}

// ============================================
// Test Case 2: @Builder with number return
// ============================================

@Builder
function anotherBuilderWithReturn(): number {
  return 123;
}

// ============================================
// Test Case 3: Correct @Builder usage
// ============================================

@Builder
function correctBuilder(): void {
  Column() {
    Text("Correct Builder");
  }
}

@Component
struct BuilderReturnTypeTest {
  @State message: string = "Test";

  build() {
    Column() {
      Text("@Builder Return Type Test")
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(20);
      
      // Error information
      Column() {
        Text("Testing: 10905102")
          .fontSize(18)
          .fontColor(Color.Red);
        
        Text("@Builder function must return void")
          .fontSize(14)
          .margin(5);
      }
      .width("90%")
      .padding(15)
      .backgroundColor("#FFEBEE")
      .margin(10);
      
      // Rules section
      Column() {
        Text("Rules:")
          .fontSize(16)
          .fontWeight(FontWeight.Bold);
        
        Text("✓ @Builder function(): void { ... }")
          .fontSize(12)
          .fontColor(Color.Green);
        
        Text("✗ @Builder function(): string { ... }")
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

@Entry
@Component
struct BuilderReturnTypeEntry {
  build() {
    Column() {
      BuilderReturnTypeTest();
    }
  }
}
