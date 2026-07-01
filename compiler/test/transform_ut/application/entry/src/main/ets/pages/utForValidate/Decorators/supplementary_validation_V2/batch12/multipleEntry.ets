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
 * Multiple @Entry decorators in a single file.
Tests error 10905231 + 10905402: A page can have only one @Entry.
Each page file should contain exactly one @Entry-decorated struct.
 */

// --- Error Cases ---

// Error 10905231 + 10905402: Two @Entry structs
@Entry
@Component
struct EntryOne {
  build() { Column() { Text("entry one") } }
}
@Entry
@Component
struct EntryTwo {
  build() { Column() { Text("entry two") } }
}

// --- Valid Patterns ---

// Valid: Single component without @Entry
@Component
struct HelperComponent {
  build() { Column() { Text("helper") } }
}

// Valid: Another non-entry component
@Component
struct ToolbarComponent {
  @Prop title: string = "Toolbar";
  build() {
    Row() {
      Text(this.title)
      Button("Menu")
    }
  }
}

// Valid: Component with state and interaction
@Component
struct InteractiveComponent {
  @State isActive: boolean = false;
  build() {
    Column() {
      Text("Status: " + (this.isActive ? "ON" : "OFF"))
      Button("Toggle").onClick(() => {
        this.isActive = !this.isActive
      })
    }
  }
}

// Valid: List component
@Component
struct ListComponent {
  @State items: number[] = [1, 2, 3, 4, 5];
  build() {
    Column() {
      ForEach(this.items, (item: number) => {
        Text("Item " + item.toString())
      }, (item: number) => item.toString())
    }
  }
}

// Valid: Styled component
@Component
struct StyledBox {
  build() {
    Column() {
      Text("Title").fontSize(24).fontWeight(FontWeight.Bold)
      Divider()
      Text("Content goes here").fontSize(14)
    }
  }
}

// Valid: Component using other components
@Component
struct CompositeComponent {
  build() {
    Column() {
      HelperComponent()
      InteractiveComponent()
    }
  }
}

@Entry
@Component
struct MultipleEntryEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
