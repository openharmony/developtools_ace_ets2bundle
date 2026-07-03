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
 * @Styles function argument restriction.
 */

// --- Error Cases ---

// Error 10905110: @Styles function with arguments
@Styles
function stylesWithArgs(a: string) {
  .backgroundColor(Color.Red)
}

// --- Valid Patterns ---

// Valid: @Styles function without arguments
@Styles
function cardStyles() {
  .backgroundColor(Color.White)
  .borderRadius(8)
  .padding(16)
}

// Valid: @Styles for title
@Styles
function titleStyles() {
  .fontSize(24)
  .fontWeight(FontWeight.Bold)
  .fontColor(Color.Black)
}

// Valid: @Styles for body text
@Styles
function bodyStyles() {
  .fontSize(14)
  .fontColor(Color.Gray)
  .lineHeight(20)
}

// Valid: Using @Styles in components
@Component
struct UsesStyles {
  build() {
    Column() {
      Text("Title").titleStyles()
      Divider()
      Text("Body text content").bodyStyles()
    }
    .cardStyles()
  }
}

// Valid: @Styles for error display
@Styles
function errorStyles() {
  .backgroundColor(Color.Red)
  .fontColor(Color.White)
  .padding(8)
  .borderRadius(4)
}

// Valid: @Styles for success display
@Styles
function successStyles() {
  .backgroundColor(Color.Green)
  .fontColor(Color.White)
  .padding(8)
  .borderRadius(4)
}

// Valid: Component with conditional styles
@Component
struct StatusDisplay {
  @State hasError: boolean = false;
  build() {
    Column() {
      Text(this.hasError ? "Error!" : "Success!")
        .fontSize(16)
      if (this.hasError) {
        Text("Something went wrong").errorStyles()
      } else {
        Text("All good").successStyles()
      }
      Button("Toggle").onClick(() => { this.hasError = !this.hasError })
    }
  }
}

// Valid: Multiple @Styles on same element
@Component
struct MultiStyleDisplay {
  build() {
    Column() {
      Text("Card Title").titleStyles()
      Text("Card body with detailed content").bodyStyles()
    }
    .cardStyles()
  }
}

@Entry
@Component
struct StylesFunctionRulesEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
