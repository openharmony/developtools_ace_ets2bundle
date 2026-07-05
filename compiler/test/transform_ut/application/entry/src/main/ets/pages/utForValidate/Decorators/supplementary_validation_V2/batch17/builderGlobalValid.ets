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
 * Valid @Builder global function patterns.
 */

// --- Valid Patterns ---

@Builder
function headerBuilder() {
  Row() {
    Text("Logo").fontWeight(FontWeight.Bold)
    Text("Menu")
  }
  .width("100%")
}

@Builder
function footerBuilder() {
  Row() {
    Text("Copyright 2026")
    Text("About")
  }
  .width("100%")
}

@Builder
function navItemBuilder(label: string, isActive: boolean) {
  Column() {
    Text(label)
      .fontColor(isActive ? Color.Blue : Color.Black)
      .fontWeight(isActive ? FontWeight.Bold : FontWeight.Normal)
  }
  .padding(8)
}

@Builder
function sectionDivider(title: string) {
  Column() {
    Divider()
    Text(title).fontSize(16).margin({ top: 8, bottom: 4 })
  }
}

@Component
struct AppLayout {
  @State activeTab: string = "home";
  build() {
    Column() {
      headerBuilder()
      navItemBuilder("Home", this.activeTab === "home")
      navItemBuilder("Settings", this.activeTab === "settings")
      navItemBuilder("Profile", this.activeTab === "profile")
      sectionDivider("Content Area")
      Text("Main content for " + this.activeTab)
      footerBuilder()
    }
  }
}

@Builder
function emptyState(message: string) {
  Column() {
    Text("No Data")
    Text(message).fontColor(Color.Gray)
  }
  .padding(32)
}

@Builder
function loadingState() {
  Column() {
    Text("Loading...")
  }
  .padding(32)
}

@Component
struct DataDisplay {
  @State isLoading: boolean = false;
  @State hasData: boolean = true;
  build() {
    Column() {
      if (this.isLoading) {
        loadingState()
      } else if (!this.hasData) {
        emptyState("No items found")
      } else {
        Text("Data loaded successfully")
      }
      Button("Refresh").onClick(() => {
        this.isLoading = true
        this.hasData = !this.hasData
        this.isLoading = false
      })
    }
  }
}

@Builder
function breadcrumbBuilder(items: string[]) {
  Row() {
    ForEach(items, (item: string, index: number) => {
      if (index > 0) {
        Text(" > ").fontColor(Color.Gray)
      }
      Text(item).fontSize(14)
    }, (item: string, index: number) => index.toString())
  }
}

@Component
struct PageWithBreadcrumb {
  build() {
    Column() {
      breadcrumbBuilder(["Home", "Settings", "Profile"])
      Text("Profile Page Content")
    }
  }
}

@Entry
@Component
struct BuilderGlobalValidEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
