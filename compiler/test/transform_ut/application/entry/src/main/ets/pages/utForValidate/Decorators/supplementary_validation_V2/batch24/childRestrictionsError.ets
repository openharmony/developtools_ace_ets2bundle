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
 * Component child node restriction errors.
 */

// --- Error Cases ---

// Error 10905219: Grid with non-GridItem child
@Component
struct GridWithError {
  build() {
    Grid() { Text("Not a GridItem") }
  }
}

// --- Valid Patterns ---

@Component
struct ValidGrid {
  build() {
    Grid() {
      GridItem() { Text("Item 1") }
      GridItem() { Text("Item 2") }
      GridItem() { Text("Item 3") }
      GridItem() { Text("Item 4") }
    }
    .columnsTemplate("1fr 1fr")
  }
}

@Component
struct ValidList {
  build() {
    List() {
      ListItem() { Text("List Item 1") }
      ListItem() { Text("List Item 2") }
      ListItem() { Text("List Item 3") }
    }
  }
}

@Component
struct ValidSwiper {
  build() {
    Swiper() {
      Text("Page 1")
      Text("Page 2")
      Text("Page 3")
    }
  }
}

@Component
struct ValidTabs {
  build() {
    Tabs() {
      TabContent() { Text("Tab 1") }
      TabContent() { Text("Tab 2") }
    }
  }
}

@Component
struct ValidButton {
  build() {
    Column() {
      Button("Simple Button")
      Button("Another Button")
    }
  }
}

@Component
struct ComplexLayout {
  build() {
    Column() {
      Row() {
        Text("Header Left").layoutWeight(1)
        Text("Header Right")
      }
      Row() {
        Column() { Text("Sidebar") }.width("30%")
        Column() { Text("Main Content") }.width("70%")
      }
    }
  }
}

@Entry
@Component
struct ChildRestrictionsErrorEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
