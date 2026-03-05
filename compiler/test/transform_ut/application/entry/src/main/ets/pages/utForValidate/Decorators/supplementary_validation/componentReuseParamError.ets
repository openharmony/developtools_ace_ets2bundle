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
 * Test case: Component reuse parameter type error
 * Purpose: Verify @ComponentReuse decorator parameter type restrictions
 * Error code: 10905360
 */

// ============================================
// Test Case 1: @ComponentReuse with invalid parameter type
// Expected Error: 10905360
// ============================================

@Component
struct ReuseParamTypeError {
  // Error: Invalid parameter type for @ComponentReuse
  @ComponentReuse reuseFunc(params: string) {
    return params
  }

  build() {
    Column() {
      Text('Component Reuse Test')
    }
  }
}

// ============================================
// Test Case 2: @ComponentReuse with array parameter
// Expected Error: 10905360
// ============================================

@Component
struct ReuseArrayParam {
  @ComponentReuse reuseWithArray(arr: number[]) {
    return arr
  }

  build() {
    Column() {
      Text('Array Param Test')
    }
  }
}

// ============================================
// Test Case 3: Correct @ComponentReuse usage
// ============================================

@Component
struct CorrectReuseUsage {
  // Correct: params parameter with Record type
  @ComponentReuse aboutToReuse(params: Record<string, Object | null | undefined>) {
    console.log('Reusing component')
  }

  build() {
    Column() {
      Text('Correct Reuse')
    }
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct TestReuseParamError {
  @State testTitle: string = '@ComponentReuse Param Error Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing: 10905360')
          .fontSize(18)
          .fontColor(Color.Red)

        Text('@ComponentReuse parameter type not supported')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('Correct Usage:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)

        Text('@ComponentReuse')
          .fontSize(12)
          .fontColor(Color.Green)

        Text('aboutToReuse(params: Record<string, Object | null | undefined>)')
          .fontSize(12)
          .fontColor(Color.Green)
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
