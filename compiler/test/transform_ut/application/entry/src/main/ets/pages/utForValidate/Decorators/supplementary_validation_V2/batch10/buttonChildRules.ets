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
 * Button component child restrictions.
Tests error 10905220 (only one child) and 10905202 (label+child conflict).
Button with label parameter cannot have children; Button without label can have one child.
 */

// --- Error Cases ---

// Error 10905220 + 10905202: Button with label and multiple children
@Component
struct ButtonWithLabelAndChild {
  build() {
    Column() {
      Button("label") {
        Text("child 1")
        Text("child 2")
      }
    }
  }
}

// --- Valid Patterns ---

// Valid: Button with only label parameter
@Component
struct ValidButtonLabelOnly {
  @State clickCount: number = 0;
  build() {
    Column() {
      Button("Click Me").onClick(() => this.clickCount++)
      Text("Count: " + this.clickCount.toString())
    }
  }
}

// Valid: Button with single child component (no label)
@Component
struct ValidButtonWithChild {
  build() {
    Column() {
      Button() {
        Text("Custom Button Text")
      }
    }
  }
}

// Valid: Button with type styling
@Component
struct ValidButtonType {
  build() {
    Column() {
      Button("Normal", { type: ButtonType.Normal })
      Button("Capsule", { type: ButtonType.Capsule })
      Button("Circle", { type: ButtonType.Circle })
    }
  }
}

// Valid: Multiple buttons in a Row
@Component
struct ValidButtonRow {
  build() {
    Column() {
      Row() {
        Button("OK")
        Button("Cancel")
        Button("Apply")
      }
    }
  }
}

// Valid: Button with styled attributes
@Component
struct ValidButtonStyled {
  build() {
    Column() {
      Button("Primary")
        .width("80%")
        .height(45)
        .fontSize(16)
        .backgroundColor(Color.Blue)
      Button("Secondary")
        .width("80%")
        .height(45)
        .fontSize(16)
    }
  }
}

@Entry
@Component
struct ButtonChildRulesEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
