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
 * @Concurrent on a method instead of function. Tests error 10905123.
 */

// --- Error Cases ---

// Error 10905123: @Concurrent on a method inside struct
@Component
struct ConcurrentMethod {
  @Concurrent
  doWork() { console.log("work"); }
  build() { Column() { Text("concurrent") } }
}

// --- Valid Patterns ---

// Valid: @Concurrent on a function declaration
@Concurrent
function validConcurrentFunc(data: string): string {
  return "processed: " + data;
}

// Valid: Plain function without @Concurrent
function processData(input: number): number {
  return input * 2;
}

// Valid: Another plain function
function calculateSum(a: number, b: number): number {
  return a + b;
}

// Valid: Using functions in component
@Component
struct UsesFunctions {
  @State result: number = 0;
  build() {
    Column() {
      Text("Result: " + this.result.toString())
      Button("Calculate").onClick(() => {
        this.result = calculateSum(10, 20)
      })
    }
  }
}

// Valid: Component with utility functions
function formatText(prefix: string, value: number): string {
  return prefix + ": " + value.toString()
}

@Component
struct FormattedDisplay {
  @State count: number = 5;
  build() {
    Column() {
      Text(formatText("Items", this.count))
      Text(formatText("Total", this.count * 10))
      Button("Add").onClick(() => this.count++)
    }
  }
}

// Valid: Interactive component using external functions
function generateLabel(index: number, total: number): string {
  return "Item " + (index + 1).toString() + " of " + total.toString()
}

@Component
struct LabelGenerator {
  @State currentIndex: number = 0;
  @State totalCount: number = 10;
  build() {
    Column() {
      Text(generateLabel(this.currentIndex, this.totalCount))
      Button("Next").onClick(() => {
        if (this.currentIndex < this.totalCount - 1) {
          this.currentIndex++
        }
      })
    }
  }
}

@Entry
@Component
struct ConcurrentOnMethodEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
