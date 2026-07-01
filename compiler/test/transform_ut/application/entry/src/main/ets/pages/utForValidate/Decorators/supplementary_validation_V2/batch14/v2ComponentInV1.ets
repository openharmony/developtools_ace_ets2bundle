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
 * V2 component used inside V1 parent component.
Tests valid V2-in-V1 nesting. Components of different versions
can coexist in the component tree as long as decorators are not mixed within a single struct.
 */

// --- Valid Patterns ---

// Valid: V2 child component
@ComponentV2
struct InnerV2 {
  @Param value: number = 0;
  build() { Column() { Text(this.value.toString()) } }
}

// Valid: V1 parent using V2 child
@Component
struct OuterV1 {
  @State data: number = 42;
  build() { Column() { InnerV2({ value: this.data }) } }
}

// Valid: V1 parent with multiple V2 children
@ComponentV2
struct BadgeV2 {
  @Param count: number = 0;
  build() { Text(this.count.toString()) }
}

@Component
struct MultiChildV1 {
  @State itemCount: number = 5;
  build() {
    Column() {
      Text("Dashboard")
      InnerV2({ value: this.itemCount })
      BadgeV2({ count: this.itemCount })
    }
  }
}

// Valid: V1 component with V2 and V1 children mixed
@ComponentV2
struct StatusBadge {
  @Param status: string = "active";
  build() {
    Text("Status: " + this.status)
  }
}

@Component
struct MixedParent {
  @State currentStatus: string = "online";
  @State counter: number = 0;
  build() {
    Column() {
      StatusBadge({ status: this.currentStatus })
      Text("Counter: " + this.counter.toString())
      Button("Increment").onClick(() => this.counter++)
    }
  }
}

// Valid: Complex nesting V1 > V2 > V1
@Component
struct LeafV1 {
  @Prop label: string = "leaf";
  build() { Text(this.label) }
}

@ComponentV2
struct MiddleV2 {
  @Param text: string = "middle";
  build() {
    Column() {
      Text(this.text)
      LeafV1({ label: this.text + " child" })
    }
  }
}

@Component
struct RootV1 {
  build() {
    Column() {
      Text("Root")
      MiddleV2({ text: "from root" })
    }
  }
}

@Entry
@Component
struct V2ComponentInV1Entry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
