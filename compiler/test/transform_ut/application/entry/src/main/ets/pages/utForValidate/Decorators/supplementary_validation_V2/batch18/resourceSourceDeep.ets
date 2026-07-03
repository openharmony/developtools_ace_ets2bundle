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
 * Resource source name validation.
 */

// --- Error Cases ---

// Error 10903331: Unknown resource sources
@Component
struct BadResourceSources {
  build() {
    Column() {
      Text($r("wrong.string.hello"))
      Image($r("bad.media.icon"))
      Text($r("invalid.color.primary"))
    }
  }
}

// --- Valid Patterns ---

// Valid: Using hardcoded text
@Component
struct ValidTextUsage {
  build() {
    Column() {
      Text("Application Title")
      Text("Description Text")
      Text("Footer Info")
    }
  }
}

// Valid: Color constants
@Component
struct ValidColorUsage {
  build() {
    Column() {
      Text("Red Text").fontColor(Color.Red)
      Text("Blue Text").fontColor(Color.Blue)
      Text("Green Text").fontColor(Color.Green)
    }
  }
}

// Valid: Styled components without resources
@Component
struct StyledNoResource {
  build() {
    Column() {
      Text("Card Title").fontSize(20).fontWeight(FontWeight.Bold)
      Divider()
      Text("Card Body").fontSize(14).fontColor(Color.Gray)
    }
    .padding(16)
  }
}

// Valid: Dynamic content
@Component
struct DynamicContent {
  @State items: string[] = ["First", "Second", "Third"];
  build() {
    Column() {
      ForEach(this.items, (item: string, index: number) => {
        Text((index + 1).toString() + ". " + item)
      }, (item: string) => item)
    }
  }
}

// Valid: Interactive content
@Component
struct InteractiveContent {
  @State message: string = "Hello";
  build() {
    Column() {
      Text(this.message)
      Button("Change").onClick(() => {
        this.message = "Updated at " + Date.now().toString()
      })
    }
  }
}

// Valid: Formatted text
@Component
struct FormattedText {
  @State name: string = "World";
  @State count: number = 100;
  build() {
    Column() {
      Text("Hello, " + this.name + "!")
      Text("You have " + this.count.toString() + " notifications")
      Text("Progress: " + Math.floor((this.count / 200) * 100) + "%")
    }
  }
}

@Entry
@Component
struct ResourceSourceDeepEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
