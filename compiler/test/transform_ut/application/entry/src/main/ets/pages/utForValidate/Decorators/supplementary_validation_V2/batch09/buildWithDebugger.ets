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
 * Debugger statement inside build method.
Tests error 10905209: debugger is not a UI component statement.
Only component declarations and control flow are allowed.
 */

// --- Error Cases ---

// Error 10905209: debugger statement is not UI syntax
@Component
struct BuildWithDebugger {
  build() {
    Column() {
      debugger;
      Text("after debugger")
    }
  }
}

// --- Valid Patterns ---

// Valid: Simple build without debugger
@Component
struct ValidSimpleBuild {
  @State message: string = "Hello World";
  build() {
    Column() {
      Text(this.message)
    }
  }
}

// Valid: Build with button interaction
@Component
struct ValidInteractiveBuild {
  @State clickCount: number = 0;
  build() {
    Column() {
      Text("Clicks: " + this.clickCount.toString())
      Button("Click Me").onClick(() => {
        this.clickCount++
      })
    }
  }
}

// Valid: Build with image component
@Component
struct ValidWithImage {
  build() {
    Column() {
      Text("Image Example")
      Image($r("app.media.icon"))
        .width(100)
        .height(100)
    }
  }
}

// Valid: Build with list-like layout using ForEach
@Component
struct ValidListLayout {
  @State numbers: number[] = [1, 2, 3, 4, 5];
  build() {
    Column() {
      Text("Number List")
      ForEach(this.numbers, (num: number) => {
        Text("Item " + num.toString())
      }, (num: number) => num.toString())
    }
  }
}

// Valid: Build with toggle interaction
@Component
struct ValidToggleBuild {
  @State isVisible: boolean = true;
  build() {
    Column() {
      Button(this.isVisible ? "Hide" : "Show").onClick(() => {
        this.isVisible = !this.isVisible
      })
      if (this.isVisible) {
        Text("I am visible!")
      }
    }
  }
}

@Entry
@Component
struct BuildWithDebuggerEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
