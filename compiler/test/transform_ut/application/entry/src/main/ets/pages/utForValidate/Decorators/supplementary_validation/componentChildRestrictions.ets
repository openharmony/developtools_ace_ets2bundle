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
 * Test case: Component child restrictions
 * Purpose: Verify certain components can only have specific child components
 * Error code: 10905219
 */

// ============================================
// Test Case 1: Component with invalid child
// Expected Error: 10905219
// ============================================

@Component
struct InvalidChildComponent {
  build() {
    Column() {
      // Example: Certain components can only have specific children
      // For instance, GridItem should only be inside Grid
      GridItem() {
        // Error: GridItem as root child
        Text('Invalid placement')
      }
    }
  }
}

// ============================================
// Test Case 2: ListItem outside List
// Expected Error: 10905219
// ============================================

@Component
struct ListItemOutsideList {
  build() {
    Column() {
      // Error: ListItem should only be inside List
      ListItem() {
        Text('This should be in a List')
      }
    }
  }
}

// ============================================
// Test Case 3: TabContent outside Tabs
// Expected Error: 10905219
// ============================================

@Component
struct TabContentOutsideTabs {
  build() {
    Column() {
      // Error: TabContent should only be inside Tabs
      TabContent() {
        Column() {
          Text('Tab Content')
        }
      }
      .tabBar('Tab 1')
    }
  }
}

// ============================================
// Test Case 4: Correct usage of specialized children
// ============================================

@Component
struct CorrectChildUsage {
  @State items: string[] = ['Item 1', 'Item 2', 'Item 3']

  build() {
    Column() {
      // Correct: GridItem inside Grid
      Grid() {
        GridItem() {
          Text('Grid Item 1')
        }

        GridItem() {
          Text('Grid Item 2')
        }
      }
      .columnsTemplate('1fr 1fr')
      .height(200)

      // Correct: ListItem inside List
      List() {
        ForEach(this.items, (item: string) => {
          ListItem() {
            Text(item)
              .fontSize(16)
              .padding(10)
          }
        })
      }
      .height(200)

      // Correct: TabContent inside Tabs
      Tabs() {
        TabContent() {
          Column() {
            Text('Tab 1 Content')
          }
        }
        .tabBar('Tab 1')

        TabContent() {
          Column() {
            Text('Tab 2 Content')
          }
        }
        .tabBar('Tab 2')
      }
      .height(200)
    }
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct TestChildRestrictions {
  @State testTitle: string = 'Component Child Restrictions Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      // Error information
      Column() {
        Text('Testing: 10905219')
          .fontSize(18)
          .fontColor(Color.Red)

        Text('Component can only have specific child components')
          .fontSize(14)
          .margin(5)
          .textAlign(TextAlign.Center)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      // Rules
      Column() {
        Text('Child Component Rules:',)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('GridItem → Must be inside Grid')
          .fontSize(12)
          .margin(2)

        Text('ListItem → Must be inside List')
          .fontSize(12)
          .margin(2)

        Text('TabContent → Must be inside Tabs')
          .fontSize(12)
          .margin(2)

        Text('Navigator → Must be inside certain containers')
          .fontSize(12)
          .margin(2)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .margin(10)

      // Examples
      Column() {
        Text('Correct Hierarchy:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)

        Text('Grid { GridItem { ... } }')
          .fontSize(12)
          .fontColor(Color.Green)
          .margin(2)

        Text('List { ListItem { ... } }')
          .fontSize(12)
          .fontColor(Color.Green)
          .margin(2)

        Text('Tabs { TabContent { ... } }')
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
