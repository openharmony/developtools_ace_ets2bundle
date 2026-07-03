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
 * TabContent and Tabs nesting patterns.
Tests valid Tabs/TabContent usage.
TabContent must be a direct child of Tabs.
 */

// --- Valid Patterns ---

// Valid: Tabs with TabContent children
@Component
struct TabsValidUsage {
  build() {
    Tabs() {
      TabContent() { Text("tab 1") }
      TabContent() { Text("tab 2") }
    }
  }
}

// Valid: Tabs with styled TabContent
@Component
struct TabsStyledContent {
  build() {
    Tabs() {
      TabContent() {
        Column() {
          Text("Home").fontSize(20)
          Text("Welcome to home tab")
        }
      }
      TabContent() {
        Column() {
          Text("Profile").fontSize(20)
          Text("User profile tab")
        }
      }
    }
  }
}

// Valid: Tabs with bar configuration
@Component
struct TabsWithBar {
  build() {
    Tabs({ barPosition: BarPosition.End }) {
      TabContent() { Text("Content A") }
      TabContent() { Text("Content B") }
      TabContent() { Text("Content C") }
    }
  }
}

// Valid: Tabs with multiple components per tab
@Component
struct TabsMultiComponent {
  build() {
    Tabs() {
      TabContent() {
        Column() {
          Text("Tab 1 Title")
          Divider()
          Text("Tab 1 Body")
          Button("Action 1")
        }
      }
      TabContent() {
        Column() {
          Text("Tab 2 Title")
          Divider()
          Text("Tab 2 Body")
          Button("Action 2")
        }
      }
    }
  }
}

// Valid: Tabs with interactive content
@Component
struct TabsInteractive {
  @State activeTab: number = 0;
  build() {
    Tabs() {
      TabContent() {
        Column() {
          Text("Counter Tab")
          Text("Active: " + this.activeTab.toString())
        }
      }
      TabContent() {
        Column() {
          Button("Set Active").onClick(() => {
            this.activeTab++
          })
        }
      }
    }
  }
}

// Valid: Tabs with vertical layout
@Component
struct TabsVertical {
  build() {
    Tabs() {
      TabContent() { Text("Vertical Tab 1") }
      TabContent() { Text("Vertical Tab 2") }
    }
    .vertical(true)
  }
}

@Entry
@Component
struct TabContentRulesEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
