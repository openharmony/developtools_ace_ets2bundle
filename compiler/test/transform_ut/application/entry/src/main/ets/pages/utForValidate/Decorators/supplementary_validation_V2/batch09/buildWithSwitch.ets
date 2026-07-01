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
 * Switch statement inside build method.
Tests error 10905209: switch statements are not UI component syntax.
Only if/else, ForEach, and component calls are allowed in build.
 */

// --- Error Cases ---

// Error 10905209: switch statement is not valid UI syntax in build
@Component
struct BuildWithSwitchStmt {
  @State mode: number = 1;
  build() {
    Column() {
      switch (this.mode) {
        case 1:
          Text("one");
          break;
      }
    }
  }
}

// --- Valid Patterns ---

// Valid: Using if/else instead of switch
@Component
struct ValidIfElseChain {
  @State mode: number = 1;
  build() {
    Column() {
      if (this.mode === 1) {
        Text("Mode One")
      } else if (this.mode === 2) {
        Text("Mode Two")
      } else {
        Text("Unknown Mode")
      }
    }
  }
}

// Valid: Build with multiple conditionals
@Component
struct ValidMultiConditional {
  @State status: string = "loading";
  build() {
    Column() {
      if (this.status === "loading") {
        Text("Loading...")
      } else if (this.status === "success") {
        Text("Success!")
      } else if (this.status === "error") {
        Text("Error occurred")
      } else {
        Text("Idle")
      }
    }
  }
}

// Valid: Conditional with multiple children
@Component
struct ValidConditionalMultiChild {
  @State showDetails: boolean = false;
  @State count: number = 42;
  build() {
    Column() {
      Text("Header")
      if (this.showDetails) {
        Text("Detail 1")
        Text("Detail 2")
        Text("Count: " + this.count.toString())
      }
    }
  }
}

// Valid: Nested if/else in build
@Component
struct ValidNestedIfElse {
  @State isAdmin: boolean = true;
  @State isVerified: boolean = false;
  build() {
    Column() {
      if (this.isAdmin) {
        if (this.isVerified) {
          Text("Admin Dashboard")
        } else {
          Text("Verification Required")
        }
      } else {
        Text("User View")
      }
    }
  }
}

@Entry
@Component
struct BuildWithSwitchEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
