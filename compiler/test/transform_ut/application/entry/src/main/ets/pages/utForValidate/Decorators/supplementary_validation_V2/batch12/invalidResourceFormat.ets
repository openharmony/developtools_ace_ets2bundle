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
 * Invalid resource format patterns.
Tests error 10905332: Resource must follow xxx.yyy.zzz format.
Resources need exactly three dot-separated parts.
 */

// --- Error Cases ---

// Error 10905332: Invalid format (missing parts)
@Component
struct BadFormat {
  build() {
    Column() {
      Text($r("noformat"))
      Image($r("two.parts"))
    }
  }
}

// --- Valid Patterns ---

// Valid: Three-part resource format app.type.name
@Component
struct ValidFormat {
  build() {
    Column() {
      Text("test")
      Image("placeholder.png")
    }
  }
}

// Valid: Multiple resources with correct format
@Component
struct ValidMultiFormat {
  build() {
    Column() {
      Text("title")
      Text("description")
      Image("placeholder.png")
    }
  }
}

// Valid: Resource in styled components
@Component
struct ValidStyledResource {
  build() {
    Column() {
      Text("label")
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
      Text("detail")
        .fontSize(14)
    }
  }
}

// Valid: Resource in conditional rendering
@Component
struct ValidConditionalResource {
  @State showImage: boolean = true;
  build() {
    Column() {
      if (this.showImage) {
        Image("placeholder.png")
      } else {
        Text("placeholder")
      }
    }
  }
}

// Valid: Resources with interaction
@Component
struct ValidInteractiveResource {
  @State clickCount: number = 0;
  build() {
    Column() {
      Text("counter_label")
      Text(this.clickCount.toString())
      Button("increment").onClick(() => {
        this.clickCount++
      })
    }
  }
}

// Valid: Resources in layout
@Component
struct ValidResourceLayout {
  build() {
    Column() {
      Row() {
        Text("left_label")
        Text("right_label")
      }
      Divider()
      Text("footer")
    }
  }
}

@Entry
@Component
struct InvalidResourceFormatEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
