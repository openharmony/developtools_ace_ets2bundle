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
 * V1 component used inside V2 parent component.
Tests valid V1-in-V2 nesting. V2 parent can use V1 child components
through normal component composition.
 */

// --- Valid Patterns ---

// Valid: V1 child component
@Component
struct InnerV1 {
  @Prop msg: string = "hello";
  build() { Column() { Text(this.msg) } }
}

// Valid: V2 parent using V1 child
@ComponentV2
struct OuterV2 {
  @Local msg: string = "from v2";
  build() { Column() { InnerV1({ msg: this.msg }) } }
}

// Valid: V2 parent with multiple V1 children
@Component
struct ProgressBar {
  @Prop progress: number = 0;
  build() {
    Column() {
      Text("Progress: " + this.progress.toString() + "%")
    }
  }
}

@ComponentV2
struct V2WithV1Children {
  @Local value: number = 50;
  @Local label: string = "Loading";
  build() {
    Column() {
      InnerV1({ msg: this.label })
      ProgressBar({ progress: this.value })
    }
  }
}

// Valid: V2 parent with mixed children
@Component
struct SimpleV1Component {
  @Prop title: string = "";
  @Prop count: number = 0;
  build() {
    Column() {
      Text(this.title).fontWeight(FontWeight.Bold)
      Text("Count: " + this.count.toString())
    }
  }
}

@ComponentV2
struct MixedV2Parent {
  @Local sectionTitle: string = "Overview";
  @Local itemCount: number = 10;
  @Local lastUpdate: string = "just now";
  build() {
    Column() {
      SimpleV1Component({ title: this.sectionTitle, count: this.itemCount })
      Text("Updated: " + this.lastUpdate)
    }
  }
}

// Valid: Deep nesting V2 > V1 > V2
@ComponentV2
struct LeafV2 {
  @Param data: string = "leaf";
  build() { Text(this.data) }
}

@Component
struct MiddleV1 {
  @Prop info: string = "middle";
  build() {
    Column() {
      Text(this.info)
      LeafV2({ data: this.info + " detail" })
    }
  }
}

@ComponentV2
struct RootV2 {
  @Local message: string = "root data";
  build() {
    Column() {
      Text("Root V2")
      MiddleV1({ info: this.message })
    }
  }
}

@Entry
@Component
struct V1ComponentInV2Entry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
