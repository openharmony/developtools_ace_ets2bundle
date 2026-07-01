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
 * @Extend decorator on different component types. Tests valid @Extend usage.
 */

// --- Valid Patterns ---

// Valid: @Extend for Button
@Extend(Button)
function extendButton(color: ResourceColor) {
  .backgroundColor(color)
}

// Valid: @Extend for Column
@Extend(Column)
function extendColumn() {
  .width("100%")
}

// Valid: @Extend for Text
@Extend(Text)
function extendTextTitle(size: number, weight: FontWeight) {
  .fontSize(size)
  .fontWeight(weight)
}

// Valid: @Extend for Row
@Extend(Row)
function extendRowCenter() {
  .width("100%")
  .justifyContent(FlexAlign.Center)
}

// Valid: Using @Extend in components
@Component
struct ExtendShowcase {
  @State btnColor: ResourceColor = Color.Blue;
  build() {
    Column() {
      Text("Extended Title")
        .extendTextTitle(24, FontWeight.Bold)
      Button("Extended Button")
        .extendButton(this.btnColor)
      Row() {
        Text("Left")
        Text("Right")
      }
      .extendRowCenter()
    }
    .extendColumn()
  }
}

// Valid: Multiple extends on same component
@Extend(Text)
function errorTextStyle() {
  .fontColor(Color.Red)
  .fontSize(14)
}

@Extend(Text)
function successTextStyle() {
  .fontColor(Color.Green)
  .fontSize(14)
}

@Component
struct StatusMessages {
  @State hasError: boolean = false;
  build() {
    Column() {
      if (this.hasError) {
        Text("Error occurred!")
          .errorTextStyle()
      } else {
        Text("All good!")
          .successTextStyle()
      }
      Button("Toggle").onClick(() => {
        this.hasError = !this.hasError
      })
    }
  }
}

// Valid: Component with styled list
@Component
struct StyledList {
  @State items: string[] = ["First", "Second", "Third"];
  build() {
    Column() {
      ForEach(this.items, (item: string) => {
        Text(item).extendTextTitle(16, FontWeight.Normal)
      }, (item: string) => item)
    }
  }
}

@Entry
@Component
struct ExtendOnComponentEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
