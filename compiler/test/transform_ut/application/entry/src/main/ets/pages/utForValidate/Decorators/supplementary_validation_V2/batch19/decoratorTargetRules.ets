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
 * Decorator target validation - wrong decorator placement.
 */

// --- Error Cases ---

// Error 10905112: Decorator cannot decorate method
@Component
struct DecoratorOnMethod {
  @State value: number = 0;
  @Builder
  myBuilder() { Text("builder method") }
  build() { Column() { Text(this.value.toString()) } }
}

// Error 10905115: @LocalBuilder can only decorate method
@ComponentV2
struct LocalBuilderOnProp {
  @LocalBuilder
  builderProp: () => void = () => {};
  build() { Column() { Text("test") } }
}

// --- Valid Patterns ---

// Valid: @Builder as global function
@Builder
function globalBuilderFunction() {
  Text("Global Builder")
}

// Valid: @LocalBuilder as method
@ComponentV2
struct ValidLocalBuilder {
  @Local count: number = 0;
  @LocalBuilder
  counterDisplay() {
    Column() {
      Text("Count: " + this.count.toString())
      Button("Add").onClick(() => this.count++)
    }
  }
  build() { Column() { this.counterDisplay() } }
}

// Valid: @State on property
@Component
struct ValidState {
  @State name: string = "Valid";
  @State count: number = 0;
  build() {
    Column() {
      Text(this.name)
      Text(this.count.toString())
      Button("Add").onClick(() => this.count++)
    }
  }
}

// Valid: @Computed on getter
@ComponentV2
struct ValidComputed {
  @Local a: number = 5;
  @Local b: number = 10;
  @Computed get sum(): number { return this.a + this.b; }
  build() {
    Column() {
      Text("Sum: " + this.sum.toString())
      Button("Add A").onClick(() => this.a++)
    }
  }
}

// Valid: @Monitor on method
@ComponentV2
struct ValidMonitor {
  @Local value: number = 0;
  @Monitor("value")
  onValueChange() { console.log("changed"); }
  build() {
    Column() {
      Text(this.value.toString())
      Button("Inc").onClick(() => this.value++)
    }
  }
}

// Valid: @Extend as global function
@Extend(Text)
function extendFn(size: number) {
  .fontSize(size)
}

// Valid: @Styles as global function
@Styles
function styleFn() {
  .padding(8)
  .backgroundColor(Color.Gray)
}

@Entry
@Component
struct DecoratorTargetRulesEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
