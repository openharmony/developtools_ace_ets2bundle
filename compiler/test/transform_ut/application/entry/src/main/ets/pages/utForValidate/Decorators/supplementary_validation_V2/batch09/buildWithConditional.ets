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
 * Ternary conditional expression inside build method.
Tests error 10905204: ternary expressions returning components do not meet syntax.
Use if/else blocks instead of ternary for conditional rendering.
 */

// --- Error Cases ---

// Error 10905204: ternary expression returning components is not valid UI syntax
@Component
struct BuildWithTernary {
  @State flag: boolean = true;
  build() {
    Column() {
      this.flag ? Text("true") : Text("false")
    }
  }
}

// --- Valid Patterns ---

// Valid: Using if/else instead of ternary
@Component
struct ValidIfElseRender {
  @State flag: boolean = true;
  build() {
    Column() {
      if (this.flag) {
        Text("true")
      } else {
        Text("false")
      }
    }
  }
}

// Valid: Ternary inside string interpolation (allowed)
@Component
struct ValidTernaryInString {
  @State count: number = 5;
  build() {
    Column() {
      Text("Count is " + (this.count > 3 ? "high" : "low"))
    }
  }
}

// Valid: Conditional with multiple components
@Component
struct ValidConditionalMulti {
  @State showFull: boolean = false;
  build() {
    Column() {
      if (this.showFull) {
        Text("Full View")
        Text("Additional details here")
      } else {
        Text("Compact View")
      }
    }
  }
}

// Valid: Nested conditionals
@Component
struct ValidNestedConditional {
  @State status: string = "active";
  @State isAdmin: boolean = true;
  build() {
    Column() {
      if (this.status === "active") {
        if (this.isAdmin) {
          Text("Admin Active Session")
        } else {
          Text("User Active Session")
        }
      } else {
        Text("Inactive")
      }
    }
  }
}

// Valid: Conditional with state changes
@Component
struct ValidConditionalInteractive {
  @State isExpanded: boolean = false;
  build() {
    Column() {
      Button(this.isExpanded ? "Collapse" : "Expand").onClick(() => {
        this.isExpanded = !this.isExpanded
      })
      if (this.isExpanded) {
        Text("Expanded content is now visible")
        Text("You can see all the details here")
      }
    }
  }
}

@Entry
@Component
struct BuildWithConditionalEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
