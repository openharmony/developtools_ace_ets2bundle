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
 * Test case: No child component restriction
 * Purpose: Verify certain components cannot have any children
 * Error code: 10905223
 */

// ============================================
// Test Case 1: Image with children
// Expected Error: 10905223
// ============================================

@Component
struct ImageWithChildren {
  build() {
    Column() {
      // Error: Image cannot have children
      Image($r('app.media.icon'))
        .width(100)
        .height(100) {
        Text('Invalid child')
      }
    }
  }
}

// ============================================
// Test Case 2: TextInput with children
// Expected Error: 10905223
// ============================================

@Component
struct TextInputWithChildren {
  build() {
    Column() {
      // Error: TextInput cannot have children
      TextInput({ placeholder: 'Enter text' }) {
        Button('Invalid')
      }
    }
  }
}

// ============================================
// Test Case 3: Correct usage without children
// ============================================

@Component
struct CorrectNoChildUsage {
  build() {
    Column() {
      // Correct: Image without children
      Image($r('app.media.icon'))
        .width(100)
        .height(100)

      // Correct: TextInput without children
      TextInput({ placeholder: 'Enter text' })
        .width('80%')
    }
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct TestNoChildRestriction {
  @State testTitle: string = 'No Child Restriction Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing: 10905223')
          .fontSize(18)
          .fontColor(Color.Red)

        Text('Component cannot have any child')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('Components with no children:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('Image - displays images')
          .fontSize(12)
          .margin(2)

        Text('TextInput - input field')
          .fontSize(12)
          .margin(2)

        Text('Button - action button')
          .fontSize(12)
          .margin(2)

        Text('Text - text display')
          .fontSize(12)
          .margin(2)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .margin(10)

      Column() {
        Text('Correct Usage:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)

        Text('Image($r("app.media.icon"))')
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
