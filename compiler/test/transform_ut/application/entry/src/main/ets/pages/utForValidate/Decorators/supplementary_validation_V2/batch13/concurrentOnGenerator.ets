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
 * @Concurrent on a generator function. Tests error 10905122.
 */

// --- Error Cases ---

// Error 10905122: @Concurrent on a generator function
@Concurrent
function* genFunc() {
  yield 1;
  yield 2;
}

// --- Valid Patterns ---

// Valid: @Concurrent on a regular function
@Concurrent
function validConcurrentTask(n: number): number {
  return n * n;
}

// Valid: Plain generator function without @Concurrent
function* numberGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

// Valid: Utility function for calculation
function computeFactorial(n: number): number {
  if (n <= 1) return 1;
  let result: number = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// Valid: Using computed values in component
@Component
struct CalculatorDisplay {
  @State inputValue: number = 5;
  @State factorialResult: number = 120;
  build() {
    Column() {
      Text("Input: " + this.inputValue.toString())
      Text("Factorial: " + this.factorialResult.toString())
      Button("Compute").onClick(() => {
        this.factorialResult = computeFactorial(this.inputValue)
      })
    }
  }
}

// Valid: Generator usage outside of @Concurrent context
function createRange(start: number, end: number): number[] {
  let result: number[] = [];
  for (let i = start; i <= end; i++) {
    result.push(i)
  }
  return result;
}

@Component
struct RangeDisplay {
  @State values: number[] = createRange(1, 5);
  build() {
    Column() {
      Text("Range Values")
      ForEach(this.values, (val: number) => {
        Text(val.toString())
      }, (val: number) => val.toString())
    }
  }
}

// Valid: Simple interactive component
@Component
struct SimpleInteractive {
  @State data: string = "initial";
  build() {
    Column() {
      Text(this.data)
      Button("Update").onClick(() => {
        this.data = "Updated"
      })
    }
  }
}

@Entry
@Component
struct ConcurrentOnGeneratorEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
