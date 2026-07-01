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
 * @AnimatableExtend parameter validation. Tests WARN from UI syntax checking.
 */

// --- Warn Cases ---

// WARN: @AnimatableExtend produces UI syntax warnings
@AnimatableExtend
function animatableWithTwo(p1: number, p2: string) {
  .opacity(0.5)
}

// WARN: Second @AnimatableExtend function
@AnimatableExtend
function animatableZero() {
  .opacity(1)
}

// --- Valid Patterns ---

// Valid: @Extend for basic styling
@Extend(Text)
function validExtend(color: ResourceColor) {
  .fontColor(color)
  .fontSize(16)
}

// Valid: Using @Extend in component
@Component
struct ValidExtendUsage {
  @State textColor: ResourceColor = Color.Black;
  build() {
    Column() {
      Text("Valid Styled Text")
        .validExtend(this.textColor)
    }
  }
}

// Valid: Component with styled button
@Component
struct StyledButton {
  build() {
    Column() {
      Button("Primary").backgroundColor(Color.Blue)
      Button("Secondary").backgroundColor(Color.Gray)
    }
  }
}

// Valid: Component with dynamic styling
@Component
struct DynamicStyling {
  @State isActive: boolean = true;
  build() {
    Column() {
      Text(this.isActive ? "Active" : "Inactive")
        .fontColor(this.isActive ? Color.Green : Color.Red)
        .fontSize(this.isActive ? 20 : 14)
    }
  }
}

// Valid: Multiple styled components
@Component
struct MultiStyled {
  build() {
    Column() {
      Text("Title").fontSize(24).fontWeight(FontWeight.Bold)
      Divider().margin(10)
      Text("Subtitle").fontSize(16).fontColor(Color.Gray)
      Text("Body").fontSize(14)
    }
  }
}

// Valid: Interactive styled component
@Component
struct InteractiveStyled {
  @State pressed: boolean = false;
  build() {
    Column() {
      Text("Press the button")
        .fontColor(this.pressed ? Color.Red : Color.Black)
      Button("Press Me").onClick(() => {
        this.pressed = !this.pressed
      })
    }
  }
}

@Entry
@Component
struct AnimatableWithArgsEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
