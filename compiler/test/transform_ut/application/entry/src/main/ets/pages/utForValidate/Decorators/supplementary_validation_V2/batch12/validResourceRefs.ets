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
 * Valid resource references control group.
Tests () usage that triggers known resource type validation.
Some valid-looking references may still trigger warnings.
 */

// --- Error Cases ---

// Error 10903330: "string" is not a recognized resource type
// (the compiler expects specific type names)
@Component
struct ValidResources {
  build() {
    Column() {
      Text($r("app.string.test"))
      Image($r("app.media.icon"))
    }
  }
}

// --- Valid Patterns ---

// Valid: Media resource reference
@Component
struct ValidMediaRef {
  build() {
    Column() {
      Image("placeholder.png")
        .width(120)
        .height(120)
    }
  }
}

// Valid: Multiple images
@Component
struct ValidMultiImage {
  build() {
    Row() {
      Image("placeholder.png").width(40).height(40)
      Image("placeholder.png").width(40).height(40)
      Image("placeholder.png").width(40).height(40)
    }
  }
}

// Valid: Resource in button
@Component
struct ValidResourceButton {
  build() {
    Column() {
      Button("Submit")
      Button("Cancel")
      Button("OK")
    }
  }
}

// Valid: Styled layout with resources
@Component
struct ValidStyledLayout {
  build() {
    Column() {
      Image("placeholder.png")
        .width(80)
        .height(80)
        .borderRadius(40)
      Text("Profile")
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
    }
  }
}

// Valid: Interactive resource display
@Component
struct ValidInteractiveResource {
  @State scale: number = 1;
  build() {
    Column() {
      Image("placeholder.png")
        .width(100 * this.scale)
        .height(100 * this.scale)
      Button("Zoom").onClick(() => {
        this.scale = this.scale === 1 ? 1.5 : 1
      })
    }
  }
}

// Valid: Simple text display
@Component
struct ValidSimpleText {
  @State message: string = "Hello World";
  build() {
    Column() {
      Text(this.message)
      Text("Welcome to ArkTS")
    }
  }
}

@Entry
@Component
struct ValidResourceRefsEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
