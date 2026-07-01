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
 * V1 struct incorrectly using V2 state decorators.
Tests error 10905338: V2 decorators (@Local, @Computed) can only be used
in structs decorated with @ComponentV2. Includes valid V1 examples.
 */

// --- Error Cases ---

// Error 10905338: @Local in @Component
@Component
struct V1WithLocal {
  @Local count: number = 0;
  build() { Column() { Text(this.count.toString()) } }
}

// Error 10905338: @Computed in @Component
@Component
struct V1WithComputed {
  @Local base: number = 5;
  @Computed get squared(): number { return this.base * this.base; }
  build() { Column() { Text("computed") } }
}

// --- Valid Patterns ---

// Valid: V1 struct using @State correctly
@Component
struct ValidV1State {
  @State count: number = 0;
  @State base: number = 5;
  get squared(): number { return this.base * this.base; }
  build() {
    Column() {
      Text("Count: " + this.count.toString())
      Text("Squared: " + this.squared.toString())
    }
  }
}

// Valid: V1 struct with multiple state decorators
@Component
struct FullV1Component {
  @State counter: number = 0;
  @Prop label: string = "Label";
  @Provide("data") sharedData: string = "shared";
  build() {
    Column() {
      Text(this.label)
      Text(this.counter.toString())
      Button("Add").onClick(() => this.counter++)
    }
  }
}

// Valid: V1 with @Watch
@Component
struct V1WithWatch {
  @State value: number = 0;
  @Watch("onValueChange") @State watched: number = 0;
  onValueChange() { console.log("value changed"); }
  build() {
    Column() {
      Text(this.value.toString())
      Button("Change").onClick(() => {
        this.value++
        this.watched = this.value
      })
    }
  }
}

// Valid: Another V1 example with ForEach
@Component
struct V1WithList {
  @State items: string[] = ["One", "Two", "Three"];
  build() {
    Column() {
      ForEach(this.items, (item: string) => {
        Text(item)
      }, (item: string) => item)
    }
  }
}

// Valid: V1 component with @ObjectLink
@Observed
class DataItem {
  name: string = "item";
  value: number = 0;
}

@Component
struct V1WithObjectLink {
  @ObjectLink item: DataItem;
  build() {
    Column() {
      Text(this.item.name)
      Text(this.item.value.toString())
    }
  }
}

// Valid: V1 component with conditional rendering
@Component
struct V1Conditional {
  @State isVisible: boolean = true;
  @State counter: number = 0;
  build() {
    Column() {
      Button("Toggle").onClick(() => { this.isVisible = !this.isVisible })
      if (this.isVisible) {
        Text("Visible - Count: " + this.counter.toString())
        Button("Add").onClick(() => this.counter++)
      }
    }
  }
}

@Entry
@Component
struct V1WithV2DecoratorsEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
