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
 * Valid @Env decorator usage patterns.
Tests error 10905251 (@Env type restriction) and 10905304 (@Env default value).
@Env provides access to environment configuration values.
 */

// --- Error Cases ---

// Error 10905251 + 10905304: @Env with wrong type and default value
@Component
struct EnvComponent {
  @Env fontSizeScale: number = 1;
  build() { Column() { Text("env component") } }
}

// --- Valid Patterns ---

// Valid: Component without @Env
@Component
struct NoEnvComponent {
  @State fontSize: number = 16;
  build() {
    Column() {
      Text("Font Size: " + this.fontSize.toString())
      Text("Content with default settings")
    }
  }
}

// Valid: Component with configurable display
@Component
struct ConfigurableDisplay {
  @State size: number = 14;
  @State color: string = "black";
  build() {
    Column() {
      Text("Display Settings")
        .fontSize(this.size)
      Text("Size: " + this.size.toString())
      Text("Color: " + this.color)
      Button("Increase Size").onClick(() => {
        this.size += 2
      })
    }
  }
}

// Valid: V2 component with local display config
@ComponentV2
struct V2DisplayConfig {
  @Local fontSize: number = 16;
  @Local theme: string = "light";
  @Computed get effectiveSize(): number {
    return this.theme === "large" ? this.fontSize * 1.5 : this.fontSize;
  }
  build() {
    Column() {
      Text("Configured Text")
        .fontSize(this.effectiveSize)
      Text("Theme: " + this.theme + " Size: " + this.effectiveSize.toString())
      Button("Toggle Theme").onClick(() => {
        this.theme = this.theme === "light" ? "large" : "light"
      })
    }
  }
}

// Valid: Component with responsive design
@Component
struct ResponsiveComponent {
  @State width: number = 300;
  @State columns: number = 3;
  build() {
    Column() {
      Text("Width: " + this.width.toString())
      Text("Columns: " + this.columns.toString())
      Row() {
        ForEach([1, 2, 3], (n: number) => {
          Text("Col " + n.toString())
        }, (n: number) => n.toString())
      }
    }
  }
}

// Valid: Interactive font size control
@Component
struct FontSizeController {
  @State scale: number = 1.0;
  @State baseSize: number = 14;
  build() {
    Column() {
      Text("Scaled Text").fontSize(this.baseSize * this.scale)
      Text("Scale: " + this.scale.toFixed(1).toString() + "x")
      Row() {
        Button("Smaller").onClick(() => {
          if (this.scale > 0.5) this.scale -= 0.1
        })
        Button("Larger").onClick(() => {
          if (this.scale < 2.0) this.scale += 0.1
        })
      }
    }
  }
}

// Valid: Simple V2 component
@ComponentV2
struct SimpleV2Config {
  @Local value: number = 42;
  build() {
    Column() {
      Text("Simple Config")
      Text(this.value.toString())
    }
  }
}

@Entry
@Component
struct EnvDecoratorValidEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
