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
 * V2 struct incorrectly using V1 state decorators.
Tests error 10905339: V1 decorators (@State, @Prop) can only be used
in structs decorated with @Component. Includes valid V2 examples.
 */

// --- Error Cases ---

// Error 10905339: @State in @ComponentV2
@ComponentV2
struct V2WithState {
  @State count: number = 0;
  build() { Column() { Text(this.count.toString()) } }
}

// Error 10905339: @Prop in @ComponentV2
@ComponentV2
struct V2WithProp {
  @Prop message: string = "hello";
  build() { Column() { Text(this.message) } }
}

// --- Valid Patterns ---

// Valid: V2 struct using @Local instead of @State
@ComponentV2
struct ValidV2State {
  @Local count: number = 0;
  @Local message: string = "hello";
  build() {
    Column() {
      Text(this.message)
      Text(this.count.toString())
    }
  }
}

// Valid: V2 struct with @Param instead of @Prop
@ComponentV2
struct ValidV2Param {
  @Param title: string = "default";
  @Param value: number = 100;
  build() {
    Column() {
      Text(this.title)
      Text(this.value.toString())
    }
  }
}

// Valid: V2 with full V2 state management
@ComponentV2
struct FullV2Component {
  @Local counter: number = 0;
  @Param name: string = "Component";
  @Computed get displayName(): string { return "V2:" + this.name; }
  @Monitor("counter")
  onCounterChange() { console.log("counter changed"); }
  build() {
    Column() {
      Text(this.displayName)
      Text("Count: " + this.counter.toString())
      Button("Inc").onClick(() => this.counter++)
    }
  }
}

// Valid: V1 struct with V1 decorators (correct usage)
@Component
struct ValidV1Component {
  @State count: number = 0;
  @Prop label: string = "V1 Component";
  build() {
    Column() {
      Text(this.label)
      Text(this.count.toString())
      Button("Add").onClick(() => this.count++)
    }
  }
}

// Valid: Another V2 example
@ComponentV2
struct AnotherV2 {
  @Local items: string[] = ["a", "b", "c"];
  @Param maxItems: number = 10;
  build() {
    Column() {
      Text("Items: " + this.items.length.toString() + "/" + this.maxItems.toString())
    }
  }
}

// Valid: V2 with @Event
@ComponentV2
struct V2WithEvent {
  @Param value: number = 0;
  @Event onValueChange: (n: number) => void = (n: number) => {};
  build() {
    Column() {
      Text(this.value.toString())
      Button("Change").onClick(() => this.onValueChange(this.value + 1))
    }
  }
}

@Entry
@Component
struct V2WithV1DecoratorsEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
