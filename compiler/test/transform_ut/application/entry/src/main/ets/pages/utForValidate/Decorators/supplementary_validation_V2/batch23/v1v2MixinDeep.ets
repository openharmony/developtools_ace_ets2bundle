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
 * V1/V2 decorator mixing validation.
 */

// --- Error Cases ---

// Error 10905338: V2 decorator in V1 component
@Component
struct V1WithV2 {
  @Local count: number = 0;
  build() { Column() { Text(this.count.toString()) } }
}

// Error 10905339: V1 decorator in V2 component
@ComponentV2
struct V2WithV1 {
  @State message: string = "hello";
  build() { Column() { Text(this.message) } }
}

// --- Valid Patterns ---

@Component
struct PureV1 {
  @State count: number = 0;
  @Prop label: string;
  build() {
    Column() {
      Text(this.label)
      Text(this.count.toString())
      Button("Add").onClick(() => this.count++)
    }
  }
}

@ComponentV2
struct PureV2 {
  @Local value: number = 0;
  @Param name: string = "V2";
  @Computed get doubled(): number { return this.value * 2; }
  build() {
    Column() {
      Text(this.name)
      Text("Value: " + this.value.toString())
      Text("Doubled: " + this.doubled.toString())
      Button("Add").onClick(() => this.value++)
    }
  }
}

@ComponentV2
struct V2Child {
  @Param label: string = "";
  build() { Text(this.label) }
}

@ComponentV2
struct V2Parent {
  build() {
    Column() {
      V2Child({ label: "First" })
      V2Child({ label: "Second" })
    }
  }
}

@Component
struct CoexistPage {
  build() {
    Column() {
      PureV1({ label: "V1 Component" })
      PureV2({ name: "V2 Component" })
    }
  }
}

@Entry
@Component
struct V1v2MixinDeepEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
