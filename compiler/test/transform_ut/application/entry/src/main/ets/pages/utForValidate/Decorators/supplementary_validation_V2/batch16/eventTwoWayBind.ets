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
 * V2 @Event with !! two-way binding syntax rules.
 */

// --- Valid Patterns ---

// Valid: @Event declaration
@ComponentV2
struct CounterEvent {
  @Local count: number = 0;
  @Event update: (n: number) => void = (n: number) => {};
  build() {
    Column() {
      Text("Count: " + this.count.toString())
      Button("Add").onClick(() => {
        this.count++
        this.update(this.count)
      })
    }
  }
}

// Valid: Parent component with !! binding
@ComponentV2
struct ParentCounter {
  @Local value: number = 0;
  build() {
    Column() {
      Text("Parent Value: " + this.value.toString())
      CounterEvent({ update: (n: number): void => { this.value = n } })
    }
  }
}

// Valid: @Event with no parameters (notification pattern)
@ComponentV2
struct ToggleButton {
  @Local isOn: boolean = false;
  @Event onToggle: () => void = () => {};
  build() {
    Column() {
      Text(this.isOn ? "ON" : "OFF")
      Button("Toggle").onClick(() => {
        this.isOn = !this.isOn
        this.onToggle()
      })
    }
  }
}

// Valid: Multiple @Event handlers
@ComponentV2
struct FormEvents {
  @Local inputText: string = "";
  @Event onSubmit: (text: string) => void = (text: string) => {};
  @Event onCancel: () => void = () => {};
  build() {
    Column() {
      Text("Form Input: " + this.inputText)
      Button("Submit").onClick(() => this.onSubmit(this.inputText))
      Button("Cancel").onClick(() => this.onCancel())
    }
  }
}

// Valid: @Event with @Param for slider
@ComponentV2
struct SliderComponent {
  @Param value: number = 50;
  @Event onChange: (v: number) => void = (v: number) => {};
  build() {
    Column() {
      Text("Value: " + this.value.toString())
      Button("Increase").onClick(() => this.onChange(this.value + 10))
      Button("Decrease").onClick(() => this.onChange(this.value - 10))
    }
  }
}

// Valid: Complete two-way binding example
@ComponentV2
struct AppRoot {
  @Local score: number = 100;
  build() {
    Column() {
      Text("Score: " + this.score.toString()).fontSize(24)
      SliderComponent({ value: this.score, onChange: (v: number): void => { this.score = v } })
    }
  }
}

@Entry
@Component
struct EventTwoWayBindEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
