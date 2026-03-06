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
 * Test case: Single child component restriction
 * Purpose: Verify certain components can only have one child
 * Error code: 10905221
 */

// ============================================
// Test Case 1: Navigator with multiple children
// Expected Error: 10905221
// ============================================

@Component
struct NavigatorMultipleChildren {
  build() {
    Column() {
      // Error: Navigator can only have one child
      Navigator() {
        Text('Child 1')
        Text('Child 2')
      }
      .target('pages/Index')
    }
  }
}

// ============================================
// Test Case 2: Refresh with multiple children
// Expected Error: 10905221
// ============================================

@Component
struct RefreshMultipleChildren {
  @State isRefreshing: boolean = false

  build() {
    Column() {
      // Error: Refresh can only have one child
      Refresh({ refreshing: this.isRefreshing }) {
        Text('Item 1')
        Text('Item 2')
      }
    }
  }
}

// ============================================
// Test Case 3: Correct single child usage
// ============================================

@Component
struct CorrectSingleChild {
  @State isRefreshing: boolean = false

  build() {
    Column() {
      // Correct: Navigator with single child
      Navigator() {
        Column() {
          Text('Single Child')
        }
      }
      .target('pages/Index')

      // Correct: Refresh with single child
      Refresh({ refreshing: this.isRefreshing }) {
        List() {
          ListItem() { Text('Item') }
        }
      }
    }
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct TestSingleChildRestriction {
  @State testTitle: string = 'Single Child Restriction Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing: 10905221')
          .fontSize(18)
          .fontColor(Color.Red)

        Text('Component can only have one child')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('Components with single child only:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('Navigator - navigation target')
          .fontSize(12)
          .margin(2)

        Text('Refresh - pull to refresh')
          .fontSize(12)
          .margin(2)

        Text('Scroll - scrollable container')
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

        Text('Navigator() {\n  Column() { ... }\n}')
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
