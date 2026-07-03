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
 * Invalid expressions inside build method that violate UI component syntax.
Tests error codes 10905209 (Only UI syntax) and 10905204 (does not meet syntax).
Includes valid build patterns for comparison.
 */

// --- Error Cases ---

// Error 10905209: throw statement in build is not UI syntax
@Component
struct BuildWithThrow {
  build() {
    Column() {
      throw new Error("test");
    }
  }
}

// Error 10905204: delete expression does not meet UI component syntax
@Component
struct BuildWithDelete {
  @State prop: { x: number } = { x: 1 };
  build() {
    Column() {
      delete this.prop.x
      Text("after delete")
    }
  }
}

// --- Valid Patterns ---

// Valid: Standard build with text and button
@Component
struct ValidBuildSimple {
  @State message: string = "Hello";
  build() {
    Column() {
      Text(this.message)
      Button("Click").onClick(() => this.message = "Clicked")
    }
  }
}

// Valid: Build with conditional rendering
@Component
struct ValidBuildConditional {
  @State showText: boolean = true;
  build() {
    Column() {
      if (this.showText) {
        Text("Visible")
      } else {
        Text("Hidden")
      }
    }
  }
}

// Valid: Build with ForEach iteration
@Component
struct ValidBuildForEach {
  @State items: string[] = ["A", "B", "C"];
  build() {
    Column() {
      ForEach(this.items, (item: string) => {
        Text(item)
      }, (item: string) => item)
    }
  }
}

// Valid: Build with nested components
@Component
struct ValidBuildNested {
  @State count: number = 0;
  build() {
    Column() {
      Row() {
        Text("Count:")
        Text(this.count.toString())
      }
      Button("Increment").onClick(() => this.count++)
    }
  }
}

@Entry
@Component
struct InvalidExpressionsEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
