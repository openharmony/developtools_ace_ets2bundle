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
 * Valid conditional rendering without resources.
 */

// --- Valid Patterns ---

@Component
struct LoadingState {
  @State isLoading: boolean = true;
  build() {
    Column() {
      if (this.isLoading) {
        Text("Loading... Please wait.")
      } else {
        Text("Content loaded successfully!")
      }
      Button("Toggle State").onClick(() => { this.isLoading = !this.isLoading })
    }
  }
}

@Component
struct ErrorState {
  @State hasError: boolean = false;
  @State errorMessage: string = "";
  build() {
    Column() {
      if (this.hasError) {
        Text("Error: " + this.errorMessage).fontColor(Color.Red)
      } else {
        Text("No errors detected").fontColor(Color.Green)
      }
      Button("Simulate Error").onClick(() => {
        this.hasError = true
        this.errorMessage = "Connection timeout"
      })
      Button("Clear Error").onClick(() => { this.hasError = false })
    }
  }
}

@Component
struct EmptyState {
  @State items: string[] = [];
  build() {
    Column() {
      if (this.items.length === 0) {
        Text("No items found")
        Text("Add some items to get started")
      } else {
        ForEach(this.items, (item: string) => {
          Text(item)
        }, (item: string) => item)
      }
      Button("Add Item").onClick(() => {
        this.items.push("Item " + (this.items.length + 1))
      })
    }
  }
}

@Component
struct TabContentView {
  @State activeTab: number = 0;
  build() {
    Column() {
      Row() {
        Text("Tab 1").padding(8).backgroundColor(this.activeTab === 0 ? Color.Gray : Color.Transparent)
        Text("Tab 2").padding(8).backgroundColor(this.activeTab === 1 ? Color.Gray : Color.Transparent)
        Text("Tab 3").padding(8).backgroundColor(this.activeTab === 2 ? Color.Gray : Color.Transparent)
      }
      if (this.activeTab === 0) {
        Text("Content for Tab 1")
      } else if (this.activeTab === 1) {
        Text("Content for Tab 2")
      } else {
        Text("Content for Tab 3")
      }
      Button("Next Tab").onClick(() => {
        this.activeTab = (this.activeTab + 1) % 3
      })
    }
  }
}

@Component
struct PermissionGate {
  @State hasAccess: boolean = false;
  build() {
    Column() {
      if (this.hasAccess) {
        Text("Welcome to the admin panel")
        Text("You have full access")
      } else {
        Text("Access denied")
        Text("Please contact administrator")
      }
      Button("Toggle Access").onClick(() => { this.hasAccess = !this.hasAccess })
    }
  }
}

@Entry
@Component
struct ResourceConditionalValidEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
