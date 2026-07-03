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
 * Resource type validation deep patterns.
 */

// --- Error Cases ---

// Error 10903330: Unknown resource types
@Component
struct BadResourceTypes {
  build() {
    Column() {
      Text($r("app.unknown.value"))
      Image($r("app.invalid.icon"))
      Text($r("app mystery.field"))
    }
  }
}

// --- Valid Patterns ---

// Valid: Using plain strings instead of resources
@Component
struct ValidStringUsage {
  build() {
    Column() {
      Text("Hello World")
      Text("Welcome to the app")
      Text("Goodbye")
    }
  }
}

// Valid: Hardcoded values for display
@Component
struct HardcodedDisplay {
  @State userName: string = "Alice";
  @State count: number = 42;
  build() {
    Column() {
      Text("User: " + this.userName)
      Text("Count: " + this.count.toString())
      Text("Status: Active")
    }
  }
}

// Valid: State-driven text
@Component
struct StateDrivenText {
  @State title: string = "Dashboard";
  @State subtitle: string = "Overview";
  build() {
    Column() {
      Text(this.title).fontSize(24)
      Text(this.subtitle).fontSize(14)
    }
  }
}

// Valid: Conditional text
@Component
struct ConditionalText {
  @State isLoggedIn: boolean = false;
  build() {
    Column() {
      if (this.isLoggedIn) {
        Text("Welcome back!")
      } else {
        Text("Please log in")
      }
      Button("Toggle").onClick(() => { this.isLoggedIn = !this.isLoggedIn })
    }
  }
}

// Valid: List with plain strings
@Component
struct StringList {
  @State items: string[] = ["Apple", "Banana", "Cherry"];
  build() {
    Column() {
      ForEach(this.items, (item: string) => {
        Text(item).padding(4)
      }, (item: string) => item)
    }
  }
}

// Valid: Dynamic text
@Component
struct DynamicText {
  @State counter: number = 0;
  build() {
    Column() {
      Text("Counter: " + this.counter.toString())
      Text(this.counter === 0 ? "Zero" : this.counter > 0 ? "Positive" : "Negative")
      Button("Add").onClick(() => this.counter++)
      Button("Subtract").onClick(() => this.counter--)
    }
  }
}

@Entry
@Component
struct ResourceTypeDeepEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
