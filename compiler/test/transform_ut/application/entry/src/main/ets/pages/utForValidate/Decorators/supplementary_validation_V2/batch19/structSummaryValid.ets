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
 * Summary of valid struct patterns.
 */

// --- Valid Patterns ---

@Component
struct AppNavigation {
  @State current: string = "home";
  build() {
    Column() {
      Row() {
        Text("Home").padding(8).backgroundColor(this.current === "home" ? Color.Gray : Color.Transparent)
        Text("Search").padding(8).backgroundColor(this.current === "search" ? Color.Gray : Color.Transparent)
        Text("Profile").padding(8).backgroundColor(this.current === "profile" ? Color.Gray : Color.Transparent)
      }
      Button("Next").onClick(() => {
        let pages: string[] = ["home", "search", "profile"]
        let idx: number = pages.indexOf(this.current)
        this.current = pages[(idx + 1) % pages.length]
      })
    }
  }
}

@Component
struct DataGrid {
  @State rows: number = 3;
  @State cols: number = 3;
  build() {
    Column() {
      Text("Grid " + this.rows.toString() + "x" + this.cols.toString())
      ForEach(Array.from({ length: this.rows }, (_, r) => r), (r: number) => {
        Row() {
          ForEach(Array.from({ length: this.cols }, (_, c) => c), (c: number) => {
            Text(r.toString() + "," + c.toString()).width(40).height(40).textAlign(TextAlign.Center)
          }, (c: number) => c.toString())
        }
      }, (r: number) => r.toString())
    }
  }
}

@Component
struct Timer {
  @State seconds: number = 0;
  @State running: boolean = false;
  build() {
    Column() {
      Text("Timer").fontSize(18)
      Text(Math.floor(this.seconds / 60).toString().padStart(2, "0") + ":" + (this.seconds % 60).toString().padStart(2, "0")).fontSize(36)
      Row() {
        Button(this.running ? "Pause" : "Start").onClick(() => { this.running = !this.running })
        Button("Reset").onClick(() => { this.seconds = 0; this.running = false })
        Button("+60s").onClick(() => { this.seconds += 60 })
      }
    }
  }
}

@Component
struct NotificationCenter {
  @State notifications: string[] = ["Welcome!", "New message", "Update available"];
  build() {
    Column() {
      Text("Notifications (" + this.notifications.length.toString() + ")")
      ForEach(this.notifications, (notif: string, i: number) => {
        Text((i + 1).toString() + ". " + notif).padding(4)
      }, (notif: string) => notif)
      Button("Clear All").onClick(() => { this.notifications = [] })
      Button("Add").onClick(() => { this.notifications.push("New notification " + Date.now().toString()) })
    }
  }
}

@Component
struct AppContainer {
  build() {
    Column() {
      AppNavigation()
      DataGrid({ rows: 2, cols: 2 })
      Timer()
      NotificationCenter()
    }
  }
}

@Entry
@Component
struct StructSummaryValidEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
