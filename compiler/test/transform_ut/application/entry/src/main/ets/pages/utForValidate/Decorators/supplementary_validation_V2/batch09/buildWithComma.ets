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
 * Comma operator inside build method.
Tests error 10905204: comma operator does not meet UI component syntax.
The comma operator evaluates multiple expressions but returns only the last.
 */

// --- Error Cases ---

// Error 10905204: comma operator does not meet UI component syntax
@Component
struct BuildWithCommaOp {
  @State count: number = 0;
  build() {
    Column() {
      (this.count, this.count)
      Text("after comma")
    }
  }
}

// --- Valid Patterns ---

// Valid: Each expression as its own Text component
@Component
struct ValidSeparateTexts {
  @State count: number = 0;
  @State label: string = "Count";
  build() {
    Column() {
      Text(this.label)
      Text(this.count.toString())
    }
  }
}

// Valid: Combining values in a single Text
@Component
struct ValidCombinedText {
  @State x: number = 10;
  @State y: number = 20;
  build() {
    Column() {
      Text("X: " + this.x.toString() + ", Y: " + this.y.toString())
    }
  }
}

// Valid: Multiple independent components
@Component
struct ValidMultipleComponents {
  @State title: string = "Dashboard";
  @State userCount: number = 5;
  build() {
    Column() {
      Text(this.title).fontSize(24)
      Divider()
      Text("Active Users: " + this.userCount.toString())
    }
  }
}

// Valid: Build with Row containing multiple texts
@Component
struct ValidRowMultiText {
  @State firstName: string = "John";
  @State lastName: string = "Doe";
  build() {
    Column() {
      Row() {
        Text(this.firstName)
        Text(" ")
        Text(this.lastName)
      }
    }
  }
}

// Valid: Build with progress display
@Component
struct ValidProgressDisplay {
  @State current: number = 3;
  @State total: number = 10;
  build() {
    Column() {
      Text("Progress")
      Text(this.current.toString() + " / " + this.total.toString())
      Text(((this.current / this.total) * 100).toString() + "%")
    }
  }
}

@Entry
@Component
struct BuildWithCommaEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
