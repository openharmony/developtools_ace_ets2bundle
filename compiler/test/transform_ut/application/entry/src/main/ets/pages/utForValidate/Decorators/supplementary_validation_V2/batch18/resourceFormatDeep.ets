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
 * Resource format validation with three-part requirement.
 */

// --- Error Cases ---

// Error 10905332: Invalid resource format (missing parts)
@Component
struct BadFormat {
  build() {
    Column() {
      Text($r("noformat"))
      Image($r("two.parts"))
      Text($r("app."))
    }
  }
}

// --- Valid Patterns ---

// Valid: Plain string text
@Component
struct ValidPlainText {
  build() {
    Column() {
      Text("Title")
      Text("Subtitle")
      Text("Body content")
    }
  }
}

// Valid: Dynamic string building
@Component
struct DynamicStrings {
  @State baseText: string = "Item";
  @State count: number = 5;
  build() {
    Column() {
      Text(this.baseText + " #" + this.count.toString())
      Text("Total: " + (this.count * 10).toString() + " points")
    }
  }
}

// Valid: Array-based content
@Component
struct ArrayContent {
  @State messages: string[] = ["Welcome", "Loading", "Complete"];
  build() {
    Column() {
      ForEach(this.messages, (msg: string, i: number) => {
        Text((i + 1).toString() + ": " + msg)
      }, (msg: string) => msg)
    }
  }
}

// Valid: Conditional display
@Component
struct ConditionalDisplay {
  @State status: string = "loading";
  build() {
    Column() {
      if (this.status === "loading") {
        Text("Please wait...")
      } else if (this.status === "success") {
        Text("Operation completed!")
      } else {
        Text("Unknown status")
      }
      Button("Next").onClick(() => {
        this.status = this.status === "loading" ? "success" : "loading"
      })
    }
  }
}

// Valid: Counter with formatted output
@Component
struct CounterDisplay {
  @State value: number = 0;
  build() {
    Column() {
      Text("Current: " + this.value.toString())
      Text("Double: " + (this.value * 2).toString())
      Text("Hex: 0x" + this.value.toString(16).toUpperCase())
      Button("Add").onClick(() => this.value++)
    }
  }
}

// Valid: User profile without resources
@Component
struct UserProfile {
  @State name: string = "John Doe";
  @State role: string = "Developer";
  @State level: number = 5;
  build() {
    Column() {
      Text(this.name).fontSize(20).fontWeight(FontWeight.Bold)
      Text("Role: " + this.role)
      Text("Level: " + this.level.toString())
    }
  }
}

@Entry
@Component
struct ResourceFormatDeepEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
