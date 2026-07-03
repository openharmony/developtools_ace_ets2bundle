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
 * @Extend function with parameters. Valid @Extend usage with different argument counts.
 */

// --- Valid Patterns ---

// Valid: @Extend with two parameters
@Extend(Text)
function extendTwoArgs(a: string, b: number) {
  .fontColor(Color.Red)
}

// Valid: @Extend with zero parameters
@Extend(Text)
function extendNoArgs() {
  .fontSize(16)
}

// Valid: @Extend with single parameter
@Extend(Text)
function extendSingleArg(color: ResourceColor) {
  .fontColor(color)
}

// Valid: @Extend with multiple style attributes
@Extend(Text)
function extendMultiStyle(size: number, weight: FontWeight) {
  .fontSize(size)
  .fontWeight(weight)
}

// Valid: @Extend applied to Text in build
@Component
struct UsesExtend {
  @State titleColor: ResourceColor = Color.Blue;
  build() {
    Column() {
      Text("Styled Title")
        .extendSingleArg(this.titleColor)
      Text("Big Text")
        .extendMultiStyle(24, FontWeight.Bold)
      Text("Red Text")
        .extendTwoArgs("red", 14)
    }
  }
}

// Valid: @Extend for Button
@Extend(Button)
function extendButton(bgColor: ResourceColor) {
  .backgroundColor(bgColor)
}

// Valid: @Extend for Column
@Extend(Column)
function extendColumnLayout() {
  .width("100%")
  .padding(10)
}

@Component
struct ExtendShowcase {
  build() {
    Column() {
      Text("Showcase")
        .extendSingleArg(Color.Green)
        .extendMultiStyle(20, FontWeight.Normal)
      Button("Action")
        .extendButton(Color.Blue)
    }
  }
}

@Entry
@Component
struct ExtendWithMultipleArgsEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
