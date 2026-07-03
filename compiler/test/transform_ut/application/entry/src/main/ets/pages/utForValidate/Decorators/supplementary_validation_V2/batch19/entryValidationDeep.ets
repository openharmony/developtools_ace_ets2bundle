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
 * @Entry decorator validation rules.
 */

// --- Error Cases ---

// Error 10905231 + 10905402: Multiple @Entry decorators
@Entry
@Component
struct FirstEntry {
  build() { Column() { Text("first") } }
}

@Entry
@Component
struct SecondEntry {
  build() { Column() { Text("second") } }
}

// --- Valid Patterns ---

// Valid: Single @Entry component (the one at bottom of file)
// Note: The above two @Entry structs will trigger errors,
// while the bottom @Entry is the valid one.

// Valid: @Component without @Entry (child component)
@Component
struct ChildComponent {
  @Prop title: string;
  build() {
    Column() {
      Text(this.title)
    }
  }
}

// Valid: @Entry with @Component
// Already have Entry at bottom

// Valid: Non-entry components used inside entry
@Component
struct HeaderComponent {
  build() {
    Row() {
      Text("Header Logo")
      Text("Header Menu")
    }
  }
}

@Component
struct ContentComponent {
  @State data: string = "Main content";
  build() {
    Column() {
      Text(this.data)
    }
  }
}

@Component
struct FooterComponent {
  build() {
    Column() {
      Text("Footer")
    }
  }
}

// Valid: Simple entry with child components
// (the Entry struct at bottom references these)

@Entry
@Component
struct EntryValidationDeepEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
