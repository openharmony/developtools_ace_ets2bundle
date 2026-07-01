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
 * Invalid resource type names in () references.
Tests error 10903330: Unknown resource type.
Resource types include string, media, color, etc.
 */

// --- Error Cases ---

// Error 10903330: Unknown resource type "unknown" and "invalid"
@Component
struct BadResourceType {
  build() {
    Column() {
      Text($r("app.unknown.value"))
      Image($r("app.invalid.icon"))
    }
  }
}

// --- Valid Patterns ---

// Valid: string resource type
@Component
struct ValidStringResource {
  build() {
    Column() {
      Text("greeting")
      Text("farewell")
    }
  }
}

// Valid: media resource type
@Component
struct ValidMediaResource {
  build() {
    Column() {
      Image("placeholder.png")
      Image("placeholder.png")
    }
  }
}

// Valid: Multiple valid resource references
@Component
struct ValidMultiResource {
  build() {
    Column() {
      Text("title")
        .fontSize(20)
      Image("placeholder.png")
        .width("100%")
      Text("subtitle")
        .fontSize(14)
    }
  }
}

// Valid: Resource references in interactive components
@Component
struct InteractiveResource {
  build() {
    Column() {
      Text("welcome")
      Button("action_ok").onClick(() => {})
      Button("action_cancel").onClick(() => {})
    }
  }
}

// Valid: Resources in list items
@Component
struct ListWithResources {
  build() {
    Column() {
      Text("list_header")
      Text("item_1")
      Text("item_2")
      Text("item_3")
    }
  }
}

// Valid: Mixed app and sys resources
@Component
struct MixedResources {
  build() {
    Column() {
      Text("custom")
      Text("system_default")
    }
  }
}

@Entry
@Component
struct InvalidResourceTypeEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
