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
 * Mixed state management decorator types in separate V1 and V2 components.
Tests valid V1 and V2 state decorators used independently.
Each struct should only use decorators matching its component version.
 */

// --- Valid Patterns ---

// Valid: V1 component with V1 state decorators
@Component
struct MixedV1 {
  @State count: number = 0;
  @Prop name: string = "test";
  build() { Column() { Text(this.name) } }
}

// Valid: V2 component with V2 state decorators
@ComponentV2
struct MixedV2 {
  @Local value: number = 0;
  @Param msg: string = "v2";
  build() { Column() { Text(this.msg) } }
}

// Valid: V1 component with full V1 state
@Component
struct FullV1State {
  @State counter: number = 0;
  @State message: string = "hello";
  @State items: string[] = ["a", "b"];
  @Prop title: string = "Default Title";
  build() {
    Column() {
      Text(this.title)
      Text(this.message)
      Text("Count: " + this.counter.toString())
      Button("Add").onClick(() => this.counter++)
    }
  }
}

// Valid: V2 component with full V2 state
@ComponentV2
struct FullV2State {
  @Local counter: number = 100;
  @Local message: string = "v2 state";
  @Param title: string = "V2 Title";
  @Param visible: boolean = true;
  build() {
    Column() {
      Text(this.title)
      if (this.visible) {
        Text(this.message)
        Text("Counter: " + this.counter.toString())
      }
    }
  }
}

// Valid: V1 component with @Provide
@Component
struct V1Provider {
  @State theme: string = "dark";
  @Provide("theme") themeColor: string = "dark";
  build() { Column() { Text("Theme: " + this.themeColor) } }
}

// Valid: V2 component with @Provider
@ComponentV2
struct V2Provider {
  @Local mode: string = "standard";
  @Provider("mode") modeValue: string = "standard";
  build() { Column() { Text("Mode: " + this.modeValue) } }
}

// Valid: Independent V1 and V2 components in same file
@Component
struct V1Summary {
  @State total: number = 0;
  build() {
    Column() {
      Text("V1 Total: " + this.total.toString())
      Button("Add V1").onClick(() => this.total++)
    }
  }
}

@ComponentV2
struct V2Summary {
  @Local total: number = 0;
  build() {
    Column() {
      Text("V2 Total: " + this.total.toString())
      Button("Add V2").onClick(() => this.total++)
    }
  }
}

@Entry
@Component
struct MixedStateTypesEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
