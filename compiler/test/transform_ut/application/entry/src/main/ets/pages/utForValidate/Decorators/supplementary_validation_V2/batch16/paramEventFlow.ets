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
 * V2 @Param and @Event complete data flow patterns.
 */

// --- Valid Patterns ---

// Valid: Parent-to-child data flow with @Param
@ComponentV2
struct ChildDisplay {
  @Param label: string = "Default";
  @Param value: number = 0;
  build() {
    Column() {
      Text(this.label)
      Text(this.value.toString())
    }
  }
}

// Valid: Parent component passing data
@ComponentV2
struct DataParent {
  @Local data: string = "Hello";
  @Local count: number = 42;
  build() {
    Column() {
      Text("Parent Data: " + this.data)
      ChildDisplay({ label: this.data, value: this.count })
      Button("Update").onClick(() => {
        this.data = "Updated"
        this.count++
      })
    }
  }
}

// Valid: Child-to-parent event flow
@ComponentV2
struct EventChild {
  @Event onClick: (id: number) => void = (id: number) => {};
  build() {
    Column() {
      Button("Item 1").onClick(() => this.onClick(1))
      Button("Item 2").onClick(() => this.onClick(2))
      Button("Item 3").onClick(() => this.onClick(3))
    }
  }
}

@ComponentV2
struct EventParent {
  @Local selectedId: number = 0;
  build() {
    Column() {
      Text("Selected: " + this.selectedId.toString())
      EventChild({ onClick: (id: number): void => { this.selectedId = id } })
    }
  }
}

// Valid: Bidirectional data flow
@ComponentV2
struct BidirectionalChild {
  @Param text: string = "";
  @Event onTextChange: (t: string) => void = (t: string) => {};
  build() {
    Column() {
      Text("Child sees: " + this.text)
      Button("Append A").onClick(() => this.onTextChange(this.text + "A"))
      Button("Clear").onClick(() => this.onTextChange(""))
    }
  }
}

@ComponentV2
struct BidirectionalParent {
  @Local sharedText: string = "Init";
  build() {
    Column() {
      Text("Parent: " + this.sharedText)
      BidirectionalChild({
        text: this.sharedText,
        onTextChange: (t: string): void => { this.sharedText = t }
      })
    }
  }
}

// Valid: List with event selection
@ComponentV2
struct ListItemComp {
  @Param itemLabel: string = "";
  @Param itemId: number = 0;
  @Event onSelect: (id: number) => void = (id: number) => {};
  build() {
    Column() {
      Text(this.itemLabel)
      Button("Select").onClick(() => this.onSelect(this.itemId))
    }
  }
}

@Entry
@Component
struct ParamEventFlowEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
