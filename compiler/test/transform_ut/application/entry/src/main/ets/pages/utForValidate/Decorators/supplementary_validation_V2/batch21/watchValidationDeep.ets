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
 * @Watch decorator patterns.
 */

// --- Valid Patterns ---
// Valid: State counter
@Component
struct CounterComp {
  @State count: number = 0;
  build() {
    Column() {
      Text("Count: " + this.count.toString())
      Button("Add").onClick(() => this.count++)
    }
  }
}

// Valid: Text state
@Component
struct TextComp {
  @State text: string = "Hello";
  build() {
    Column() {
      Text("Text: " + this.text)
      Text("Length: " + this.text.length.toString())
      Button("Append").onClick(() => { this.text = this.text + "!" })
    }
  }
}

// Valid: Toggle state
@Component
struct ToggleComp {
  @State isOn: boolean = false;
  @State clicks: number = 0;
  build() {
    Column() {
      Text("Toggle: " + (this.isOn ? "ON" : "OFF"))
      Text("Clicks: " + this.clicks.toString())
      Button("Toggle").onClick(() => { this.isOn = !this.isOn; this.clicks++ })
    }
  }
}

// Valid: List state
@Component
struct ListComp {
  @State items: string[] = ["A", "B", "C"];
  @State selected: number = 0;
  build() {
    Column() {
      Text("Selected: " + this.items[this.selected])
      Text("Count: " + this.items.length.toString())
      Button("Next").onClick(() => { this.selected = (this.selected + 1) % this.items.length })
    }
  }
}

// Valid: Provide
@Component
struct ProviderComp {
  @Provide("theme") theme: string = "dark";
  @Provide("lang") lang: string = "en";
  build() {
    Column() {
      Text("Provider: " + this.theme)
      ConsumerComp()
    }
  }
}

// Valid: Consume
@Component
struct ConsumerComp {
  @Consume("theme") currentTheme: string;
  @Consume("lang") currentLang: string;
  build() {
    Column() {
      Text("Theme: " + this.currentTheme)
      Text("Language: " + this.currentLang)
    }
  }
}

// Valid: Storage
@Component
struct StorageComp {
  @StorageLink("counter") counter: number = 0;
  build() {
    Column() {
      Text("Counter: " + this.counter.toString())
      Button("Add").onClick(() => { this.counter++ })
    }
  }
}

// Valid: Watch state
@Component
struct WatchComp {
  @State @Watch("onChange") value: number = 0;
  @State doubled: number = 0;
  onChange(): void { this.doubled = this.value * 2; }
  build() {
    Column() {
      Text("Value: " + this.value.toString())
      Text("Doubled: " + this.doubled.toString())
      Button("Add").onClick(() => this.value++)
    }
  }
}

@Entry
@Component
struct WatchValidationDeepEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
