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
 * Void operator inside build method.
Tests error 10905204: void(expression) does not meet UI component syntax.
The void operator evaluates and returns undefined, which is not a component.
 */

// --- Error Cases ---

// Error 10905204: void operator does not meet UI component syntax
@Component
struct BuildWithVoidOp {
  @State count: number = 0;
  build() {
    Column() {
      void(this.count)
      Text("after void")
    }
  }
}

// --- Valid Patterns ---

// Valid: Using state value directly in Text
@Component
struct ValidStateInText {
  @State count: number = 0;
  build() {
    Column() {
      Text(this.count.toString())
      Button("Add").onClick(() => this.count++)
    }
  }
}

// Valid: String interpolation in build
@Component
struct ValidStringInterpolation {
  @State name: string = "World";
  build() {
    Column() {
      Text("Hello, " + this.name + "!")
      Text("Length: " + this.name.length.toString())
    }
  }
}

// Valid: Arithmetic in build through Text
@Component
struct ValidArithmeticDisplay {
  @State a: number = 10;
  @State b: number = 20;
  build() {
    Column() {
      Text("A = " + this.a.toString())
      Text("B = " + this.b.toString())
      Text("Sum = " + (this.a + this.b).toString())
    }
  }
}

// Valid: Boolean display in build
@Component
struct ValidBooleanDisplay {
  @State flag: boolean = true;
  build() {
    Column() {
      Text("Flag is: " + this.flag.toString())
      Button("Flip").onClick(() => this.flag = !this.flag)
    }
  }
}

// Valid: Conditional rendering based on state
@Component
struct ValidConditionalState {
  @State value: number = 5;
  build() {
    Column() {
      Text("Value: " + this.value.toString())
      if (this.value > 3) {
        Text("Value is greater than 3")
      } else {
        Text("Value is 3 or less")
      }
    }
  }
}

@Entry
@Component
struct BuildWithVoidEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
