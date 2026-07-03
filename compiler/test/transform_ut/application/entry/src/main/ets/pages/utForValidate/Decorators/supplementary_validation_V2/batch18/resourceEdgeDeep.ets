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
 * Resource reference edge cases with empty and malformed parts.
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

// Valid: Hardcoded strings only
@Component
struct ValidNoResource {
  build() {
    Column() {
      Text("Hello")
      Text("World")
    }
  }
}

// Valid: State-driven labels
@Component
struct StateLabels {
  @State label: string = "Initial";
  @State value: number = 100;
  build() {
    Column() {
      Text(this.label)
      Text("Value: " + this.value.toString())
    }
  }
}

// Valid: Interactive counter
@Component
struct InteractiveCounter {
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

// Valid: Conditional display
@Component
struct ConditionalDisplay {
  @State visible: boolean = true;
  build() {
    Column() {
      Button("Toggle").onClick(() => { this.visible = !this.visible })
      if (this.visible) {
        Text("Now you see me")
      } else {
        Text("Now you do not")
      }
    }
  }
}

// Valid: List without resources
@Component
struct ValidList {
  @State items: string[] = ["Apple", "Banana", "Cherry"];
  build() {
    Column() {
      Text("Items").fontSize(18)
      ForEach(this.items, (item: string) => {
        Text(item).padding(4)
      }, (item: string) => item)
    }
  }
}

// Valid: Styled text
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

// Valid: Formatted output
@Component
struct ValidFormatted {
  @State name: string = "User";
  @State score: number = 85;
  build() {
    Column() {
      Text("Name: " + this.name)
      Text("Score: " + this.score.toString() + "/100")
      Text("Grade: " + (this.score >= 90 ? "A" : this.score >= 80 ? "B" : "C"))
    }
  }
}

@Entry
@Component
struct ResourceEdgeDeepEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
