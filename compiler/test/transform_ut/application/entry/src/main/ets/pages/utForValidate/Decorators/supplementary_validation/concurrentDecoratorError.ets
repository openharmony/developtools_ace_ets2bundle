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
 * Test case: @Concurrent decorator error
 * Purpose: Verify @Concurrent decorator usage restrictions
 * Error codes: 10905113
 */

// ============================================
// Test Case 1: @Concurrent on function accessing UI state
// Expected Error: 10905113
// ============================================

let globalCounter: number = 0;

// Error: @Concurrent function cannot access UI state - 10905113
@Concurrent
function concurrentAccessingUIState(): void {
  // Cannot access component state here
  console.log("Attempting to access UI");
}

// ============================================
// Test Case 2: @Concurrent with return of non-serializable data
// ============================================

// Error: @Concurrent return type must be serializable - 10905113
@Concurrent
function concurrentWithInvalidReturn(): object {
  return { circular: {} };
}

// ============================================
// Test Case 3: @Concurrent function with UI component reference
// ============================================

// Error: @Concurrent cannot reference UI components - 10905113
@Concurrent
function concurrentWithUIRef(): void {
  let component = { type: "UI" };
  console.log(component);
}

// ============================================
// Test Case 4: Correct @Concurrent usage
// ============================================

@Concurrent
function correctConcurrentFunction(a: number, b: number): number {
  return a + b;
}

@Concurrent
async function correctAsyncConcurrent(): Promise<number> {
  return Promise.resolve(42);
}

@Component
struct ConcurrentDecoratorTest {
  @State message: string = "Concurrent Test";
  @State result: number = 0;

  build() {
    Column() {
      Text("@Concurrent Decorator Test")
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(20);

      // Error information
      Column() {
        Text("Testing: 10905113")
          .fontSize(18)
          .fontColor(Color.Red);

        Text("@Concurrent usage restrictions")
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

        Text("✓ @Concurrent function(params): serializableReturn { ... }")
          .fontSize(12)
          .fontColor(Color.Green);

        Text("✗ @Concurrent accessing @State or component properties")
          .fontSize(12)
          .fontColor(Color.Red);

        Text("✗ @Concurrent returning non-serializable objects")
          .fontSize(12)
          .fontColor(Color.Red);

        Text("✗ @Concurrent referencing UI components")
          .fontSize(12)
          .fontColor(Color.Red);

        Text("Note: Run in separate thread, no UI access allowed")
          .fontSize(12)
          .margin(5);
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
struct ConcurrentDecoratorEntry {
  build() {
    Column() {
      ConcurrentDecoratorTest();
    }
  }
}
