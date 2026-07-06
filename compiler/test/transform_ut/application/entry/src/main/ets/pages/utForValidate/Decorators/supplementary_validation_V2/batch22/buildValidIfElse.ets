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
 * Valid if-else patterns in build.
 */

// --- Valid Patterns ---
// Valid: Counter
@Component
struct CounterBuild {
  @State count: number = 0;
  build() {
    Column() {
      Text("Count: " + this.count.toString()).fontSize(24)
      Row() {
        Button("-").onClick(() => this.count--)
        Button("+").onClick(() => this.count++)
      }
      Button("Reset").onClick(() => { this.count = 0 })
    }
  }
}

// Valid: Conditional
@Component
struct CondBuild {
  @State status: string = "loading";
  build() {
    Column() {
      if (this.status === "loading") { Text("Loading...") }
      else if (this.status === "success") { Text("Success!") }
      else { Text("Error") }
      Button("Next").onClick(() => { this.status = this.status === "loading" ? "success" : "loading" })
    }
  }
}

// Valid: ForEach
@Component
struct ListBuild {
  @State items: number[] = [1, 2, 3, 4, 5];
  build() {
    Column() {
      ForEach(this.items, (n: number) => {
        Text(n.toString() + " x 2 = " + (n * 2).toString())
      }, (n: number) => n.toString())
    }
  }
}

// Valid: Nested
@Component
struct NestedLayout {
  @State title: string = "Page";
  build() {
    Column() {
      Row() {
        Text(this.title).layoutWeight(1)
        Text("Menu")
      }
      Column() {
        Text("Content area")
        Row() { Button("OK"); Button("Cancel") }
      }
    }
  }
}

// Valid: Interactive
@Component
struct InteractiveBuild {
  @State value: number = 50;
  build() {
    Column() {
      Text("Value: " + this.value.toString())
      Text(this.value > 50 ? "Above" : this.value < 50 ? "Below" : "At average")
      Row() {
        Button("-10").onClick(() => { if (this.value >= 10) this.value -= 10 })
        Button("Reset").onClick(() => { this.value = 50 })
        Button("+10").onClick(() => { this.value += 10 })
      }
    }
  }
}

// Valid: Builder
@Builder
function headerBuilder() {
  Row() { Text("App Title").fontWeight(FontWeight.Bold); Text("Menu") }
}

@Component
struct BuilderBuild {
  build() { Column() { headerBuilder(); Text("Content") } }
}

// Valid: Form
@Component
struct FormBuild {
  @State username: string = "";
  @State submitted: boolean = false;
  build() {
    Column() {
      Text("Username: " + (this.username || "(empty)"))
      Text("Submitted: " + this.submitted.toString())
      Button("Fill").onClick(() => { this.username = "demo" })
      Button("Submit").onClick(() => { if (this.username) this.submitted = true })
    }
  }
}

// Valid: Dashboard
@Component
struct DashboardBuild {
  @State tab: number = 0;
  build() {
    Column() {
      Row() {
        Text("Tab 1").padding(8).backgroundColor(this.tab === 0 ? Color.Gray : Color.Transparent)
        Text("Tab 2").padding(8).backgroundColor(this.tab === 1 ? Color.Gray : Color.Transparent)
      }
      if (this.tab === 0) { Text("Content 1") } else { Text("Content 2") }
      Button("Switch").onClick(() => { this.tab = 1 - this.tab })
    }
  }
}

@Entry
@Component
struct BuildValidIfElseEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
