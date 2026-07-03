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
 * Valid state-driven components without resources.
 */

// --- Valid Patterns ---

@Component
struct ToggleSwitch {
  @State isOn: boolean = false;
  build() {
    Column() {
      Text("Switch: " + (this.isOn ? "ON" : "OFF"))
      Button("Toggle").onClick(() => { this.isOn = !this.isOn })
    }
  }
}

@Component
struct TextInputView {
  @State value: string = "";
  @State maxLength: number = 20;
  build() {
    Column() {
      Text("Input: " + this.value)
      Text("Length: " + this.value.length.toString() + "/" + this.maxLength.toString())
      Button("Add Character").onClick(() => {
        if (this.value.length < this.maxLength) {
          this.value = this.value + "x"
        }
      })
      Button("Clear").onClick(() => { this.value = "" })
    }
  }
}

@Component
struct SliderInput {
  @State value: number = 50;
  @State min: number = 0;
  @State max: number = 100;
  build() {
    Column() {
      Text("Value: " + this.value.toString())
      Text("Range: " + this.min.toString() + " - " + this.max.toString())
      Button("Increase").onClick(() => {
        if (this.value < this.max) this.value += 10
      })
      Button("Decrease").onClick(() => {
        if (this.value > this.min) this.value -= 10
      })
    }
  }
}

@Component
struct CheckboxView {
  @State checked: boolean = false;
  @State label: string = "Accept terms";
  build() {
    Column() {
      Text("[" + (this.checked ? "x" : " ") + "] " + this.label)
      Button("Toggle").onClick(() => { this.checked = !this.checked })
    }
  }
}

@Component
struct RadioGroup {
  @State selected: string = "option1";
  build() {
    Column() {
      Text("Selected: " + this.selected)
      Text("( ) Option 1").fontColor(this.selected === "option1" ? Color.Blue : Color.Black)
      Text("( ) Option 2").fontColor(this.selected === "option2" ? Color.Blue : Color.Black)
      Text("( ) Option 3").fontColor(this.selected === "option3" ? Color.Blue : Color.Black)
      Button("Next Option").onClick(() => {
        let options: string[] = ["option1", "option2", "option3"]
        let idx: number = options.indexOf(this.selected)
        this.selected = options[(idx + 1) % options.length]
      })
    }
  }
}

@Component
struct FormSummary {
  @State name: string = "John";
  @State age: number = 30;
  @State agreed: boolean = false;
  build() {
    Column() {
      Text("Form Summary").fontWeight(FontWeight.Bold)
      Text("Name: " + this.name)
      Text("Age: " + this.age.toString())
      Text("Agreed: " + (this.agreed ? "Yes" : "No"))
      Button("Toggle Agreement").onClick(() => { this.agreed = !this.agreed })
    }
  }
}

@Entry
@Component
struct ResourceStateValidEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
