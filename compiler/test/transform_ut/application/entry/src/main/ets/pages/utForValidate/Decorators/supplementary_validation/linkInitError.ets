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
 * Test case: Link variable initialization error
 * Purpose: Verify @Link property must be initialized with $ variable
 * Error code: 10905323
 */

// ============================================
// Test Case 1: @Link with regular value
// Expected Error: 10905323
// ============================================

@Component
struct LinkWithRegularValue {
  @Link linkValue: number = 10

  build() {
    Column() {
      Text('Value: ' + this.linkValue)
    }
  }
}

// ============================================
// Test Case 2: @Link with wrong initialization
// Expected Error: 10905323
// ============================================

@Component
struct LinkWrongInit {
  @Link wrongLink: string = 'invalid'

  build() {
    Column() {
      Text(this.wrongLink)
    }
  }
}

// ============================================
// Test Case 3: Correct @Link usage (parent provides $ variable)
// ============================================

@Component
struct ChildWithLink {
  @Link linkValue: number

  build() {
    Column() {
      Text('Linked: ' + this.linkValue)
    }
  }
}

@Entry
@Component
struct TestLinkInitError {
  @State testTitle: string = '@Link Init Error Test'
  @State parentValue: number = 100

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing: 10905323')
          .fontSize(18)
          .fontColor(Color.Red)

        Text('@Link must be initialized with $ variable')
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

        Text('Child({ value: $parentValue })')
          .fontSize(12)
          .fontColor(Color.Green)

        Text('// Child uses @Link value')
          .fontSize(12)
          .fontColor(Color.Gray)
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
