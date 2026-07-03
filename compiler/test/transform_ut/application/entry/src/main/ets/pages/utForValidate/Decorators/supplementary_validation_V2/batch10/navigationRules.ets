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
 * Navigation component usage patterns.
Tests valid NavRouter and NavDestination nesting.
Navigation components handle page routing and transitions.
 */

// --- Valid Patterns ---

// Valid: NavRouter with content and NavDestination
@Component
struct NavRouterValid {
  build() {
    NavRouter() {
      Text("nav content")
      NavDestination() { Text("destination") }
    }
  }
}

// Valid: NavRouter with styled content
@Component
struct NavRouterStyled {
  build() {
    NavRouter() {
      Column() {
        Text("Navigation Title").fontSize(18)
        Text("Tap to navigate")
      }
      NavDestination() {
        Column() {
          Text("Destination Page")
          Text("You have arrived")
        }
      }
    }
  }
}

// Valid: Navigation with button trigger
@Component
struct NavWithButton {
  build() {
    NavRouter() {
      Button("Go to Details")
      NavDestination() {
        Text("Details Page Content")
      }
    }
  }
}

// Valid: Simple navigation container
@Component
struct SimpleNavigation {
  build() {
    Column() {
      Text("Main Page").fontSize(20)
      NavRouter() {
        Text("Click for more info")
        NavDestination() {
          Text("More information here")
        }
      }
    }
  }
}

// Valid: Navigation with multiple destinations
@Component
struct MultiDestination {
  build() {
    Column() {
      NavRouter() {
        Text("Section A")
        NavDestination() { Text("Content A") }
      }
      NavRouter() {
        Text("Section B")
        NavDestination() { Text("Content B") }
      }
    }
  }
}

// Valid: Tab-based navigation
@Component
struct TabNavigation {
  build() {
    Tabs() {
      TabContent() { Text("Tab 1 Content") }
      TabContent() { Text("Tab 2 Content") }
      TabContent() { Text("Tab 3 Content") }
    }
  }
}

@Entry
@Component
struct NavigationRulesEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
