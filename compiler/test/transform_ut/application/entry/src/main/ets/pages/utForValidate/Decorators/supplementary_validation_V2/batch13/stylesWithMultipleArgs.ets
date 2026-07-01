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
 * @Styles function with arguments. Tests error 10905110: @Styles cannot have arguments.
 */

// --- Error Cases ---

// Error 10905110: @Styles function with one argument
@Styles
function stylesArgsOne(a: string) {
  .backgroundColor(Color.Red)
}

// Error 10905110: @Styles function with multiple arguments
@Styles
function stylesArgsMulti(a: number, b: boolean, c: string) {
  .padding(10)
}

// --- Valid Patterns ---

// Valid: @Styles function without arguments
@Styles
function validStylesNoArgs() {
  .backgroundColor(Color.Blue)
  .padding(10)
}

// Valid: Another @Styles function
@Styles
function cardStyles() {
  .backgroundColor(Color.White)
  .borderRadius(8)
  .padding(16)
}

// Valid: Using @Styles in a component
@Component
struct UsesValidStyles {
  build() {
    Column() {
      Text("Styled with @Styles")
        .validStylesNoArgs()
    }
  }
}

// Valid: @Styles for different elements
@Styles
function titleStyles() {
  .fontSize(24)
  .fontWeight(FontWeight.Bold)
  .fontColor(Color.Black)
}

@Styles
function bodyStyles() {
  .fontSize(14)
  .fontColor(Color.Gray)
}

// Valid: Component using multiple @Styles
@Component
struct MultiStyleComponent {
  build() {
    Column() {
      Text("Article Title")
        .titleStyles()
      Divider()
      Text("This is the body text of the article.")
        .bodyStyles()
    }
  }
}

// Valid: Styled component with interaction
@Component
struct InteractiveStyledComponent {
  @State isHighlighted: boolean = false;
  build() {
    Column() {
      Text("Click to highlight")
        .fontColor(this.isHighlighted ? Color.Yellow : Color.Black)
        .backgroundColor(this.isHighlighted ? Color.Orange : Color.Transparent)
      Button("Toggle").onClick(() => {
        this.isHighlighted = !this.isHighlighted
      })
    }
  }
}

@Entry
@Component
struct StylesWithMultipleArgsEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
