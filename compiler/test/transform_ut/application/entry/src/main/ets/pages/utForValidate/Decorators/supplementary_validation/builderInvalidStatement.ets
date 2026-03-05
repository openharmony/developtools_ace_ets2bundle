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
 * Test case: @Builder invalid statement error
 * Purpose: Verify @Builder function internal statement restrictions
 * Error codes: 10905106
 */

// ============================================
// Test Case 1: @Builder with console.log
// Expected Error: 10905106
// ============================================

// Error: @Builder cannot contain console.log - 10905106
@Builder
function builderWithConsole(): void {
  console.log("Invalid statement in builder");
  Column() {
    Text("Invalid");
  }
}

// ============================================
// Test Case 2: @Builder with variable declaration
// ============================================

// Error: @Builder cannot declare variables - 10905106
@Builder
function builderWithVariable(): void {
  let invalidVar: string = "not allowed";
  Column() {
    Text(invalidVar);
  }
}

// ============================================
// Test Case 3: @Builder with if statement outside component
// ============================================

// Error: @Builder cannot have standalone if - 10905106
@Builder
function builderWithStandaloneIf(condition: boolean): void {
  if (condition) {
    Column() {
      Text("Standalone If");
    }
  }
}

// ============================================
// Test Case 4: Correct @Builder usage
// ============================================

@Builder
function correctBuilderNoStatements(): void {
  Column() {
    Text("Correct Builder 1");
    Button("Click");
  }
}

@Builder
function correctBuilderWithComponentIf(condition: boolean): void {
  Column() {
    if (condition) {
      Text("Conditional Text");
    }
    Text("Always shown");
  }
}

@Component
struct BuilderInvalidStatementTest {
  @State message: string = "Builder Statement Test";
  @State showCondition: boolean = true;

  build() {
    Column() {
      Text("@Builder Invalid Statement Test")
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(20);

      // Error information
      Column() {
        Text("Testing: 10905106")
          .fontSize(18)
          .fontColor(Color.Red);

        Text("@Builder invalid internal statements")
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

        Text("✓ @Builder function(): void { Component() { ... } }")
          .fontSize(12)
          .fontColor(Color.Green);

        Text("✗ @Builder with console.log, console.info, etc.")
          .fontSize(12)
          .fontColor(Color.Red);

        Text("✗ @Builder with variable declarations")
          .fontSize(12)
          .fontColor(Color.Red);

        Text("✗ @Builder with standalone control flow")
          .fontSize(12)
          .fontColor(Color.Red);

        Text("Note: Only UI component declarations allowed inside @Builder")
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
struct BuilderInvalidStatementEntry {
  build() {
    Column() {
      BuilderInvalidStatementTest();
    }
  }
}
