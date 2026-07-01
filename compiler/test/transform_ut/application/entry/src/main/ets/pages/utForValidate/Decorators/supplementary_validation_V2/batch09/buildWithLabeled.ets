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
 * Labeled statement inside build method.
Tests error 10905209: labeled statements are not valid UI component syntax.
Labels like myLabel: are JavaScript features not supported in build.
 */

// --- Error Cases ---

// Error 10905209: labeled statement is not UI syntax
@Component
struct BuildWithLabel {
  build() {
    Column() {
      myLabel: Text("labeled")
    }
  }
}

// --- Valid Patterns ---

// Valid: Simple text display
@Component
struct ValidTextDisplay {
  @State label: string = "Section Title";
  build() {
    Column() {
      Text(this.label).fontSize(20).fontWeight(FontWeight.Bold)
    }
  }
}

// Valid: Build with Row layout
@Component
struct ValidRowLayout {
  @State leftText: string = "Left";
  @State rightText: string = "Right";
  build() {
    Column() {
      Row() {
        Text(this.leftText)
        Text(this.rightText)
      }
    }
  }
}

// Valid: Build with styled components
@Component
struct ValidStyledBuild {
  @State title: string = "Styled Title";
  build() {
    Column() {
      Text(this.title)
        .fontSize(24)
        .fontColor(Color.Blue)
        .margin({ top: 10, bottom: 10 })
      Text("Subtitle")
        .fontSize(14)
        .fontColor(Color.Gray)
    }
  }
}

// Valid: Build with state-driven styling
@Component
struct ValidStateDrivenStyle {
  @State isActive: boolean = false;
  build() {
    Column() {
      Text("Status: " + (this.isActive ? "Active" : "Inactive"))
        .fontColor(this.isActive ? Color.Green : Color.Red)
      Button("Toggle").onClick(() => {
        this.isActive = !this.isActive
      })
    }
  }
}

// Valid: Build with multiple components
@Component
struct ValidMultiComponent {
  @State count: number = 0;
  build() {
    Column() {
      Text("Counter App").fontSize(18)
      Divider()
      Text("Current: " + this.count.toString()).fontSize(16)
      Row() {
        Button("Decrement").onClick(() => this.count--)
        Button("Increment").onClick(() => this.count++)
      }
    }
  }
}

@Entry
@Component
struct BuildWithLabeledEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
