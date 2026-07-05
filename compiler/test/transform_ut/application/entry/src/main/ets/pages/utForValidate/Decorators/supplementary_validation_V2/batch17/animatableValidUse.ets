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
 */

// --- Warn Cases ---

// WARN: @AnimatableExtend usage
@AnimatableExtend
function animatableOpacity(value: number) {
  .opacity(value)
}

// --- Valid Patterns ---

@Extend(Text)
function styledText(size: number) {
  .fontSize(size)
  .fontWeight(FontWeight.Normal)
}

@Component
struct AnimatedBox {
  @State opacity: number = 1;
  build() {
    Column() {
      Text("Animated Text")
        .styledText(16)
        .opacity(this.opacity)
      Button("Fade").onClick(() => {
        this.opacity = this.opacity === 1 ? 0.3 : 1
      })
    }
  }
}

@Component
struct TransitionBox {
  @State scale: number = 1;
  build() {
    Column() {
      Text("Scale Demo")
        .styledText(18)
        .scale({ x: this.scale, y: this.scale })
      Button("Toggle Scale").onClick(() => {
        this.scale = this.scale === 1 ? 1.5 : 1
      })
    }
  }
}

@Component
struct ColorBox {
  @State isActive: boolean = false;
  build() {
    Column() {
      Text("Color Demo")
        .styledText(16)
        .backgroundColor(this.isActive ? Color.Green : Color.Gray)
      Button("Toggle").onClick(() => {
        this.isActive = !this.isActive
      })
    }
  }
}

@Component
struct MultiAnimatedBox {
  @State pressed: boolean = false;
  @State visible: boolean = true;
  build() {
    Column() {
      if (this.visible) {
        Text("Multi Animation")
          .styledText(18)
          .opacity(this.pressed ? 0.5 : 1)
          .scale({ x: this.pressed ? 0.9 : 1, y: this.pressed ? 0.9 : 1 })
      }
      Button("Press").onClick(() => { this.pressed = !this.pressed })
      Button("Toggle Visible").onClick(() => { this.visible = !this.visible })
    }
  }
}

@Component
struct RotationBox {
  @State angle: number = 0;
  build() {
    Column() {
      Text("Rotation")
        .styledText(16)
        .rotate({ angle: this.angle })
      Button("Rotate").onClick(() => {
        this.angle = this.angle + 45
      })
    }
  }
}

@Entry
@Component
struct AnimatableValidUseEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
