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
 * Test case: V2 component reuse without parameters
 * Purpose: Verify @ComponentReuse in V2 cannot have input parameters
 * Error code: 10905370
 */

// ============================================
// Test Case 1: @ComponentReuse with parameters in V2
// Expected Error: 10905370
// ============================================

@ComponentV2
struct ReuseV2WithParams {
  @Param data: string = ''

  // Error: @ComponentReuse in V2 cannot have parameters
  @ComponentReuse
  aboutToReuse(params: Record<string, Object | null | undefined>, extra: string) {
    console.log('Reusing with params')
  }

  build() {
    Column() {
      Text(this.data)
    }
  }
}

// ============================================
// Test Case 2: Correct V2 @ComponentReuse without parameters
// ============================================

@ComponentV2
struct CorrectV2Reuse {
  @Param content: string = ''

  // Correct: No parameters in V2
  @ComponentReuse
  aboutToReuse() {
    console.log('Reusing without params')
  }

  build() {
    Column() {
      Text(this.content)
    }
  }
}

// ============================================
// Test Case 3: V1 @ComponentReuse with parameters (correct for V1)
// ============================================

@Component
struct V1ReuseWithParams {
  @State value: string = ''

  // V1 can have parameters
  @ComponentReuse
  aboutToReuse(params: Record<string, Object | null | undefined>) {
    console.log('V1 reusing')
  }

  build() {
    Column() {
      Text(this.value)
    }
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct TestV2ReuseParams {
  @State testTitle: string = 'V2 @ComponentReuse Params Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing: 10905370')
          .fontSize(18)
          .fontColor(Color.Red)

        Text('V2 @ComponentReuse cannot have parameters')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('V1 vs V2 Difference:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('V1: can have params parameter')
          .fontSize(12)
          .fontColor(Color.Blue)
          .margin(2)

        Text('V2: cannot have any parameters')
          .fontSize(12)
          .fontColor(Color.Red)
          .margin(2)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .margin(10)

      Column() {
        Text('Correct V2 Usage:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)

        Text('@ComponentReuse\naboutToReuse() { ... }')
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
