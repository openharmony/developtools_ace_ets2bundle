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
 * Invalid resource source names in () references.
Tests error 10903331: Unknown resource source.
Resource sources must match predefined app/sys categories.
 */

// --- Error Cases ---

// Error 10903331: Unknown resource source "wrong"
@Component
struct BadResourceSource {
  build() {
    Column() {
      Text($r("wrong.string.hello"))
      Image($r("bad.media.icon"))
    }
  }
}

// --- Valid Patterns ---

// Valid: Using "app" resource source
@Component
struct ValidAppResource {
  build() {
    Column() {
      Text("title")
      Image("placeholder.png")
    }
  }
}

// Valid: Using "sys" resource source
@Component
struct ValidSysResource {
  build() {
    Column() {
      Text("app_name")
      Image("placeholder.png")
    }
  }
}

// Valid: Resource in styled components
@Component
struct StyledResource {
  build() {
    Column() {
      Text("title")
        .fontSize(20)
        .fontColor(Color.Blue)
    }
  }
}

// Valid: Resource in button label
@Component
struct ResourceButton {
  build() {
    Column() {
      Button("submit")
      Button("cancel")
    }
  }
}

// Valid: Multiple resource types
@Component
struct MultiResource {
  build() {
    Column() {
      Text("hello")
      Text("world")
      Image("placeholder.png")
    }
  }
}

@Entry
@Component
struct InvalidResourceSourceEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
