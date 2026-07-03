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
 * Spread operator inside build method.
Tests error 10905204: array spread does not meet UI component syntax.
Spread operators create arrays, not UI components.
 */

// --- Error Cases ---

// Error 10905204: spread operator does not meet UI component syntax
@Component
struct BuildWithSpread {
  build() {
    Column() {
      ...[1, 2, 3]
      Text("after spread")
    }
  }
}

// --- Valid Patterns ---

// Valid: Using ForEach instead of spread
@Component
struct ValidForEachNumbers {
  @State numbers: number[] = [1, 2, 3, 4, 5];
  build() {
    Column() {
      ForEach(this.numbers, (num: number) => {
        Text("Number: " + num.toString())
      }, (num: number) => num.toString())
    }
  }
}

// Valid: Iterating over string array
@Component
struct ValidForEachStrings {
  @State names: string[] = ["Alice", "Bob", "Charlie"];
  build() {
    Column() {
      ForEach(this.names, (name: string) => {
        Text(name).fontSize(16)
      }, (name: string) => name)
    }
  }
}

// Valid: Using ForEach with index
@Component
struct ValidForEachIndexed {
  @State items: string[] = ["First", "Second", "Third"];
  build() {
    Column() {
      ForEach(this.items, (item: string, index: number) => {
        Text((index + 1).toString() + ". " + item)
      }, (item: string) => item)
    }
  }
}

// Valid: ForEach with conditional rendering
@Component
struct ValidForEachConditional {
  @State values: number[] = [10, 25, 5, 30, 15];
  build() {
    Column() {
      ForEach(this.values, (val: number) => {
        if (val > 20) {
          Text("High: " + val.toString()).fontColor(Color.Red)
        } else {
          Text("Low: " + val.toString()).fontColor(Color.Green)
        }
      }, (val: number) => val.toString())
    }
  }
}

// Valid: Simple list rendering
@Component
struct ValidSimpleList {
  @State tags: string[] = ["TS", "UI", "ArkTS"];
  build() {
    Column() {
      Text("Tags").fontWeight(FontWeight.Bold)
      ForEach(this.tags, (tag: string) => {
        Text("# " + tag)
      }, (tag: string) => tag)
    }
  }
}

@Entry
@Component
struct BuildWithSpreadEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
