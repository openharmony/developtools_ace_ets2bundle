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
 * Resource string format validation.
Tests error 10903330: Unknown resource type string.
The compiler validates resource type names at compile time.
 */

// --- Error Cases ---

// Error 10903330: "string" is treated as unknown type
@Component
struct ResourceFormatTest {
  build() {
    Column() {
      Text($r("app.string.test"))
      Text($r("sys.string.test"))
    }
  }
}

// --- Valid Patterns ---

// Valid: Media resource type
@Component
struct ValidMediaResource {
  build() {
    Column() {
      Image("placeholder.png")
        .width(100)
    }
  }
}

// Valid: Using plain strings instead of $r
@Component
struct ValidPlainString {
  build() {
    Column() {
      Text("Hello World")
      Text("Welcome message")
    }
  }
}

// Valid: Using state variables for text
@Component
struct ValidStateText {
  @State title: string = "Dynamic Title";
  @State subtitle: string = "Dynamic Subtitle";
  build() {
    Column() {
      Text(this.title).fontSize(20)
      Text(this.subtitle).fontSize(14)
    }
  }
}

// Valid: Interactive text with state
@Component
struct ValidInteractiveText {
  @State message: string = "Click the button";
  build() {
    Column() {
      Text(this.message)
      Button("Change Text").onClick(() => {
        this.message = "Text changed!"
      })
    }
  }
}

// Valid: Multiple plain text elements
@Component
struct ValidMultiText {
  build() {
    Column() {
      Text("Header").fontSize(18).fontWeight(FontWeight.Bold)
      Divider()
      Text("Section 1 content")
      Text("Section 2 content")
      Text("Section 3 content")
    }
  }
}

// Valid: Text with concatenation
@Component
struct ValidTextConcat {
  @State name: string = "User";
  @State count: number = 5;
  build() {
    Column() {
      Text("Hello, " + this.name + "!")
      Text("You have " + this.count.toString() + " messages")
    }
  }
}

@Entry
@Component
struct ResourceStringFormatEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
