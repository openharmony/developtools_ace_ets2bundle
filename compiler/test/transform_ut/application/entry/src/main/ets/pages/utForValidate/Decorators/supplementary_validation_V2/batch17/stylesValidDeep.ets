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
 * Valid @Styles decorator comprehensive patterns.
 */

// --- Valid Patterns ---

@Styles
function containerStyles() {
  .backgroundColor(Color.White)
  .borderRadius(12)
  .padding(16)
}

@Styles
function headingStyles() {
  .fontSize(24)
  .fontWeight(FontWeight.Bold)
  .fontColor(Color.Black)
}

@Styles
function labelStyles() {
  .fontSize(12)
  .fontColor(Color.Gray)
  .margin({ bottom: 4 })
}

@Styles
function valueStyles() {
  .fontSize(16)
  .fontColor(Color.Blue)
  .fontWeight(FontWeight.Medium)
}

@Styles
function dividerStyles() {
  .color(Color.Gray)
  .margin({ top: 8, bottom: 8 })
}

@Component
struct ProfileCard {
  build() {
    Column() {
      Text("User Profile").headingStyles()
      Divider().dividerStyles()
      Text("Name").labelStyles()
      Text("John Doe").valueStyles()
      Text("Email").labelStyles()
      Text("john@example.com").valueStyles()
      Text("Status").labelStyles()
      Text("Active").valueStyles()
    }
    .containerStyles()
  }
}

@Component
struct ProductCard {
  build() {
    Column() {
      Text("Product Details").headingStyles()
      Divider().dividerStyles()
      Text("Product Name").labelStyles()
      Text("Wireless Headphones").valueStyles()
      Text("Price").labelStyles()
      Text("$99.99").valueStyles()
      Text("Stock").labelStyles()
      Text("In Stock").valueStyles()
    }
    .containerStyles()
  }
}

@Component
struct SettingsCard {
  @State darkMode: boolean = false;
  build() {
    Column() {
      Text("Settings").headingStyles()
      Divider().dividerStyles()
      Text("Theme").labelStyles()
      Text(this.darkMode ? "Dark" : "Light").valueStyles()
      Button("Toggle Theme").onClick(() => { this.darkMode = !this.darkMode })
    }
    .containerStyles()
  }
}

@Entry
@Component
struct StylesValidDeepEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
