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
 * @Extend function parameter validation.
 */

// --- Error Cases ---

// Error 10905108: @Extend without parameter
@Extend(Text)
function extendNoParam() {
  .fontSize(16)
}

// --- Valid Patterns ---

// Valid: @Extend with one parameter
@Extend(Text)
function extendTextColor(color: ResourceColor) {
  .fontColor(color)
}

// Valid: @Extend with multiple parameters
@Extend(Text)
function extendTextStyle(size: number, weight: FontWeight, color: ResourceColor) {
  .fontSize(size)
  .fontWeight(weight)
  .fontColor(color)
}

// Valid: @Extend for Button
@Extend(Button)
function extendButtonStyle(bgColor: ResourceColor, radius: number) {
  .backgroundColor(bgColor)
  .borderRadius(radius)
}

// Valid: Using @Extend in components
@Component
struct ExtendShowcase {
  @State titleColor: ResourceColor = Color.Blue;
  build() {
    Column() {
      Text("Styled Title")
        .extendTextStyle(24, FontWeight.Bold, this.titleColor)
      Text("Subtitle")
        .extendTextColor(Color.Gray)
      Button("Action Button")
        .extendButtonStyle(Color.Green, 8)
    }
  }
}

// Valid: @Extend for Column
@Extend(Column)
function extendCardLayout() {
  .padding(16)
  .borderRadius(12)
}

// Valid: @Extend with string parameter
@Extend(Text)
function extendTextWithText(text: string) {
  .fontSize(16)
  .fontWeight(FontWeight.Medium)
}

// Valid: Interactive component using extends
@Component
struct InteractiveText {
  @State pressed: boolean = false;
  build() {
    Column() {
      Text("Press Me")
        .extendTextColor(this.pressed ? Color.Red : Color.Black)
      Button("Toggle").onClick(() => { this.pressed = !this.pressed })
    }
  }
}

// Valid: Styled list with extends
@Component
struct StyledList {
  build() {
    Column() {
      Text("Item 1").extendTextStyle(16, FontWeight.Normal, Color.Black)
      Text("Item 2").extendTextStyle(14, FontWeight.Normal, Color.Gray)
      Text("Item 3").extendTextStyle(18, FontWeight.Bold, Color.Blue)
    }
  }
}

@Entry
@Component
struct ExtendParamRulesEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
