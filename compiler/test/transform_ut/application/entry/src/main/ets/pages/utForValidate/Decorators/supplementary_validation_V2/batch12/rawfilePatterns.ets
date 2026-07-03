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
 *  usage patterns for accessing raw file resources.
Tests error 10904333: Resource not found in module.
 is used for files in rawfile directory.
 */

// --- Error Cases ---

// Error 10904333: Rawfile resources not found in module
@Component
struct RawfileUsage {
  build() {
    Column() {
      Image($rawfile("test.png"))
      Image($rawfile("subfolder/nested.gif"))
    }
  }
}

// --- Valid Patterns ---

// Valid: Using $r() instead of $rawfile() for media resources
@Component
struct ValidResourceUse {
  build() {
    Column() {
      Image("placeholder.png")
        .width(100)
        .height(100)
    }
  }
}

// Valid: Text resources
@Component
struct ValidTextResource {
  build() {
    Column() {
      Text("title")
      Text("subtitle")
    }
  }
}

// Valid: Resources with styling
@Component
struct ValidStyledImage {
  build() {
    Column() {
      Image("placeholder.png")
        .width(200)
        .height(200)
        .borderRadius(10)
    }
  }
}

// Valid: Resources in interactive UI
@Component
struct ValidInteractiveImage {
  @State imageSize: number = 100;
  build() {
    Column() {
      Image("placeholder.png")
        .width(this.imageSize)
        .height(this.imageSize)
      Button("Enlarge").onClick(() => {
        this.imageSize += 20
      })
    }
  }
}

// Valid: Multiple resources in layout
@Component
struct ValidMultiResourceLayout {
  build() {
    Column() {
      Text("header").fontSize(20)
      Image("placeholder.png").width(50).height(50)
      Text("footer").fontSize(12)
    }
  }
}

// Valid: Resource with conditional rendering
@Component
struct ValidResourceConditional {
  @State isLoading: boolean = false;
  build() {
    Column() {
      if (this.isLoading) {
        Text("loading")
      } else {
        Text("ready")
      }
    }
  }
}

@Entry
@Component
struct RawfilePatternsEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
