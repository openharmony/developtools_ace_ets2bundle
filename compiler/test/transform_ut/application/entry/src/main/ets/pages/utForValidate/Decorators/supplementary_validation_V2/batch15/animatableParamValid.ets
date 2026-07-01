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
 * Valid @AnimatableExtend usage patterns.
Tests WARN from @AnimatableExtend function body validation.
@AnimatableExtend creates animatable custom properties.
 */

// --- Warn Cases ---

// WARN: @AnimatableExtend produces UI syntax warnings
@AnimatableExtend
function animatableOpacity(value: number) {
  .opacity(value)
}

// --- Valid Patterns ---

// Valid: @Extend for styling
@Extend(Text)
function validTextStyle(size: number, color: ResourceColor) {
  .fontSize(size)
  .fontColor(color)
}

// Valid: Component using @Extend
@Component
struct AnimatableComponent {
  @State opacityVal: number = 1.0;
  @State textColor: ResourceColor = Color.Black;
  build() {
    Column() {
      Text("animatable")
        .validTextStyle(16, this.textColor)
      Text("Opacity: " + this.opacityVal.toString())
    }
  }
}

// Valid: Interactive component with styled elements
@Component
struct InteractiveStyled {
  @State isActive: boolean = true;
  build() {
    Column() {
      Text("Status")
        .fontSize(this.isActive ? 20 : 14)
        .fontColor(this.isActive ? Color.Green : Color.Gray)
        .fontWeight(this.isActive ? FontWeight.Bold : FontWeight.Normal)
      Button("Toggle").onClick(() => {
        this.isActive = !this.isActive
      })
    }
  }
}

// Valid: Component with dynamic styling
@Component
struct DynamicStyle {
  @State pressed: boolean = false;
  @State hover: boolean = false;
  build() {
    Column() {
      Text("Dynamic Style Demo")
        .fontSize(this.pressed ? 24 : 16)
        .fontColor(this.hover ? Color.Blue : Color.Black)
      Button("Press").onClick(() => {
        this.pressed = !this.pressed
      })
      Button("Hover").onClick(() => {
        this.hover = !this.hover
      })
    }
  }
}

// Valid: Styled list component
@Component
struct StyledList {
  @State items: string[] = ["Important", "Normal", "Low"];
  @State selectedIndex: number = 0;
  build() {
    Column() {
      ForEach(this.items, (item: string, index: number) => {
        Text(item)
          .fontSize(index === this.selectedIndex ? 20 : 14)
          .fontWeight(index === this.selectedIndex ? FontWeight.Bold : FontWeight.Normal)
          .fontColor(index === this.selectedIndex ? Color.Blue : Color.Black)
          .onClick(() => { this.selectedIndex = index })
      }, (item: string) => item)
    }
  }
}

// Valid: Component with animation-like transitions
@Component
struct TransitionDemo {
  @State isVisible: boolean = true;
  @State scale: number = 1;
  build() {
    Column() {
      if (this.isVisible) {
        Text("Visible Content")
          .fontSize(this.scale * 16)
      }
      Button("Toggle Visible").onClick(() => {
        this.isVisible = !this.isVisible
      })
      Button("Scale Up").onClick(() => {
        this.scale = this.scale < 2 ? this.scale + 0.2 : 1
      })
    }
  }
}

// Valid: Simple counter component
@Component
struct SimpleCounter {
  @State count: number = 0;
  build() {
    Column() {
      Text("Count: " + this.count.toString()).fontSize(24)
      Row() {
        Button("Decrement").onClick(() => this.count--)
        Button("Increment").onClick(() => this.count++)
      }
    }
  }
}

@Entry
@Component
struct AnimatableParamValidEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
