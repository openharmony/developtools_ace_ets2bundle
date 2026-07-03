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
 * Valid @Param with default values patterns.
 */

// --- Valid Patterns ---

@ComponentV2
struct GreetingCard {
  @Param greeting: string = "Hello";
  @Param name: string = "World";
  @Param times: number = 1;
  build() {
    Column() {
      ForEach(Array.from({ length: this.times }, (_, i) => i), (i: number) => {
        Text(this.greeting + ", " + this.name + "!")
      }, (i: number) => i.toString())
    }
  }
}

@ComponentV2
struct ProgressBar {
  @Param progress: number = 0;
  @Param color: string = "blue";
  @Param showLabel: boolean = true;
  build() {
    Column() {
      Text("Progress: " + this.progress.toString() + "%")
      Text("Color: " + this.color)
      if (this.showLabel) {
        Text(this.progress >= 100 ? "Complete!" : "Loading...")
      }
    }
  }
}

@ComponentV2
struct NotificationBanner {
  @Param message: string = "";
  @Param type: string = "info";
  @Param dismissible: boolean = true;
  @Local visible: boolean = true;
  build() {
    Column() {
      if (this.visible) {
        Text("[" + this.type.toUpperCase() + "] " + this.message)
        if (this.dismissible) {
          Button("Dismiss").onClick(() => { this.visible = false })
        }
      }
    }
  }
}

@ComponentV2
struct DataGrid {
  @Param rows: number = 3;
  @Param cols: number = 3;
  @Param cellSize: number = 40;
  build() {
    Column() {
      Text("Grid: " + this.rows.toString() + "x" + this.cols.toString())
      ForEach(Array.from({ length: this.rows }, (_, r) => r), (r: number) => {
        Row() {
          ForEach(Array.from({ length: this.cols }, (_, c) => c), (c: number) => {
            Text(r.toString() + "," + c.toString())
              .width(this.cellSize)
              .height(this.cellSize)
              .textAlign(TextAlign.Center)
          }, (c: number) => c.toString())
        }
      }, (r: number) => r.toString())
    }
  }
}

@ComponentV2
struct TabView {
  @Param activeTab: string = "home";
  @Param tabCount: number = 3;
  build() {
    Column() {
      Text("Active: " + this.activeTab)
      Row() {
        ForEach(Array.from({ length: this.tabCount }, (_, i) => i), (i: number) => {
          Text("Tab " + i.toString())
            .padding(8)
            .backgroundColor(this.activeTab === "tab" + i ? Color.Gray : Color.Transparent)
        }, (i: number) => i.toString())
      }
    }
  }
}

@Entry
@Component
struct ParamDefaultValidEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
