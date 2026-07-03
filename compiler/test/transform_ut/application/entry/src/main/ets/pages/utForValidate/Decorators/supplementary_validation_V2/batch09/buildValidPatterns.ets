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
 * Valid build method patterns serving as control group.
These demonstrate correct usage of build() with various UI constructs.
No errors should be triggered by this file.
 */

// --- Valid Patterns ---

// Valid: Basic build with Text and Button
@Component
struct ValidBuild {
  @State count: number = 0;
  @State message: string = "hello";
  build() {
    Column() {
      Text(this.message)
      if (this.count > 0) {
        Text(this.count.toString())
      }
      Button("click").onClick(() => this.count++)
    }
  }
}

// Valid: Build with ForEach
@Component
struct ValidBuildForEach {
  @State items: string[] = ["Item 1", "Item 2", "Item 3"];
  build() {
    Column() {
      ForEach(this.items, (item: string) => {
        Text(item)
      }, (item: string) => item)
    }
  }
}

// Valid: Build with nested Rows and Columns
@Component
struct ValidNestedLayout {
  @State title: string = "Layout Demo";
  build() {
    Column() {
      Text(this.title).fontSize(20)
      Row() {
        Text("Left")
        Text("Center")
        Text("Right")
      }
    }
  }
}

// Valid: Build with conditional rendering
@Component
struct ValidConditionalRender {
  @State isVisible: boolean = true;
  @State label: string = "Toggle Visibility";
  build() {
    Column() {
      Button(this.label).onClick(() => {
        this.isVisible = !this.isVisible
      })
      if (this.isVisible) {
        Text("Content is visible")
      }
    }
  }
}

// Valid: Build with multiple state variables
@Component
struct ValidMultiState {
  @State counter: number = 0;
  @State name: string = "TestComponent";
  @State items: string[] = ["a", "b", "c"];
  build() {
    Column() {
      Text(this.name).fontSize(18)
      Text("Counter: " + this.counter.toString())
      Button("Increment").onClick(() => this.counter++)
      ForEach(this.items, (item: string) => {
        Text(item)
      }, (item: string) => item)
    }
  }
}

// Valid: Build with styled components
@Component
struct ValidStyledComponents {
  @State isActive: boolean = true;
  build() {
    Column() {
      Text("Status")
        .fontSize(16)
        .fontColor(this.isActive ? Color.Green : Color.Red)
      Text(this.isActive ? "ONLINE" : "OFFLINE")
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
    }
  }
}

@Entry
@Component
struct BuildValidPatternsEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
