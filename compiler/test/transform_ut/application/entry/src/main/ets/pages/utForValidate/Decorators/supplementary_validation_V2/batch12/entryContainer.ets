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
 * @Entry with non-container root component.
Tests error 10905231 + 10905402: Multiple @Entry triggers.
Also tests build root element best practices.
 */

// --- Error Cases ---

// Error 10905231 + 10905402: Extra @Entry decorator
@Entry
@Component
struct EntryWithTextRoot {
  build() {
    Text("non-container root")
  }
}

// --- Valid Patterns ---

// Valid: Build with Column container root
@Component
struct ValidColumnRoot {
  build() {
    Column() {
      Text("Content in column")
    }
  }
}

// Valid: Build with Row container root
@Component
struct ValidRowRoot {
  build() {
    Row() {
      Text("Left")
      Text("Right")
    }
  }
}

// Valid: Build with Stack container
@Component
struct ValidStackRoot {
  build() {
    Stack() {
      Text("Background")
      Text("Foreground")
    }
  }
}

// Valid: Build with interactive content
@Component
struct ValidInteractiveContent {
  @State counter: number = 0;
  build() {
    Column() {
      Text("Counter: " + this.counter.toString())
      Row() {
        Button("Decrement").onClick(() => this.counter--)
        Text(" | ")
        Button("Increment").onClick(() => this.counter++)
      }
    }
  }
}

// Valid: Build with styled content
@Component
struct ValidStyledContent {
  build() {
    Column() {
      Text("Welcome").fontSize(28).fontWeight(FontWeight.Bold)
      Text("to ArkTS development").fontSize(16)
      Divider().margin({ top: 10, bottom: 10 })
      Text("Build amazing UIs").fontSize(14)
    }
  }
}

// Valid: Build with list content
@Component
struct ValidListContent {
  @State tasks: string[] = ["Task 1", "Task 2", "Task 3"];
  build() {
    Column() {
      Text("Task List").fontSize(20)
      ForEach(this.tasks, (task: string) => {
        Text("• " + task)
      }, (task: string) => task)
    }
  }
}

@Entry
@Component
struct EntryContainerEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
