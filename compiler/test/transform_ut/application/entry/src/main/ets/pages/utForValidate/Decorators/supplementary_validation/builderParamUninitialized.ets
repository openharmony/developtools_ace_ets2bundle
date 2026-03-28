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
 * Test case: @BuilderParam uninitialized error
 * Purpose: Verify @BuilderParam must be initialized
 * Error codes: 10905104
 */

// ============================================
// Test Case 1: @BuilderParam without initialization
// Expected Error: 10905104
// ============================================

@Component
struct TestBuilderParamUninitialized {
  // Error: @BuilderParam must be initialized - 10905104
  @BuilderParam myBuilder: () => void;

  build() {
    Column() {
      Text("Error: Uninitialized BuilderParam");
    }
  }
}

// ============================================
// Test Case 2: @BuilderParam with noBuild function without initialization
// ============================================

@Component
struct AnotherBuilderParamTest {
  // Error: @BuilderParam requires initialization - 10905104
  @BuilderParam customBuilderParam: () => void;
  @State message: string = "test";

  build() {
    Column() {
      if (this.customBuilderParam) {
        this.customBuilderParam();
      }
    }
  }
}

// ============================================
// Test Case 3: @BuilderParam with multiple uninitialized params
// ============================================

@Component
struct MultipleBuilderParamTest {
  // Error: Both @BuilderParam must be initialized - 10905104
  @BuilderParam builder1: () => void;
  @BuilderParam builder2: () => void;

  build() {
    Column() {
      this.builder1();
      this.builder2();
    }
  }
}

// ============================================
// Test Case 4: Correct @BuilderParam initialization
// ============================================

@Builder
function defaultBuilder(): void {
  Column() {
    Text("Default Builder");
  }
}

@Component
struct CorrectBuilderParamUsage {
  // Correct: @BuilderParam with initialization
  @BuilderParam myBuilder: () => void = defaultBuilder;

  build() {
    Column() {
      this.myBuilder();
    }
  }
}

@Component
struct BuilderParamUninitializedTest {
  @State message: string = "BuilderParam Test";

  build() {
    Column() {
      Text("@BuilderParam Initialization Test")
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(20);

      // Error information
      Column() {
        Text("Testing: 10905104")
          .fontSize(18)
          .fontColor(Color.Red);

        Text("@BuilderParam must be initialized")
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

        Text("✓ @BuilderParam builder: () => void = defaultBuilder")
          .fontSize(12)
          .fontColor(Color.Green);

        Text("✗ @BuilderParam builder: () => void (no init)")
          .fontSize(12)
          .fontColor(Color.Red);

        Text("Note: Must provide default value or initialization")
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
struct BuilderParamUninitializedEntry {
  build() {
    Column() {
      BuilderParamUninitializedTest();
    }
  }
}
