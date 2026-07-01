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
 * Deep component nesting patterns.
Tests valid multi-level custom component composition.
Demonstrates proper component hierarchy with data passing.
 */

// --- Valid Patterns ---

// Valid: Leaf component
@Component
struct LeafComponent {
  @Prop value: string = "leaf";
  build() { Text(this.value) }
}

// Valid: Middle component using leaf
@Component
struct MiddleComponent {
  build() {
    Column() {
      Text("Middle Layer")
      LeafComponent({ value: "from middle" })
    }
  }
}

// Valid: Root component using middle
@Component
struct RootComponent {
  build() {
    Column() {
      Text("Root Layer")
      MiddleComponent()
      LeafComponent({ value: "root direct" })
    }
  }
}

// Valid: Multi-branch tree
@Component
struct LeftBranch {
  @State leftCount: number = 0;
  build() {
    Column() {
      Text("Left: " + this.leftCount.toString())
      Button("L+").onClick(() => this.leftCount++)
    }
  }
}

@Component
struct RightBranch {
  @State rightCount: number = 0;
  build() {
    Column() {
      Text("Right: " + this.rightCount.toString())
      Button("R+").onClick(() => this.rightCount++)
    }
  }
}

@Component
struct TreeRoot {
  build() {
    Column() {
      Text("Tree Root")
      Row() {
        LeftBranch()
        RightBranch()
      }
    }
  }
}

// Valid: Component with list of items
@Component
struct ItemRow {
  @Prop label: string = "";
  @Prop index: number = 0;
  build() {
    Row() {
      Text("#" + this.index.toString())
      Text(this.label)
    }
  }
}

@Component
struct ItemListPage {
  @State items: string[] = ["Alpha", "Beta", "Gamma", "Delta"];
  build() {
    Column() {
      Text("Item List")
      ForEach(this.items, (item: string, index: number) => {
        ItemRow({ label: item, index: index + 1 })
      }, (item: string) => item)
    }
  }
}

// Valid: Interactive nested components
@Component
struct InteractiveLeaf {
  @Prop label: string = "click me";
  @State clicks: number = 0;
  build() {
    Column() {
      Text(this.label)
      Text("Clicks: " + this.clicks.toString())
      Button("Click").onClick(() => this.clicks++)
    }
  }
}

@Component
struct InteractiveRoot {
  build() {
    Column() {
      Text("Interactive Root")
      InteractiveLeaf({ label: "Button A" })
      InteractiveLeaf({ label: "Button B" })
    }
  }
}

@Entry
@Component
struct DeepNestingEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
