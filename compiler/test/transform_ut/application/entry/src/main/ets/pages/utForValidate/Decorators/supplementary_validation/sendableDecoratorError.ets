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
 * Test case: @Sendable decorator error
 * Purpose: Verify @Sendable decorator usage restrictions
 * Error codes: 10905114
 */

// ============================================
// Test Case 1: @Sendable class with non-sendable property
// Expected Error: 10905114
// ============================================

// Error: @Sendable class has non-sendable property - 10905114
@Sendable
class InvalidSendableClass {
  name: string = "test";
  callback: () => void = () => {}; // Functions are not sendable
}

// ============================================
// Test Case 2: @Sendable class with circular reference
// ============================================

// Error: @Sendable class cannot have circular references - 10905114
@Sendable
class CircularSendable {
  value: number = 0;
  self?: CircularSendable;
}

// ============================================
// Test Case 3: @Sendable with unsupported types
// ============================================

// Error: @Sendable with Symbol type - 10905114
@Sendable
class SymbolSendable {
  id: number = 1;
  sym: symbol = Symbol("test");
}

// ============================================
// Test Case 4: Correct @Sendable usage
// ============================================

@Sendable
class CorrectSendable {
  id: number = 0;
  name: string = "";
  items: number[] = [];
}

@Sendable
class AnotherCorrectSendable {
  data: string = "";
  count: number = 0;
  valid: boolean = true;
}

@Component
struct SendableDecoratorTest {
  @State message: string = "Sendable Test";

  build() {
    Column() {
      Text("@Sendable Decorator Test")
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(20);

      // Error information
      Column() {
        Text("Testing: 10905114")
          .fontSize(18)
          .fontColor(Color.Red);

        Text("@Sendable usage restrictions")
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

        Text("✓ @Sendable class { primitiveTypes: number, string, boolean, array }")
          .fontSize(12)
          .fontColor(Color.Green);

        Text("✗ @Sendable with functions or methods")
          .fontSize(12)
          .fontColor(Color.Red);

        Text("✗ @Sendable with Symbol, BigInt, or circular refs")
          .fontSize(12)
          .fontColor(Color.Red);

        Text("✗ @Sendable with Date, RegExp, Map, Set")
          .fontSize(12)
          .fontColor(Color.Red);

        Text("Note: Must be serializable for cross-thread communication")
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
struct SendableDecoratorEntry {
  build() {
    Column() {
      SendableDecoratorTest();
    }
  }
}
