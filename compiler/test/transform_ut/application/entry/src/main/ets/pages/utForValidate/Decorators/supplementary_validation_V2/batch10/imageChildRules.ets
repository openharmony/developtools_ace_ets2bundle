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
 * Image component child restrictions.
Tests error 10905222: Image cannot have any child components.
Image is a leaf node in the component tree.
 */

// --- Error Cases ---

// Error 10905222: Image cannot have children
@Component
struct ImageWithTextChild {
  build() {
    Column() {
      Image($r("app.media.icon")) {
        Text("child of image")
      }
    }
  }
}

// --- Valid Patterns ---

// Valid: Image without children, just with attributes
@Component
struct ValidImageNoChild {
  build() {
    Column() {
      Image($r("app.media.icon"))
        .width(100)
        .height(100)
    }
  }
}

// Valid: Image with styling attributes
@Component
struct ValidImageStyled {
  build() {
    Column() {
      Image($r("app.media.icon"))
        .width(200)
        .height(200)
        .borderRadius(10)
        .objectFill(ImageFit.Cover)
    }
  }
}

// Valid: Image with onClick handler
@Component
struct ValidImageClickable {
  @State clickCount: number = 0;
  build() {
    Column() {
      Image($r("app.media.icon"))
        .width(80)
        .height(80)
        .onClick(() => {
          this.clickCount++
        })
      Text("Clicks: " + this.clickCount.toString())
    }
  }
}

// Valid: Multiple Images in a Row
@Component
struct ValidMultiImages {
  build() {
    Column() {
      Row() {
        Image($r("app.media.icon")).width(50).height(50)
        Image($r("app.media.icon")).width(50).height(50)
        Image($r("app.media.icon")).width(50).height(50)
      }
    }
  }
}

// Valid: Image with Text alongside (not as child)
@Component
struct ValidImageWithText {
  build() {
    Column() {
      Text("Profile Picture").fontSize(16)
      Image($r("app.media.icon"))
        .width(120)
        .height(120)
        .borderRadius(60)
      Text("John Doe")
    }
  }
}

@Entry
@Component
struct ImageChildRulesEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
