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
 * Summary of valid resource-free patterns.
 */

// --- Valid Patterns ---

@Component
struct AppHeader {
  build() {
    Row() {
      Text("App Name").fontWeight(FontWeight.Bold)
      Text("Menu")
    }
    .width("100%")
    .padding(12)
  }
}

@Component
struct AppBody {
  @State counter: number = 0;
  build() {
    Column() {
      Text("Counter: " + this.counter.toString())
      Button("Increment").onClick(() => this.counter++)
      Button("Decrement").onClick(() => this.counter--)
      Button("Reset").onClick(() => { this.counter = 0 })
    }
  }
}

@Component
struct AppFooter {
  build() {
    Column() {
      Divider()
      Text("Status: Online")
      Text("v2.0.0 | 2026")
    }
    .padding(8)
  }
}

@Component
struct Notification {
  @State message: string = "Welcome!";
  @State type: string = "info";
  build() {
    Column() {
      Text("[" + this.type + "] " + this.message)
    }
    .padding(8)
    .borderRadius(4)
  }
}

@Component
struct UserList {
  @State users: string[] = ["Alice", "Bob", "Charlie"];
  build() {
    Column() {
      Text("Active Users (" + this.users.length.toString() + ")")
      ForEach(this.users, (user: string, i: number) => {
        Text((i + 1).toString() + ". " + user)
      }, (user: string) => user)
    }
  }
}

@Component
struct ProgressBar {
  @State progress: number = 45;
  build() {
    Column() {
      Text("Progress: " + this.progress.toString() + "%")
      Text(this.progress >= 100 ? "Complete!" : "In progress...")
      Button("Add 10%").onClick(() => {
        if (this.progress < 100) this.progress += 10
      })
    }
  }
}

@Component
struct Dashboard {
  build() {
    Column() {
      AppHeader()
      Notification()
      AppBody()
      UserList()
      ProgressBar()
      AppFooter()
    }
  }
}

@Entry
@Component
struct ResourceSummaryValidEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
