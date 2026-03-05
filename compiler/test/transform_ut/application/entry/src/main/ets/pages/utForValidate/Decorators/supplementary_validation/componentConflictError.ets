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
 * Test case: @ComponentV2 and @Component conflict
 * Purpose: Verify @ComponentV2 and @Component cannot be used together
 * Error codes: 10905116
 */

// ============================================
// Test Case 1: Both @Component and @ComponentV2
// Expected Error: 10905116
// ============================================

// Error: Cannot use both @Component and @ComponentV2 - 10905116
@Component
@ComponentV2
struct ConflictingComponent {
  @State message: string = "error";

  build() {
    Column() {
      Text("Conflicting decorators");
    }
  }
}

// ============================================
// Test Case 2: @ComponentV2 with @Component style state
// ============================================

// Error: @ComponentV2 with incompatible state decorator - 10905116
@ComponentV2
struct V2WithV1State {
  @State oldStyle: string = "error"; // @State is for @Component

  build() {
    Column() {
      Text("Mixed state decorators");
    }
  }
}

// ============================================
// Test Case 3: @Component with @ComponentV2 style state
// ============================================

// Error: @Component with @ComponentV2 state - 10905116
@Component
struct V1WithV2State {
  @Local v2Style: string = "error"; // @Local is for @ComponentV2

  build() {
    Column() {
      Text("Mixed state decorators");
    }
  }
}

// ============================================
// Test Case 4: Correct @Component usage
// ============================================

@Component
struct CorrectV1Component {
  @State message: string = "correct";
  @Prop childMessage: string = "";

  build() {
    Column() {
      Text("Correct V1 Component");
    }
  }
}

// ============================================
// Test Case 5: Correct @ComponentV2 usage
// ============================================

@ComponentV2
struct CorrectV2Component {
  @Local localState: string = "correct";
  @Param paramValue: number = 0;

  build() {
    Column() {
      Text("Correct V2 Component");
    }
  }
}

@Component
struct ComponentConflictTest {
  @State message: string = "Component Conflict Test";

  build() {
    Column() {
      Text("@ComponentV2 / @Component Conflict Test")
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(20);

      // Error information
      Column() {
        Text("Testing: 10905116")
          .fontSize(18)
          .fontColor(Color.Red);

        Text("@ComponentV2 and @Component conflict")
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

        Text("✓ @Component with @State, @Prop, @Link")
          .fontSize(12)
          .fontColor(Color.Green);

        Text("✓ @ComponentV2 with @Local, @Param, @Event")
          .fontSize(12)
          .fontColor(Color.Green);

        Text("✗ @Component + @ComponentV2 on same struct")
          .fontSize(12)
          .fontColor(Color.Red);

        Text("✗ Mixed @State with @Local decorators")
          .fontSize(12)
          .fontColor(Color.Red);

        Text("Note: Choose one component model, do not mix")
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
struct ComponentConflictEntry {
  build() {
    Column() {
      ComponentConflictTest();
    }
  }
}
