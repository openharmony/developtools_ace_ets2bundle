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
 * Valid resource-free component patterns.
 */

// --- Valid Patterns ---

@Component
struct HeaderSection {
  build() {
    Column() {
      Text("Application Header").fontSize(22).fontWeight(FontWeight.Bold)
      Text("Version 2.0").fontSize(12).fontColor(Color.Gray)
    }
  }
}

@Component
struct NavigationBar {
  @State activeItem: string = "home";
  build() {
    Row() {
      Text("Home").fontColor(this.activeItem === "home" ? Color.Blue : Color.Black)
      Text("Settings").fontColor(this.activeItem === "settings" ? Color.Blue : Color.Black)
      Text("Profile").fontColor(this.activeItem === "profile" ? Color.Blue : Color.Black)
    }
  }
}

@Component
struct ContentSection {
  @State title: string = "Main Content";
  @State body: string = "This is the main content area.";
  build() {
    Column() {
      Text(this.title).fontSize(18).fontWeight(FontWeight.Bold)
      Divider().margin(8)
      Text(this.body).fontSize(14)
    }
  }
}

@Component
struct FooterSection {
  build() {
    Column() {
      Divider()
      Text("Copyright 2026").fontSize(12).fontColor(Color.Gray)
      Text("All rights reserved").fontSize(10).fontColor(Color.Gray)
    }
  }
}

@Component
struct FullPage {
  build() {
    Column() {
      HeaderSection()
      NavigationBar()
      ContentSection()
      FooterSection()
    }
  }
}

@Component
struct CardLayout {
  build() {
    Column() {
      Column() {
        Text("Card Title").fontSize(16).fontWeight(FontWeight.Bold)
        Text("Card Description").fontSize(12)
      }
      .padding(12)
      .borderRadius(8)

      Column() {
        Text("Another Card").fontSize(16).fontWeight(FontWeight.Bold)
        Text("More content").fontSize(12)
      }
      .padding(12)
      .borderRadius(8)
    }
  }
}

@Component
struct StatsDisplay {
  @State users: number = 1234;
  @State revenue: number = 5678;
  build() {
    Row() {
      Column() {
        Text("Users").fontSize(12).fontColor(Color.Gray)
        Text(this.users.toString()).fontSize(20).fontWeight(FontWeight.Bold)
      }
      Column() {
        Text("Revenue").fontSize(12).fontColor(Color.Gray)
        Text("$" + this.revenue.toString()).fontSize(20).fontWeight(FontWeight.Bold)
      }
    }
  }
}

@Entry
@Component
struct ResourceValidPatternsEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
