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
 * Test case: @BuilderParam initialization error
 * Purpose: Verify @BuilderParam must be initialized with @Builder function
 * Error code: 10905107
 */

// ============================================
// Test Case 1: @BuilderParam with regular function
// Expected Error: 10905107
// ============================================

// Regular function (not @Builder)
function regularFunction() {
  console.log('Not a builder')
}

@Builder
function validBuilder() {
  Column() {
    Text('Valid Builder')
  }
}

@Component
struct BuilderParamInitError {
  // Error: @BuilderParam must be initialized with @Builder function
  @BuilderParam builderParam: () => void = regularFunction

  build() {
    Column() {
      Text('BuilderParam Test')
        .fontSize(16)
    }
  }
}

// ============================================
// Test Case 2: @BuilderParam with method reference
// Expected Error: 10905107
// ============================================

@Component
struct BuilderParamMethodError {
  myMethod() {
    console.log('Regular method')
  }

  // Error: @BuilderParam must be initialized with @Builder function
  @BuilderParam builderWithMethod: () => void = this.myMethod

  build() {
    Column() {
      Text('Method Test')
    }
  }
}

// ============================================
// Test Case 3: Correct @BuilderParam usage
// ============================================

@Component
struct CorrectBuilderParamUsage {
  // Correct: Initialized with @Builder function
  @BuilderParam builderParam: () => void = validBuilder

  build() {
    Column() {
      this.builderParam()
    }
  }
}

// ============================================
// Test Case 4: @BuilderParam with inline function
// Expected Error: 10905107
// ============================================

@Component
struct BuilderParamInlineError {
  // Error: @BuilderParam initialized with inline arrow function
  @BuilderParam inlineBuilder: () => void = () => {
    Column() {
      Text('Inline')
    }
  }

  build() {
    Column() {
      Text('Inline Test')
    }
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct TestBuilderParamInitError {
  @State testTitle: string = '@BuilderParam Init Error Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      // Error information
      Column() {
        Text('Testing: 10905107')
          .fontSize(18)
          .fontColor(Color.Red)

        Text('@BuilderParam must be initialized with @Builder function')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      // Rules
      Column() {
        Text('Rules:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('@BuilderParam can only use @Builder functions')
          .fontSize(12)
          .fontColor(Color.Red)
          .margin(2)

        Text('Regular functions are not allowed')
          .fontSize(12)
          .fontColor(Color.Red)
          .margin(2)

        Text('Inline functions are not allowed')
          .fontSize(12)
          .fontColor(Color.Red)
          .margin(2)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .margin(10)

      // Examples
      Column() {
        Text('Correct Usage:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)

        Text('@Builder\nfunction myBuilder() { ... }')
          .fontSize(12)
          .fontColor(Color.Green)
          .margin(2)

        Text('@BuilderParam builder: () => void = myBuilder')
          .fontSize(12)
          .fontColor(Color.Green)
          .margin(2)
      }
      .width('90%')
      .padding(10)
      .backgroundColor('#E8F5E9')
      .margin(5)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
