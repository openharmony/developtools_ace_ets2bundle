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
 * Nested custom component validation patterns.
Tests valid multi-level component nesting with proper prop passing.
Each level passes data correctly to the next.
 */

// --- Valid Patterns ---

// Valid: Level 3 leaf component
@Component
struct Level3 {
  @Prop value: number = 0;
  build() { Text(this.value.toString()) }
}

// Valid: Level 2 wrapping Level 3
@Component
struct Level2 {
  build() {
    Column() {
      Text("Level 2")
      Level3({ value: 42 })
    }
  }
}

// Valid: Level 1 wrapping Level 2
@Component
struct Level1 {
  build() {
    Column() {
      Text("Level 1")
      Level2()
    }
  }
}

// Valid: Component with parametrized children
@Component
struct DataLeaf {
  @Prop label: string = "";
  @Prop value: number = 0;
  build() {
    Row() {
      Text(this.label + ": ")
      Text(this.value.toString())
    }
  }
}

@Component
struct DataGroup {
  @State groupName: string = "Group";
  @State items: number = 3;
  build() {
    Column() {
      Text(this.groupName).fontWeight(FontWeight.Bold)
      DataLeaf({ label: "Count", value: this.items })
      DataLeaf({ label: "Double", value: this.items * 2 })
      DataLeaf({ label: "Square", value: this.items * this.items })
    }
  }
}

// Valid: Root with multiple groups
@Component
struct DataRoot {
  build() {
    Column() {
      Text("Data Overview").fontSize(20)
      DataGroup()
    }
  }
}

// Valid: Interactive nested components
@Component
struct ButtonLeaf {
  @Prop label: string = "Button";
  @State clicks: number = 0;
  build() {
    Column() {
      Button(this.label).onClick(() => this.clicks++)
      Text("Clicks: " + this.clicks.toString())
    }
  }
}

@Component
struct ButtonGroup {
  build() {
    Row() {
      ButtonLeaf({ label: "A" })
      ButtonLeaf({ label: "B" })
      ButtonLeaf({ label: "C" })
    }
  }
}

// Valid: Full page with nested structure
@Component
struct FullNestedPage {
  @State pageTitle: string = "Nested Demo";
  build() {
    Column() {
      Text(this.pageTitle).fontSize(24)
      Level1()
      DataRoot()
      ButtonGroup()
    }
  }
}

@Entry
@Component
struct NestedCustomCompEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
