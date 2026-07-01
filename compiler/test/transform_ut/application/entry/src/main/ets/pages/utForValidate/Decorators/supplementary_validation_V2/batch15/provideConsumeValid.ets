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
 * Valid @Provide/@Consume across component hierarchy.
Tests correct V1 state sharing patterns between ancestor and descendant components.
@Provide/@Consume enables cross-level data passing.
 */

// --- Valid Patterns ---

// Valid: Grandchild consuming provided value
@Component
struct GrandChild {
  @Consume("theme") themeColor: string = "blue";
  build() { Text(this.themeColor) }
}

// Valid: Middle component passing through
@Component
struct Child {
  build() { Column() { GrandChild() } }
}

// Valid: Root providing value
@Component
struct ThemeProvider {
  @Provide("theme") themeColor: string = "red";
  build() { Column() { Child() } }
}

// Valid: Multiple provide/consume pairs
@Component
struct DeepConsumer {
  @Consume("user") userName: string = "";
  @Consume("role") userRole: string = "";
  build() {
    Column() {
      Text("User: " + this.userName)
      Text("Role: " + this.userRole)
    }
  }
}

@Component
struct DeepProvider {
  @Provide("user") userName: string = "Admin";
  @Provide("role") userRole: string = "Administrator";
  build() { Column() { DeepConsumer() } }
}

// Valid: Provide with state backing
@Component
struct StatefulProvider {
  @State count: number = 0;
  @Provide("counter") counterValue: number = 0;
  build() {
    Column() {
      Text("Counter: " + this.count.toString())
      Button("Increment").onClick(() => {
        this.count++
        this.counterValue = this.count
      })
      CounterConsumer()
    }
  }
}

@Component
struct CounterConsumer {
  @Consume("counter") value: number = 0;
  build() {
    Text("Consumed: " + this.value.toString())
  }
}

// Valid: Nested provide/consume chain
@Component
struct LeafConsumer {
  @Consume("data") sharedData: string = "default";
  build() { Text(this.sharedData) }
}

@Component
struct MiddleLayer {
  build() {
    Column() {
      Text("Middle Layer")
      LeafConsumer()
    }
  }
}

@Component
struct RootProvider {
  @Provide("data") sharedData: string = "from root";
  build() {
    Column() {
      Text("Root Provider")
      MiddleLayer()
    }
  }
}

// Valid: Theme switcher with provide/consume
@Component
struct ThemeAwareText {
  @Consume("colorScheme") scheme: string = "light";
  build() {
    Text("Theme: " + this.scheme)
      .fontColor(this.scheme === "dark" ? Color.White : Color.Black)
  }
}

@Component
struct ThemeSwitcherApp {
  @State currentTheme: string = "light";
  @Provide("colorScheme") scheme: string = "light";
  build() {
    Column() {
      ThemeAwareText()
      Button("Switch Theme").onClick(() => {
        this.currentTheme = this.currentTheme === "light" ? "dark" : "light"
        this.scheme = this.currentTheme
      })
    }
  }
}

@Entry
@Component
struct ProvideConsumeValidEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
