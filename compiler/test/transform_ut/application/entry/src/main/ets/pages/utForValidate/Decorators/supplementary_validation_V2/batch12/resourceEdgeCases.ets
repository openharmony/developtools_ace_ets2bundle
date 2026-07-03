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
 * Resource reference edge cases with empty parts.
Tests errors 10903330 (empty type) and 10903331 (empty source).
Demonstrates malformed resource references.
 */

// --- Error Cases ---

// Error 10903330 + 10903331: Empty type and source parts
@Component
struct ResourceEdgeCase {
  build() {
    Column() {
      Text($r("app..test"))
      Image($r(".media.icon"))
    }
  }
}

// --- Valid Patterns ---

// Valid: Complete resource references
@Component
struct ValidComplete {
  build() {
    Column() {
      Image("placeholder.png")
        .width(80)
        .height(80)
    }
  }
}

// Valid: Using plain strings
@Component
struct ValidPlainStrings {
  build() {
    Column() {
      Text("Hello")
      Text("World")
    }
  }
}

// Valid: State-driven text
@Component
struct ValidStateDriven {
  @State label: string = "Initial Label";
  @State value: number = 100;
  build() {
    Column() {
      Text(this.label)
      Text("Value: " + this.value.toString())
    }
  }
}

// Valid: Interactive components without resources
@Component
struct ValidNoResource {
  @State counter: number = 0;
  build() {
    Column() {
      Text("Counter App")
      Text(this.counter.toString())
      Row() {
        Button("-").onClick(() => this.counter--)
        Button("+").onClick(() => this.counter++)
      }
    }
  }
}

// Valid: Conditional without resources
@Component
struct ValidConditionalNoResource {
  @State isVisible: boolean = true;
  build() {
    Column() {
      Button("Toggle").onClick(() => {
        this.isVisible = !this.isVisible
      })
      if (this.isVisible) {
        Text("Now you see me")
      } else {
        Text("Now you do not")
      }
    }
  }
}

// Valid: List without resources
@Component
struct ValidListNoResource {
  @State fruits: string[] = ["Apple", "Banana", "Cherry", "Date"];
  build() {
    Column() {
      Text("Fruits").fontSize(18)
      ForEach(this.fruits, (fruit: string) => {
        Text(fruit).padding(4)
      }, (fruit: string) => fruit)
    }
  }
}

// Valid: Styled text without resources
@Component
struct ValidStyledText {
  build() {
    Column() {
      Text("Title").fontSize(24).fontWeight(FontWeight.Bold)
      Divider().margin(10)
      Text("Subtitle").fontSize(14).fontColor(Color.Gray)
    }
  }
}

@Entry
@Component
struct ResourceEdgeCasesEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
