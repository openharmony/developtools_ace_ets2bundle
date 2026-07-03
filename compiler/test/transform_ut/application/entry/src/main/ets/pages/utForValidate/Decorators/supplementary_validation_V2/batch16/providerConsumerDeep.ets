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
 * V2 @Provider/@Consumer cross-component state sharing.
 */

// --- Valid Patterns ---

// Valid: @Provider in parent component
@ComponentV2
struct ThemeProvider {
  @Provider("theme") theme: string = "dark";
  @Provider("fontSize") fontSize: number = 14;
  build() {
    Column() {
      Text("Provider Theme: " + this.theme)
      ThemeConsumer()
    }
  }
}

// Valid: @Consumer in child component
@ComponentV2
struct ThemeConsumer {
  @Consumer("theme") currentTheme: string = "light";
  @Consumer("fontSize") currentFontSize: number = 12;
  build() {
    Column() {
      Text("Theme: " + this.currentTheme)
      Text("FontSize: " + this.currentFontSize.toString())
    }
  }
}

// Valid: @Provider with @Local
@ComponentV2
struct CounterProvider {
  @Local count: number = 0;
  @Provider("counter") counterValue: number = 0;
  build() {
    Column() {
      Text("Counter: " + this.count.toString())
      Button("Increment").onClick(() => {
        this.count++
        this.counterValue = this.count
      })
      CounterDisplay()
    }
  }
}

@ComponentV2
struct CounterDisplay {
  @Consumer("counter") value: number = 0;
  build() {
    Column() {
      Text("Received: " + this.value.toString())
    }
  }
}

// Valid: Multi-level provider/consumer
@ComponentV2
struct AppProvider {
  @Provider("user") userName: string = "Alice";
  build() {
    Column() {
      Text("App Provider")
      MidLevelComponent()
    }
  }
}

@ComponentV2
struct MidLevelComponent {
  @Consumer("user") user: string = "";
  build() {
    Column() {
      Text("Mid: " + this.user)
      DeepConsumer()
    }
  }
}

@ComponentV2
struct DeepConsumer {
  @Consumer("user") deepUser: string = "";
  build() {
    Column() {
      Text("Deep: " + this.deepUser)
    }
  }
}

// Valid: Provider with toggle
@ComponentV2
struct ToggleProvider {
  @Local mode: string = "view";
  @Provider("mode") currentMode: string = "view";
  build() {
    Column() {
      Text("Mode: " + this.mode)
      Button("Toggle").onClick(() => {
        this.mode = this.mode === "view" ? "edit" : "view"
        this.currentMode = this.mode
      })
      ModeConsumer()
    }
  }
}

@ComponentV2
struct ModeConsumer {
  @Consumer("mode") mode: string = "view";
  build() {
    Column() {
      Text("Consumer Mode: " + this.mode)
    }
  }
}

@Entry
@Component
struct ProviderConsumerDeepEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
