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
 * Custom component child passing patterns.
Tests valid custom component nesting and reuse.
Custom components can be composed by passing them as children.
 */

// --- Valid Patterns ---

// Valid: Basic custom component
@Component
struct ChildComponent {
  @Prop message: string = "child";
  build() { Column() { Text(this.message) } }
}

// Valid: Parent using child component
@Component
struct ParentWithChild {
  build() {
    Column() {
      ChildComponent({ message: "from parent" })
      ChildComponent({ message: "another child" })
    }
  }
}

// Valid: Nested custom components
@Component
struct GrandchildComponent {
  @Prop value: number = 0;
  build() { Text("Value: " + this.value.toString()) }
}

@Component
struct MiddleComponent {
  build() {
    Column() {
      Text("Middle Layer")
      GrandchildComponent({ value: 42 })
    }
  }
}

@Component
struct TopComponent {
  build() {
    Column() {
      Text("Top Layer")
      MiddleComponent()
    }
  }
}

// Valid: Custom component with multiple instances
@Component
struct ListItem2 {
  @Prop label: string = "item";
  @Prop index: number = 0;
  build() {
    Row() {
      Text(this.index.toString() + ".")
      Text(this.label)
    }
  }
}

@Component
struct ListContainer {
  build() {
    Column() {
      ListItem2({ label: "First", index: 1 })
      ListItem2({ label: "Second", index: 2 })
      ListItem2({ label: "Third", index: 3 })
    }
  }
}

// Valid: Component with state-driven rendering
@Component
struct StatefulChild {
  @Prop isVisible: boolean = true;
  @Prop content: string = "default";
  build() {
    Column() {
      if (this.isVisible) {
        Text(this.content)
      } else {
        Text("Hidden")
      }
    }
  }
}

@Component
struct StatefulParent {
  @State showAll: boolean = true;
  build() {
    Column() {
      StatefulChild({ isVisible: this.showAll, content: "First child" })
      StatefulChild({ isVisible: true, content: "Always visible" })
      Button("Toggle").onClick(() => {
        this.showAll = !this.showAll
      })
    }
  }
}

@Entry
@Component
struct CustomChildPassingEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
